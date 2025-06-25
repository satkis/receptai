#!/usr/bin/env node

// Test MongoDB Connection Script
// Tests the MongoDB connection with the updated configuration

require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection');
  console.log('==============================');
  
  // Environment check
  console.log('\n📋 Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('MONGODB_URI Preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');
  console.log('MONGODB_DB:', process.env.MONGODB_DB || 'NOT SET');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }
  
  // Check if URI is a placeholder
  if (process.env.MONGODB_URI === 'SET' || process.env.MONGODB_URI.includes('placeholder')) {
    console.error('❌ MONGODB_URI appears to be a placeholder value');
    process.exit(1);
  }
  
  let uri = process.env.MONGODB_URI;
  
  // For MongoDB Atlas, ensure proper SSL/TLS parameters
  if (uri.includes('mongodb.net')) {
    console.log('🔗 Detected MongoDB Atlas connection');
    
    try {
      const url = new URL(uri);
      
      // Set required Atlas parameters
      url.searchParams.set('ssl', 'true');
      url.searchParams.set('tls', 'true');
      url.searchParams.set('authSource', 'admin');
      
      if (!url.searchParams.has('retryWrites')) {
        url.searchParams.set('retryWrites', 'true');
      }
      if (!url.searchParams.has('w')) {
        url.searchParams.set('w', 'majority');
      }
      
      // Add additional SSL/TLS parameters
      url.searchParams.set('tlsAllowInvalidCertificates', 'false');
      url.searchParams.set('tlsAllowInvalidHostnames', 'false');
      
      uri = url.toString();
      console.log('✅ SSL/TLS parameters configured');
    } catch (error) {
      console.error('❌ Failed to parse MongoDB URI:', error.message);
      process.exit(1);
    }
  }
  
  // Connection options
  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  };
  
  console.log('\n🔄 Attempting connection...');
  
  try {
    // Create client and connect
    const client = new MongoClient(uri, options);
    await client.connect();
    
    console.log('✅ MongoDB connection successful');
    
    // Test database access
    const dbName = process.env.MONGODB_DB || 'receptai';
    const db = client.db(dbName);
    
    console.log('📊 Testing database access...');
    
    // Ping the database
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
    // Test recipes_new collection
    if (collections.some(c => c.name === 'recipes_new')) {
      const recipeCount = await db.collection('recipes_new').countDocuments();
      console.log('📊 Total recipes in recipes_new:', recipeCount);
      
      // Get sample recipe
      const sampleRecipe = await db.collection('recipes_new').findOne({});
      if (sampleRecipe) {
        console.log('📋 Sample recipe found:', {
          slug: sampleRecipe.slug,
          title: sampleRecipe.title?.lt || sampleRecipe.title,
          status: sampleRecipe.status
        });
      }
    }
    
    // Test categories_new collection
    if (collections.some(c => c.name === 'categories_new')) {
      const categoryCount = await db.collection('categories_new').countDocuments();
      console.log('📊 Total categories in categories_new:', categoryCount);
    }
    
    await client.close();
    console.log('\n✅ Connection test completed successfully');
    console.log('🚀 Your MongoDB configuration is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    // Provide specific guidance for common errors
    if (error.message.includes('ssl') || error.message.includes('tls') || error.message.includes('SSL')) {
      console.error('\n💡 SSL/TLS Error - Check if:');
      console.error('   1. MongoDB Atlas cluster allows connections from your IP');
      console.error('   2. Connection string includes proper SSL parameters');
      console.error('   3. Network allows outbound connections on port 27017');
    }
    
    if (error.message.includes('Authentication')) {
      console.error('\n💡 Authentication Error - Check if:');
      console.error('   1. Username and password are correct');
      console.error('   2. Database user has proper permissions');
      console.error('   3. authSource is set correctly');
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Timeout Error - Check if:');
      console.error('   1. MongoDB Atlas network access allows your IP');
      console.error('   2. Firewall allows outbound connections');
      console.error('   3. Internet connection is stable');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);
