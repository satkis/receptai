// Create Optimized Indexes for Receptai Collections
// Run this AFTER adding sample data
// Usage: mongosh receptai < create-indexes.js

use('receptai');

print("🔍 Creating optimized indexes...");

// === RECIPES COLLECTION INDEXES ===

print("📊 Creating recipes indexes...");

// 1. Primary compound index for filtering & sorting (ESR rule: Equality, Sort, Range)
db.recipes.createIndex({
  "status": 1,
  "filters.cuisine": 1,
  "filters.mealType": 1,
  "filters.dietary": 1,
  "groupIds": 1,
  "totalTimeMinutes": 1,
  "rating.average": -1
}, { name: "recipes_primary_filter_sort" });

// 2. Unique slug index (critical for page loads)
db.recipes.createIndex(
  { "slug": 1 }, 
  { "unique": true, name: "recipes_slug_unique" }
);

// 3. Creation date index (for newest recipes)
db.recipes.createIndex(
  { "createdAt": -1 }, 
  { name: "recipes_created_desc" }
);

// 4. Text search index (for search functionality)
db.recipes.createIndex(
  { 
    "title.lt": "text", 
    "title.en": "text",
    "description.lt": "text", 
    "description.en": "text",
    "keywords": "text"
  }, 
  { 
    name: "recipes_text_search",
    default_language: "none" // Disable stemming for multilingual content
  }
);

// 5. Group-specific indexes
db.recipes.createIndex(
  { "groupIds": 1, "status": 1, "rating.average": -1 }, 
  { name: "recipes_groups_rating" }
);

// 6. Time-based filtering
db.recipes.createIndex(
  { "status": 1, "totalTimeMinutes": 1 }, 
  { name: "recipes_time_filter" }
);

// 7. Dietary filtering
db.recipes.createIndex(
  { "status": 1, "filters.dietary": 1 }, 
  { name: "recipes_dietary_filter" }
);

print("✅ Recipes indexes created");

// === CATEGORIES COLLECTION INDEXES ===

print("📊 Creating categories indexes...");

// Index for fast category lookups by type
db.categories.createIndex(
  { "type": 1, "key": 1 }, 
  { name: "categories_type_key" }
);

// Index for key lookups
db.categories.createIndex(
  { "key": 1 }, 
  { name: "categories_key" }
);

print("✅ Categories indexes created");

// === GROUPS COLLECTION INDEXES ===

print("📊 Creating groups indexes...");

// Unique slug index for groups
db.groups.createIndex(
  { "slug": 1 }, 
  { "unique": true, name: "groups_slug_unique" }
);

// Creation date for ordering
db.groups.createIndex(
  { "createdAt": -1 }, 
  { name: "groups_created_desc" }
);

print("✅ Groups indexes created");

// === VERIFY INDEXES ===

print("🔍 Verifying indexes...");

print("\n📊 Recipes collection indexes:");
db.recipes.getIndexes().forEach(index => {
  print("  - " + index.name + ": " + JSON.stringify(index.key));
});

print("\n📊 Categories collection indexes:");
db.categories.getIndexes().forEach(index => {
  print("  - " + index.name + ": " + JSON.stringify(index.key));
});

print("\n📊 Groups collection indexes:");
db.groups.getIndexes().forEach(index => {
  print("  - " + index.name + ": " + JSON.stringify(index.key));
});

print("\n🎉 All indexes created successfully!");
print("🚀 Database is now optimized for production performance!");

// === INDEX USAGE TIPS ===
print("\n💡 Index Usage Tips:");
print("   - Use status='public' in all queries for best performance");
print("   - Combine filters in this order: cuisine → mealType → dietary → time");
print("   - Use text search for recipe search functionality");
print("   - Group queries will be very fast with groupIds index");
print("   - Slug lookups are optimized for fast page loads");
