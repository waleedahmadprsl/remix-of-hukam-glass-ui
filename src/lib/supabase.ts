import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gnaxvluvnnbwbjlvekfg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYXh2bHV2bm5id2JqbHZla2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTY1MDIsImV4cCI6MjA1NjU5MjUwMn0.gMCGqPGKFDJyJdaGPPC1JiNQKnJHBnHOqVLOJKqVBM4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
