import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jjnkwysssrexpvjyyavs.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqbmt3eXNzc3JleHB2anl5YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTA2MDIsImV4cCI6MjA4Nzg4NjYwMn0.eVW3XIB1Ai_SiHleSUhjiJ3YLARxy9du2Im8BJ9D7Ho";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
