import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const siteUrl = config.public.siteUrl || 'http://localhost:3001'

  try {
    // Fetch all published pages
    const pagesResponse = await $fetch<{ data: any[] }>(`${apiBase}/pages`, {
      params: { status: 'PUBLISHED' }
    })
    const pages = pagesResponse.data || []

    // Fetch all published posts
    const postsResponse = await $fetch<{ data: any[] }>(`${apiBase}/posts`, {
      params: { status: 'PUBLISHED', limit: 1000 }
    })
    const posts = postsResponse.data || []

    // Fetch all active products
    const productsResponse = await $fetch<{ data: any[] }>(`${apiBase}/products`, {
      params: { isActive: true, limit: 1000 }
    })
    const products = productsResponse.data || []

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Pages -->
${pages
  .filter((page: any) => page.slug !== 'home') // Exclude home page
  .map((page: any) => `  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt || page.createdAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  .join('\n')}

  <!-- Posts List -->
  <url>
    <loc>${siteUrl}/posts</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Posts -->
${posts
  .map((post: any) => `  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updatedAt || post.createdAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
  .join('\n')}

  <!-- Products List -->
  <url>
    <loc>${siteUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Products -->
${products
  .map((product: any) => `  <url>
    <loc>${siteUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt || product.createdAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
  .join('\n')}

</urlset>`

    // Set response headers
    event.node.res.setHeader('Content-Type', 'application/xml')
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    return sitemap
  } catch (error) {
    console.error('Error generating sitemap:', error)

    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    event.node.res.setHeader('Content-Type', 'application/xml')
    return fallbackSitemap
  }
})
