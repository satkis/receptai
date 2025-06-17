require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function updateRecipeCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔄 Updating recipe categories...');
  
  // Get all recipes without categoryPath
  const recipesWithoutCategory = await db.collection('recipes_new').find({
    $or: [
      { categoryPath: null },
      { categoryPath: { $exists: false } }
    ]
  }).toArray();
  
  console.log(`Found ${recipesWithoutCategory.length} recipes without categoryPath`);
  
  for (const recipe of recipesWithoutCategory) {
    let categoryPath = null;
    let updatedTags = recipe.tags || [];
    
    console.log(`\n📝 Processing: ${recipe.title?.lt || recipe.title}`);
    console.log(`   Current tags: ${recipe.tags?.join(', ') || 'none'}`);
    
    // Determine category based on content and tags
    const title = (recipe.title?.lt || recipe.title || '').toLowerCase();
    const tags = recipe.tags || [];
    
    // Check for specific categories
    if (tags.includes('sriuba') || title.includes('sriuba')) {
      categoryPath = 'sriubos';
      if (!tags.includes('sriubos')) updatedTags.push('sriubos');
    }
    else if (tags.includes('vegetariška') || title.includes('vegetar')) {
      categoryPath = 'vegetariski-receptai';
      if (!tags.includes('vegetariška')) updatedTags.push('vegetariška');
    }
    else if (tags.includes('pupelės') || tags.includes('daržovės')) {
      categoryPath = 'vegetariski-receptai';
      if (!tags.includes('vegetariška')) updatedTags.push('vegetariška');
      if (!tags.includes('daržovės')) updatedTags.push('daržovės');
    }
    else if (tags.includes('is vistenos') || title.includes('višt')) {
      categoryPath = 'karsti-patiekalai';
      if (!tags.includes('kepsniai')) updatedTags.push('kepsniai');
      if (!tags.includes('is vistenos')) updatedTags.push('is vistenos');
    }
    else {
      // Default to karsti-patiekalai for general recipes
      categoryPath = 'karsti-patiekalai';
      if (!tags.includes('bendri')) updatedTags.push('bendri');
    }
    
    console.log(`   → Assigned category: ${categoryPath}`);
    console.log(`   → Updated tags: ${updatedTags.join(', ')}`);
    
    // Update the recipe
    await db.collection('recipes_new').updateOne(
      { _id: recipe._id },
      {
        $set: {
          categoryPath: categoryPath,
          tags: updatedTags,
          updatedAt: new Date()
        }
      }
    );
  }
  
  console.log('\n✅ Recipe categories updated!');
  
  // Show final summary
  console.log('\n📊 Final category distribution:');
  const categoryStats = await db.collection('recipes_new').aggregate([
    {
      $group: {
        _id: '$categoryPath',
        count: { $sum: 1 },
        recipes: { $push: { title: '$title.lt', slug: '$slug' } }
      }
    }
  ]).toArray();
  
  categoryStats.forEach(stat => {
    console.log(`\n${stat._id || 'No category'}: ${stat.count} recipes`);
    stat.recipes.forEach(recipe => {
      console.log(`  - ${recipe.title || recipe.slug}`);
    });
  });
  
  await client.close();
  console.log('\n🎉 Done! Refresh your category pages to see the updated recipes.');
}

updateRecipeCategories().catch(console.error);
