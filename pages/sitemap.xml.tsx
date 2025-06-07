import { GetServerSideProps } from 'next';
import clientPromise from '@/lib/mongodb';

function generateSiteMap(recipes: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static pages -->
     <url>
       <loc>https://receptai.lt</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://receptai.lt/new-recipes</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     <!-- Recipe pages -->
     ${recipes
       .map((recipe) => {
         return `
       <url>
           <loc>https://receptai.lt/recipes/${recipe.slug}</loc>
           <lastmod>${recipe.updatedAt || recipe.createdAt || new Date().toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    
    // Fetch all published recipes
    const recipes = await db
      .collection('recipes')
      .find(
        { status: 'public' },
        { 
          projection: { 
            slug: 1, 
            createdAt: 1, 
            updatedAt: 1 
          } 
        }
      )
      .toArray();

    // Generate the XML sitemap
    const sitemap = generateSiteMap(recipes);

    res.setHeader('Content-Type', 'text/xml');
    // Cache for 24 hours
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://receptai.lt</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
      </urlset>`;
    
    res.setHeader('Content-Type', 'text/xml');
    res.write(fallbackSitemap);
    res.end();

    return {
      props: {},
    };
  }
};

export default SiteMap;
