import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  shippingRatePerShop: number;
  freeShippingThreshold: number;
  currency: string;
  codEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  bankTransferEnabled: boolean;
}

export const defaultSettings: StoreSettings = {
  storeName: "HUKAM",
  tagline: "Order Nahi, HUKAM Kijiye.",
  contactEmail: "contact@hukam.pk",
  contactPhone: "+92 327 7786498",
  whatsappNumber: "923277786498",
  address: "Mirpur, AJK",
  city: "Mirpur",
  shippingRatePerShop: 50,
  freeShippingThreshold: 0,
  currency: "PKR",
  codEnabled: true,
  jazzcashEnabled: false,
  easypaisaEnabled: false,
  bankTransferEnabled: false,
};

// Simple cache to avoid refetching on every component mount
let cachedSettings: StoreSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || defaultSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings && Date.now() - cacheTimestamp < CACHE_TTL) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    supabase
      .from("store_settings")
      .select("settings")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.settings) {
          const merged = { ...defaultSettings, ...(data.settings as Record<string, unknown>) } as StoreSettings;
          cachedSettings = merged;
          cacheTimestamp = Date.now();
          setSettings(merged);
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  // Try update first, then insert if no rows exist
  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing?.id) {
    const { error } = await supabase
      .from("store_settings")
      .update({ settings: settings as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) { console.error("Save settings error:", error); return false; }
  } else {
    const { error } = await supabase
      .from("store_settings")
      .insert({ settings: settings as unknown as Record<string, unknown> });
    if (error) { console.error("Insert settings error:", error); return false; }
  }

  // Invalidate cache
  cachedSettings = settings;
  cacheTimestamp = Date.now();
  return true;
}
