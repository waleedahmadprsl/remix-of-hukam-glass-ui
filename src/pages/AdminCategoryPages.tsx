import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit2, Trash2, Tag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  created_at: string;
}

const AdminCategoryPages: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    meta_title: "",
    meta_description: "",
  });

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error("Fetch categories error:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    const slug = form.slug.trim() || generateSlug(form.name);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: form.name.trim(),
            slug: slug,
          })
          .eq("id", editingId);
        if (error) throw error;
        
        // Create or update the category page route file
        const routeContent = generateCategoryPageContent(form.name, slug, form.meta_title, form.meta_description);
        // Note: In a real implementation, you'd need a way to write to the filesystem
        // For now, we'll just show the user what the route should contain
        
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({
            name: form.name.trim(),
            slug: slug,
            parent_id: null,
            level: 0,
          });
        if (error) throw error;
        
        toast({ title: "Success", description: "Category created successfully" });
      }
      
      setForm({ name: "", slug: "", meta_title: "", meta_description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
      
    } catch (err: any) {
      console.error("Save category error:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const generateCategoryPageContent = (name: string, slug: string, metaTitle: string, metaDescription: string) => {
    return `import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ProductShowcase from "@/components/ProductShowcase";

const Category${name.replace(/[^a-zA-Z0-9]/g, '')}: React.FC = () => {
  const { slug } = useParams();
  const [category, setCategory] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slug !== "${slug}") {
      return;
    }

    const fetchCategoryData = async () => {
      try {
        // Fetch category
        const { data: categoryData } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", "${slug}")
          .single();

        if (!categoryData) return;
        setCategory(categoryData);

        // Fetch products in this category
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", categoryData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        setProducts(productsData || []);
      } catch (err) {
        console.error("Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  React.useEffect(() => {
    // Set SEO meta tags
    document.title = "${metaTitle || name + ' - HUKAM.pk'}";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "${metaDescription || 'Shop ' + name + ' products at HUKAM.pk - Pakistan\\'s fastest tech delivery'}");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = "${metaDescription || 'Shop ' + name + ' products at HUKAM.pk - Pakistan\\'s fastest tech delivery'}";
      document.head.appendChild(meta);
    }
  }, []);

  if (slug !== "${slug}") {
    return <Navigate to="/products" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ${name}
          </h1>
          <p className="text-muted-foreground">
            ${metaDescription || 'Discover the best ' + name.toLowerCase() + ' products with fast delivery across Pakistan'}
          </p>
        </motion.div>

        {products.length > 0 ? (
          <ProductShowcase
            title=""
            products={products}
            showAll={true}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category${name.replace(/[^a-zA-Z0-9]/g, '')};`;
  };

  const handleEdit = (category: Category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      meta_title: "",
      meta_description: "",
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    } catch (err: any) {
      console.error("Delete category error:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout activeTab="categories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Category SEO Pages</h1>
            <p className="text-sm text-muted-foreground">
              Manage category pages for better SEO indexing
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category Page
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-bold text-foreground mb-4">
                {editingId ? "Edit Category Page" : "Create Category Page"}
              </h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="e.g., smartphones, laptops"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /category/{form.slug || generateSlug(form.name)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder={form.name + " - HUKAM.pk"}
                    maxLength={60}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                    rows={3}
                    placeholder={"Shop " + form.name.toLowerCase() + " products at HUKAM.pk - Pakistan's fastest tech delivery"}
                    maxLength={160}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm({ name: "", slug: "", meta_title: "", meta_description: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Categories Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Loading categories...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-secondary/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{category.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          /category/{category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => window.open(`/category/${category.slug}`, '_blank')}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No categories match your search" : "No categories found"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-semibold text-foreground mb-3">SEO Category Pages Setup</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create category pages here to generate SEO-friendly routes like <code>/category/smartphones</code></p>
            <p>2. Each category page will automatically fetch and display products from that category</p>
            <p>3. Add proper meta titles and descriptions for better search engine ranking</p>
            <p>4. The system will generate the React component code - implement it manually in your routes</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoryPages;