import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Clock, Share2, ChevronLeft, ShoppingCart, Star, Shield, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import CustomerReviews from "@/components/CustomerReviews";

import imgCharger from "@/assets/products/fast-charger-65w.jpg";
import imgEarbuds from "@/assets/products/earbuds-pro.jpg";
import imgPowerBank from "@/assets/products/power-bank.jpg";
import imgHub from "@/assets/products/usb-hub.jpg";
import imgCharger20 from "@/assets/products/pd-charger-20w.jpg";
import imgCableUsbc from "@/assets/products/cable-usbc.jpg";
import imgCableBraided from "@/assets/products/cable-braided.jpg";
import imgNeckband from "@/assets/products/neckband.jpg";
import imgSlimBank from "@/assets/products/slim-bank.jpg";
import imgStand from "@/assets/products/phone-stand.jpg";
import imgCarMount from "@/assets/products/car-mount.jpg";
import imgProtector from "@/assets/products/screen-protector.jpg";

interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
  category: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
  specs: { label: string; value: string }[];
  features: string[];
}

const productDatabase: Record<string, Product> = {
  "1": {
    id: "1",
    name: "65W GaN Fast Charger",
    price: "₨ 2,499",
    images: [imgCharger, imgCableUsbc, imgHub],
    category: "chargers",
    description: "Ultra-compact GaN technology charger that delivers 65W of power. Perfect for laptops, tablets, and smartphones. Includes premium braided cable.",
    stock: 24,
    rating: 4.8,
    reviews: 143,
    specs: [
      { label: "Output", value: "65W Maximum" },
      { label: "Technology", value: "GaN (Ultra Compact)" },
      { label: "Port", value: "USB-C" },
      { label: "Cable", value: "Braided Cable Included" },
      { label: "Protection", value: "Over-temp & Surge" },
      { label: "Warranty", value: "1 Year" },
    ],
    features: ["65W Maximum Output", "GaN Technology (Ultra Compact)", "Universal USB-C Compatibility", "Premium Braided Cable Included", "Over-temperature & Surge Protection", "1-Year Warranty"],
  },
  "2": {
    id: "2",
    name: "TWS Earbuds Pro",
    price: "₨ 3,999",
    images: [imgEarbuds, imgNeckband, imgCharger],
    category: "audio",
    description: "Premium true wireless earbuds with active noise cancellation, 8-hour battery life, and crystal-clear audio.",
    stock: 18,
    rating: 4.7,
    reviews: 89,
    specs: [
      { label: "ANC", value: "Active Noise Cancellation" },
      { label: "Battery", value: "8 Hours" },
      { label: "Water Rating", value: "IPX4" },
      { label: "Bluetooth", value: "5.2" },
      { label: "Fast Charge", value: "30 min = 2 hrs" },
      { label: "Driver", value: "10mm Dynamic" },
    ],
    features: ["Active Noise Cancellation (ANC)", "8-Hour Battery Life", "IPX4 Water Resistant", "Bluetooth 5.2 Connectivity", "Fast Charging (30 mins = 2 hours)", "Premium Sound Quality"],
  },
  "3": {
    id: "3",
    name: "MagSafe Power Bank",
    price: "₨ 4,299",
    images: [imgPowerBank, imgSlimBank, imgCharger],
    category: "protection",
    description: "Magnetic wireless power bank that attaches seamlessly to iPhone 12/13/14. 5000mAh capacity with fast charging support.",
    stock: 32,
    rating: 4.9,
    reviews: 256,
    specs: [
      { label: "Capacity", value: "5000mAh" },
      { label: "Attachment", value: "MagSafe Magnetic" },
      { label: "Charging", value: "Wireless Fast" },
      { label: "Weight", value: "Compact & Light" },
      { label: "Indicator", value: "LED Battery" },
      { label: "Warranty", value: "6 Months" },
    ],
    features: ["5000mAh Capacity", "MagSafe Attachment", "Wireless Fast Charging", "Compact & Lightweight", "LED Battery Indicator", "6-Month Warranty"],
  },
  "4": {
    id: "4",
    name: "USB-C Hub 7-in-1",
    price: "₨ 3,199",
    images: [imgHub, imgCableBraided, imgStand],
    category: "cables",
    description: "All-in-one USB-C hub with 7 different ports. Add HDMI, audio, USB 3.0 ports, and SD card reader to your laptop or tablet.",
    stock: 15,
    rating: 4.6,
    reviews: 72,
    specs: [
      { label: "Ports", value: "7-in-1" },
      { label: "HDMI", value: "4K Output" },
      { label: "USB", value: "3x USB 3.0" },
      { label: "Card Reader", value: "SD/MicroSD" },
      { label: "Audio", value: "3.5mm Jack" },
      { label: "Build", value: "Aluminum" },
    ],
    features: ["7 Ports in 1 Hub", "4K HDMI Output", "3x USB 3.0 Ports", "SD/MicroSD Card Reader", "3.5mm Audio Jack", "Aluminum Build Quality"],
  },
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? productDatabase[id] : null;
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"features" | "specs">("features");

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass-card p-12 rounded-3xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the product you're looking for.</p>
          <motion.button onClick={() => navigate("/products")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold">
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const stockStatus = product.stock > 20 ? "In Stock" : product.stock > 5 ? "Low Stock" : product.stock > 0 ? "Only Few Left" : "Out of Stock";
  const stockColor = product.stock > 20 ? "text-green-600" : product.stock > 5 ? "text-yellow-600" : product.stock > 0 ? "text-orange-600" : "text-destructive";

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/products")} className="hover:text-foreground transition-colors">Products</button>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Main Image */}
            <div className="glass-card rounded-3xl overflow-hidden mb-4 relative group aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-foreground/60 text-background px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl overflow-hidden w-20 h-20 border-2 transition-all ${
                    selectedImage === i ? "border-primary shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-6">
            {/* Category badge */}
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price & Stock */}
            <div className="glass-card p-6 rounded-2xl space-y-3">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-primary">{product.price}</span>
                <span className="text-sm text-muted-foreground mb-1">incl. delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.stock > 5 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-destructive"}`} />
                <span className={`text-sm font-medium ${stockColor}`}>{stockStatus}</span>
                {product.stock > 0 && <span className="text-xs text-muted-foreground">({product.stock} units)</span>}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Tabs: Features / Specs */}
            <div>
              <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4">
                {(["features", "specs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "features" ? "Key Features" : "Tech Specs"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "features" ? (
                  <motion.ul key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feat}</span>
                      </li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-3">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="bg-secondary/30 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{spec.value}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity + CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">Quantity</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-foreground hover:bg-secondary transition-colors font-medium">−</button>
                  <div className="px-5 py-2.5 text-foreground font-bold min-w-[3rem] text-center border-x border-border">{qty}</div>
                  <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-foreground hover:bg-secondary transition-colors font-medium">+</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], quantity: qty });
                    toast({ title: "Added to HUKAM Cart", description: `${product.name} x${qty}` });
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-2xl font-bold text-base transition-all hover:shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>

                <motion.a
                  href={`https://wa.me/923426807645?text=${encodeURIComponent(`Hi HUKAM, I want to order: ${product.name} - ${product.price}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
                >
                  HUKAM on WhatsApp ⚡
                </motion.a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "60-Min Delivery", sub: "In Mirpur" },
                { icon: Shield, label: "Verified Product", sub: "100% Genuine" },
                { icon: Check, label: "Check & Pay", sub: "At your door" },
              ].map((badge) => (
                <div key={badge.label} className="glass-card p-3 rounded-xl text-center">
                  <badge.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">{badge.label}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews */}
        <CustomerReviews productId={product.id} />

        {/* Related Products */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  whileHover={{ y: -6 }}
                  onClick={() => { navigate(`/product/${pid}`); setSelectedImage(0); setQty(1); }}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="h-36 sm:h-44 bg-secondary/30 overflow-hidden">
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{prod.name}</h3>
                    <p className="text-primary font-bold">{prod.price}</p>
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
