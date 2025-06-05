// MongoDB Restructure Script for Receptai Project
// Run this with: mongosh receptai < restructure-mongodb.js

// Switch to receptai database
use('receptai');

// Drop old collections
print("🗑️  Dropping old collections...");
db.recipes.drop();
db.customGroups.drop();
db.categories.drop();

print("✅ Old collections dropped");

// Create new collections with optimized structure
print("🏗️  Creating new collections...");

// 1. Create categories collection
print("📂 Creating categories collection...");
db.categories.insertMany([
  // Cuisine categories
  {
    "key": "lithuanian",
    "type": "cuisine",
    "label": {
      "lt": "Lietuviška",
      "en": "Lithuanian"
    },
    "icon": "🇱🇹"
  },
  {
    "key": "european",
    "type": "cuisine", 
    "label": {
      "lt": "Europietiška",
      "en": "European"
    },
    "icon": "🇪🇺"
  },
  {
    "key": "international",
    "type": "cuisine",
    "label": {
      "lt": "Tarptautinė",
      "en": "International"
    },
    "icon": "🌍"
  },

  // Meal Type categories
  {
    "key": "main-course",
    "type": "mealType",
    "label": {
      "lt": "Pagrindinis patiekalas",
      "en": "Main Course"
    },
    "icon": "🍽️"
  },
  {
    "key": "soup",
    "type": "mealType",
    "label": {
      "lt": "Sriuba",
      "en": "Soup"
    },
    "icon": "🍲"
  },
  {
    "key": "appetizer",
    "type": "mealType",
    "label": {
      "lt": "Užkandis",
      "en": "Appetizer"
    },
    "icon": "🥗"
  },
  {
    "key": "dessert",
    "type": "mealType",
    "label": {
      "lt": "Desertas",
      "en": "Dessert"
    },
    "icon": "🍰"
  },
  {
    "key": "breakfast",
    "type": "mealType",
    "label": {
      "lt": "Pusryčiai",
      "en": "Breakfast"
    },
    "icon": "🥞"
  },

  // Dietary categories
  {
    "key": "vegetarian",
    "type": "dietary",
    "label": {
      "lt": "Vegetariškas",
      "en": "Vegetarian"
    },
    "icon": "🌱"
  },
  {
    "key": "vegan",
    "type": "dietary",
    "label": {
      "lt": "Veganiška",
      "en": "Vegan"
    },
    "icon": "🌿"
  },
  {
    "key": "gluten-free",
    "type": "dietary",
    "label": {
      "lt": "Be glitimo",
      "en": "Gluten-Free"
    },
    "icon": "🚫🌾"
  },
  {
    "key": "dairy-free",
    "type": "dietary",
    "label": {
      "lt": "Be pieno produktų",
      "en": "Dairy-Free"
    },
    "icon": "🚫🥛"
  },

  // Seasonal categories
  {
    "key": "summer",
    "type": "seasonal",
    "label": {
      "lt": "Vasariškas",
      "en": "Summer"
    },
    "icon": "☀️"
  },
  {
    "key": "winter",
    "type": "seasonal",
    "label": {
      "lt": "Žiemiškas",
      "en": "Winter"
    },
    "icon": "❄️"
  },
  {
    "key": "spring",
    "type": "seasonal",
    "label": {
      "lt": "Pavasariškas",
      "en": "Spring"
    },
    "icon": "🌸"
  },
  {
    "key": "autumn",
    "type": "seasonal",
    "label": {
      "lt": "Rudeniškas",
      "en": "Autumn"
    },
    "icon": "🍂"
  }
]);

print("✅ Categories created: " + db.categories.countDocuments());

// 2. Create groups collection
print("📂 Creating groups collection...");
const groupsResult = db.groups.insertMany([
  {
    "slug": "30-minuciu-patiekalai",
    "label": {
      "lt": "30 minučių patiekalai",
      "en": "30-Minute Meals"
    },
    "description": {
      "lt": "Greiti ir skanūs patiekalai užimtiems žmonėms",
      "en": "Quick and delicious meals for busy people"
    },
    "image": "/images/groups/30-minute-meals.jpg",
    "createdAt": new Date()
  },
  {
    "slug": "vaikams-draugiski",
    "label": {
      "lt": "Vaikams draugiški",
      "en": "Kids Friendly"
    },
    "description": {
      "lt": "Receptai, kuriuos mėgsta vaikai",
      "en": "Recipes that kids love"
    },
    "image": "/images/groups/kids-friendly.jpg",
    "createdAt": new Date()
  },
  {
    "slug": "veganiski-patiekalai",
    "label": {
      "lt": "Veganiški patiekalai",
      "en": "Vegan Dishes"
    },
    "description": {
      "lt": "Skanūs augaliniai receptai",
      "en": "Delicious plant-based recipes"
    },
    "image": "/images/groups/vegan-dishes.jpg",
    "createdAt": new Date()
  },
  {
    "slug": "sriubos",
    "label": {
      "lt": "Sriubos",
      "en": "Soups"
    },
    "description": {
      "lt": "Šiltos ir šaltos sriubos visoms progoms",
      "en": "Hot and cold soups for all occasions"
    },
    "image": "/images/groups/soups.jpg",
    "createdAt": new Date()
  },
  {
    "slug": "pyragai-kepiniai",
    "label": {
      "lt": "Pyragai ir kepiniai",
      "en": "Cakes and Pastries"
    },
    "description": {
      "lt": "Saldūs kepiniai ir desertai",
      "en": "Sweet pastries and desserts"
    },
    "image": "/images/groups/cakes-pastries.jpg",
    "createdAt": new Date()
  }
]);

// Store group IDs for use in recipes
const groupIds = {
  "30-minuciu": groupsResult.insertedIds[0],
  "vaikams": groupsResult.insertedIds[1], 
  "veganiski": groupsResult.insertedIds[2],
  "sriubos": groupsResult.insertedIds[3],
  "pyragai": groupsResult.insertedIds[4]
};

print("✅ Groups created: " + db.groups.countDocuments());

print("🏗️  Collections restructured successfully!");
print("📊 Summary:");
print("   - categories: " + db.categories.countDocuments());
print("   - groups: " + db.groups.countDocuments());
print("   - recipes: " + db.recipes.countDocuments() + " (ready for new data)");
