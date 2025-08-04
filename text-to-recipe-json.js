const SmartRecipeGenerator = require('./smart-recipe-generator');
const fs = require('fs');
const path = require('path');

class TextToRecipeJSON {
  constructor() {
    this.generator = new SmartRecipeGenerator();
    this.rawOcrDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'raw-ocr');
    this.processedDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'raw-ocr-processed');
    this.outputDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'final-recipes');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.processedDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async processAllOCRFiles() {
    console.log('📝 Starting Text-to-Recipe JSON conversion...');
    
    if (!fs.existsSync(this.rawOcrDir)) {
      console.log('❌ Raw OCR directory not found:', this.rawOcrDir);
      return;
    }

    const ocrFiles = fs.readdirSync(this.rawOcrDir).filter(file => file.endsWith('.txt'));
    
    if (ocrFiles.length === 0) {
      console.log('📭 No OCR text files found in:', this.rawOcrDir);
      console.log('💡 Please ensure you have .txt files from OCR processing');
      return;
    }

    console.log(`📁 Found ${ocrFiles.length} OCR file(s) to process`);

    let successCount = 0;
    let failCount = 0;

    // Process each OCR file
    for (const filename of ocrFiles) {
      console.log(`\n🔄 Processing: ${filename}`);
      
      try {
        const success = await this.processOCRFile(filename);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to process ${filename}:`, error.message);
        this.moveFileWithFail(filename);
        failCount++;
      }
    }

    console.log(`\n🎉 Processing completed!`);
    console.log(`✅ Successfully processed: ${successCount} recipes`);
    console.log(`❌ Failed: ${failCount} recipes`);
    console.log(`📁 Results saved in: uploads/ocr-workspace/final-recipes/`);
    console.log(`📦 Processed files moved to: uploads/ocr-workspace/raw-ocr-processed/`);
  }

  async processOCRFile(filename) {
    try {
      const filePath = path.join(this.rawOcrDir, filename);
      const extractedText = fs.readFileSync(filePath, 'utf8');
      
      if (extractedText.trim().length < 50) {
        throw new Error('OCR text too short or incomplete');
      }

      console.log(`📝 Text length: ${extractedText.length} characters`);

      // Parse the extracted text using the smart generator's parsing logic
      const parsedRecipe = this.generator.parseRecipeText(extractedText);
      
      // Validate parsed recipe
      if (!parsedRecipe.title || parsedRecipe.title === 'Lietuviškas patiekalas') {
        console.log('⚠️  Warning: Could not extract proper recipe title');
      }
      
      if (parsedRecipe.ingredients.length === 0) {
        throw new Error('No ingredients found in text');
      }

      // Generate enhanced recipe JSON
      console.log('🎨 Generating enhanced recipe JSON...');
      const recipeJson = this.generator.generateRecipeJson(parsedRecipe);
      
      // Save recipe JSON with slug-based filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const jsonFilename = `${recipeJson.slug}-${timestamp}.json`;
      const jsonPath = path.join(this.outputDir, jsonFilename);
      
      fs.writeFileSync(jsonPath, JSON.stringify(recipeJson, null, 2), 'utf8');
      
      // Move processed OCR file to processed directory
      const processedPath = path.join(this.processedDir, filename);
      fs.renameSync(filePath, processedPath);
      
      console.log(`✅ Recipe JSON saved: ${jsonFilename}`);
      console.log(`📝 Title: ${recipeJson.title.lt}`);
      console.log(`🥘 Category: ${recipeJson.seo.recipeCategory}`);
      console.log(`⏱️  Total time: ${recipeJson.totalTimeMinutes} minutes`);
      console.log(`👥 Servings: ${recipeJson.servings}`);
      console.log(`📊 Ingredients: ${recipeJson.ingredients.length}`);
      console.log(`📋 Instructions: ${recipeJson.instructions.length}`);
      
      // Show recipe preview
      this.showRecipePreview(recipeJson);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      return false;
    }
  }

  moveFileWithFail(filename) {
    try {
      const originalPath = path.join(this.rawOcrDir, filename);
      const failFilename = filename.replace('.txt', '-FAIL.txt');
      const failPath = path.join(this.processedDir, failFilename);
      
      if (fs.existsSync(originalPath)) {
        fs.renameSync(originalPath, failPath);
        console.log(`💥 Failed file moved: ${failFilename}`);
      }
    } catch (error) {
      console.error('Error moving failed file:', error.message);
    }
  }

  showRecipePreview(recipeJson) {
    console.log('\n📖 RECIPE PREVIEW:');
    console.log('=' .repeat(60));
    console.log(`Title: ${recipeJson.title.lt}`);
    console.log(`Description: ${recipeJson.description.lt}`);
    console.log(`Difficulty: ${recipeJson.difficulty}`);
    console.log(`Time Category: ${recipeJson.timeCategory}`);
    console.log(`Primary Category: ${recipeJson.primaryCategoryPath}`);
    
    console.log('\nTop Ingredients:');
    recipeJson.ingredients.slice(0, 5).forEach((ing, index) => {
      const vital = ing.vital ? '⭐' : '  ';
      console.log(`${vital} ${ing.quantity} ${ing.name.lt}`);
    });
    if (recipeJson.ingredients.length > 5) {
      console.log(`   ... and ${recipeJson.ingredients.length - 5} more`);
    }
    
    console.log('\nFirst 3 Instructions:');
    recipeJson.instructions.slice(0, 3).forEach(inst => {
      console.log(`${inst.step}. ${inst.text.lt.substring(0, 80)}...`);
    });
    if (recipeJson.instructions.length > 3) {
      console.log(`   ... and ${recipeJson.instructions.length - 3} more steps`);
    }
    
    console.log('\nSEO Data:');
    console.log(`Meta Title: ${recipeJson.seo.metaTitle}`);
    console.log(`Keywords: ${recipeJson.seo.keywords.slice(0, 5).join(', ')}...`);
    console.log(`Rating: ${recipeJson.seo.aggregateRating.ratingValue.toFixed(1)}/5`);
    console.log(`Calories: ${recipeJson.seo.nutrition.calories}`);
    
    console.log('=' .repeat(60));
  }

  // Method to process a single specific file
  async processSingleFile(filename) {
    console.log(`🔄 Processing single file: ${filename}`);
    
    const filePath = path.join(this.rawOcrDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      return false;
    }

    try {
      const success = await this.processOCRFile(filename);
      if (success) {
        console.log(`✅ Successfully processed: ${filename}`);
      } else {
        console.log(`❌ Failed to process: ${filename}`);
      }
      return success;
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      this.moveFileWithFail(filename);
      return false;
    }
  }

  // Method to list available OCR files
  listAvailableFiles() {
    console.log('📁 Available OCR files:');
    
    if (!fs.existsSync(this.rawOcrDir)) {
      console.log('❌ Raw OCR directory not found');
      return [];
    }

    const ocrFiles = fs.readdirSync(this.rawOcrDir).filter(file => file.endsWith('.txt'));
    
    if (ocrFiles.length === 0) {
      console.log('📭 No OCR text files found');
      return [];
    }

    ocrFiles.forEach((file, index) => {
      const filePath = path.join(this.rawOcrDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(1);
      console.log(`${index + 1}. ${file} (${size} KB)`);
    });

    return ocrFiles;
  }
}

// Create processor instance
const processor = new TextToRecipeJSON();

// Check command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  
  if (command === 'list') {
    // List available files
    processor.listAvailableFiles();
  } else if (command === 'single' && args[1]) {
    // Process single file
    processor.processSingleFile(args[1]).catch(error => {
      console.error('💥 Processing failed:', error);
    });
  } else {
    console.log('📋 Usage:');
    console.log('  node text-to-recipe-json.js           - Process all OCR files');
    console.log('  node text-to-recipe-json.js list      - List available OCR files');
    console.log('  node text-to-recipe-json.js single <filename> - Process specific file');
  }
} else {
  // Process all files (default behavior)
  processor.processAllOCRFiles().catch(error => {
    console.error('💥 Processing failed:', error);
  });
}
