import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Edit2, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subCategories, setSubCategories] = React.useState<SubCategory[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newSubName, setNewSubName] = React.useState("");
  const [selectedCat, setSelectedCat] = React.useState<string>("");

  const [editingCatId, setEditingCatId] = React.useState<string | null>(null);
  const [editingCatName, setEditingCatName] = React.useState("");
  const [editingSubId, setEditingSubId] = React.useState<string | null>(null);
  const [editingSubName, setEditingSubName] = React.useState("");
  const [editingSubCat, setEditingSubCat] = React.useState<string>("");

  React.useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: cats, error: catErr } = await supabase.from("categories").select("*");
      if (catErr) throw catErr;
      setCategories(cats || []);

      const { data: subs, error: subErr } = await supabase.from("sub_categories").select("*");
      if (subErr) throw subErr;
      setSubCategories(subs || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase.from("categories").insert({ name: newCategoryName });
      if (error) throw error;
      await logActivity("CATEGORY_ADDED", `Added category ${newCategoryName}`);
      setNewCategoryName("");
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category ${name}?`)) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await logActivity("CATEGORY_DELETED", `Deleted category ${name}`);
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    try {
      const { error } = await supabase.from("categories").update({ name: editingCatName }).eq("id", id);
      if (error) throw error;
      await logActivity("CATEGORY_UPDATED", `Updated category ${editingCatName}`);
      setEditingCatId(null);
      setEditingCatName("");
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addSubCategory = async () => {
    if (!newSubName.trim() || !selectedCat) return;
    try {
      const { error } = await supabase.from("sub_categories").insert({ name: newSubName, category_id: selectedCat });
      if (error) throw error;
      await logActivity("SUBCATEGORY_ADDED", `Added subcategory ${newSubName}`);
      setNewSubName("");
      setSelectedCat("");
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteSubCategory = async (id: string, name: string) => {
    if (!confirm(`Delete sub-category ${name}?`)) return;
    try {
      const { error } = await supabase.from("sub_categories").delete().eq("id", id);
      if (error) throw error;
      await logActivity("SUBCATEGORY_DELETED", `Deleted subcategory ${name}`);
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateSubCategory = async (id: string) => {
    if (!editingSubName.trim() || !editingSubCat) return;
    try {
      const { error } = await supabase
        .from("sub_categories")
        .update({ name: editingSubName, category_id: editingSubCat })
        .eq("id", id);
      if (error) throw error;
      await logActivity("SUBCATEGORY_UPDATED", `Updated subcategory ${editingSubName}`);
      setEditingSubId(null);
      setEditingSubName("");
      setEditingSubCat("");
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout activeTab="categories">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Categories Manager</h1>

        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">Main Categories</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="px-4 py-2 bg-background border border-border/40 rounded-lg flex-1"
            />
            <button onClick={addCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between">
                {editingCatId === cat.id ? (
                  <>
                    <input
                      className="px-2 py-1 bg-background border border-border/40 rounded-lg flex-1"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => updateCategory(cat.id)} className="text-green-600">
                        <Save />
                      </button>
                      <button onClick={() => setEditingCatId(null)} className="text-gray-600">
                        <X />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        className="text-blue-600"
                      >
                        <Edit2 />
                      </button>
                      <button onClick={() => deleteCategory(cat.id, cat.name)} className="text-red-600">
                        <Trash2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">Sub-Categories</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-4 py-2 bg-background border border-border/40 rounded-lg"
            >
              <option value="">Select main category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="New sub-category name"
              className="px-4 py-2 bg-background border border-border/40 rounded-lg flex-1"
            />
            <button onClick={addSubCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {subCategories.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                {editingSubId === sub.id ? (
                  <>
                    <select
                      className="px-2 py-1 bg-background border border-border/40 rounded-lg mr-2"
                      value={editingSubCat}
                      onChange={(e) => setEditingSubCat(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="px-2 py-1 bg-background border border-border/40 rounded-lg flex-1"
                      value={editingSubName}
                      onChange={(e) => setEditingSubName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => updateSubCategory(sub.id)} className="text-green-600">
                        <Save />
                      </button>
                      <button onClick={() => setEditingSubId(null)} className="text-gray-600">
                        <X />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{sub.name} ({categories.find(c=>c.id===sub.category_id)?.name || '—'})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSubId(sub.id);
                          setEditingSubName(sub.name);
                          setEditingSubCat(sub.category_id);
                        }}
                        className="text-blue-600"
                      >
                        <Edit2 />
                      </button>
                      <button onClick={() => deleteSubCategory(sub.id, sub.name)} className="text-red-600">
                        <Trash2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCategories;
