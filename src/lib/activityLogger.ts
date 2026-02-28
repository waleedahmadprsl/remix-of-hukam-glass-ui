import { supabase } from "@/lib/supabase";

export async function logActivity(
  action: string,
  details?: string,
  userId?: string
) {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      action,
      details: details || "",
      user_id: userId || (await supabase.auth.getUser()).data.user?.id,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Activity log error:", error);
    }
  } catch (err) {
    console.error("Activity log exception:", err);
  }
}
