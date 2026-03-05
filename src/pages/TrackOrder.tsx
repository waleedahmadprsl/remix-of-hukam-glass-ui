import React from "react";
import { motion } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = ["pending", "confirmed", "dispatched", "delivered"];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  canceled: "Canceled",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
  confirmed: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />,
  dispatched: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
  delivered: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
  canceled: <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
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
}

const TrackOrder: React.FC = () => {
  const [phone, setPhone] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const cleanPhone = phone.replace(/[\s\-()]/g, "");

      let query = supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, items, total_amount, status, created_at, delivery_address");

      if (orderId.trim()) {
        // Search by both phone AND order ID
        query = query
          .or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${cleanPhone.replace(/^\+/, '')}%`)
          .ilike("id", `${orderId.trim()}%`);
      } else {
        // Search by phone only — get latest order
        query = query
          .or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${cleanPhone.replace(/^\+/, '')}%`);
      }

      const { data, error: err } = await query
        .order("created_at", { ascending: false })
        .limit(1);

      if (err) throw err;

      if (data && data.length > 0) {
        setOrder(data[0] as Order);
      } else {
        setError("No order found. Please check your phone number or Order ID and try again.");
      }
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
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-2">Track Your Order</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Enter your phone number to check your order status. No login needed!</p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3 mb-8">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 342 680 7645"
              required
              className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Order ID (Optional)</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. a1b2c3d4..."
              className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Track Order
              </>
            )}
          </motion.button>
        </motion.form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 rounded-2xl text-center mb-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5">
            {/* Order header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
                <p className="text-base sm:text-lg font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-base sm:text-lg font-bold text-primary">Rs.{order.total_amount}</p>
              </div>
            </div>

            {/* Status Timeline */}
            {order.status === "canceled" ? (
              <div className="flex items-center gap-3 bg-destructive/10 p-4 rounded-xl">
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <p className="font-semibold text-destructive">Order Canceled</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Mobile: vertical timeline */}
                <div className="flex sm:hidden flex-col gap-0">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                          i <= currentStepIndex
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {statusIcons[step]}
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-8 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <span className={`text-sm font-semibold capitalize ${i <= currentStepIndex ? "text-primary" : "text-muted-foreground"}`}>
                          {statusLabels[step]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: horizontal timeline */}
                <div className="hidden sm:flex items-center justify-between relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-700"
                    style={{ width: `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 40px)` }}
                  />
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        i <= currentStepIndex
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {statusIcons[step]}
                      </div>
                      <span className={`text-xs font-semibold capitalize ${i <= currentStepIndex ? "text-primary" : "text-muted-foreground"}`}>
                        {statusLabels[step]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
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

            {/* Delivery address */}
            {order.delivery_address && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm text-foreground">{order.delivery_address}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
