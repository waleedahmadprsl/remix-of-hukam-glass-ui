import { motion } from "framer-motion";

const RefundPolicy = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Our 100% Doorstep Checking Guarantee
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            At HUKAM, we believe in complete transparency. You check the product at your doorstep before paying. 
            If something's wrong, it's our responsibility to make it right—instantly.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: February 28, 2026
          </p>
        </motion.div>

        {/* The HUKAM Promise */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 rounded-3xl mb-16 text-center max-w-2xl mx-auto border-2 border-primary/30"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">The HUKAM Promise</h2>
          <p className="text-lg text-foreground leading-relaxed">
            We don't hide behind complicated 14-day return policies or restocking fees. We give you the ultimate power: 
            <span className="block font-bold mt-3">The Doorstep Check.</span>
            <span className="block mt-2">You inspect the product before you pay. If it's broken or not what you ordered, you don't pay a single rupee.</span>
          </p>
        </motion.div>

        {/* Policy Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8 mb-16"
        >
          {/* Section 1: Before Payment */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">Before Payment: Your Right to Check</h3>
            <p className="text-foreground/80 mb-4">When our rider arrives, you are in control:</p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80">Open the package in front of our delivery partner.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80">Check the product for physical damage and correct model/color.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80">Verify that the packaging and accessories are intact.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80"><strong>If anything is wrong, refuse payment.</strong> No questions asked. No delivery charges.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: After Payment */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">After Payment: The "Final Sale" Acceptance</h3>
            <p className="text-foreground/80 mb-4">
              Because we offer 100% transparency before payment, our post-payment policy is strictly designed to keep our prices low and deliveries fast.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80"><strong>By handing over the cash or completing the digital transfer,</strong> you officially confirm the product is in perfect condition.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80"><strong>All sales are final</strong> once the rider departs.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                <span className="text-foreground/80"><strong>We do not offer 7-day replacements,</strong> "change of mind" returns, or refunds after the doorstep handover is complete.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: What Is NOT Covered */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">What Is NOT Covered</h3>
            <p className="text-foreground/80 mb-4">
              To keep this hyper-local system fair and fast for everyone in Mirpur, we cannot accept:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-destructive font-bold text-xl flex-shrink-0">✗</span>
                <span className="text-foreground/80">Claims of physical damage or defects after the rider has left your location.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-destructive font-bold text-xl flex-shrink-0">✗</span>
                <span className="text-foreground/80">"Change of mind" return requests after payment is made.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-destructive font-bold text-xl flex-shrink-0">✗</span>
                <span className="text-foreground/80">Free replacements for items you have already accepted.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-muted-foreground font-semibold text-sm flex-shrink-0 mt-4">Note:</span>
                <span className="text-foreground/80 text-sm">Premium branded items with a distinct Manufacturer's Warranty Card inside the box must be handled directly through that brand's official service center.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 rounded-3xl text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Questions About Our Guarantee?
          </h2>
          <p className="text-muted-foreground mb-8">
            Reach out anytime at contact@hukam.pk
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all"
          >
            Contact Us
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
