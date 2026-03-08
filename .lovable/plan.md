

# Frontend Audit Fix Plan — Remaining Items

## Status Check: What's Already Done
Cart variant bug ✅ | Empty cart UX ✅ | Buy Now ✅ | Mobile cards ✅ | Rename "The Vault" ✅ | Footer trust ✅ | Account merge ✅ | CSV export ✅ | Date picker ✅ | Dashboard limits ✅ | Store Settings ✅

## Remaining Work (17 items, grouped into 8 implementation batches)

---

### Batch 1: Web3Forms UI Sync (`Checkout.tsx`)
**Problem:** Lines 196-208 — if DB insert succeeds but Web3Forms fails, user sees "Error submitting order."
**Fix:** Move the success logic (setResult, clearCart) to fire right after the Supabase insert succeeds. Web3Forms becomes fire-and-forget (catch silently). The user always sees success if the order is in the DB.

### Batch 2: Products Page — Pagination, Sorting, Enhanced Search (`Products.tsx`)
- **Pagination:** Add a `page` state, show 12 products per page, render prev/next + page numbers below the grid.
- **Sorting:** Add a sort dropdown (Price Low→High, Price High→Low, Newest). Apply `Array.sort()` on `filtered` before slicing.
- **Search enhancement:** Line 79 only matches `title`. Expand to also match `description` and `tags[]`.

### Batch 3: Products Listing — Pass shopId/buyingCost + Wishlist Hearts (`Products.tsx`)
- **shopId/buyingCost:** The `handleAddToCart` on line 88 doesn't pass these. Need to fetch `shop_id, buying_cost` in the products query and pass them to `addItem`.
- **Wishlist heart:** Import `useWishlist`, add a heart icon overlay on each product card (top-right) that toggles wishlist state.

### Batch 4: Product Detail — Image Zoom, Share, Category Breadcrumbs (`ProductDetail.tsx`)
- **Image zoom:** Wrap the main image in a container with CSS `overflow: hidden`. On hover/touch, scale image via a `transform` based on mouse/touch position. Simple lens effect, no library needed.
- **Share button:** Line 4 imports `Share2` but it's unused. Add an `onClick` handler using `navigator.share()` with fallback to clipboard copy.
- **Category breadcrumbs:** Fetch the category name (already have `category_id`). Query `categories` table for the name. Show `Home > Category > Product Title`.

### Batch 5: Order Detail View (`Account.tsx`)
- Add an expandable order row or modal. When user clicks an order, fetch `order_items` for that `order_id`.
- Display product names, quantities, unit prices, variant names in a clean list inside the expanded row.

### Batch 6: Contact Page — Map + WhatsApp (`Contact.tsx`)
- Add an embedded Google Maps iframe (or a static map image placeholder) for Mirpur, AK.
- Add a prominent "Chat on WhatsApp" button below the contact cards linking to `wa.me/923277786498`.

### Batch 7: Admin — Invoice UI + Return/Refund + Inventory Alerts (`AdminOrders.tsx`, new components)
- **Invoice:** Add a "Generate Invoice" button per order that opens a print-friendly modal with order details, formatted as a simple invoice. Use `window.print()`.
- **Return/Refund UI:** In the expanded order view, add a "Process Return" button that shows refund amount input + reason dropdown. Save to local state / toast confirmation (no DB).
- **Inventory Alerts:** Add a section on the Dashboard showing products with `stock <= 5`, sorted by stock ascending. Already have `outOfStock` count; expand to show the actual product list.

### Batch 8: Homepage Refresh (`Index.tsx`, `BannerCarousel.tsx`)
- Add a "Why HUKAM?" value proposition section between Categories and Flash Deals (3 cards: Fast Delivery, COD, Genuine Products).
- Add a "Shop by Brand" or localized banner section to break the generic template feel.
- Keep existing components but reorder: Banner → Value Props → Categories → Flash Deals → Trending → All Products → Testimonials → Newsletter.

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `Checkout.tsx` | Web3Forms fire-and-forget |
| `Products.tsx` | Pagination, sorting, search enhancement, wishlist hearts, shopId/buyingCost |
| `ProductDetail.tsx` | Image zoom, share handler, category breadcrumbs |
| `Account.tsx` | Order detail expansion with order_items |
| `Contact.tsx` | Map placeholder, WhatsApp CTA |
| `AdminOrders.tsx` | Invoice modal, return/refund UI |
| `AdminDashboard.tsx` | Low-stock product list |
| `Index.tsx` | Reorder sections, add value props |

Zero database changes. All frontend React/state/UI only.

