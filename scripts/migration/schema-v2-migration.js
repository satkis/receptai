// Migration Script: Update to Schema V2 with Multiple Categories
// Run: node scripts/migration/schema-v2-migration.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Time category calculation
function calculateTimeCategory(totalTimeMinutes) {
  if (totalTimeMinutes <= 30) return "iki-30-min";
  if (totalTimeMinutes <= 60) return "30-60-min";
  if (totalTimeMinutes <= 120) return "1-2-val";
  return "virs-2-val";
}

// Convert Lithuanian characters to URL-safe slugs
function lithuanianToSlug(text) {
  const lithuanianMap = {
    'ą': 'a', 'Ą': 'A', 'č': 'c', 'Č': 'C', 'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E', 'į': 'i', 'Į': 'I', 'š': 's', 'Š': 'S',
    'ų': 'u', 'Ų': 'U', 'ū': 'u', 'Ū': 'U', 'ž': 'z', 'Ž': 'Z'
  };

  return text
    .split('')
    .map(char => lithuanianMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Category structure based on your requirements
const categoryStructure = [
  {
    name: "Patiekalo tipas",
    slug: "patiekalo-tipas",
    subcategories: [
      "Karšti patiekalai", "Kepsniai ir karbonadai", "Troškiniai", "Apkepai",
      "Košės ir tyrės", "Sriubos", "Klasikinės sriubos", "Vištienos sriuba",
      "Daržovių sriubos", "Rūgštynių sriuba", "Užkandžiai", "Vieno kąsnio užkandžiai",
      "Užkandžiai prie alaus", "Sumuštiniai", "Garnyrai", "Bulvių garnyrai",
      "Ryžiai, grikiai", "Makaronai", "Salotos ir mišrainės", "Vištienos salotos",
      "Jautienos salotos", "Daržovių salotos", "Picos", "Blynai ir vafliai",
      "Kremai ir padažai", "Konservuoti patiekalai"
    ]
  },
  {
    name: "Pagal pagrindinį ingredientą",
    slug: "pagal-pagrindini-ingredienta",
    subcategories: [
      "Vištienos patiekalai", "Vištienos salotos", "Jautienos patiekalai",
      "Troškiniai iš jautienos", "Kiaulienos patiekalai", "Kepsniai / kotletai",
      "Žuvies patiekalai", "Receptai su lašiša", "Receptai su silke",
      "Jūros gėrybių patiekalai", "Paukštiena", "Aviena / Veršiena / Žvėriena",
      "Grybai", "Daržovių troškiniai", "Bulvės", "Kiaušiniai ir pieno produktai",
      "Miltai ir kruopos", "Soja", "Vaisiai ir uogos", "Riešutai",
      "Šokoladas", "Makaronai"
    ]
  },
  {
    name: "Saldumynai ir kepiniai",
    slug: "saldumynai-ir-kepiniai",
    subcategories: [
      "Desertai", "Pyragai", "Obuolių pyragai", "Šokoladiniai pyragai",
      "Kekai / keksiukai", "Tortai", "Saldūs apkepai", "Sausainiai", "Naminiai ledai"
    ]
  },
  {
    name: "Mitybos pasirinkimai / Dietiniai",
    slug: "mitybos-pasirinkimai-dietiniai",
    subcategories: [
      "Sveiki patiekalai", "Be glitimo", "Be laktozės", "Keto receptai",
      "Vegetariški patiekalai", "Veganiški receptai"
    ]
  },
  {
    name: "Vaikiški patiekalai",
    slug: "vaikiskiai-patiekalai",
    subcategories: ["Maistas vaikams", "Patrauklūs receptai šeimai"]
  },
  {
    name: "Pagal laiką",
    slug: "pagal-laika",
    subcategories: [
      "iki 30 min.", "30–60 min.", "1–2 val.", "virš 2 val.",
      "Lėti troškiniai", "Savaitgalio patiekalai"
    ]
  },
  {
    name: "Proga",
    slug: "proga",
    subcategories: [
      "Gimtadieniui", "Velykoms", "Kalėdoms", "Kūčioms", "Naujiesiems metams",
      "Valentino dienai", "Mamos dienai", "Tėvo dienai", "Joninėms",
      "Užgavėnėms", "Helovinui", "Vestuvėms", "Pyragų dienai", "Iškylai"
    ]
  },
  {
    name: "Pasaulio virtuvė",
    slug: "pasaulio-virtuve",
    subcategories: [
      "Lietuvos virtuvė", "Italijos virtuvė", "Ispanijos virtuvė", "Prancūzijos virtuvė",
      "Amerikos virtuvė", "Meksikos virtuvė", "Indijos virtuvė", "Kinijos virtuvė",
      "Japonijos virtuvė", "Tailando virtuvė", "Graikijos virtuvė", "Turkijos virtuvė",
      "Vokietijos virtuvė", "Rusijos virtuvė", "Ukrainos virtuvė", "Lenkijos virtuvė",
      "Latvijos virtuvė", "Čekijos virtuvė", "Skandinavijos virtuvės"
    ]
  },
  {
    name: "Gėrimai",
    slug: "gerimai",
    subcategories: [
      "Nealkoholiniai gėrimai", "Kava / arbata", "Alkoholiniai kokteiliai",
      "Degtinės kokteiliai", "Romo kokteiliai", "Brendžio kokteiliai",
      "Džino kokteiliai", "Tekilos kokteiliai", "Šampano kokteiliai"
    ]
  },
  {
    name: "Papildoma",
    slug: "papildoma",
    subcategories: [
      "Padažai ir užpilai",
      "Konservavimas (marinatai, uogienės, atsargos žiemai)"
    ]
  }
];

async function migrateToSchemaV2() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Starting Schema V2 Migration...');
    
    // Step 1: Create new category structure
    console.log('📁 Step 1: Creating new category structure...');
    await createNewCategories(db);
    
    // Step 2: Update existing recipes
    console.log('📝 Step 2: Updating existing recipes...');
    await updateRecipes(db);
    
    // Step 3: Create performance indexes
    console.log('⚡ Step 3: Creating performance indexes...');
    await createIndexes(db);
    
    // Step 4: Update category recipe counts
    console.log('🔢 Step 4: Updating category recipe counts...');
    await updateCategoryCounts(db);
    
    console.log('✅ Schema V2 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

async function createNewCategories(db) {
  const categories = [];
  
  // Create main categories and subcategories
  for (const mainCategory of categoryStructure) {
    // Create main category
    const mainCategoryDoc = {
      title: { lt: mainCategory.name, en: mainCategory.name },
      slug: mainCategory.slug,
      parentCategory: null,
      parentSlug: null,
      level: 1,
      path: mainCategory.slug,
      fullPath: [mainCategory.slug],
      parentId: null,
      ancestors: [],
      description: { lt: `${mainCategory.name} receptai`, en: `${mainCategory.name} recipes` },
      icon: getIconForCategory(mainCategory.name),
      recipeCount: 0,
      availableTimeFilters: [],
      seo: {
        metaTitle: `${mainCategory.name} receptai - Paragaujam.lt`,
        metaDescription: `Geriausi ${mainCategory.name.toLowerCase()} receptai su nuotraukomis ir instrukcijomis.`,
        keywords: [mainCategory.name.toLowerCase(), "receptai", "lietuviški"]
      },
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mainResult = await db.collection('categories_new').insertOne(mainCategoryDoc);
    categories.push({ ...mainCategoryDoc, _id: mainResult.insertedId });
    
    // Create subcategories
    for (let i = 0; i < mainCategory.subcategories.length; i++) {
      const subcategoryName = mainCategory.subcategories[i];
      const subcategorySlug = lithuanianToSlug(subcategoryName);
      
      const subcategoryDoc = {
        title: { lt: subcategoryName, en: subcategoryName },
        slug: subcategorySlug,
        parentCategory: mainCategory.name,
        parentSlug: mainCategory.slug,
        level: 2,
        path: `${mainCategory.slug}/${subcategorySlug}`,
        fullPath: [mainCategory.slug, subcategorySlug],
        parentId: mainResult.insertedId,
        ancestors: [{
          _id: mainResult.insertedId,
          title: mainCategory.name,
          slug: mainCategory.slug,
          level: 1,
          path: mainCategory.slug
        }],
        description: { lt: `${subcategoryName} receptai`, en: `${subcategoryName} recipes` },
        icon: getIconForSubcategory(subcategoryName),
        recipeCount: 0,
        availableTimeFilters: [
          { value: "iki-30-min", label: "iki 30 min.", count: 0 },
          { value: "30-60-min", label: "30–60 min.", count: 0 },
          { value: "1-2-val", label: "1–2 val.", count: 0 },
          { value: "virs-2-val", label: "virš 2 val.", count: 0 }
        ],
        seo: {
          metaTitle: `${subcategoryName} receptai - Paragaujam.lt`,
          metaDescription: `Geriausi ${subcategoryName.toLowerCase()} receptai su nuotraukomis ir instrukcijomis.`,
          keywords: [subcategoryName.toLowerCase(), "receptai", mainCategory.name.toLowerCase()]
        },
        isActive: true,
        sortOrder: i + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('categories_new').insertOne(subcategoryDoc);
    }
  }
  
  console.log(`✅ Created ${categories.length} main categories and their subcategories`);
}

async function updateRecipes(db) {
  const recipes = await db.collection('recipes_new').find({}).toArray();
  
  for (const recipe of recipes) {
    const updates = {};
    
    // Calculate time category
    const timeCategory = calculateTimeCategory(recipe.totalTimeMinutes);
    updates.timeCategory = timeCategory;
    
    // Set primary category (keep existing categoryPath as primary)
    if (recipe.categoryPath) {
      updates.primaryCategoryPath = recipe.categoryPath;
      updates.primaryCategoryId = recipe.categoryIds?.[0] || null;
      
      // Initialize allCategories with primary category
      updates.allCategories = [recipe.categoryPath];
      updates.allCategoryIds = recipe.categoryIds || [];
      
      // Update breadcrumbs URLs (remove /receptu-tipai)
      if (recipe.breadcrumbs) {
        updates.breadcrumbs = recipe.breadcrumbs.map(crumb => ({
          ...crumb,
          url: crumb.url.replace('/receptu-tipai/', '/')
        }));
      }
    }
    
    // Apply updates
    if (Object.keys(updates).length > 0) {
      await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        { $set: updates }
      );
    }
  }
  
  console.log(`✅ Updated ${recipes.length} recipes with new schema`);
}

async function createIndexes(db) {
  const indexes = [
    // Performance-critical compound indexes
    { "allCategories": 1, "timeCategory": 1, "publishedAt": -1 },
    { "allCategories": 1, "rating.average": -1 },
    { "tags": 1, "timeCategory": 1, "publishedAt": -1 },
    { "primaryCategoryPath": 1, "publishedAt": -1 },
    { "timeCategory": 1, "publishedAt": -1 }
  ];
  
  for (const index of indexes) {
    try {
      await db.collection('recipes_new').createIndex(index);
      console.log(`✅ Created index: ${JSON.stringify(index)}`);
    } catch (error) {
      console.log(`⚠️ Index already exists: ${JSON.stringify(index)}`);
    }
  }
}

async function updateCategoryCounts(db) {
  const categories = await db.collection('categories_new').find({}).toArray();
  
  for (const category of categories) {
    const recipeCount = await db.collection('recipes_new').countDocuments({
      allCategories: category.path
    });
    
    // Update time filter counts
    const timeFilterCounts = await Promise.all([
      db.collection('recipes_new').countDocuments({ allCategories: category.path, timeCategory: "iki-30-min" }),
      db.collection('recipes_new').countDocuments({ allCategories: category.path, timeCategory: "30-60-min" }),
      db.collection('recipes_new').countDocuments({ allCategories: category.path, timeCategory: "1-2-val" }),
      db.collection('recipes_new').countDocuments({ allCategories: category.path, timeCategory: "virs-2-val" })
    ]);
    
    const availableTimeFilters = [
      { value: "iki-30-min", label: "iki 30 min.", count: timeFilterCounts[0] },
      { value: "30-60-min", label: "30–60 min.", count: timeFilterCounts[1] },
      { value: "1-2-val", label: "1–2 val.", count: timeFilterCounts[2] },
      { value: "virs-2-val", label: "virš 2 val.", count: timeFilterCounts[3] }
    ];
    
    await db.collection('categories_new').updateOne(
      { _id: category._id },
      { 
        $set: { 
          recipeCount,
          availableTimeFilters,
          updatedAt: new Date()
        }
      }
    );
  }
  
  console.log(`✅ Updated recipe counts for ${categories.length} categories`);
}

// Helper functions
function getIconForCategory(categoryName) {
  const icons = {
    "Patiekalo tipas": "🍽️",
    "Pagal pagrindinį ingredientą": "🥘",
    "Saldumynai ir kepiniai": "🧁",
    "Mitybos pasirinkimai / Dietiniai": "🥗",
    "Vaikiški patiekalai": "👶",
    "Pagal laiką": "⏰",
    "Proga": "🎉",
    "Pasaulio virtuvė": "🌍",
    "Gėrimai": "🥤",
    "Papildoma": "📝"
  };
  return icons[categoryName] || "🍴";
}

function getIconForSubcategory(subcategoryName) {
  const icons = {
    "Karšti patiekalai": "🔥",
    "Vištienos patiekalai": "🍗",
    "Jautienos patiekalai": "🥩",
    "Sriubos": "🍲",
    "Desertai": "🍰",
    "Sveiki patiekalai": "🥗",
    "Maistas vaikams": "👶",
    "iki 30 min.": "⚡",
    "Gimtadieniui": "🎂",
    "Lietuvos virtuvė": "🇱🇹",
    "Nealkoholiniai gėrimai": "🥤"
  };
  return icons[subcategoryName] || "🍴";
}

// Run migration
if (require.main === module) {
  migrateToSchemaV2();
}

module.exports = { migrateToSchemaV2, calculateTimeCategory, lithuanianToSlug };
