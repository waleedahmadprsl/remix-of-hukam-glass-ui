

# HUKAM Enterprise Roadmap — Updated Architecture Plan

## Acknowledged: Current State

The existing system already has: shops table, order_items with buying_cost, product variants, compare_at_price, auto_sku, N-tier categories, shop-split order views, and SALE badges. The `video_url` field already exists on products.

---

## Future Phase: Daraz-Level Product Management

### Database Additions (products table)
```sql
ALTER TABLE products
  ADD COLUMN weight_kg numeric DEFAULT 0,
  ADD COLUMN dimensions_l numeric DEFAULT 0,
  ADD COLUMN dimensions_w numeric DEFAULT 0,
  ADD COLUMN dimensions_h numeric DEFAULT 0,
  ADD COLUMN warranty_type text DEFAULT '',
  ADD COLUMN return_policy text DEFAULT '7-day return',
  ADD COLUMN meta_title text DEFAULT '',
  ADD COLUMN meta_description text DEFAULT '',
  ADD COLUMN search_keywords text[] DEFAULT '{}';
```

### Admin Product Form Updates
- Add "Logistics" section: Weight, L×W×H dimension inputs
- Add "Trust Signals" section: Warranty Type dropdown, Return Policy dropdown
- Add "SEO" section: Meta Title, Meta Description, Search Keywords chips
- Video URL field already exists — no change needed

### Frontend SEO
- Inject `meta_title` and `meta_description` into `<head>` via `document.title` and meta tags on ProductDetail page

---

## Future Phase: Amazon-Level Frontend Psychology

### Cross-Selling Engine
- New `product_relations` table: `product_id`, `related_product_id`, `relation_type` (frequently_bought, similar)
- "Frequently Bought Together" section on ProductDetail with bundled "Add All to Cart" button
- Fallback: show products from same category if no manual relations exist

### Advanced Filtering (Products Page)
- Sidebar with: Price range slider, Category tree checkboxes, Rating filter (stars), Tags/Brand chips
- URL query params for shareable filtered links
- Mobile: collapsible filter drawer

### Customer Q&A
- New `product_questions` table: `product_id`, `question`, `answer`, `asked_by`, `answered_at`
- Q&A accordion on ProductDetail below reviews
- Admin panel section to answer pending questions

### Recently Viewed Products
- Store last 10 viewed product IDs in `localStorage`
- Horizontal strip on homepage and product pages: "Recently Viewed"
- No database needed — purely client-side

### Visual Order Tracking Stepper
- Already partially implemented in TrackOrder.tsx with `statusSteps` array
- Enhance with: connected line between steps, filled/unfilled circles, estimated dates, color transitions
- Add tracking ID display and courier link if available

---

## Immediate Next Step: Execute Existing Plan

The previously approved migrations (shops, order_items, product columns) are already applied. The admin pages (Shops, Products with pricing fields, Orders with shop-split) are already built.

**What to implement now:** The enterprise product fields (logistics, warranty, SEO) and the frontend psychology modules (cross-selling, filtering, Q&A, recently viewed, visual tracker).

This requires:
1. One migration for new product columns + product_relations + product_questions tables
2. Update AdminProducts form with new field sections
3. Update ProductDetail with cross-sell, Q&A, recently viewed
4. Update Products page with advanced filter sidebar
5. Enhance TrackOrder with visual stepper timeline

~8 files modified/created, 1 migration.

