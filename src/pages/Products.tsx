import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, SlidersHorizontal, Heart, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/hooks/use-toast";
import ProductFilterSidebar, { type FilterState } from "@/components/ProductFilterSidebar";
import { useProductRatings, StarRating } from "@/hooks/useProductRatings";
import BlurImage from "@/components/BlurImage";

interface DBProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
  is_active: boolean;
  sub_category_id: string | null;
  category_id: string | null;
  description: string;
  compare_at_price: number | null;
  tags: string[] | null;
  shop_id: string | null;
  buying_cost: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

type SortOption = "newest" | "price-asc" | "price-desc";

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { openCart } = useMiniCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const ratings = useProductRatings();
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 50000,
    categories: searchParams.get("category") ? [searchParams.get("category")!] : [],
    minRating: 0,
    tags: [],
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (filters.categories.length === 1) params.category = filters.categories[0];
    setSearchParams(params, { replace: true });
  }, [search, filters.categories]);

  // Reset page when filters/search/sort change
  useEffect(() => { setPage(0); }, [search, filters, sort]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("id, title, price, images, stock, is_active, sub_category_id, category_id, description, compare_at_price, tags, shop_id, buying_cost").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, slug, parent_id"),
      ]);
      setProducts((prodRes.data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [], tags: Array.isArray(p.tags) ? p.tags : [] })));
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allTags = [...new Set(products.flatMap((p) => p.tags || []))].filter(Boolean);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchPrice = p.price >= filters.minPrice && (filters.maxPrice >= 50000 || p.price <= filters.maxPrice);
    const matchCat = filters.categories.length === 0 || filters.categories.includes(p.category_id || "") || filters.categories.includes(p.sub_category_id || "");
    const matchTags = filters.tags.length === 0 || filters.tags.some((t) => (p.tags || []).includes(t));
    return matchSearch && matchPrice && matchCat && matchTags;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0; // newest — already sorted by created_at desc from DB
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const goPage = (p: number) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToCart = (e: React.MouseEvent, product: DBProduct) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.title,
      price: `₨ ${product.price.toLocaleString()}`,
      image: product.images[0] || "",
      shopId: product.shop_id || null,
      buyingCost: product.buying_cost || 0,
    });
    toast({ title: "Added to Cart", description: product.title });
    openCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: DBProduct) => {
    e.stopPropagation();
    toggleItem({ id: product.id, title: product.title, price: product.price, image: product.images[0] || "" });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">HUKAM Collection</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4 font-display">All Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Premium tech accessories with 60-minute delivery in Mirpur.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-4xl mx-auto mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="Search products, tags, descriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-background/80 backdrop-blur-md border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          {/* Sort dropdown */}
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="appearance-none pl-10 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground text-sm font-medium focus:outline-none focus:border-primary cursor-pointer">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/40">
                <div className="h-48 sm:h-56 bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p ref={gridRef} className="text-sm text-muted-foreground mb-6 text-center">
            {`${sorted.length} product${sorted.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        <div className="flex gap-8 max-w-7xl mx-auto">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilterSidebar categories={categories.filter((c) => !c.parent_id)} allTags={allTags} filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {paged.map((product, i) => {
                  const r = ratings[product.id];
                  const wishlisted = isInWishlist(product.id);
                  return (
                    <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: i * 0.03 }} whileHover={{ y: -6 }} onClick={() => navigate(`/product/${product.id}`)} className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-secondary/30">
                        {product.images[0] ? (
                          <BlurImage src={product.images[0]} alt={product.title} className="h-full w-full transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                          </span>
                        )}
                        {product.stock > 0 && product.stock <= 5 && (
                          <span className="absolute top-2 right-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            🔥 {product.stock} left
                          </span>
                        )}
                        {/* Wishlist Heart */}
                        <button
                          onClick={(e) => handleWishlistToggle(e, product)}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlisted ? "bg-destructive/90 text-destructive-foreground" : "bg-foreground/20 backdrop-blur-sm text-background hover:bg-foreground/40"}`}
                          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      <div className="p-4 relative">
                        <h3 className="font-semibold text-foreground text-sm">{product.title}</h3>
                        {r && <StarRating avg={r.avg} count={r.count} size="xs" />}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-primary font-bold">₨ {product.price.toLocaleString()}</p>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <p className="text-xs text-muted-foreground line-through">₨ {product.compare_at_price.toLocaleString()}</p>
                          )}
                        </div>
                        {/* Desktop: slide-up on hover */}
                        <motion.div onClick={(e) => handleAddToCart(e, product)} className="hidden sm:flex absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground items-center justify-center gap-2 py-3 font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer">
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </motion.div>
                        {/* Mobile: always visible */}
                        <button onClick={(e) => handleAddToCart(e, product)} className="sm:hidden mt-2.5 w-full flex items-center justify-center gap-1.5 bg-foreground/5 text-foreground text-[11px] font-medium py-2 rounded-lg active:bg-primary active:text-primary-foreground transition-all">
                          <ShoppingBag className="w-3 h-3" /> Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => goPage(page - 1)} disabled={page === 0} className="w-9 h-9 rounded-full bg-secondary text-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  // Show max 5 page buttons around current
                  if (totalPages <= 7 || Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1) {
                    return (
                      <button key={i} onClick={() => goPage(i)} className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${i === page ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/10"}`}>
                        {i + 1}
                      </button>
                    );
                  }
                  if (i === 1 && page > 3) return <span key={i} className="text-muted-foreground">…</span>;
                  if (i === totalPages - 2 && page < totalPages - 4) return <span key={i} className="text-muted-foreground">…</span>;
                  return null;
                })}
                <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1} className="w-9 h-9 rounded-full bg-secondary text-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!loading && sorted.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-xl font-semibold text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">Try a different search or adjust your filters to discover more.</p>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileFilters(false)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-background z-50 overflow-y-auto shadow-2xl">
                <ProductFilterSidebar categories={categories.filter((c) => !c.parent_id)} allTags={allTags} filters={filters} onFiltersChange={setFilters} onClose={() => setShowMobileFilters(false)} isMobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 glass-card p-10 sm:p-12 text-center rounded-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-display">Can't Find What You Need?</h2>
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
