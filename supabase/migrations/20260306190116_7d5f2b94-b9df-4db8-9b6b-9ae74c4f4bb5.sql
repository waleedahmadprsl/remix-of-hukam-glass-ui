
-- 1. Add parent_id and level to categories for N-tier nesting
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS level integer DEFAULT 0;

-- 2. Migrate existing sub_categories into categories with parent_id
INSERT INTO public.categories (name, slug, parent_id, level)
SELECT sc.name, sc.slug, sc.category_id, 1
FROM public.sub_categories sc
ON CONFLICT DO NOTHING;

-- 3. Update products to point to the new migrated categories
UPDATE public.products p
SET sub_category_id = c.id
FROM public.sub_categories sc
JOIN public.categories c ON c.slug = sc.slug AND c.parent_id = sc.category_id
WHERE p.sub_category_id = sc.id;

-- 4. Add tracking_id, shipping_cost, discount_amount to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- 5. Add status and tags to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 6. Add min_purchase, usage_limit, times_used to promo_codes
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS min_purchase numeric DEFAULT 0;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS usage_limit integer;
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS times_used integer DEFAULT 0;

-- 7. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_name text NOT NULL,
  sku text,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Product variants insertable by anyone" ON public.product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Product variants updatable by anyone" ON public.product_variants FOR UPDATE USING (true);
CREATE POLICY "Product variants deletable by anyone" ON public.product_variants FOR DELETE USING (true);

-- 9. Rename sub_category_id to category_id on products (keep FK working with categories table)
-- We can't easily rename, so we'll add category_id and migrate
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Copy sub_category_id values to category_id
UPDATE public.products SET category_id = sub_category_id WHERE sub_category_id IS NOT NULL;
