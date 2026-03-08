import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/logo-video.mp4";

interface Slide {
  headline: string;
  sub: string;
  cta: string;
  href: string;
  image?: string;
  video?: string;
  accent: string;
}

const slides: Slide[] = [
  {
    headline: "HUKAM — Mirpur's #1 Quick Commerce",
    sub: "Premium tech accessories delivered to your doorstep in 60 minutes.",
    cta: "Shop Now",
    href: "#all-products",
    video: heroVideo,
    accent: "from-primary/20 to-transparent",
  },
  {
    headline: "Premium Tech, Delivered in 60 Minutes",
    sub: "Verified accessories at your doorstep — Cash on Delivery.",
    cta: "Shop Now",
    href: "#all-products",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80",
    accent: "from-primary/20 to-transparent",
  },
  {
    headline: "Flash Deals — Up to 40% Off",
    sub: "Limited time offers on top-selling gadgets.",
    cta: "View Deals",
    href: "#flash-deals",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=80",
    accent: "from-destructive/20 to-transparent",
  },
  {
    headline: "New Arrivals Every Week",
    sub: "Earbuds, chargers, power banks & more — always fresh stock.",
    cta: "Browse Collection",
    href: "/products",
    image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=1400&q=80",
    accent: "from-accent/30 to-transparent",
  },
];

const badges = [
  { icon: Clock, label: "60-Min Delivery" },
  { icon: ShieldCheck, label: "100% Verified" },
  { icon: Truck, label: "Cash on Delivery" },
  { icon: Zap, label: "Flash Deals" },
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
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
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
              <div className="relative h-[44vh] sm:h-[52vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background media */}
                {slide.video ? (
                  <video
                    src={slide.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[8000ms]"
                    style={{ transform: activeIndex === i ? 'scale(1.1)' : 'scale(1)' }}
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

                {/* Content */}
                <div className="relative z-10 text-left px-6 sm:px-12 lg:px-20 max-w-5xl w-full">
                  <AnimatePresence mode="wait">
                    {activeIndex === i && (
                      <motion.div
                        key={`content-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-xs font-medium text-primary">Live Now</span>
                        </motion.div>

                        <motion.h2
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4 max-w-xl"
                        >
                          {slide.headline}
                        </motion.h2>

                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 max-w-md"
                        >
                          {slide.sub}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="flex items-center gap-3"
                        >
                          <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCTA(slide.href)}
                            className="bg-primary text-primary-foreground px-7 py-3 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                          >
                            {slide.cta}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/products")}
                            className="px-7 py-3 rounded-full text-sm font-semibold border border-border/60 text-foreground backdrop-blur-sm hover:bg-foreground/5 transition-colors"
                          >
                            Explore All
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows — minimal */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-20 left-6 sm:left-12 lg:left-20 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: activeIndex === i ? 32 : 12 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${
              activeIndex === i ? "bg-primary" : "bg-foreground/15"
            }`} />
          </button>
        ))}
      </div>

      {/* Trust badges strip */}
      <div className="relative z-10 -mt-1 bg-background border-t border-border/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto scrollbar-hide">
            {badges.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center">
                  <b.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
