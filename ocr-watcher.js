const chokidar = require('chokidar');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class OCRWatcher {
  constructor() {
    this.pendingRecipes = new Map(); // Track recipes waiting for more images
    this.processingTimeout = 10000; // 10 seconds to wait for additional images
    this.visionClient = null;
    this.init();
  }

  init() {
    // Initialize Vision API client
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLOUD_CLIENT_EMAIL)}`
    };

    this.visionClient = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });

    console.log('🔧 OCR Watcher initialized');
    this.startWatching();
  }

  startWatching() {
    const watchDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'images');
    
    // Ensure directory exists
    if (!fs.existsSync(watchDir)) {
      fs.mkdirSync(watchDir, { recursive: true });
    }

    console.log('👀 Watching for images in:', watchDir);
    console.log('📋 File naming format: recipe-name-1.jpg, recipe-name-2.jpg');
    console.log('⏱️  Processing timeout: 10 seconds after last image');
    console.log('🚀 Ready! Drop your recipe images...\n');

    // Watch for file additions
    const watcher = chokidar.watch(watchDir, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: false
    });

    watcher.on('add', (filePath) => {
      const filename = path.basename(filePath);
      
      // Check if it's an image file
      if (!/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename)) {
        return;
      }

      console.log(`📸 New image detected: ${filename}`);
      this.handleNewImage(filePath, filename);
    });

    watcher.on('error', error => {
      console.error('❌ Watcher error:', error);
    });
  }

  parseFilename(filename) {
    // Extract recipe name and image number from filename
    // Format: recipe-name-1.jpg, recipe-name-2.jpg
    const match = filename.match(/^(.+)-(\d+)\.(jpg|jpeg|png|gif|bmp|webp)$/i);
    
    if (match) {
      return {
        recipeName: match[1],
        imageNumber: parseInt(match[2]),
        extension: match[3],
        isValid: true
      };
    }

    return {
      recipeName: filename,
      imageNumber: 1,
      extension: path.extname(filename).slice(1),
      isValid: false
    };
  }

  handleNewImage(filePath, filename) {
    const parsed = this.parseFilename(filename);
    
    if (!parsed.isValid) {
      console.log(`⚠️  Warning: ${filename} doesn't follow naming convention`);
      console.log('   Expected format: recipe-name-1.jpg, recipe-name-2.jpg');
      console.log('   Processing as single image recipe...');
    }

    const recipeName = parsed.recipeName;
    
    // Add to pending recipes
    if (!this.pendingRecipes.has(recipeName)) {
      this.pendingRecipes.set(recipeName, {
        images: [],
        timeout: null,
        recipeName: recipeName
      });
    }

    const recipeData = this.pendingRecipes.get(recipeName);
    recipeData.images.push({
      filePath: filePath,
      filename: filename,
      imageNumber: parsed.imageNumber
    });

    // Sort images by number
    recipeData.images.sort((a, b) => a.imageNumber - b.imageNumber);

    console.log(`📝 Recipe "${recipeName}" now has ${recipeData.images.length} image(s)`);

    // Clear existing timeout
    if (recipeData.timeout) {
      clearTimeout(recipeData.timeout);
    }

    // Set new timeout to process recipe
    recipeData.timeout = setTimeout(() => {
      this.processRecipe(recipeName);
    }, this.processingTimeout);

    console.log(`⏳ Waiting ${this.processingTimeout/1000}s for more images...`);
  }

  async processRecipe(recipeName) {
    const recipeData = this.pendingRecipes.get(recipeName);
    if (!recipeData) return;

    console.log(`\n🔄 Processing recipe: "${recipeName}"`);
    console.log(`📸 Processing ${recipeData.images.length} image(s)`);

    try {
      const ocrResults = [];

      // Process each image
      for (const imageInfo of recipeData.images) {
        console.log(`   🔍 Extracting text from: ${imageInfo.filename}`);
        
        const imageBuffer = fs.readFileSync(imageInfo.filePath);
        const [result] = await this.visionClient.textDetection({
          image: { content: imageBuffer }
        });

        const detections = result.textAnnotations;
        const extractedText = detections && detections.length > 0 ? detections[0].description : '';
        
        ocrResults.push({
          filename: imageInfo.filename,
          imageNumber: imageInfo.imageNumber,
          text: extractedText,
          textLength: extractedText.length
        });

        console.log(`   ✅ Extracted ${extractedText.length} characters`);
      }

      // Combine all OCR results
      const combinedText = ocrResults
        .map(result => `=== ${result.filename} ===\n${result.text}`)
        .join('\n\n');

      // Save combined OCR result
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `${recipeName}-combined-ocr-${timestamp}.txt`;
      const outputPath = path.join(__dirname, 'uploads', 'ocr-workspace', 'raw-ocr', outputFilename);
      
      // Ensure directory exists
      const rawOcrDir = path.dirname(outputPath);
      if (!fs.existsSync(rawOcrDir)) {
        fs.mkdirSync(rawOcrDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, combinedText, 'utf8');

      console.log(`💾 Combined OCR saved: ${outputFilename}`);
      console.log(`📊 Total characters: ${combinedText.length}`);
      
      // Show preview
      if (combinedText.length > 0) {
        console.log('\n📖 COMBINED TEXT PREVIEW:');
        console.log('=' .repeat(60));
        console.log(combinedText.substring(0, 300) + (combinedText.length > 300 ? '...' : ''));
        console.log('=' .repeat(60));
      }

      // Clean up processed images (optional)
      // for (const imageInfo of recipeData.images) {
      //   fs.unlinkSync(imageInfo.filePath);
      // }

      console.log(`✅ Recipe "${recipeName}" processed successfully!\n`);

    } catch (error) {
      console.error(`❌ Error processing recipe "${recipeName}":`, error.message);
    }

    // Remove from pending
    this.pendingRecipes.delete(recipeName);
  }
}

// Start the watcher
console.log('🚀 Starting OCR Watcher...');
new OCRWatcher();
