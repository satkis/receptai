const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testing Google Cloud Vision API connection...');
    
    // Check environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
    }
    
    if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      throw new Error('GOOGLE_CLOUD_PRIVATE_KEY environment variable is required');
    }
    
    if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      throw new Error('GOOGLE_CLOUD_CLIENT_EMAIL environment variable is required');
    }

    console.log('✅ Environment variables found');
    console.log('📧 Client Email:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
    console.log('🆔 Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);

    // Create credentials object
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

    // Initialize the Vision API client
    const client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });

    console.log('🔧 Vision client initialized');

    // Create a simple test image (1x1 white pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('🖼️ Testing with sample image...');

    // Test the connection
    const [result] = await client.textDetection({
      image: {
        content: testImageBuffer
      }
    });

    console.log('✅ Google Cloud Vision API connection successful!');
    console.log('📊 API Response received');
    
    return true;
  } catch (error) {
    console.error('❌ Google Cloud Vision API connection failed:');
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.details) {
      console.error('Error details:', error.details);
    }
    
    return false;
  }
}

// Run the test
testConnection().then(result => {
  if (result) {
    console.log('\n🎉 Connection test PASSED - Ready to proceed with OCR implementation!');
    process.exit(0);
  } else {
    console.log('\n💥 Connection test FAILED - Please check your Google Cloud setup');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
