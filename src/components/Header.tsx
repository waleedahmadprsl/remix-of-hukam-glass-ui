import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Search, Heart, User, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useMiniCart } from "@/context/MiniCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import WishlistDrawer from "@/components/WishlistDrawer";
import hukamName from "@/assets/hukam-name.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavLink {
  label: string;
  path: string;
}

const navLinks: NavLink[] = [
  { label: "Home", path: "/" },
  { label: "All Products", path: "/products" },
  { label: "Track Order", path: "/track-order" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; price: number; images: string[] }[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { items } = useCart();
  const { openCart } = useMiniCart();
  const { items: wishlistItems } = useWishlist();
  const { session, profile, logout } = useAuth();
  const cartCount = items.reduce((s, it) => s + it.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.from("products").select("id, title, price, images").eq("is_active", true).or(`title.ilike.%${q}%,description.ilike.%${q}%`).limit(5);
      setSearchResults((data || []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] })));
    }, 300);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src={hukamName} alt="HUKAM" onClick={() => navigate('/')} role="button" aria-label="Go to home" className="h-10 sm:h-12 cursor-pointer" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => navigate(link.path)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button onClick={() => setWishlistOpen(true)} className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{wishlistCount}</span>
              )}
            </button>

            {/* Cart */}
            <button onClick={openCart} className="relative p-2 text-foreground">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 p-1.5 rounded-full hover:bg-secondary/50 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                      <button onClick={() => { setUserMenuOpen(false); navigate("/account"); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 flex items-center gap-2">
                        <User className="w-4 h-4" /> My Account
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-secondary/50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => navigate("/login")} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <User className="w-5 h-5" />
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/products")}
              className="hidden sm:inline-flex border border-primary/40 text-foreground px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              Shop Now
            </motion.button>

            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 text-foreground" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-lg">
              <div className="container mx-auto px-4 py-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/40 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        {p.images[0] && <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.title}</p>
                          <p className="text-xs text-primary font-bold">₨ {p.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
            <button onClick={() => setMenuOpen(false)} className="absolute top-5 right-5 p-2 text-foreground" aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
            {navLinks.map((link, i) => (
              <motion.button key={link.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} onClick={() => { navigate(link.path); setMenuOpen(false); }} className="text-2xl font-semibold text-foreground cursor-pointer">
                {link.label}
              </motion.button>
            ))}
            {session ? (
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: navLinks.length * 0.08 }} onClick={() => { navigate("/account"); setMenuOpen(false); }} className="text-2xl font-semibold text-primary cursor-pointer">
                My Account
              </motion.button>
            ) : (
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: navLinks.length * 0.08 }} onClick={() => { navigate("/login"); setMenuOpen(false); }} className="text-2xl font-semibold text-primary cursor-pointer">
                Login / Sign Up
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
};

export default Header;
