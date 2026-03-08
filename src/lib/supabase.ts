import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gnaxvluvnnbwbjlvekfg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cyfcF3gKb-Niu79xLVF9hg_yv5qYaVK";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
