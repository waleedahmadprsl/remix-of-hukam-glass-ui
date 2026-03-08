import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    headline: "Premium Tech, Delivered in 60 Minutes",
    sub: "Verified accessories at your doorstep — Cash on Delivery.",
    cta: "Shop Now",
    href: "#all-products",
    gradient: "from-primary/20 via-accent/30 to-secondary/40",
  },
  {
    headline: "Flash Deals — Up to 40% Off",
    sub: "Limited time offers on top-selling gadgets.",
    cta: "View Deals",
    href: "#flash-deals",
    gradient: "from-destructive/10 via-primary/20 to-accent/30",
  },
  {
    headline: "New Arrivals Every Week",
    sub: "Earbuds, chargers, power banks & more — always fresh stock.",
    cta: "Browse Collection",
    href: "/products",
    gradient: "from-secondary/40 via-primary/10 to-accent/20",
  },
];

const badges = [
  { icon: Clock, label: "60-Min Delivery" },
  { icon: ShieldCheck, label: "100% Verified" },
  { icon: Truck, label: "Cash on Delivery" },
];

const BannerCarousel = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    const interval = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleCTA = (href: string) => {
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <section className="relative pt-16">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full">
              <div
                className={`relative h-[50vh] sm:h-[55vh] lg:h-[60vh] bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}
              >
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                  <motion.h2
                    key={`h-${i}-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={activeIndex === i ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4"
                  >
                    {slide.headline}
                  </motion.h2>
                  <motion.p
                    key={`p-${i}-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={activeIndex === i ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-muted-foreground text-base sm:text-lg mb-8"
                  >
                    {slide.sub}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={activeIndex === i ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCTA(slide.href)}
                    className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-shadow"
                  >
                    {slide.cta}
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === i ? "w-6 bg-primary" : "w-2 bg-foreground/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Trust badges strip */}
      <div className="bg-background/80 backdrop-blur-md border-t border-border/30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-6 sm:gap-10">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-muted-foreground">
              <b.icon className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
