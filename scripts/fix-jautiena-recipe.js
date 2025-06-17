require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function fixJautienRecipe() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔧 Fixing the jautiena recipe...');
  
  // 1. Find the recipe by slug
  const recipe = await db.collection('recipes_new').findOne({ slug: 'aaa' });
  
  if (!recipe) {
    console.log('❌ Recipe not found');
    await client.close();
    return;
  }
  
  console.log('📝 Found recipe:', recipe.title.lt);
  console.log('   Current categoryPath:', recipe.categoryPath);
  console.log('   Current tags:', recipe.tags);
  
  // 2. Update the recipe to match jautiena category
  const updateResult = await db.collection('recipes_new').updateOne(
    { slug: 'aaa' },
    {
      $set: {
        // Set correct category path for jautiena
        categoryPath: 'jautiena',
        primaryCategoryPath: 'jautiena',
        
        // Update tags to include jautiena category filters
        tags: [
          'jautiena',      // Main category tag
          'kepsniai',      // Jautiena filter
          'troskiniai',    // Jautiena filter  
          'vegetariška',   // Keep existing
          'italija',       // Keep existing
          'pupelės',       // Keep existing
          'daržovės',      // Keep existing
          'žiemai'         // Keep existing
        ],
        
        // Update breadcrumbs
        breadcrumbs: [
          {
            name: "Receptai",
            url: "/receptai"
          },
          {
            name: "Jautiena", 
            url: "/receptai/jautiena"
          }
        ],
        
        updatedAt: new Date()
      }
    }
  );
  
  if (updateResult.modifiedCount > 0) {
    console.log('✅ Recipe updated successfully!');
    console.log('   New categoryPath: jautiena');
    console.log('   Updated tags: jautiena, kepsniai, troskiniai, vegetariška, italija, pupelės, daržovės, žiemai');
  } else {
    console.log('❌ Failed to update recipe');
  }
  
  // 3. Check if jautiena category exists, if not create it
  console.log('\n🔍 Checking jautiena category...');
  const jautienCategory = await db.collection('categories_new').findOne({ path: 'jautiena' });
  
  if (!jautienCategory) {
    console.log('➕ Creating jautiena category...');
    
    await db.collection('categories_new').insertOne({
      path: "jautiena",
      parentPath: null,
      level: 1,
      title: { lt: "Jautiena" },
      slug: "jautiena",
      seo: {
        metaTitle: "Jautienos receptai | Paragaujam.lt",
        metaDescription: "Geriausi jautienos receptai. Kepsniai, troškiniai, apkepai ir kiti jautienos patiekalai.",
        keywords: ["jautiena", "jautienos kepsniai", "jautienos troškiniai", "jautienos apkepai"],
        canonicalUrl: "https://paragaujam.lt/receptai/jautiena"
      },
      filters: {
        manual: [
          { value: "kepsniai", label: "Kepsniai", priority: 1 },
          { value: "troskiniai", label: "Troškiniai", priority: 2 },
          { value: "apkepai", label: "Apkepai", priority: 3 },
          { value: "vegetariška", label: "Vegetariška", priority: 4 }
        ],
        auto: [],
        timeFilters: ["30-60-min", "1-2-val", "virs-2-val"]
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Created jautiena category');
  } else {
    console.log('ℹ️  Jautiena category already exists');
  }
  
  console.log('\n🎯 The recipe should now appear at:');
  console.log('   http://localhost:3000/receptai/jautiena');
  console.log('');
  console.log('🧪 Test filters:');
  console.log('   - "Kepsniai" (should show this recipe)');
  console.log('   - "Troškiniai" (should show this recipe)');
  console.log('   - "Vegetariška" (should show this recipe)');
  console.log('   - "30-60 min" time filter (should show this recipe)');
  
  await client.close();
}

fixJautienRecipe().catch(console.error);
