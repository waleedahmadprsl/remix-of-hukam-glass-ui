import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import logoVideo from "@/assets/logo-video.mp4";

export default function AboutUs() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleVideoError = (e: any) => {
    console.error("Video load error:", e);
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount((c) => c + 1);
        if (videoRef.current) {
          const src =
            (videoRef.current.currentSrc as string) || videoRef.current.getAttribute("src") || "/logo video.mp4";
          videoRef.current.src = src + (src.includes("?") ? `&r=${Date.now()}` : `?r=${Date.now()}`);
          videoRef.current.load();
          videoRef.current.play().catch((err) => console.warn("Play attempt failed:", err));
        }
      }, 800);
    }
  };

  return (
    <section id="about-us" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Built in Mirpur, <span className="text-brand-blue">for Mirpur.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              HUKAM is on a mission to bring hyper-local, high-speed commerce to our city. No more waiting days for deliveries.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Founded by a local tech enthusiast known simply as Hukam, this brand was born from a simple frustration — why should Mirpur wait 3-5 days for a phone charger? We deliver premium tech accessories to your doorstep in under 60 minutes, because your time matters.
            </p>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-3 aspect-[4/3] min-h-[220px] flex items-center justify-center overflow-hidden relative"
          >
            <video
              ref={videoRef}
              src={logoVideo}
              poster="/logo-poster.jpg"
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              onError={handleVideoError}
              className="w-full h-full object-cover rounded-2xl shadow-lg border border-white/50 relative z-10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
