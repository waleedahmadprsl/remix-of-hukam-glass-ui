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
            <div className="flex items-center gap-2 flex-wrap">
              {/* WhatsApp */}
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com/hukam.pk" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-[#1877F2] hover:border-[#1877F2]/40 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com/@hukam.pk" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.92a8.27 8.27 0 004.76 1.5V7a4.83 4.83 0 01-1-.31z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border/30 text-muted-foreground hover:text-[#E4405F] hover:border-[#E4405F]/40 transition-all">
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
