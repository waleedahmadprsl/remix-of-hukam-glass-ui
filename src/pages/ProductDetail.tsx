import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Clock, Share2, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

import imgCharger from "@/assets/products/fast-charger-65w.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
  specs: string[];
}

// Product database
const productDatabase: Record<string, Product> = {
  "1": {
    id: "1",
    name: "65W GaN Fast Charger",
    price: "₨ 2,499",
    image: imgCharger,
    category: "chargers",
    description:
      "Ultra-compact GaN technology charger that delivers 65W of power. Perfect for laptops, tablets, and smartphones. Includes premium braided cable.",
    stock: 24,
    rating: 4.8,
    reviews: 143,
    specs: [
      "65W Maximum Output",
      "GaN Technology (Ultra Compact)",
      "Universal Compatibility (USB-C)",
      "Premium Braided Cable Included",
      "Over-temperature & Surge Protection",
      "1-Year Warranty",
    ],
  },
  "2": {
    id: "2",
    name: "TWS Earbuds Pro",
    price: "₨ 3,999",
    image: imgEarbuds,
    category: "audio",
    description:
      "Premium true wireless earbuds with active noise cancellation, 8-hour battery life, and crystal-clear audio. Perfect for calls, music, and workouts.",
    stock: 18,
    rating: 4.7,
    reviews: 89,
    specs: [
      "Active Noise Cancellation (ANC)",
      "8-Hour Battery Life",
      "IPX4 Water Resistant",
      "Bluetooth 5.2 Connectivity",
      "Fast Charging (30 mins = 2 hours)",
      "Premium Sound Quality",
    ],
  },
  "3": {
    id: "3",
    name: "MagSafe Power Bank",
    price: "₨ 4,299",
    image: imgPowerBank,
    category: "protection",
    description:
      "Magnetic wireless power bank that attaches seamlessly to iPhone 12/13/14. 5000mAh capacity with fast charging support.",
    stock: 32,
    rating: 4.9,
    reviews: 256,
    specs: [
      "5000mAh Capacity",
      "MagSafe Attachment",
      "Wireless Fast Charging",
      "Compact & Lightweight",
      "LED Battery Indicator",
      "6-Month Warranty",
    ],
  },
  "4": {
    id: "4",
    name: "USB-C Hub 7-in-1",
    price: "₨ 3,199",
    image: imgHub,
    category: "cables",
    description:
      "All-in-one USB-C hub with 7 different ports. Add HDMI, audio, USB 3.0 ports, and SD card reader to your laptop or tablet.",
    stock: 15,
    rating: 4.6,
    reviews: 72,
    specs: [
      "7 Ports in 1 Hub",
      "4K HDMI Output",
      "3x USB 3.0 Ports",
      "SD/MicroSD Card Reader",
      "3.5mm Audio Jack",
      "Aluminum Build Quality",
    ],
  },
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = id ? productDatabase[id] : null;
  const { addItem } = useCart();
  const [qty, setQty] = React.useState<number>(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the product you're looking for.</p>
          <motion.button
            onClick={() => navigate("/products")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold"
          >
            Back to Products
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </motion.button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl">
          {/* Left: Product Image & Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card rounded-3xl overflow-hidden mb-6 relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-3xl">
                <div className="text-white text-6xl">▶</div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {[product.image, product.image, product.image].map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card rounded-xl overflow-hidden cursor-pointer w-20 h-20"
                >
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <motion.h1
                    className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {product.name}
                  </motion.h1>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Price</p>
              <p className="text-brand-blue text-5xl font-extrabold mb-4">{product.price}</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                {product.stock > 0 ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">In Stock - Mirpur Hub ({product.stock} available)</span>
                  </>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">About This Product</h2>
              <p className="text-foreground/80 leading-relaxed">{product.description}</p>
            </div>

            {/* Key Specifications */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Key Features</h2>
              <ul className="space-y-2">
                {product.specs.map((spec, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{spec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-background border border-border/40 rounded-md"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <div className="px-4 py-2 border border-border/30 rounded-md text-center w-16">{qty}</div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2 bg-background border border-border/40 rounded-md"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <motion.button
                onClick={() => {
                  addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
                  toast({ title: "Added to HUKAM Cart", description: `${product.name} x${qty}` });
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:col-span-1 bg-brand-blue text-white py-4 rounded-2xl text-center font-bold text-lg transition-all hover:shadow-lg"
              >
                Add to HUKAM Cart
              </motion.button>

              <motion.a
                href={`https://wa.me/923426807645?text=${encodeURIComponent(`Hi HUKAM, I want to order: ${product.name} - Rs.${product.price}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-center font-bold text-lg animate-pulse-glow transition-all hover:shadow-lg"
              >
                HUKAM on WhatsApp ⚡
              </motion.a>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="glass-card p-4 rounded-xl text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">60-Min Delivery</p>
                <p className="text-xs text-muted-foreground">In Mirpur</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">Check Before Pay</p>
                <p className="text-xs text-muted-foreground">Inspect at door</p>
              </div>
            </motion.div>

            {/* Additional Info */}
            <div className="glass-card p-6 rounded-2xl border border-primary/20">
              <p className="text-sm text-muted-foreground">
                ✓ 100% Authentic Product | ✓ 7-Day Replacement Guarantee | ✓ Secure WhatsApp Ordering
              </p>
            </div>
          </motion.div>
        </div>

        {/* Related Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(productDatabase)
              .filter(([pid]) => pid !== id)
              .slice(0, 4)
              .map(([pid, prod], i) => (
                <motion.div
                  key={pid}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(`/product/${pid}`)}
                  className="glass-card rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-secondary/30 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-2">{prod.name}</h3>
                    <p className="text-brand-blue font-bold">{prod.price}</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
