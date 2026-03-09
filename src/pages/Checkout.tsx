import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart, getCartKey } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

import { toast } from "@/hooks/use-toast";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ShoppingCart, FileText, CheckCircle2, Truck, ArrowRight } from "lucide-react";


const steps = [
  { icon: ShoppingCart, label: "Cart" },
  { icon: FileText, label: "Details" },
  { icon: CheckCircle2, label: "Confirmed" },
];

const PK_PHONE_REGEX = /^(\+92|0)?\s*3\d{2}[\s-]?\d{7}$/;

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ fullName: "", email: "", phone: "", address: "", instructions: "" });
  const [promoCode, setPromoCode] = React.useState("");
  const [promoStatus, setPromoStatus] = React.useState<"idle" | "applied" | "invalid" | "checking">("idle");
  const [discountedTotal, setDiscountedTotal] = React.useState<number | null>(null);
  const [result, setResult] = React.useState("");
  const [placedOrderId, setPlacedOrderId] = React.useState<string | null>(null);
  const [phoneError, setPhoneError] = React.useState("");

  // Auto-fill from profile
  React.useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || profile.full_name || "",
        phone: f.phone || profile.phone || "",
        address: f.address || (profile.address ? `${profile.address}${profile.city ? ", " + profile.city : ""}` : ""),
      }));
    }
    if (session?.user?.email) {
      setForm((f) => ({ ...f, email: f.email || session.user.email || "" }));
    }
  }, [profile, session]);

  // Empty cart — show UI instead of redirecting
  const isCartEmpty = items.length === 0 && !result;

  const { settings } = useStoreSettings();

  // Calculate shipping dynamically from settings
  const shippingCost = React.useMemo(() => {
    const uniqueShops = new Set(items.map((it) => it.shopId || "own"));
    return uniqueShops.size * (settings.shippingRatePerShop || 50);
  }, [items, settings.shippingRatePerShop]);

  const currentStep = result && result.startsWith("HUKAM Accepted") ? 2 : items.length > 0 ? 1 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "phone") {
      setPhoneError(value && !PK_PHONE_REGEX.test(value.replace(/\s|-/g, "")) ? "Enter a valid Pakistani phone number (e.g. 03123456789)" : "");
    }
  };

  const formatCart = () => {
    return items.map((it, idx) => `Item ${idx + 1}: ${it.name}${it.variantName ? ` (${it.variantName})` : ""} (Qty: ${it.quantity}) - Rs.${it.priceNumber}`).join("\n");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Phone validation
    const cleanPhone = form.phone.replace(/\s|-/g, "");
    if (!PK_PHONE_REGEX.test(cleanPhone)) {
      setPhoneError("Enter a valid Pakistani phone number (e.g. 03123456789)");
      toast({ title: "Invalid phone number", description: "Please enter a valid Pakistani phone number (e.g. 03123456789)", variant: "destructive" });
      return;
    }

    setResult("Sending....");

    // Prepare order data
    const cartStr = formatCart();
    const cartSubtotal = subtotal();
    const discountAmt = promoStatus === "applied" && discountedTotal !== null ? cartSubtotal - discountedTotal : 0;
    const finalTotal = (discountedTotal !== null && promoStatus === "applied" ? discountedTotal : cartSubtotal) + shippingCost;
    const appliedPromo = promoStatus === "applied" ? promoCode : null;

    try {
      const { data, error } = await supabase.from('orders').insert([{
        customer_name: String(form.fullName),
        customer_email: String(form.email),
        customer_phone: String(form.phone),
        delivery_address: String(form.address),
        instructions: String(form.instructions) || '',
        items: cartStr,
        promo_code: appliedPromo,
        total_amount: finalTotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmt,
        status: 'pending',
        user_id: session?.user?.id || null,
      }]).select();

      if (error) {
        console.error("SUPABASE INSERT ERROR:", error.message, error.details, error.hint);
        const friendlyMsg = error.message?.includes("schema cache")
          ? "Our system is temporarily updating. Please try again in a moment."
          : error.message?.includes("violates")
          ? "There was a data conflict. Please refresh and try again."
          : error.message?.includes("network")
          ? "Network issue — please check your connection and retry."
          : `Order failed: ${error.message || "Unknown error"}. Please try again or contact us on WhatsApp.`;
        toast({ title: "❌ Order Failed", description: friendlyMsg, variant: "destructive" });
        setResult("");
        return;
      }

      const orderId = data?.[0]?.id;
      setPlacedOrderId(orderId || null);

      if (orderId) {
        // Insert normalized order_items
        await supabase.from("order_items").insert(
          items.map((it) => ({
            order_id: orderId,
            product_id: it.id,
            product_title: it.name,
            quantity: it.quantity,
            unit_price: it.priceNumber,
            buying_cost: it.buyingCost || 0,
            shop_id: it.shopId || null,
            variant_id: it.variantId || null,
            variant_name: it.variantName || null,
          }))
        );

        // Stock deduction
        for (const it of items) {
          await supabase.rpc("deduct_stock", {
            p_product_id: it.id,
            p_variant_id: it.variantId || null,
            p_quantity: it.quantity,
          });
        }

        // Send order confirmation email via Lovable Cloud edge function
        if (form.email) {
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "jjnkwysssrexpvjyyavs";
          const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqbmt3eXNzc3JleHB2anl5YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTA2MDIsImV4cCI6MjA4Nzg4NjYwMn0.eVW3XIB1Ai_SiHleSUhjiJ3YLARxy9du2Im8BJ9D7Ho";
          fetch(`https://${projectId}.supabase.co/functions/v1/send-order-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": anonKey, "Authorization": `Bearer ${anonKey}` },
            body: JSON.stringify({
              type: "order_confirmation",
              email: form.email,
              customerName: form.fullName,
              orderId,
              totalAmount: finalTotal,
              status: "pending",
              items: cartStr,
            }),
          }).then(r => r.ok ? console.log("Order email sent") : r.text().then(t => console.error("Order email error:", t)))
            .catch(err => console.error("Order email failed:", err));
        }

        // Web3Forms admin notification — fire-and-forget
        const fd = new FormData();
        fd.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "30b97afd-15a6-456e-84e0-08bedd37e77f");
        fd.append("subject", "NEW COD ORDER - HUKAM.pk");
        fd.append("from_name", "HUKAM Ordering System");
        fd.append("name", form.fullName);
        fd.append("email", form.email);
        fd.append("phone", form.phone);
        fd.append("address", form.address);
        fd.append("message", `COD Order:\n\nCustomer: ${form.fullName}\nPhone: ${form.phone}\nEmail: ${form.email}\nAddress: ${form.address}\n\nItems:\n${cartStr}\n\nTotal: Rs.${finalTotal}\n\nOrder ID: ${orderId}`);
        fetch("https://api.web3forms.com/submit", { method: "POST", body: fd }).catch(() => {});
      }

      setResult("HUKAM Accepted! Your tech is being dispatched. A rider will contact you shortly.");
      clearCart();

    } catch (err: any) {
      console.error("SUPABASE INSERT EXCEPTION:", err);
      toast({
        title: "❌ Something went wrong",
        description: "We couldn't place your order. Please try again or reach us on WhatsApp for help.",
        variant: "destructive",
      });
      setResult("");
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

  // Thank You / Success screen
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

            <p className="text-xs text-muted-foreground mt-6">A confirmation has been sent to your email. Our rider will contact you shortly.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const cartSubtotal = subtotal();
  const discountAmt = promoStatus === "applied" && discountedTotal !== null ? cartSubtotal - discountedTotal : 0;
  const finalTotal = (discountedTotal !== null && promoStatus === "applied" ? discountedTotal : cartSubtotal) + shippingCost;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass-card p-12 rounded-3xl max-w-md w-full">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet. Browse our collection and find something you love!</p>
          <motion.button
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/25"
          >
            Browse Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="03123456789" className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-base ${phoneError ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10"}`} />
              {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
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
              disabled={items.length === 0 || result === "Sending...." || !!phoneError}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:block w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {result === "Sending...." ? "Processing..." : "Place Order ⚡"}
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
                  <div key={it.variantId ? `${it.id}__${it.variantId}` : it.id} className="flex gap-3 items-start">
                    {it.image && <img src={it.image} alt={it.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{it.name}</p>
                      {it.variantName && <p className="text-xs text-muted-foreground">{it.variantName}</p>}
                      <p className="text-xs text-muted-foreground">Rs.{it.priceNumber} each</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border border-border rounded-lg text-sm">
                        <button onClick={() => updateQuantity(getCartKey(it), Math.max(1, it.quantity - 1))} className="px-2 py-0.5 text-muted-foreground hover:text-foreground">−</button>
                          <span className="px-2 py-0.5 font-semibold text-foreground">{it.quantity}</span>
                          <button onClick={() => updateQuantity(getCartKey(it), it.quantity + 1)} className="px-2 py-0.5 text-muted-foreground hover:text-foreground">+</button>
                        </div>
                        <button onClick={() => removeItem(getCartKey(it))} className="text-xs text-destructive hover:underline ml-auto">Remove</button>
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
                  <span>Rs.{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex flex-col">
                    <span>Delivery</span>
                    <span className="text-xs text-primary">Est. 2-3 Business Days</span>
                  </div>
                  <span className="text-foreground font-medium">Rs.{shippingCost}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-sm text-primary font-medium">
                    <span>Promo Discount</span>
                    <span>-Rs.{discountAmt.toFixed(0)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-base sm:text-lg font-extrabold text-foreground">
                  <span>Total</span>
                  <span>Rs.{finalTotal.toLocaleString()}</span>
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
            <span className="text-lg font-extrabold text-foreground">Rs.{finalTotal.toLocaleString()}</span>
          </div>
          <motion.button
            type="submit"
            form="checkout-form"
            disabled={result === "Sending...." || !!phoneError}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {result === "Sending...." ? "Processing..." : "Place Order ⚡"}
          </motion.button>
        </div>
      )}

    </div>
  );
};

export default Checkout;
