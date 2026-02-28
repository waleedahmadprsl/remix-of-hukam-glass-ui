import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, SlidersHorizontal } from "lucide-react";

import imgCharger from "@/assets/products/fast-charger-65w.jpg";
import imgCharger20 from "@/assets/products/pd-charger-20w.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgNeckband from "@/assets/products/neckband.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgSlimBank from "@/assets/products/slim-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";
import imgCableUsbc from "@/assets/products/cable-usbc.jpg";
import imgCableBraided from "@/assets/products/cable-braided.jpg";
import imgStand from "@/assets/products/phone-stand.jpg";
import imgCarMount from "@/assets/products/car-mount.jpg";
import imgProtector from "@/assets/products/screen-protector.jpg";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

const allProducts: Product[] = [
  { id: "1", name: "65W GaN Fast Charger", price: "₨ 2,499", image: imgCharger, category: "chargers" },
  { id: "2", name: "TWS Earbuds Pro", price: "₨ 3,999", image: imgEarbuds, category: "audio" },
  { id: "3", name: "MagSafe Power Bank", price: "₨ 4,299", image: imgPowerBank, category: "power-banks" },
  { id: "4", name: "USB-C Hub 7-in-1", price: "₨ 3,199", image: imgHub, category: "cables" },
  { id: "5", name: "20W PD Charger", price: "₨ 1,299", image: imgCharger20, category: "chargers" },
  { id: "6", name: "Neckband Sport", price: "₨ 1,999", image: imgNeckband, category: "audio" },
  { id: "7", name: "10000mAh Slim Bank", price: "₨ 2,999", image: imgSlimBank, category: "power-banks" },
  { id: "8", name: "USB-C to Lightning", price: "₨ 799", image: imgCableUsbc, category: "cables" },
  { id: "9", name: "Braided USB-C 2m", price: "₨ 599", image: imgCableBraided, category: "cables" },
  { id: "10", name: "Phone Stand Foldable", price: "₨ 899", image: imgStand, category: "accessories" },
  { id: "11", name: "Car Phone Mount", price: "₨ 1,499", image: imgCarMount, category: "accessories" },
  { id: "12", name: "Screen Protector Pack", price: "₨ 499", image: imgProtector, category: "accessories" },
];

const categories = [
  { id: "all", label: "All Products" },
  { id: "chargers", label: "Chargers" },
  { id: "cables", label: "Cables" },
  { id: "audio", label: "Audio" },
  { id: "power-banks", label: "Power Banks" },
  { id: "accessories", label: "Accessories" },
];

const Products = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = allProducts.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 block">HUKAM Collection</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">The Vault</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Premium tech accessories with 60-minute delivery in Mirpur.</p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-10 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-background/80 backdrop-blur-md border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-background/60 border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6 text-center">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="relative h-36 sm:h-48 overflow-hidden bg-secondary/30">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">{product.price}</p>
                  <motion.a
                    href={`https://wa.me/923426807645?text=Hi%20HUKAM!%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-3 font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    HUKAM on WhatsApp
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-xl text-muted-foreground">No products found. Try a different search.</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 glass-card p-10 sm:p-12 text-center rounded-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Can't Find What You Need?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Chat with us on WhatsApp for custom requests or bulk orders.</p>
          <motion.a href="https://wa.me/923426807645" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
            HUKAM on WhatsApp ⚡
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;
