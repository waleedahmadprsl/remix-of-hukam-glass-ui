import React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Variant {
  id: string;
  variant_name: string;
  price: number | null;
  stock: number | null;
  attributes: Record<string, string> | null;
  sku: string | null;
}

interface VariantPickerProps {
  productId: string;
  basePrice: number;
  baseStock: number;
  onVariantSelect: (variant: Variant | null) => void;
}

const VariantPicker: React.FC<VariantPickerProps> = ({ productId, basePrice, baseStock, onVariantSelect }) => {
  const [variants, setVariants] = React.useState<Variant[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    setSelected(null);
    onVariantSelect(null);
    supabase
      .from("product_variants")
      .select("id, variant_name, price, stock, attributes, sku")
      .eq("product_id", productId)
      .order("variant_name")
      .then(({ data }) => {
        const parsed = (data || []).map((v: any) => ({
          ...v,
          attributes: typeof v.attributes === "object" && v.attributes !== null ? v.attributes : null,
        }));
        setVariants(parsed);
        setLoading(false);
      });
  }, [productId]);

  if (loading || variants.length === 0) return null;

  // Group variants by attribute keys for a nice UI
  // e.g. { "Color": ["Black", "White"], "Size": ["S", "M", "L"] }
  const attributeGroups: Record<string, { value: string; variantId: string }[]> = {};
  const hasAttributes = variants.some((v) => v.attributes && Object.keys(v.attributes).length > 0);

  if (hasAttributes) {
    variants.forEach((v) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([key, value]) => {
          if (!attributeGroups[key]) attributeGroups[key] = [];
          if (!attributeGroups[key].find((a) => a.value === value)) {
            attributeGroups[key].push({ value, variantId: v.id });
          }
        });
      }
    });
  }

  const handleSelect = (variantId: string) => {
    if (selected === variantId) {
      setSelected(null);
      onVariantSelect(null);
    } else {
      setSelected(variantId);
      const v = variants.find((vr) => vr.id === variantId) || null;
      onVariantSelect(v);
    }
  };

  const selectedVariant = variants.find((v) => v.id === selected);
  const displayPrice = selectedVariant?.price ?? basePrice;
  const displayStock = selectedVariant?.stock ?? baseStock;

  // Simple chip-based selector (no attribute grouping if attributes are empty)
  if (!hasAttributes) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Variant</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isSelected = selected === v.id;
            const outOfStock = v.stock !== null && v.stock <= 0;
            return (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => !outOfStock && handleSelect(v.id)}
                disabled={outOfStock}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : outOfStock
                    ? "bg-muted/50 text-muted-foreground border-border/30 opacity-50 cursor-not-allowed line-through"
                    : "bg-secondary/50 text-foreground border-border/40 hover:border-primary/40"
                }`}
              >
                {v.variant_name}
                {v.price !== null && v.price !== basePrice && (
                  <span className="ml-1 text-xs opacity-70">₨{v.price.toLocaleString()}</span>
                )}
              </motion.button>
            );
          })}
        </div>
        {selectedVariant && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-xs text-muted-foreground"
          >
            {selectedVariant.sku && <span>SKU: {selectedVariant.sku}</span>}
            {selectedVariant.stock !== null && (
              <span className={selectedVariant.stock > 5 ? "text-primary" : "text-destructive"}>
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
              </span>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Attribute-grouped selector
  return (
    <div className="space-y-4">
      {Object.entries(attributeGroups).map(([attrKey, values]) => (
        <div key={attrKey}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{attrKey}</p>
          <div className="flex flex-wrap gap-2">
            {values.map(({ value, variantId }) => {
              const v = variants.find((vr) => vr.id === variantId)!;
              const isSelected = selected === variantId;
              const outOfStock = v.stock !== null && v.stock <= 0;
              return (
                <motion.button
                  key={variantId}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !outOfStock && handleSelect(variantId)}
                  disabled={outOfStock}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : outOfStock
                      ? "bg-muted/50 text-muted-foreground border-border/30 opacity-50 cursor-not-allowed line-through"
                      : "bg-secondary/50 text-foreground border-border/40 hover:border-primary/40"
                  }`}
                >
                  {value}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
      {selectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-xs text-muted-foreground pt-1"
        >
          <span className="font-medium text-foreground">{selectedVariant.variant_name}</span>
          {selectedVariant.sku && <span>SKU: {selectedVariant.sku}</span>}
          {selectedVariant.stock !== null && (
            <span className={selectedVariant.stock > 5 ? "text-primary" : "text-destructive"}>
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VariantPicker;
