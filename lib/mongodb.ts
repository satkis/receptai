import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// MongoDB Atlas connection string with proper SSL configuration
let uri = process.env.MONGODB_URI;

// For MongoDB Atlas, ensure proper SSL/TLS parameters
if (uri && uri.includes('mongodb.net')) {
  // This is MongoDB Atlas - ensure proper SSL configuration
  const url = new URL(uri);

  // Set required Atlas parameters
  url.searchParams.set('ssl', 'true');
  url.searchParams.set('authSource', 'admin');

  // Ensure retryWrites and w=majority for Atlas
  if (!url.searchParams.has('retryWrites')) {
    url.searchParams.set('retryWrites', 'true');
  }
  if (!url.searchParams.has('w')) {
    url.searchParams.set('w', 'majority');
  }

  uri = url.toString();
  console.log('🔧 MongoDB Atlas URI configured with SSL parameters');
}

// 🚀 Minimal MongoDB Atlas compatible options (SSL handled in connection string)
const options: MongoClientOptions = {
  // Basic timeouts
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,

  // Connection pool
  maxPoolSize: 10,
  minPoolSize: 2,
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
