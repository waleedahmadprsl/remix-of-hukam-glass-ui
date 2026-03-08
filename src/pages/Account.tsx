import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, LogOut, Save, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import hukamName from "@/assets/hukam-name.png";

type Tab = "profile" | "orders" | "wishlist" | "addresses";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  tracking_id: string | null;
}

interface WishlistProduct {
  product_id: string;
  title: string;
  price: number;
  images: string[];
}

const Account: React.FC = () => {
  const { session, profile: authProfile, loading: authLoading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [form, setForm] = useState({ full_name: "", username: "", phone: "", address: "", city: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) navigate("/login");
  }, [session, authLoading, navigate]);

  // Pre-fill form from profile (Google data included via AuthContext)
  useEffect(() => {
    if (authProfile) {
      setForm({
        full_name: authProfile.full_name || "",
        username: authProfile.username || "",
        phone: authProfile.phone || "",
        address: authProfile.address || "",
        city: authProfile.city || "",
      });
    }
  }, [authProfile]);

  useEffect(() => {
    if (!session) return;
    supabase.from("orders").select("id, created_at, total_amount, status, tracking_id").eq("user_id", session.user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
    supabase.from("user_wishlist").select("product_id, products(title, price, images)").eq("user_id", session.user.id).then(({ data }) => {
      if (data) setWishlist(data.map((w: any) => ({ product_id: w.product_id, title: w.products?.title || "", price: w.products?.price || 0, images: Array.isArray(w.products?.images) ? w.products.images : [] })));
    });
  }, [session]);

  const saveProfile = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      username: form.username,
      phone: form.phone,
      address: form.address,
      city: form.city,
    }).eq("id", session.user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      await refreshProfile();
    }
  };

  const removeWishlistItem = async (productId: string) => {
    if (!session) return;
    await supabase.from("user_wishlist").delete().eq("user_id", session.user.id).eq("product_id", productId);
    setWishlist((prev) => prev.filter((w) => w.product_id !== productId));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  const avatarUrl = authProfile?.avatar_url || "";
  const initials = (authProfile?.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { key: "orders", label: "Orders", icon: <Package className="w-4 h-4" /> },
    { key: "wishlist", label: "Wishlist", icon: <Heart className="w-4 h-4" /> },
    { key: "addresses", label: "Address", icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={authProfile?.full_name || "User"} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{authProfile?.full_name || "My Account"}</h1>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Choose a username" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 3XX XXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={session?.user.email || ""} disabled className="opacity-60" />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No orders yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>Start Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">₨ {o.total_amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "delivered" ? "bg-green-500/10 text-green-600" : o.status === "shipped" ? "bg-blue-500/10 text-blue-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {tab === "wishlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Your wishlist is empty</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>Browse Products</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((w) => (
                    <div key={w.product_id} className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
                      {w.images[0] && <img src={w.images[0]} alt={w.title} className="w-16 h-16 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary" onClick={() => navigate(`/product/${w.product_id}`)}>{w.title}</p>
                        <p className="text-sm font-bold text-primary">₨ {w.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeWishlistItem(w.product_id)} className="text-muted-foreground hover:text-destructive p-1">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Address Tab */}
          {tab === "addresses" && (
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #, Street, Area" />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lahore, Karachi, etc." />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Address"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
