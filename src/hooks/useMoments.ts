import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Moment {
  id: string;
  event_id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  visibility: string;
  created_at: string;
  reported: boolean;
  hidden: boolean;
  user_name?: string;
  user_photo?: string;
}

export function useMoments(eventId: string | undefined) {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!eventId) return;
    const channel = supabase
      .channel(`moments-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "moments",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["moments", eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  return useQuery({
    queryKey: ["moments", eventId],
    enabled: !!eventId,
    refetchInterval: 30000, // Also poll every 30s as backup
    queryFn: async (): Promise<Moment[]> => {
      // Only show moments from last 24h
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await (supabase
        .from("moments" as any)
        .select("*")
        .eq("event_id", eventId!)
        .eq("hidden", false)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(50) as any);

      if (error) throw error;

      // Fetch user profiles for moments
      const userIds = (data || []).map((m: any) => String(m.user_id)).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
      let profileMap: Record<string, { name: string; photo: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, profile_photo")
          .in("user_id", userIds);

        (profiles || []).forEach((p) => {
          profileMap[p.user_id] = { name: p.name || "Anonymous", photo: p.profile_photo };
        });
      }

      return (data || []).map((m: any) => ({
        ...m,
        user_name: profileMap[m.user_id]?.name || "Anonymous",
        user_photo: profileMap[m.user_id]?.photo || null,
      }));
    },
  });
}

export function useMomentCount(eventId: string | undefined) {
  return useQuery({
    queryKey: ["moment-count", eventId],
    enabled: !!eventId,
    refetchInterval: 60000,
    queryFn: async (): Promise<number> => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error } = await (supabase
        .from("moments" as any)
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId!)
        .eq("hidden", false)
        .gte("created_at", tenMinsAgo) as any);

      if (error) return 0;
      return count || 0;
    },
  });
}

export function usePostMoment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      eventId,
      file,
      caption,
      visibility,
    }: {
      eventId: string;
      file: File;
      caption?: string;
      visibility?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Upload media
      const ext = file.name.split(".").pop() || "jpg";
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("moment-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("moment-media")
        .getPublicUrl(path);

      // Insert moment record
      const { error } = await (supabase.from("moments" as any).insert({
        event_id: eventId,
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: mediaType,
        caption: caption || null,
        visibility: visibility || "attendees",
      }) as any);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["moments", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["moment-count", variables.eventId] });
    },
  });
}

export function useReportMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ momentId, eventId }: { momentId: string; eventId: string }) => {
      const { error } = await (supabase
        .from("moments" as any)
        .update({ reported: true } as any)
        .eq("id", momentId) as any);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["moments", eventId] });
    },
  });
}
