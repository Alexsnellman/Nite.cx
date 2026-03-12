import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventData } from "@/data/mockEvents";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

function mapDbEventToEventData(row: any): EventData {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    city: row.city || "Helsinki",
    date: row.date,
    time: row.time,
    price: Number(row.ticket_price),
    currency: row.currency,
    capacity: row.capacity,
    ticketsSold: row.tickets_sold,
    going: row.going,
    comments: 0,
    image: row.image_url || PLACEHOLDER_IMAGE,
    genre: row.genre || "",
    organizer: row.organizer_name || "Unknown",
    description: row.description || "",
    friendsGoing: [],
    lat: row.latitude ?? 60.1699,
    lng: row.longitude ?? 24.9384,
    popularityScore: row.popularity_score || 0,
    salesVelocity: Number(row.sales_velocity) || 0,
    viewCount: row.view_count || 0,
    shareCount: row.share_count || 0,
    revenue: Number(row.ticket_price) * row.tickets_sold,
    crowdGrowth: [],
    friendsHere: [],
    studentEvent: row.student_event || false,
  };
}

export function useEvents(city?: string) {
  return useQuery({
    queryKey: ["events", city],
    queryFn: async (): Promise<EventData[]> => {
      let query = supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (city) {
        query = query.eq("city", city);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDbEventToEventData);
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
        .select("*")
        .eq("organizer_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbEventToEventData);
    },
  });
}
