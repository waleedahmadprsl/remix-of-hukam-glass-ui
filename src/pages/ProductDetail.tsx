import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Clock, Share2, ChevronLeft, ShoppingCart, Star, Shield, Truck, Copy } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import CustomerReviews from "@/components/CustomerReviews";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import ProductQA from "@/components/ProductQA";
import RecentlyViewed, { addToRecentlyViewed } from "@/components/RecentlyViewed";
import VariantPicker from "@/components/VariantPicker";

interface DBProduct {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock: number;
  is_active: boolean;
  sub_category_id: string | null;
  category_id: string | null;
  description: string;
  video_url: string | null;
  warranty_type: string | null;
  return_policy: string | null;
  meta_title: string | null;
  meta_description: string | null;
  shop_id: string | null;
  buying_cost: number | null;
}

function parseDescription(desc: string) {
  const parts = desc.split("|||");
  const description = parts[0] || "";
  const featuresRaw = parts[1] || "";
  const specsRaw = parts[2] || "";
  const features = featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean);
  const specs = specsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [label, ...rest] = s.split(":");
      return { label: label?.trim() || "", value: rest.join(":").trim() || "" };
    })
    .filter((s) => s.label);
  return { description, features, specs };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const [product, setProduct] = React.useState<DBProduct | null>(null);
  const [related, setRelated] = React.useState<DBProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"features" | "specs">("features");
  const [selectedVariant, setSelectedVariant] = React.useState<{ id: string; variant_name: string; price: number | null; stock: number | null; sku: string | null } | null>(null);
  const [categoryName, setCategoryName] = React.useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = React.useState(false);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!id) return;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSelectedImage(0);
    setQty(1);
    fetchProduct(id);
  }, [id]);

  const fetchProduct = async (pid: string) => {
    try {
      const { data, error } = await supabase.from("products").select("id, title, price, compare_at_price, images, stock, is_active, sub_category_id, category_id, description, video_url, warranty_type, return_policy, meta_title, meta_description, shop_id, buying_cost").eq("id", pid).single();
      if (error || !data) { setProduct(null); setLoading(false); return; }
      const p = { ...data, images: Array.isArray(data.images) ? data.images as string[] : [] } as DBProduct;
      setProduct(p);
      addToRecentlyViewed(p.id);

      // Fetch category name for breadcrumbs
      if (p.category_id) {
        const { data: cat } = await supabase.from("categories").select("name").eq("id", p.category_id).single();
        setCategoryName(cat?.name || null);
      } else if (p.sub_category_id) {
        const { data: subCat } = await supabase.from("sub_categories").select("name, category_id, categories(name)").eq("id", p.sub_category_id).single();
        setCategoryName((subCat as any)?.categories?.name || subCat?.name || null);
      } else {
        setCategoryName(null);
      }

      // SEO meta
      if (p.meta_title) document.title = p.meta_title;
      else document.title = `${p.title} | HUKAM`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", p.meta_description || p.description?.slice(0, 160) || "");
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.title,
        "description": p.description?.slice(0, 300) || "",
        "image": p.images[0] || "",
        "offers": {
          "@type": "Offer",
          "price": p.price,
          "priceCurrency": "PKR",
          "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      };
      const existing = document.querySelector('script[data-product-jsonld]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-product-jsonld", "true");
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      const { data: rel } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", pid)
        .limit(4);
      setRelated((rel || []).map((r: any) => ({ ...r, images: Array.isArray(r.images) ? r.images : [] })));
    } catch (err) {
      console.error(err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Image zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
    setIsZooming(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !e.touches[0]) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
    setIsZooming(true);
  };

  // Share handler
  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.title || "Check out this product on HUKAM";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled or share failed — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Product link copied to clipboard" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            <div className="animate-pulse bg-muted rounded-3xl aspect-square" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded-xl w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded-xl w-1/2 animate-pulse" />
              <div className="h-24 bg-muted rounded-2xl animate-pulse" />
              <div className="h-12 bg-muted rounded-2xl w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass-card p-12 rounded-3xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the product you're looking for.</p>
          <motion.button onClick={() => navigate("/products")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold">
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { description, features, specs } = parseDescription(product.description || "");
  const activePrice = selectedVariant?.price ?? product.price;
  const activeStock = selectedVariant?.stock ?? product.stock;
  const stockStatus = activeStock > 20 ? "In Stock" : activeStock > 5 ? "Low Stock" : activeStock > 0 ? "Only Few Left" : "Out of Stock";
  const stockColor = activeStock > 20 ? "text-primary" : activeStock > 5 ? "text-accent-foreground" : activeStock > 0 ? "text-destructive" : "text-destructive";

  const handleAddToCart = () => {
    if (activeStock <= 0) {
      toast({ title: "Out of Stock", description: "This product is currently unavailable", variant: "destructive" });
      return;
    }
    if (qty > activeStock) {
      toast({ title: "Insufficient Stock", description: `Only ${activeStock} available`, variant: "destructive" });
      return;
    }
    const cartName = selectedVariant ? `${product.title} — ${selectedVariant.variant_name}` : product.title;
    addItem({
      id: product.id,
      name: cartName,
      price: `₨ ${activePrice.toLocaleString()}`,
      image: product.images[0] || "",
      quantity: qty,
      shopId: product.shop_id || null,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.variant_name || null,
      buyingCost: product.buying_cost || 0,
    });
    toast({ title: "Added to Cart", description: `${cartName} x${qty}` });
    openCart();
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb with Category */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/products")} className="hover:text-foreground transition-colors">Products</button>
          {categoryName && (
            <>
              <span>/</span>
              <button onClick={() => navigate(`/products?category=${product.category_id || product.sub_category_id}`)} className="hover:text-foreground transition-colors">{categoryName}</button>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left: Image Gallery with Zoom */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div
              ref={imageContainerRef}
              className="glass-card rounded-3xl overflow-hidden mb-4 relative group aspect-square cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover transition-transform duration-150"
                  style={isZooming ? zoomStyle : {}}
                />
              </AnimatePresence>
              {product.images.length > 1 && !isZooming && (
                <div className="absolute bottom-4 right-4 bg-foreground/60 text-background px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {selectedImage + 1} / {product.images.length}
                </div>
              )}
              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-foreground/20 backdrop-blur-sm text-background flex items-center justify-center hover:bg-foreground/40 transition-colors z-10"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-xl overflow-hidden w-20 h-20 border-2 transition-all ${
                      selectedImage === i ? "border-primary shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">{product.title}</h1>

            {/* Scarcity triggers */}
            {product.stock > 0 && product.stock <= 10 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full animate-pulse">
                  🔥 Only {product.stock} left in stock!
                </span>
              </div>
            )}

            {/* Price & Stock */}
            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-primary">₨ {activePrice.toLocaleString()}</span>
                {product.compare_at_price && product.compare_at_price > activePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through mb-1">₨ {product.compare_at_price.toLocaleString()}</span>
                    <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full mb-1">
                      -{Math.round((1 - activePrice / product.compare_at_price) * 100)}% OFF
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground mb-1">incl. delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeStock > 5 ? "bg-primary" : activeStock > 0 ? "bg-destructive/70" : "bg-destructive"}`} />
                <span className={`text-sm font-medium ${stockColor}`}>{stockStatus}</span>
                {activeStock > 0 && <span className="text-xs text-muted-foreground">({activeStock} units)</span>}
              </div>
            </div>

            {/* Variant Picker */}
            <VariantPicker
              productId={product.id}
              basePrice={product.price}
              baseStock={product.stock}
              onVariantSelect={(v) => setSelectedVariant(v as any)}
            />

            {/* Description */}
            {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

            {/* Tabs: Features / Specs */}
            {(features.length > 0 || specs.length > 0) && (
              <div>
                <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4">
                  {(["features", "specs"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "features" ? "Key Features" : "Specifications"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "features" ? (
                    <motion.ul key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                      {features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feat}</span>
                        </li>
                      ))}
                      {features.length === 0 && <li className="text-sm text-muted-foreground">No features listed yet.</li>}
                    </motion.ul>
                  ) : (
                    <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-3">
                      {specs.map((spec, i) => (
                        <div key={i} className="bg-secondary/30 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{spec.value}</p>
                        </div>
                      ))}
                      {specs.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No specs listed yet.</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">Quantity</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-foreground hover:bg-secondary transition-colors font-medium">−</button>
                  <div className="px-5 py-2.5 text-foreground font-bold min-w-[3rem] text-center border-x border-border">{qty}</div>
                  <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-foreground hover:bg-secondary transition-colors font-medium">+</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleAddToCart();
                    navigate("/checkout");
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 border-2 border-primary text-primary py-4 rounded-2xl font-bold text-base transition-all hover:bg-primary/5"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </motion.button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "60-Min Delivery", sub: "In Mirpur" },
                { icon: Shield, label: product.warranty_type || "Verified Product", sub: product.return_policy || "100% Genuine" },
                { icon: Check, label: "Cash on Delivery", sub: "Pay at door" },
              ].map((badge) => (
                <div key={badge.label} className="glass-card p-3 rounded-xl text-center">
                  <badge.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">{badge.label}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether productId={product.id} categoryId={product.category_id || product.sub_category_id} />

        {/* Customer Reviews */}
        <CustomerReviews productId={product.id} />

        {/* Customer Q&A */}
        <ProductQA productId={product.id} />

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((prod, i) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="h-36 sm:h-44 bg-secondary/30 overflow-hidden">
                    <img src={prod.images[0] || "/placeholder.svg"} alt={prod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{prod.title}</h3>
                    <p className="text-primary font-bold">₨ {prod.price.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
