import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, MapPin, Hash } from "lucide-react";
import { supabase } from "@/lib/supabase";

const statusSteps = ["pending", "confirmed", "dispatched", "delivered"];

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  dispatched: "Out for Delivery",
  delivered: "Delivered",
  canceled: "Canceled",
};

const statusDescriptions: Record<string, string> = {
  pending: "Your order has been received and is awaiting confirmation.",
  confirmed: "Your order has been confirmed and is being prepared.",
  dispatched: "Your order is on its way to you!",
  delivered: "Your order has been delivered successfully.",
  canceled: "This order has been canceled.",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <CheckCircle2 className="w-5 h-5" />,
  dispatched: <Truck className="w-5 h-5" />,
  delivered: <Package className="w-5 h-5" />,
  canceled: <XCircle className="w-5 h-5" />,
};

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  tracking_id: string | null;
  shipping_cost: number | null;
}

const TrackOrder: React.FC = () => {
  const [phone, setPhone] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !orderId.trim()) {
      setError("Both phone number and Order ID are required for security.");
      return;
    }
    setLoading(true); setError(""); setOrder(null);

    try {
      const cleanPhone = phone.replace(/[\s\-()]/g, "");
      const cleanOrderId = orderId.trim().toLowerCase();

      // Validate UUID format loosely
      if (cleanOrderId.length < 8) {
        setError("Please enter at least the first 8 characters of your Order ID.");
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, items, total_amount, status, created_at, delivery_address, tracking_id, shipping_cost")
        .or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${cleanPhone.replace(/^\+/, '')}%`)
        .ilike("id", `${cleanOrderId}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (err) throw err;
      if (data && data.length > 0) setOrder(data[0] as Order);
      else setError("No order found. Please check your phone number and Order ID.");
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? (order.status === "canceled" ? -1 : statusSteps.indexOf(order.status)) : -1;

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-20 px-4">
      <div className="mx-auto max-w-xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2 block">HUKAM</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-2 font-display">Track Your Order</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Enter your phone number and Order ID to check status.</p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3 mb-8">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 342 680 7645" required className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Order ID *</label>
            <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. a1b2c3d4..." required className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
            <p className="text-[11px] text-muted-foreground mt-1">You received your Order ID via WhatsApp/SMS when you placed your order.</p>
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/25 disabled:opacity-50 transition-all">
            {loading ? <span className="animate-pulse">Searching...</span> : <><Search className="w-5 h-5" />Track Order</>}
          </motion.button>
        </motion.form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 rounded-2xl text-center mb-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
                <p className="text-base sm:text-lg font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-base sm:text-lg font-bold text-primary">Rs.{order.total_amount.toLocaleString()}</p>
              </div>
            </div>

            {order.tracking_id && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Tracking: {order.tracking_id}</span>
              </div>
            )}

            {order.status === "canceled" ? (
              <div className="flex items-center gap-3 bg-destructive/10 p-4 rounded-xl">
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Order Canceled</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{statusDescriptions.canceled}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="p-4 bg-primary/5 rounded-xl mb-4">
                  <p className="text-sm font-bold text-primary">{statusLabels[order.status] || order.status}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{statusDescriptions[order.status]}</p>
                </div>

                {/* Desktop horizontal stepper */}
                <div className="hidden sm:block py-4">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute top-5 left-6 right-6 h-1 bg-border rounded-full" />
                    <motion.div
                      className="absolute top-5 left-6 h-1 bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: currentStepIndex >= 0 ? `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 48px)` : 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {statusSteps.map((step, i) => {
                      const isCompleted = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: isCurrent ? 1.15 : 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-secondary text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            {statusIcons[step]}
                          </motion.div>
                          <span className={`text-xs font-semibold text-center ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                            {statusLabels[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile vertical stepper */}
                <div className="sm:hidden space-y-0">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: isCurrent ? 1.1 : 1 }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                              isCompleted ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-secondary text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            {statusIcons[step]}
                          </motion.div>
                          {i < statusSteps.length - 1 && (
                            <motion.div
                              className={`w-0.5 h-8 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: i * 0.15, duration: 0.3 }}
                            />
                          )}
                        </div>
                        <div className="pt-1.5 pb-4">
                          <span className={`text-sm font-semibold ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                            {statusLabels[step]}
                          </span>
                          {isCurrent && (
                            <p className="text-xs text-muted-foreground mt-0.5">{statusDescriptions[step]}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.items && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                <ul className="space-y-1">
                  {order.items.split("\n").map((line, idx) => (
                    <li key={idx} className="text-sm text-foreground">{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {order.delivery_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                  <p className="text-sm text-foreground">{order.delivery_address}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
