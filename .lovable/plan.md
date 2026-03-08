

# HUKAM Multi-Vendor Marketplace Architecture Plan

## Infrastructure Clarification

Your project runs on Lovable Cloud, which **is** Supabase under the hood. The client file (`src/integrations/supabase/client.ts`) already uses environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — no hardcoded URLs exist. When you deploy to Cloudflare via GitHub, you set these same env vars in your Cloudflare dashboard pointing to your production Supabase instance, and everything works identically. There is nothing Lovable-specific baked into the code.

The legacy `src/lib/supabase.ts` file (which uses `VITE_SUPABASE_ANON_KEY`) is **unused** — no file imports from it. I will remove it to avoid confusion.

The auth flow in `AdminLogin.tsx` uses standard `supabase.auth.signInWithPassword` — fully portable to any domain.

---

## Phase 1: Database Schema — New Tables & Columns

### 1A. Shops (Vendors) Table
```sql
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku_prefix text NOT NULL UNIQUE,  -- e.g. "SHOPA"
  contact_name text,
  email text,
  phone text,
  address text,
  commission_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
-- RLS: public read, authenticated write
```

### 1B. Products — New Columns
```sql
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS buying_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_sku text;
```

- `buying_cost` = COGS (admin-only, never exposed on frontend)
- `compare_at_price` = strikethrough price for SALE badge
- `auto_sku` = auto-generated from shop prefix + sequence
- `shop_id` = which vendor owns this product

### 1C. Order Items Table (Normalized)
Currently items are stored as a text blob. For multi-vendor split we need a proper junction table:
```sql
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  variant_name text,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  buying_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
-- RLS: public read, anyone insert, authenticated update/delete
```

### Raw SQL for External Supabase
All migrations above will be output as raw SQL in a single migration file so you can copy-paste them into your own SQL editor if needed.

---

## Phase 2: Admin — Shop Management

### New page: `/admin/shops`
- Data table listing all shops (Name, SKU Prefix, Commission %, Active toggle)
- "Add Shop" slide-out drawer with fields: Name, Slug, SKU Prefix, Contact, Email, Phone, Address, Commission %
- Edit/Delete per row
- Add "Shops" to the admin sidebar with `Store` icon

### Admin Products — Shop Assignment
- Add a "Shop" dropdown in the Add/Edit Product form
- Auto-generate SKU when shop is selected: `{shop.sku_prefix}-{sequence}`
- Add `Buying Cost` and `Compare-at Price` fields (visible only in admin)
- Show calculated **Profit Margin %** next to the price fields

---

## Phase 3: Multi-Vendor Order Split

### Admin Orders — Shop-Split View
When expanding an order row, group items by shop:
```text
Order #abc123
├── Shop A (Commission: 10%)
│   ├── Product X (Qty: 2) — Rs.1000
│   └── Product Y (Qty: 1) — Rs.500
├── Shop B (Commission: 15%)
│   └── Product Z (Qty: 1) — Rs.800
└── Financial Summary
    Subtotal: Rs.2300 | Shipping: Rs.200 | Discount: -Rs.100 | Total: Rs.2400
```

### Email Split Logic
Update the `send-order-email` edge function:
- Customer gets the full receipt (all items)
- Each shop gets an email with ONLY their items + quantities
- Use the shop's email from the `shops` table

---

## Phase 4: True-Business Dashboard

### KPI Upgrades
Replace simple revenue metrics with:
- **True Net Profit** = SUM(selling_price × qty) - SUM(buying_cost × qty) across delivered orders
- **Total Inventory Valuation** = SUM(buying_cost × stock) across all active products
- **Gross Margin %** = (Revenue - COGS) / Revenue × 100

### Dashboard Cards
```text
[Today's Sales] [Net Profit] [Inventory Value] [Pending Orders]
[Weekly Revenue] [Gross Margin %] [Out of Stock] [Active Shops]
```

### Revenue vs Profit Chart
Dual-line chart: Revenue line + Profit line over 14 days

---

## Phase 5: Frontend — SALE Badges & Strikethrough

### Product Cards (ProductShowcase, AllProducts, Products page)
- If `compare_at_price > price`: show `compare_at_price` with strikethrough + red SALE badge
- Calculate discount %: `Math.round((1 - price/compare_at_price) * 100)`
- Display: ~~Rs.3000~~ **Rs.2200** `-27%`

### Product Detail Page
- Same strikethrough logic with larger typography
- `buying_cost` is NEVER sent to the frontend query (select specific columns, exclude `buying_cost`)

---

## Phase 6: Checkout — Order Items Normalization

### Update Checkout Flow
When placing an order:
1. INSERT into `orders` table (as before)
2. For each cart item, INSERT into `order_items` with `product_id`, `shop_id`, `variant_id`, `quantity`, `unit_price`, `buying_cost`
3. This enables the multi-vendor split view and profit calculations

---

## Phase 7: Cleanup & QA

### Remove Dead Code
- Delete `src/lib/supabase.ts` (unused legacy file)

### Mobile Checkout Sticky Bar
- Already uses `form="checkout-form"` binding — verify it works

### Track Order
- Already queries by phone with `ilike` — verify edge cases

### N-Tier Categories
- Already working with self-referencing `parent_id` — verify deep nesting

---

## Implementation Order

1. **Database migrations** — shops table, products columns, order_items table
2. **Admin Shops page** — CRUD with drawer UI
3. **Admin Products** — shop dropdown, buying cost, compare-at price, auto-SKU, margin display
4. **Order Items normalization** — update checkout to insert into order_items
5. **Admin Orders** — shop-split view in expanded rows
6. **Dashboard** — net profit, inventory valuation, margin chart
7. **Frontend** — SALE badges, strikethrough pricing
8. **Edge function** — multi-vendor email split
9. **Cleanup** — remove `src/lib/supabase.ts`, verify mobile/track-order

Total: ~12 files modified/created, 1 migration, 1 edge function update.

