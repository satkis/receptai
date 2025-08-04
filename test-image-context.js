const ImageContextAnalyzer = require('./image-context-analyzer');
const fs = require('fs');
const path = require('path');

async function testImageContext() {
  console.log('🎨 Starting Image Context Analysis...');
  
  const analyzer = new ImageContextAnalyzer();
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

  console.log(`📸 Found ${imageFiles.length} image(s) to analyze`);

  // Create output directory
  const outputDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'image-context');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each image
  for (const filename of imageFiles) {
    console.log(`\n🔍 Analyzing: ${filename}`);
    
    try {
      const imagePath = path.join(imagesDir, filename);
      const contextJson = await analyzer.analyzeImage(imagePath);
      
      // Save context JSON
      const outputFilename = `${path.parse(filename).name}-context.json`;
      const outputPath = path.join(outputDir, outputFilename);
      
      fs.writeFileSync(outputPath, JSON.stringify(contextJson, null, 2), 'utf8');
      
      console.log(`✅ Context saved: ${outputFilename}`);
      console.log(`📊 Dish detected: ${contextJson.visual_description.dish_name}`);
      console.log(`🎨 Dominant colors: ${contextJson.dominant_colors.length}`);
      console.log(`🏷️  Content tags: ${contextJson.content_tags.length}`);
      
      // Show preview of the context
      console.log('\n📖 CONTEXT PREVIEW:');
      console.log('=' .repeat(50));
      console.log(`File: ${contextJson.file}`);
      console.log(`Dish: ${contextJson.visual_description.dish_name}`);
      console.log(`Style: ${contextJson.visual_description.composition_style}`);
      console.log(`Mood: ${contextJson.visual_description.image_mood}`);
      console.log(`Colors: ${contextJson.dominant_colors.map(c => c.hex).join(', ')}`);
      console.log('=' .repeat(50));
      
    } catch (error) {
      console.error(`❌ Failed to analyze ${filename}:`, error.message);
    }
  }

  console.log(`\n🎉 Image context analysis completed!`);
  console.log(`📁 Results saved in: uploads/ocr-workspace/image-context/`);
  console.log(`\n💡 You can now use these context JSONs to generate similar recipe images with other LLMs!`);
}

// Run the test
testImageContext().catch(error => {
  console.error('💥 Test failed:', error);
});
