
-- Moments table for live party posts
CREATE TABLE public.moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text DEFAULT NULL,
  visibility text NOT NULL DEFAULT 'attendees',
  created_at timestamptz NOT NULL DEFAULT now(),
  reported boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false
);

-- Index for fast event lookups
CREATE INDEX idx_moments_event_id ON public.moments(event_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- Everyone attending can view public moments (not hidden)
CREATE POLICY "Moments viewable by everyone"
ON public.moments FOR SELECT
TO authenticated
USING (hidden = false);

-- Users can post moments
CREATE POLICY "Users can post moments"
ON public.moments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete own moments
CREATE POLICY "Users can delete own moments"
ON public.moments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Users can update own moments (hide/report)
CREATE POLICY "Users can update own moments"
ON public.moments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create storage bucket for moment media
INSERT INTO storage.buckets (id, name, public)
VALUES ('moment-media', 'moment-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for moment-media bucket
CREATE POLICY "Authenticated users can upload moment media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'moment-media');

CREATE POLICY "Anyone can view moment media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'moment-media');

CREATE POLICY "Users can delete own moment media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'moment-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for moments
ALTER PUBLICATION supabase_realtime ADD TABLE public.moments;
