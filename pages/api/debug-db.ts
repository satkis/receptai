// Debug API to check database connection and data
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DATABASE_NAME } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development or with debug key
  const isDebugAllowed = process.env.NODE_ENV === 'development' || req.query.debug === 'ragaujam2024';
  
  if (!isDebugAllowed) {
    return res.status(403).json({ error: 'Debug not allowed' });
  }

  try {
    console.log('🔍 Starting database debug...');
    console.log('🔧 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      MONGODB_URI_PREVIEW: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
      MONGODB_DB: process.env.MONGODB_DB || 'NOT SET',
      DATABASE_NAME
    });

    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    console.log('✅ MongoDB client connected to database:', DATABASE_NAME);
    
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
    
    // Environment info with enhanced debugging
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      MONGODB_URI_PREVIEW: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET',
      MONGODB_DB: process.env.MONGODB_DB || 'NOT SET',
      DATABASE_NAME,
      IS_ATLAS: process.env.MONGODB_URI?.includes('mongodb.net') || false,
      HAS_SSL_PARAMS: process.env.MONGODB_URI?.includes('ssl=true') || false
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database debug error:', error);

    // Enhanced error information for debugging
    const errorInfo = {
      error: 'Database connection failed',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        MONGODB_URI_PREVIEW: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET',
        MONGODB_DB: process.env.MONGODB_DB || 'NOT SET',
        DATABASE_NAME,
        IS_ATLAS: process.env.MONGODB_URI?.includes('mongodb.net') || false,
        HAS_SSL_PARAMS: process.env.MONGODB_URI?.includes('ssl=true') || false
      },
      troubleshooting: {
        isSSLError: errorMessage.includes('ssl') || errorMessage.includes('tls') || errorMessage.includes('SSL'),
        isTimeoutError: errorMessage.includes('timeout'),
        isAuthError: errorMessage.includes('auth') || errorMessage.includes('Authentication'),
        isNetworkError: errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')
      }
    };

    res.status(500).json(errorInfo);
  }
}
