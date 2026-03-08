import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";

interface DBProduct {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string | null;
  sub_category_id: string | null;
}

interface Category { id: string; name: string; parent_id: string | null; }

const AllProducts = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState("All");

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id, title, price, compare_at_price, images, category_id, sub_category_id").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, parent_id").is("parent_id", null),
    ]).then(([pRes, cRes]) => {
      setProducts((pRes.data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
      setCategories(cRes.data || []);
    });
  }, []);

  const getRootCategory = (p: DBProduct) => {
    return p.category_id || p.sub_category_id || null;
  };

  const filtered = active === "All" ? products : products.filter((p) => getRootCategory(p) === active);

  const handleAdd = (e: React.MouseEvent, p: DBProduct) => {
    e.stopPropagation();
    addItem({ id: p.id, name: p.title, price: `₨ ${p.price.toLocaleString()}`, image: p.images[0] || "" });
    toast({ title: "Added to Cart", description: p.title });
    openCart();
  };

  const tabs = [{ id: "All", name: "All" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  if (products.length === 0) return null;

  return (
    <section id="all-products" className="py-20 brand-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          Explore the Vault
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center text-muted-foreground mb-10">
          Everything you need, all in one place.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((cat) => (
            <button key={cat.id} onClick={() => setActive(cat.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${active === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background/60 text-muted-foreground border-border/50 hover:border-primary/40"}`}>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => {
              const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
              const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compare_at_price!) * 100) : 0;
              return (
                <motion.div
                  key={product.id} layout
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
                >
                  <div className="relative h-32 sm:h-44 overflow-hidden bg-secondary/30">
                    <img src={product.images[0] || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="p-4 relative">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-primary font-bold text-sm">₨ {product.price.toLocaleString()}</p>
                      {hasDiscount && <p className="text-muted-foreground text-xs line-through">₨ {product.compare_at_price!.toLocaleString()}</p>}
                    </div>
                    <motion.div
                      onClick={(e) => handleAdd(e, product)}
                      className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 font-medium text-xs sm:text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> HUKAM Kijiye
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
