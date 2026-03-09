import React from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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

  // Sync from DB when user logs in (gracefully handle missing table)
  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("user_wishlist")
      .select("product_id, products(title, price, images)")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) {
          // Table may not exist on personal DB — silently fall back to localStorage
          console.warn("Wishlist sync skipped:", error.message);
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
        setLoading(false);
      });
  }, [userId]);

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
      await supabase.from("user_wishlist").insert({ user_id: userId, product_id: item.id }).catch(() => {});
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (userId) {
      await supabase.from("user_wishlist").delete().eq("user_id", userId).eq("product_id", id).catch(() => {});
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
