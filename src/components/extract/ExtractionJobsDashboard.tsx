import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Clock, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExtractionJob {
  id: string;
  status: string;
  country: string | null;
  city_name: string | null;
  total_sources: number;
  processed_sources: number;
  events_discovered: number;
  events_extracted: number;
  duplicates_skipped: number;
  past_events_skipped: number;
  errors: any;
  use_deep_extract: boolean;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export function ExtractionJobsDashboard() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["extraction-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extraction_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as unknown as ExtractionJob[];
    },
    refetchInterval: 5000,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("extraction-jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "extraction_jobs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["extraction-jobs"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const cancelMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("extraction_jobs")
        .update({ status: "cancelled" as any })
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraction-jobs"] });
      toast.success("Job cancellation requested");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("extraction_jobs")
        .delete()
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraction-jobs"] });
      toast.success("Job removed");
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading jobs...</div>;
  if (!jobs?.length) return <div className="text-sm text-muted-foreground">No extraction jobs yet</div>;

  const statusIcon = (status: string) => {
    switch (status) {
      case "queued": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "running": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "cancelled": return <Ban className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const statusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "running": return "default";
      case "completed": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const progress = job.total_sources > 0
          ? Math.round((job.processed_sources / job.total_sources) * 100)
          : 0;
        const errors = Array.isArray(job.errors) ? job.errors : [];
        const elapsed = job.started_at
          ? Math.round(
              ((job.finished_at ? new Date(job.finished_at).getTime() : Date.now()) -
                new Date(job.started_at).getTime()) / 1000
            )
          : 0;

        return (
          <div key={job.id} className="bg-secondary/30 border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcon(job.status)}
                <span className="font-medium text-sm">
                  {job.country || "All"} {job.city_name ? `→ ${job.city_name}` : ""} extraction
                </span>
                <Badge variant={statusColor(job.status)} className="text-[10px]">
                  {job.status}
                </Badge>
                {job.use_deep_extract && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">DEEP</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {(job.status === "running" || job.status === "queued") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => cancelMutation.mutate(job.id)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                )}
                {(job.status === "completed" || job.status === "failed" || job.status === "cancelled") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteMutation.mutate(job.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {(job.status === "running" || job.status === "completed") && (
              <Progress value={progress} className="h-2" />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Sources</span>
                <div className="font-medium">{job.processed_sources} / {job.total_sources}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Discovered</span>
                <div className="font-medium">{job.events_discovered}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Extracted</span>
                <div className="font-medium text-primary">{job.events_extracted}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Dupes</span>
                <div className="font-medium">{job.duplicates_skipped}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Past Skipped</span>
                <div className="font-medium">{job.past_events_skipped}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Time</span>
                <div className="font-medium">{elapsed}s</div>
              </div>
            </div>

            {errors.length > 0 && (
              <details className="text-xs">
                <summary className="text-destructive cursor-pointer">{errors.length} error(s)</summary>
                <div className="mt-1 space-y-0.5 text-destructive/80 max-h-32 overflow-y-auto">
                  {errors.slice(0, 10).map((err: string, i: number) => (
                    <div key={i} className="break-all">{err}</div>
                  ))}
                </div>
              </details>
            )}

            <div className="text-[10px] text-muted-foreground">
              {new Date(job.created_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
