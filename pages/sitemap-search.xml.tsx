// Search sitemap for popular Lithuanian recipe search terms
import { GetServerSideProps } from 'next';
import { MongoClient } from 'mongodb';

function SearchSitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get popular search terms from tags
    const popularTags = await db.collection('recipes_new')
      .aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 }, // Top 100 popular terms
        { $match: { count: { $gte: 3 } } } // Only terms with 3+ recipes
      ])
      .toArray();

    // Get popular ingredient terms
    const popularIngredients = await db.collection('recipes_new')
      .aggregate([
        { $unwind: "$ingredients" },
        { $group: { _id: "$ingredients.name.lt", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
        { $match: { count: { $gte: 5 } } }
      ])
      .toArray();

    await client.close();

    // Generate search sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Popular tag searches -->
  ${popularTags.map(tag => `
  <url>
    <loc>${baseUrl}/paieska?q=${encodeURIComponent(tag._id)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}

  <!-- Popular ingredient searches -->
  ${popularIngredients.map(ingredient => `
  <url>
    <loc>${baseUrl}/paieska?q=${encodeURIComponent(ingredient._id)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}

  <!-- Common Lithuanian recipe searches -->
  <url>
    <loc>${baseUrl}/paieska?q=cepelinai</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/paieska?q=šaltibarščiai</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/paieska?q=kugelis</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/paieska?q=kibinai</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
    res.setHeader('X-Robots-Tag', 'noindex'); // Don't index the sitemap itself
    res.write(sitemap);
    res.end();

    return {
      props: {}
    };
  } catch (error) {
    console.error('Error generating search sitemap:', error);
    
    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/paieska</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=300'); // Short cache on error
    res.write(fallbackSitemap);
    res.end();

    return {
      props: {}
    };
  }
};

export default SearchSitemap;
