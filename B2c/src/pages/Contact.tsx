import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [result, setResult] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult("Sending....");

    const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";
    const formDataToSend = new FormData(e.currentTarget);
    formDataToSend.append("access_key", ACCESS_KEY);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setResult("Form Submitted Successfully ✅");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setResult(""), 3000);
      } else {
        setResult("Error submitting form");
      }
    } catch (error) {
      setResult("Error submitting form");
      console.error("Form submission error:", error);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "contact@hukam.pk",
      link: "mailto:contact@hukam.pk",
    },
    {
      icon: Phone,
      label: "WhatsApp",
      value: "+92 3426 807 645",
      link: "https://wa.me/923426807645",
    },
    {
      icon: MapPin,
      label: "Office Location",
      value: "Mirpur, Azad Kashmir",
      link: "#",
    },
    {
      icon: Clock,
      label: "Operating Hours",
      value: "Monday - Sunday, 9:00 AM to 10:00 PM",
      link: "#",
    },
  ];

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
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Get in Touch with HUK<span className="text-brand-blue">A</span>M
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? Want to partner with us? We're here to help. Reach out anytime.
          </p>
        </motion.div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 relative z-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch with HUKAM</h2>
              <p className="text-lg text-gray-700 mb-8">
                Whether you have a question about our products, need technical support, or want to explore business opportunities, our team is ready to assist.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.label}
                    href={info.link}
                    target={info.link.startsWith("http") ? "_blank" : undefined}
                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="glass-card p-6 rounded-2xl group hover:border-primary/40 transition-all cursor-pointer relative z-10"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-1 relative z-10">
                          {info.label}
                        </h3>
                        <p className="text-gray-700 text-lg font-medium relative z-10">{info.value}</p>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h3>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 border rounded-lg text-sm font-medium ${
                  result.includes("Successfully")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : result.includes("Error")
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                {result}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="w-full px-4 py-3 bg-background border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={result === "Sending...."}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {result === "Sending...." ? "Sending..." : "Send Message ⚡"}
              </motion.button>

              {result && (
                <p className="text-sm font-medium mt-4 text-center text-gray-700">
                  {result}
                </p>
              )}
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              We typically respond within 2-4 hours during business hours.
            </p>
          </motion.div>
        </div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 glass-card p-12 rounded-3xl text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Quick Support on WhatsApp
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            For urgent matters or quick questions, we recommend reaching out via WhatsApp. Our team responds instantly!
          </p>
          <motion.a
            href="https://wa.me/923426807645"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold animate-pulse-glow transition-all"
          >
            HUKAM on WhatsApp 💬
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
