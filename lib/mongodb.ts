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

// 🚀 MongoDB Atlas compatible options with enhanced SSL/TLS configuration
const options: MongoClientOptions = {
  // Connection timeouts
  serverSelectionTimeoutMS: 10000, // Increased for production
  connectTimeoutMS: 15000, // Increased for production
  socketTimeoutMS: 45000,

  // Connection pool
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,

  // SSL/TLS configuration for Atlas
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
};

let clientPromise: Promise<MongoClient>;

// Enhanced connection with better error handling
async function createConnection(): Promise<MongoClient> {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    const mongoClient = new MongoClient(uri, options);
    const connectedClient = await mongoClient.connect();

    // Test the connection
    await connectedClient.db().admin().ping();
    console.log('✅ MongoDB connection successful');

    return connectedClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('❌ MongoDB connection failed:', errorMessage);

    // Provide specific guidance for common SSL/TLS errors
    if (errorMessage.includes('ssl') || errorMessage.includes('tls') || errorMessage.includes('SSL')) {
      console.error('💡 SSL/TLS Error - Check if:');
      console.error('   1. MongoDB Atlas cluster allows connections from your IP');
      console.error('   2. Connection string includes proper SSL parameters');
      console.error('   3. Network allows outbound connections on port 27017');
    }

    throw error;
  }
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
