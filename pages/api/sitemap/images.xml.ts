// Enhanced Image Sitemap for Recipe Images
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    
    // Get all published recipes with images
    const recipes = await db.collection('recipes_new')
      .find(
        { status: 'published' },
        { 
          projection: { 
            slug: 1, 
            title: 1, 
            image: 1, 
            updatedAt: 1,
            instructions: 1 // For step images
          } 
        }
      )
      .limit(1000) // Limit for performance
      .toArray();

    let imageEntries = '';

    recipes.forEach(recipe => {
      const recipeUrl = `${baseUrl}/receptas/${recipe.slug}`;
      const lastmod = new Date(recipe.updatedAt).toISOString();

      // Main recipe image
      if (recipe.image?.src) {
        imageEntries += `
  <url>
    <loc>${recipeUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <image:image>
      <image:loc>${recipe.image.src}</image:loc>
      <image:caption>${recipe.image.alt || recipe.title.lt}</image:caption>
      <image:title>${recipe.title.lt}</image:title>
      <image:license>${baseUrl}/license</image:license>
    </image:image>
  </url>`;
      }

      // Step images (if available)
      if (recipe.instructions) {
        recipe.instructions.forEach((instruction: any, index: number) => {
          if (instruction.image) {
            imageEntries += `
  <url>
    <loc>${recipeUrl}#step${instruction.step}</loc>
    <lastmod>${lastmod}</lastmod>
    <image:image>
      <image:loc>${instruction.image}</image:loc>
      <image:caption>Žingsnis ${instruction.step}: ${instruction.text.lt.substring(0, 100)}...</image:caption>
      <image:title>${recipe.title.lt} - Žingsnis ${instruction.step}</image:title>
      <image:license>${baseUrl}/license</image:license>
    </image:image>
  </url>`;
          }
        });
      }
    });

    const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries}
</urlset>`;

    await client.close();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.status(200).send(imageSitemap);

  } catch (error) {
    console.error('Error generating image sitemap:', error);
    res.status(500).json({ error: 'Failed to generate image sitemap' });
  }
}
