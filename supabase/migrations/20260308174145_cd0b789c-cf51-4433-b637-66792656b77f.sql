
-- Tighten RLS: Only authenticated users can modify sensitive tables

-- ORDERS: Anyone can insert (guest checkout), but only authenticated can update
DROP POLICY IF EXISTS "Orders are updatable by anyone" ON public.orders;
CREATE POLICY "Orders updatable by authenticated" ON public.orders FOR UPDATE TO authenticated USING (true);

-- PROMO CODES: Only authenticated can insert/update/delete
DROP POLICY IF EXISTS "Promo codes insertable by anyone" ON public.promo_codes;
DROP POLICY IF EXISTS "Promo codes updatable by anyone" ON public.promo_codes;
DROP POLICY IF EXISTS "Promo codes deletable by anyone" ON public.promo_codes;
CREATE POLICY "Promo codes insertable by authenticated" ON public.promo_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Promo codes updatable by authenticated" ON public.promo_codes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Promo codes deletable by authenticated" ON public.promo_codes FOR DELETE TO authenticated USING (true);

-- SHOPS: Only authenticated can insert/update/delete
DROP POLICY IF EXISTS "Shops insertable by anyone" ON public.shops;
DROP POLICY IF EXISTS "Shops updatable by anyone" ON public.shops;
DROP POLICY IF EXISTS "Shops deletable by anyone" ON public.shops;
CREATE POLICY "Shops insertable by authenticated" ON public.shops FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Shops updatable by authenticated" ON public.shops FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Shops deletable by authenticated" ON public.shops FOR DELETE TO authenticated USING (true);

-- ORDER ITEMS: Only authenticated can update/delete (anyone can insert for guest checkout)
DROP POLICY IF EXISTS "Order items updatable by anyone" ON public.order_items;
DROP POLICY IF EXISTS "Order items deletable by anyone" ON public.order_items;
CREATE POLICY "Order items updatable by authenticated" ON public.order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Order items deletable by authenticated" ON public.order_items FOR DELETE TO authenticated USING (true);

-- PRODUCT RELATIONS: Only authenticated can modify
DROP POLICY IF EXISTS "Product relations insertable by anyone" ON public.product_relations;
DROP POLICY IF EXISTS "Product relations updatable by anyone" ON public.product_relations;
DROP POLICY IF EXISTS "Product relations deletable by anyone" ON public.product_relations;
CREATE POLICY "Product relations insertable by authenticated" ON public.product_relations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Product relations updatable by authenticated" ON public.product_relations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Product relations deletable by authenticated" ON public.product_relations FOR DELETE TO authenticated USING (true);

-- PRODUCT VARIANTS: Only authenticated can modify
DROP POLICY IF EXISTS "Product variants insertable by anyone" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants updatable by anyone" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants deletable by anyone" ON public.product_variants;
CREATE POLICY "Product variants insertable by authenticated" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Product variants updatable by authenticated" ON public.product_variants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Product variants deletable by authenticated" ON public.product_variants FOR DELETE TO authenticated USING (true);

-- PRODUCT QUESTIONS: Only authenticated can update (anyone can insert questions)
DROP POLICY IF EXISTS "Product questions updatable by anyone" ON public.product_questions;
CREATE POLICY "Product questions updatable by authenticated" ON public.product_questions FOR UPDATE TO authenticated USING (true);
