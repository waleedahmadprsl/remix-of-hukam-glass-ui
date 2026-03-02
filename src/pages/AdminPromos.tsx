import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { Trash2, Edit2, Save, X } from "lucide-react";

interface Promo {
  id: string;
  code: string;
  discount_type: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
}

const AdminPromos: React.FC = () => {
  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [form, setForm] = React.useState({
    code: "",
    discount_type: "percentage",
    discount_amount: 0,
    discount_percentage: 0,
    is_active: true,
  });

  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("promo_codes").select("*");
      if (error) throw error;
      setPromos((data as Promo[]) || []);
    } catch (err: any) {
      console.error("Error fetching promos", err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ code: "", discount_type: "percentage", discount_amount: 0, discount_percentage: 0, is_active: true });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return;
    try {
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_percentage: form.discount_type === "percentage" ? form.discount_percentage : 0,
        discount_amount: form.discount_type === "fixed" ? form.discount_amount : 0,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from("promo_codes").update(payload).eq("id", editingId);
        if (error) throw error;
        await logActivity("PROMO_UPDATED", `Updated promo ${form.code}`);
      } else {
        const { error } = await supabase.from("promo_codes").insert(payload);
        if (error) throw error;
        await logActivity("PROMO_ADDED", `Added promo ${form.code}`);
      }
      resetForm();
      fetchPromos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo ${code}?`)) return;
    try {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
      await logActivity("PROMO_DELETED", `Deleted promo ${code}`);
      fetchPromos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout activeTab="promos">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Promo Codes</h1>

        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? "Edit Promo" : "New Promo Code"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Code (e.g. NAMII)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="px-4 py-2 bg-background border border-border/40 rounded-lg"
            />
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="px-4 py-2 bg-background border border-border/40 rounded-lg"
            >
              <option value="percentage">Percentage %</option>
              <option value="fixed">Fixed Amount Rs</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>
          {form.discount_type === "percentage" && (
            <input
              type="number"
              placeholder="Percentage value"
              value={form.discount_percentage || 0}
              onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
              className="mt-4 px-4 py-2 bg-background border border-border/40 rounded-lg"
            />
          )}
          {form.discount_type === "fixed" && (
            <input
              type="number"
              placeholder="Amount (Rs)"
              value={form.discount_amount || 0}
              onChange={(e) => setForm({ ...form, discount_amount: Number(e.target.value) })}
              className="mt-4 px-4 py-2 bg-background border border-border/40 rounded-lg"
            />
          )}
          <div className="mt-4 flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              {editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading promos...</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="glass-card">
                  <td className="px-4 py-2">{p.code}</td>
                  <td className="px-4 py-2">{p.discount_type}</td>
                  <td className="px-4 py-2">
                    {p.discount_type === "free_shipping" ? "–" : p.discount_type === "percentage" ? `${p.discount_percentage}%` : `Rs.${p.discount_amount}`}
                  </td>
                  <td className="px-4 py-2">{p.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setForm({
                          code: p.code,
                          discount_type: p.discount_type,
                          discount_amount: p.discount_amount || 0,
                          discount_percentage: p.discount_percentage || 0,
                          is_active: p.is_active,
                        });
                      }}
                      className="text-primary"
                    >
                      <Edit2 />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.code)} className="text-destructive">
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminPromos;
