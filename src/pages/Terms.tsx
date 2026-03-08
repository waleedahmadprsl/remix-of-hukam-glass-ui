import { motion } from "framer-motion";

const Terms = () => {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const sections = [
    {
      title: "Welcome to HUKAM",
      content:
        "By placing an order via our website or WhatsApp, you agree to these operational terms.",
    },
    {
      title: "1. The 60-Minute Delivery Promise",
      subsections: [
        {
          subtitle: "Scope:",
          text: "We strive to deliver all retail orders within 60 minutes. This applies strictly to addresses within the main Mirpur city limits.",
        },
        {
          subtitle: "Hours:",
          text: "Our 60-minute window applies during standard operating hours (9:00 AM to 10:00 PM). Orders placed outside these hours will be prioritized for the next morning.",
        },
        {
          subtitle: "Delays:",
          text: "While 60 minutes is our standard, heavy traffic or extreme weather may cause delays. Our riders will communicate with you via WhatsApp. We do not offer cash refunds for delayed deliveries.",
        },
      ],
    },
    {
      title: "2. User Responsibilities",
      subsections: [
        {
          subtitle: "Accurate Details:",
          text: "You must provide an accurate WhatsApp number and precise delivery address.",
        },
        {
          subtitle: "Fake Orders:",
          text: "Placing fake COD orders wastes our riders' time and fuel. Any number associated with a fake order will be permanently banned from the HUKAM platform.",
        },
      ],
    },
    {
      title: "3. Payments & Pricing",
      content:
        "Prices shown on the website are final at the time of order. We accept Cash on Delivery (COD) and direct digital transfers via our official WhatsApp number.",
    },
    {
      title: '4. The "Check Before You Pay" & Final Sale Rule',
      subsections: [
        {
          subtitle: "Doorstep Inspection:",
          text: "You have the right to open and inspect the product while the HUKAM rider is at your door. If it is damaged or incorrect, return it to the rider immediately at zero cost.",
        },
        {
          subtitle: "All Sales Final:",
          text: "Once you pay the rider and the rider leaves your location, the sale is 100% final. HUKAM does not offer 7-day warranties, returns, refunds, or replacements after doorstep acceptance.",
        },
      ],
    },
    {
      title: "5. Governing Law",
      content:
        "These terms are governed by the laws of Pakistan. Any disputes shall be resolved exclusively in the courts of Mirpur, Azad Kashmir.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            HUKAM Terms & Conditions
          </h1>
          <p className="text-lg text-muted-foreground">
            By placing an order via our website or WhatsApp, you agree to these operational terms.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: February 28, 2026
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: February 28, 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {sections.map((section, idx) => (
            <motion.section
              key={idx}
              variants={itemVariants}
              className="glass-card p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>

              {section.content && (
                <p className="text-foreground/80 leading-relaxed mb-4">{section.content}</p>
              )}

              {section.subsections && (
                <ul className="space-y-4">
                  {section.subsections.map((sub, subIdx) => (
                    <li key={subIdx} className="border-l-2 border-primary/30 pl-4">
                      <h3 className="font-semibold text-foreground mb-2">{sub.subtitle}</h3>
                      <p className="text-foreground/80 leading-relaxed">{sub.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-card p-12 rounded-3xl text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-muted-foreground mb-8">
            Reach out to our support team anytime.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all"
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
