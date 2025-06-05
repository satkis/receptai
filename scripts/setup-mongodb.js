// MongoDB Setup Script for Receptai Project
// Run this with: mongosh < setup-mongodb.js

// Switch to receptai database
use('receptai');

// Create recipes collection with sample data
db.recipes.insertMany([
  {
    title: {
      lt: "Tradiciniai cepelinai su mėsos įdaru",
      en: "Traditional Cepelinai with Meat Filling"
    },
    description: {
      lt: "Autentiški lietuviški cepelinai su sultingu mėsos įdaru",
      en: "Authentic Lithuanian cepelinai with juicy meat filling"
    },
    slug: "tradiciniai-cepelinai-su-mesos-idaru",
    image: "/images/cepelinai.jpg",
    cookingTime: 90,
    servings: 4,
    difficulty: "medium",
    categories: ["pagrindinis-patiekalas", "tradicinis"],
    customGroups: ["karštį patiekalai", "tradiciniai"],
    ingredients: [
      {
        name: { lt: "Bulvės", en: "Potatoes" },
        amount: "2",
        unit: "kg",
        vital: true
      },
      {
        name: { lt: "Kiaulienos mėsa", en: "Pork meat" },
        amount: "500",
        unit: "g",
        vital: true
      },
      {
        name: { lt: "Svogūnas", en: "Onion" },
        amount: "1",
        unit: "vnt",
        vital: false
      },
      {
        name: { lt: "Druska", en: "Salt" },
        amount: "pagal skonį",
        unit: "",
        vital: false
      }
    ],
    instructions: [
      {
        step: 1,
        description: {
          lt: "Nulupkite ir sutarkuokite bulves",
          en: "Peel and grate the potatoes"
        }
      },
      {
        step: 2,
        description: {
          lt: "Paruoškite mėsos įdarą",
          en: "Prepare the meat filling"
        }
      }
    ],
    nutrition: {
      calories: 450,
      protein: 25,
      carbs: 55,
      fat: 15
    },
    tags: ["lietuviška", "tradicinis", "šventinis"],
    author: "Receptai.lt",
    createdAt: new Date(),
    updatedAt: new Date(),
    published: true,
    featured: true
  },
  {
    title: {
      lt: "Šaltibarščiai su bulvėmis ir kiaušiniais",
      en: "Cold Beet Soup with Potatoes and Eggs"
    },
    description: {
      lt: "Gaivūs vasariški šaltibarščiai su šviežiais daržovėmis",
      en: "Refreshing summer cold beet soup with fresh vegetables"
    },
    slug: "saltibarsciai-su-bulvemis-ir-kiausiniais",
    image: "/images/saltibarsciai.jpg",
    cookingTime: 30,
    servings: 6,
    difficulty: "easy",
    categories: ["sriuba", "vasariškas"],
    customGroups: ["valgome sveikiau!", "sriubos"],
    ingredients: [
      {
        name: { lt: "Burokėlių sultys", en: "Beetroot juice" },
        amount: "1",
        unit: "l",
        vital: true
      },
      {
        name: { lt: "Rūgštus grietinėlė", en: "Sour cream" },
        amount: "200",
        unit: "ml",
        vital: true
      },
      {
        name: { lt: "Virtos bulvės", en: "Boiled potatoes" },
        amount: "4",
        unit: "vnt",
        vital: false
      }
    ],
    instructions: [
      {
        step: 1,
        description: {
          lt: "Sumaišykite burokėlių sultis su grietinėle",
          en: "Mix beetroot juice with sour cream"
        }
      }
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 25,
      fat: 6
    },
    tags: ["vasariškas", "šaltas", "sveika"],
    author: "Receptai.lt",
    createdAt: new Date(),
    updatedAt: new Date(),
    published: true,
    featured: false
  }
]);

// Create custom groups collection
db.customGroups.insertMany([
  {
    name: "viskas",
    displayName: { lt: "Viskas", en: "Everything" },
    description: { lt: "Visi receptai", en: "All recipes" },
    order: 1,
    active: true
  },
  {
    name: "valgome-sveikiau",
    displayName: { lt: "Valgome sveikiau!", en: "Eating healthier!" },
    description: { lt: "Sveiki ir maistingi receptai", en: "Healthy and nutritious recipes" },
    order: 2,
    active: true
  },
  {
    name: "karsti-patiekalai",
    displayName: { lt: "Karštį patiekalai", en: "Hot dishes" },
    description: { lt: "Šilti ir sotūs patiekalai", en: "Warm and filling dishes" },
    order: 3,
    active: true
  },
  {
    name: "sriubos",
    displayName: { lt: "Sriubos", en: "Soups" },
    description: { lt: "Įvairios sriubos ir sultiniai", en: "Various soups and broths" },
    order: 4,
    active: true
  },
  {
    name: "uzkandziai",
    displayName: { lt: "Užkandžiai", en: "Snacks" },
    description: { lt: "Lengvi užkandžiai ir aperityvai", en: "Light snacks and appetizers" },
    order: 5,
    active: true
  },
  {
    name: "pyragai-kepiniai",
    displayName: { lt: "Pyragai, kepiniai", en: "Cakes, pastries" },
    description: { lt: "Saldūs kepiniai ir desertai", en: "Sweet pastries and desserts" },
    order: 6,
    active: true
  },
  {
    name: "salotos-misraines",
    displayName: { lt: "Salotos, mišrainės", en: "Salads, mixed dishes" },
    description: { lt: "Šviežios salotos ir mišrainės", en: "Fresh salads and mixed dishes" },
    order: 7,
    active: true
  }
]);

// Create categories collection
db.categories.insertMany([
  {
    name: "pagrindinis-patiekalas",
    displayName: { lt: "Pagrindinis patiekalas", en: "Main course" },
    description: { lt: "Pagrindiniai pietų patiekalai", en: "Main lunch dishes" },
    icon: "🍽️",
    order: 1,
    active: true
  },
  {
    name: "sriuba",
    displayName: { lt: "Sriuba", en: "Soup" },
    description: { lt: "Šiltos ir šaltos sriubos", en: "Hot and cold soups" },
    icon: "🍲",
    order: 2,
    active: true
  },
  {
    name: "desertas",
    displayName: { lt: "Desertas", en: "Dessert" },
    description: { lt: "Saldūs desertai", en: "Sweet desserts" },
    icon: "🍰",
    order: 3,
    active: true
  },
  {
    name: "uzkandziai",
    displayName: { lt: "Užkandžiai", en: "Appetizers" },
    description: { lt: "Lengvi užkandžiai", en: "Light appetizers" },
    icon: "🥗",
    order: 4,
    active: true
  }
]);

// Create indexes for better performance
db.recipes.createIndex({ "title.lt": "text", "description.lt": "text" });
db.recipes.createIndex({ slug: 1 }, { unique: true });
db.recipes.createIndex({ categories: 1 });
db.recipes.createIndex({ customGroups: 1 });
db.recipes.createIndex({ published: 1 });
db.recipes.createIndex({ featured: 1 });
db.recipes.createIndex({ createdAt: -1 });

print("✅ MongoDB setup completed!");
print("📊 Collections created:");
print("   - recipes: " + db.recipes.countDocuments());
print("   - customGroups: " + db.customGroups.countDocuments());
print("   - categories: " + db.categories.countDocuments());
print("🔍 Indexes created for optimal performance");
