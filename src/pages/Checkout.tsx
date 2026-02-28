import React from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const [form, setForm] = React.useState({ fullName: "", email: "", phone: "", address: "", instructions: "" });
  const [promoCode, setPromoCode] = React.useState("");
  const [promoStatus, setPromoStatus] = React.useState<"idle" | "applied" | "invalid" | "checking">("idle");
  const [discountedTotal, setDiscountedTotal] = React.useState<number | null>(null);
  const [result, setResult] = React.useState("");

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

    // prepare formData for Web3Forms separately
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

    // attempt Supabase insert first
    try {
      const { data, error } = await supabase.from('orders').insert([{
        customer_name: String(form.fullName),
        phone: String(form.phone),
        address: String(form.address),
        instructions: String(form.instructions) || '',
        total_amount: parsedTotal,
        promo_code_used: appliedPromo,
        status: 'pending'
      }]);

      if (error) {
        console.error("🔥 SUPABASE INSERT ERROR:", error.message, error.details, error.hint);
        alert("Database Error: " + error.message);
        return;
      }
    } catch (err: any) {
      console.error("🔥 SUPABASE INSERT EXCEPTION:", err);
      alert("Database Error: " + err.message);
      return;
    }

    // now send Web3Forms request independently
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const data = await res.json();
      console.log("web3forms checkout response:", data);
      if (data.success) {
        setResult("HUKAM Accepted! Your tech is being dispatched to Mirpur. A rider will contact you within 60 minutes.");
        clearCart();
      } else {
        console.error("Web3Forms failed:", data);
        setResult(data.message || "Error submitting order");
      }
    } catch (err) {
      console.error("Web3Forms exception:", err);
      setResult("Error submitting order");
    }
  };

  if (result && result.startsWith("HUKAM Accepted")) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 rounded-3xl text-center">
            <h1 className="text-4xl font-extrabold text-foreground mb-6">HUKAM Accepted!</h1>
            <p className="text-lg text-muted-foreground mb-8">Your tech is being dispatched to Mirpur. A rider will contact you within 60 minutes.</p>
            <p className="text-sm text-muted-foreground">We sent order details to the founder's email. Keep your phone available.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-foreground mb-8">Checkout - HUKAM</motion.h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Billing Details</h2>
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone (WhatsApp)" className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            <textarea name="address" value={form.address} onChange={handleChange} required placeholder="Exact Delivery Address (Mirpur)" rows={4} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />
            <textarea name="instructions" value={form.instructions} onChange={handleChange} placeholder="Instructions for Rider" rows={3} className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg" />

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg"
                />
              </div>
              <motion.button
                type="button"
                onClick={async () => {
                  if (!promoCode) return;
                  setPromoStatus("checking");
                  try {
                    const { data, error } = await supabase
                      .from("promo_codes")
                      .select("*")
                      .eq("code", promoCode)
                      .single();
                    if (error || !data || !data.is_active) {
                      setPromoStatus("invalid");
                      setDiscountedTotal(null);
                      toast({ title: "Promo code invalid", description: "Please enter a valid active code." });
                    } else {
                      const discount = subtotal() * (data.discount_percentage / 100);
                      const newTotal = subtotal() - discount;
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
                className="w-full bg-secondary text-foreground py-3 rounded-lg font-semibold"
              >
                Apply
              </motion.button>
            </div>

            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">Payment Method: Cash on Delivery (Check Before You Pay)</div>

            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold">HUKAM Kijiye (Place Order)</motion.button>
          </motion.form>

          <motion.div className="glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty.</p>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {it.image && <img src={it.image} alt={it.name} className="w-14 h-14 object-cover rounded-md" />}
                      <div>
                        <div className="font-semibold text-foreground">{it.name}</div>
                        <div className="text-sm text-muted-foreground">Rs.{it.priceNumber} each</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border/40 rounded-md">
                        <button
                          onClick={() => updateQuantity(it.id, Math.max(1, it.quantity - 1))}
                          className="px-3 py-1"
                        >
                          -
                        </button>
                        <div className="px-4 py-1">{it.quantity}</div>
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity + 1)}
                          className="px-3 py-1"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold text-foreground">Rs.{it.priceNumber * it.quantity}</div>

                      <button onClick={() => removeItem(it.id)} className="text-sm text-destructive px-2">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border/40 mt-6 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>Rs.{subtotal()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>60-Min Delivery Fee</span>
                <span>Free</span>
              </div>
              {promoStatus === "applied" && discountedTotal !== null ? (
                <>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Discounted Total</span>
                    <span>Rs.{discountedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>Rs.{discountedTotal}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>Rs.{subtotal()}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
