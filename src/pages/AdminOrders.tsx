import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLogger";
import { playBeep } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, FileText, Tag, Package, Truck, Search, Store } from "lucide-react";

interface Order {
  id: string; customer_name: string; customer_email: string | null; customer_phone: string;
  delivery_address: string; instructions?: string; items?: string; promo_code?: string;
  total_amount: number; shipping_cost?: number; discount_amount?: number;
  tracking_id?: string; status: string; created_at: string;
}

interface OrderItem {
  id: string; order_id: string; product_id: string | null; shop_id: string | null;
  product_title: string; variant_name: string | null; variant_id: string | null;
  quantity: number; unit_price: number; buying_cost: number;
}

interface Shop { id: string; name: string; commission_percent: number; }

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  returned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};
const statuses = ["pending", "confirmed", "dispatched", "delivered", "returned", "canceled"];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [trackingInputs, setTrackingInputs] = React.useState<Record<string, string>>({});
  const [orderItemsMap, setOrderItemsMap] = React.useState<Record<string, OrderItem[]>>({});
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState("");

  React.useEffect(() => {
    fetchOrders(); fetchShops();
    const channel = supabase.channel("orders_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const newOrder = payload.new as Order;
        setOrders((prev) => [newOrder, ...prev]);
        playBeep();
        toast({ title: "🔔 NEW ORDER!", description: `#${newOrder.id.slice(0, 8)} — Rs.${newOrder.total_amount}` });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []); setLoading(false);
  };

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("id, name, commission_percent");
    setShops((data as Shop[]) || []);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItemsMap[orderId]) return;
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setOrderItemsMap((prev) => ({ ...prev, [orderId]: (data as OrderItem[]) || [] }));
  };

  const handleExpand = (orderId: string) => {
    const isExpanded = expandedId === orderId;
    setExpandedId(isExpanded ? null : orderId);
    if (!isExpanded) fetchOrderItems(orderId);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    const oldStatus = order?.status;

    const { error } = await supabase.from("orders").update({ status: newStatus } as any).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Stock restoration when canceled/returned (only if coming from a non-canceled/returned status)
    if ((newStatus === "canceled" || newStatus === "returned") && oldStatus && !["canceled", "returned"].includes(oldStatus)) {
      const items = orderItemsMap[orderId] || [];
      if (items.length === 0) {
        const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
        if (data) {
          for (const item of data as OrderItem[]) {
            if (item.variant_id) {
              const { data: v } = await supabase.from("product_variants").select("stock").eq("id", item.variant_id).single();
              if (v) await supabase.from("product_variants").update({ stock: (v.stock || 0) + item.quantity }).eq("id", item.variant_id);
            }
            if (item.product_id) {
              const { data: p } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
              if (p) await supabase.from("products").update({ stock: (p.stock || 0) + item.quantity }).eq("id", item.product_id);
            }
          }
        }
      } else {
        for (const item of items) {
          if (item.shop_id) {
            // variant stock restore
          }
          if (item.product_id) {
            const { data: p } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
            if (p) await supabase.from("products").update({ stock: (p.stock || 0) + item.quantity }).eq("id", item.product_id);
          }
        }
      }
    }

    if (order?.customer_email) {
      try { await supabase.functions.invoke("send-order-email", { body: { type: "status_update", email: order.customer_email, customerName: order.customer_name, orderId, status: newStatus, totalAmount: order.total_amount } }); } catch (e) { console.error(e); }
    }
    await logActivity("ORDER_STATUS", `Order ${orderId.slice(0, 8)} → ${newStatus}`);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    toast({ title: "Updated", description: `#${orderId.slice(0, 8)} → ${newStatus}` });
  };

  const saveTracking = async (orderId: string) => {
    const tid = trackingInputs[orderId];
    if (!tid?.trim()) return;
    const { error } = await supabase.from("orders").update({ tracking_id: tid } as any).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, tracking_id: tid } : o)));
    toast({ title: "Tracking saved" });
  };

  const filtered = orders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search) { const q = search.toLowerCase(); return o.customer_name.toLowerCase().includes(q) || o.customer_phone.includes(q) || o.id.toLowerCase().includes(q); }
    return true;
  });

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    statuses.forEach((s) => { counts[s] = orders.filter((o) => o.status === s).length; });
    return counts;
  }, [orders]);

  // Group order items by shop
  const groupByShop = (items: OrderItem[]) => {
    const groups: Record<string, { shop: Shop | null; items: OrderItem[] }> = {};
    items.forEach((item) => {
      const key = item.shop_id || "own";
      if (!groups[key]) { groups[key] = { shop: shops.find((s) => s.id === item.shop_id) || null, items: [] }; }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  };

  const toggleOrderSelect = (id: string) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    if (!confirm(`Update ${selectedIds.size} orders to "${bulkStatus}"?`)) return;
    for (const orderId of Array.from(selectedIds)) {
      await handleStatusChange(orderId, bulkStatus);
    }
    setSelectedIds(new Set());
    setBulkStatus("");
    toast({ title: "Bulk update complete", description: `${selectedIds.size} orders updated` });
  };

  return (
    <AdminLayout activeTab="orders">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-1">Order Command Center</h1>
        <p className="text-sm text-muted-foreground mb-6">Real-time orders with vendor split</p>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2">
          {["all", ...statuses].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, or order ID..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
            <span className="text-sm font-semibold text-foreground">{selectedIds.size} selected</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm">
              <option value="">Change status to...</option>
              {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button onClick={handleBulkStatusUpdate} disabled={!bulkStatus} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50">Apply</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
        )}

        {loading ? <div className="text-center py-12 text-muted-foreground">Loading orders...</div> : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground">No orders found.</div> : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const isExpanded = expandedId === order.id;
              const shippingCost = Number(order.shipping_cost || 0);
              const discountAmt = Number(order.discount_amount || 0);
              const items = orderItemsMap[order.id] || [];
              const shopGroups = groupByShop(items);

              return (
                <motion.div key={order.id} layout className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-background/40 transition-colors" onClick={() => handleExpand(order.id)}>
                    <input type="checkbox" checked={selectedIds.has(order.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleOrderSelect(order.id)} className="rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-2 items-center">
                      <span className="font-bold text-foreground text-xs sm:text-sm">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="text-xs sm:text-sm text-foreground truncate">{order.customer_name}</span>
                      <span className="text-xs sm:text-sm font-semibold text-primary hidden sm:block">Rs.{order.total_amount}</span>
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${statusColors[order.status] || "bg-secondary text-foreground"}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                    <select value={order.status} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }} className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-medium min-w-[90px] sm:min-w-[110px]">
                      {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-3 sm:px-5 pb-5 pt-2 border-t border-border/40 grid sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{order.customer_phone}</p></div></div>
                            <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{order.customer_email || "—"}</p></div></div>
                            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm font-medium text-foreground">{order.delivery_address}</p></div></div>
                            {order.instructions && <div className="flex items-start gap-2"><FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Instructions</p><p className="text-sm text-foreground">{order.instructions}</p></div></div>}
                          </div>
                          <div className="space-y-3">
                            {/* Shop-Split Items View */}
                            {items.length > 0 ? (
                              <div className="space-y-3">
                                {shopGroups.map((group, gi) => (
                                  <div key={gi} className="p-3 bg-secondary/30 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Store className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-xs font-bold text-foreground">{group.shop?.name || "Own Products"}</span>
                                      {group.shop && <span className="text-[10px] text-muted-foreground">({group.shop.commission_percent}% commission)</span>}
                                    </div>
                                    {group.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-sm py-0.5">
                                        <span className="text-foreground">{item.product_title}{item.variant_name ? ` (${item.variant_name})` : ""} × {item.quantity}</span>
                                        <span className="text-muted-foreground">Rs.{(item.unit_price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : order.items ? (
                              <div className="flex items-start gap-2"><Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Items (Legacy)</p><ul className="space-y-0.5">{order.items.split("\n").map((l, i) => <li key={i} className="text-sm text-foreground">{l}</li>)}</ul></div></div>
                            ) : null}

                            {order.promo_code && <div className="flex items-start gap-2"><Tag className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Promo</p><p className="text-sm font-medium text-primary">{order.promo_code}</p></div></div>}

                            <div className="p-3 bg-primary/5 rounded-xl space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>Rs.{(order.total_amount + discountAmt - shippingCost).toLocaleString()}</span></div>
                              {shippingCost > 0 && <div className="flex justify-between text-xs text-muted-foreground"><span>Shipping</span><span>Rs.{shippingCost}</span></div>}
                              {discountAmt > 0 && <div className="flex justify-between text-xs text-primary"><span>Discount</span><span>-Rs.{discountAmt}</span></div>}
                              {items.length > 0 && (() => { const cogs = items.reduce((s, i) => s + i.buying_cost * i.quantity, 0); const profit = order.total_amount - cogs; return <div className="flex justify-between text-xs text-green-600"><span>Profit</span><span>Rs.{profit.toLocaleString()}</span></div>; })()}
                              <div className="flex justify-between font-extrabold text-foreground border-t border-border/40 pt-1 mt-1"><span>Total</span><span className="text-primary">Rs.{order.total_amount}</span></div>
                              <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                            </div>

                            <div className="flex items-start gap-2">
                              <Truck className="w-4 h-4 text-muted-foreground mt-2 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">Tracking ID</p>
                                <div className="flex gap-2">
                                  <input value={trackingInputs[order.id] ?? order.tracking_id ?? ""} onChange={(e) => setTrackingInputs((p) => ({ ...p, [order.id]: e.target.value }))} placeholder="Enter courier tracking ID" className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm" />
                                  <button onClick={() => saveTracking(order.id)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold">Save</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminOrders;
