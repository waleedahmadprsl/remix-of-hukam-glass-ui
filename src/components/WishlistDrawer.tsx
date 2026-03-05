import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const WishlistDrawer: React.FC<Props> = ({ open, onClose }) => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const navigate = useNavigate();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({ id: item.id, name: item.title, price: `Rs.${item.price}`, image: item.image });
    removeItem(item.id);
    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-md bg-background/95 backdrop-blur-xl border-l border-border/40 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive fill-destructive" />
                <h2 className="text-lg font-bold text-foreground">Wishlist ({items.length})</h2>
              </div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div key={item.id} layout className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <img src={item.image} alt={item.title} onClick={() => { navigate(`/product/${item.id}`); onClose(); }} className="w-16 h-16 rounded-lg object-cover cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate cursor-pointer" onClick={() => { navigate(`/product/${item.id}`); onClose(); }}>{item.title}</p>
                        <p className="text-primary font-bold text-sm mt-1">Rs.{item.price.toLocaleString()}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleAddToCart(item)} className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
                            <ShoppingCart className="w-3 h-3" /> Add to Cart
                          </button>
                          <button onClick={() => removeItem(item.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
