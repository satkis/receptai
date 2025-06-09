// Node.js script to run the enhanced filtering setup
// Run with: node scripts/install-enhanced-filtering.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function runEnhancedFilteringSetup() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🚀 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(MONGODB_DB);

    // 1. Create page_configs collection
    console.log('📄 Creating page_configs collection...');
    
    await db.collection('page_configs').drop().catch(() => {}); // Ignore if doesn't exist

    const pageConfigs = [
      // MEAL TYPE PAGES
      {
        slug: "sumustiniai",
        category: "mealType", 
        categoryValue: "sumustiniai",
        seo: {
          title: "Sumuštinių receptai - Paragaujam.lt",
          description: "Geriausi sumuštinių receptai su detaliais instrukcijomis. Greiti ir skanūs sumuštiniai visai šeimai.",
          keywords: ["sumuštiniai", "receptai", "greiti patiekalai", "užkandžiai"],
          canonicalUrl: "/receptai/sumustiniai"
        },
        quickFilters: [
          { type: "timeRequired", values: ["15min", "30min"], order: 1, label: { lt: "Laikas", en: "Time" } },
          { type: "mainIngredient", values: ["vistiena", "jautiena", "zuvis"], order: 2, label: { lt: "Ingredientas", en: "Ingredient" } },
          { type: "dietary", values: ["vegetariski", "veganiski"], order: 3, label: { lt: "Dieta", en: "Diet" } }
        ],
        active: true,
        createdAt: new Date()
      },
      {
        slug: "uzkandžiai",
        category: "mealType",
        categoryValue: "uzkandžiai", 
        seo: {
          title: "Užkandžių receptai - Paragaujam.lt",
          description: "Skanūs užkandžių receptai šventėms ir kasdienai. Lengvi ir greitai paruošiami užkandžiai.",
          keywords: ["užkandžiai", "receptai", "šventės", "vaišės"],
          canonicalUrl: "/receptai/uzkandžiai"
        },
        quickFilters: [
          { type: "timeRequired", values: ["15min", "30min"], order: 1, label: { lt: "Laikas", en: "Time" } },
          { type: "dietary", values: ["vegetariski", "veganiski"], order: 2, label: { lt: "Dieta", en: "Diet" } },
          { type: "customTags", values: ["šventėms", "vaikams"], order: 3, label: { lt: "Proga", en: "Occasion" } }
        ],
        active: true,
        createdAt: new Date()
      },
      {
        slug: "desertai",
        category: "mealType",
        categoryValue: "desertai",
        seo: {
          title: "Desertų receptai - Paragaujam.lt", 
          description: "Saldūs desertų receptai visoms progoms. Tortai, pyragaičiai ir kiti skanėstai.",
          keywords: ["desertai", "receptai", "tortai", "pyragaičiai", "saldumynai"],
          canonicalUrl: "/receptai/desertai"
        },
        quickFilters: [
          { type: "timeRequired", values: ["30min", "1h", "2h"], order: 1, label: { lt: "Laikas", en: "Time" } },
          { type: "dietary", values: ["vegetariski", "veganiski", "be-glitimo"], order: 2, label: { lt: "Dieta", en: "Diet" } },
          { type: "customTags", values: ["šventėms", "gimtadieniui"], order: 3, label: { lt: "Proga", en: "Occasion" } }
        ],
        active: true,
        createdAt: new Date()
      },

      // MAIN INGREDIENT PAGES
      {
        slug: "vistiena",
        category: "mainIngredient",
        categoryValue: "vistiena",
        seo: {
          title: "Vištienos receptai - Paragaujam.lt",
          description: "Skaniausi vištienos receptai su detaliais instrukcijomis. Keptos, virtos ir troškinto vištienos patiekalai.",
          keywords: ["vištiena", "receptai", "vištienos patiekalai", "mėsa"],
          canonicalUrl: "/receptai/vistiena"
        },
        quickFilters: [
          { type: "timeRequired", values: ["30min", "1h"], order: 1, label: { lt: "Laikas", en: "Time" } },
          { type: "mealType", values: ["pietus", "vakariene"], order: 2, label: { lt: "Patiekalo tipas", en: "Meal Type" } },
          { type: "cuisine", values: ["lietuviska", "azijietiska"], order: 3, label: { lt: "Virtuvė", en: "Cuisine" } }
        ],
        active: true,
        createdAt: new Date()
      },
      {
        slug: "zuvis",
        category: "mainIngredient", 
        categoryValue: "zuvis",
        seo: {
          title: "Žuvies receptai - Paragaujam.lt",
          description: "Sveiki žuvies receptai su omega-3. Keptos, virtos ir troškinto žuvies patiekalai.",
          keywords: ["žuvis", "receptai", "žuvies patiekalai", "sveika mityba"],
          canonicalUrl: "/receptai/zuvis"
        },
        quickFilters: [
          { type: "timeRequired", values: ["15min", "30min"], order: 1, label: { lt: "Laikas", en: "Time" } },
          { type: "mealType", values: ["pietus", "vakariene"], order: 2, label: { lt: "Patiekalo tipas", en: "Meal Type" } },
          { type: "dietary", values: ["sveika", "baltyminga"], order: 3, label: { lt: "Dieta", en: "Diet" } }
        ],
        active: true,
        createdAt: new Date()
      },

      // CUISINE PAGES
      {
        slug: "lietuviska",
        category: "cuisine",
        categoryValue: "lietuviska", 
        seo: {
          title: "Lietuviški receptai - Paragaujam.lt",
          description: "Tradiciniai lietuviški receptai ir patiekalai. Cepelinai, kugelis, šaltibarščiai ir kiti klasikiniai patiekalai.",
          keywords: ["lietuviški receptai", "tradiciniai patiekalai", "cepelinai", "kugelis"],
          canonicalUrl: "/receptai/lietuviska"
        },
        quickFilters: [
          { type: "mealType", values: ["pietus", "vakariene", "uzkandžiai"], order: 1, label: { lt: "Patiekalo tipas", en: "Meal Type" } },
          { type: "timeRequired", values: ["1h", "2h"], order: 2, label: { lt: "Laikas", en: "Time" } },
          { type: "customTags", values: ["šventėms", "tradicinis"], order: 3, label: { lt: "Proga", en: "Occasion" } }
        ],
        active: true,
        createdAt: new Date()
      },

      // DIETARY PAGES
      {
        slug: "vegetariski",
        category: "dietary",
        categoryValue: "vegetariski",
        seo: {
          title: "Vegetariški receptai - Paragaujam.lt", 
          description: "Skanūs vegetariški receptai be mėsos. Sveiki ir maistingi augaliniai patiekalai visai šeimai.",
          keywords: ["vegetariški receptai", "be mėsos", "augaliniai patiekalai", "sveika mityba"],
          canonicalUrl: "/receptai/vegetariski"
        },
        quickFilters: [
          { type: "mealType", values: ["pusryčiai", "pietus", "vakariene"], order: 1, label: { lt: "Patiekalo tipas", en: "Meal Type" } },
          { type: "timeRequired", values: ["15min", "30min", "1h"], order: 2, label: { lt: "Laikas", en: "Time" } },
          { type: "mainIngredient", values: ["daržoves", "grybai", "ankstiniai"], order: 3, label: { lt: "Ingredientas", en: "Ingredient" } }
        ],
        active: true,
        createdAt: new Date()
      }
    ];

    const pageConfigResult = await db.collection('page_configs').insertMany(pageConfigs);
    console.log(`✅ Created ${pageConfigResult.insertedCount} page configurations`);

    // 2. Create filter_definitions collection
    console.log('🏷️ Creating filter_definitions collection...');

    await db.collection('filter_definitions').drop().catch(() => {});

    const filterDefinitions = [
      // CUISINE FILTERS
      { type: "cuisine", key: "lietuviska", label: { lt: "Lietuviška", en: "Lithuanian" }, icon: "🇱🇹", color: "#FFD700", order: 1, active: true },
      { type: "cuisine", key: "italiska", label: { lt: "Itališka", en: "Italian" }, icon: "🇮🇹", color: "#009246", order: 2, active: true },
      { type: "cuisine", key: "azijietiska", label: { lt: "Azijietiška", en: "Asian" }, icon: "🥢", color: "#FF6B6B", order: 3, active: true },
      { type: "cuisine", key: "prancuziska", label: { lt: "Prancūziška", en: "French" }, icon: "🇫🇷", color: "#0055A4", order: 4, active: true },

      // MEAL TYPE FILTERS  
      { type: "mealType", key: "pusryčiai", label: { lt: "Pusryčiai", en: "Breakfast" }, icon: "🌅", color: "#FFD93D", order: 1, active: true },
      { type: "mealType", key: "pietus", label: { lt: "Pietūs", en: "Lunch" }, icon: "☀️", color: "#FF8C42", order: 2, active: true },
      { type: "mealType", key: "vakariene", label: { lt: "Vakarienė", en: "Dinner" }, icon: "🌙", color: "#6A4C93", order: 3, active: true },
      { type: "mealType", key: "uzkandžiai", label: { lt: "Užkandžiai", en: "Snacks" }, icon: "🥨", color: "#F18F01", order: 4, active: true },
      { type: "mealType", key: "desertai", label: { lt: "Desertai", en: "Desserts" }, icon: "🍰", color: "#FF69B4", order: 5, active: true },
      { type: "mealType", key: "sumustiniai", label: { lt: "Sumuštiniai", en: "Sandwiches" }, icon: "🥪", color: "#8BC34A", order: 6, active: true },

      // TIME REQUIRED FILTERS
      { type: "timeRequired", key: "15min", label: { lt: "≤15 min", en: "≤15 min" }, icon: "⚡", color: "#FF5722", order: 1, active: true, metadata: { maxMinutes: 15 } },
      { type: "timeRequired", key: "30min", label: { lt: "≤30 min", en: "≤30 min" }, icon: "🕐", color: "#FF9800", order: 2, active: true, metadata: { maxMinutes: 30 } },
      { type: "timeRequired", key: "1h", label: { lt: "≤1 val", en: "≤1h" }, icon: "🕑", color: "#2196F3", order: 3, active: true, metadata: { maxMinutes: 60 } },
      { type: "timeRequired", key: "2h", label: { lt: "≤2 val", en: "≤2h" }, icon: "🕕", color: "#9C27B0", order: 4, active: true, metadata: { maxMinutes: 120 } },

      // DIETARY RESTRICTIONS
      { type: "dietary", key: "vegetariski", label: { lt: "Vegetariški", en: "Vegetarian" }, icon: "🌱", color: "#4CAF50", order: 1, active: true },
      { type: "dietary", key: "veganiski", label: { lt: "Veganiški", en: "Vegan" }, icon: "🌿", color: "#2E7D32", order: 2, active: true },
      { type: "dietary", key: "be-glitimo", label: { lt: "Be glitimo", en: "Gluten-free" }, icon: "🚫🌾", color: "#FF9800", order: 3, active: true },
      { type: "dietary", key: "keto", label: { lt: "Keto", en: "Keto" }, icon: "🥑", color: "#795548", order: 4, active: true },
      { type: "dietary", key: "sveika", label: { lt: "Sveika", en: "Healthy" }, icon: "💚", color: "#4CAF50", order: 5, active: true },

      // MAIN INGREDIENTS
      { type: "mainIngredient", key: "vistiena", label: { lt: "Vištiena", en: "Chicken" }, icon: "🐔", color: "#FFC107", order: 1, active: true },
      { type: "mainIngredient", key: "jautiena", label: { lt: "Jautiena", en: "Beef" }, icon: "🥩", color: "#D32F2F", order: 2, active: true },
      { type: "mainIngredient", key: "zuvis", label: { lt: "Žuvis", en: "Fish" }, icon: "🐟", color: "#00BCD4", order: 3, active: true },
      { type: "mainIngredient", key: "daržoves", label: { lt: "Daržovės", en: "Vegetables" }, icon: "🥕", color: "#4CAF50", order: 4, active: true },
      { type: "mainIngredient", key: "grybai", label: { lt: "Grybai", en: "Mushrooms" }, icon: "🍄", color: "#795548", order: 5, active: true },

      // CUSTOM TAGS
      { type: "customTags", key: "šventėms", label: { lt: "Šventėms", en: "For Holidays" }, icon: "🎉", color: "#E91E63", order: 1, active: true },
      { type: "customTags", key: "vaikams", label: { lt: "Vaikams", en: "For Kids" }, icon: "👶", color: "#FF9800", order: 2, active: true },
      { type: "customTags", key: "tradicinis", label: { lt: "Tradicinis", en: "Traditional" }, icon: "🏛️", color: "#795548", order: 3, active: true },
      { type: "customTags", key: "greitas", label: { lt: "Greitas", en: "Quick" }, icon: "⚡", color: "#FF5722", order: 4, active: true }
    ];

    const filterDefResult = await db.collection('filter_definitions').insertMany(filterDefinitions);
    console.log(`✅ Created ${filterDefResult.insertedCount} filter definitions`);

    console.log('✅ Enhanced filtering system setup complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Page configurations: ${pageConfigs.length}`);
    console.log(`   - Filter definitions: ${filterDefinitions.length}`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Run the recipe migration script');
    console.log('   2. Create optimized indexes');
    console.log('   3. Test the new filtering system');

  } catch (error) {
    console.error('❌ Error setting up enhanced filtering:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the setup
runEnhancedFilteringSetup();
