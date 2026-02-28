import { motion } from "framer-motion";
import logoVideo from "@/assets/logo-video.mp4";
import hukamName from "@/assets/hukam-name.png";

const HeroSection = () => (
  <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    <video
      src={logoVideo}
      poster="/logo-poster.jpg"
      autoPlay={true}
      loop={true}
      muted={true}
      playsInline={true}
      onError={(e) => console.error("Hero video error:", e)}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.img
          src={hukamName}
          alt="HUKAM"
          // start small so it grows visibly to 300%
          initial={{ scale: 0.3, opacity: 0 }}
          // final scale 3.0 gives 300% of the original asset size
          animate={{ scale: 3.0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-20 sm:h-24 lg:h-32 mb-8"
        />

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          Order Nahi,{" "}
          <span>
            HUK<span className="text-brand-blue">A</span>M
          </span>{" "}
          Kijiye.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl"
        >
          Founded by a local tech enthusiast known simply as Hukam, HUKAM delivers premium tech accessories to your doorstep in under 60 minutes.
        </motion.p>

        <motion.a
          href="https://wa.me/923426807645?text=Hi%20HUKAM!%20I%20want%20to%20place%20an%20order."
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold animate-pulse-glow transition-all duration-300"
        >
          HUKAM on WhatsApp ⚡
        </motion.a>
      </div>
    </div>
  </section>
);

export default HeroSection;
