// Database Migration Runner Script
// This script runs all migration steps in the correct order
// Run with: node scripts/run-migration.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvVars() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });

    return envVars;
  } catch (error) {
    console.error('❌ Could not load .env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvVars();
const MONGODB_URI = envVars.MONGODB_URI || process.env.MONGODB_URI;
const MONGODB_DB = envVars.MONGODB_DB || process.env.MONGODB_DB || 'receptai';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting Database Migration Process...');
  console.log(`📊 Database: ${MONGODB_DB}`);
  console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Check current database state
    console.log('\n📊 Checking current database state...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`   Collections found: ${collectionNames.join(', ')}`);
    
    if (collectionNames.includes('recipes')) {
      const recipeCount = await db.collection('recipes').countDocuments();
      console.log(`   Recipes: ${recipeCount}`);
    }
    
    if (collectionNames.includes('categories')) {
      const categoryCount = await db.collection('categories').countDocuments();
      console.log(`   Categories: ${categoryCount}`);
    }
    
    if (collectionNames.includes('groups')) {
      const groupCount = await db.collection('groups').countDocuments();
      console.log(`   Groups: ${groupCount}`);
    }
    
    // Ask for confirmation before proceeding
    console.log('\n⚠️  This migration will modify your database structure.');
    console.log('   - Backup existing data');
    console.log('   - Add SEO fields to recipes');
    console.log('   - Restructure categories and groups');
    console.log('   - Create optimized indexes');
    
    // In a real environment, you might want to add a confirmation prompt
    // For now, we'll proceed automatically
    console.log('\n🔄 Proceeding with migration...');
    
    // Step 1: Run schema migration
    console.log('\n📋 Step 1: Running schema migration...');
    await runSchemaMigration(db);
    
    // Step 2: Run data validation and cleanup
    console.log('\n🔍 Step 2: Running data validation and cleanup...');
    await runDataValidation(db);
    
    // Step 3: Run production setup
    console.log('\n🚀 Step 3: Running production setup...');
    await runProductionSetup(db);
    
    // Step 4: Final verification
    console.log('\n✅ Step 4: Running final verification...');
    await runFinalVerification(db);
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('🚀 Your database is now optimized for production!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('📡 Database connection closed');
  }
}

async function runSchemaMigration(db) {
  try {
    // Backup existing data
    const collections = ['recipes', 'categories', 'groups'];
    const backupDate = new Date().toISOString().split('T')[0];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        const backupName = `${collectionName}_backup_${backupDate}`;
        await collection.aggregate([{ $out: backupName }]).toArray();
        console.log(`   ✅ Backed up ${collectionName} (${count} documents) to ${backupName}`);
      }
    }
    
    // Add SEO fields to recipes
    const recipesWithoutSEO = await db.collection('recipes').countDocuments({
      seo: { $exists: false }
    });
    
    if (recipesWithoutSEO > 0) {
      await db.collection('recipes').updateMany(
        { seo: { $exists: false } },
        {
          $set: {
            seo: {
              metaTitle: "",
              metaDescription: "",
              keywords: [],
              canonicalUrl: "",
              lastModified: new Date()
            },
            schemaOrg: {
              "@context": "https://schema.org",
              "@type": "Recipe",
              name: "",
              description: "",
              author: {
                "@type": "Organization",
                name: "Paragaujam.lt"
              },
              datePublished: new Date(),
              dateModified: new Date()
            },
            status: "published",
            featured: false,
            trending: false
          }
        }
      );
      console.log(`   ✅ Added SEO fields to ${recipesWithoutSEO} recipes`);
    }
    
    // Add categoryPath to recipes
    const recipesWithoutCategoryPath = await db.collection('recipes').countDocuments({
      categoryPath: { $exists: false }
    });
    
    if (recipesWithoutCategoryPath > 0) {
      await db.collection('recipes').updateMany(
        { categoryPath: { $exists: false } },
        [
          {
            $set: {
              categoryPath: {
                $concat: [
                  { $ifNull: ["$breadcrumb.main.slug", "karsti-patiekalai"] },
                  "/",
                  { $ifNull: ["$breadcrumb.sub.slug", "apkepai"] }
                ]
              }
            }
          }
        ]
      );
      console.log(`   ✅ Added categoryPath to ${recipesWithoutCategoryPath} recipes`);
    }
    
    console.log('   ✅ Schema migration completed');
    
  } catch (error) {
    console.error('   ❌ Schema migration failed:', error);
    throw error;
  }
}

async function runDataValidation(db) {
  try {
    let fixedCount = 0;
    
    // Fix missing slugs
    const recipesWithoutSlugs = await db.collection('recipes').find({
      $or: [
        { slug: { $exists: false } },
        { slug: "" },
        { slug: null }
      ]
    }).toArray();
    
    for (const recipe of recipesWithoutSlugs) {
      const title = recipe.title?.lt || recipe.title || "receptas";
      const newSlug = title
        .toLowerCase()
        .replace(/[ąčęėįšųūž]/g, (match) => {
          const map = { 'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z' };
          return map[match] || match;
        })
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      await db.collection('recipes').updateOne(
        { _id: recipe._id },
        { $set: { slug: newSlug } }
      );
      fixedCount++;
    }
    
    if (fixedCount > 0) {
      console.log(`   ✅ Fixed ${fixedCount} recipe slugs`);
    }
    
    // Generate SEO data for recipes
    const recipesNeedingSEO = await db.collection('recipes').find({
      $or: [
        { "seo.metaTitle": { $exists: false } },
        { "seo.metaTitle": "" }
      ]
    }).toArray();
    
    let seoUpdated = 0;
    for (const recipe of recipesNeedingSEO) {
      const title = recipe.title?.lt || recipe.title || "Receptas";
      const description = recipe.description?.lt || recipe.description || "Receptas aprašymas";
      const totalTime = recipe.totalTimeMinutes || 30;
      const servings = recipe.servings || 4;
      
      const metaTitle = `${title} - Receptas | Ragaujam.lt`.substring(0, 60);
      const metaDescription = `${description} Gaminimo laikas: ${totalTime} min. Porcijų: ${servings}.`.substring(0, 155);
      const canonicalUrl = `/receptai/${recipe.categoryPath}/${recipe.slug}`;
      
      await db.collection('recipes').updateOne(
        { _id: recipe._id },
        {
          $set: {
            "seo.metaTitle": metaTitle,
            "seo.metaDescription": metaDescription,
            "seo.canonicalUrl": canonicalUrl,
            "seo.keywords": [title.toLowerCase(), "receptas", "gaminimas"],
            "seo.lastModified": new Date()
          }
        }
      );
      seoUpdated++;
    }
    
    if (seoUpdated > 0) {
      console.log(`   ✅ Generated SEO data for ${seoUpdated} recipes`);
    }
    
    console.log('   ✅ Data validation completed');
    
  } catch (error) {
    console.error('   ❌ Data validation failed:', error);
    throw error;
  }
}

async function runProductionSetup(db) {
  try {
    // Create optimized indexes
    const indexesToCreate = [
      {
        collection: 'recipes',
        index: { status: 1, categoryPath: 1, slug: 1 },
        options: { name: "recipes_seo_url", background: true }
      },
      {
        collection: 'recipes',
        index: { status: 1, featured: 1, "rating.average": -1, createdAt: -1 },
        options: { name: "recipes_homepage", background: true }
      },
      {
        collection: 'categories',
        index: { slug: 1, status: 1 },
        options: { name: "categories_lookup", unique: true, background: true }
      },
      {
        collection: 'groups',
        index: { slug: 1, status: 1 },
        options: { name: "groups_lookup", unique: true, background: true }
      }
    ];
    
    for (const { collection, index, options } of indexesToCreate) {
      try {
        await db.collection(collection).createIndex(index, options);
        console.log(`   ✅ Created index ${options.name} on ${collection}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          console.log(`   ℹ️ Index ${options.name} already exists on ${collection}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('   ✅ Production setup completed');
    
  } catch (error) {
    console.error('   ❌ Production setup failed:', error);
    throw error;
  }
}

async function runFinalVerification(db) {
  try {
    const stats = {
      recipes: {
        total: await db.collection('recipes').countDocuments(),
        published: await db.collection('recipes').countDocuments({ status: "published" }),
        withSEO: await db.collection('recipes').countDocuments({ "seo.metaTitle": { $ne: "" } }),
        withCategoryPath: await db.collection('recipes').countDocuments({ categoryPath: { $exists: true } })
      },
      categories: await db.collection('categories').countDocuments(),
      groups: await db.collection('groups').countDocuments()
    };
    
    console.log('   📊 Final Statistics:');
    console.log(`      📝 Recipes: ${stats.recipes.total} total, ${stats.recipes.published} published`);
    console.log(`      🔍 SEO Coverage: ${stats.recipes.withSEO}/${stats.recipes.total} recipes`);
    console.log(`      📂 Categories: ${stats.categories}`);
    console.log(`      🏷️ Groups: ${stats.groups}`);
    
    // Check for any issues
    const issues = [];
    if (stats.recipes.withSEO < stats.recipes.total) {
      issues.push(`${stats.recipes.total - stats.recipes.withSEO} recipes missing SEO data`);
    }
    if (stats.recipes.withCategoryPath < stats.recipes.total) {
      issues.push(`${stats.recipes.total - stats.recipes.withCategoryPath} recipes missing categoryPath`);
    }
    
    if (issues.length > 0) {
      console.log('   ⚠️ Issues found:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    } else {
      console.log('   ✅ No issues found - database is ready for production!');
    }
    
  } catch (error) {
    console.error('   ❌ Final verification failed:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };
