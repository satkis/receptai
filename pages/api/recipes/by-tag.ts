// API endpoint for tag-based recipe search
// GET /api/recipes/by-tag?tag=...&page=...&sort=...

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      tag,
      page = '1',
      limit = '12',
      sort = 'newest'
    } = req.query;

    if (!tag || typeof tag !== 'string') {
      return res.status(400).json({ message: 'Tag is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get tag data
    const tagData = await db.collection('tags_new').findOne({ 
      $or: [
        { slug: tag },
        { name: tag }
      ]
    });

    if (!tagData) {
      await client.close();
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Build sort criteria
    let sortCriteria: any = { publishedAt: -1 }; // Default: newest
    
    switch (sort) {
      case 'rating':
        sortCriteria = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'time':
        sortCriteria = { totalTimeMinutes: 1 };
        break;
      case 'popular':
        sortCriteria = { 'rating.count': -1, 'rating.average': -1 };
        break;
      case 'alphabetical':
        sortCriteria = { 'title.lt': 1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Query recipes with this tag
    const query = { tags: tagData.name };

    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('recipes_new').countDocuments(query)
    ]);

    // Get related tags
    const relatedTags = await db.collection('tags_new')
      .find({ 
        name: { $in: tagData.relatedTags || [] },
        _id: { $ne: tagData._id }
      })
      .sort({ recipeCount: -1 })
      .limit(8)
      .toArray();

    // Update tag usage statistics
    await db.collection('tags_new').updateOne(
      { _id: tagData._id },
      { 
        $set: { lastUsed: new Date() },
        $inc: { searchCount: 1 }
      }
    );

    await client.close();

    res.status(200).json({
      tag: tagData,
      recipes,
      relatedTags,
      pagination: {
        current: pageNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      sort: sort
    });

  } catch (error) {
    console.error('Tag recipes API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
