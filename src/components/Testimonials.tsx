import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import logoVideo from "@/assets/logo-video.mp4";

const testimonials = [
  { quote: "Got my iPhone charger in 45 minutes, amazing service!", name: "Ali M.", location: "Mirpur", initials: "AM" },
  { quote: "Best earbuds I've bought. Delivered right to my door, no hassle.", name: "Sara K.", location: "Mirpur", initials: "SK" },
  { quote: "Pay at door is a game changer. Verified the product before paying!", name: "Usman R.", location: "Mirpur", initials: "UR" },
  { quote: "Super fast delivery and genuine products. Highly recommend!", name: "Hina T.", location: "Mirpur", initials: "HT" },
];

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-accent text-accent-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-muted text-muted-foreground",
];

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="text-center flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
              What customers say
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Trusted by Mirpur
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-muted/60 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-muted/60 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Brand video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-muted/20">
            <video
              src={logoVideo}
              className="w-full aspect-video object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/logo-poster.jpg"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">See what HUKAM is all about</p>
        </motion.div>

        {/* Testimonial cards */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-2 px-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 max-w-4xl md:mx-auto scrollbar-hide">
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
              <div className="flex items-center gap-2.5 pt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}>
                  {t.initials}
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
};

export default Testimonials;
