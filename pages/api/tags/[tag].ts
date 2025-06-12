// API endpoint for tag data
// GET /api/tags/[tag]

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

// Helper function to convert Lithuanian characters to standard letters
function lithuanianToSlug(text: string): string {
  const lithuanianMap: Record<string, string> = {
    'ą': 'a', 'Ą': 'A',
    'č': 'c', 'Č': 'C',
    'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E',
    'į': 'i', 'Į': 'I',
    'š': 's', 'Š': 'S',
    'ų': 'u', 'Ų': 'U',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z'
  };

  return text
    .split('')
    .map(char => lithuanianMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to find tag by slug or original name
async function findTagBySlugOrName(db: any, searchTerm: string) {
  // First try to find by exact slug match
  let tagData = await db.collection('tags_new').findOne({ slug: searchTerm });

  if (tagData) return tagData;

  // If not found, try to find by exact name match
  tagData = await db.collection('tags_new').findOne({ name: searchTerm });

  if (tagData) return tagData;

  // If still not found, try to find by converting Lithuanian characters
  // Get all tags and check if any convert to our search term
  const allTags = await db.collection('tags_new').find({}).toArray();

  for (const tag of allTags) {
    if (lithuanianToSlug(tag.name) === searchTerm) {
      return tag;
    }
  }

  return null;
}

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

    // Get tag data using helper function
    const tagData = await findTagBySlugOrName(db, tag as string);

    if (!tagData) {
      // If tag doesn't exist in tags_new, try to find recipes with original Lithuanian tag names
      // Search for recipes that might have this tag in their groupLabels or tags arrays
      const recipeCount = await db.collection('recipes_new').countDocuments({
        $or: [
          { tags: tag },
          { groupLabels: tag },
          { tags: { $regex: new RegExp(tag.replace(/[-]/g, '\\s'), 'i') } },
          { groupLabels: { $regex: new RegExp(tag.replace(/[-]/g, '\\s'), 'i') } }
        ]
      });

      if (recipeCount === 0) {
        await client.close();
        return res.status(404).json({ message: 'Tag not found' });
      }

      // Convert slug back to a more readable name
      const displayName = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      // Return basic tag data
      await client.close();
      return res.status(200).json({
        tag: {
          name: displayName,
          slug: lithuanianToSlug(displayName),
          recipeCount: recipeCount,
          description: `Receptai su ${displayName}`,
          relatedTags: [],
          popularityScore: 5.0,
          trending: false,
          seo: {
            metaTitle: `${displayName} receptai (${recipeCount}) - Paragaujam.lt`,
            metaDescription: `${recipeCount} receptai su "${displayName}". Raskite geriausius receptus su nuotraukomis ir instrukcijomis.`,
            keywords: [displayName, 'receptai', 'lietuviški']
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
