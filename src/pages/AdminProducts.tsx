import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Plus, Edit2 } from "lucide-react";
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
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [subCategories, setSubCategories] = React.useState<{id:string;name:string}[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: 0,
    stock: 0,
    sub_category_id: "",
    video_url: "",
  });
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchProducts();
    fetchSubCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      // Cast images from Json to string[]
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

  const fetchSubCategories = async () => {
    try {
      const { data, error } = await supabase.from("sub_categories").select("id,name");
      if (error) throw error;
      setSubCategories((data as any[]) || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err.message);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", price: 0, stock: 0, sub_category_id: "", video_url: "" });
    setUploadedUrls([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      title: form.title,
      description: form.description,
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
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sub_category_id: product.sub_category_id || "",
      video_url: product.video_url || "",
    });
    setUploadedUrls(product.images || []);
    setShowForm(true);
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

  return (
    <AdminLayout activeTab="products">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-foreground">Product Manager</h1>
          <motion.button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="glass-card p-8 rounded-2xl mb-8 space-y-4"
          >
            <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Product" : "Add New Product"}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title</label>
                <input type="text" placeholder="Product Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Price (Rs)</label>
                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</label>
              <textarea placeholder="Product description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock (Quantity)</label>
                <input type="number" placeholder="Quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sub-category</label>
                <select value={form.sub_category_id} onChange={(e) => setForm({ ...form, sub_category_id: e.target.value })} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg">
                  <option value="">Select sub-category</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
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

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {product.images && product.images[0] && (
                    <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded-md" />
                  )}
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-primary font-semibold">Rs.{product.price}</span>
                      <span className="text-muted-foreground">Stock: {product.stock}</span>
                      <span className="text-muted-foreground">{product.images?.length || 0} images</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
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
