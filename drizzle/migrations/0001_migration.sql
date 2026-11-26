DROP POLICY IF EXISTS "uploads public read" ON storage.objects;
CREATE POLICY "uploads owner or staff read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'uploads' AND (((storage.foldername(name))[1] = (auth.uid())::text) OR public.is_staff()));