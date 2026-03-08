import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, Clock, Truck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/logo-video.mp4";
import heroProducts from "@/assets/hero-products.jpg";
import heroDelivery from "@/assets/hero-delivery.jpg";

interface Slide {
  headline: string;
  sub: string;
  cta: string;
  ctaSecondary?: string;
  href: string;
  media: { type: "video"; src: string } | { type: "image"; src: string };
}

const slides: Slide[] = [
  {
    headline: "HUKAM — Mirpur's #1\nQuick Commerce",
    sub: "Premium tech accessories delivered to your doorstep in 60 minutes.",
    cta: "Shop Now",
    ctaSecondary: "Explore All",
    href: "#all-products",
    media: { type: "video", src: heroVideo },
  },
  {
    headline: "Top-Tier Tech,\nUnbeatable Prices",
    sub: "Earbuds, chargers, cables & power banks — all under one roof.",
    cta: "Browse Collection",
    href: "/products",
    media: { type: "image", src: heroProducts },
  },
  {
    headline: "60-Minute Delivery\nTo Your Door",
    sub: "Order now, get it within the hour. Cash on delivery available.",
    cta: "Order Now",
    href: "#all-products",
    media: { type: "image", src: heroDelivery },
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
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
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
    <section className="relative pt-14 sm:pt-16">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative h-[56vh] min-h-[360px] sm:h-[52vh] lg:h-[60vh] flex items-end sm:items-center overflow-hidden">
                {/* Media background */}
                {slide.media.type === "video" ? (
                  <video
                    src={slide.media.src}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.media.src}
                    alt={slide.headline}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Overlays - stronger on mobile for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20 sm:from-background sm:via-background/50 sm:to-background/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent sm:from-background/70" />

                {/* Content */}
                <div className="relative z-10 w-full px-5 pb-16 sm:pb-0 sm:px-12 lg:px-20 max-w-5xl">
                  <AnimatePresence mode="wait">
                    {activeIndex === i && (
                      <motion.div
                        key={`slide-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-3 sm:mb-4"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[11px] sm:text-xs font-medium text-primary">Live Now</span>
                        </motion.div>

                        <motion.h2
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-3 sm:mb-4 max-w-md sm:max-w-xl whitespace-pre-line"
                        >
                          {slide.headline}
                        </motion.h2>

                        <motion.p
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-5 sm:mb-6 max-w-sm sm:max-w-md"
                        >
                          {slide.sub}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="flex items-center gap-3"
                        >
                          <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCTA(slide.href)}
                            className="bg-primary text-primary-foreground px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                          >
                            {slide.cta}
                          </motion.button>
                          {slide.ctaSecondary && (
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => navigate("/products")}
                              className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold border border-border/60 text-foreground backdrop-blur-sm hover:bg-foreground/5 transition-colors"
                            >
                              {slide.ctaSecondary}
                            </motion.button>
                          )}
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

      {/* Nav arrows - hidden on very small screens */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 sm:left-4 top-[45%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 sm:right-4 top-[45%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-[72px] sm:bottom-20 left-5 sm:left-12 lg:left-20 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: activeIndex === i ? 28 : 10 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${
              activeIndex === i ? "bg-primary" : "bg-foreground/20"
            }`} />
          </button>
        ))}
      </div>

      {/* Trust badges strip */}
      <div className="relative z-10 bg-background border-t border-border/20">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto sm:justify-center" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {badges.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground whitespace-nowrap flex-shrink-0"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/8 flex items-center justify-center">
                  <b.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
