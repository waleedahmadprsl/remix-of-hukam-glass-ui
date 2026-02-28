import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Plus, Edit2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sub_category_id: string;
  images: string[];
  video_url?: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [subCategories, setSubCategories] = React.useState<{id:string;name:string}[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    price: 0,
    stock: 0,
    sub_category_id: "",
    video_url: "",
  });
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    fetchProducts();
    fetchSubCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      setProducts(data || []);
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
      setSubCategories(data || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err.message);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      sub_category_id: form.sub_category_id,
      images: uploadedUrls,
      video_url: form.video_url || null,
      is_active: true,
    };

    try {
      const { data, error } = await supabase.from("products").insert([productPayload]).select();
      if (error) {
        console.error("Supabase Insert Error:", error);
        alert("Error saving to database: " + error.message);
        return;
      }

      await logActivity("PRODUCT_ADDED", `Added product: ${form.title}`);
      setForm({ title: "", description: "", price: 0, stock: 0, sub_category_id: "", video_url: "" });
      setUploadedUrls([]);
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Unexpected error during product insert", err);
      alert(`Error: ${err.message}`);
    }
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
            onClick={() => setShowForm(!showForm)}
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
            onSubmit={handleAddProduct}
            className="glass-card p-8 rounded-2xl mb-8 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="px-4 py-3 bg-background border border-border/40 rounded-lg"
              />
              <input
                type="number"
                placeholder="Price (Rs)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
                className="px-4 py-3 bg-background border border-border/40 rounded-lg"
              />
            </div>

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Quantity (stock)"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                required
                className="px-4 py-3 bg-background border border-border/40 rounded-lg"
              />
              <select
                value={form.sub_category_id}
                onChange={(e) => setForm({ ...form, sub_category_id: e.target.value })}
                required
                className="px-4 py-3 bg-background border border-border/40 rounded-lg"
              >
                <option value="">Select sub-category</option>
                {subCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-foreground mb-1">Product Images</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                console.log("files dropped", files);
                if (files.length === 0) return;
                setUploading(true);
                for (const file of files) {
                  try {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const { data, error } = await supabase.storage
                      .from("product-media")
                      .upload(fileName, file);
                    if (error) throw error;
                    const {
                      data: { publicUrl },
                    } = await supabase.storage.from("product-media").getPublicUrl(data.path);
                    if (file.type.startsWith("video")) {
                      setForm((f) => ({ ...f, video_url: publicUrl }));
                    } else {
                      setUploadedUrls((u) => [...u, publicUrl]);
                    }
                  } catch (err) {
                    console.error("upload error", err);
                    alert("Upload error: " + (err as any).message);
                  }
                }
                setUploading(false);
              }}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center cursor-pointer"
            >
              Drag & drop images or video here, or click to select
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                ref={inputRef}
                onChange={async (e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  if (files.length === 0) return;
                  setUploading(true);
                  for (const file of files) {
                    try {
                      const fileExt = file.name.split(".").pop();
                      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                      const { data, error } = await supabase.storage
                        .from("product-media")
                        .upload(fileName, file);
                      if (error) throw error;
                      const {
                        data: { publicUrl },
                      } = await supabase.storage.from("product-media").getPublicUrl(data.path);
                      if (file.type.startsWith("video")) {
                        setForm((f) => ({ ...f, video_url: publicUrl }));
                      } else {
                        setUploadedUrls((u) => [...u, publicUrl]);
                      }
                    } catch (err) {
                      console.error("upload error", err);
                      alert("Upload error: " + (err as any).message);
                    }
                  }
                  setUploading(false);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {uploadedUrls.map((url, idx) => (
                <img key={idx} src={url} alt="uploaded" className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          </div>


            <div className="flex gap-4">
              <motion.button
                type="submit"
                disabled={uploading}
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Add Product"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-secondary text-foreground py-3 rounded-lg font-semibold"
              >
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
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-brand-blue font-semibold">Rs.{product.price}</span>
                      <span className="text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 bg-primary/10 text-primary rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteProduct(product.id, product.title)}
                    whileHover={{ scale: 1.05 }}
                    className="p-2 bg-destructive/10 text-destructive rounded-lg"
                  >
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
