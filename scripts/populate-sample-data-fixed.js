// Fixed Sample Data Population Script
// Run this in MongoDB Compass shell after fixing the index

// 1. Fix the text index first
db.recipes.dropIndex("recipes_seo_search");

db.recipes.createIndex(
  {
    "title.lt": "text",
    "description.lt": "text"
  },
  {
    name: "recipes_text_search_fixed",
    background: true,
    weights: {
      "title.lt": 10,
      "description.lt": 5
    }
  }
);

// 2. Clear existing data
db.categories.deleteMany({});
db.groups.deleteMany({});
db.recipes.deleteMany({});

// 3. Create categories
db.categories.insertMany([
  {
    slug: "karsti-patiekalai",
    title: "Karšti patiekalai",
    description: "Šilti ir sotūs patiekalai visai šeimai",
    image: "/images/categories/karsti-patiekalai.jpg",
    icon: "🍽️",
    order: 1,
    status: "active",
    subcategories: [
      {
        slug: "apkepai",
        title: "Apkepai",
        description: "Sultingi ir aromatingi apkepai orkaitėje",
        image: "/images/subcategories/apkepai.jpg",
        recipeCount: 0
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "saldumynai",
    title: "Saldumynai",
    description: "Skanūs desertai ir saldumynai visoms progoms",
    image: "/images/categories/saldumynai.jpg",
    icon: "🍰",
    order: 2,
    status: "active",
    subcategories: [
      {
        slug: "tortai",
        title: "Tortai",
        description: "Iškilmingi tortai šventėms ir progoms",
        image: "/images/subcategories/tortai.jpg",
        recipeCount: 0
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 4. Create groups
db.groups.insertMany([
  {
    slug: "30-minuciu-patiekalai",
    label: {
      lt: "30 minučių patiekalai",
      en: "30-minute meals"
    },
    icon: "⏰",
    color: "#10B981",
    priority: 1,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "vegetariski-patiekalai",
    label: {
      lt: "Vegetariški patiekalai",
      en: "Vegetarian dishes"
    },
    icon: "🥬",
    color: "#059669",
    priority: 2,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 5. Create sample recipes
db.recipes.insertOne({
  slug: "bulviu-kugelis-tradicinis",
  title: {
    lt: "Bulvių kugelis tradicinis",
    en: "Traditional Potato Pudding"
  },
  description: {
    lt: "Tradicinis lietuviškas bulvių kugelis su spirgučiais ir grietine. Šeimos receptas perduodamas iš kartos į kartą.",
    en: "Traditional Lithuanian potato pudding with cracklings and sour cream. Family recipe passed down through generations."
  },
  language: "lt",
  
  // SEO Fields - keywords as array is fine for non-text-indexed field
  seo: {
    metaTitle: "Bulvių kugelis tradicinis - Receptas | Paragaujam.lt",
    metaDescription: "Tradicinis lietuviškas bulvių kugelis su spirgučiais ir grietine. Gaminimo laikas: 90 min. Porcijų: 8.",
    keywords: ["bulvių kugelis", "tradicinis receptas", "lietuviškas kugelis", "bulvės", "spirgučiai"],
    canonicalUrl: "/receptai/karsti-patiekalai/apkepai/bulviu-kugelis-tradicinis",
    lastModified: new Date()
  },
  
  // Schema.org structured data
  schemaOrg: {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "Bulvių kugelis tradicinis",
    description: "Tradicinis lietuviškas bulvių kugelis su spirgučiais ir grietine",
    image: ["/images/bulviu-kugelis.jpg"],
    author: {
      "@type": "Organization",
      name: "Paragaujam.lt"
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    prepTime: "PT30M",
    cookTime: "PT60M",
    totalTime: "PT90M",
    recipeCategory: "Pagrindinis patiekalas",
    recipeCuisine: "Lietuviška",
    recipeYield: "8 porcijos"
  },
  
  // URL structure
  categoryPath: "karsti-patiekalai/apkepai",
  breadcrumb: {
    main: {
      slug: "karsti-patiekalai",
      label: "Karšti patiekalai"
    },
    sub: {
      slug: "apkepai", 
      label: "Apkepai"
    }
  },
  
  // Recipe details
  servings: 8,
  servingsUnit: "porcijos",
  
  ingredients: [
    {
      name: { lt: "Bulvės", en: "Potatoes" },
      quantity: "2 kg",
      vital: true
    },
    {
      name: { lt: "Spirgučiai", en: "Cracklings" },
      quantity: "200g",
      vital: true
    },
    {
      name: { lt: "Kiaušiniai", en: "Eggs" },
      quantity: "3 vnt",
      vital: true
    },
    {
      name: { lt: "Grietinė", en: "Sour cream" },
      quantity: "200ml",
      vital: false
    }
  ],
  
  instructions: [
    {
      step: 1,
      description: {
        lt: "Nulupkite bulves ir smulkiai sutarkuokite stambiuoju tarkuotoju.",
        en: "Peel potatoes and grate finely with a coarse grater."
      }
    },
    {
      step: 2,
      description: {
        lt: "Išspauskite sultis iš sutarkuotų bulvių ir sumaišykite su kiaušiniais.",
        en: "Squeeze juice from grated potatoes and mix with eggs."
      }
    },
    {
      step: 3,
      description: {
        lt: "Pridėkite spirgučius, druską ir pipirus. Gerai išmaišykite.",
        en: "Add cracklings, salt and pepper. Mix well."
      }
    },
    {
      step: 4,
      description: {
        lt: "Išdėkite masę į išteptą kepimo formą ir kepkite 180°C orkaitėje 60 minučių.",
        en: "Place mixture in greased baking dish and bake at 180°C for 60 minutes."
      }
    }
  ],
  
  // Timing
  prepTimeMinutes: 30,
  cookTimeMinutes: 60,
  totalTimeMinutes: 90,
  
  // Categories
  categories: {
    cuisine: "Lietuviška",
    dietary: [],
    timeRequired: "apie 2 val"
  },
  
  // Groups
  groupIds: [],
  groupLabels: [],
  
  // Media
  image: "/images/bulviu-kugelis.jpg",
  
  // Ratings and engagement
  rating: {
    average: 4.8,
    count: 24
  },
  commentsCount: 8,
  
  // Performance metrics
  performance: {
    views: 1250,
    shares: 45,
    saves: 89
  },
  
  // Status
  status: "published",
  featured: true,
  trending: false,
  
  // Author
  author: {
    userId: null,
    name: "Paragaujam.lt",
    profileUrl: "/user/system"
  },
  
  // Nutrition
  nutrition: {
    calories: 320,
    fat: 18,
    protein: 8,
    carbs: 35
  },
  
  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date()
});

// 6. Add second recipe
db.recipes.insertOne({
  slug: "cepelinai-su-mesa",
  title: {
    lt: "Cepelinai su mėsa",
    en: "Potato Dumplings with Meat"
  },
  description: {
    lt: "Tradiciniai lietuviški cepelinai su mėsos įdaru ir spirgučių padažu.",
    en: "Traditional Lithuanian potato dumplings with meat filling."
  },
  language: "lt",
  
  seo: {
    metaTitle: "Cepelinai su mėsa - Tradicinis receptas | Paragaujam.lt",
    metaDescription: "Tradiciniai lietuviški cepelinai su mėsos įdaru. Gaminimo laikas: 60 min. Porcijų: 4.",
    keywords: ["cepelinai", "didžkukuliai", "lietuviškas receptas", "mėsos įdaras"],
    canonicalUrl: "/receptai/karsti-patiekalai/apkepai/cepelinai-su-mesa",
    lastModified: new Date()
  },
  
  schemaOrg: {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "Cepelinai su mėsa",
    description: "Tradiciniai lietuviški cepelinai su mėsos įdaru",
    totalTime: "PT60M",
    recipeCategory: "Pagrindinis patiekalas",
    recipeCuisine: "Lietuviška",
    recipeYield: "4 porcijos"
  },
  
  categoryPath: "karsti-patiekalai/apkepai",
  breadcrumb: {
    main: { slug: "karsti-patiekalai", label: "Karšti patiekalai" },
    sub: { slug: "apkepai", label: "Apkepai" }
  },
  
  servings: 4,
  totalTimeMinutes: 60,
  
  ingredients: [
    { name: { lt: "Bulvės", en: "Potatoes" }, quantity: "1.5 kg", vital: true },
    { name: { lt: "Kiaulienos mėsa", en: "Pork meat" }, quantity: "300g", vital: true },
    { name: { lt: "Svogūnas", en: "Onion" }, quantity: "1 vnt", vital: true }
  ],
  
  instructions: [
    { step: 1, description: { lt: "Sutarkuokite bulves ir išspauskite sultis.", en: "Grate potatoes and squeeze out juice." } },
    { step: 2, description: { lt: "Paruoškite mėsos įdarą su svogūnais.", en: "Prepare meat filling with onions." } },
    { step: 3, description: { lt: "Suformuokite cepelinų formos koldūnus.", en: "Shape into zeppelin-like dumplings." } },
    { step: 4, description: { lt: "Virkite sūdytame vandenyje 20-25 minutes.", en: "Boil in salted water for 20-25 minutes." } }
  ],
  
  categories: {
    cuisine: "Lietuviška",
    dietary: [],
    timeRequired: "iki 1val"
  },
  
  groupIds: [],
  groupLabels: [],
  
  image: "/images/cepelinai.jpg",
  rating: { average: 4.9, count: 156 },
  
  performance: {
    views: 2340,
    shares: 78,
    saves: 234
  },
  
  status: "published",
  featured: true,
  trending: true,
  
  author: { name: "Paragaujam.lt", profileUrl: "/user/system" },
  
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date()
});

// 7. Update category recipe counts
db.categories.updateOne(
  { slug: "karsti-patiekalai", "subcategories.slug": "apkepai" },
  { $set: { "subcategories.$.recipeCount": 2 } }
);

// 8. Show results
print("✅ Fixed sample data populated successfully!");
print("📊 Categories:", db.categories.countDocuments());
print("🏷️ Groups:", db.groups.countDocuments());
print("📝 Recipes:", db.recipes.countDocuments());
print("🔍 Recipes with SEO:", db.recipes.countDocuments({ "seo.metaTitle": { $ne: "" } }));

// Verify one recipe
var recipe = db.recipes.findOne({}, { title: 1, seo: 1, categoryPath: 1 });
print("📋 Sample recipe created:", recipe ? "YES" : "NO");
if (recipe) {
  print("   Title:", recipe.title.lt);
  print("   SEO Title:", recipe.seo.metaTitle);
  print("   Category Path:", recipe.categoryPath);
}
