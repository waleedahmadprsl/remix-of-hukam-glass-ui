
-- Fix: Allow authenticated users to INSERT/UPDATE/DELETE on products
CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE TO authenticated USING (true);

-- Fix: Allow authenticated users to INSERT/UPDATE/DELETE on categories
CREATE POLICY "Authenticated users can insert categories"
ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON public.categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories"
ON public.categories FOR DELETE TO authenticated USING (true);

-- Fix: Allow authenticated users to INSERT/UPDATE/DELETE on sub_categories
CREATE POLICY "Authenticated users can insert sub_categories"
ON public.sub_categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sub_categories"
ON public.sub_categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete sub_categories"
ON public.sub_categories FOR DELETE TO authenticated USING (true);

-- Fix: Allow authenticated users to INSERT profiles (needed for signup trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Allow anon insert on profiles too for the trigger
CREATE POLICY "Service can insert profiles"
ON public.profiles FOR INSERT WITH CHECK (true);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
