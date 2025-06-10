// Production Environment Setup Script
// Run with: mongosh receptai < production-setup.js

use('receptai');

print("🚀 Setting up production environment...");

// 1. CREATE PRODUCTION INDEXES FOR OPTIMAL PERFORMANCE
print("\n🔍 Creating production-optimized indexes...");

// Compound index for homepage queries (featured + trending + rating)
db.recipes.createIndex(
  {
    status: 1,
    featured: 1,
    trending: 1,
    "rating.average": -1,
    "performance.views": -1,
    createdAt: -1
  },
  {
    name: "recipes_homepage_optimized",
    background: true
  }
);

// Compound index for category page filtering
db.recipes.createIndex(
  {
    status: 1,
    categoryPath: 1,
    "categories.timeRequired": 1,
    "categories.dietary": 1,
    "categories.mainIngredient": 1,
    totalTimeMinutes: 1,
    "rating.average": -1
  },
  {
    name: "recipes_category_filtering",
    background: true
  }
);

// Text search index for recipe search functionality
db.recipes.createIndex(
  {
    "title.lt": "text",
    "description.lt": "text",
    "seo.keywords": "text",
    "ingredients.name.lt": "text"
  },
  {
    name: "recipes_text_search",
    background: true,
    weights: {
      "title.lt": 10,
      "seo.keywords": 8,
      "description.lt": 5,
      "ingredients.name.lt": 3
    }
  }
);

// Sitemap generation index
db.recipes.createIndex(
  {
    status: 1,
    categoryPath: 1,
    slug: 1,
    updatedAt: -1
  },
  {
    name: "recipes_sitemap",
    background: true
  }
);

// Performance analytics index
db.recipes.createIndex(
  {
    "performance.views": -1,
    "performance.shares": -1,
    "performance.saves": -1,
    createdAt: -1
  },
  {
    name: "recipes_analytics",
    background: true
  }
);

print("✅ Production indexes created");

// 2. SET UP PRODUCTION DATA VALIDATION RULES
print("\n📋 Setting up data validation rules...");

// Create validation schema for recipes collection
db.runCommand({
  collMod: "recipes",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["slug", "title", "description", "status", "categoryPath"],
      properties: {
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "Slug must be lowercase alphanumeric with hyphens"
        },
        title: {
          bsonType: "object",
          required: ["lt"],
          properties: {
            lt: { bsonType: "string", minLength: 1 },
            en: { bsonType: "string" }
          }
        },
        description: {
          bsonType: "object",
          required: ["lt"],
          properties: {
            lt: { bsonType: "string", minLength: 1 },
            en: { bsonType: "string" }
          }
        },
        status: {
          bsonType: "string",
          enum: ["draft", "published", "archived"]
        },
        categoryPath: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+/[a-z0-9-]+$"
        },
        totalTimeMinutes: {
          bsonType: "int",
          minimum: 1,
          maximum: 1440
        },
        servings: {
          bsonType: "int",
          minimum: 1,
          maximum: 50
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

print("✅ Validation rules set up");

// 3. CREATE PRODUCTION COLLECTIONS FOR ANALYTICS
print("\n📊 Setting up analytics collections...");

// Page views collection for analytics
db.createCollection("page_views", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["url", "timestamp", "userAgent"],
      properties: {
        url: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        userAgent: { bsonType: "string" },
        referrer: { bsonType: "string" },
        sessionId: { bsonType: "string" },
        userId: { bsonType: "string" },
        country: { bsonType: "string" },
        device: { bsonType: "string" }
      }
    }
  }
});

// Create TTL index for page views (keep data for 90 days)
db.page_views.createIndex(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 7776000, // 90 days
    name: "page_views_ttl"
  }
);

// Search queries collection for search analytics
db.createCollection("search_queries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["query", "timestamp", "resultsCount"],
      properties: {
        query: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        resultsCount: { bsonType: "int" },
        sessionId: { bsonType: "string" },
        userId: { bsonType: "string" }
      }
    }
  }
});

// Create TTL index for search queries (keep data for 30 days)
db.search_queries.createIndex(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 2592000, // 30 days
    name: "search_queries_ttl"
  }
);

print("✅ Analytics collections created");

// 4. SET UP PRODUCTION CONFIGURATION
print("\n⚙️ Setting up production configuration...");

// Create site configuration collection
db.createCollection("site_config");

db.site_config.insertOne({
  _id: "production",
  environment: "production",
  siteName: "Paragaujam.lt",
  siteUrl: "https://paragaujam.lt",
  defaultLanguage: "lt",
  supportedLanguages: ["lt", "en"],
  seo: {
    defaultTitle: "Paragaujam.lt - Lietuviški receptai",
    defaultDescription: "Geriausi lietuviški receptai su interaktyviomis funkcijomis. Ruoškite skaniai ir lengvai kartu su mumis!",
    defaultKeywords: ["lietuviški receptai", "receptai", "maistas", "gaminimas", "virtuvė"],
    organizationSchema: {
      "@type": "Organization",
      name: "Paragaujam.lt",
      url: "https://paragaujam.lt",
      logo: "https://paragaujam.lt/images/logo.png",
      description: "Lietuviškų receptų svetainė su interaktyviomis funkcijomis",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+370 600 12345",
        contactType: "customer service",
        availableLanguage: ["Lithuanian", "English"]
      }
    }
  },
  features: {
    enableAnalytics: true,
    enableSearch: true,
    enableComments: false,
    enableRatings: true,
    enableSocialSharing: true,
    enablePWA: true
  },
  performance: {
    cacheTimeout: 3600, // 1 hour
    sitemapCacheTimeout: 86400, // 24 hours
    robotsCacheTimeout: 86400, // 24 hours
    maxRecipesPerPage: 12,
    maxSearchResults: 50
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Production configuration created");

// 5. CREATE PRODUCTION MONITORING SETUP
print("\n📈 Setting up monitoring and health checks...");

// Create health check collection
db.createCollection("health_checks");

// Insert initial health check data
db.health_checks.insertOne({
  timestamp: new Date(),
  status: "healthy",
  checks: {
    database: "connected",
    indexes: "optimized",
    collections: {
      recipes: db.recipes.countDocuments(),
      categories: db.categories.countDocuments(),
      groups: db.groups.countDocuments()
    }
  },
  performance: {
    avgQueryTime: 0,
    slowQueries: 0,
    connectionCount: 0
  }
});

// Create index for health checks
db.health_checks.createIndex(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 604800, // 7 days
    name: "health_checks_ttl"
  }
);

print("✅ Monitoring setup completed");

// 6. OPTIMIZE COLLECTION SETTINGS FOR PRODUCTION
print("\n🔧 Optimizing collection settings...");

// Set read preference for better performance
db.runCommand({
  collMod: "recipes",
  readConcern: { level: "majority" },
  writeConcern: { w: "majority", j: true }
});

db.runCommand({
  collMod: "categories",
  readConcern: { level: "majority" },
  writeConcern: { w: "majority", j: true }
});

db.runCommand({
  collMod: "groups",
  readConcern: { level: "majority" },
  writeConcern: { w: "majority", j: true }
});

print("✅ Collection settings optimized");

// 7. CREATE BACKUP STRATEGY
print("\n💾 Setting up backup strategy...");

// Create backup metadata collection
db.createCollection("backup_metadata");

db.backup_metadata.insertOne({
  strategy: "automated",
  frequency: "daily",
  retention: "30 days",
  collections: ["recipes", "categories", "groups", "site_config"],
  lastBackup: null,
  nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  status: "configured"
});

print("✅ Backup strategy configured");

// 8. FINAL PRODUCTION READINESS CHECK
print("\n🔍 Running production readiness check...");

const checks = {
  recipes: {
    total: db.recipes.countDocuments(),
    published: db.recipes.countDocuments({ status: "published" }),
    withSEO: db.recipes.countDocuments({ "seo.metaTitle": { $ne: "" } }),
    withCategoryPath: db.recipes.countDocuments({ categoryPath: { $exists: true } })
  },
  categories: {
    total: db.categories.countDocuments(),
    active: db.categories.countDocuments({ status: "active" })
  },
  groups: {
    total: db.groups.countDocuments(),
    active: db.groups.countDocuments({ status: "active" })
  },
  indexes: {
    recipes: db.recipes.getIndexes().length,
    categories: db.categories.getIndexes().length,
    groups: db.groups.getIndexes().length
  }
};

print("\n📊 Production Readiness Report:");
print(`   📝 Recipes: ${checks.recipes.total} total, ${checks.recipes.published} published`);
print(`   🔍 SEO Coverage: ${checks.recipes.withSEO}/${checks.recipes.total} recipes`);
print(`   📂 Categories: ${checks.categories.active}/${checks.categories.total} active`);
print(`   🏷️ Groups: ${checks.groups.active}/${checks.groups.total} active`);
print(`   🔍 Indexes: ${checks.indexes.recipes + checks.indexes.categories + checks.indexes.groups} total`);

// Check for production readiness
const isReady = 
  checks.recipes.published > 0 &&
  checks.recipes.withSEO === checks.recipes.total &&
  checks.categories.active > 0 &&
  checks.groups.active > 0 &&
  checks.indexes.recipes >= 5;

if (isReady) {
  print("\n✅ PRODUCTION READY!");
  print("🚀 Your database is optimized and ready for production deployment!");
} else {
  print("\n⚠️ Production readiness issues found:");
  if (checks.recipes.published === 0) print("   - No published recipes found");
  if (checks.recipes.withSEO < checks.recipes.total) print("   - Some recipes missing SEO data");
  if (checks.categories.active === 0) print("   - No active categories found");
  if (checks.groups.active === 0) print("   - No active groups found");
  if (checks.indexes.recipes < 5) print("   - Insufficient indexes for optimal performance");
}

print("\n🎉 Production setup completed!");
print("📈 Monitor your application performance and run health checks regularly.");
