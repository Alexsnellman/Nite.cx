
CREATE OR REPLACE FUNCTION public.increment_ticket_sold(event_id_input uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE events
  SET tickets_sold = tickets_sold + 1,
      going = going + 1,
      updated_at = now()
  WHERE id = event_id_input;
$$;
