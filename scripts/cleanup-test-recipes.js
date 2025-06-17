require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function cleanupTestRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🧹 Cleaning up test recipes...');
  
  // Remove the test recipes I created (they have specific slugs)
  const testRecipeSlugs = [
    'vistienos-kepsnys-su-grybais',
    'jautienos-troskinys-su-bulvemis', 
    'bulviu-apkepas-su-suriu'
  ];
  
  for (const slug of testRecipeSlugs) {
    const result = await db.collection('recipes_new').deleteOne({ slug: slug });
    if (result.deletedCount > 0) {
      console.log(`✅ Removed test recipe: ${slug}`);
    } else {
      console.log(`ℹ️  Test recipe not found: ${slug}`);
    }
  }
  
  // Show remaining recipes
  console.log('\n📊 Remaining recipes:');
  const remainingRecipes = await db.collection('recipes_new').find({}).toArray();
  
  remainingRecipes.forEach(recipe => {
    console.log(`- ${recipe.title?.lt || recipe.title} (${recipe.categoryPath})`);
    console.log(`  Tags: ${recipe.tags?.join(', ') || 'none'}`);
    console.log(`  Time: ${recipe.totalTimeMinutes}min`);
    console.log('');
  });
  
  console.log(`\n✅ Total recipes remaining: ${remainingRecipes.length}`);
  
  await client.close();
}

cleanupTestRecipes().catch(console.error);
