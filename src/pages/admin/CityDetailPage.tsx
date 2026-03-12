import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Image } from "lucide-react";

type TimeFilter = "all" | "today" | "week" | "weekend";

function getDateRange(filter: TimeFilter) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  switch (filter) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return { from: today, to: end.toISOString().split("T")[0] };
    }
    case "weekend": {
      const day = now.getDay();
      const fri = new Date(now);
      fri.setDate(fri.getDate() + ((5 - day + 7) % 7));
      const sun = new Date(fri);
      sun.setDate(sun.getDate() + 2);
      return { from: fri.toISOString().split("T")[0], to: sun.toISOString().split("T")[0] };
    }
    default:
      return null;
  }
}

export default function CityDetailPage() {
  const { name } = useParams<{ name: string }>();
  const cityName = decodeURIComponent(name || "");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const { data: city } = useQuery({
    queryKey: ["city-lookup", cityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .ilike("name", cityName)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!cityName,
  });

  const dateRange = getDateRange(timeFilter);

  const { data: events, isLoading } = useQuery({
    queryKey: ["city-events", city?.id, timeFilter],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, cities(id, name, country)")
        .eq("city_id", city!.id)
        .order("date", { ascending: true });

      if (dateRange) {
        query = query.gte("date", dateRange.from).lte("date", dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!city?.id,
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/admin/cities" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cities
        </Link>

        {!city && !isLoading ? (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-2xl font-bold">City not available</h2>
            <p className="text-muted-foreground">No city found matching "{cityName}".</p>
            <Button asChild variant="outline">
              <Link to="/admin/cities">Return to Cities</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-3xl font-bold capitalize">{cityName}</h1>
                {city?.country && <p className="text-muted-foreground text-sm">{city.country}</p>}
              </div>
            </div>

            {/* Time filters */}
            <div className="flex gap-2">
              {(["all", "today", "week", "weekend"] as TimeFilter[]).map((f) => (
                <Button
                  key={f}
                  variant={timeFilter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(f)}
                >
                  {f === "all" ? "All upcoming" : f === "week" ? "This week" : f === "weekend" ? "This weekend" : "Today"}
                </Button>
              ))}
              <span className="ml-auto text-sm text-muted-foreground flex items-center">
                {events?.length ?? 0} events
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading events...</div>
            ) : !events?.length ? (
              <div className="text-center py-12 text-muted-foreground">No events found for this filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/admin/events/${event.id}`}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group block"
                  >
                    {event.image_url ? (
                      <div className="h-36 overflow-hidden">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-36 bg-secondary flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{event.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {event.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>}
                        {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>}
                      </div>
                      {event.venue_name && (
                        <p className="text-xs text-muted-foreground truncate">📍 {event.venue_name}</p>
                      )}
                      {event.ticket_price && (
                        <Badge variant="secondary" className="text-xs font-mono">{event.ticket_price}</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
