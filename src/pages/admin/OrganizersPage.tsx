import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserSearch } from "lucide-react";
import { toast } from "sonner";

export default function OrganizersPage() {
  const queryClient = useQueryClient();
  const [extractCountry, setExtractCountry] = useState("");
  const [extractCityId, setExtractCityId] = useState("");

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("id, name, country").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: organizers, isLoading } = useQuery({
    queryKey: ["organizers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizers").select("*, cities(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: eventCounts } = useQuery({
    queryKey: ["organizer-event-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("organizer_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((e: any) => {
        if (e.organizer_id) counts[e.organizer_id] = (counts[e.organizer_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Get events with their sources and city info to extract organizers
  const { data: eventsWithDetails } = useQuery({
    queryKey: ["events-for-organizer-extraction"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, venue_name, source_url, city_id, cities(name, country)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const countries = cities ? [...new Set(cities.map((c) => c.country))].sort() : [];
  const filteredCities = extractCountry ? cities?.filter((c) => c.country === extractCountry) : cities;

  // Extract organizers from events data
  const extractMutation = useMutation({
    mutationFn: async () => {
      if (!eventsWithDetails?.length) throw new Error("No events data to extract organizers from");

      // Filter events by country/city
      let filtered = eventsWithDetails;
      if (extractCityId && extractCityId !== "all") {
        filtered = filtered.filter((e) => e.city_id === extractCityId);
      } else if (extractCountry) {
        const countryCityIds = cities?.filter((c) => c.country === extractCountry).map((c) => c.id) ?? [];
        filtered = filtered.filter((e) => e.city_id && countryCityIds.includes(e.city_id));
      }

      if (!filtered.length) throw new Error("No events found for the selected filters");

      // Extract unique venue names as potential organizers
      const venueMap = new Map<string, { name: string; city_id: string | null; country: string | null; event_ids: string[] }>();

      for (const ev of filtered) {
        const name = ev.venue_name?.trim();
        if (!name) continue;
        const existing = venueMap.get(name.toLowerCase());
        if (existing) {
          existing.event_ids.push(ev.id);
        } else {
          venueMap.set(name.toLowerCase(), {
            name,
            city_id: ev.city_id,
            country: (ev.cities as any)?.country || null,
            event_ids: [ev.id],
          });
        }
      }

      if (!venueMap.size) throw new Error("No organizer names found in events");

      // Check which organizers already exist
      const { data: existingOrgs } = await supabase
        .from("organizers")
        .select("name");
      const existingNames = new Set((existingOrgs ?? []).map((o) => o.name.toLowerCase()));

      // Insert new organizers
      const newOrgs = [...venueMap.values()]
        .filter((v) => !existingNames.has(v.name.toLowerCase()))
        .map((v) => ({
          name: v.name,
          city_id: v.city_id,
          country: v.country,
          contact_status: "not_contacted" as const,
        }));

      if (!newOrgs.length) throw new Error("All organizers already exist in the database");

      const { data: inserted, error } = await supabase.from("organizers").insert(newOrgs).select("id, name");
      if (error) throw error;

      // Link events to organizers
      if (inserted) {
        for (const org of inserted) {
          const venueData = venueMap.get(org.name.toLowerCase());
          if (venueData) {
            for (const eventId of venueData.event_ids) {
              await supabase.from("events").update({ organizer_id: org.id }).eq("id", eventId);
            }
          }
        }
      }

      return inserted?.length ?? 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-event-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(`Extracted ${count} new organizers`);
    },
    onError: (e) => toast.error(e.message),
  });

  const statusColor: Record<string, string> = {
    not_contacted: "bg-muted text-muted-foreground border-border",
    contacted: "bg-info/15 text-info border-info/30",
    replied: "bg-warning/15 text-warning border-warning/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    denied: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Organizers</h2>
          <p className="text-muted-foreground text-sm mt-1">Event organizers intelligence panel</p>
        </div>

        {/* Extract Organizers */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <UserSearch className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Extract Organizers</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Extract organizer names, contacts, and event dependencies from saved event data
          </p>
          <div className="flex gap-3">
            <Select value={extractCountry} onValueChange={(v) => { setExtractCountry(v); setExtractCityId(""); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={extractCityId} onValueChange={setExtractCityId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {filteredCities?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => extractMutation.mutate()}
              disabled={!extractCountry || extractMutation.isPending}
            >
              {extractMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserSearch className="h-4 w-4 mr-2" />
              )}
              Extract Organizers
            </Button>
          </div>
        </div>

        {/* Organizers List */}
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : !organizers?.length ? (
            <div className="p-8 text-center text-muted-foreground">No organizers yet. Extract organizers from your events above.</div>
          ) : (
            organizers.map((org) => (
              <Link key={org.id} to={`/admin/organizers/${org.id}`} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium hover:text-primary transition-colors">{org.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {org.email && <span>📧 {org.email}</span>}
                    {org.instagram && <span>📸 @{org.instagram}</span>}
                    {org.website && <span className="text-primary">🌐 Website</span>}
                    {org.cities && <span>📍 {(org.cities as any).name}</span>}
                    {org.country && <span>🌍 {org.country}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>🎫 {eventCounts?.[org.id] || 0} events</span>
                  </div>
                </div>
                <Badge variant="outline" className={statusColor[org.contact_status || org.permission_status]}>
                  {(org.contact_status || org.permission_status).replace(/_/g, " ")}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
