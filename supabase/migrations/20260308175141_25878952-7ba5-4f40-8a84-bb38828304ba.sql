-- Allow authenticated users to read newsletter subscribers (admin)
CREATE POLICY "Newsletter readable by authenticated" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (true);