import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Grid3X3 } from "lucide-react";
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

  const getRootCategory = (p: DBProduct) => p.category_id || p.sub_category_id || null;
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
    <section id="all-products" className="py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2.5 mb-2"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">All Products</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mb-6"
        >
          Everything you need, all in one place.
        </motion.p>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
          {tabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                active === cat.id
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => {
              const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
              const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compare_at_price!) * 100) : 0;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-card border border-border/40 rounded-2xl group overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-muted/20">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 relative">
                    <h3 className="font-medium text-foreground text-sm truncate">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-primary font-bold text-sm">₨ {product.price.toLocaleString()}</p>
                      {hasDiscount && <p className="text-muted-foreground text-[11px] line-through">₨ {product.compare_at_price!.toLocaleString()}</p>}
                    </div>
                    <button
                      onClick={(e) => handleAdd(e, product)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-foreground/5 text-foreground text-[11px] font-medium py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <ShoppingBag className="w-3 h-3" /> Add to Cart
                    </button>
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
