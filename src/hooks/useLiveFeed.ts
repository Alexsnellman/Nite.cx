import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Moment } from "./useMoments";
import { mockEvents } from "@/data/mockEvents";

export interface LiveEvent {
  id: string;
  title: string;
  image_url: string | null;
  location: string;
  momentCount: number;
}

// Direct .mp4 URLs that actually work (no redirects)
const DEMO_MOMENTS: Moment[] = [
  {
    id: "demo-m1",
    event_id: "hel-1",
    user_id: "demo-1",
    media_url: "/videos/concert-1.mp4",
    media_type: "video",
    caption: "Vibes are insane tonight 🔥",
    visibility: "attendees",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Emilia",
    user_photo: "🧑‍🎤",
  },
  {
    id: "demo-m2",
    event_id: "hel-1",
    user_id: "demo-2",
    media_url: "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=600",
    media_type: "image",
    caption: "Basement is packed!",
    visibility: "attendees",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Mikko",
    user_photo: "🦊",
  },
  {
    id: "demo-m3",
    event_id: "hel-2",
    user_id: "demo-3",
    media_url: "/videos/club-1.mp4",
    media_type: "video",
    caption: "Warehouse going crazy rn",
    visibility: "attendees",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Aleksi",
    user_photo: "🐺",
  },
  {
    id: "demo-m4",
    event_id: "hel-2",
    user_id: "demo-4",
    media_url: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600",
    media_type: "image",
    caption: null,
    visibility: "attendees",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Noora",
    user_photo: "🦄",
  },
  {
    id: "demo-m5",
    event_id: "hel-2",
    user_id: "demo-5",
    media_url: "/videos/dj-1.mp4",
    media_type: "video",
    caption: "The sound system 😭🔊",
    visibility: "attendees",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Lauri",
    user_photo: "👻",
  },
  {
    id: "demo-m6",
    event_id: "hel-4",
    user_id: "demo-6",
    media_url: "https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=600",
    media_type: "image",
    caption: "Student rave energy ⚡",
    visibility: "attendees",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Saara",
    user_photo: "🎭",
  },
  {
    id: "demo-m7",
    event_id: "hel-4",
    user_id: "demo-7",
    media_url: "/videos/crowd-1.mp4",
    media_type: "video",
    caption: "Friday vibes only 🎓🔥",
    visibility: "attendees",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Ville",
    user_photo: "🤖",
  },
  {
    id: "demo-m8",
    event_id: "hel-5",
    user_id: "demo-8",
    media_url: "https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg?auto=compress&cs=tinysrgb&w=600",
    media_type: "image",
    caption: "DnB goes hard 🥁",
    visibility: "attendees",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reported: false,
    hidden: false,
    user_name: "Lauri",
    user_photo: "👻",
  },
];

/** Fetch events that have moments posted in the last 7 days, with demo fallback */
export function useLiveEvents() {
  return useQuery({
    queryKey: ["live-events"],
    refetchInterval: 60000,
    queryFn: async (): Promise<LiveEvent[]> => {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: moments, error } = await (supabase
        .from("moments" as any)
        .select("event_id")
        .eq("hidden", false)
        .gte("created_at", cutoff) as any);

      // Count real moments per event
      const countMap: Record<string, number> = {};
      if (!error && moments?.length) {
        moments.forEach((m: any) => {
          countMap[m.event_id] = (countMap[m.event_id] || 0) + 1;
        });
      }

      // Add demo moment counts
      DEMO_MOMENTS.forEach((m) => {
        countMap[m.event_id] = (countMap[m.event_id] || 0) + 1;
      });

      const eventIds = Object.keys(countMap);

      // Fetch real events from DB
      const { data: dbEvents } = await supabase
        .from("events")
        .select("id, title, image_url, location")
        .in("id", eventIds.filter((id) => !id.startsWith("hel-")));

      // Build results from DB events
      const results: LiveEvent[] = (dbEvents || []).map((e) => ({
        id: e.id,
        title: e.title,
        image_url: e.image_url,
        location: e.location,
        momentCount: countMap[e.id] || 0,
      }));

      // Add mock events that have demo moments
      const mockEventIds = eventIds.filter((id) => id.startsWith("hel-"));
      mockEventIds.forEach((id) => {
        const mock = mockEvents.find((e) => e.id === id);
        if (mock) {
          results.push({
            id: mock.id,
            title: mock.title,
            image_url: mock.image,
            location: mock.location,
            momentCount: countMap[mock.id] || 0,
          });
        }
      });

      return results.sort((a, b) => b.momentCount - a.momentCount);
    },
  });
}

/** Fetch all moments for a specific event (last 7 days), with demo fallback */
export function useLiveMoments(eventId: string | undefined) {
  return useQuery({
    queryKey: ["live-moments", eventId],
    enabled: !!eventId,
    refetchInterval: 30000,
    queryFn: async (): Promise<Moment[]> => {
      const isMockEvent = eventId!.startsWith("hel-");
      let realMoments: Moment[] = [];

      // Only query DB for real UUID event IDs
      if (!isMockEvent) {
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await (supabase
          .from("moments" as any)
          .select("*")
          .eq("event_id", eventId!)
          .eq("hidden", false)
          .gte("created_at", cutoff)
          .order("created_at", { ascending: false })
          .limit(100) as any);

        if (!error && data?.length) {
          const userIds = data.map((m: any) => String(m.user_id)).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
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

          realMoments = data.map((m: any) => ({
            ...m,
            user_name: profileMap[m.user_id]?.name || "Anonymous",
            user_photo: profileMap[m.user_id]?.photo || null,
          }));
        }
      }

      // Add demo moments for this event
      const demoForEvent = DEMO_MOMENTS.filter((m) => m.event_id === eventId);

      // Merge and sort by created_at desc
      return [...realMoments, ...demoForEvent].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
}
