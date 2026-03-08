import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Headphones,
  BatteryCharging,
  Cable,
  Smartphone,
  Monitor,
  Package,
} from "lucide-react";

const fallbackIcons = [Headphones, BatteryCharging, Cable, Smartphone, Monitor, Package];

interface Cat {
  id: string;
  name: string;
}

const CategoryBubbles = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Cat[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .is("parent_id", null)
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  if (!categories.length) return null;

  return (
    <section className="py-5 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {categories.map((cat, i) => {
            const Icon = fallbackIcons[i % fallbackIcons.length];
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="flex flex-col items-center gap-2 min-w-[68px] group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/50 border border-border/30 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/8 group-hover:shadow-md group-hover:shadow-primary/8 transition-all duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryBubbles;
