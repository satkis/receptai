// Enhanced Database Schema Migration for SEO-Optimized Recipe Website
// Run with: mongosh receptai < database-migration-v2.js

// Switch to receptai database
use('receptai');

print("🚀 Starting Database Schema Migration v2.0...");
print("📊 Current collections:", db.getCollectionNames());

// Backup existing data before migration
print("\n📦 Creating backup collections...");
if (db.recipes.countDocuments() > 0) {
  db.recipes.aggregate([{ $out: "recipes_backup_" + new Date().toISOString().split('T')[0] }]);
  print("✅ Recipes backed up");
}

if (db.categories.countDocuments() > 0) {
  db.categories.aggregate([{ $out: "categories_backup_" + new Date().toISOString().split('T')[0] }]);
  print("✅ Categories backed up");
}

if (db.groups.countDocuments() > 0) {
  db.groups.aggregate([{ $out: "groups_backup_" + new Date().toISOString().split('T')[0] }]);
  print("✅ Groups backed up");
}

// 1. ENHANCED RECIPES COLLECTION SCHEMA
print("\n🍲 Migrating recipes collection...");

// Add SEO fields to existing recipes
db.recipes.updateMany(
  { seo: { $exists: false } },
  {
    $set: {
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        canonicalUrl: "",
        breadcrumbSchema: null,
        lastModified: new Date()
      },
      schemaOrg: {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: "",
        description: "",
        image: [],
        author: {
          "@type": "Organization",
          name: "Paragaujam.lt"
        },
        datePublished: new Date(),
        dateModified: new Date()
      },
      performance: {
        views: 0,
        shares: 0,
        saves: 0,
        avgTimeOnPage: 0,
        bounceRate: 0
      },
      status: "published",
      publishedAt: new Date(),
      featured: false,
      trending: false,
      seasonal: [],
      difficulty: "vidutinis"
    }
  }
);

// Add categoryPath for URL structure
db.recipes.updateMany(
  { categoryPath: { $exists: false } },
  [
    {
      $set: {
        categoryPath: {
          $concat: [
            { $ifNull: ["$breadcrumb.main.slug", "karsti-patiekalai"] },
            "/",
            { $ifNull: ["$breadcrumb.sub.slug", "apkepai"] }
          ]
        }
      }
    }
  ]
);

// Ensure all recipes have proper multilingual structure
db.recipes.updateMany(
  { "title.lt": { $exists: false } },
  [
    {
      $set: {
        title: {
          $cond: {
            if: { $type: "$title" },
            then: {
              lt: { $ifNull: ["$title", "Receptas"] },
              en: { $ifNull: ["$title", "Recipe"] }
            },
            else: "$title"
          }
        },
        description: {
          $cond: {
            if: { $type: "$description" },
            then: {
              lt: { $ifNull: ["$description", "Receptas aprašymas"] },
              en: { $ifNull: ["$description", "Recipe description"] }
            },
            else: "$description"
          }
        }
      }
    }
  ]
);

print("✅ Recipes collection migrated");

// 2. ENHANCED CATEGORIES COLLECTION
print("\n📂 Creating enhanced categories collection...");

// Drop and recreate categories with hierarchical structure
db.categories.drop();
db.categories.insertMany([
  {
    slug: "karsti-patiekalai",
    title: "Karšti patiekalai",
    description: "Šilti ir sotūs patiekalai visai šeimai",
    image: "/images/categories/karsti-patiekalai.jpg",
    icon: "🍽️",
    order: 1,
    status: "active",
    seo: {
      metaTitle: "Karštų patiekalų receptai - Paragaujam.lt",
      metaDescription: "Atraskite geriausius karštų patiekalų receptus. Šilti ir sotūs patiekalai visai šeimai su detaliais gaminimo instrukcijomis.",
      keywords: ["karšti patiekalai", "šilti receptai", "pagrindiniai patiekalai", "lietuviški receptai"]
    },
    subcategories: [
      {
        slug: "apkepai",
        title: "Apkepai",
        description: "Sultingi ir aromatingi apkepai orkaitėje",
        image: "/images/subcategories/apkepai.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Apkepų receptai - Karšti patiekalai | Paragaujam.lt",
          metaDescription: "Sultingi ir aromatingi apkepų receptai orkaitėje. Mėsos, žuvies ir daržovių apkepai su detaliais gaminimo instrukcijomis.",
          keywords: ["apkepai", "orkaitės receptai", "mėsos apkepai", "žuvies apkepai"]
        }
      },
      {
        slug: "trokiniai",
        title: "Troškinti patiekalai",
        description: "Lėtai troškinti patiekalai su daug skonio",
        image: "/images/subcategories/trokiniai.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Troškintų patiekalų receptai | Paragaujam.lt",
          metaDescription: "Lėtai troškinti patiekalai su daug skonio. Mėsos, daržovių ir kombinuoti troškinti receptai.",
          keywords: ["troškinti patiekalai", "lėtas gaminimas", "troškinta mėsa", "troškinti receptai"]
        }
      },
      {
        slug: "kepsniai",
        title: "Kepsniai",
        description: "Traškūs ir sultingi kepsniai keptuvėje",
        image: "/images/subcategories/kepsniai.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Kepsnių receptai - Traškūs ir sultingi | Paragaujam.lt",
          metaDescription: "Traškūs ir sultingi kepsnių receptai keptuvėje. Mėsos, žuvies ir daržovių kepsniai su gaminimo patarimais.",
          keywords: ["kepsniai", "keptuvės receptai", "traškūs kepsniai", "sultingi kepsniai"]
        }
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
    seo: {
      metaTitle: "Saldumynų receptai - Desertai | Paragaujam.lt",
      metaDescription: "Skanūs saldumynų ir desertų receptai visoms progoms. Tortai, pyragai, sausainiai ir kiti saldūs receptai.",
      keywords: ["saldumynai", "desertai", "tortai", "pyragai", "sausainiai", "saldūs receptai"]
    },
    subcategories: [
      {
        slug: "tortai",
        title: "Tortai",
        description: "Iškilmingi tortai šventėms ir progoms",
        image: "/images/subcategories/tortai.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Tortų receptai - Iškilmingi tortai | Paragaujam.lt",
          metaDescription: "Iškilmingi tortų receptai šventėms ir progoms. Gimtadienio tortai, vestuvių tortai ir kasdieniai desertai.",
          keywords: ["tortai", "gimtadienio tortai", "vestuvių tortai", "šventiniai tortai"]
        }
      },
      {
        slug: "pyragai",
        title: "Pyragai",
        description: "Namie kepti pyragai su įvairiais įdarais",
        image: "/images/subcategories/pyragai.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Pyragų receptai - Namie kepti | Paragaujam.lt",
          metaDescription: "Namie keptų pyragų receptai su įvairiais įdarais. Vaisių pyragai, mėsos pyragai ir saldūs kepiniai.",
          keywords: ["pyragai", "namie kepti pyragai", "vaisių pyragai", "kepiniai"]
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "sriubos",
    title: "Sriubos",
    description: "Šiltos ir maistingos sriubos kiekvienai dienai",
    image: "/images/categories/sriubos.jpg",
    icon: "🍲",
    order: 3,
    status: "active",
    seo: {
      metaTitle: "Sriubų receptai - Šiltos ir maistingos | Paragaujam.lt",
      metaDescription: "Šiltos ir maistingos sriubų receptai kiekvienai dienai. Daržovių, mėsos ir žuvies sriubos su gaminimo instrukcijomis.",
      keywords: ["sriubos", "šiltos sriubos", "daržovių sriubos", "mėsos sriubos", "žuvies sriubos"]
    },
    subcategories: [
      {
        slug: "darzeoviu-sriubos",
        title: "Daržovių sriubos",
        description: "Sveikos ir spalvingos daržovių sriubos",
        image: "/images/subcategories/darzeoviu-sriubos.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Daržovių sriubų receptai - Sveikos ir spalvingos | Paragaujam.lt",
          metaDescription: "Sveikos ir spalvingos daržovių sriubų receptai. Sezoninės daržovės, kreminės sriubos ir lengvi receptai.",
          keywords: ["daržovių sriubos", "sveikos sriubos", "sezoninės sriubos", "kreminės sriubos"]
        }
      },
      {
        slug: "mesos-sriubos",
        title: "Mėsos sriubos",
        description: "Sotūs ir maistingi mėsos sriubų receptai",
        image: "/images/subcategories/mesos-sriubos.jpg",
        recipeCount: 0,
        seo: {
          metaTitle: "Mėsos sriubų receptai - Sotūs ir maistingi | Paragaujam.lt",
          metaDescription: "Sotūs ir maistingi mėsos sriubų receptai. Jautienos, kiaulienos ir vištienos sriubos su daržovėmis.",
          keywords: ["mėsos sriubos", "jautienos sriubos", "vištienos sriubos", "sotūs receptai"]
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Enhanced categories created");

// 3. ENHANCED GROUPS COLLECTION
print("\n🏷️ Creating enhanced groups collection...");

db.groups.drop();
db.groups.insertMany([
  {
    slug: "30-minuciu-patiekalai",
    label: {
      lt: "30 minučių patiekalai",
      en: "30-minute meals"
    },
    description: {
      lt: "Greiti ir skanūs patiekalai užimtiems žmonėms",
      en: "Quick and delicious meals for busy people"
    },
    icon: "⏰",
    color: "#10B981",
    priority: 1,
    status: "active",
    seo: {
      metaTitle: "30 minučių patiekalų receptai - Greiti receptai | Paragaujam.lt",
      metaDescription: "Greiti ir skanūs 30 minučių patiekalų receptai užimtiems žmonėms. Paprasti receptai kasdieniam gaminimui.",
      keywords: ["greiti receptai", "30 minučių", "paprasti receptai", "kasdieniai patiekalai"]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "vegetariski-patiekalai",
    label: {
      lt: "Vegetariški patiekalai",
      en: "Vegetarian dishes"
    },
    description: {
      lt: "Skanūs vegetariški receptai be mėsos",
      en: "Delicious vegetarian recipes without meat"
    },
    icon: "🥬",
    color: "#059669",
    priority: 2,
    status: "active",
    seo: {
      metaTitle: "Vegetariškų patiekalų receptai - Be mėsos | Paragaujam.lt",
      metaDescription: "Skanūs vegetariški receptai be mėsos. Daržovių, grūdų ir pieno produktų receptai sveikam mitybai.",
      keywords: ["vegetariški receptai", "be mėsos", "daržovių receptai", "sveika mityba"]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "šventiniai-patiekalai",
    label: {
      lt: "Šventiniai patiekalai",
      en: "Holiday dishes"
    },
    description: {
      lt: "Iškilmingi receptai šventėms ir progoms",
      en: "Festive recipes for holidays and special occasions"
    },
    icon: "🎉",
    color: "#DC2626",
    priority: 3,
    status: "active",
    seo: {
      metaTitle: "Šventinių patiekalų receptai - Iškilmingi | Paragaujam.lt",
      metaDescription: "Iškilmingi šventinių patiekalų receptai šventėms ir progoms. Kalėdų, Velykų ir gimtadienių receptai.",
      keywords: ["šventiniai receptai", "Kalėdų receptai", "Velykų receptai", "iškilmingi patiekalai"]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "lengvi-receptai",
    label: {
      lt: "Lengvi receptai",
      en: "Easy recipes"
    },
    description: {
      lt: "Paprasti receptai pradedantiesiems",
      en: "Simple recipes for beginners"
    },
    icon: "👶",
    color: "#3B82F6",
    priority: 4,
    status: "active",
    seo: {
      metaTitle: "Lengvų receptų - Pradedantiesiems | Paragaujam.lt",
      metaDescription: "Paprasti ir lengvi receptai pradedantiesiems. Žingsnis po žingsnio instrukcijos ir patarimai.",
      keywords: ["lengvi receptai", "paprasti receptai", "pradedantiesiems", "žingsnis po žingsnio"]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "sveiki-patiekalai",
    label: {
      lt: "Sveiki patiekalai",
      en: "Healthy dishes"
    },
    description: {
      lt: "Maistingi ir sveiki receptai aktyviam gyvenimui",
      en: "Nutritious and healthy recipes for active lifestyle"
    },
    icon: "💪",
    color: "#16A34A",
    priority: 5,
    status: "active",
    seo: {
      metaTitle: "Sveikų patiekalų receptai - Maistingi | Paragaujam.lt",
      metaDescription: "Maistingi ir sveiki patiekalų receptai aktyviam gyvenimui. Mažai kalorijų, daug vitaminų ir mineralų.",
      keywords: ["sveiki receptai", "maistingi patiekalai", "mažai kalorijų", "aktyvus gyvenimas"]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Enhanced groups created");

print("\n🔍 Creating optimized indexes...");

// 4. CREATE OPTIMIZED INDEXES FOR SEO AND PERFORMANCE
// Drop existing indexes
db.recipes.dropIndexes();
db.categories.dropIndexes();
db.groups.dropIndexes();

// Recipe indexes for SEO and performance
db.recipes.createIndex(
  { 
    status: 1, 
    categoryPath: 1, 
    slug: 1 
  }, 
  { 
    name: "recipes_seo_url",
    background: true 
  }
);

db.recipes.createIndex(
  { 
    "seo.keywords": 1, 
    "title.lt": "text", 
    "description.lt": "text" 
  }, 
  { 
    name: "recipes_seo_search",
    background: true 
  }
);

db.recipes.createIndex(
  { 
    status: 1,
    featured: 1,
    trending: 1,
    "rating.average": -1,
    createdAt: -1
  }, 
  { 
    name: "recipes_homepage",
    background: true 
  }
);

db.recipes.createIndex(
  { 
    status: 1,
    categoryPath: 1,
    "categories.timeRequired": 1,
    "categories.dietary": 1,
    totalTimeMinutes: 1
  }, 
  { 
    name: "recipes_filtering",
    background: true 
  }
);

db.recipes.createIndex(
  { 
    groupIds: 1,
    status: 1,
    "rating.average": -1
  }, 
  { 
    name: "recipes_groups",
    background: true 
  }
);

// Category indexes
db.categories.createIndex(
  { 
    slug: 1, 
    status: 1 
  }, 
  { 
    name: "categories_lookup",
    unique: true,
    background: true 
  }
);

db.categories.createIndex(
  { 
    "subcategories.slug": 1,
    status: 1 
  }, 
  { 
    name: "subcategories_lookup",
    background: true 
  }
);

// Group indexes
db.groups.createIndex(
  { 
    slug: 1, 
    status: 1 
  }, 
  { 
    name: "groups_lookup",
    unique: true,
    background: true 
  }
);

db.groups.createIndex(
  { 
    priority: 1, 
    status: 1 
  }, 
  { 
    name: "groups_display",
    background: true 
  }
);

print("✅ Optimized indexes created");

print("\n📊 Migration Summary:");
print("   - Recipes: " + db.recipes.countDocuments());
print("   - Categories: " + db.categories.countDocuments());
print("   - Groups: " + db.groups.countDocuments());
print("   - Indexes: " + (
  db.recipes.getIndexes().length + 
  db.categories.getIndexes().length + 
  db.groups.getIndexes().length
));

print("\n✅ Database Schema Migration v2.0 completed successfully!");
print("🚀 Your database is now optimized for SEO and performance!");
