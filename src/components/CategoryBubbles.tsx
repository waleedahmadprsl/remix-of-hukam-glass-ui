import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
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
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {categories.map((cat, i) => {
            const Icon = fallbackIcons[i % fallbackIcons.length];
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/60 backdrop-blur-md border border-border/40 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
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
