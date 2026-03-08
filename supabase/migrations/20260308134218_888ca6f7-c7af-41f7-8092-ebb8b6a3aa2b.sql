
-- Enterprise product fields: logistics, trust signals, SEO
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dimensions_l numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dimensions_w numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dimensions_h numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS return_policy text DEFAULT '7-day return',
  ADD COLUMN IF NOT EXISTS meta_title text DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}';

-- Cross-selling: product relations
CREATE TABLE IF NOT EXISTS public.product_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'frequently_bought',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, related_product_id, relation_type)
);

ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product relations are publicly readable" ON public.product_relations FOR SELECT USING (true);
CREATE POLICY "Product relations insertable by anyone" ON public.product_relations FOR INSERT WITH CHECK (true);
CREATE POLICY "Product relations updatable by anyone" ON public.product_relations FOR UPDATE USING (true);
CREATE POLICY "Product relations deletable by anyone" ON public.product_relations FOR DELETE USING (true);

-- Customer Q&A
CREATE TABLE IF NOT EXISTS public.product_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text DEFAULT '',
  asked_by text NOT NULL DEFAULT 'Anonymous',
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product questions are publicly readable" ON public.product_questions FOR SELECT USING (true);
CREATE POLICY "Product questions insertable by anyone" ON public.product_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Product questions updatable by anyone" ON public.product_questions FOR UPDATE USING (true);
