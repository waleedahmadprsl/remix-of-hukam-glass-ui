import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import imgCharger65 from "@/assets/products/fast-charger-65w.jpg";
import imgCharger20 from "@/assets/products/pd-charger-20w.jpg";
import imgCableUsbc from "@/assets/products/cable-usbc.jpg";
import imgCableBraided from "@/assets/products/cable-braided.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgNeckband from "@/assets/products/neckband.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgSlimBank from "@/assets/products/slim-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";
import imgStand from "@/assets/products/phone-stand.jpg";
import imgCarMount from "@/assets/products/car-mount.jpg";
import imgProtector from "@/assets/products/screen-protector.jpg";

const categories = ["All", "Fast Chargers", "Cables", "Earbuds", "Power Banks", "Accessories"];

const allProducts = [
  { id: "1", name: "65W GaN Fast Charger", price: "₨ 2,499", image: imgCharger65, category: "Fast Chargers" },
  { id: "2", name: "20W PD Charger", price: "₨ 1,299", image: imgCharger20, category: "Fast Chargers" },
  { id: "3", name: "USB-C to Lightning Cable", price: "₨ 799", image: imgCableUsbc, category: "Cables" },
  { id: "4", name: "Braided USB-C Cable 2m", price: "₨ 599", image: imgCableBraided, category: "Cables" },
  { id: "5", name: "TWS Earbuds Pro", price: "₨ 3,999", image: imgEarbuds, category: "Earbuds" },
  { id: "6", name: "Neckband Sport", price: "₨ 1,999", image: imgNeckband, category: "Earbuds" },
  { id: "7", name: "MagSafe Power Bank", price: "₨ 4,299", image: imgPowerBank, category: "Power Banks" },
  { id: "8", name: "10000mAh Slim Bank", price: "₨ 2,999", image: imgSlimBank, category: "Power Banks" },
  { id: "9", name: "USB-C Hub 7-in-1", price: "₨ 3,199", image: imgHub, category: "Accessories" },
  { id: "10", name: "Phone Stand Foldable", price: "₨ 899", image: imgStand, category: "Accessories" },
  { id: "11", name: "Car Phone Mount", price: "₨ 1,499", image: imgCarMount, category: "Accessories" },
  { id: "12", name: "Screen Protector Pack", price: "₨ 499", image: imgProtector, category: "Accessories" },
];

const AllProducts = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? allProducts : allProducts.filter((p) => p.category === active);

  return (
    <section id="all-products" className="py-20 brand-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4"
        >
          Explore the Vault
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-muted-foreground mb-10"
        >
          Everything you need, all in one place.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                active === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/60 text-muted-foreground border-border/50 hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
              >
                <div className="relative h-32 sm:h-44 overflow-hidden bg-secondary/30">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{product.name}</h3>
                  <p className="text-brand-blue font-bold mt-1 text-sm">{product.price}</p>
                  <motion.a
                    href={`https://wa.me/923426807645?text=Hi%20HUKAM!%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2.5 font-medium text-xs sm:text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    HUKAM on WhatsApp
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
