# HUKAM.PK SEO & Deployment Guide

## 📧 Order Email Templates
✅ **COMPLETED**: Custom branded email templates deployed with:
- Professional formatting with dividers and emojis
- HUKAM brand styling in email subjects
- Structured order confirmations
- Vendor notification system for multi-shop orders

## 🔧 Critical Fix Required
⚠️ **URGENT**: 42 files still use `@/lib/supabase` instead of `@/integrations/supabase/client`
- **Impact**: Checkout fails due to wrong database connection
- **Next Step**: Run global search/replace to fix imports

```bash
# Search and replace all incorrect imports
@/lib/supabase → @/integrations/supabase/client
```

## 🗺️ Sitemap Configuration

### Static Sitemap
- **File**: `public/sitemap.xml` 
- **Contains**: Main pages (home, products, contact, legal)
- **URL**: https://hukam.pk/sitemap.xml

### Dynamic Sitemap (Edge Function)
- **File**: `supabase/functions/sitemap/index.ts`
- **Contains**: Dynamic product URLs from database
- **URL**: https://jjnkwysssrexpvjyyavs.supabase.co/functions/v1/sitemap

### Production Setup
**For Netlify hosting**, add to `_redirects` file (already created):
```
/sitemap.xml https://jjnkwysssrexpvjyyavs.supabase.co/functions/v1/sitemap 200
```

**For Vercel hosting**, create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://jjnkwysssrexpvjyyavs.supabase.co/functions/v1/sitemap"
    }
  ]
}
```

**For Cloudflare Pages**, add page rule:
- Pattern: `hukam.pk/sitemap.xml`
- Forwarding URL: `https://jjnkwysssrexpvjyyavs.supabase.co/functions/v1/sitemap`

## 🔍 Google Search Console Setup

### 1. Add Property
- Go to [Google Search Console](https://search.google.com/search-console/)
- Add property: `https://hukam.pk`
- Verify ownership using HTML file or DNS

### 2. Submit Sitemap
- Navigate to **Sitemaps** in left sidebar
- Add sitemap URL: `https://hukam.pk/sitemap.xml`
- Click **Submit**

### 3. Monitor Status
- Check sitemap processing status
- Review **Coverage** report for indexed pages
- Monitor **Performance** for search analytics

## 🚀 SEO Improvements Completed

### Meta Tags & Open Graph
✅ **RouteSEO Component**: Automatic meta tags for all pages
✅ **Dynamic Titles**: Page-specific titles with brand suffix
✅ **Descriptions**: SEO-optimized descriptions per page
✅ **Keywords**: Relevant keywords for Pakistani market
✅ **Canonical URLs**: Prevent duplicate content
✅ **Open Graph**: Social media sharing optimization

### Structured Data
✅ **Organization Schema**: Brand information
✅ **Website Schema**: Search functionality
✅ **Product Schema**: Individual product pages (via ProductDetail.tsx)

## 📊 Performance Monitoring

### Google Analytics
- Add GA4 tracking code to `index.html`
- Track conversions for orders

### Search Console Alerts
- Set up email notifications for critical issues
- Monitor mobile usability
- Track Core Web Vitals

## 🎯 Next Steps Priority

1. **FIX IMPORTS** - Replace `@/lib/supabase` in 42 files
2. **Test Checkout** - Verify order completion after import fix
3. **Submit Sitemap** - Add to Google Search Console
4. **Configure Redirects** - Set up hosting provider rewrite rules
5. **Monitor SEO** - Track performance and indexing status

---

**Contact**: For technical support, reach out via project chat or WhatsApp +92 342 680 7645