import React from "react";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  quantity: number;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "priceNumber"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

function parsePrice(price: string) {
  const digits = price.replace(/[^0-9]/g, "");
  return Number(digits) || 0;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = (item: any) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p));
      }
      const priceNumber = parsePrice(item.price || item.priceString || "0");
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        priceNumber,
        quantity: item.quantity || 1,
        image: item.image,
      };
      return [newItem, ...prev];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));

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
