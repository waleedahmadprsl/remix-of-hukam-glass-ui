

# UI Polish & Database Seeding Plan

## 1. Seed Database — Categories + Products

Insert 4 top-level categories first (Earbuds & Audio, Chargers & Cables, Power Banks, Smart Accessories), then insert 8 dummy products with Unsplash images, realistic PKR pricing, `compare_at_price` for SALE badges on 5 of them, and `buying_cost` for profit tracking.

**SQL will be executed via the insert tool** (data operations, not schema changes).

### Categories (4 rows)
- Earbuds & Audio
- Chargers & Cables
- Power Banks
- Smart Accessories

### Products (8 rows)
| Title | Price | Compare At | Buying Cost | Category |
|---|---|---|---|---|
| Pro Wireless Earbuds | 2,200 | 3,500 | 900 | Earbuds |
| Bass Neckband Pro | 1,800 | 2,800 | 750 | Earbuds |
| 65W GaN Fast Charger | 2,500 | 3,200 | 1,100 | Chargers |
| Braided USB-C Cable (2m) | 650 | 999 | 200 | Chargers |
| 20000mAh Power Bank | 3,500 | 4,999 | 1,800 | Power Banks |
| Slim 10000mAh Power Bank | 2,200 | 2,999 | 1,000 | Power Banks |
| Smart Fitness Watch | 4,500 | 6,500 | 2,200 | Smart Accessories |
| Magnetic Phone Mount | 1,200 | 0 (no sale) | 450 | Smart Accessories |

All use Unsplash URLs for product images. Stock set to 25-50.

## 2. Hero Carousel — Unsplash Backgrounds

Update `BannerCarousel.tsx` slides array to include `image` URLs from Unsplash (tech/gadget photos). Replace the gradient-only background with a full `<img>` tag + dark glassmorphism overlay (`bg-black/50 backdrop-blur-sm`). Change text color to white for contrast.

## 3. UI Spacing Tightening

- **Testimonials**: Reduce `py-24` to `py-10` — it's way too stretched
- **FlashDeals / TrendingProducts**: Keep `py-8` (already compact)
- **CategoryBubbles**: Keep `py-6` (already compact)
- **BannerCarousel**: Reduce height from `h-[50vh]` to `h-[40vh]` on mobile for tighter feel

## Files Changed

| Action | File |
|---|---|
| Edit | `src/components/BannerCarousel.tsx` — add bg images + dark overlay |
| Edit | `src/components/Testimonials.tsx` — reduce vertical padding |
| Data | Insert 4 categories + 8 products via insert tool |

Total: 2 files edited, 2 data inserts.

