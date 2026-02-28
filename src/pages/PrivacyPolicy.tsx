import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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
      title: "1. What We Collect",
      subsections: [
        {
          subtitle: "Contact Info:",
          text: "Your name, phone number (WhatsApp), and exact delivery address.",
        },
        {
          subtitle: "Order Details:",
          text: "The products you purchased and your order history.",
        },
        {
          subtitle: "Communications:",
          text: "Your WhatsApp messages, location pins, and order instructions.",
        },
      ],
    },
    {
      title: "2. Payments & Transaction Safety",
      content:
        "We offer Cash on Delivery (COD) and direct digital transfers (JazzCash, EasyPaisa, or direct bank transfer via WhatsApp). Zero Hidden Data: We do not ask for, collect, or store your credit card numbers, passwords, or banking PINs. Proof of Payment: For digital transfers, we only keep a record of the transaction ID or payment screenshot to verify your order.",
    },
    {
      title: "3. 100% In-House Delivery (No Third Parties)",
      content:
        "Your privacy and safety are our highest priority. HUKAM deliveries are handled exclusively by our own internal team. Your address and phone number never leave our secure system.",
    },
    {
      title: '4. Our "Zero Spam" Guarantee',
      content:
        "We respect your personal WhatsApp inbox. We will never send you unsolicited bulk promotional messages. We only use your direct chat to send live order confirmations, delivery ETAs, and support replies. If you want discount codes and new product alerts, you can voluntarily join our official HUKAM WhatsApp Channel/Group.",
    },
    {
      title: "5. Contact Us",
      content:
        "If you have questions about your data, message us directly on WhatsApp at +92 3426 807 645 or email contact@hukam.pk.",
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
            HUKAM Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            To deliver your tech accessories in 60 minutes across Mirpur, we only collect what is strictly necessary.
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
            Questions About Your Privacy?
          </h2>
          <p className="text-muted-foreground mb-8">
            Contact us anytime at{" "}
            <a href="mailto:contact@hukam.pk" className="text-primary font-semibold hover:underline">
              contact@hukam.pk
            </a>
          </p>
          <motion.a
            href="https://wa.me/923426807645"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all"
          >
            Chat with Us
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
