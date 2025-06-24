// Debug API to check database connection and data
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development or with debug key
  const isDebugAllowed = process.env.NODE_ENV === 'development' || req.query.debug === 'ragaujam2024';
  
  if (!isDebugAllowed) {
    return res.status(403).json({ error: 'Debug not allowed' });
  }

  try {
    console.log('🔍 Starting database debug...');
    
    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db();
    
    console.log('✅ MongoDB client connected');
    
    // Get database info
    const admin = db.admin();
    const dbInfo = await admin.listDatabases();
    
    console.log('📊 Available databases:', dbInfo.databases.map(d => d.name));
    
    // Check current database name
    const currentDbName = db.databaseName;
    console.log('🎯 Current database:', currentDbName);
    
    // List collections in current database
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections in current DB:', collections.map(c => c.name));
    
    // Count recipes in recipes_new collection
    const recipeCount = await db.collection('recipes_new').countDocuments();
    console.log('📊 Total recipes in recipes_new:', recipeCount);
    
    // Get sample recipes
    const sampleRecipes = await db.collection('recipes_new')
      .find({})
      .project({ slug: 1, title: 1, status: 1, publishedAt: 1 })
      .limit(5)
      .toArray();
    
    console.log('📋 Sample recipes:', sampleRecipes);
    
    // Test the exact query used in production
    const prodQuery = { status: { $ne: 'draft' } };
    const prodRecipes = await db.collection('recipes_new')
      .find(prodQuery)
      .limit(5)
      .toArray();
    
    console.log('🔍 Production query results:', prodRecipes.length);
    
    // Environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      MONGODB_DB: process.env.MONGODB_DB || 'NOT SET'
    };
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: {
        currentName: currentDbName,
        availableDatabases: dbInfo.databases.map(d => ({ name: d.name, sizeOnDisk: d.sizeOnDisk })),
        collections: collections.map(c => c.name),
        recipeCount,
        sampleRecipes: sampleRecipes.map(r => ({
          slug: r.slug,
          title: r.title?.lt || r.title,
          status: r.status,
          hasPublishedAt: !!r.publishedAt
        })),
        productionQueryResults: prodRecipes.length
      },
      connectionTest: 'SUCCESS'
    };
    
    console.log('✅ Debug completed successfully');
    
    res.status(200).json(debugInfo);
    
  } catch (error) {
    console.error('❌ Database debug error:', error);
    
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
      }
    });
  }
}
