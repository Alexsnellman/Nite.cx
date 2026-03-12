import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventCard } from "@/components/admin/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { preventImageCollisions } from "@/utils/eventFallbackImage";

export default function PreviewPage() {
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("id, name, country").order("name");
      if (error) throw error;
      return data;
    },
  });

  const countries = cities ? [...new Set(cities.map((c) => c.country))].sort() : [];
  const filteredCities = countryFilter && countryFilter !== "all"
    ? cities?.filter((c) => c.country === countryFilter)
    : cities;

  const { data: events, isLoading } = useQuery({
    queryKey: ["preview-events", cityFilter, countryFilter],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      let query = supabase
        .from("events")
        .select("*, cities(id, name, country), organizers(id, name)")
        .gte("date", today)
        .order("date", { ascending: true });

      if (cityFilter && cityFilter !== "all") {
        query = query.eq("city_id", cityFilter);
      } else if (countryFilter && countryFilter !== "all") {
        const countryCityIds = cities?.filter((c) => c.country === countryFilter).map((c) => c.id) ?? [];
        if (countryCityIds.length) {
          query = query.in("city_id", countryCityIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Sort: date ASC, then events with images first
  const sorted = events ? [...events].sort((a, b) => {
    const da = a.date || "9999-12-31";
    const db = b.date || "9999-12-31";
    if (da !== db) return da < db ? -1 : 1;
    const ai = a.image_url ? 1 : 0;
    const bi = b.image_url ? 1 : 0;
    return bi - ai;
  }) : [];

  const searched = sorted.filter((ev) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      ev.title.toLowerCase().includes(s) ||
      ev.venue_name?.toLowerCase().includes(s) ||
      ev.description?.toLowerCase().includes(s)
    );
  });

  // Anti-collision: prevent adjacent cards from showing the same fallback image
  const filtered = preventImageCollisions(searched);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["preview-events"] });

  const cleanupPastEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { error, count } = await supabase.from("events").delete().lt("date", today);
    if (error) toast.error("Cleanup failed: " + error.message);
    else { toast.success(`Removed ${count ?? 0} past events`); refresh(); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Events</h2>
            <p className="text-muted-foreground text-sm mt-1">Browse all events — hover cards for edit/delete controls</p>
          </div>
          <Button variant="outline" size="sm" onClick={cleanupPastEvents} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1.5" /> Cleanup Past Events
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCityFilter(""); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All countries" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-52"><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {filteredCities?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="ml-auto text-sm text-muted-foreground flex items-center">{filtered.length} events</div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading events...</div>
        ) : !filtered.length ? (
          <div className="text-center py-12 text-muted-foreground">No events found. Extract events from the AI Intelligence tab first.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
