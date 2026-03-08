import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
}

interface Props {
  productId: string;
  categoryId: string | null;
}

const FrequentlyBoughtTogether: React.FC<Props> = ({ productId, categoryId }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    fetchRelated();
  }, [productId]);

  const fetchRelated = async () => {
    // Try manual relations first
    const { data: relations } = await supabase
      .from("product_relations")
      .select("related_product_id")
      .eq("product_id", productId)
      .eq("relation_type", "frequently_bought")
      .limit(4);

    let relatedIds = (relations || []).map((r: any) => r.related_product_id);

    if (relatedIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, images")
        .in("id", relatedIds)
        .eq("is_active", true);
      if (data && data.length > 0) {
        const mapped = data.map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] }));
        setProducts(mapped);
        setSelected(new Set(mapped.map((p) => p.id)));
        return;
      }
    }

    // Fallback: same category products
    if (categoryId) {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, images")
        .eq("is_active", true)
        .or(`category_id.eq.${categoryId},sub_category_id.eq.${categoryId}`)
        .neq("id", productId)
        .limit(3);
      if (data) {
        const mapped = data.map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] }));
        setProducts(mapped);
        setSelected(new Set(mapped.map((p) => p.id)));
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalPrice = products.filter((p) => selected.has(p.id)).reduce((sum, p) => sum + p.price, 0);

  const handleAddAll = () => {
    const toAdd = products.filter((p) => selected.has(p.id));
    toAdd.forEach((p) => {
      addItem({ id: p.id, name: p.title, price: `₨ ${p.price.toLocaleString()}`, image: p.images[0] || "" });
    });
    toast({ title: "Added to Cart", description: `${toAdd.length} items added` });
    openCart();
  };

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">🛒 Frequently Bought Together</h2>
      <div className="glass-card p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {products.map((product, i) => (
            <React.Fragment key={product.id}>
              {i > 0 && <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => toggleSelect(product.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selected.has(product.id) ? "border-primary bg-primary/5" : "border-border opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="rounded accent-primary"
                />
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-[180px]">{product.title}</p>
                  <p className="text-primary font-bold text-sm">₨ {product.price.toLocaleString()}</p>
                </div>
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Bundle Total: </span>
            <span className="text-xl font-extrabold text-primary">₨ {totalPrice.toLocaleString()}</span>
          </div>
          <motion.button
            onClick={handleAddAll}
            disabled={selected.size === 0}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            Add {selected.size} Items to Cart
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
