
-- Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text DEFAULT '';

-- Add user_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create user_wishlist table
CREATE TABLE IF NOT EXISTS user_wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wishlist" ON user_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wishlist" ON user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own wishlist" ON user_wishlist FOR DELETE USING (auth.uid() = user_id);

-- Update handle_new_user to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, username, avatar_url, phone, address, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    '',
    '',
    ''
  );
  RETURN NEW;
END;
$function$;

-- Add RLS policy for orders so users can read their own orders
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
