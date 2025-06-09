// Recipe Migration Script
// Updates existing recipes with new category hierarchy
// Run with: node scripts/migrateRecipes.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Recipe category mapping function (CommonJS version)
function mapRecipeToCategories(recipe) {
  const title = recipe.title?.lt?.toLowerCase() || '';
  const existingCategories = recipe.categories || {};
  
  // Default mapping
  let main = "Karšti patiekalai";
  let sub = "Kepsniai ir karbonadai";
  let mainSlug = "karsti-patiekalai";
  let subSlug = "kepsniai-karbonadai";

  // 🥩 Ingredient-based mapping
  if (title.includes('vištiena') || title.includes('vištienos') || title.includes('chicken')) {
    main = "Vištiena";
    mainSlug = "vistiena";
    
    if (title.includes('salotos') || title.includes('salad')) {
      sub = "Vištienos salotos";
      subSlug = "vistienos-salotos";
    } else {
      sub = "Vištienos patiekalai";
      subSlug = "vistienos-patiekalai";
    }
  }
  else if (title.includes('jautiena') || title.includes('jautienos') || title.includes('beef')) {
    main = "Jautiena";
    mainSlug = "jautiena";
    sub = "Jautienos patiekalai";
    subSlug = "jautienos-patiekalai";
  }
  else if (title.includes('žuvis') || title.includes('žuvies') || title.includes('lašiša')) {
    main = "Žuvis ir jūros gėrybės";
    mainSlug = "zuvis";
    sub = "Žuvies patiekalai";
    subSlug = "zuvies-patiekalai";
  }
  else if (title.includes('tortas') || title.includes('tortai')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Tortai";
    subSlug = "tortai";
  }
  else if (title.includes('pyragas') || title.includes('pyragai')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Pyragai";
    subSlug = "pyragai";
  }
  else if (title.includes('sriuba') || title.includes('sriubos')) {
    main = "Sriubos";
    mainSlug = "sriubos";
    sub = "Klasikinės sriubos";
    subSlug = "klasikines-sriubos";
  }
  else if (title.includes('salotos')) {
    main = "Salotos ir mišrainės";
    mainSlug = "salotos";
    sub = "Daržovių salotos";
    subSlug = "darzoviu-salotos";
  }
  else if (title.includes('sumuštinis') || title.includes('sumustiniai')) {
    main = "Užkandžiai";
    mainSlug = "uzkandziai";
    sub = "Sumuštiniai";
    subSlug = "sumustiniai";
  }

  // Determine time group
  let timeGroup = "30–60 min.";
  const totalTime = recipe.totalTimeMinutes || 45;
  if (totalTime <= 15) {
    timeGroup = "iki 15 min.";
  } else if (totalTime <= 30) {
    timeGroup = "iki 30 min.";
  } else if (totalTime <= 60) {
    timeGroup = "30–60 min.";
  } else if (totalTime <= 120) {
    timeGroup = "1-2 val.";
  } else {
    timeGroup = "virš 2 val.";
  }

  // Determine cuisine
  let cuisine = existingCategories.cuisine || "Lietuviška";
  const cuisineMapping = {
    "Lietuviška": "Lietuvos virtuvė",
    "Itališka": "Italijos virtuvė",
    "Azijietiška": "Kinijos virtuvė"
  };
  cuisine = cuisineMapping[cuisine] || cuisine;

  // Determine dietary restrictions
  let dietary = [];
  if (existingCategories.dietary) {
    const dietaryMapping = {
      "vegetariška": "Vegetariški patiekalai",
      "veganiška": "Veganiški receptai",
      "be glitimo": "Be glitimo",
      "be laktozės": "Be laktozės",
      "keto": "Keto receptai"
    };
    
    dietary = existingCategories.dietary.map(diet => 
      dietaryMapping[diet] || diet
    );
  }

  // Determine dish type
  let dishType = "Karšti patiekalai";
  if (main === "Sriubos") dishType = "Sriubos";
  else if (main === "Užkandžiai") dishType = "Užkandžiai";
  else if (main === "Salotos ir mišrainės") dishType = "Salotos ir mišrainės";
  else if (main === "Desertai") dishType = "Saldumynai ir kepiniai";

  return {
    categories: {
      main,
      sub,
      cuisine,
      timeGroup,
      dietary,
      dishType
    },
    breadcrumb: {
      main: { label: main, slug: mainSlug },
      sub: { label: sub, slug: subSlug }
    }
  };
}

async function migrateRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('receptai');
    const recipesCollection = db.collection('recipes');
    
    // Get all recipes
    const recipes = await recipesCollection.find({}).toArray();
    console.log(`Found ${recipes.length} recipes to migrate`);
    
    let updatedCount = 0;
    
    for (const recipe of recipes) {
      try {
        const { categories, breadcrumb } = mapRecipeToCategories(recipe);
        
        // Update recipe with new category structure
        const updateData = {
          $set: {
            'categories.main': categories.main,
            'categories.sub': categories.sub,
            'categories.cuisine': categories.cuisine,
            'categories.timeGroup': categories.timeGroup,
            'categories.dietary': categories.dietary,
            'categories.dishType': categories.dishType,
            'breadcrumb': breadcrumb,
            'categoryPath': `${breadcrumb.main.slug}/${breadcrumb.sub.slug}`,
            'seo.canonicalUrl': `/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}/${recipe.slug}`,
            'seo.breadcrumbSchema': {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Receptai",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/receptai`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": breadcrumb.main.label,
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/receptai/${breadcrumb.main.slug}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": breadcrumb.sub.label,
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": recipe.title.lt,
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}/${recipe.slug}`
                }
              ]
            },
            'updatedAt': new Date()
          }
        };
        
        await recipesCollection.updateOne(
          { _id: recipe._id },
          updateData
        );
        
        updatedCount++;
        console.log(`✅ Updated: ${recipe.title.lt} -> ${categories.main}/${categories.sub}`);
        
      } catch (error) {
        console.error(`❌ Error updating recipe ${recipe.title.lt}:`, error);
      }
    }
    
    // Create new indexes for category queries
    await recipesCollection.createIndex({ 'categories.main': 1 });
    await recipesCollection.createIndex({ 'categories.sub': 1 });
    await recipesCollection.createIndex({ 'categoryPath': 1 });
    await recipesCollection.createIndex({ 'breadcrumb.main.slug': 1 });
    await recipesCollection.createIndex({ 'breadcrumb.sub.slug': 1 });
    console.log('Created new indexes');
    
    console.log(`✅ Migration completed! Updated ${updatedCount} recipes`);
    
  } catch (error) {
    console.error('❌ Error migrating recipes:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
migrateRecipes();
