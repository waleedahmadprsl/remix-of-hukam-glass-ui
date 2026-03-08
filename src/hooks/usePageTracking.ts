import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = (): string => {
  let sid = sessionStorage.getItem("hukam_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("hukam_sid", sid);
  }
  return sid;
};

export const usePageTracking = () => {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    if (path.startsWith("/admin")) return; // skip admin pages
    lastPath.current = path;

    supabase.from("page_views").insert({
      page_path: path,
      session_id: getSessionId(),
      referrer: document.referrer || "",
      user_agent: navigator.userAgent || "",
    }).then(() => {});
  }, [location.pathname]);
};
