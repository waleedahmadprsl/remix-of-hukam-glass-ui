
-- 1. Fix PRIVILEGE ESCALATION: Replace the profile update policy to exclude role column
-- Drop the old permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new update policy that prevents role modification
CREATE POLICY "Users can update own profile safely" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));

-- 2. Create atomic stock deduction function for race condition fix
CREATE OR REPLACE FUNCTION public.deduct_stock(p_product_id uuid, p_variant_id uuid, p_quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_affected integer;
BEGIN
  -- Deduct variant stock if variant_id provided
  IF p_variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock = stock - p_quantity
    WHERE id = p_variant_id AND stock >= p_quantity;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected = 0 THEN
      RETURN false;
    END IF;
  END IF;

  -- Always deduct from main product stock
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  RETURN rows_affected > 0;
END;
$$;
