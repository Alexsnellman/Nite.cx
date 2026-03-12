import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, Calendar, Clock } from "lucide-react";

export default function VenueDetailPage() {
  const { name } = useParams<{ name: string }>();
  const venueName = decodeURIComponent(name || "");

  const { data: events, isLoading } = useQuery({
    queryKey: ["venue-events", venueName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(id, name, country)")
        .ilike("venue_name", venueName)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!venueName,
  });

  const firstEvent = events?.[0];
  const venueAddress = firstEvent?.venue_address;
  const city = firstEvent?.cities as any;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/admin/preview" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading venue...</div>
        ) : !events?.length ? (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-2xl font-bold">Venue not available</h2>
            <p className="text-muted-foreground">No events found for this venue.</p>
            <Button asChild variant="outline">
              <Link to="/admin/preview">Return to Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Venue header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">{firstEvent?.venue_name}</h1>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {venueAddress && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{venueAddress}</span>
                )}
                {city && (
                  <Link to={`/admin/cities/${city.name.toLowerCase()}`} className="hover:text-primary transition-colors">
                    {city.name}, {city.country}
                  </Link>
                )}
              </div>
            </div>

            {/* Events list */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Events at {firstEvent?.venue_name} ({events.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/admin/events/${event.id}`}
                    className="flex gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
                  >
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 text-muted-foreground">🎵</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{event.title}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        {event.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>}
                        {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
