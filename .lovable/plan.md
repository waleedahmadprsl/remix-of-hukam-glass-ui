

# HUKAM Platform — Shopify-Grade Architecture Plan

## Clarification: Backend

Your project already runs on Lovable Cloud, which uses Supabase under the hood. All your data, auth, storage, and edge functions are already powered by Supabase — no migration needed. Everything you see in the database IS Supabase.

---

## Phase 1: Database Schema Upgrades

### N-Tier Dynamic Category System
Replace the fixed 2-tier `categories` + `sub_categories` with a single self-referencing `categories` table:

```sql
-- New categories table with parent_id for unlimited nesting
ALTER TABLE categories ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN level integer DEFAULT 0;
-- Migrate existing sub_categories into categories with parent_id set
-- Drop sub_categories table after migration
```

This allows unlimited category depth (Main -> Category -> Sub -> Sub-sub -> ...) like Amazon/Daraz.

### Product Variants Table
```sql
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_name text NOT NULL,        -- e.g. "Black / Large"
  sku text,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}'      -- {"color":"Black","size":"Large"}
);
```

### Orders Enhancement
```sql
ALTER TABLE orders ADD COLUMN tracking_id text;
ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
```

### Promo Codes Enhancement
```sql
ALTER TABLE promo_codes ADD COLUMN min_purchase numeric DEFAULT 0;
ALTER TABLE promo_codes ADD COLUMN usage_limit integer;
ALTER TABLE promo_codes ADD COLUMN times_used integer DEFAULT 0;
ALTER TABLE promo_codes ADD COLUMN discount_type text DEFAULT 'percentage'; -- already exists, ensure values
```

### Products Status Field
```sql
ALTER TABLE products ADD COLUMN status text DEFAULT 'active'; -- active, draft, archived
ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';     -- ["New Arrival", "Bestseller"]
```

---

## Phase 2: Admin Panel Overhaul

### 2A. Admin Categories Page — Dynamic N-Tier Tree
- Render categories as a collapsible tree (indented levels)
- Each node shows: name, level badge, edit/delete buttons
- "+ Add Child" button on each node to add a sub-level
- "+ Add Root Category" at the top
- No hardcoded limit on depth

### 2B. Admin Products Page — PIM System
- **Product list**: Searchable, sortable data table with pagination, bulk select checkboxes
- **Bulk actions toolbar**: Update price/stock, toggle active/draft/archived for selected items
- **Add/Edit Product drawer** (slide-out, not page redirect):
  - Title, Description (with key features/specs fields)
  - Price, Stock, Status toggle (Active/Draft/Archived)
  - Category picker (cascading N-tier dropdowns)
  - Tags multi-select chips ("New Arrival", "Bestseller")
  - **Media Center**: Grid of uploaded images with delete (X) overlay, drag-to-reorder, click-to-set-primary
  - **Variants section**: Add/remove variant rows (Name, SKU, Price, Stock, Color/Size attributes)

### 2C. Admin Orders — Lifecycle Pipeline
- Status filter tabs: All | Pending | Confirmed | Dispatched | Delivered | Returned/Canceled
- Expandable rows showing: customer details, items with variants, financial breakdown (subtotal, shipping, discount, total)
- Tracking ID input field per order
- Status change dropdown with confirmation
- Real-time beep notifications (already implemented)

### 2D. Admin Dashboard — KPI Command Center
- Top KPI cards: Today's Sales, Weekly Revenue, Pending Orders, Out-of-Stock alerts
- Revenue trend chart (recharts, 14-day line chart)
- Top selling products list
- Recent orders feed

### 2E. Admin CRM (Customers page)
- Customer directory grouped by phone/email
- LTV calculation, order count, average order value
- "First-Time" vs "Returning" badge
- Click to expand full order history

### 2F. Promo Code Engine
- Create codes with: Type (Percentage/Fixed/Free Shipping), Min purchase, Usage limit
- Track times_used and revenue impact
- Active/Inactive toggle

### 2G. Admin UI Polish
- Sticky sidebar (already exists), ensure mobile-responsive with hamburger collapse
- All data tables: horizontal scroll on mobile, search bar, sort headers, pagination (20 per page)
- All create/edit actions via slide-out drawers (Sheet component)

---

## Phase 3: Frontend & Checkout Improvements

### 3A. Mobile Responsiveness
- Header: ensure search, cart, wishlist icons fit on small screens
- Product cards: 2-column grid on mobile with proper spacing
- Checkout sticky bottom bar fix (form submit binding)
- Track Order page: already responsive, verify form usability

### 3B. Guest Checkout (already implemented)
- Verify dual-write: Supabase INSERT + Web3Forms POST
- Post-purchase "Track Your Order" button with Order ID display

### 3C. Track Order Fix
- The current implementation looks correct — queries by phone with `ilike`
- Will test and fix any edge cases (phone format normalization)

### 3D. Premium Conversion Features
- Mini cart slide-out (already done)
- Live search (already done)
- Wishlist (already done)
- Scarcity triggers on product pages (already done)

---

## Implementation Order

1. **Database migrations** — N-tier categories, variants table, orders/products/promos columns
2. **Admin Categories** — Tree UI with unlimited nesting
3. **Admin Products** — PIM with variants, media center, bulk actions, drawer UI
4. **Admin Orders** — Pipeline with tracking ID, financial breakdown
5. **Admin Dashboard** — KPI charts and stats
6. **Admin Promos** — Enhanced engine with usage tracking
7. **Mobile responsive fixes** — Header, checkout, admin tables
8. **Track Order verification** — Test and fix edge cases

This is a large implementation (~15 files touched, 5 new database migrations). Each phase builds on the previous one.

