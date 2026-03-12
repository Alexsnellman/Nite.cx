
-- Cities table for multi-city expansion
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  launch_status text NOT NULL DEFAULT 'hidden',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities viewable by everyone"
ON public.cities FOR SELECT
USING (true);

-- Insert Helsinki as the first active city
INSERT INTO public.cities (name, country, latitude, longitude, launch_status)
VALUES ('Helsinki', 'Finland', 60.1699, 24.9384, 'active');

-- Add city and student_event to events
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS city text DEFAULT 'Helsinki',
  ADD COLUMN IF NOT EXISTS student_event boolean DEFAULT false;

-- Add university and city to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS city text DEFAULT 'Helsinki';
