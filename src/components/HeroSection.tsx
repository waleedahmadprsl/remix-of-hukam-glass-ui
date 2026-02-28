import { motion } from "framer-motion";
import logoVideo from "@/assets/logo-video.mp4";
import hukamName from "@/assets/hukam-name.png";

const HeroSection = () => (
  <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    {/* Background video */}
    <video
      src={logoVideo}
      poster="/logo-poster.jpg"
      autoPlay
      loop
      muted
      playsInline
      onError={(e) => console.error("Hero video error:", e)}
      className="absolute inset-0 w-full h-full object-cover"
    />
    {/* Premium frosted overlay */}
    <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Floating glass badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 px-5 py-2 rounded-full border border-primary/20 bg-background/50 backdrop-blur-md text-xs font-semibold uppercase tracking-[0.2em] text-primary"
        >
          ⚡ 60-Minute Delivery in Mirpur
        </motion.div>

        {/* Brand name image */}
        <motion.img
          src={hukamName}
          alt="HUKAM"
          initial={{ scale: 0.4, opacity: 0, y: 20 }}
          animate={{ scale: 2.8, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-16 sm:h-20 lg:h-28 mb-6"
        />

        {/* Tagline */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
        >
          Order Nahi,{" "}
          <span className="relative inline-block">
            HUK<span className="text-primary">A</span>M
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30 rounded-full origin-left"
            />
          </span>{" "}
          Kijiye.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Premium tech accessories delivered to your doorstep — founded by a local tech enthusiast known simply as Hukam.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.a
            href="https://wa.me/923426807645?text=Hi%20HUKAM!%20I%20want%20to%20place%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
          >
            HUKAM on WhatsApp ⚡
          </motion.a>
          <motion.a
            href="#all-products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 border border-primary/30 text-foreground px-8 py-4 rounded-full text-lg font-medium bg-background/40 backdrop-blur-md hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            Browse Collection
          </motion.a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16 flex items-center gap-8 sm:gap-12"
        >
          {[
            { value: "500+", label: "Orders Delivered" },
            { value: "<60", label: "Min Delivery" },
            { value: "100%", label: "Verified Products" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
  </section>
);

export default HeroSection;
