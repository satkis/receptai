const SmartRecipeGenerator = require('./smart-recipe-generator');
const fs = require('fs');
const path = require('path');

async function testSmartGenerator() {
  console.log('🧠 Starting Smart Recipe Generator Test...');
  
  const generator = new SmartRecipeGenerator();
  const imagesDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Images directory not found:', imagesDir);
    return;
  }

  const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log('❌ No image files found in:', imagesDir);
    console.log('📋 Please add some recipe images to test with');
    return;
  }

  console.log(`📸 Found ${imageFiles.length} image(s) to process`);

  // Create output directory
  const outputDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'smart-recipes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each image
  for (const filename of imageFiles) {
    console.log(`\n🔄 Processing: ${filename}`);
    
    try {
      const imagePath = path.join(imagesDir, filename);
      const recipeJson = await generator.generateRecipeFromImage(imagePath);
      
      // Save recipe JSON with slug-based filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `${recipeJson.slug}-${timestamp}.json`;
      const outputPath = path.join(outputDir, outputFilename);
      
      fs.writeFileSync(outputPath, JSON.stringify(recipeJson, null, 2), 'utf8');
      
      console.log(`✅ Recipe generated: ${outputFilename}`);
      console.log(`📝 Title: ${recipeJson.title.lt}`);
      console.log(`🥘 Category: ${recipeJson.seo.recipeCategory}`);
      console.log(`⏱️  Total time: ${recipeJson.totalTimeMinutes} minutes`);
      console.log(`👥 Servings: ${recipeJson.servings}`);
      console.log(`📊 Ingredients: ${recipeJson.ingredients.length}`);
      console.log(`📋 Instructions: ${recipeJson.instructions.length}`);
      console.log(`🏷️  Tags: ${recipeJson.tags.join(', ')}`);
      
      // Show preview of the recipe
      console.log('\n📖 RECIPE PREVIEW:');
      console.log('=' .repeat(60));
      console.log(`Title: ${recipeJson.title.lt}`);
      console.log(`Description: ${recipeJson.description.lt}`);
      console.log(`Difficulty: ${recipeJson.difficulty}`);
      console.log(`Time Category: ${recipeJson.timeCategory}`);
      
      console.log('\nIngredients:');
      recipeJson.ingredients.slice(0, 5).forEach((ing, index) => {
        const vital = ing.vital ? '⭐' : '  ';
        console.log(`${vital} ${ing.quantity} ${ing.name.lt}`);
      });
      if (recipeJson.ingredients.length > 5) {
        console.log(`   ... and ${recipeJson.ingredients.length - 5} more`);
      }
      
      console.log('\nInstructions:');
      recipeJson.instructions.slice(0, 3).forEach(inst => {
        console.log(`${inst.step}. ${inst.text.lt.substring(0, 80)}...`);
      });
      if (recipeJson.instructions.length > 3) {
        console.log(`   ... and ${recipeJson.instructions.length - 3} more steps`);
      }
      
      console.log('\nSEO Data:');
      console.log(`Meta Title: ${recipeJson.seo.metaTitle}`);
      console.log(`Keywords: ${recipeJson.seo.keywords.join(', ')}`);
      console.log(`Rating: ${recipeJson.seo.aggregateRating.ratingValue.toFixed(1)}/5 (${recipeJson.seo.aggregateRating.reviewCount} reviews)`);
      console.log(`Calories: ${recipeJson.seo.nutrition.calories}`);
      
      console.log('=' .repeat(60));
      
    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error.message);
      
      // Save error info
      const errorFilename = `${path.parse(filename).name}-ERROR.txt`;
      const errorPath = path.join(outputDir, errorFilename);
      fs.writeFileSync(errorPath, `Error processing ${filename}:\n${error.message}\n${error.stack}`, 'utf8');
      console.log(`💥 Error details saved: ${errorFilename}`);
    }
  }

  console.log(`\n🎉 Smart Recipe Generation completed!`);
  console.log(`📁 Results saved in: uploads/ocr-workspace/smart-recipes/`);
  console.log(`\n💡 These JSONs are ready for your MongoDB recipes_new collection!`);
  console.log(`\n📋 Manual editing needed:`);
  console.log(`   - Review ingredient quantities if they seem incorrect`);
  console.log(`   - Adjust cooking times if auto-detection failed`);
  console.log(`   - Verify recipe category assignment`);
  console.log(`   - Check if title extraction is accurate`);
  console.log(`\n🚀 Most recipes should be 90%+ ready for database upload!`);
}

// Run the test
testSmartGenerator().catch(error => {
  console.error('💥 Test failed:', error);
});
