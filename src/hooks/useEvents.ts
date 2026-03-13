import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventData } from "@/data/mockEvents";
import { getEventFallbackImage } from "@/utils/eventFallbackImage";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

function formatDateForFeed(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function mapDbEventToEventData(row: any): EventData {
  const cityName = row.cities?.name || "Helsinki";
  const fallbackImage = getEventFallbackImage(row.event_type || row.genre || "nightclub", row.title);

  return {
    id: row.id,
    title: row.title || "Untitled Event",
    location: row.venue_name || row.venue_address || "TBA",
    city: cityName,
    date: formatDateForFeed(row.date),
    time: row.time || "",
    price: Number(row.ticket_price) || 0,
    currency: row.currency || "EUR",
    capacity: row.capacity || 0,
    ticketsSold: row.tickets_sold || 0,
    going: row.going || 0,
    comments: 0,
    image: row.image_url || fallbackImage || PLACEHOLDER_IMAGE,
    genre: row.genre || row.event_type || "",
    organizer: row.organizer_name || "Unknown",
    description: row.description || "",
    friendsGoing: [],
    lat: row.latitude ?? 60.1699,
    lng: row.longitude ?? 24.9384,
    popularityScore: row.popularity_score || 0,
    salesVelocity: Number(row.sales_velocity) || 0,
    viewCount: row.view_count || 0,
    shareCount: row.share_count || 0,
    revenue: (Number(row.ticket_price) || 0) * (row.tickets_sold || 0),
    crowdGrowth: [],
    friendsHere: [],
    studentEvent: row.student_event || false,
  };
}

export function useEvents(city?: string) {
  return useQuery({
    queryKey: ["events", city],
    queryFn: async (): Promise<EventData[]> => {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("events")
        .select("*, cities(name)")
        .gte("date", today)
        .order("date", { ascending: true });

      if (city) {
        query = query.eq("cities.name", city);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out rows where city filter didn't match (PostgREST returns nulled joins)
      const filtered = city
        ? (data || []).filter((row: any) => row.cities?.name === city)
        : data || [];

      return filtered.map(mapDbEventToEventData);
    },
  });
}

export function useOrganizerEvents(userId: string | undefined) {
  return useQuery({
    queryKey: ["organizer-events", userId],
    enabled: !!userId,
    queryFn: async (): Promise<EventData[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("*, cities(name)")
        .eq("organizer_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbEventToEventData);
    },
  });
}
