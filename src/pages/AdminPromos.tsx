import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Edit2, Plus, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Promo {
  id: string;
  code: string;
  discount_type: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
  min_purchase?: number;
  usage_limit?: number | null;
  times_used?: number;
  expires_at?: string | null;
}

const AdminPromos: React.FC = () => {
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    code: "", discount_type: "percentage", discount_amount: 0, discount_percentage: 0, is_active: true, min_purchase: 0, usage_limit: 0, expires_at: null as Date | null,
  });

  React.useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const { data } = await supabase.from("promo_codes").select("*");
    setPromos((data as Promo[]) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ code: "", discount_type: "percentage", discount_amount: 0, discount_percentage: 0, is_active: true, min_purchase: 0, usage_limit: 0, expires_at: null });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return;
    const payload: any = {
      code: form.code,
      discount_type: form.discount_type,
      discount_percentage: form.discount_type === "percentage" ? form.discount_percentage : 0,
      discount_amount: form.discount_type === "fixed" ? form.discount_amount : 0,
      is_active: form.is_active,
      min_purchase: form.min_purchase || 0,
      usage_limit: form.usage_limit || null,
      expires_at: form.expires_at ? form.expires_at.toISOString() : null,
    };
    if (editingId) {
      const { error } = await supabase.from("promo_codes").update(payload).eq("id", editingId);
      if (error) { alert(error.message); return; }
      await logActivity("PROMO_UPDATED", `Updated promo ${form.code}`);
    } else {
      const { error } = await supabase.from("promo_codes").insert(payload);
      if (error) { alert(error.message); return; }
      await logActivity("PROMO_ADDED", `Added promo ${form.code}`);
    }
    resetForm();
    fetchPromos();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo ${code}?`)) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    await logActivity("PROMO_DELETED", `Deleted promo ${code}`);
    fetchPromos();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !active } as any).eq("id", id);
    fetchPromos();
  };

  return (
    <AdminLayout activeTab="promos">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Promo Codes</h1>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> {showForm ? "Close" : "New Promo"}
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-8 rounded-2xl mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Promo" : "New Promo Code"}</h2>
              <button onClick={resetForm}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. HUKAM20" className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Type</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-lg">
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed Amount Rs</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {form.discount_type === "percentage" && (
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Percentage</label><input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              )}
              {form.discount_type === "fixed" && (
                <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Amount (Rs)</label><input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              )}
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Min Purchase (Rs)</label><input type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
              <div><label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Usage Limit</label><input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} placeholder="0 = unlimited" className="w-full px-4 py-3 bg-background border border-border rounded-lg" /></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /> Active</label>
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">{editingId ? "Update" : "Save"}</button>
            </div>
          </motion.div>
        )}

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
          <div className="overflow-x-auto glass-card rounded-2xl">
            <table className="w-full text-sm min-w-[600px]">
              <thead><tr className="text-left text-muted-foreground text-xs border-b border-border/40"><th className="px-4 py-3">Code</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Min Purchase</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{p.code}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.discount_type.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-foreground">{p.discount_type === "free_shipping" ? "–" : p.discount_type === "percentage" ? `${p.discount_percentage}%` : `Rs.${p.discount_amount}`}</td>
                    <td className="px-4 py-3 text-muted-foreground">Rs.{p.min_purchase || 0}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.times_used || 0}{p.usage_limit ? ` / ${p.usage_limit}` : ""}</td>
                    <td className="px-4 py-3"><button onClick={() => toggleActive(p.id, p.is_active)} className={`text-xs font-semibold px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{p.is_active ? "Active" : "Off"}</button></td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => { setEditingId(p.id); setForm({ code: p.code, discount_type: p.discount_type, discount_amount: p.discount_amount || 0, discount_percentage: p.discount_percentage || 0, is_active: p.is_active, min_purchase: p.min_purchase || 0, usage_limit: p.usage_limit || 0 }); setShowForm(true); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id, p.code)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminPromos;
