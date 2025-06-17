require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkPrimaryCategoryPath() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔍 Checking primaryCategoryPath in recipes...');
  
  // Get all recipes and their primaryCategoryPath
  const recipes = await db.collection('recipes_new').find({}).toArray();
  
  console.log(`\nFound ${recipes.length} recipes:`);
  recipes.forEach(recipe => {
    console.log(`- ${recipe.title?.lt || recipe.title} (slug: ${recipe.slug})`);
    console.log(`  primaryCategoryPath: ${recipe.primaryCategoryPath}`);
    console.log(`  categoryPath: ${recipe.categoryPath}`);
    console.log(`  tags: ${recipe.tags?.join(', ') || 'none'}`);
    console.log('');
  });
  
  // Check specifically for jautiena recipes
  console.log('🔍 Looking for jautiena recipes...');
  const jautienRecipes = await db.collection('recipes_new').find({
    primaryCategoryPath: 'receptai/jautiena'
  }).toArray();
  
  console.log(`Found ${jautienRecipes.length} recipes with primaryCategoryPath: 'receptai/jautiena'`);
  jautienRecipes.forEach(recipe => {
    console.log(`- ${recipe.title?.lt || recipe.title} (slug: ${recipe.slug})`);
  });
  
  // Check if jautiena category exists
  console.log('\n🔍 Checking jautiena category...');
  const jautienCategory = await db.collection('categories_new').findOne({ path: 'jautiena' });
  
  if (jautienCategory) {
    console.log('✅ Jautiena category exists');
    console.log('   Title:', jautienCategory.title.lt);
    console.log('   Filters:', jautienCategory.filters.manual.map(f => f.label).join(', '));
  } else {
    console.log('❌ Jautiena category does not exist');
  }
  
  await client.close();
}

checkPrimaryCategoryPath().catch(console.error);
