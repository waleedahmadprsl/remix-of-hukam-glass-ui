import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock: number;
}

const TrendingProducts = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, price, compare_at_price, images, stock")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts((data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
      });
  }, []);

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addItem({ id: p.id, name: p.title, price: `₨ ${p.price.toLocaleString()}`, image: p.images[0] || "" });
    toast({ title: "Added to Cart", description: p.title });
    openCart();
  };

  if (!products.length) return null;

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Trending Now</h2>
          </div>
          <button onClick={() => navigate("/products")} className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-primary transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
          {products.map((p, i) => {
            const hasDiscount = p.compare_at_price && p.compare_at_price > p.price;
            const discount = hasDiscount ? Math.round((1 - p.price / p.compare_at_price!) * 100) : 0;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/product/${p.id}`)}
                className="min-w-[160px] sm:min-w-[200px] snap-start bg-card border border-border/40 rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="relative h-36 sm:h-44 overflow-hidden bg-muted/30">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                      SALE
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground text-sm truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-primary font-bold text-sm">₨ {p.price.toLocaleString()}</span>
                    {hasDiscount && (
                      <span className="text-muted-foreground text-[11px] line-through">₨ {p.compare_at_price!.toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAdd(e, p)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-foreground/5 text-foreground text-[11px] font-medium py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <ShoppingBag className="w-3 h-3" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
