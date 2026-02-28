import { motion } from "framer-motion";
import { ShieldCheck, HandCoins, MapPin } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Verified Products" },
  { icon: HandCoins, label: "Pay at Door (After Checking)" },
  { icon: MapPin, label: "Locally Sourced" },
];

const TrustBadges = () => (
  <section className="relative -mt-12 z-10 pb-16">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-pill flex items-center gap-3 cursor-default"
          >
            <badge.icon className="w-5 h-5 text-brand-blue flex-shrink-0" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
