

# Frontend UI/UX Fix Plan — 7 Tasks

## 1. Fix Cart Variant Bug (`CartContext.tsx` + `MiniCart.tsx`)

**Problem:** `removeItem` and `updateQuantity` use `id` only, ignoring variants.

**Fix:**
- Change signatures to accept a **cartKey** (composite of `id + variantId`).
- Create a helper: `const cartKey = (item) => item.variantId ? \`${item.id}__${item.variantId}\` : item.id`
- Update `removeItem(key)` and `updateQuantity(key, qty)` to match using this composite key.
- Update `MiniCart.tsx` lines 81, 88, 95 to pass `cartKey(item)` instead of `item.id`. Same fix needed in `Checkout.tsx` wherever these functions are called.

**Files:** `src/context/CartContext.tsx`, `src/components/MiniCart.tsx`, `src/pages/Checkout.tsx`

---

## 2. Fix Empty Cart UX (`Checkout.tsx`)

**Problem:** Lines 46-53 redirect to `/products` after 100ms when cart is empty.

**Fix:** Replace the redirect with a proper empty-cart UI state — centered illustration with "Your cart is empty" message and a "Browse Products" button. Remove the `setTimeout` redirect entirely.

**File:** `src/pages/Checkout.tsx`

---

## 3. Product Cards Mobile Sizing (`Products.tsx`)

**Problem:** 2-column grid with `h-36` images is too small on mobile.

**Fix:**
- Change image height from `h-36 sm:h-48` to `h-48 sm:h-56`
- Use `aspect-[4/5]` on the image container for better proportions
- Increase padding slightly in the card content area

**File:** `src/pages/Products.tsx`

---

## 4. Rename "The Vault" to "All Products" (`Products.tsx`)

**Fix:** Change the heading from "The Vault" to "All Products" and update the subtitle accordingly. Simple text replacement on lines ~82-84.

**File:** `src/pages/Products.tsx`

---

## 5. Footer Payment & Trust Signals (`Footer.tsx`)

**Fix:** Add a new row above the copyright line with:
- Payment method badges: **COD**, **JazzCash**, **Easypaisa**, **Bank Transfer** (styled as small pill badges with icons)
- Trust signals: "Secure Checkout", "60-Min Delivery in Mirpur"

**File:** `src/components/Footer.tsx`

---

## 6. Merge Address Tab into Profile (`Account.tsx`)

**Problem:** Address fields are on a separate tab from Profile — unnecessary split.

**Fix:**
- Remove the "addresses" tab from the tabs array
- Move the Address and City input fields into the Profile tab section (after Phone, before Save button)
- Remove the `{tab === "addresses" && ...}` block entirely

**File:** `src/pages/Account.tsx`

---

## 7. Add "Buy Now" Button (`ProductDetail.tsx`)

**Fix:** Add a second button next to "Add to Cart" in the CTA grid (line 344-355). The button:
- Calls `handleAddToCart()` logic (adds item to cart)
- Then immediately navigates to `/checkout`
- Styled as outline/secondary variant with a Zap icon
- Grid already has `sm:grid-cols-2` so it will sit side-by-side on desktop

**File:** `src/pages/ProductDetail.tsx`

---

## Summary of Files Changed

| File | Changes |
|------|---------|
| `src/context/CartContext.tsx` | Variant-aware removeItem/updateQuantity |
| `src/components/MiniCart.tsx` | Pass composite cartKey |
| `src/pages/Checkout.tsx` | Empty cart UI + variant-aware calls |
| `src/pages/Products.tsx` | Rename title + bigger mobile cards |
| `src/components/Footer.tsx` | Payment badges + trust signals |
| `src/pages/Account.tsx` | Merge address into profile tab |
| `src/pages/ProductDetail.tsx` | Add Buy Now button |

No database, Supabase, or backend changes. Purely React/UI/state fixes.

