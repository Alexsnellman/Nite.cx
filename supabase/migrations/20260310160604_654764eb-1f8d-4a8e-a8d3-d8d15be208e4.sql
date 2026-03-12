
INSERT INTO storage.buckets (id, name, public) VALUES ('event-media', 'event-media', true);

CREATE POLICY "Anyone can view event media"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated users can upload event media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "Users can delete own event media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-media' AND (storage.foldername(name))[1] = auth.uid()::text);
