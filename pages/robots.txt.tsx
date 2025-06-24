// Dynamic robots.txt generation
import { GetServerSideProps } from 'next';

function RobotsTxt() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  const isProduction = process.env.NODE_ENV === 'production';
  
  const robotsTxt = `# Robots.txt for Ragaujam.lt - Lithuanian Recipe Website
# Generated automatically on ${new Date().toISOString()}

User-agent: *
${isProduction ? 'Allow: /' : 'Disallow: /'}

# Allow all search engines to crawl the site in production
${isProduction ? `
# Main content areas
Allow: /receptas/
Allow: /paieska/
Allow: /pagal-ingredienta/
Allow: /patiekalo-tipas/
Allow: /gaminimo-budas/
Allow: /images/
Allow: /api/sitemap

# Specific recipe pages
Allow: /receptas/*/

# Static pages
Allow: /apie-mus
Allow: /kontaktai
Allow: /privatumas
Allow: /taisykles
` : ''}

# Disallow admin and development areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.env
Disallow: /package.json
Disallow: /package-lock.json

# Disallow search result pages with parameters
Disallow: /*?search=*
Disallow: /*?filter=*
Disallow: /*?page=*
Disallow: /*?sort=*

# Disallow duplicate content
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?source=*

# Allow specific crawlers for better indexing
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 3

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 2

User-agent: Baiduspider
Allow: /
Crawl-delay: 5

User-agent: YandexBot
Allow: /
Crawl-delay: 3

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Block problematic crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MegaIndex
Disallow: /

# Sitemap locations
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-search.xml
Sitemap: ${baseUrl}/sitemap-images.xml

# Additional information
# Website: ${baseUrl}
# Contact: info@ragaujam.lt
# Language: Lithuanian (lt)
# Content: Recipe website with interactive features
# Last updated: ${new Date().toISOString()}
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
  res.write(robotsTxt);
  res.end();

  return {
    props: {}
  };
};

export default RobotsTxt;
