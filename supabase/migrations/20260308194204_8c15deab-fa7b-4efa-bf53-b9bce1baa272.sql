
-- Create the trigger that was missing
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also update the function to better capture Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, username, avatar_url, phone, address, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user',
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'email', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN profiles.full_name = '' OR profiles.full_name IS NULL
      THEN COALESCE(EXCLUDED.full_name, profiles.full_name)
      ELSE profiles.full_name END,
    avatar_url = CASE WHEN profiles.avatar_url = '' OR profiles.avatar_url IS NULL
      THEN COALESCE(EXCLUDED.avatar_url, profiles.avatar_url)
      ELSE profiles.avatar_url END,
    username = CASE WHEN profiles.username = '' OR profiles.username IS NULL
      THEN COALESCE(EXCLUDED.username, profiles.username)
      ELSE profiles.username END;
  RETURN NEW;
END;
$$;
