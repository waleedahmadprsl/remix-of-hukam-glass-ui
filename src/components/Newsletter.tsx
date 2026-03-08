import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already subscribed!", description: "This email is already on our list." });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Subscribed! 🎉", description: "You'll hear from us soon." });
      }
      setEmail("");
    } catch {
      toast({ title: "Oops", description: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-2xl"
      >
        <div className="glass-card px-6 py-8 sm:px-10 sm:py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-4">
            <Mail className="w-3.5 h-3.5" />
            Newsletter
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Stay in the Loop</h3>
          <p className="text-sm text-muted-foreground mb-6">Get exclusive deals & new arrivals straight to your inbox.</p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background/60 border-border/40"
              required
              disabled={loading}
            />
            <Button type="submit" size="sm" className="gap-1.5 rounded-lg" disabled={loading}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Subscribe <ArrowRight className="w-3.5 h-3.5" /></>}
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
