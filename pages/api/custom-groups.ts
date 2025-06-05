import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db(process.env.MONGODB_DB || 'receptai')

      const { language = 'lt' } = req.query

      // Fetch groups from new schema
      const groups = await db
        .collection('groups')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()

      // Add "All" option at the beginning
      const allOption = {
        id: 'viskas',
        name: 'viskas',
        slug: 'viskas',
        displayName: language === 'lt' ? 'Viskas' : 'Everything',
        description: language === 'lt' ? 'Visi receptai' : 'All recipes',
        order: 0
      }

      // Transform data for frontend
      const transformedGroups = [
        allOption,
        ...groups.map((group, index) => ({
          id: group._id.toString(),
          name: group.slug,
          slug: group.slug,
          displayName: group.label?.[language as string] || group.label?.lt || group.slug,
          description: group.description?.[language as string] || group.description?.lt || '',
          order: index + 1
        }))
      ]

      console.log('Raw groups from DB:', groups.length);
      console.log('Raw group slugs:', groups.map(g => g.slug));
      console.log('API returning groups:', transformedGroups.length, 'groups');
      console.log('Transformed groups:', transformedGroups.map(g => `${g.slug} - ${g.displayName}`));

      res.status(200).json({
        success: true,
        data: transformedGroups
      })
    } catch (error) {
      console.error('MongoDB connection error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch groups from MongoDB'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
