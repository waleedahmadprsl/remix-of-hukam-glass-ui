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
  images: string[];
  sub_category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const AllProducts = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; category_id: string }[]>([]);
  const [active, setActive] = useState("All");

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id, title, price, images, sub_category_id").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
      supabase.from("sub_categories").select("id, category_id"),
    ]).then(([pRes, cRes, sRes]) => {
      setProducts((pRes.data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
      setCategories(cRes.data || []);
      setSubCategories(sRes.data || []);
    });
  }, []);

  const getCatId = (p: DBProduct) => {
    if (!p.sub_category_id) return null;
    const sub = subCategories.find((s) => s.id === p.sub_category_id);
    return sub?.category_id || null;
  };

  const filtered = active === "All" ? products : products.filter((p) => getCatId(p) === active);

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
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                active === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background/60 text-muted-foreground border-border/50 hover:border-primary/40"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
              >
                <div className="relative h-32 sm:h-44 overflow-hidden bg-secondary/30">
                  <img src={product.images[0] || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{product.title}</h3>
                  <p className="text-primary font-bold mt-1 text-sm">₨ {product.price.toLocaleString()}</p>
                  <motion.div
                    onClick={(e) => handleAdd(e, product)}
                    className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 font-medium text-xs sm:text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    HUKAM Kijiye
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
