import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// 🚀 Production-optimized MongoDB connection options
const options: MongoClientOptions = {
  // Connection timeouts (critical for production performance)
  serverSelectionTimeoutMS: 5000,    // 5 seconds to select server
  connectTimeoutMS: 10000,           // 10 seconds to establish connection
  socketTimeoutMS: 45000,            // 45 seconds for socket operations

  // Connection pool settings (reuse connections)
  maxPoolSize: 10,                   // Maximum 10 connections in pool
  minPoolSize: 2,                    // Keep 2 connections always ready
  maxIdleTimeMS: 30000,              // Close idle connections after 30s

  // Retry and reliability
  retryWrites: true,                 // Retry failed writes
  retryReads: true,                  // Retry failed reads

  // SSL/TLS Configuration (fix for production SSL issues)
  tls: true,                         // Enable TLS
  tlsAllowInvalidCertificates: false, // Validate certificates
  tlsAllowInvalidHostnames: false,   // Validate hostnames
  tlsInsecure: false,                // Use secure TLS

  // Performance optimizations
  compressors: ['zlib'],             // Compress network traffic
  zlibCompressionLevel: 6,           // Balanced compression

  // Monitoring and logging
  monitorCommands: process.env.NODE_ENV === 'development',

  // Write concern for production
  writeConcern: {
    w: 'majority',                   // Wait for majority acknowledgment
    j: true,                         // Wait for journal
    wtimeout: 10000                  // 10 second write timeout
  },

  // Read preference
  readPreference: 'primaryPreferred', // Read from primary when available

  // Additional production settings
  heartbeatFrequencyMS: 10000,       // Check server health every 10s

  // Additional SSL options for Atlas compatibility
  authSource: 'admin',               // Authentication database
  authMechanism: 'SCRAM-SHA-1',      // Authentication mechanism
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
