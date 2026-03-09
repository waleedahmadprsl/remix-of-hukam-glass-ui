import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";

interface DBProduct {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
}

const ProductShowcase = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = useState<DBProduct[]>([]);

  // Loading managed below in the skeleton section

  const handleAdd = (e: React.MouseEvent, p: DBProduct) => {
    e.stopPropagation();
    addItem({ id: p.id, name: p.title, price: `₨ ${p.price.toLocaleString()}`, image: p.images[0] || "" });
    toast({ title: "Added to Cart", description: p.title });
    openCart();
  };

  const [loading, setLoading] = useState(true);

  // Update the useEffect to track loading
  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("id, title, price, compare_at_price, images")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setProducts((data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
        setLoading(false);
      });
  }, []);

  if (!loading && products.length === 0) return null;

  const SkeletonCard = () => (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
      </div>
    </div>
  );

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
          Trending in Mirpur
        </motion.h2>

        {loading ? (
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
              {products.map((p, i) => (
                <div key={p.id} className="min-w-[75vw] snap-center">
                  <Card product={p} i={i} onAdd={handleAdd} />
                </div>
              ))}
            </div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {products.map((p, i) => (
                <Card key={p.id} product={p} i={i} onAdd={handleAdd} />
              ))}
            </div>
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex justify-center mt-14">
          <motion.button onClick={() => navigate("/products")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="glass-pill font-semibold text-foreground border border-primary/30 px-8 py-3 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center gap-2">
            View All HUKAM Products
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({ product, i, onAdd }: { product: DBProduct; i: number; onAdd: (e: React.MouseEvent, p: DBProduct) => void }) => {
  const navigate = useNavigate();
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compare_at_price!) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
    >
      <div className="relative h-48 overflow-hidden bg-secondary/30">
        <img src={product.images[0] || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>
      <div className="p-5 relative">
        <h3 className="font-semibold text-foreground">{product.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-primary font-bold">₨ {product.price.toLocaleString()}</p>
          {hasDiscount && (
            <p className="text-muted-foreground text-sm line-through">₨ {product.compare_at_price!.toLocaleString()}</p>
          )}
        </div>
        <motion.div
          onClick={(e) => onAdd(e, product)}
          className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-3 font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductShowcase;
