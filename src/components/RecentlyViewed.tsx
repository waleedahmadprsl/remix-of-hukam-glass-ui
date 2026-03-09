import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "hukam_recently_viewed";
const MAX_ITEMS = 10;

export const addToRecentlyViewed = (productId: string) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const updated = [productId, ...stored.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
};

export const getRecentlyViewedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
  } catch {
    return [];
  }
};

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
}

interface RecentlyViewedProps {
  excludeId?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ excludeId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const ids = getRecentlyViewedIds().filter((id) => id !== excludeId);
    if (ids.length === 0) return;

    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, images")
        .in("id", ids.slice(0, 8))
        .eq("is_active", true);

      if (data) {
        const mapped = data.map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] }));
        // Preserve order from localStorage
        const ordered = ids
          .map((id) => mapped.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setProducts(ordered);
      }
    };
    fetchProducts();
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recently Viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group snap-start flex-shrink-0 w-[160px] sm:w-[200px]"
          >
            <div className="h-32 sm:h-40 bg-secondary/30 overflow-hidden">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">{product.title}</h3>
              <p className="text-primary font-bold text-sm">₨ {product.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
