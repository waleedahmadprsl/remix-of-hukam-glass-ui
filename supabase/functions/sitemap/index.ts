import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Product {
  id: string;
  title: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/xml',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return new Response('Error generating sitemap', { status: 500 })
    }

    const baseUrl = 'https://hukam.pk'
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/track-order</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <!-- Product Pages -->
${products?.map((product: Product) => `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${product.updated_at.split('T')[0]}</lastmod>
  </url>`).join('\n') || ''}
</urlset>`

    return new Response(sitemap, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})