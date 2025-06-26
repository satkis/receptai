// Enhanced Sitemap Index for Large Recipe Sites
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  const currentDate = new Date().toISOString();

  // Sitemap index for large sites (10,000+ recipes)
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages sitemap -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap/pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Categories sitemap -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap/categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Recipes sitemap (split into chunks of 1000) -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap/recipes-1.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/api/sitemap/recipes-2.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Images sitemap -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap/images.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- News sitemap for fresh content -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap/news.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemapIndex);
}
