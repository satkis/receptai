// Simple test script to verify database connection and create a few test categories

console.log('🧪 Testing categories creation...');

// Check current database
console.log('📊 Current database:', db.getName());

// Check existing collections
console.log('📋 Collections:', db.getCollectionNames());

// Test: Create a simple category first
console.log('🔧 Creating test category...');

try {
  const testCategory = {
    path: "test-category",
    parentPath: null,
    level: 1,
    title: { lt: "Test kategorija" },
    slug: "test-category",
    seo: {
      metaTitle: "Test kategorija - Paragaujam.lt",
      metaDescription: "Test kategorijos aprašymas",
      keywords: ["test", "kategorija"],
      canonicalUrl: "https://paragaujam.lt/receptai/test-category"
    },
    filters: {
      manual: [],
      auto: [],
      timeFilters: ["iki-30-min"]
    },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert single test document
  const result = db.categories_new.insertOne(testCategory);
  console.log('✅ Test category created with ID:', result.insertedId);

  // Verify it was inserted
  const count = db.categories_new.countDocuments();
  console.log('📊 Total documents in categories_new:', count);

  // Show the inserted document
  const inserted = db.categories_new.findOne({ path: "test-category" });
  console.log('📄 Inserted document:', JSON.stringify(inserted, null, 2));

  // Clean up test document
  db.categories_new.deleteOne({ path: "test-category" });
  console.log('🗑️ Test document cleaned up');

} catch (error) {
  console.error('❌ Error creating test category:', error);
}

console.log('🧪 Test completed!');
