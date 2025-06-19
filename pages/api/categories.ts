import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db();
    
    // Fetch all active categories, sorted by level and title
    const categories = await db.collection('categories_new')
      .find({ 
        isActive: true 
      })
      .sort({ 
        level: 1, 
        'title.lt': 1 
      })
      .toArray();

    // Transform for frontend
    const transformedCategories = categories.map(category => ({
      _id: category._id.toString(),
      title: category.title,
      slug: category.slug,
      path: category.path,
      level: category.level,
      parentPath: category.parentPath,
      isActive: category.isActive
    }));

    res.status(200).json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
