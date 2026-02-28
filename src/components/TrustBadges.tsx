import { motion } from "framer-motion";
import { ShieldCheck, HandCoins, MapPin, Clock, Sparkles } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Verified Products", desc: "100% genuine accessories" },
  { icon: HandCoins, label: "Pay at Door", desc: "Check before you pay" },
  { icon: MapPin, label: "Locally Sourced", desc: "By Mirpur, for Mirpur" },
  { icon: Clock, label: "60-Min Delivery", desc: "Fastest in the city" },
];

const TrustBadges = () => (
  <section className="relative -mt-16 z-10 pb-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass-card p-5 flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <badge.icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">{badge.label}</span>
            <span className="text-xs text-muted-foreground">{badge.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
