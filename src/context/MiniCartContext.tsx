import React from "react";

interface MiniCartContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const MiniCartContext = React.createContext<MiniCartContextValue | undefined>(undefined);

export const MiniCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <MiniCartContext.Provider value={{ isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), toggleCart: () => setIsOpen((p) => !p) }}>
      {children}
    </MiniCartContext.Provider>
  );
};

export function useMiniCart() {
  const ctx = React.useContext(MiniCartContext);
  if (!ctx) throw new Error("useMiniCart must be used within MiniCartProvider");
  return ctx;
}
