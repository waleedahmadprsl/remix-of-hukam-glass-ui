import { useNavigate } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.jpg";

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Track Order", path: "/track-order" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Return Policy", path: "/refund-policy" },
  ];

  return (
    <footer className="bg-foreground/[0.03] border-t border-border/30 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <img src={logoIcon} alt="HUKAM" className="h-10 w-fit" />
            <p className="text-sm text-muted-foreground font-medium">
              Order Nahi, HUK<span className="text-brand-blue">A</span>M Kijiye.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>contact@hukam.pk</p>
              <p>hukam.pk</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-foreground transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-foreground transition-colors underline-offset-2 hover:underline cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        {/* Socials */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Follow Us</h4>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-full flex items-center justify-center bg-background border border-border/50 text-muted-foreground hover:text-brand-blue hover:border-primary/40 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.92a8.27 8.27 0 004.76 1.5V7a4.83 4.83 0 01-1-.31z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full flex items-center justify-center bg-background border border-border/50 text-muted-foreground hover:text-brand-blue hover:border-primary/40 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
            </a>
          </div>
        </div>
        </div>

      <div className="border-t border-border/30 pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 HUK<span className="text-brand-blue">A</span>M. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
};

export default Footer;
