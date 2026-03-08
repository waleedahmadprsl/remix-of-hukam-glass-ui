

# Homepage Polish: Newsletter + Footer + Visual Verification

## 1. Create Newsletter Signup Section

New file: `src/components/Newsletter.tsx`

- Sleek inline bar with glassmorphism card style
- Single-row layout: email input + "Subscribe" button
- Framer Motion entrance animation
- Icon badge (Mail) + heading "Stay in the Loop" + subtitle
- Pure UI component (no backend wiring yet — toast on submit)

## 2. Update Index.tsx

Add `<Newsletter />` between `<AllProducts />` and `<Testimonials />`.

## 3. Modernize Footer

Redesign `Footer.tsx`:
- Tighter spacing: `pt-10 pb-6` instead of `pt-16 pb-8`
- Cleaner 3-column layout on desktop (Brand + Links combined, Legal, Socials)
- Smaller text, consistent `text-xs` for links
- Remove bulky grid gap, use `gap-8` instead of `gap-10`
- Subtle separator line with `border-border/20`
- Bottom bar: copyright centered with version/year

## 4. Files Changed

| Action | File |
|---|---|
| Create | `src/components/Newsletter.tsx` |
| Edit | `src/pages/Index.tsx` — add Newsletter |
| Edit | `src/components/Footer.tsx` — modernize layout |

3 files total.

