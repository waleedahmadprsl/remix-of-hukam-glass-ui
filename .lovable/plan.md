

# Universal Marketplace Copy & UI Update

## Summary
Transform HUKAM from a tech-accessories-only store into a universal marketplace (like Daraz/Amazon). This involves updating hardcoded copy, icons, fallback data, and terminology across ~8 files. No database changes needed — categories already come from the DB dynamically.

## Files to Change

### 1. `src/components/BannerCarousel.tsx` — Hero Slides Copy
- Slide 1: "HUKAM — Your One-Stop\nMarketplace" / "Fashion, electronics, home essentials & more — all delivered to your doorstep."
- Slide 2: "Millions of Products,\nOne Destination" / "From trending fashion to smart gadgets — discover it all at unbeatable prices."
- Slide 3: "60-Minute Delivery\nTo Your Door" (keep as-is, it's universal)

### 2. `src/components/CategoryBubbles.tsx` — Universal Icons
- Replace tech-only icons (`Headphones, BatteryCharging, Cable, Smartphone, Monitor`) with universal ones: `ShoppingBag, Shirt, Laptop, Home, Heart, Package` — representing Fashion, Electronics, Home & Living, Health & Beauty, etc.
- Categories themselves are fetched from DB, so names are already dynamic.

### 3. `src/pages/ProductDetail.tsx` — "Tech Specs" → "Specifications"
- Line 282: Change `"Tech Specs"` → `"Specifications"`

### 4. `src/components/Testimonials.tsx` — Universal Fallback Reviews
- Replace tech-specific fallback testimonials ("iPhone charger", "earbuds") with diverse ones covering fashion, home, and general shopping experience.
- Change heading "Trusted by Mirpur" → "Loved by Our Customers"

### 5. `src/pages/Index.tsx` — JSON-LD Schema
- Update description from "Premium tech accessories" → "Your one-stop marketplace for fashion, electronics, home & more — delivered fast."

### 6. `src/pages/About.tsx` — Broaden the Story
- Milestones: "Premium Products" desc → "A curated selection across every category."
- Story text: Replace "phone charger, USB cable, earbuds" → "the latest fashion, quality electronics, or everyday home essentials"
- "The HUKAM Promise" text: Remove "tech" specificity, keep quality promise universal
- Heading "Built in Mirpur, for Mirpur" stays (it's brand identity, not tech-specific)

### 7. `src/components/AboutUs.tsx` — No change needed (no tech-specific copy)

### 8. `src/components/Newsletter.tsx` — Already universal, no changes needed.

### 9. `src/components/Footer.tsx` — Already universal, no changes needed.

## What stays the same
- All database queries (products, categories fetch dynamically)
- Cart, checkout, admin panel — all product-agnostic already
- Brand name, logo, delivery promises — universal
- "60-Min Delivery", "Cash on Delivery" badges — universal

## Estimated scope
~8 files, mostly copy/string replacements. No structural or database changes.

