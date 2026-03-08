
-- 1. Create shops (vendors) table
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku_prefix text NOT NULL UNIQUE,
  contact_name text,
  email text,
  phone text,
  address text,
  commission_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shops are publicly readable" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Shops insertable by anyone" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Shops updatable by anyone" ON public.shops FOR UPDATE USING (true);
CREATE POLICY "Shops deletable by anyone" ON public.shops FOR DELETE USING (true);

-- 2. Add marketplace columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS buying_cost numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS auto_sku text;

-- 3. Create order_items table for normalized multi-vendor orders
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  variant_name text,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  buying_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items are publicly readable" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items insertable by anyone" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items updatable by anyone" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "Order items deletable by anyone" ON public.order_items FOR DELETE USING (true);
