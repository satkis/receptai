import { MongoClient, MongoClientOptions } from 'mongodb';

// Validate environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!process.env.MONGODB_DB) {
  console.warn('⚠️ MONGODB_DB not set, using default database from connection string');
}

// Get MongoDB URI and validate it's not a placeholder
let uri = process.env.MONGODB_URI;

// Check if URI is a placeholder value
if (uri === 'SET' || uri === 'your-mongodb-uri' || uri.includes('placeholder')) {
  throw new Error(`❌ MONGODB_URI appears to be a placeholder value: "${uri}". Please set the actual MongoDB Atlas connection string.`);
}

console.log('🔗 MongoDB URI validation:', {
  isAtlas: uri.includes('mongodb.net'),
  hasCredentials: uri.includes('@'),
  environment: process.env.NODE_ENV
});

// For MongoDB Atlas, ensure proper SSL/TLS parameters
if (uri && uri.includes('mongodb.net')) {
  // This is MongoDB Atlas - ensure proper SSL configuration
  try {
    const url = new URL(uri);

    // Set required Atlas parameters for SSL/TLS
    url.searchParams.set('ssl', 'true');
    url.searchParams.set('tls', 'true');
    url.searchParams.set('authSource', 'admin');

    // Ensure retryWrites and w=majority for Atlas
    if (!url.searchParams.has('retryWrites')) {
      url.searchParams.set('retryWrites', 'true');
    }
    if (!url.searchParams.has('w')) {
      url.searchParams.set('w', 'majority');
    }

    // Add additional SSL/TLS parameters for better compatibility
    url.searchParams.set('tlsAllowInvalidCertificates', 'false');
    url.searchParams.set('tlsAllowInvalidHostnames', 'false');

    uri = url.toString();
    console.log('✅ MongoDB Atlas URI configured with SSL/TLS parameters');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to parse MongoDB URI:', errorMessage);
    throw new Error(`Invalid MongoDB URI format: ${errorMessage}`);
  }
}

// 🚀 MongoDB Atlas compatible options optimized for Vercel serverless
const options: MongoClientOptions = {
  // Aggressive timeouts for serverless environment
  serverSelectionTimeoutMS: 5000,  // Reduced for faster failures
  connectTimeoutMS: 8000,          // Reduced for faster connection
  socketTimeoutMS: 30000,          // Reduced socket timeout

  // Minimal connection pool for serverless
  maxPoolSize: 5,                  // Reduced for serverless
  minPoolSize: 1,                  // Minimal pool
  maxIdleTimeMS: 10000,            // Shorter idle time

  // Let MongoDB Atlas handle SSL automatically
  // (Don't override SSL settings - let the connection string handle it)
};

let clientPromise: Promise<MongoClient>;

// Enhanced connection with retry logic for Vercel serverless
async function createConnection(): Promise<MongoClient> {
  const maxRetries = 3;
  let lastError: Error = new Error('Connection failed');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${maxRetries}...`);

      const mongoClient = new MongoClient(uri, options);
      const connectedClient = await mongoClient.connect();

      // Quick ping test with timeout
      const dbName = process.env.MONGODB_DB || 'receptai';
      const pingPromise = connectedClient.db(dbName).admin().ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Ping timeout')), 3000)
      );

      await Promise.race([pingPromise, timeoutPromise]);
      console.log(`✅ MongoDB connection successful on attempt ${attempt}`);

      return connectedClient;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown connection error');
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, lastError.message);

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Progressive delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  console.error('❌ All MongoDB connection attempts failed');

  // Provide specific guidance for common errors
  if (lastError.message.includes('timeout') || lastError.message.includes('ETIMEDOUT')) {
    console.error('💡 Timeout Error - Possible causes:');
    console.error('   1. MongoDB Atlas network access not configured for 0.0.0.0/0');
    console.error('   2. MongoDB Atlas cluster is paused or unreachable');
    console.error('   3. Connection string is incorrect');
  }

  throw lastError;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createConnection();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createConnection();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Export database name for consistent usage
export const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';
