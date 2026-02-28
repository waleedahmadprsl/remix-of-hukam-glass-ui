import { motion } from "framer-motion";
import { Smartphone, MessageCircle, Bike } from "lucide-react";

const steps = [
  { icon: Smartphone, title: "Browse Collection", desc: "Explore our premium tech accessories catalog." },
  { icon: MessageCircle, title: "HUKAM on WhatsApp", desc: "Send us your order — quick, simple, personal." },
  { icon: Bike, title: "Rider at Your Doorstep", desc: "Delivered to your door in under 60 minutes." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 brand-gradient">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4"
      >
        From Screen to Your Door in 60 Mins
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-center text-muted-foreground mb-14 max-w-lg mx-auto"
      >
        Three simple steps to get what you need, fast.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -4 }}
            className="glass-card p-8 text-center flex flex-col items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <step.icon className="w-7 h-7 text-brand-blue" />
            </div>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Step {i + 1}</span>
            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
