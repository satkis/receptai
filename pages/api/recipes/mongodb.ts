import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db(process.env.MONGODB_DB || 'receptai')

      // Get query parameters
      const {
        groupSlug,
        cuisine,
        mealType,
        dietary,
        maxTime,
        limit = '20',
        language = 'lt',
        sort = 'newest'
      } = req.query

      // Build filter using new schema
      const filter: any = { status: 'public' }

      // Filter by group
      if (groupSlug && groupSlug !== 'viskas') {
        const group = await db.collection('groups').findOne({ slug: groupSlug })
        if (group) {
          filter.groupIds = group._id
        }
      }

      // Filter by cuisine
      if (cuisine) {
        filter['filters.cuisine'] = cuisine
      }

      // Filter by meal type
      if (mealType) {
        filter['filters.mealType'] = mealType
      }

      // Filter by dietary requirements
      if (dietary) {
        const dietaryArray = Array.isArray(dietary) ? dietary : [dietary]
        filter['filters.dietary'] = { $in: dietaryArray }
      }

      // Filter by max cooking time
      if (maxTime) {
        filter.totalTimeMinutes = { $lte: parseInt(maxTime as string) }
      }

      // Build sort object
      let sortObj: any = {}
      switch (sort) {
        case 'newest':
          sortObj = { createdAt: -1 }
          break
        case 'rating':
          sortObj = { 'rating.average': -1, 'rating.count': -1 }
          break
        case 'time-asc':
          sortObj = { totalTimeMinutes: 1 }
          break
        case 'time-desc':
          sortObj = { totalTimeMinutes: -1 }
          break
        default:
          sortObj = { createdAt: -1 }
      }

      // Fetch recipes from MongoDB using optimized query
      const recipes = await db
        .collection('recipes')
        .find(filter)
        .sort(sortObj)
        .limit(parseInt(limit as string))
        .toArray()

      // Transform MongoDB data to match component expectations
      const transformedRecipes = recipes.map(recipe => ({
        id: recipe._id.toString(),
        title: recipe.title?.[language as string] || recipe.title?.lt || 'No title',
        description: recipe.description?.[language as string] || recipe.description?.lt || 'No description',
        slug: recipe.slug,
        image: recipe.image?.url || recipe.image || '/images/placeholder.jpg',
        // Time fields for component compatibility
        cookingTime: recipe.totalTimeMinutes || 30,
        prepTimeMinutes: recipe.prepTimeMinutes || 0,
        cookTimeMinutes: recipe.cookTimeMinutes || 0,
        totalTimeMinutes: recipe.totalTimeMinutes || 30,
        servings: recipe.servings?.amount || 4,
        difficulty: recipe.filters?.mealType || 'medium',
        categories: [recipe.filters?.cuisine, recipe.filters?.mealType].filter(Boolean),
        customGroups: [], // Will be populated from groupIds if needed
        ingredients: recipe.ingredients?.map((ing: any) => ({
          name: ing.name?.[language as string] || ing.name?.lt || ing.name,
          amount: ing.amount?.toString() || '1',
          unit: ing.unit?.[language as string] || ing.unit?.lt || ing.unit || '',
          vital: true // All ingredients are vital in new schema
        })) || [],
        instructions: recipe.instructions?.map((inst: any) => ({
          step: inst.step,
          description: inst.text?.[language as string] || inst.text?.lt || inst.text
        })) || [],
        nutrition: recipe.nutrition || {},
        tags: recipe.keywords || [],
        author: recipe.author?.name || 'Receptai.lt',
        featured: recipe.rating?.average >= 4.5 || false,
        published: recipe.status === 'public'
      }))

      res.status(200).json({
        success: true,
        data: transformedRecipes,
        count: transformedRecipes.length,
        filter: filter // For debugging
      })
    } catch (error) {
      console.error('MongoDB connection error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recipes from MongoDB',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
