import React from "react";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  quantity: number;
  image?: string;
  shopId?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  buyingCost?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "priceNumber"> & { quantity?: number }) => void;
  removeItem: (id: string, variantId?: string | null) => void;
  updateQuantity: (id: string, qty: number, variantId?: string | null) => void;
  clearCart: () => void;
  subtotal: () => number;
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

function parsePrice(price: string) {
  const digits = price.replace(/[^0-9]/g, "");
  return Number(digits) || 0;
}

function getCartKey(item: { id: string; variantId?: string | null }) {
  return item.variantId ? `${item.id}__${item.variantId}` : item.id;
}

const STORAGE_KEY = "hukam_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: any) => {
    setItems((prev) => {
      const itemKey = getCartKey(item);
      const found = prev.find((p) => getCartKey(p) === itemKey);
      if (found) {
        return prev.map((p) =>
          getCartKey(p) === itemKey ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p
        );
      }
      const priceNumber = parsePrice(item.price || item.priceString || "0");
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        priceNumber,
        quantity: item.quantity || 1,
        image: item.image,
        shopId: item.shopId || null,
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        buyingCost: item.buyingCost || 0,
      };
      return [newItem, ...prev];
    });
  };

  const removeItem = (id: string, variantId?: string | null) => {
    setItems((prev) => prev.filter((i) => {
      const key = getCartKey(i);
      const targetKey = variantId ? `${id}__${variantId}` : id;
      return key !== targetKey;
    }));
  };

  const updateQuantity = (id: string, qty: number, variantId?: string | null) => {
    setItems((prev) => prev.map((i) => {
      const key = getCartKey(i);
      const targetKey = variantId ? `${id}__${variantId}` : id;
      return key === targetKey ? { ...i, quantity: qty } : i;
    }));
  };

  const clearCart = () => setItems([]);

  const subtotal = () => items.reduce((s, it) => s + it.priceNumber * it.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartContext;
