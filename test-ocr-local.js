const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testOCR() {
  try {
    console.log('🔍 Starting OCR test...');
    
    // Initialize Vision client
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

    const client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });

    // Look for images in the uploads folder
    const imagesDir = path.join(__dirname, 'uploads', 'ocr-workspace', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      console.log('📁 Creating images directory...');
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const files = fs.readdirSync(imagesDir).filter(file => 
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    );

    if (files.length === 0) {
      console.log('❌ No image files found in uploads/ocr-workspace/images/');
      console.log('📋 Please:');
      console.log('   1. Copy your recipe image to: uploads/ocr-workspace/images/');
      console.log('   2. Supported formats: jpg, jpeg, png, gif, bmp, webp');
      console.log('   3. Run this script again');
      return;
    }

    console.log(`📸 Found ${files.length} image(s):`, files);

    // Process each image
    for (const filename of files) {
      console.log(`\n🔄 Processing: ${filename}`);
      
      const imagePath = path.join(imagesDir, filename);
      const imageBuffer = fs.readFileSync(imagePath);
      
      console.log(`📏 File size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
      
      // Extract text
      const [result] = await client.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations;
      const extractedText = detections && detections.length > 0 ? detections[0].description : '';
      
      console.log(`✅ Text extraction completed`);
      console.log(`📝 Extracted ${extractedText.length} characters`);
      
      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `${path.parse(filename).name}-ocr-${timestamp}.txt`;
      const outputPath = path.join(__dirname, 'uploads', 'ocr-workspace', 'raw-ocr', outputFilename);
      
      // Ensure raw-ocr directory exists
      const rawOcrDir = path.dirname(outputPath);
      if (!fs.existsSync(rawOcrDir)) {
        fs.mkdirSync(rawOcrDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, extractedText, 'utf8');
      
      console.log(`💾 Results saved to: uploads/ocr-workspace/raw-ocr/${outputFilename}`);
      
      // Show preview of extracted text
      if (extractedText.length > 0) {
        console.log('\n📖 EXTRACTED TEXT PREVIEW:');
        console.log('=' .repeat(50));
        console.log(extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''));
        console.log('=' .repeat(50));
      } else {
        console.log('⚠️  No text detected in image');
      }
    }

    console.log('\n🎉 OCR test completed successfully!');
    console.log('📁 Check uploads/ocr-workspace/raw-ocr/ for full results');

  } catch (error) {
    console.error('❌ OCR test failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
  }
}

testOCR();
