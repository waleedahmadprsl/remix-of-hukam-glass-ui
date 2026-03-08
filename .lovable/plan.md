

# Homepage Polish: Social Links, Newsletter DB, Product Images, Mobile UX

## 1. Add Unique Email Constraint to newsletter_subscribers
- Database migration: `ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);`
- The Newsletter component already handles error code `23505` (duplicate), so this just enables that path.

## 2. Update Footer Social Links
- Update WhatsApp href to actual number (awaiting from user, use placeholder for now)
- TikTok and Instagram links currently point to `#` -- update to actual URLs when provided
- Facebook already points to `facebook.com/hukam.pk`

## 3. Fix Product Images
Some Unsplash URLs may not load reliably. Replace product images with more reliable Unsplash photo IDs:
- **Pro Wireless Earbuds**: `photo-1590658268037-6bf12f032f55` (earbuds) -- keep, looks fine
- **Magnetic Phone Mount**: currently uses headphones image (`photo-1583394838336-acd977736f90`) -- replace with a phone mount image
- Update via SQL `UPDATE` on the products table with better image URLs

## 4. Add Reviewer Avatar Images to Testimonials
- Replace pravatar.cc URLs (which can be unreliable) with stable Unsplash portrait URLs or use initials fallback via `AvatarFallback`
- Add the HUKAM brand video (already present as `logo-video.mp4`) -- already integrated in Testimonials

## 5. Mobile Responsiveness & Interactive UI Improvements
- **AllProducts**: Add ChevronLeft/ChevronRight arrow navigation buttons (currently only has filter tabs, no arrows)
- **FlashDeals/TrendingProducts**: Already have arrows -- verify working
- **AllProducts mobile**: Make the grid scrollable horizontally on mobile with arrow buttons, or keep grid but ensure 2-col works well
- **Add to Cart buttons**: Already visible on mobile (`sm:opacity-0 sm:group-hover:opacity-100`) -- good

## Files Changed

| Action | File |
|---|---|
| Migration | Add UNIQUE constraint on `newsletter_subscribers.email` |
| Data | UPDATE product images for broken URLs |
| Edit | `src/components/Footer.tsx` -- update social URLs |
| Edit | `src/components/Testimonials.tsx` -- stable avatar URLs |
| Edit | `src/components/AllProducts.tsx` -- add arrow navigation for horizontal browsing |

5 files/operations total.

