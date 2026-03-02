import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  details?: string
) {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      action,
      details: details || "",
    });

    if (error) {
      console.error("Activity log error:", error);
    }
  } catch (err) {
    console.error("Activity log exception:", err);
  }
}
