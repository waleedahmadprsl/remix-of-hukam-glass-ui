import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Store } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  slug: string;
  sku_prefix: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { name: "", slug: "", sku_prefix: "", contact_name: "", email: "", phone: "", address: "", commission_percent: 0 };

const AdminShops: React.FC = () => {
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => { fetchShops(); }, []);

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
    setShops((data as Shop[]) || []);
    setLoading(false);
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      sku_prefix: form.sku_prefix.toUpperCase(), contact_name: form.contact_name || null,
      email: form.email || null, phone: form.phone || null, address: form.address || null,
      commission_percent: Number(form.commission_percent),
    };
    if (editingId) {
      const { error } = await supabase.from("shops").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      await logActivity("SHOP_UPDATED", `Updated shop: ${form.name}`);
    } else {
      const { error } = await supabase.from("shops").insert([payload]);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      await logActivity("SHOP_CREATED", `Created shop: ${form.name}`);
    }
    toast({ title: editingId ? "Shop Updated" : "Shop Created" });
    resetForm();
    fetchShops();
  };

  const handleEdit = (s: Shop) => {
    setEditingId(s.id);
    setForm({ name: s.name, slug: s.slug, sku_prefix: s.sku_prefix, contact_name: s.contact_name || "", email: s.email || "", phone: s.phone || "", address: s.address || "", commission_percent: s.commission_percent });
    setShowForm(true);
  };

  const handleDelete = async (s: Shop) => {
    if (!confirm(`Delete shop "${s.name}"?`)) return;
    await supabase.from("shops").delete().eq("id", s.id);
    await logActivity("SHOP_DELETED", `Deleted shop: ${s.name}`);
    toast({ title: "Shop Deleted" });
    fetchShops();
  };

  const toggleActive = async (s: Shop) => {
    await supabase.from("shops").update({ is_active: !s.is_active } as any).eq("id", s.id);
    setShops((prev) => prev.map((x) => x.id === s.id ? { ...x, is_active: !x.is_active } : x));
  };

  return (
    <AdminLayout activeTab="shops">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Shops / Vendors</h1>
            <p className="text-sm text-muted-foreground">Manage marketplace vendors</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> {showForm ? "Close" : "Add Shop"}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSave} className="glass-card p-5 sm:p-8 rounded-2xl mb-8 space-y-4 overflow-hidden">
              <div className="flex justify-between"><h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Shop" : "Add Shop"}</h2><button type="button" onClick={resetForm}><X className="w-5 h-5 text-muted-foreground" /></button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Shop Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">SKU Prefix * <span className="normal-case text-muted-foreground">(e.g. SHOPA)</span></label><input value={form.sku_prefix} onChange={(e) => setForm({ ...form, sku_prefix: e.target.value.toUpperCase() })} required maxLength={10} className="w-full px-4 py-3 bg-background border border-border rounded-lg uppercase" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact Name</label><input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Commission %</label><input type="number" min={0} max={100} step={0.1} value={form.commission_percent} onChange={(e) => setForm({ ...form, commission_percent: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold">{editingId ? "Update" : "Create Shop"}</button>
                <button type="button" onClick={resetForm} className="flex-1 bg-secondary text-foreground py-3 rounded-lg font-semibold">Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : shops.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl">
            <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No shops yet. Add your first vendor!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full font-mono">{s.sku_prefix}</span>
                    {!s.is_active && <span className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{s.email || s.phone || "No contact"} · Commission: {s.commission_percent}%</p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${s.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-secondary text-muted-foreground"}`}>
                    {s.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleEdit(s)} className="p-2 bg-primary/10 text-primary rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s)} className="p-2 bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminShops;
