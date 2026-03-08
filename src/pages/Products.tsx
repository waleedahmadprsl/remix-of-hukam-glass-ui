import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";

interface DBProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
  is_active: boolean;
  sub_category_id: string | null;
  description: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("sub_categories").select("*"),
      ]);
      setProducts((prodRes.data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
      setCategories(catRes.data || []);
      setSubCategories(subRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryForProduct = (p: DBProduct) => {
    if (!p.sub_category_id) return null;
    const sub = subCategories.find((s) => s.id === p.sub_category_id);
    if (!sub) return null;
    return categories.find((c) => c.id === sub.category_id) || null;
  };

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "all" || getCategoryForProduct(p)?.id === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (e: React.MouseEvent, product: DBProduct) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.title,
      price: `₨ ${product.price.toLocaleString()}`,
      image: product.images[0] || "",
    });
    toast({ title: "Added to Cart", description: product.title });
    openCart();
  };

  const categoryTabs = [{ id: "all", name: "All Products" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">HUKAM Collection</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">The Vault</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Premium tech accessories with 60-minute delivery in Mirpur.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-background/80 backdrop-blur-md border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categoryTabs.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-background/60 border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground mb-6 text-center">
          {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="relative h-36 sm:h-48 overflow-hidden bg-secondary/30">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      🔥 Only {product.stock} left!
                    </span>
                  )}
                </div>
                <div className="p-4 relative">
                  <h3 className="font-semibold text-foreground text-sm">{product.title}</h3>
                  <p className="text-primary font-bold mt-1">₨ {product.price.toLocaleString()}</p>
                  <motion.div
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-3 font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    HUKAM Kijiye
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-xl text-muted-foreground">No products found. Try a different search.</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 glass-card p-10 sm:p-12 text-center rounded-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Can't Find What You Need?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Reach out for custom requests or bulk orders.</p>
          <motion.button onClick={() => navigate("/contact")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
            Contact Us
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;
