// Test script to update a recipe with S3 image
// Run with: node test-s3-image.js

const { MongoClient } = require('mongodb');

async function testS3Image() {
  const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('receptai');

    // First, let's see what recipes exist
    const recipes = await db.collection('recipes_new').find({}).limit(5).toArray();
    console.log('\n📋 Available recipes:');
    recipes.forEach(r => {
      const title = r.title?.lt || r.title || 'No title';
      console.log(`- ${r.slug}: ${title}`);
      console.log(`  Current image: ${typeof r.image === 'object' ? r.image?.src || r.image?.url : r.image || 'No image'}`);
    });

    if (recipes.length === 0) {
      console.log('❌ No recipes found in recipes_new collection');
      return;
    }

    // Use the first available recipe
    const firstRecipe = recipes[0];
    console.log(`\n🎯 Using recipe: ${firstRecipe.slug}`);
    return updateRecipeImage(db, firstRecipe.slug);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

async function updateRecipeImage(db, slug) {
  const recipe = await db.collection('recipes_new').findOne({ slug });

  if (!recipe) {
    console.log('❌ Recipe not found:', slug);
    return;
  }

  console.log('\n📝 Found recipe:', recipe.title?.lt || recipe.title);
  console.log('📸 Current image:', typeof recipe.image === 'object' ? recipe.image?.src || recipe.image?.url : recipe.image || 'No image');

  // Update with S3 image using simplified schema (Next.js will handle formats)
  const updatedImage = {
    src: "https://receptu-images.s3.eu-north-1.amazonaws.com/image-test.png",
    alt: recipe.title?.lt || recipe.title || "Recipe image",
    width: 1200,
    height: 800,
    blurHash: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImJsdXIiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2IiBmaWx0ZXI9InVybCgjYmx1cikiLz48L3N2Zz4=" // Simple blur placeholder
  };

  const result = await db.collection('recipes_new').updateOne(
    { slug },
    {
      $set: {
        image: updatedImage,
        updatedAt: new Date()
      }
    }
  );

  console.log('\n✅ Update result:', result.modifiedCount > 0 ? 'SUCCESS' : 'FAILED');
  console.log('🖼️  New image structure:');
  console.log('   - src:', updatedImage.src);
  console.log('   - alt:', updatedImage.alt);
  console.log('   - dimensions:', `${updatedImage.width}x${updatedImage.height}`);
  console.log('   - blurHash:', updatedImage.blurHash ? 'Generated' : 'None');
  console.log('   - formats: Next.js will auto-generate WebP/AVIF');

  if (result.modifiedCount > 0) {
    console.log('\n🎉 Recipe successfully updated with S3 image!');
    console.log(`🔗 Test the recipe at: http://localhost:3003/receptas/${slug}`);
  }
}

testS3Image();
