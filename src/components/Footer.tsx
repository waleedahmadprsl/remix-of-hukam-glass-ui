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
    <footer className="bg-muted/40 border-t border-border/20 pt-10 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <img src={logoIcon} alt="HUKAM" className="h-8 w-fit" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Order Nahi, HUK<span className="text-brand-blue">A</span>M Kijiye.
            </p>
            <p className="text-xs text-muted-foreground">contact@hukam.pk</p>
          </div>

          {/* Quick + Legal Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Navigate</h4>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1.5">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-2">
              <a href="#" aria-label="TikTok" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.92a8.27 8.27 0 004.76 1.5V7a4.83 4.83 0 01-1-.31z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-4">
          <p className="text-center text-[11px] text-muted-foreground">
            © 2026 HUK<span className="text-brand-blue">A</span>M · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
