// API endpoint for tag data
// GET /api/tags/[tag]

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { tag } = req.query;

    if (!tag || typeof tag !== 'string') {
      return res.status(400).json({ message: 'Tag is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get tag data - try both slug and name
    const tagData = await db.collection('tags_new').findOne({ 
      $or: [
        { slug: tag },
        { name: tag }
      ]
    });

    if (!tagData) {
      // If tag doesn't exist in tags_new, create a basic response
      const recipeCount = await db.collection('recipes_new').countDocuments({
        tags: tag
      });

      if (recipeCount === 0) {
        await client.close();
        return res.status(404).json({ message: 'Tag not found' });
      }

      // Return basic tag data
      await client.close();
      return res.status(200).json({
        tag: {
          name: tag,
          slug: tag.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
          recipeCount: recipeCount,
          description: `Receptai su ${tag}`,
          relatedTags: [],
          popularityScore: 5.0,
          trending: false,
          seo: {
            metaTitle: `${tag} receptai (${recipeCount}) - Paragaujam.lt`,
            metaDescription: `${recipeCount} receptai su "${tag}". Raskite geriausius receptus su nuotraukomis ir instrukcijomis.`,
            keywords: [tag, 'receptai', 'lietuviški']
          }
        },
        relatedTags: []
      });
    }

    // Get related tags
    const relatedTags = await db.collection('tags_new')
      .find({ 
        name: { $in: tagData.relatedTags || [] },
        _id: { $ne: tagData._id }
      })
      .sort({ recipeCount: -1 })
      .limit(8)
      .toArray();

    await client.close();

    res.status(200).json({
      tag: tagData,
      relatedTags
    });

  } catch (error) {
    console.error('Tag API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
