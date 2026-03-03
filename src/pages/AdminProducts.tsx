import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Plus, Edit2, ChevronDown, ChevronUp, X } from "lucide-react";
import AdminImageOrderer from "@/components/AdminImageOrderer";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sub_category_id: string | null;
  images: string[];
  video_url?: string | null;
  is_active: boolean;
}

interface CategoryWithSubs {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categoriesWithSubs, setCategoriesWithSubs] = React.useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [filterCategory, setFilterCategory] = React.useState("");
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: 0,
    stock: 0,
    sub_category_id: "",
    video_url: "",
    key_features: "",
    specs: "",
  });
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      }));
      setProducts(mapped as Product[]);
    } catch (err: any) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: cats } = await supabase.from("categories").select("id, name");
      const { data: subs } = await supabase.from("sub_categories").select("id, name, category_id");
      const mapped = (cats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        subCategories: (subs || []).filter((s: any) => s.category_id === c.id).map((s: any) => ({ id: s.id, name: s.name })),
      }));
      setCategoriesWithSubs(mapped);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    }
  };

  const allSubCategories = categoriesWithSubs.flatMap((c) => c.subCategories.map((s) => ({ ...s, categoryName: c.name })));

  const resetForm = () => {
    setForm({ title: "", description: "", price: 0, stock: 0, sub_category_id: "", video_url: "", key_features: "", specs: "" });
    setUploadedUrls([]);
    setEditingId(null);
    setShowForm(false);
  };

  const parseDescriptionFields = (desc: string) => {
    // Try to parse structured description: description|||features|||specs
    const parts = desc.split("|||");
    return {
      description: parts[0] || "",
      key_features: parts[1] || "",
      specs: parts[2] || "",
    };
  };

  const buildDescription = () => {
    // Store as structured: description|||features|||specs
    const parts = [form.description, form.key_features, form.specs];
    if (!form.key_features && !form.specs) return form.description;
    return parts.join("|||");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      title: form.title,
      description: buildDescription(),
      price: Number(form.price),
      stock: Number(form.stock),
      sub_category_id: form.sub_category_id || null,
      images: uploadedUrls as any,
      video_url: form.video_url || null,
      is_active: true,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from("products").update(productPayload).eq("id", editingId);
        if (error) { alert("Database Error: " + error.message); return; }
        await logActivity("PRODUCT_UPDATED", `Updated product: ${form.title}`);
      } else {
        const { error } = await supabase.from("products").insert([productPayload]).select();
        if (error) { alert("Database Error: " + error.message); return; }
        await logActivity("PRODUCT_ADDED", `Added product: ${form.title}`);
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (product: Product) => {
    const parsed = parseDescriptionFields(product.description || "");
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: parsed.description,
      price: product.price,
      stock: product.stock,
      sub_category_id: product.sub_category_id || "",
      video_url: product.video_url || "",
      key_features: parsed.key_features,
      specs: parsed.specs,
    });
    setUploadedUrls(product.images || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await logActivity("PRODUCT_DELETED", `Deleted product: ${title}`);
      fetchProducts();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getSubCategoryName = (subId: string | null) => {
    if (!subId) return "Uncategorized";
    const sub = allSubCategories.find((s) => s.id === subId);
    return sub ? `${sub.categoryName} → ${sub.name}` : "Unknown";
  };

  const filteredProducts = filterCategory
    ? products.filter((p) => {
        const sub = allSubCategories.find((s) => s.id === p.sub_category_id);
        if (!sub) return false;
        const cat = categoriesWithSubs.find((c) => c.subCategories.some((s) => s.id === p.sub_category_id));
        return cat?.id === filterCategory || p.sub_category_id === filterCategory;
      })
    : products;

  return (
    <AdminLayout activeTab="products">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-extrabold text-foreground">Product Manager</h1>
          <motion.button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Close Form" : "Add Product"}
          </motion.button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="glass-card p-8 rounded-2xl mb-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Price (Rs)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Features (one per line)</label>
              <textarea value={form.key_features} onChange={(e) => setForm({ ...form, key_features: e.target.value })} rows={4} placeholder="65W Maximum Output&#10;GaN Technology&#10;USB-C Compatibility" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Specifications (label:value per line)</label>
              <textarea value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} rows={4} placeholder="Output:65W Maximum&#10;Technology:GaN&#10;Port:USB-C" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category → Sub-category</label>
                <select value={form.sub_category_id} onChange={(e) => setForm({ ...form, sub_category_id: e.target.value })} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg">
                  <option value="">Select category</option>
                  {categoriesWithSubs.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.subCategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <AdminImageOrderer
              images={uploadedUrls}
              onChange={setUploadedUrls}
              videoUrl={form.video_url}
              onVideoChange={(url) => setForm((f) => ({ ...f, video_url: url }))}
            />

            <div className="flex gap-4">
              <motion.button type="submit" whileHover={{ scale: 1.02 }} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold">
                {editingId ? "Update Product" : "Add Product"}
              </motion.button>
              <motion.button type="button" onClick={resetForm} whileHover={{ scale: 1.02 }} className="flex-1 bg-secondary text-foreground py-3 rounded-lg font-semibold">
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-background border border-border/40 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categoriesWithSubs.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found. Add your first product above.</div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{product.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{getSubCategoryName(product.sub_category_id)}</p>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span className="text-primary font-semibold">Rs.{product.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">Stock: {product.stock}</span>
                      <span className={`text-xs font-medium ${product.is_active ? "text-green-600" : "text-destructive"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button onClick={() => handleEdit(product)} whileHover={{ scale: 1.05 }} className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button onClick={() => handleDeleteProduct(product.id, product.title)} whileHover={{ scale: 1.05 }} className="p-2 bg-destructive/10 text-destructive rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminProducts;
