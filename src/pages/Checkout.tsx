import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, FileText, CheckCircle2, Truck, ArrowRight } from "lucide-react";

const steps = [
  { icon: ShoppingCart, label: "Cart" },
  { icon: FileText, label: "Details" },
  { icon: CheckCircle2, label: "Confirmed" },
];

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ fullName: "", email: "", phone: "", address: "", instructions: "" });
  const [promoCode, setPromoCode] = React.useState("");
  const [promoStatus, setPromoStatus] = React.useState<"idle" | "applied" | "invalid" | "checking">("idle");
  const [discountedTotal, setDiscountedTotal] = React.useState<number | null>(null);
  const [result, setResult] = React.useState("");
  const [placedOrderId, setPlacedOrderId] = React.useState<string | null>(null);

  const currentStep = result && result.startsWith("HUKAM Accepted") ? 2 : items.length > 0 ? 1 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const formatCart = () => {
    return items.map((it, idx) => `Item ${idx + 1}: ${it.name} (Qty: ${it.quantity}) - Rs.${it.priceNumber}`).join("\n");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult("Sending....");

    const cartStr = formatCart();
    const cartTotal = discountedTotal !== null ? discountedTotal : subtotal();
    const parsedTotal = Number(cartTotal);
    const appliedPromo = promoStatus === "applied" ? promoCode : null;

    const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "30b97afd-15a6-456e-84e0-08bedd37e77f";
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    fd.append("name", form.fullName);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    fd.append("instructions", form.instructions || "");
    fd.append("message", `Order placed via HUKAM Checkout:\n\nCustomer: ${form.fullName} (${form.email}, ${form.phone})\nAddress: ${form.address}\n\nItems:\n${cartStr}\n\nSubtotal: Rs.${subtotal()}\n\nInstructions: ${form.instructions || "-"}`);
    if (appliedPromo) {
      fd.append("promo_code", appliedPromo);
      fd.append("discounted_total", String(parsedTotal));
    }
    fd.append("access_key", ACCESS_KEY);
    fd.append("subject", "NEW COD ORDER - HUKAM.pk");
    fd.append("from_name", "HUKAM Ordering System");

    try {
      const { data, error } = await supabase.from('orders').insert([{
        customer_name: String(form.fullName),
        customer_email: String(form.email),
        customer_phone: String(form.phone),
        delivery_address: String(form.address),
        instructions: String(form.instructions) || '',
        items: cartStr,
        promo_code: appliedPromo,
        total_amount: parsedTotal,
        status: 'pending'
      }]).select();

      if (error) {
        console.error("SUPABASE INSERT ERROR:", error.message);
        alert("Database Error: " + error.message);
        setResult("");
        return;
      }

      const orderId = data?.[0]?.id;
      setPlacedOrderId(orderId || null);

      // Insert normalized order_items for multi-vendor tracking
      if (orderId) {
        const orderItemsPayload = items.map((it) => ({
          order_id: orderId,
          product_id: it.id,
          product_title: it.name,
          quantity: it.quantity,
          unit_price: it.priceNumber,
        }));
        await supabase.from("order_items").insert(orderItemsPayload);
      }

      // Email notification handled via Web3Forms below
    } catch (err: any) {
      console.error("SUPABASE INSERT EXCEPTION:", err);
      alert("Database Error: " + err.message);
      setResult("");
      return;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setResult("HUKAM Accepted! Your tech is being dispatched. A rider will contact you shortly.");
        clearCart();
      } else {
        setResult(data.message || "Error submitting order");
      }
    } catch (err) {
      console.error("Web3Forms exception:", err);
      setResult("Error submitting order");
    }
  };

  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              i <= currentStep ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-muted-foreground"
            }`}>
              <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 sm:w-24 h-0.5 mx-1 sm:mx-2 mb-5 rounded-full transition-all duration-500 ${
              i < currentStep ? "bg-primary" : "bg-border"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Thank You / Success screen with post-purchase hook
  if (result && result.startsWith("HUKAM Accepted")) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <ProgressBar />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 sm:p-12 rounded-3xl text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">HUKAM Accepted!</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">{result.replace("HUKAM Accepted! ", "")}</p>

            {placedOrderId && (
              <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Order ID</p>
                <p className="text-sm font-mono font-bold text-foreground break-all">{placedOrderId}</p>
                <p className="text-xs text-muted-foreground mt-2">Save this ID to track your order anytime!</p>
              </div>
            )}

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/track-order")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25"
              >
                <Truck className="w-4 h-4" />
                Track Your Order
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/products")}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                Continue Shopping
              </motion.button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">We sent order details to the founder's email. Keep your phone available.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const finalTotal = promoStatus === "applied" && discountedTotal !== null ? discountedTotal : subtotal();

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-32 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ProgressBar />

        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-4xl font-extrabold text-foreground mb-6 sm:mb-8 text-center">
          Checkout — <span className="text-primary">HUKAM</span>
        </motion.h1>

        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <motion.form
            id="checkout-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-5"
          >
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Billing Details</h2>
            <p className="text-xs text-muted-foreground -mt-2">No account needed! Just fill in your details below.</p>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Muhammad Ali" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone (WhatsApp) *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+92 342 680 7645" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Delivery Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange} required placeholder="House #, Street, Area, City" rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none text-base" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Rider Instructions (Optional)</label>
              <textarea name="instructions" value={form.instructions} onChange={handleChange} placeholder="e.g., Call on arrival" rows={2} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none text-base" />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Promo Code</label>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base"
                />
              </div>
              <motion.button
                type="button"
                onClick={async () => {
                  if (!promoCode) return;
                  setPromoStatus("checking");
                  try {
                    const { data, error } = await supabase.from("promo_codes").select("*").eq("code", promoCode).maybeSingle();
                    if (error || !data || !data.is_active) {
                      setPromoStatus("invalid");
                      setDiscountedTotal(null);
                      toast({ title: "Promo code invalid", description: "Please enter a valid active code." });
                    } else {
                      let discount = 0;
                      if (data.discount_type === "percentage") {
                        discount = subtotal() * ((data.discount_percentage || 0) / 100);
                      } else {
                        discount = data.discount_amount || 0;
                      }
                      const newTotal = Math.max(0, subtotal() - discount);
                      setDiscountedTotal(newTotal);
                      setPromoStatus("applied");
                      toast({ title: "Promo applied", description: `You saved Rs.${discount.toFixed(0)}!` });
                    }
                  } catch (err) {
                    console.error(err);
                    setPromoStatus("invalid");
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-secondary text-foreground py-3 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors"
              >
                {promoStatus === "checking" ? "..." : "Apply"}
              </motion.button>
            </div>
            {promoStatus === "applied" && <p className="text-xs text-primary font-semibold">✓ Promo applied!</p>}
            {promoStatus === "invalid" && <p className="text-xs text-destructive font-semibold">✗ Invalid promo code</p>}

            <div className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              💰 Payment: Cash on Delivery
            </div>

            {/* Desktop place order button */}
            <motion.button
              type="submit"
              disabled={items.length === 0 || result === "Sending...."}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:block w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {result === "Sending...." ? "Processing..." : "HUKAM Kijiye (Place Order) ⚡"}
            </motion.button>
          </motion.form>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl h-fit lg:sticky lg:top-24"
          >
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Order Summary</h2>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 items-start">
                    {it.image && <img src={it.image} alt={it.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{it.name}</p>
                      <p className="text-xs text-muted-foreground">Rs.{it.priceNumber} each</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border border-border rounded-lg text-sm">
                          <button onClick={() => updateQuantity(it.id, Math.max(1, it.quantity - 1))} className="px-2 py-0.5 text-muted-foreground hover:text-foreground">−</button>
                          <span className="px-2 py-0.5 font-semibold text-foreground">{it.quantity}</span>
                          <button onClick={() => updateQuantity(it.id, it.quantity + 1)} className="px-2 py-0.5 text-muted-foreground hover:text-foreground">+</button>
                        </div>
                        <button onClick={() => removeItem(it.id)} className="text-xs text-destructive hover:underline ml-auto">Remove</button>
                      </div>
                    </div>
                    <p className="font-bold text-foreground text-sm whitespace-nowrap">Rs.{it.priceNumber * it.quantity}</p>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-border mt-5 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                {promoStatus === "applied" && discountedTotal !== null && (
                  <div className="flex justify-between text-sm text-primary font-medium">
                    <span>Promo Discount</span>
                    <span>-Rs.{(subtotal() - discountedTotal).toFixed(0)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-base sm:text-lg font-extrabold text-foreground">
                  <span>Total</span>
                  <span>Rs.{finalTotal}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background/95 backdrop-blur-xl border-t border-border/40 p-4 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Total</span>
            <span className="text-lg font-extrabold text-foreground">Rs.{finalTotal}</span>
          </div>
          <motion.button
            type="submit"
            form="checkout-form"
            disabled={result === "Sending...."}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {result === "Sending...." ? "Processing..." : "HUKAM Kijiye ⚡"}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
