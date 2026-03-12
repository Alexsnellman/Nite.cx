
-- Add new columns to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales_velocity NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Add checkin_time to tickets for live radar
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS checkin_time TIMESTAMPTZ;

-- Add organizer_role to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organizer_role BOOLEAN DEFAULT false;
