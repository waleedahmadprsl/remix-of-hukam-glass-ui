

# E-Commerce Frontend Overhaul Plan

## 1. WhatsApp Purge (Global)

Remove ALL WhatsApp buttons, links, and references across these files:

| File | Action |
|---|---|
| `src/components/WhatsAppFloat.tsx` | **Delete file** |
| `src/components/Layout.tsx` | Remove `WhatsAppFloat` import and `<WhatsAppFloat />` |
| `src/components/HeroSection.tsx` | **Replace entire component** with Banner Carousel |
| `src/components/HowItWorks.tsx` | Change step 2 from "HUKAM on WhatsApp" to "Add to Cart" |
| `src/components/AboutUs.tsx` | Replace WhatsApp CTA with "Browse Products" button using `navigate("/products")` |
| `src/pages/Products.tsx` | Replace bottom WhatsApp CTA with "Contact Us" linking to `/contact` |
| `src/pages/ProductDetail.tsx` | Remove "Order via WhatsApp" button (lines 275-284), make Add to Cart full-width |
| `src/pages/About.tsx` | Replace WhatsApp CTA with "Shop Now" button |
| `src/pages/PrivacyPolicy.tsx` | Replace WhatsApp link at bottom with `/contact` link; keep text mentions of WhatsApp in policy content (those are legal/informational) |
| `src/pages/Terms.tsx` | Same — replace CTA link, keep policy text |
| `src/components/Footer.tsx` | Remove WhatsApp social icon (lines 85-90) |

## 2. Replace Hero with Banner Carousel

**Delete** current `HeroSection.tsx`. **Create new** `src/components/BannerCarousel.tsx`:

- Auto-sliding carousel using Embla (already installed via `embla-carousel-react`)
- 3 slides with gradient overlays, headline text, and "Shop Now" CTA
- Slides pull from a static array (can later be DB-driven)
- Each slide: full-width image/gradient bg, short headline, CTA button
- Auto-play every 4 seconds, dots indicator, swipeable on mobile
- Compact height: `h-[50vh]` on mobile, `h-[60vh]` on desktop (not full-screen like current hero)
- Glassmorphism overlay style consistent with brand

## 3. Category Bubbles Row

**Create** `src/components/CategoryBubbles.tsx`:

- Fetch categories from `supabase.from("categories").select("id, name, image").is("parent_id", null)`
- Horizontal scrollable row on mobile, centered grid on desktop
- Each bubble: circular image/icon (80px), category name below
- Click navigates to `/products?category={id}`
- Glassmorphism card style, subtle hover animation

## 4. Homepage Product Strips

**Create** `src/components/FlashDeals.tsx`:
- Query products where `compare_at_price > price` (has discount), limit 8
- Horizontal scrolling row with snap behavior
- Each card shows SALE badge, strikethrough price, discount %
- "View All" link at end

**Create** `src/components/TrendingProducts.tsx`:
- Query latest active products, limit 8
- Same horizontal scroll layout
- Section header: "🔥 Trending Products"

## 5. Updated Homepage Layout

`src/pages/Index.tsx` becomes:
```
BannerCarousel
CategoryBubbles
FlashDeals
TrendingProducts
AllProducts (existing — keep as full grid)
Testimonials (keep)
```

Remove: `HeroSection`, `TrustBadges`, `HowItWorks`, `AboutUs` from homepage (these are SaaS-style sections). `TrustBadges` can be moved into `BannerCarousel` as overlay badges. `HowItWorks` and `AboutUs` remain on `/about` page.

## Files Summary

| Action | File |
|---|---|
| Delete | `src/components/WhatsAppFloat.tsx` |
| Delete | `src/components/HeroSection.tsx` |
| Create | `src/components/BannerCarousel.tsx` |
| Create | `src/components/CategoryBubbles.tsx` |
| Create | `src/components/FlashDeals.tsx` |
| Create | `src/components/TrendingProducts.tsx` |
| Edit | `src/pages/Index.tsx` — new layout |
| Edit | `src/components/Layout.tsx` — remove WhatsApp |
| Edit | `src/components/HowItWorks.tsx` — remove WhatsApp step |
| Edit | `src/components/AboutUs.tsx` — replace CTA |
| Edit | `src/pages/Products.tsx` — replace bottom CTA |
| Edit | `src/pages/ProductDetail.tsx` — remove WhatsApp button |
| Edit | `src/pages/About.tsx` — replace CTA |
| Edit | `src/pages/PrivacyPolicy.tsx` — replace CTA link |
| Edit | `src/pages/Terms.tsx` — replace CTA link |
| Edit | `src/components/Footer.tsx` — remove WhatsApp icon |

Total: 3 new files, 1 deleted, ~11 edited.

