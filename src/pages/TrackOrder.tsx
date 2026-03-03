import React from "react";
import { motion } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = ["pending", "confirmed", "dispatched", "delivered"];

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
  items: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

const TrackOrder: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Try by order ID first (partial match)
      let { data, error: err } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, items, total_amount, status, created_at")
        .or(`id.eq.${query.trim()},customer_phone.eq.${query.trim()}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (err) throw err;

      if (!data || data.length === 0) {
        // Try phone with different formats
        const cleanPhone = query.replace(/\s+/g, "").replace(/^\+/, "");
        const { data: phoneData, error: phoneErr } = await supabase
          .from("orders")
          .select("id, customer_name, customer_phone, items, total_amount, status, created_at")
          .ilike("customer_phone", `%${cleanPhone}%`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (phoneErr) throw phoneErr;
        data = phoneData;
      }

      if (data && data.length > 0) {
        setOrder(data[0] as Order);
      } else {
        setError("No order found. Please check your Order ID or phone number.");
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
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">HUKAM</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your Order ID or phone number to check status.</p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID or phone number..."
            className="w-full pl-12 pr-28 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "..." : "Track"}
          </motion.button>
        </motion.form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 rounded-2xl text-center">
            <p className="text-muted-foreground">{error}</p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
                <p className="text-lg font-bold text-foreground">#{order.id.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-lg font-bold text-primary">Rs.{order.total_amount}</p>
              </div>
            </div>

            {/* Status Timeline */}
            {order.status === "canceled" ? (
              <div className="flex items-center gap-3 bg-destructive/10 p-4 rounded-xl">
                <XCircle className="w-6 h-6 text-destructive" />
                <p className="font-semibold text-destructive">Order Canceled</p>
              </div>
            ) : (
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
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
                      {step}
                    </span>
                  </div>
                ))}
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
