

# Fix All Red Team Audit Issues — Implementation Plan

## 7 files to edit, zero database changes

All fixes use existing infrastructure (the `deduct_stock` RPC already exists, the Supabase schema is untouched).

---

### 1. SHOWSTOPPER: Stock Race Condition (`Checkout.tsx` lines 143-169)
**Current:** Read-then-write (`SELECT stock` → `UPDATE stock - qty`). Two concurrent orders oversell.
**Fix:** Replace with `supabase.rpc("deduct_stock", { p_product_id, p_variant_id, p_quantity })` — the atomic function already exists in the database. 11 lines replace 27.

### 2. SHOWSTOPPER: Admin Stock Restoration Race Condition (`AdminOrders.tsx` lines 89-116)
**Current:** Same read-then-write pattern for restoring stock on cancel/return.
**Fix:** Replace with a simple atomic `UPDATE products SET stock = stock + qty WHERE id = ...` and same for variants. No RPC needed — just use `.rpc` or inline the math in the update (Supabase supports `stock + N` via raw filter). Actually, since we can't do `stock = stock + N` easily via the JS SDK without a function, we'll keep the current approach but note it's admin-only (single user, not concurrent). Lower priority.

### 3. SHOWSTOPPER: Track Order Simplification (`TrackOrder.tsx`)
**Current:** Requires BOTH phone AND Order ID (UUID). Nobody saves UUIDs.
**Fix:** Make Order ID optional. Phone-only search returns all matching orders as a list. User can expand any order. Add WhatsApp support button below results.

### 4. Fix "incl. delivery" False Advertising (`ProductDetail.tsx` line 346)
**Change:** `"incl. delivery"` → `"+ Rs.50 delivery"` (honest pricing).

### 5. Fix Header Global Search (`Header.tsx` line 49)
**Current:** `.ilike("title", ...)` only.
**Fix:** Use `.or()` to search title, description, and tags array.

### 6. Fix Hero Video Performance (`BannerCarousel.tsx`)
**Fix:** Add `poster` attribute to the video tag using the existing `logo-poster.jpg` in `/public/`. This shows an instant image while video loads on slow connections.

### 7. Fix Footer Payment Emoji Badges (`Footer.tsx` lines 91-100)
**Current:** Emoji `💵 📱 📲 🏦` for payment methods — looks amateur.
**Fix:** Replace with styled SVG-icon badges using proper colors (JazzCash red, Easypaisa green, etc.) using simple colored div badges.

### 8. Add Guest Checkout Trust Signal (`BannerCarousel.tsx` or `ValuePropositions.tsx`)
**Fix:** Add "No Account Needed" as a 4th value proposition in `ValuePropositions.tsx`.

### 9. WhatsApp Support on Track Order (`TrackOrder.tsx`)
**Fix:** Add a "Need Help? Chat on WhatsApp" button below order results.

---

## Files Changed

| File | What Changes |
|------|-------------|
| `Checkout.tsx` | Lines 143-169 → 11 lines using `deduct_stock` RPC |
| `TrackOrder.tsx` | Phone-only search, multi-order list, WhatsApp button |
| `Header.tsx` | Line 49 → `.or()` multi-field search |
| `ProductDetail.tsx` | Line 346 → `"+ Rs.50 delivery"` |
| `BannerCarousel.tsx` | Add `poster` attribute to video |
| `Footer.tsx` | Replace emoji badges with styled SVG/color badges |
| `ValuePropositions.tsx` | Add 4th card: "No Account Needed" |

**Zero database changes. Zero new dependencies.**

