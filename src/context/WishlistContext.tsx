import React from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@supabase/supabase-js";

// If app is not on the Cloud project, keep wishlist local-only to avoid schema cache 404s.
const CLOUD_URL = "https://jjnkwysssrexpvjyyavs.supabase.co";
const CLOUD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqbmt3eXNzc3JleHB2anl5YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTA2MDIsImV4cCI6MjA4Nzg4NjYwMn0.eVW3XIB1Ai_SiHleSUhjiJ3YLARxy9du2Im8BJ9D7Ho";
const appUrl = import.meta.env.VITE_SUPABASE_URL || "";
const isCloudApp = appUrl.includes("jjnkwysssrexpvjyyavs");
const cloudClient = isCloudApp ? createClient(CLOUD_URL, CLOUD_KEY) : null;

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  loading: boolean;
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [items, setItems] = React.useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem("hukam_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = React.useState(false);

  // Resolve which supabase client to use for wishlist
  const getDb = React.useCallback(async () => {
    if (cloudClient) return cloudClient;
    // App uses Cloud already — use integrations client
    const { supabase } = await import("@/integrations/supabase/client");
    return supabase;
  }, []);

  // Sync from DB when user logs in
  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const db = await getDb();
        const { data, error } = await db
          .from("user_wishlist")
          .select("product_id, products(title, price, images)")
          .eq("user_id", userId);
        if (error) {
          console.warn("Wishlist DB sync skipped:", error.message);
          setLoading(false);
          return;
        }
        if (data && data.length > 0) {
          const dbItems: WishlistItem[] = data.map((w: any) => ({
            id: w.product_id,
            title: w.products?.title || "",
            price: w.products?.price || 0,
            image: Array.isArray(w.products?.images) ? w.products.images[0] || "" : "",
          }));
          setItems(dbItems);
          localStorage.setItem("hukam_wishlist", JSON.stringify(dbItems));
        }
      } catch (e) {
        console.warn("Wishlist sync error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, getDb]);

  // Save to localStorage for guests
  React.useEffect(() => {
    if (!userId) {
      localStorage.setItem("hukam_wishlist", JSON.stringify(items));
    }
  }, [items, userId]);

  const addItem = async (item: WishlistItem) => {
    if (items.some((i) => i.id === item.id)) return;
    setItems((prev) => [...prev, item]);
    if (userId) {
      try {
        const db = await getDb();
        await db.from("user_wishlist").insert({ user_id: userId, product_id: item.id });
      } catch { /* silently skip if table unavailable */ }
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (userId) {
      try {
        const db = await getDb();
        await db.from("user_wishlist").delete().eq("user_id", userId).eq("product_id", id);
      } catch { /* silently skip */ }
    }
  };

  const isInWishlist = (id: string) => items.some((i) => i.id === id);
  const toggleItem = (item: WishlistItem) => {
    isInWishlist(item.id) ? removeItem(item.id) : addItem(item);
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
