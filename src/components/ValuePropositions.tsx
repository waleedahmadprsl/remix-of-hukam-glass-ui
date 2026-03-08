import { motion } from "framer-motion";
import { Truck, Banknote, ShieldCheck, UserCheck } from "lucide-react";

const props = [
  { icon: Truck, title: "60-Min Delivery", desc: "Lightning-fast delivery in Mirpur city. Same-day for nearby areas." },
  { icon: Banknote, title: "Cash on Delivery", desc: "No online payment hassle. Pay when your order arrives at your door." },
  { icon: ShieldCheck, title: "100% Genuine", desc: "Every product verified for quality. No fakes, no knock-offs." },
  { icon: UserCheck, title: "No Account Needed", desc: "Just pick your items & checkout. No signup, no passwords, no friction." },
];

const ValuePropositions = () => (
  <section className="py-8 sm:py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {props.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center text-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/10"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <p.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground">{p.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ValuePropositions;
