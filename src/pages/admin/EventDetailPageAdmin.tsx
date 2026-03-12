import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Ticket, ExternalLink, ArrowLeft, User, Building2 } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(id, name, country), organizers(id, name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/admin/preview" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading event...</div>
        ) : !event ? (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-2xl font-bold">Event not available</h2>
            <p className="text-muted-foreground">This event may have been removed or doesn't exist.</p>
            <Button asChild variant="outline">
              <Link to="/admin/preview">Return to Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero image */}
            {event.image_url && (
              <div className="rounded-xl overflow-hidden h-64 md:h-80">
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title & badges */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-2">
                {event.event_type && <Badge variant="secondary">{event.event_type}</Badge>}
                {event.cities && (
                  <Link to={`/admin/cities/${(event.cities as any).name.toLowerCase()}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      {(event.cities as any).name}, {(event.cities as any).country}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.date && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
              )}
              {event.venue_name && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <Link
                      to={`/admin/venues/${encodeURIComponent(event.venue_name)}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {event.venue_name}
                    </Link>
                    {event.venue_address && (
                      <p className="text-xs text-muted-foreground">{event.venue_address}</p>
                    )}
                  </div>
                </div>
              )}
              {event.ticket_price && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium font-mono">{event.ticket_price}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Organizer */}
            {event.organizers && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  <Link
                    to={`/admin/organizers/${(event.organizers as any).id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {(event.organizers as any).name}
                  </Link>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">About this event</h3>
                <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              {(event.ticket_url || event.event_url) && (
                <Button asChild>
                  <a href={event.ticket_url || event.event_url!} target="_blank" rel="noopener noreferrer">
                    <Ticket className="h-4 w-4 mr-2" /> Buy Tickets <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {event.source_url && (
                <Button variant="outline" asChild>
                  <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                    Visit Source <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {event.cities && (
                <Button variant="ghost" asChild>
                  <Link to={`/admin/cities/${(event.cities as any).name.toLowerCase()}`}>
                    <MapPin className="h-4 w-4 mr-2" /> More in {(event.cities as any).name}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
