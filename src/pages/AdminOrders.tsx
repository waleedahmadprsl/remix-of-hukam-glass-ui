import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { playBeep } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

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
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  dispatched: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

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
          toast({ title: "🔔 NEW ORDER RECEIVED!", description: `Order #${newOrder.id.slice(0, 8)}` });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

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
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Send status update email
      const order = orders.find(o => o.id === orderId);
      if (order?.customer_email) {
        try {
          await supabase.functions.invoke("send-order-email", {
            body: {
              type: "status_update",
              email: order.customer_email,
              customerName: order.customer_name,
              orderId: orderId,
              status: newStatus,
              totalAmount: order.total_amount,
            },
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
      }

      await logActivity("ORDER_STATUS_CHANGED", `Order ${orderId} status changed to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const statuses = ["pending", "confirmed", "dispatched", "delivered", "canceled"];

  return (
    <AdminLayout activeTab="orders">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Order Management</h1>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="glass-card cursor-pointer hover:bg-background/50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-2">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{order.customer_name}</td>
                      <td className="px-4 py-2">Rs.{order.total_amount}</td>
                      <td className="px-4 py-2">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, e.target.value);
                          }}
                          className="px-2 py-1 bg-background border border-border/40 rounded-lg text-sm"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedOrder && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="glass-card p-8 rounded-3xl max-w-xl w-full relative">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 text-foreground/60 hover:text-foreground"
                  >
                    <X />
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Order #{selectedOrder.id.slice(0,8)}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><span className="font-semibold">Customer:</span> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email || "—"}</p>
                  <p><span className="font-semibold">Address:</span> {selectedOrder.delivery_address}</p>
                  {selectedOrder.items && (
                    <div className="mt-2">
                      <span className="font-semibold">Items:</span>
                      <ul className="list-disc list-inside">
                        {selectedOrder.items.split("\n").map((line,idx)=>(<li key={idx}>{line}</li>))}
                      </ul>
                    </div>
                  )}
                  {selectedOrder.promo_code && (
                    <p className="mt-2"><span className="font-semibold">Promo:</span> {selectedOrder.promo_code}</p>
                  )}
                  <p className="mt-2"><span className="font-semibold">Instructions:</span> {selectedOrder.instructions || "-"}</p>
                  <p className="mt-4 font-bold">Total: Rs.{selectedOrder.total_amount}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminOrders;
