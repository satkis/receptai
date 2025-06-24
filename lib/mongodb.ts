import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// Ensure SSL is enabled for MongoDB Atlas
let uri = process.env.MONGODB_URI;

// For MongoDB Atlas, ensure SSL is enabled in the connection string
if (uri && !uri.includes('ssl=') && !uri.includes('tls=')) {
  const separator = uri.includes('?') ? '&' : '?';
  uri = `${uri}${separator}ssl=true`;
}

// 🚀 MongoDB Atlas compatible connection options
const options: MongoClientOptions = {
  // Basic timeouts for production reliability
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,

  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,

  // Retry settings for reliability
  retryWrites: true,
  retryReads: true,

  // Performance optimizations
  compressors: ['zlib'],
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
