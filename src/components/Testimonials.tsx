import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { quote: "Got my iPhone charger in 45 minutes, amazing service!", name: "Ali M.", location: "Mirpur" },
  { quote: "Best earbuds I've bought. Delivered right to my door, no hassle.", name: "Sara K.", location: "Mirpur" },
  { quote: "Pay at door is a game changer. Verified the product before paying!", name: "Usman R.", location: "Mirpur" },
  { quote: "Super fast delivery and genuine products. Highly recommend!", name: "Hina T.", location: "Mirpur" },
];

const Testimonials = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">Testimonials</span>
        <h2 className="text-3xl sm:text-5xl font-bold text-foreground">
          What Mirpur <span className="text-primary">Says</span>
        </h2>
      </motion.div>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 max-w-5xl md:mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="glass-card p-6 min-w-[80vw] md:min-w-0 snap-center flex flex-col gap-4 relative"
          >
            <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {t.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
