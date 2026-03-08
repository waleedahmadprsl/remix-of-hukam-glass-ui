import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Edit2, Save, X, Plus, ChevronRight, ChevronDown, FolderTree } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  children?: Category[];
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newName, setNewName] = React.useState("");
  const [addingParentId, setAddingParentId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => { fetchCategories(); }, []);

  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) { console.error(error); setLoading(false); return; }
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  // Build tree from flat list
  const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
    return items
      .filter((c) => c.parent_id === parentId)
      .map((c) => ({ ...c, children: buildTree(items, c.id) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const tree = buildTree(categories);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addCategory = async (parentId: string | null, level: number) => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newName, slug: toSlug(newName), parent_id: parentId, level });
    if (error) { alert(error.message); return; }
    await logActivity("CATEGORY_ADDED", `Added category: ${newName}`);
    setNewName("");
    setAddingParentId(null);
    fetchCategories();
    if (parentId) setExpandedIds((prev) => new Set(prev).add(parentId));
  };

  const updateCategory = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("categories").update({ name: editingName, slug: toSlug(editingName) }).eq("id", id);
    if (error) { alert(error.message); return; }
    await logActivity("CATEGORY_UPDATED", `Updated category: ${editingName}`);
    setEditingId(null);
    setEditingName("");
    fetchCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    const children = categories.filter((c) => c.parent_id === id);
    if (children.length > 0 && !confirm(`"${name}" has ${children.length} sub-categories. Delete all?`)) return;
    if (children.length === 0 && !confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await logActivity("CATEGORY_DELETED", `Deleted category: ${name}`);
    fetchCategories();
  };

  const levelColors = [
    "border-primary/30 bg-primary/5",
    "border-blue-500/30 bg-blue-500/5",
    "border-purple-500/30 bg-purple-500/5",
    "border-orange-500/30 bg-orange-500/5",
    "border-green-500/30 bg-green-500/5",
  ];

  const levelBadgeColors = [
    "bg-primary/10 text-primary",
    "bg-blue-500/10 text-blue-600",
    "bg-purple-500/10 text-purple-600",
    "bg-orange-500/10 text-orange-600",
    "bg-green-500/10 text-green-600",
  ];

  const renderNode = (node: Category, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const colorClass = levelColors[depth % levelColors.length];
    const badgeColor = levelBadgeColors[depth % levelBadgeColors.length];

    return (
      <div key={node.id} className="w-full">
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${colorClass} mb-1.5 group transition-all`}>
          {/* Expand toggle */}
          <button onClick={() => hasChildren && toggleExpand(node.id)} className={`p-0.5 rounded transition-colors ${hasChildren ? "hover:bg-secondary cursor-pointer" : "opacity-30 cursor-default"}`}>
            {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />) : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
          </button>

          {editingId === node.id ? (
            <div className="flex-1 flex items-center gap-2">
              <input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && updateCategory(node.id)} className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm" autoFocus />
              <button onClick={() => updateCategory(node.id)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Save className="w-4 h-4" /></button>
              <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-foreground">{node.name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                L{node.level || depth}
              </span>
              {hasChildren && <span className="text-[10px] text-muted-foreground">{node.children!.length}</span>}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setAddingParentId(node.id); setNewName(""); setExpandedIds((p) => new Set(p).add(node.id)); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg" title="Add child"><Plus className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setEditingId(node.id); setEditingName(node.name); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteCategory(node.id, node.name)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </>
          )}
        </div>

        {/* Inline add child form */}
        {addingParentId === node.id && (
          <div className="ml-8 mb-2 flex items-center gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory(node.id, (node.level || depth) + 1)} placeholder={`New sub-category under "${node.name}"`} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" autoFocus />
            <button onClick={() => addCategory(node.id, (node.level || depth) + 1)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setAddingParentId(null)} className="p-2 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 pl-2 border-l-2 border-border/30 overflow-hidden">
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AdminLayout activeTab="categories">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Category Tree</h1>
            <p className="text-sm text-muted-foreground mt-1">Unlimited nesting — like Amazon & Daraz</p>
          </div>
          <button onClick={() => { setAddingParentId("__root__"); setNewName(""); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> Add Root Category
          </button>
        </div>

        {/* Root add form */}
        {addingParentId === "__root__" && (
          <div className="flex items-center gap-2 mb-4">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory(null, 0)} placeholder="New root category name" className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm" autoFocus />
            <button onClick={() => addCategory(null, 0)} className="px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">Add</button>
            <button onClick={() => setAddingParentId(null)} className="p-3 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading categories...</div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No categories yet. Add your first root category above.</p>
          </div>
        ) : (
          <div className="glass-card p-4 sm:p-6 rounded-2xl">
            {tree.map((node) => renderNode(node))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCategories;
