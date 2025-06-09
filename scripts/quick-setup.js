// Quick setup script to create minimal data for testing
const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

async function quickSetup() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(MONGODB_DB);

    // 1. Create a simple page config for sumustiniai
    await db.collection('page_configs').deleteMany({});
    await db.collection('page_configs').insertOne({
      slug: "sumustiniai",
      category: "mealType",
      categoryValue: "sumustiniai",
      seo: {
        title: "Sumuštinių receptai - Paragaujam.lt",
        description: "Geriausi sumuštinių receptai",
        canonicalUrl: "/receptai/sumustiniai"
      },
      quickFilters: [
        { type: "timeRequired", values: ["15min", "30min"], order: 1, label: { lt: "Laikas", en: "Time" } }
      ],
      active: true,
      createdAt: new Date()
    });

    // 2. Create basic filter definitions
    await db.collection('filter_definitions').deleteMany({});
    await db.collection('filter_definitions').insertMany([
      { type: "timeRequired", key: "15min", label: { lt: "≤15 min", en: "≤15 min" }, icon: "⚡", color: "#FF5722", order: 1, active: true },
      { type: "timeRequired", key: "30min", label: { lt: "≤30 min", en: "≤30 min" }, icon: "🕐", color: "#FF9800", order: 2, active: true }
    ]);

    // 3. Create a simple test recipe
    await db.collection('recipes').insertOne({
      slug: "test-sumustiniai",
      title: { lt: "Test sumuštiniai", en: "Test sandwiches" },
      description: { lt: "Test receptas", en: "Test recipe" },
      categories: {
        cuisine: ["lietuviska"],
        mealType: ["sumustiniai"],
        dietary: [],
        mainIngredient: ["vistiena"],
        timeRequired: "15min",
        customTags: []
      },
      timing: {
        prepTimeMinutes: 10,
        cookTimeMinutes: 5,
        totalTimeMinutes: 15
      },
      ingredients: [
        { name: { lt: "Duona", en: "Bread" }, amount: 2, unit: { lt: "riekės", en: "slices" } }
      ],
      instructions: [
        { step: 1, text: { lt: "Paruoškite duoną", en: "Prepare bread" } }
      ],
      status: "public",
      rating: { average: 4.5, count: 10 },
      author: { name: "Test" },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Quick setup complete!');
    console.log('Try visiting: http://localhost:3000/receptai/sumustiniai');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

quickSetup();
