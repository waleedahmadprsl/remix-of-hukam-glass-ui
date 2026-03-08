
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  referrer text DEFAULT '',
  session_id text NOT NULL,
  user_agent text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page views insertable by anyone" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Page views readable by anyone" ON public.page_views FOR SELECT USING (true);

CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
