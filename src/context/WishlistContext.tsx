import React from "react";

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
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem("hukam_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem("hukam_wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = (item: WishlistItem) => {
    setItems((prev) => prev.some((i) => i.id === item.id) ? prev : [...prev, item]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const isInWishlist = (id: string) => items.some((i) => i.id === id);

  const toggleItem = (item: WishlistItem) => {
    isInWishlist(item.id) ? removeItem(item.id) : addItem(item);
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
