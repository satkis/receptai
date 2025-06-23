#!/usr/bin/env node

// Database Setup Script
// Creates and configures databases for different environments

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const ENVIRONMENTS = {
  development: {
    uri: 'mongodb://localhost:27017/receptai-dev',
    database: 'receptai-dev',
    description: 'Local development database'
  },
  test: {
    uri: process.env.TEST_MONGODB_URI || 'mongodb+srv://test-user:test-password@test-cluster.mongodb.net/receptai-test',
    database: 'receptai-test',
    description: 'Test/staging database'
  },
  production: {
    uri: process.env.PROD_MONGODB_URI || process.env.MONGODB_URI,
    database: 'receptai',
    description: 'Production database'
  }
};

async function setupDatabase(env) {
  const config = ENVIRONMENTS[env];
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    return;
  }

  console.log(`🔧 Setting up ${env} database...`);
  console.log(`📍 Database: ${config.database}`);
  console.log(`📝 Description: ${config.description}`);

  const client = new MongoClient(config.uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(config.database);

    // Create collections with proper schemas
    await createCollections(db, env);
    
    // Create indexes for performance
    await createIndexes(db, env);
    
    // Seed with sample data if needed
    if (env === 'development' || env === 'test') {
      await seedSampleData(db, env);
    }

    console.log(`🎉 ${env} database setup completed!`);

  } catch (error) {
    console.error(`❌ Database setup failed: ${error.message}`);
  } finally {
    await client.close();
  }
}

async function createCollections(db, env) {
  console.log('\n📋 Creating collections...');

  const collections = [
    {
      name: 'recipes_new',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['slug', 'title', 'description', 'ingredients', 'instructions'],
          properties: {
            slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
            title: { bsonType: 'object', required: ['lt'] },
            description: { bsonType: 'object', required: ['lt'] },
            ingredients: { bsonType: 'array', minItems: 1 },
            instructions: { bsonType: 'array', minItems: 1 },
            status: { enum: ['draft', 'published', 'archived'] },
            canonicalUrl: { bsonType: 'string' }
          }
        }
      }
    },
    {
      name: 'categories_new',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['slug', 'title', 'path'],
          properties: {
            slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
            title: { bsonType: 'object', required: ['lt'] },
            path: { bsonType: 'string' },
            status: { enum: ['active', 'inactive'] }
          }
        }
      }
    },
    {
      name: 'groups',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'categories'],
          properties: {
            name: { bsonType: 'object', required: ['lt'] },
            categories: { bsonType: 'array' },
            order: { bsonType: 'number' },
            status: { enum: ['active', 'inactive'] }
          }
        }
      }
    }
  ];

  for (const collection of collections) {
    try {
      await db.createCollection(collection.name, {
        validator: collection.validator
      });
      console.log(`   ✅ Created collection: ${collection.name}`);
    } catch (error) {
      if (error.code === 48) {
        console.log(`   ⏭️  Collection already exists: ${collection.name}`);
      } else {
        console.error(`   ❌ Failed to create ${collection.name}: ${error.message}`);
      }
    }
  }
}

async function createIndexes(db, env) {
  console.log('\n🔍 Creating indexes...');

  const indexes = [
    // Recipe indexes
    {
      collection: 'recipes_new',
      indexes: [
        { key: { slug: 1 }, options: { unique: true } },
        { key: { status: 1 } },
        { key: { 'title.lt': 'text', 'description.lt': 'text', tags: 'text' } },
        { key: { primaryCategoryPath: 1 } },
        { key: { tags: 1 } },
        { key: { totalTimeMinutes: 1 } },
        { key: { difficulty: 1 } },
        { key: { publishedAt: -1 } },
        { key: { featured: 1, publishedAt: -1 } },
        { key: { trending: 1, publishedAt: -1 } }
      ]
    },
    // Category indexes
    {
      collection: 'categories_new',
      indexes: [
        { key: { slug: 1 }, options: { unique: true } },
        { key: { path: 1 }, options: { unique: true } },
        { key: { status: 1 } },
        { key: { parentPath: 1 } },
        { key: { 'title.lt': 'text', 'description.lt': 'text' } }
      ]
    },
    // Group indexes
    {
      collection: 'groups',
      indexes: [
        { key: { order: 1 } },
        { key: { status: 1 } },
        { key: { 'name.lt': 1 } }
      ]
    }
  ];

  for (const { collection, indexes: collectionIndexes } of indexes) {
    console.log(`   📋 Creating indexes for ${collection}...`);
    
    for (const { key, options = {} } of collectionIndexes) {
      try {
        await db.collection(collection).createIndex(key, options);
        const indexName = Object.keys(key).join('_');
        console.log(`      ✅ Index: ${indexName}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`      ⏭️  Index already exists: ${Object.keys(key).join('_')}`);
        } else {
          console.error(`      ❌ Failed to create index: ${error.message}`);
        }
      }
    }
  }
}

async function seedSampleData(db, env) {
  console.log(`\n🌱 Seeding sample data for ${env}...`);

  // Check if data already exists
  const recipeCount = await db.collection('recipes_new').countDocuments();
  const categoryCount = await db.collection('categories_new').countDocuments();

  if (recipeCount > 0 || categoryCount > 0) {
    console.log('   ⏭️  Sample data already exists, skipping seeding');
    return;
  }

  // Sample categories
  const sampleCategories = [
    {
      slug: 'karsti-patiekalai',
      title: { lt: 'Karštieji patiekalai' },
      description: { lt: 'Skanūs ir šilti patiekalai šaltoms dienoms' },
      path: 'receptai/karsti-patiekalai',
      parentPath: 'receptai',
      status: 'active',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      slug: 'sriubos',
      title: { lt: 'Sriubos' },
      description: { lt: 'Šildančios ir sotūs sriubų receptai' },
      path: 'receptai/karsti-patiekalai/sriubos',
      parentPath: 'receptai/karsti-patiekalai',
      status: 'active',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Sample groups
  const sampleGroups = [
    {
      name: { lt: 'Pagrindiniai patiekalai' },
      categories: ['karsti-patiekalai', 'salti-patiekalai'],
      order: 1,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Sample recipe
  const sampleRecipe = {
    slug: 'sample-recipe',
    title: { lt: 'Pavyzdinis receptas' },
    description: { lt: 'Paprastas ir skanus pavyzdinis receptas' },
    canonicalUrl: `https://ragaujam.lt/receptas/sample-recipe`,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    totalTimeMinutes: 45,
    servings: 4,
    servingsUnit: 'porcijos',
    difficulty: 'lengvas',
    primaryCategoryPath: 'receptai/karsti-patiekalai',
    ingredients: [
      {
        name: { lt: 'Miltai' },
        quantity: '2 stiklai',
        vital: true
      },
      {
        name: { lt: 'Kiaušiniai' },
        quantity: '2 vnt.',
        vital: true
      }
    ],
    instructions: [
      {
        step: 1,
        text: { lt: 'Sumaišykite miltus su kiaušiniais' }
      },
      {
        step: 2,
        text: { lt: 'Kepkite keptuvėje 5 minutes' }
      }
    ],
    tags: ['lengvas', 'greitas', 'pavyzdys'],
    image: {
      src: 'https://receptu-images.s3.eu-north-1.amazonaws.com/sample.jpg',
      alt: 'Pavyzdinis receptas',
      width: 1200,
      height: 800
    },
    author: {
      name: 'Ragaujam.lt',
      profileUrl: 'https://ragaujam.lt'
    },
    status: 'published',
    featured: false,
    trending: false,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    // Insert sample data
    await db.collection('categories_new').insertMany(sampleCategories);
    console.log(`   ✅ Inserted ${sampleCategories.length} sample categories`);

    await db.collection('groups').insertMany(sampleGroups);
    console.log(`   ✅ Inserted ${sampleGroups.length} sample groups`);

    await db.collection('recipes_new').insertOne(sampleRecipe);
    console.log(`   ✅ Inserted 1 sample recipe`);

  } catch (error) {
    console.error(`   ❌ Failed to seed sample data: ${error.message}`);
  }
}

async function listDatabases() {
  console.log('📋 Available Database Configurations:');
  console.log('====================================');

  for (const [env, config] of Object.entries(ENVIRONMENTS)) {
    console.log(`\n🔧 ${env.toUpperCase()}:`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Description: ${config.description}`);
    
    // Test connection
    try {
      const client = new MongoClient(config.uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      
      const db = client.db(config.database);
      const collections = await db.listCollections().toArray();
      const stats = await db.stats();
      
      console.log(`   Status: ✅ Connected`);
      console.log(`   Collections: ${collections.length}`);
      console.log(`   Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      
      await client.close();
    } catch (error) {
      console.log(`   Status: ❌ Connection failed`);
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Main execution
const [,, command, environment] = process.argv;

async function main() {
  switch (command) {
    case 'setup':
      if (!environment) {
        console.error('❌ Environment required for setup command');
        console.log('Usage: node scripts/setup-databases.js setup <environment>');
        console.log('Environments: development, test, production');
        break;
      }
      await setupDatabase(environment);
      break;
      
    case 'list':
      await listDatabases();
      break;
      
    case 'help':
    default:
      console.log('🗄️ Database Setup Tool');
      console.log('======================');
      console.log('');
      console.log('Usage: node scripts/setup-databases.js [command] [environment]');
      console.log('');
      console.log('Commands:');
      console.log('  setup <env>  - Setup database for specified environment');
      console.log('  list         - List all database configurations');
      console.log('  help         - Show this help message');
      console.log('');
      console.log('Environments:');
      console.log('  development  - Local MongoDB database');
      console.log('  test         - Test/staging MongoDB Atlas');
      console.log('  production   - Production MongoDB Atlas');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/setup-databases.js setup development');
      console.log('  node scripts/setup-databases.js list');
  }
}

main().catch(console.error);
