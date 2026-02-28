import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import imgCharger from "@/assets/products/fast-charger-65w.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: "all" | "chargers" | "cables" | "audio" | "protection";
}

const allProducts: Product[] = [
  { id: "1", name: "65W GaN Fast Charger", price: "₨ 2,499", image: imgCharger, category: "chargers" },
  { id: "2", name: "TWS Earbuds Pro", price: "₨ 3,999", image: imgEarbuds, category: "audio" },
  { id: "3", name: "MagSafe Power Bank", price: "₨ 4,299", image: imgPowerBank, category: "protection" },
  { id: "4", name: "USB-C Hub 7-in-1", price: "₨ 3,199", image: imgHub, category: "cables" },
  { id: "5", name: "120W Ultra Charger", price: "₨ 3,999", image: imgCharger, category: "chargers" },
  { id: "6", name: "Wireless Earbuds Max", price: "₨ 5,499", image: imgEarbuds, category: "audio" },
  { id: "7", name: "Screen Protector Pack", price: "₨ 599", image: imgPowerBank, category: "protection" },
  { id: "8", name: "Lightning Cable 2M", price: "₨ 899", image: imgHub, category: "cables" },
  { id: "9", name: "Quick Charge 3.0 Charger", price: "₨ 1,999", image: imgCharger, category: "chargers" },
  { id: "10", name: "Studio Headphones", price: "₨ 6,999", image: imgEarbuds, category: "audio" },
  { id: "11", name: "Phone Case Premium", price: "₨ 1,499", image: imgPowerBank, category: "protection" },
  { id: "12", name: "USB-C Cable Pack (3)", price: "₨ 1,299", image: imgHub, category: "cables" },
];

const categories = [
  { id: "all", label: "All Products" },
  { id: "chargers", label: "Chargers" },
  { id: "cables", label: "Cables" },
  { id: "audio", label: "Audio" },
  { id: "protection", label: "Protection" },
];

const ProductCard = ({ product, i }: { product: Product; i: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="glass-card group overflow-hidden h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
    >
      <div className="relative h-48 overflow-hidden bg-secondary/30">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-5 relative">
        <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
        <p className="text-brand-blue font-bold mt-1 text-base">{product.price}</p>
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
  );
};

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter(
          (p) => p.category === activeCategory
        );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            The Vault
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of premium mobile accessories. Fast delivery. Verified products. 60-minute guarantee in Mirpur.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-16 pb-6 border-b border-border/30"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`glass-pill transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "hover:border-primary/50"
              }`}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} i={i} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">No products found in this category.</p>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-card p-12 text-center rounded-3xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Can't Find What You Need?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Chat with our team on WhatsApp for custom requests or bulk orders.
          </p>
          <motion.a
            href="https://wa.me/923426807645"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold animate-pulse-glow transition-all"
          >
            HUKAM on WhatsApp ⚡
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;
