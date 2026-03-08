import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [result, setResult] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === ORIGINAL LOGIC UNCHANGED ===
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult("Sending....");
    const ACCESS_KEY = "30b97afd-15a6-456e-84e0-08bedd37e77f";
    const formDataToSend = new FormData(e.currentTarget);
    formDataToSend.append("access_key", ACCESS_KEY);
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formDataToSend });
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
    { icon: Mail, label: "Email", value: "contact@hukam.pk", link: "mailto:contact@hukam.pk" },
    { icon: Phone, label: "WhatsApp", value: "+92 3426 807 645", link: "https://wa.me/923426807645" },
    { icon: MapPin, label: "Location", value: "Mirpur, Azad Kashmir", link: "#" },
    { icon: Clock, label: "Hours", value: "Mon-Sun, 9 AM – 10 PM", link: "#" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">Contact</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Get in Touch with HUK<span className="text-primary">A</span>M
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? Want to partner with us? We're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Contact Cards */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Reach Out Anytime</h2>
            <p className="text-muted-foreground mb-8">Whether you need product support, want to explore business opportunities, or have a quick question — we're ready.</p>

            <div className="space-y-4">
              {contactInfo.map((info) => (
                <motion.a
                  key={info.label}
                  href={info.link}
                  target={info.link.startsWith("http") ? "_blank" : undefined}
                  rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  whileHover={{ x: 6 }}
                  className="glass-card p-5 rounded-2xl flex gap-4 items-center group hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors flex-shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    <p className="text-foreground font-medium">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-6 sm:p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-foreground mb-6">Send a Message</h3>

            {result && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 border rounded-xl text-sm font-medium ${
                result.includes("Successfully") ? "bg-primary/5 border-primary/20 text-primary" : result.includes("Error") ? "bg-destructive/5 border-destructive/20 text-destructive" : "bg-secondary border-border text-foreground"
              }`}>
                {result}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us more..." rows={5} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
              </div>
              <motion.button type="submit" disabled={result === "Sending...."} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50">
                {result === "Sending...." ? "Sending..." : "Send Message ⚡"}
              </motion.button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">We typically respond within 2-4 hours.</p>
          </motion.div>
        </div>

        {/* Support CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 glass-card p-10 sm:p-12 rounded-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Need Quick Support?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Email us at contact@hukam.pk or fill out the form above. Our team responds within minutes!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
