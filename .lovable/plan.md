

# Customer Authentication with Supabase (Direct)

## Approach
Use the existing Supabase project (`src/lib/supabase.ts` pointing to `gnaxvluvnnbwbjlvekfg.supabase.co`) for all auth. No Lovable Cloud auth helpers — pure `supabase.auth.*` SDK calls.

## Database Changes

### 1. Extend `profiles` table
Add columns for customer data:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text DEFAULT '';
```

### 2. Add `user_id` to `orders` table
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

### 3. Create `user_wishlist` table
```sql
CREATE TABLE user_wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
-- Users can only manage their own wishlist
CREATE POLICY "Users read own wishlist" ON user_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wishlist" ON user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own wishlist" ON user_wishlist FOR DELETE USING (auth.uid() = user_id);
```

### 4. Update `handle_new_user` trigger function
Include new columns with defaults so profile auto-creates on signup.

## Google OAuth Setup
For Google sign-in, you will need to:
1. Go to your **Supabase Dashboard** → Authentication → Providers → Google
2. Enable Google provider and paste your Google OAuth Client ID and Secret
3. Set the redirect URL from your Supabase dashboard in Google Cloud Console

The code will use `supabase.auth.signInWithOAuth({ provider: 'google' })`.

## New Pages

### `/login` — Customer Login
- Email/password form + "Sign in with Google" button
- Link to `/signup` and `/forgot-password`
- On success, redirect to previous page or home

### `/signup` — Customer Registration
- Fields: Full Name, Email, Password, Confirm Password
- "Sign up with Google" button
- Calls `supabase.auth.signUp()` with `full_name` in metadata

### `/account` — Customer Dashboard (protected)
- Tabs: **Profile** (edit name, phone, address, city), **Orders** (history), **Wishlist** (synced)
- Protected by auth guard redirecting to `/login`

### `/forgot-password` — Customer Password Reset
- Email input → `supabase.auth.resetPasswordForEmail()`
- Separate `/reset-password` page for setting new password

## File Changes

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | **Create** — email/password + Google OAuth login |
| `src/pages/Signup.tsx` | **Create** — registration form + Google OAuth |
| `src/pages/Account.tsx` | **Create** — profile, orders, wishlist tabs |
| `src/pages/ForgotPassword.tsx` | **Create** — reset email form |
| `src/pages/ResetPassword.tsx` | **Create** — set new password |
| `src/components/Header.tsx` | **Edit** — add user icon/avatar, login/account dropdown |
| `src/context/AuthContext.tsx` | **Edit** — expose user profile data, add `profile` state |
| `src/context/WishlistContext.tsx` | **Edit** — sync with DB when logged in, merge localStorage on login |
| `src/pages/Checkout.tsx` | **Edit** — attach `user_id` to order if logged in, pre-fill form from profile |
| `src/App.tsx` | **Edit** — add new routes |

## Key Details
- All imports use `import { supabase } from "@/lib/supabase"` (your own Supabase instance)
- Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
- Email confirmation: users must verify email before signing in (Supabase default)
- Guest checkout remains available — login is optional at checkout

