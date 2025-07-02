const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function debugSearchImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Test search query that should return the Portuguese chicken recipe
    console.log('\n🔍 Testing search for "vistiena"...');
    
    const searchResults = await db.collection('recipes_new')
      .find({
        $or: [
          { "title.lt": { $regex: "vistiena", $options: "i" } },
          { "description.lt": { $regex: "vistiena", $options: "i" } },
          { "tags": { $regex: "vistiena", $options: "i" } }
        ],
        status: "published"
      })
      .project({
        slug: 1,
        title: 1,
        image: 1,
        tags: 1
      })
      .toArray();

    console.log(`Found ${searchResults.length} recipes:`);
    
    searchResults.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title.lt}`);
      console.log(`   Slug: ${recipe.slug}`);
      console.log(`   Image type: ${typeof recipe.image}`);
      
      if (typeof recipe.image === 'object' && recipe.image) {
        console.log(`   Image src: ${recipe.image.src || 'NO SRC'}`);
        console.log(`   Image alt: ${recipe.image.alt || 'NO ALT'}`);
        console.log(`   Image width: ${recipe.image.width || 'NO WIDTH'}`);
        console.log(`   Image height: ${recipe.image.height || 'NO HEIGHT'}`);
      } else {
        console.log(`   Image: ${recipe.image || 'NO IMAGE'}`);
      }
      
      console.log(`   Tags: ${recipe.tags ? recipe.tags.join(', ') : 'NO TAGS'}`);
    });

    // Test the specific Portuguese chicken recipe
    console.log('\n🔍 Testing specific Portuguese chicken recipe...');
    
    const specificRecipe = await db.collection('recipes_new')
      .findOne({ slug: "portugaliska-vistiena-su-paprikomis" });
    
    if (specificRecipe) {
      console.log('✅ Found Portuguese chicken recipe:');
      console.log(`   Title: ${specificRecipe.title.lt}`);
      console.log(`   Image type: ${typeof specificRecipe.image}`);
      console.log(`   Image object:`, JSON.stringify(specificRecipe.image, null, 2));
      console.log(`   Status: ${specificRecipe.status}`);
      console.log(`   Tags: ${specificRecipe.tags ? specificRecipe.tags.join(', ') : 'NO TAGS'}`);
    } else {
      console.log('❌ Portuguese chicken recipe not found');
    }

    // Test search aggregation pipeline (similar to what's used in search)
    console.log('\n🔍 Testing search aggregation pipeline...');
    
    const aggregationResults = await db.collection('recipes_new')
      .aggregate([
        {
          $match: {
            $and: [
              { status: "published" },
              {
                $or: [
                  { "title.lt": { $regex: "vistiena", $options: "i" } },
                  { "description.lt": { $regex: "vistiena", $options: "i" } },
                  { "tags": { $regex: "vistiena", $options: "i" } }
                ]
              }
            ]
          }
        },
        {
          $project: {
            slug: 1,
            title: 1,
            description: 1,
            image: 1,
            totalTimeMinutes: 1,
            servings: 1,
            tags: 1,
            ingredients: 1,
            rating: 1,
            difficulty: 1,
            timeCategory: 1,
            publishedAt: 1
          }
        },
        {
          $sort: { publishedAt: -1 }
        }
      ])
      .toArray();

    console.log(`Aggregation found ${aggregationResults.length} recipes:`);
    
    aggregationResults.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title.lt}`);
      console.log(`   Image in aggregation:`, JSON.stringify(recipe.image, null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugSearchImages().catch(console.error);
