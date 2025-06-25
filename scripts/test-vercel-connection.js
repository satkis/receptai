#!/usr/bin/env node

// Test Vercel-optimized MongoDB Connection
// Simulates the exact connection pattern used in production

require('dotenv').config({ path: '.env.local' });

async function testVercelConnection() {
  console.log('🔍 Testing Vercel-Optimized MongoDB Connection');
  console.log('===============================================');
  
  // Simulate Vercel environment
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  
  try {
    // Import the updated MongoDB client
    const { default: clientPromise, DATABASE_NAME } = require('../lib/mongodb');
    
    console.log('📋 Environment Check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('MONGODB_DB:', process.env.MONGODB_DB || 'NOT SET');
    console.log('DATABASE_NAME:', DATABASE_NAME);
    
    console.log('\n🔄 Testing connection with Vercel settings...');
    const startTime = Date.now();
    
    // Test the connection (this will use the retry logic)
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connection established in ${connectionTime}ms`);
    
    // Test database operations
    console.log('\n📊 Testing database operations...');
    
    // Test categories collection
    const categoriesCount = await db.collection('categories_new').countDocuments();
    console.log(`📁 Categories: ${categoriesCount}`);
    
    // Test recipes collection
    const recipesCount = await db.collection('recipes_new').countDocuments();
    console.log(`📋 Recipes: ${recipesCount}`);
    
    // Test a simple query (like the categories API)
    const sampleCategories = await db.collection('categories_new')
      .find({ isActive: true })
      .limit(3)
      .toArray();
    
    console.log(`🔍 Sample categories: ${sampleCategories.length}`);
    sampleCategories.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title?.lt || cat.title}`);
    });
    
    // Test a recipe query (like the recipes API)
    const sampleRecipes = await db.collection('recipes_new')
      .find({ status: { $ne: 'draft' } })
      .limit(3)
      .toArray();
    
    console.log(`🍽️ Sample recipes: ${sampleRecipes.length}`);
    sampleRecipes.forEach(recipe => {
      console.log(`   - ${recipe.slug}: ${recipe.title?.lt || recipe.title}`);
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ All tests completed successfully in ${totalTime}ms`);
    console.log('🚀 Connection is ready for Vercel deployment!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Timeout troubleshooting:');
      console.error('1. Check MongoDB Atlas Network Access:');
      console.error('   - Go to cloud.mongodb.com');
      console.error('   - Network Access → Add IP Address: 0.0.0.0/0');
      console.error('2. Verify cluster is not paused');
      console.error('3. Test connection string manually');
    }
    
    if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.error('\n💡 Authentication troubleshooting:');
      console.error('1. Verify username/password in connection string');
      console.error('2. Check database user permissions in MongoDB Atlas');
      console.error('3. Ensure user has read/write access to receptai database');
    }
    
    process.exit(1);
  } finally {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  }
}

// Run the test
testVercelConnection().catch(console.error);
