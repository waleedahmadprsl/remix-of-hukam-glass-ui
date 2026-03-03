import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { playBeep } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, FileText, Tag, Package } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  instructions?: string;
  items?: string;
  promo_code?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statuses = ["pending", "confirmed", "dispatched", "delivered", "canceled"];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);
          playBeep();
          toast({ title: "🔔 NEW ORDER RECEIVED!", description: `Order #${newOrder.id.slice(0, 8)} — Rs.${newOrder.total_amount}` });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      if (error) throw error;

      const order = orders.find((o) => o.id === orderId);
      if (order?.customer_email) {
        try {
          await supabase.functions.invoke("send-order-email", {
            body: { type: "status_update", email: order.customer_email, customerName: order.customer_name, orderId, status: newStatus, totalAmount: order.total_amount },
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
      }

      await logActivity("ORDER_STATUS_CHANGED", `Order ${orderId} status changed to ${newStatus}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast({ title: "Status updated", description: `Order #${orderId.slice(0, 8)} → ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout activeTab="orders">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Order Command Center</h1>
        <p className="text-muted-foreground mb-8">Real-time orders with audio alerts. Click a row to expand details.</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              return (
                <motion.div key={order.id} layout className="glass-card rounded-2xl overflow-hidden">
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-background/40 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <span className="font-bold text-foreground text-sm">#{order.id.slice(0, 8)}</span>
                      <span className="text-sm text-muted-foreground hidden sm:block">{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="text-sm text-foreground truncate">{order.customer_name}</span>
                      <span className="text-sm font-semibold text-primary hidden sm:block">Rs.{order.total_amount}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${statusColors[order.status] || "bg-secondary text-foreground"}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                      className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs font-medium min-w-[110px]"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-border/40 grid sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium text-foreground">{order.customer_phone}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">{order.customer_email || "—"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Address</p>
                                <p className="text-sm font-medium text-foreground">{order.delivery_address}</p>
                              </div>
                            </div>
                            {order.instructions && (
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Instructions</p>
                                  <p className="text-sm text-foreground">{order.instructions}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {order.items && (
                              <div className="flex items-start gap-2">
                                <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Items</p>
                                  <ul className="space-y-0.5">
                                    {order.items.split("\n").map((line, idx) => (
                                      <li key={idx} className="text-sm text-foreground">{line}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            {order.promo_code && (
                              <div className="flex items-start gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Promo Code</p>
                                  <p className="text-sm font-medium text-primary">{order.promo_code}</p>
                                </div>
                              </div>
                            )}
                            <div className="mt-2 p-3 bg-primary/5 rounded-xl">
                              <p className="text-xs text-muted-foreground">Order Total</p>
                              <p className="text-xl font-extrabold text-primary">Rs.{order.total_amount}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
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
