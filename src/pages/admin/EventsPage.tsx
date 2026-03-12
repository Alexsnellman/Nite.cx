import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { Calendar, MapPin, Globe, Users, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(name), sources(name)")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [events, cities, sources, organizers, contacted] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("cities").select("id", { count: "exact", head: true }),
        supabase.from("sources").select("id", { count: "exact", head: true }),
        supabase.from("organizers").select("id", { count: "exact", head: true }),
        supabase.from("organizers").select("id", { count: "exact", head: true }).neq("contact_status", "not_contacted"),
      ]);
      return {
        events: events.count ?? 0,
        cities: cities.count ?? 0,
        sources: sources.count ?? 0,
        organizers: organizers.count ?? 0,
        contacted: contacted.count ?? 0,
      };
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Nite Event Intelligence Engine overview</p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <StatsCard label="Events" value={stats?.events ?? 0} icon={Calendar} color="primary" />
          <StatsCard label="Cities" value={stats?.cities ?? 0} icon={MapPin} color="accent" />
          <StatsCard label="Sources" value={stats?.sources ?? 0} icon={Globe} color="success" />
          <StatsCard label="Organizers" value={stats?.organizers ?? 0} icon={Users} color="warning" />
          <StatsCard label="Contacted" value={stats?.contacted ?? 0} icon={Mail} color="primary" />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Recent Events</h3>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading events...</div>
            ) : !events?.length ? (
              <div className="p-8 text-center text-muted-foreground">
                No events yet. Use the AI Intelligence tab to import events.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {event.venue_name && <span>{event.venue_name}</span>}
                      {event.date && <span>{event.date}</span>}
                      {event.cities && <Badge variant="outline" className="text-xs">{(event.cities as any).name}</Badge>}
                    </div>
                  </div>
                  {event.ticket_price && (
                    <span className="text-sm font-mono text-accent">{event.ticket_price}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
