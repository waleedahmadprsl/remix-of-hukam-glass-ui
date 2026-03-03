import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

import imgCharger from "@/assets/products/fast-charger-65w.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";

const products = [
  { id: "1", name: "65W GaN Fast Charger", price: "₨ 2,499", image: imgCharger, category: "chargers" },
  { id: "2", name: "TWS Earbuds Pro", price: "₨ 3,999", image: imgEarbuds, category: "audio" },
  { id: "3", name: "MagSafe Power Bank", price: "₨ 4,299", image: imgPowerBank, category: "protection" },
  { id: "4", name: "USB-C Hub 7-in-1", price: "₨ 3,199", image: imgHub, category: "cables" },
];

const ProductCard = ({ product, i }: { product: typeof products[0]; i: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="glass-card group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
    >
      <div className="relative h-48 overflow-hidden bg-secondary/30">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-5 relative">
        <h3 className="font-semibold text-foreground">{product.name}</h3>
        <p className="text-brand-blue font-bold mt-1">{product.price}</p>
        <motion.div
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground flex items-center justify-center gap-2 py-3 font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          HUKAM Kijiye
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProductShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12"
        >
          Trending in Mirpur
        </motion.h2>

        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
          {products.slice(0, 4).map((product, i) => (
            <div key={product.id} className="min-w-[75vw] snap-center">
              <ProductCard product={product} i={i} />
            </div>
          ))}
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {products.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} i={i} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-14"
        >
          <motion.button
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="glass-pill font-semibold text-foreground border border-primary/30 px-8 py-3 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center gap-2"
          >
            View All HUKAM Products
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
