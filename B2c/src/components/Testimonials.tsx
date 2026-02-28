import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "Got my iPhone charger in 45 minutes, amazing service!", name: "Ali M.", location: "Mirpur" },
  { quote: "Best earbuds I've bought. Delivered right to my door, no hassle.", name: "Sara K.", location: "Mirpur" },
  { quote: "Pay at door is a game changer. Verified the product before paying!", name: "Usman R.", location: "Mirpur" },
  { quote: "Super fast delivery and genuine products. Highly recommend!", name: "Hina T.", location: "Mirpur" },
];

const Testimonials = () => (
  <section className="py-20 brand-gradient">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12"
      >
        What Mirpur Says
      </motion.h2>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 max-w-5xl md:mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-card p-6 min-w-[80vw] md:min-w-0 snap-center flex flex-col gap-4"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-brand-blue text-brand-blue" />
              ))}
            </div>
            <p className="text-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
            <p className="text-xs text-muted-foreground font-medium">{t.name}, {t.location}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
