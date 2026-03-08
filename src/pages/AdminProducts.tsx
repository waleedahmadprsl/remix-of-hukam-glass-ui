import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Plus, Edit2, X, Search } from "lucide-react";
import AdminImageOrderer from "@/components/AdminImageOrderer";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id: string | null;
  sub_category_id: string | null;
  images: string[];
  video_url?: string | null;
  is_active: boolean;
  status?: string;
  tags?: string[];
  shop_id?: string | null;
  buying_cost?: number;
  compare_at_price?: number;
  auto_sku?: string | null;
}

interface Category { id: string; name: string; parent_id: string | null; level: number; }
interface Shop { id: string; name: string; sku_prefix: string; }

const AdminProducts: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [filterCategory, setFilterCategory] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = React.useState("");

  const [form, setForm] = React.useState({
    title: "", description: "", price: 0, stock: 0, category_id: "", video_url: "",
    key_features: "", specs: "", status: "active", tags: [] as string[],
    shop_id: "", buying_cost: 0, compare_at_price: 0,
    weight_kg: 0, dimensions_l: 0, dimensions_w: 0, dimensions_h: 0,
    warranty_type: "", return_policy: "7-day return",
    meta_title: "", meta_description: "", search_keywords: [] as string[],
  });
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");

  React.useEffect(() => { fetchProducts(); fetchCategories(); fetchShops(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [], tags: Array.isArray(p.tags) ? p.tags : [] })) as Product[]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, parent_id, level");
    setCategories((data as Category[]) || []);
  };

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("id, name, sku_prefix");
    setShops((data as Shop[]) || []);
  };

  const getCategoryPath = (catId: string | null): string => {
    if (!catId) return "Uncategorized";
    const parts: string[] = [];
    let current = categories.find((c) => c.id === catId);
    while (current) { parts.unshift(current.name); current = current.parent_id ? categories.find((c) => c.id === current!.parent_id) : undefined; }
    return parts.join(" → ") || "Unknown";
  };

  const buildCategoryOptions = (parentId: string | null = null, depth: number = 0): { id: string; label: string }[] => {
    return categories.filter((c) => c.parent_id === parentId).flatMap((c) => [
      { id: c.id, label: "—".repeat(depth) + " " + c.name },
      ...buildCategoryOptions(c.id, depth + 1),
    ]);
  };
  const categoryOptions = buildCategoryOptions();

  const generateSku = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return "";
    const count = products.filter((p) => p.shop_id === shopId).length + 1;
    return `${shop.sku_prefix}-${String(count).padStart(3, "0")}`;
  };

  const resetForm = () => {
    setForm({ title: "", description: "", price: 0, stock: 0, category_id: "", video_url: "", key_features: "", specs: "", status: "active", tags: [], shop_id: "", buying_cost: 0, compare_at_price: 0, weight_kg: 0, dimensions_l: 0, dimensions_w: 0, dimensions_h: 0, warranty_type: "", return_policy: "7-day return", meta_title: "", meta_description: "", search_keywords: [] });
    setUploadedUrls([]); setEditingId(null); setShowForm(false); setTagInput(""); setSeoKeywordInput("");
  };
  const [seoKeywordInput, setSeoKeywordInput] = React.useState("");
  const addSeoKeyword = () => { if (seoKeywordInput.trim() && !form.search_keywords.includes(seoKeywordInput.trim())) { setForm({ ...form, search_keywords: [...form.search_keywords, seoKeywordInput.trim()] }); setSeoKeywordInput(""); } };

  const parseDescription = (desc: string) => { const parts = desc.split("|||"); return { description: parts[0] || "", key_features: parts[1] || "", specs: parts[2] || "" }; };
  const buildDescription = () => { if (!form.key_features && !form.specs) return form.description; return [form.description, form.key_features, form.specs].join("|||"); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const autoSku = form.shop_id ? generateSku(form.shop_id) : null;
    const payload: any = {
      title: form.title, description: buildDescription(), price: Number(form.price), stock: Number(form.stock),
      category_id: form.category_id || null, sub_category_id: form.category_id || null,
      images: uploadedUrls, video_url: form.video_url || null, is_active: form.status === "active",
      status: form.status, tags: form.tags,
      shop_id: form.shop_id || null, buying_cost: Number(form.buying_cost), compare_at_price: Number(form.compare_at_price),
      auto_sku: editingId ? undefined : autoSku,
      weight_kg: Number(form.weight_kg) || 0, dimensions_l: Number(form.dimensions_l) || 0,
      dimensions_w: Number(form.dimensions_w) || 0, dimensions_h: Number(form.dimensions_h) || 0,
      warranty_type: form.warranty_type || "", return_policy: form.return_policy || "",
      meta_title: form.meta_title || "", meta_description: form.meta_description || "",
      search_keywords: form.search_keywords,
    };
    if (editingId && payload.auto_sku === undefined) delete payload.auto_sku;
    try {
      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) { alert(error.message); return; }
        await logActivity("PRODUCT_UPDATED", `Updated: ${form.title}`);
      } else {
        const { error } = await supabase.from("products").insert([payload]).select();
        if (error) { alert(error.message); return; }
        await logActivity("PRODUCT_ADDED", `Added: ${form.title}`);
      }
      resetForm(); fetchProducts();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (p: Product) => {
    const parsed = parseDescription(p.description || "");
    setEditingId(p.id);
    setForm({ title: p.title, description: parsed.description, price: p.price, stock: p.stock, category_id: p.category_id || p.sub_category_id || "", video_url: p.video_url || "", key_features: parsed.key_features, specs: parsed.specs, status: p.status || (p.is_active ? "active" : "draft"), tags: p.tags || [], shop_id: p.shop_id || "", buying_cost: p.buying_cost || 0, compare_at_price: p.compare_at_price || 0, weight_kg: (p as any).weight_kg || 0, dimensions_l: (p as any).dimensions_l || 0, dimensions_w: (p as any).dimensions_w || 0, dimensions_h: (p as any).dimensions_h || 0, warranty_type: (p as any).warranty_type || "", return_policy: (p as any).return_policy || "7-day return", meta_title: (p as any).meta_title || "", meta_description: (p as any).meta_description || "", search_keywords: (p as any).search_keywords || [] });
    setUploadedUrls(p.images || []); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    await logActivity("PRODUCT_DELETED", `Deleted: ${title}`); fetchProducts();
  };

  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput(""); } };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (bulkAction === "delete") { if (!confirm(`Delete ${ids.length} products?`)) return; for (const id of ids) await supabase.from("products").delete().eq("id", id); }
    else { const update: any = {}; if (bulkAction === "active") { update.status = "active"; update.is_active = true; } if (bulkAction === "draft") { update.status = "draft"; update.is_active = false; } if (bulkAction === "archived") { update.status = "archived"; update.is_active = false; } for (const id of ids) await supabase.from("products").update(update).eq("id", id); }
    setSelectedIds(new Set()); setBulkAction(""); fetchProducts();
  };

  const filtered = products.filter((p) => {
    if (filterCategory && p.category_id !== filterCategory && p.sub_category_id !== filterCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map((p) => p.id))); };

  const profitMargin = (price: number, cost: number) => {
    if (!price || !cost) return null;
    return Math.round(((price - cost) / price) * 100);
  };

  return (
    <AdminLayout activeTab="products">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Products</h1>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> {showForm ? "Close" : "Add Product"}
          </button>
        </div>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="glass-card p-5 sm:p-8 rounded-2xl mb-8 space-y-4">
            <div className="flex justify-between"><h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Product" : "Add Product"}</h2><button type="button" onClick={resetForm}><X className="w-5 h-5 text-muted-foreground" /></button></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Shop / Vendor</label>
                <select value={form.shop_id} onChange={(e) => setForm({ ...form, shop_id: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg">
                  <option value="">No shop (own product)</option>
                  {shops.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.sku_prefix})</option>)}
                </select>
              </div>
            </div>

            <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
            <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Features (one per line)</label><textarea value={form.key_features} onChange={(e) => setForm({ ...form, key_features: e.target.value })} rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
            <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Specifications (label:value per line)</label><textarea value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>

            {/* Pricing Section */}
            <div className="p-4 bg-primary/5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-foreground">💰 Pricing & Cost (Admin Only)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Selling Price (Rs)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Buying Cost (COGS)</label>
                  <input type="number" value={form.buying_cost} onChange={(e) => setForm({ ...form, buying_cost: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Compare-at Price</label>
                  <input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: Number(e.target.value) })} placeholder="Strikethrough price" className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
                </div>
              </div>
              {form.price > 0 && form.buying_cost > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Profit: <strong className="text-primary">Rs.{(form.price - form.buying_cost).toLocaleString()}</strong></span>
                  <span className="text-muted-foreground">Margin: <strong className={`${profitMargin(form.price, form.buying_cost)! >= 30 ? "text-green-600" : "text-orange-600"}`}>{profitMargin(form.price, form.buying_cost)}%</strong></span>
                </div>
              )}
              {form.compare_at_price > 0 && form.compare_at_price > form.price && (
                <p className="text-xs text-primary font-semibold">🏷️ SALE badge will show: <span className="line-through text-muted-foreground">Rs.{form.compare_at_price}</span> → Rs.{form.price} ({Math.round((1 - form.price / form.compare_at_price) * 100)}% OFF)</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg">
                  <option value="">Select category</option>
                  {categoryOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg">
                  <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {t} <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="New Arrival, Bestseller..." className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-secondary text-foreground rounded-lg text-sm">Add</button>
              </div>
            </div>

            <AdminImageOrderer images={uploadedUrls} onChange={setUploadedUrls} videoUrl={form.video_url} onVideoChange={(url) => setForm((f) => ({ ...f, video_url: url }))} />

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold">{editingId ? "Update" : "Add Product"}</button>
              <button type="button" onClick={resetForm} className="flex-1 bg-secondary text-foreground py-3 rounded-lg font-semibold">Cancel</button>
            </div>
          </motion.form>
        )}

        {/* Filters & Bulk Actions */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm">
            <option value="">All Categories</option>
            {categoryOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm">
                <option value="">Bulk Action ({selectedIds.size})</option>
                <option value="active">Set Active</option><option value="draft">Set Draft</option><option value="archived">Archive</option><option value="delete">Delete</option>
              </select>
              <button onClick={handleBulkAction} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">Apply</button>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{filtered.length} products</span>
        </div>

        {loading ? <div className="text-center py-12">Loading...</div> : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground">No products found.</div> : (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" /> Select All
            </label>
            {filtered.map((p) => {
              const margin = profitMargin(p.price, p.buying_cost || 0);
              const shopName = p.shop_id ? shops.find((s) => s.id === p.shop_id)?.name : null;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded flex-shrink-0" />
                  {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{getCategoryPath(p.category_id || p.sub_category_id)} {shopName ? `· ${shopName}` : ""}</p>
                    <div className="flex gap-2 sm:gap-4 mt-1 text-xs sm:text-sm flex-wrap">
                      <span className="text-primary font-semibold">Rs.{p.price.toLocaleString()}</span>
                      {p.buying_cost ? <span className="text-muted-foreground">Cost: Rs.{p.buying_cost.toLocaleString()}</span> : null}
                      {margin !== null && margin > 0 && <span className={`font-semibold ${margin >= 30 ? "text-green-600" : "text-orange-600"}`}>{margin}% margin</span>}
                      <span className="text-muted-foreground">Stock: {p.stock}</span>
                      <span className={`text-xs font-medium capitalize ${p.status === "active" ? "text-green-600" : p.status === "draft" ? "text-yellow-600" : "text-muted-foreground"}`}>{p.status || "active"}</span>
                      {p.compare_at_price && p.compare_at_price > p.price ? <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded-full font-semibold">SALE</span> : null}
                      {p.auto_sku && <span className="text-[10px] font-mono text-muted-foreground">{p.auto_sku}</span>}
                      {p.tags?.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{t}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(p)} className="p-2 bg-primary/10 text-primary rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id, p.title)} className="p-2 bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminProducts;
