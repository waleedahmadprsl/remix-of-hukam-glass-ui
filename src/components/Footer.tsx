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
            <a href="https://wa.me/923426807645" aria-label="WhatsApp" className="w-10 h-10 rounded-full flex items-center justify-center bg-background border border-border/50 text-muted-foreground hover:text-brand-blue hover:border-primary/40 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.212L4 20l1.212-3.757A8 8 0 1112 20z" />
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
