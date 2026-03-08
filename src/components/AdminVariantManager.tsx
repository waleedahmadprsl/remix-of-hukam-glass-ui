import React from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Variant {
  id: string;
  product_id: string;
  variant_name: string;
  price: number | null;
  stock: number | null;
  sku: string | null;
  attributes: Record<string, string> | null;
}

interface Props {
  productId: string;
  productPrice: number;
}

const AdminVariantManager: React.FC<Props> = ({ productId, productPrice }) => {
  const [variants, setVariants] = React.useState<Variant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ variant_name: "", price: 0, stock: 0, sku: "", attrKey: "", attrValue: "" });
  const [attributes, setAttributes] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });
    setVariants((data as Variant[]) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ variant_name: "", price: 0, stock: 0, sku: "", attrKey: "", attrValue: "" });
    setAttributes({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.variant_name.trim()) {
      toast({ title: "Variant name required", variant: "destructive" });
      return;
    }
    const payload = {
      product_id: productId,
      variant_name: form.variant_name,
      price: form.price || null,
      stock: form.stock || 0,
      sku: form.sku || null,
      attributes: Object.keys(attributes).length > 0 ? attributes : null,
    };

    if (editingId) {
      const { error } = await supabase.from("product_variants").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Variant updated" });
    } else {
      const { error } = await supabase.from("product_variants").insert([payload]);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Variant added" });
    }
    resetForm();
    fetchVariants();
  };

  const handleEdit = (v: Variant) => {
    setEditingId(v.id);
    setForm({
      variant_name: v.variant_name,
      price: v.price || 0,
      stock: v.stock || 0,
      sku: v.sku || "",
      attrKey: "",
      attrValue: "",
    });
    setAttributes((v.attributes as Record<string, string>) || {});
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this variant?")) return;
    await supabase.from("product_variants").delete().eq("id", id);
    toast({ title: "Variant deleted" });
    fetchVariants();
  };

  const addAttribute = () => {
    if (form.attrKey.trim() && form.attrValue.trim()) {
      setAttributes((prev) => ({ ...prev, [form.attrKey.trim()]: form.attrValue.trim() }));
      setForm((f) => ({ ...f, attrKey: "", attrValue: "" }));
    }
  };

  return (
    <div className="mt-4 p-4 bg-secondary/20 rounded-xl border border-border/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-foreground">🎨 Variants ({variants.length})</h4>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold"
        >
          <Plus className="w-3 h-3" /> {showForm ? "Cancel" : "Add Variant"}
        </button>
      </div>

      {showForm && (
        <div className="p-3 bg-background rounded-lg border border-border mb-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Name *</label>
              <input value={form.variant_name} onChange={(e) => setForm({ ...form, variant_name: e.target.value })} placeholder="e.g. Red / 128GB" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Price (Rs)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder={String(productPrice)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>

          {/* Custom Attributes */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Attributes</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(attributes).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                  {k}: {v}
                  <button type="button" onClick={() => { const next = { ...attributes }; delete next[k]; setAttributes(next); }}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.attrKey} onChange={(e) => setForm({ ...form, attrKey: e.target.value })} placeholder="Color" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-lg text-xs" />
              <input value={form.attrValue} onChange={(e) => setForm({ ...form, attrValue: e.target.value })} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAttribute())} placeholder="Red" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-lg text-xs" />
              <button type="button" onClick={addAttribute} className="px-2 py-1.5 bg-secondary text-foreground rounded-lg text-xs">Add</button>
            </div>
          </div>

          <button type="button" onClick={handleSave} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
            <Save className="w-3 h-3" /> {editingId ? "Update" : "Save"} Variant
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading variants...</p>
      ) : variants.length === 0 ? (
        <p className="text-xs text-muted-foreground">No variants yet. Add color/size/storage options.</p>
      ) : (
        <div className="space-y-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border/30 text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground">{v.variant_name}</span>
                {v.sku && <span className="text-[10px] font-mono text-muted-foreground ml-2">{v.sku}</span>}
                <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>Rs.{(v.price || productPrice).toLocaleString()}</span>
                  <span>Stock: {v.stock ?? 0}</span>
                  {v.attributes && Object.entries(v.attributes).map(([k, val]) => (
                    <span key={k} className="text-primary">{k}: {val as string}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => handleEdit(v)} className="p-1.5 bg-primary/10 text-primary rounded-lg"><Edit2 className="w-3 h-3" /></button>
                <button type="button" onClick={() => handleDelete(v.id)} className="p-1.5 bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVariantManager;
