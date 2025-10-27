import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'http://localhost:3001'

  const robotsTxt = `# Robots.txt for Docms Website
# Generated automatically

User-agent: *
Allow: /

# Disallow private/admin paths (if any in future)
# Disallow: /admin
# Disallow: /api

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay (optional, uncomment if needed)
# Crawl-delay: 1

# Block specific bots (examples, uncomment if needed)
# User-agent: BadBot
# Disallow: /

# Allow common search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: Slurp
Allow: /
`

  // Set response headers
  event.node.res.setHeader('Content-Type', 'text/plain')
  event.node.res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours

  return robotsTxt
})
