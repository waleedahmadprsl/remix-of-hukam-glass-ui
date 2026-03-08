import { motion } from "framer-motion";
import { Smartphone, ShoppingCart, Bike, ArrowRight } from "lucide-react";

const steps = [
  { icon: Smartphone, title: "Browse Collection", desc: "Explore our premium tech accessories catalog with real images and prices.", color: "from-primary/10 to-primary/5" },
  { icon: ShoppingCart, title: "Add to Cart", desc: "Pick your products and add them to your cart — fast, simple checkout.", color: "from-primary/15 to-primary/5" },
  { icon: Bike, title: "Rider at Your Doorstep", desc: "Delivered to your door in under 60 minutes. Pay after checking.", color: "from-primary/10 to-primary/5" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 relative overflow-hidden">
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">How It Works</span>
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground">
          From Screen to Door in{" "}
          <span className="text-primary">60 Mins</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Three simple steps to get what you need, fast.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
            className="glass-card p-8 text-center flex flex-col items-center gap-5 relative group"
          >
            {/* Step number */}
            <div className="absolute top-4 right-4 text-5xl font-black text-primary/[0.06] select-none">
              0{i + 1}
            </div>

            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <step.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

            {i < steps.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-primary/30" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
