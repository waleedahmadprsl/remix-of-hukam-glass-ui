import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Save, Store, Truck, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "hukam_store_settings";

interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  shippingRatePerShop: number;
  freeShippingThreshold: number;
  currency: string;
  codEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  bankTransferEnabled: boolean;
}

const defaults: StoreSettings = {
  storeName: "HUKAM",
  tagline: "Order Nahi, HUKAM Kijiye.",
  contactEmail: "contact@hukam.pk",
  contactPhone: "+92 327 7786498",
  whatsappNumber: "923277786498",
  address: "Mirpur, AJK",
  city: "Mirpur",
  shippingRatePerShop: 50,
  freeShippingThreshold: 0,
  currency: "PKR",
  codEnabled: true,
  jazzcashEnabled: false,
  easypaisaEnabled: false,
  bankTransferEnabled: false,
};

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = React.useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const update = (key: keyof StoreSettings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast({ title: "Settings saved!", description: "Store settings have been updated." });
  };

  const handleReset = () => {
    setSettings(defaults);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Reset to defaults" });
  };

  return (
    <AdminLayout activeTab="settings">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Store Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your store details, shipping, and payment methods</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors">
              Reset Defaults
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Store Info */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Store Information</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Store Name</label>
              <input value={settings.storeName} onChange={(e) => update("storeName", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tagline</label>
              <input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">City</label>
                <input value={settings.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Currency</label>
                <input value={settings.currency} onChange={(e) => update("currency", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Address</label>
              <input value={settings.address} onChange={(e) => update("address", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Contact Details</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact Email</label>
              <input type="email" value={settings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact Phone</label>
              <input value={settings.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">WhatsApp Number (no +)</label>
              <input value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="923XXXXXXXXX" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
            </div>
          </div>

          {/* Shipping */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Shipping Configuration</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Shipping Rate per Shop (Rs)</label>
              <input type="number" value={settings.shippingRatePerShop} onChange={(e) => update("shippingRatePerShop", Number(e.target.value))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
              <p className="text-[11px] text-muted-foreground mt-1">Charged per unique shop/vendor in order</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Free Shipping Threshold (Rs)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground" />
              <p className="text-[11px] text-muted-foreground mt-1">0 = no free shipping. Orders above this amount get free delivery.</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="glass-card p-5 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Payment Methods</h2>
            </div>
            {[
              { key: "codEnabled" as const, label: "Cash on Delivery (COD)" },
              { key: "jazzcashEnabled" as const, label: "JazzCash" },
              { key: "easypaisaEnabled" as const, label: "Easypaisa" },
              { key: "bankTransferEnabled" as const, label: "Bank Transfer" },
            ].map((pm) => (
              <label key={pm.key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <span className="text-sm font-medium text-foreground">{pm.label}</span>
                <input
                  type="checkbox"
                  checked={settings[pm.key]}
                  onChange={(e) => update(pm.key, e.target.checked)}
                  className="rounded border-border"
                />
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettings;
