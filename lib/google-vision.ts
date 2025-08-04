import { ImageAnnotatorClient } from '@google-cloud/vision';

// Google Cloud Vision API Configuration
const createVisionClient = () => {
  // Check if we have the required environment variables
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
  }
  
  if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    throw new Error('GOOGLE_CLOUD_PRIVATE_KEY environment variable is required');
  }
  
  if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    throw new Error('GOOGLE_CLOUD_CLIENT_EMAIL environment variable is required');
  }

  // Create credentials object from environment variables
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
    private_key_id: '', // Not required for authentication
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: '', // Not required for authentication
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

  return client;
};

// Export a singleton instance
let visionClient: ImageAnnotatorClient | null = null;

export const getVisionClient = (): ImageAnnotatorClient => {
  if (!visionClient) {
    visionClient = createVisionClient();
  }
  return visionClient;
};

// OCR Text Detection Function
export const extractTextFromImage = async (imageBuffer: Buffer): Promise<string> => {
  try {
    const client = getVisionClient();
    
    // Perform text detection on the image
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer
      }
    });

    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return '';
    }

    // The first detection contains the full text
    const fullText = detections[0]?.description || '';
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Test connection function
export const testVisionConnection = async (): Promise<boolean> => {
  try {
    const client = getVisionClient();
    
    // Create a simple test image (1x1 white pixel)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Test the connection
    await client.textDetection({
      image: {
        content: testImageBuffer
      }
    });

    console.log('✅ Google Cloud Vision API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Google Cloud Vision API connection failed:', error);
    return false;
  }
};
