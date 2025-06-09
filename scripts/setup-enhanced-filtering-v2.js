// Enhanced Filtering System Setup for MongoDB
// Optimized for 5-20k recipes with instant filtering performance
// Run with: mongosh receptai < setup-enhanced-filtering-v2.js

use('receptai');

print("🚀 Setting up enhanced filtering system for optimal performance...");

// 1. Create page_configs collection for SEO-optimized category pages
print("📄 Creating page_configs collection...");

db.page_configs.drop(); // Clean start

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

const pageConfigResult = db.page_configs.insertMany(pageConfigs);
print(`✅ Created ${pageConfigResult.insertedIds.length} page configurations`);

// 2. Create filter_definitions collection for centralized filter management
print("🏷️ Creating filter_definitions collection...");

db.filter_definitions.drop();

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

const filterDefResult = db.filter_definitions.insertMany(filterDefinitions);
print(`✅ Created ${filterDefResult.insertedIds.length} filter definitions`);

// 3. Update existing recipes with enhanced embedded categories
print("🔄 Updating existing recipes with enhanced embedded categories...");

const existingRecipes = db.recipes.find({}).toArray();
let updatedCount = 0;

existingRecipes.forEach(recipe => {
  // Extract and enhance categories from existing data
  const enhancedCategories = {
    cuisine: extractCuisine(recipe),
    mealType: extractMealType(recipe),
    dietary: extractDietary(recipe),
    mainIngredient: extractMainIngredients(recipe),
    timeRequired: getTimeRange(recipe.totalTimeMinutes || 30),
    customTags: extractCustomTags(recipe)
  };

  // Enhanced timing structure
  const timing = {
    prepTimeMinutes: recipe.prepTimeMinutes || 15,
    cookTimeMinutes: recipe.cookTimeMinutes || 15,
    totalTimeMinutes: recipe.totalTimeMinutes || 30,
    activeTimeMinutes: Math.floor((recipe.prepTimeMinutes || 15) * 0.8),
    restTimeMinutes: Math.max(0, (recipe.totalTimeMinutes || 30) - (recipe.prepTimeMinutes || 15) - (recipe.cookTimeMinutes || 15))
  };

  db.recipes.updateOne(
    { _id: recipe._id },
    {
      $set: {
        categories: enhancedCategories,
        timing: timing
      }
    }
  );
  updatedCount++;
});

print(`✅ Updated ${updatedCount} recipes with enhanced categories`);

// Helper functions for data extraction
function extractCuisine(recipe) {
  const existing = recipe.filters?.cuisine;
  if (existing) return [existing];

  // Intelligent detection based on title/description
  const text = ((recipe.title?.lt || recipe.title || '') + ' ' + (recipe.description?.lt || recipe.description || '')).toLowerCase();
  if (text.includes('cepelinai') || text.includes('kugelis') || text.includes('šaltibarščiai')) return ['lietuviska'];
  if (text.includes('pasta') || text.includes('pizza')) return ['italiska'];
  return ['lietuviska']; // Default
}

function extractMealType(recipe) {
  const existing = recipe.filters?.mealType;
  if (existing) return [existing];

  const text = ((recipe.title?.lt || recipe.title || '') + ' ' + (recipe.description?.lt || recipe.description || '')).toLowerCase();
  if (text.includes('sumuštiniai') || text.includes('sandwich')) return ['sumustiniai'];
  if (text.includes('desertas') || text.includes('tortas')) return ['desertai'];
  if (text.includes('užkandis')) return ['uzkandžiai'];
  return ['pietus']; // Default
}

function extractDietary(recipe) {
  const existing = recipe.filters?.dietary || [];
  if (existing.length > 0) return existing;

  const text = ((recipe.title?.lt || recipe.title || '') + ' ' + (recipe.description?.lt || recipe.description || '')).toLowerCase();
  const dietary = [];
  if (text.includes('vegetar')) dietary.push('vegetariski');
  if (text.includes('vegan')) dietary.push('veganiski');
  if (text.includes('be glitimo')) dietary.push('be-glitimo');
  return dietary;
}

function extractMainIngredients(recipe) {
  const ingredients = recipe.ingredients || [];
  const mainIngredients = [];

  ingredients.forEach(ingredient => {
    const name = (ingredient.name?.lt || ingredient.name || '').toLowerCase();
    if (name.includes('višt') || name.includes('chicken')) mainIngredients.push('vistiena');
    if (name.includes('jaut') || name.includes('beef')) mainIngredients.push('jautiena');
    if (name.includes('žuv') || name.includes('fish') || name.includes('lašiš')) mainIngredients.push('zuvis');
    if (name.includes('gryb') || name.includes('mushroom')) mainIngredients.push('grybai');
  });

  return mainIngredients.length > 0 ? [...new Set(mainIngredients)] : ['daržoves'];
}

function getTimeRange(totalMinutes) {
  if (totalMinutes <= 15) return '15min';
  if (totalMinutes <= 30) return '30min';
  if (totalMinutes <= 60) return '1h';
  return '2h';
}

function extractCustomTags(recipe) {
  const tags = [];
  const text = ((recipe.title?.lt || recipe.title || '') + ' ' + (recipe.description?.lt || recipe.description || '')).toLowerCase();

  if (text.includes('švent') || text.includes('kalėd')) tags.push('šventėms');
  if (text.includes('vaik') || text.includes('kid')) tags.push('vaikams');
  if (text.includes('tradicin') || text.includes('traditional')) tags.push('tradicinis');
  if ((recipe.totalTimeMinutes || 30) <= 20) tags.push('greitas');

  return tags;
}

// 4. Create optimized indexes for lightning-fast filtering
print("🔍 Creating optimized compound indexes...");

// Drop old indexes that might conflict
try {
  db.recipes.dropIndex("recipes_filters");
  db.recipes.dropIndex("recipes_enhanced_filters_1");
  db.recipes.dropIndex("recipes_enhanced_filters_2");
  db.recipes.dropIndex("recipes_enhanced_filters_3");
} catch (e) {
  // Indexes might not exist
}

// PRIMARY COMPOUND INDEXES for instant filtering
// Index 1: Main category + time filtering (most common use case)
db.recipes.createIndex({
  "status": 1,
  "categories.mealType": 1,
  "categories.mainIngredient": 1,
  "timing.totalTimeMinutes": 1,
  "rating.average": -1
}, {
  name: "recipes_category_time_rating",
  background: true
});

// Index 2: Dietary + cuisine filtering
db.recipes.createIndex({
  "status": 1,
  "categories.dietary": 1,
  "categories.cuisine": 1,
  "timing.totalTimeMinutes": 1
}, {
  name: "recipes_dietary_cuisine_time",
  background: true
});

// Index 3: Time-based filtering (very common)
db.recipes.createIndex({
  "status": 1,
  "categories.timeRequired": 1,
  "categories.mealType": 1,
  "rating.average": -1,
  "createdAt": -1
}, {
  name: "recipes_time_meal_rating",
  background: true
});

// Index 4: Custom tags + main ingredient
db.recipes.createIndex({
  "status": 1,
  "categories.customTags": 1,
  "categories.mainIngredient": 1,
  "timing.totalTimeMinutes": 1
}, {
  name: "recipes_tags_ingredient_time",
  background: true
});

// Index 5: SEO-friendly slug index
db.recipes.createIndex({
  "slug": 1
}, {
  name: "recipes_slug_unique",
  unique: true,
  background: true
});

// Index 6: Full-text search index for recipe search
db.recipes.createIndex({
  "title.lt": "text",
  "title.en": "text",
  "description.lt": "text",
  "description.en": "text"
}, {
  name: "recipes_fulltext_search",
  background: true,
  weights: {
    "title.lt": 10,
    "title.en": 8,
    "description.lt": 5,
    "description.en": 3
  }
});

print("✅ Created 6 optimized compound indexes");

// 5. Create indexes for supporting collections
print("🔍 Creating indexes for supporting collections...");

// Page configs indexes
db.page_configs.createIndex({ slug: 1 }, { unique: true, background: true });
db.page_configs.createIndex({ category: 1, categoryValue: 1, active: 1 }, { background: true });

// Filter definitions indexes
db.filter_definitions.createIndex({ type: 1, active: 1, order: 1 }, { background: true });
db.filter_definitions.createIndex({ key: 1 }, { unique: true, background: true });

// Groups and categories (existing collections)
db.groups.createIndex({ slug: 1 }, { background: true });
db.categories.createIndex({ type: 1, active: 1 }, { background: true });

print("✅ Created indexes for supporting collections");

print("");
print("🎯 Enhanced filtering system setup complete!");
print("");
print("📊 Summary:");
print(`   - Page configurations: ${pageConfigs.length}`);
print(`   - Filter definitions: ${filterDefinitions.length}`);
print(`   - Updated recipes: ${updatedCount}`);
print(`   - Optimized indexes: 10 total`);
print("");
print("⚡ Expected Performance:");
print("   - Category page load: <50ms");
print("   - Filter switching: <20ms");
print("   - Search queries: <100ms");
print("");
print("🚀 Next steps:");
print("   1. Create API endpoints for category pages");
print("   2. Build pill-shaped filter UI components");
print("   3. Implement infinite scroll pagination");
print("   4. Test filtering performance");
