require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkRealRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('=== Checking recipes_new collection ===');
  const totalRecipes = await db.collection('recipes_new').countDocuments();
  console.log('Total recipes:', totalRecipes);
  
  // Get sample recipes to see the structure
  const samples = await db.collection('recipes_new').find({}).limit(5).toArray();
  
  console.log('\n=== Sample recipes structure ===');
  samples.forEach((recipe, index) => {
    console.log(`${index + 1}. ${recipe.title?.lt || recipe.title}`);
    console.log('   CategoryPath:', recipe.categoryPath);
    console.log('   Tags:', recipe.tags);
    console.log('   TotalTimeMinutes:', recipe.totalTimeMinutes);
    console.log('   Slug:', recipe.slug);
    console.log('');
  });
  
  // Check for recipes that might match karsti-patiekalai
  console.log('=== Recipes that might match karsti-patiekalai ===');
  const potentialMatches = await db.collection('recipes_new').find({
    $or: [
      { categoryPath: { $regex: 'karsti' } },
      { tags: { $in: ['kepsniai', 'troskiniai', 'apkepai'] } },
      { categoryPath: 'karsti-patiekalai' }
    ]
  }).toArray();
  
  console.log('Found', potentialMatches.length, 'potential matches:');
  potentialMatches.forEach(recipe => {
    console.log('- ' + (recipe.title?.lt || recipe.title) + ' (categoryPath: ' + recipe.categoryPath + ')');
  });
  
  // Check what categoryPaths exist
  console.log('\n=== All unique categoryPaths ===');
  const categoryPaths = await db.collection('recipes_new').distinct('categoryPath');
  console.log('Found categoryPaths:', categoryPaths);
  
  await client.close();
}

checkRealRecipes().catch(console.error);
