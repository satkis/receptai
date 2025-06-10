// Simple Migration Script - Enhanced SEO Database Schema
// Run this in MongoDB Compass or mongosh

// 1. Add SEO fields to existing recipes
db.recipes.updateMany(
  { seo: { $exists: false } },
  {
    $set: {
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        canonicalUrl: "",
        lastModified: new Date()
      },
      schemaOrg: {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: "",
        description: "",
        author: {
          "@type": "Organization",
          name: "Paragaujam.lt"
        },
        datePublished: new Date(),
        dateModified: new Date()
      },
      status: "published",
      featured: false,
      trending: false,
      performance: {
        views: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 50),
        saves: Math.floor(Math.random() * 100)
      }
    }
  }
);

// 2. Add categoryPath for URL structure
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

// 3. Fix missing slugs
db.recipes.find({ 
  $or: [
    { slug: { $exists: false } },
    { slug: "" },
    { slug: null }
  ]
}).forEach(function(recipe) {
  var title = recipe.title && recipe.title.lt ? recipe.title.lt : (recipe.title || "receptas");
  var newSlug = title
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, function(match) {
      var map = { 'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  db.recipes.updateOne(
    { _id: recipe._id },
    { $set: { slug: newSlug } }
  );
});

// 4. Generate SEO data for recipes
db.recipes.find({
  $or: [
    { "seo.metaTitle": { $exists: false } },
    { "seo.metaTitle": "" }
  ]
}).forEach(function(recipe) {
  var title = recipe.title && recipe.title.lt ? recipe.title.lt : (recipe.title || "Receptas");
  var description = recipe.description && recipe.description.lt ? recipe.description.lt : (recipe.description || "Receptas aprašymas");
  var totalTime = recipe.totalTimeMinutes || 30;
  var servings = recipe.servings || 4;
  
  var metaTitle = (title + " - Receptas | Paragaujam.lt").substring(0, 60);
  var metaDescription = (description + " Gaminimo laikas: " + totalTime + " min. Porcijų: " + servings + ".").substring(0, 155);
  var canonicalUrl = "/receptai/" + recipe.categoryPath + "/" + recipe.slug;
  
  var keywords = [
    title.toLowerCase(),
    "receptas",
    "gaminimas",
    "lietuviški receptai"
  ];
  
  db.recipes.updateOne(
    { _id: recipe._id },
    {
      $set: {
        "seo.metaTitle": metaTitle,
        "seo.metaDescription": metaDescription,
        "seo.keywords": keywords,
        "seo.canonicalUrl": canonicalUrl,
        "seo.lastModified": new Date(),
        "schemaOrg.name": title,
        "schemaOrg.description": description,
        "schemaOrg.totalTime": "PT" + totalTime + "M",
        "schemaOrg.recipeYield": servings + " porcijos",
        "schemaOrg.dateModified": new Date()
      }
    }
  );
});

// 5. Create optimized indexes
db.recipes.createIndex(
  { status: 1, categoryPath: 1, slug: 1 },
  { name: "recipes_seo_url", background: true }
);

db.recipes.createIndex(
  { status: 1, featured: 1, "rating.average": -1, createdAt: -1 },
  { name: "recipes_homepage", background: true }
);

db.recipes.createIndex(
  { "seo.keywords": 1, "title.lt": "text", "description.lt": "text" },
  { name: "recipes_seo_search", background: true }
);

// 6. Show results
print("✅ Migration completed!");
print("📊 Recipe count:", db.recipes.countDocuments());
print("🔍 Recipes with SEO:", db.recipes.countDocuments({ "seo.metaTitle": { $ne: "" } }));
print("📂 Recipes with categoryPath:", db.recipes.countDocuments({ categoryPath: { $exists: true } }));
print("🏷️ Indexes created:", db.recipes.getIndexes().length);
