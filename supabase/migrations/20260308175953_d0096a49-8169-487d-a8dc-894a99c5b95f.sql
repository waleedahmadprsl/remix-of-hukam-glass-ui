-- Allow authenticated users to delete newsletter subscribers
CREATE POLICY "Newsletter deletable by authenticated" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (true);