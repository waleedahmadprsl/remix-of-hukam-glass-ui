import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield } from "lucide-react";
import logoVideo from "@/assets/logo-video.mp4";

const About = () => {
  const navigate = useNavigate();
  const milestones = [
    { icon: Zap, title: "60-Minute Delivery", desc: "The fastest in Mirpur." },
    { icon: Shield, title: "100% Verified", desc: "Check before you pay at your doorstep." },
    { icon: CheckCircle2, title: "Premium Products", desc: "A highly curated tech selection." },
  ];

  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6">
              Built in Mirpur, <span className="text-brand-blue">for Mirpur.</span>
            </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The story of how one young founder disrupted quick-commerce in Azad Kashmir.
          </p>
        </motion.div>

        {/* Main Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          {/* Left: Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card rounded-3xl h-96 flex items-center justify-center overflow-hidden relative">
              <video
                ref={videoRef}
                src={logoVideo}
                poster="/logo-poster.jpg"
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                onError={(e) => {
                  console.error("Video load error:", e);
                  // simple retry
                  if (videoRef && videoRef.current) {
                    try {
                      const v = videoRef.current as HTMLVideoElement;
                      const current = v.currentSrc || v.getAttribute("src") || logoVideo;
                      const src = String(current);
                      v.src = src + (src.includes("?") ? `&r=${Date.now()}` : `?r=${Date.now()}`);
                      v.load();
                      v.play().catch((err) => console.warn("Play attempt failed:", err));
                    } catch (err) {
                      console.warn("Retry failed:", err);
                    }
                  }
                }}
                className="w-full h-full object-cover rounded-2xl shadow-lg border border-white/50 relative z-10"
              />
            </div>
          </motion.div>

          {/* Right: Story Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">The Problem</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Living in the heart of Mirpur, our founder—known simply as Hukam—noticed a persistent frustration. If you needed a phone charger, a USB cable, or high-quality earbuds, you had to wait 2-7 days for a delivery from Islamabad or Lahore. This wasn't acceptable.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission: 60 Minutes</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hukam decided to solve the problem directly. The goal was simple: locally source, authenticate, and deliver verified mobile accessories in just 60 minutes. No long waits. No mystery boxes. No compromises on quality. The brand HUKAM was born from a simple belief: "Mirpur deserves premium tech, delivered faster."
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">The HUKAM Promise</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every product in our vault is hand-inspected. Every customer checks the item before paying. Every delivery respects your time. We've built this on the principle of hyper-local, hyper-reliable, hyper-fast service.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {milestones.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card p-8 rounded-2xl text-center hover-lift"
                >
                  <Icon className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Why Choose HUKAM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-12 lg:p-16 mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
            Why Mirpur Chooses HUKAM
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                <span className="text-lg text-foreground">
                  <strong>60-minute delivery</strong> within Mirpur city limits
                </span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                <span className="text-lg text-foreground">
                  <strong>Check before pay</strong> – verify quality at your doorstep
                </span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                <span className="text-lg text-foreground">
                  <strong>100% authentic products</strong> from verified suppliers
                </span>
              </li>
            </ul>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                <span className="text-lg text-foreground">
                   <strong>Easy online ordering</strong> – 24/7 support, seamless checkout
                </span>
              </li>

              <li className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                <span className="text-lg text-foreground">
                  <strong>B2B Wholesale Portal</strong> for shops and resellers
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Experience HUKAM?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Order your first product today and join thousands of satisfied customers in Mirpur.
          </p>
          <motion.button
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-primary/25"
          >
            Shop Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
