import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { quote: "Got my iPhone charger in 45 minutes, amazing service!", name: "Ali M.", location: "Mirpur" },
  { quote: "Best earbuds I've bought. Delivered right to my door, no hassle.", name: "Sara K.", location: "Mirpur" },
  { quote: "Pay at door is a game changer. Verified the product before paying!", name: "Usman R.", location: "Mirpur" },
  { quote: "Super fast delivery and genuine products. Highly recommend!", name: "Hina T.", location: "Mirpur" },
];

const Testimonials = () => (
  <section className="py-10 sm:py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
          What customers say
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Trusted by Mirpur
        </h2>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-2 px-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 max-w-4xl md:mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="bg-card border border-border/40 rounded-2xl p-5 min-w-[72vw] md:min-w-0 snap-center flex flex-col gap-3 relative hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
          >
            <Quote className="w-6 h-6 text-primary/8 absolute top-4 right-4" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center text-primary font-bold text-[10px]">
                {t.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
