import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "TKT-";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface TicketWithEvent {
  id: string;
  qr_code: string;
  status: "valid" | "used" | "cancelled";
  purchase_time: string;
  checkin_time: string | null;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image_url: string | null;
    currency: string;
    ticket_price: number;
  };
}

export function useMyTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TicketWithEvent[]> => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, event:events(id, title, date, time, location, image_url, currency, ticket_price)")
        .eq("user_id", user!.id)
        .order("purchase_time", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TicketWithEvent[];
    },
  });
}

export function usePurchaseTicket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Check if already purchased
      const { data: existing } = await supabase
        .from("tickets")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .eq("status", "valid")
        .maybeSingle();

      if (existing) throw new Error("You already have a ticket for this event");

      const qrCode = generateQRCode();

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          user_id: user.id,
          event_id: eventId,
          qr_code: qrCode,
          status: "valid",
        })
        .select()
        .single();

      if (error) throw error;

      // Increment tickets_sold and going on the event
      await supabase.rpc("increment_ticket_sold" as never, { event_id_input: eventId } as never);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
