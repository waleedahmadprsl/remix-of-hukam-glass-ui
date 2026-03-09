import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, MapPin, Hash, MessageCircle, ChevronDown, RotateCcw, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = ["pending", "confirmed", "dispatched", "delivered"];
const returnableStatuses = ["delivered"];

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  dispatched: "Out for Delivery",
  delivered: "Delivered",
  canceled: "Canceled",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  returned: "Returned",
};

const statusDescriptions: Record<string, string> = {
  pending: "Your order has been received and is awaiting confirmation.",
  confirmed: "Your order has been confirmed and is being prepared.",
  dispatched: "Your order is on its way to you!",
  delivered: "Your order has been delivered successfully.",
  canceled: "This order has been canceled.",
  return_requested: "Return request submitted. Our team will review it.",
  return_approved: "Return approved. Please send the item back.",
  returned: "Item returned and refund processed.",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <CheckCircle2 className="w-5 h-5" />,
  dispatched: <Truck className="w-5 h-5" />,
  delivered: <Package className="w-5 h-5" />,
  canceled: <XCircle className="w-5 h-5" />,
  return_requested: <RotateCcw className="w-5 h-5" />,
  return_approved: <CheckCircle2 className="w-5 h-5" />,
  returned: <RotateCcw className="w-5 h-5" />,
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
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [searched, setSearched] = React.useState(false);
  const [showReturnForm, setShowReturnForm] = React.useState<string | null>(null);
  const [returnReason, setReturnReason] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    setLoading(true); setError(""); setOrders([]); setSearched(false); setExpandedId(null);

    try {
      const cleanPhone = phone.replace(/[\s\-()]/g, "");

      let query = supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, items, total_amount, status, created_at, delivery_address, tracking_id, shipping_cost")
        .or(`customer_phone.ilike.%${cleanPhone}%,customer_phone.ilike.%${cleanPhone.replace(/^\+/, '')}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      // If order ID provided, filter further
      if (orderId.trim()) {
        const cleanOrderId = orderId.trim().toLowerCase();
        query = query.ilike("id", `${cleanOrderId}%`);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setSearched(true);
      if (data && data.length > 0) {
        setOrders(data as Order[]);
        // Auto-expand if only one result
        if (data.length === 1) setExpandedId(data[0].id);
      } else {
        setError("No orders found for this phone number.");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (orderId: string) => {
    if (!returnReason.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "return_requested",
          instructions: `RETURN REQUEST: ${returnReason}\n\n${orders.find(o => o.id === orderId)?.instructions || ""}`
        })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: "return_requested" }
          : order
      ));

      setShowReturnForm(null);
      setReturnReason("");
      
      // You could also trigger a notification to admins here
      toast({ 
        title: "Return Requested", 
        description: "Your return request has been submitted. We'll review it shortly." 
      });

    } catch (err: any) {
      console.error("Return request error:", err);
      toast({ 
        title: "Error", 
        description: "Failed to submit return request", 
        variant: "destructive" 
      });
    }
  };

  const renderOrderDetail = (order: Order) => {
    const currentStepIndex = order.status === "canceled" ? -1 : statusSteps.indexOf(order.status);

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="pt-4 space-y-4">
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

          {/* Return Request Section */}
          {returnableStatuses.includes(order.status) && !order.status.includes("return") && (
            <div className="border-t border-border/40 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Return Item</p>
                {showReturnForm !== order.id ? (
                  <button
                    onClick={() => setShowReturnForm(order.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Request Return
                  </button>
                ) : null}
              </div>

              {showReturnForm === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 bg-secondary/20 rounded-xl p-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Reason for Return *
                    </label>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="e.g., Item damaged, wrong size, not as described..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReturnRequest(order.id)}
                      disabled={!returnReason.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Submit Request
                    </button>
                    <button
                      onClick={() => {
                        setShowReturnForm(null);
                        setReturnReason("");
                      }}
                      className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Return Status Display */}
          {order.status.includes("return") && (
            <div className="border-t border-border/40 pt-4">
              <div className="flex items-center gap-2 p-3 bg-destructive/5 rounded-xl">
                <RotateCcw className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {statusLabels[order.status] || "Return in Progress"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {statusDescriptions[order.status] || "Return is being processed"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-20 px-4">
      <div className="mx-auto max-w-xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2 block">HUKAM</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-2 font-display">Track Your Order</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Enter your phone number to find all your orders.</p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3 mb-8">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 342 680 7645" required className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Order ID <span className="text-muted-foreground/60 normal-case">(optional)</span></label>
            <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. a1b2c3d4... (leave blank to see all)" className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
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

        {orders.length > 0 && (
          <div className="space-y-3">
            {orders.length > 1 && (
              <p className="text-xs text-muted-foreground text-center mb-2">{orders.length} orders found — tap to expand</p>
            )}
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 sm:p-6 rounded-2xl"
              >
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Rs.{order.total_amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.status === "delivered" ? "bg-primary/10 text-primary" :
                      order.status === "canceled" ? "bg-destructive/10 text-destructive" :
                      order.status.includes("return") ? "bg-destructive/10 text-destructive" :
                      order.status === "dispatched" ? "bg-accent text-accent-foreground" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === order.id && renderOrderDetail(order)}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* WhatsApp Support CTA */}
        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-center">
            <p className="text-xs text-muted-foreground mb-3">Need help with your order?</p>
            <a
              href="https://wa.me/923277786498?text=Hi%20HUKAM%2C%20I%20need%20help%20with%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-semibold text-sm hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
