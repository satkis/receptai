// Fix image structure for old recipes
// Run with: node fix-image-structure.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

async function fixImageStructure() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find recipes with old image format (string instead of object)
    const recipesWithStringImages = await db.collection('recipes_new').find({
      image: { $type: "string" }
    }).toArray();
    
    console.log(`\n📋 Found ${recipesWithStringImages.length} recipes with string image format`);
    
    for (const recipe of recipesWithStringImages) {
      console.log(`\n🔄 Fixing image for: ${recipe.slug}`);
      console.log(`   Old image: ${recipe.image}`);
      
      // Convert string image to object format
      const newImageStructure = {
        src: recipe.image,
        alt: `${recipe.title?.lt || recipe.title || 'Receptas'} nuotrauka`,
        width: 1200,
        height: 800,
        caption: recipe.title?.lt || recipe.title || 'Receptas'
      };
      
      console.log(`   New image structure:`, newImageStructure);
      
      // Update the recipe
      const result = await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        { 
          $set: { 
            image: newImageStructure,
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Updated ${recipe.slug}`);
      } else {
        console.log(`   ❌ Failed to update ${recipe.slug}`);
      }
    }
    
    // Also check for recipes with object images but missing src property
    const recipesWithObjectImages = await db.collection('recipes_new').find({
      image: { $type: "object" },
      "image.src": { $exists: false }
    }).toArray();
    
    console.log(`\n📋 Found ${recipesWithObjectImages.length} recipes with object images missing src`);
    
    for (const recipe of recipesWithObjectImages) {
      console.log(`\n🔄 Fixing image src for: ${recipe.slug}`);
      console.log(`   Current image:`, recipe.image);
      
      // If image has url property, convert it to src
      if (recipe.image.url) {
        const result = await db.collection('recipes_new').updateOne(
          { _id: recipe._id },
          { 
            $set: { 
              "image.src": recipe.image.url,
              updatedAt: new Date().toISOString()
            },
            $unset: {
              "image.url": ""
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`   ✅ Converted url to src for ${recipe.slug}`);
        }
      } else {
        // Set a placeholder if no image source found
        const result = await db.collection('recipes_new').updateOne(
          { _id: recipe._id },
          { 
            $set: { 
              "image.src": "/placeholder-recipe.jpg",
              "image.alt": `${recipe.title?.lt || recipe.title || 'Receptas'} nuotrauka`,
              "image.width": 1200,
              "image.height": 800,
              updatedAt: new Date().toISOString()
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`   ✅ Set placeholder image for ${recipe.slug}`);
        }
      }
    }
    
    console.log(`\n🎉 Image structure fix completed!`);
    
    // Verify the fixes
    const allRecipes = await db.collection('recipes_new').find({}).toArray();
    console.log(`\n🔍 Verification:`);
    
    let stringImages = 0;
    let objectImagesWithSrc = 0;
    let objectImagesWithoutSrc = 0;
    
    allRecipes.forEach(recipe => {
      if (typeof recipe.image === 'string') {
        stringImages++;
      } else if (typeof recipe.image === 'object') {
        if (recipe.image.src) {
          objectImagesWithSrc++;
        } else {
          objectImagesWithoutSrc++;
        }
      }
    });
    
    console.log(`   - String images: ${stringImages}`);
    console.log(`   - Object images with src: ${objectImagesWithSrc}`);
    console.log(`   - Object images without src: ${objectImagesWithoutSrc}`);
    
    if (stringImages === 0 && objectImagesWithoutSrc === 0) {
      console.log(`   ✅ All images have proper structure!`);
    } else {
      console.log(`   ⚠️  Some images still need fixing`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixImageStructure();
