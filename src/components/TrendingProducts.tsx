import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
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
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">🔥 Trending Products</h2>
          <button onClick={() => navigate("/products")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {products.map((p) => {
            const hasDiscount = p.compare_at_price && p.compare_at_price > p.price;
            const discount = hasDiscount ? Math.round((1 - p.price / p.compare_at_price!) * 100) : 0;
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/product/${p.id}`)}
                className="min-w-[180px] sm:min-w-[220px] snap-start glass-card overflow-hidden cursor-pointer group flex-shrink-0"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden bg-secondary/20">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SALE
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-foreground text-sm truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-bold text-sm">₨ {p.price.toLocaleString()}</span>
                    {hasDiscount && (
                      <span className="text-muted-foreground text-xs line-through">₨ {p.compare_at_price!.toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAdd(e, p)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary/10 text-primary text-xs font-medium py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
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
