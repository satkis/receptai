// Database Seeding Script for Categories Collection
// Run with: node scripts/seedCategories.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Import category data (convert to CommonJS format)
const categoryHierarchy = [
  // 🥘 Patiekalo tipas
  {
    label: { lt: "Karšti patiekalai", en: "Hot Dishes" },
    slug: "karsti-patiekalai",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Kepsniai ir karbonadai", slug: "kepsniai-karbonadai" },
      { label: "Troškiniai", slug: "troskiniai" },
      { label: "Apkepai", slug: "apkepai" },
      { label: "Košės ir tyrės", slug: "koses-tyres" }
    ],
    seo: {
      title: "Karšti patiekalai - Receptai | Paragaujam.lt",
      description: "Skanūs karštų patiekalų receptai: kepsniai, troškiniai, apkepai ir košės. Lengvi ir skanūs receptai kiekvienai dienai.",
      keywords: ["karšti patiekalai", "kepsniai", "troškiniai", "receptai"]
    },
    order: 1,
    isActive: true
  },
  {
    label: { lt: "Sriubos", en: "Soups" },
    slug: "sriubos",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Klasikinės sriubos", slug: "klasikines-sriubos" },
      { label: "Vištienos sriuba", slug: "vistienos-sriuba" },
      { label: "Daržovių sriubos", slug: "darzoviu-sriubos" },
      { label: "Rūgštynių sriuba", slug: "rugstynių-sriuba" }
    ],
    seo: {
      title: "Sriubų receptai - Skanūs ir maistingi | Paragaujam.lt",
      description: "Klasikinės sriubos, vištienos sriuba, daržovių sriubos. Šilti ir maistingi receptai visai šeimai.",
      keywords: ["sriubos", "vištienos sriuba", "daržovių sriubos", "receptai"]
    },
    order: 2,
    isActive: true
  },
  {
    label: { lt: "Užkandžiai", en: "Snacks" },
    slug: "uzkandziai",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Vieno kąsnio užkandžiai", slug: "vieno-kasnio" },
      { label: "Užkandžiai prie alaus", slug: "prie-alaus" },
      { label: "Sumuštiniai", slug: "sumustiniai" }
    ],
    seo: {
      title: "Užkandžių receptai - Lengvi ir skanūs | Paragaujam.lt",
      description: "Greiti užkandžiai, sumuštiniai ir užkandžiai prie alaus. Tobuli receptai vakarėliams ir kasdienai.",
      keywords: ["užkandžiai", "sumuštiniai", "greiti receptai"]
    },
    order: 3,
    isActive: true
  },
  {
    label: { lt: "Salotos ir mišrainės", en: "Salads" },
    slug: "salotos",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Vištienos salotos", slug: "vistienos-salotos" },
      { label: "Jautienos salotos", slug: "jautienos-salotos" },
      { label: "Daržovių salotos", slug: "darzoviu-salotos" }
    ],
    seo: {
      title: "Salotų receptai - Šviežios ir skanūs | Paragaujam.lt",
      description: "Vištienos salotos, daržovių salotos ir mišrainės. Sveiki ir maistingi receptai.",
      keywords: ["salotos", "vištienos salotos", "daržovių salotos", "mišrainės"]
    },
    order: 4,
    isActive: true
  },
  {
    label: { lt: "Vištiena", en: "Chicken" },
    slug: "vistiena",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Vištienos patiekalai", slug: "vistienos-patiekalai" },
      { label: "Vištienos salotos", slug: "vistienos-salotos" }
    ],
    seo: {
      title: "Vištienos receptai - Skanūs ir maistingi | Paragaujam.lt",
      description: "Geriausi vištienos receptai: kepsniai, salotos, troškiniai. Lengvi ir skanūs patiekalai su vištiena.",
      keywords: ["vištiena", "vištienos receptai", "vištienos kepsniai", "vištienos salotos"]
    },
    order: 5,
    isActive: true
  },
  {
    label: { lt: "Jautiena", en: "Beef" },
    slug: "jautiena",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Jautienos patiekalai", slug: "jautienos-patiekalai" },
      { label: "Troškiniai iš jautienos", slug: "jautienos-troskiniai" }
    ],
    seo: {
      title: "Jautienos receptai - Sultingi ir skanūs | Paragaujam.lt",
      description: "Jautienos kepsniai, troškiniai ir kiti skanūs patiekalai. Receptai su jautiena visai šeimai.",
      keywords: ["jautiena", "jautienos receptai", "jautienos kepsniai"]
    },
    order: 6,
    isActive: true
  },
  {
    label: { lt: "Žuvis ir jūros gėrybės", en: "Fish & Seafood" },
    slug: "zuvis",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Žuvies patiekalai", slug: "zuvies-patiekalai" },
      { label: "Receptai su lašiša", slug: "lasisa" },
      { label: "Jūros gėrybių patiekalai", slug: "juros-gerybes" }
    ],
    seo: {
      title: "Žuvies receptai - Sveiki ir skanūs | Paragaujam.lt",
      description: "Žuvies patiekalai, lašišos receptai ir jūros gėrybės. Sveiki ir maistingi receptai.",
      keywords: ["žuvis", "lašiša", "žuvies receptai", "jūros gėrybės"]
    },
    order: 7,
    isActive: true
  },
  {
    label: { lt: "Desertai", en: "Desserts" },
    slug: "desertai",
    parentSlug: "receptai",
    type: "main-category",
    subcategories: [
      { label: "Tortai", slug: "tortai" },
      { label: "Pyragai", slug: "pyragai" },
      { label: "Keksai", slug: "keksai" },
      { label: "Sausainiai", slug: "sausainiai" }
    ],
    seo: {
      title: "Desertų receptai - Saldūs ir skanūs | Paragaujam.lt",
      description: "Tortų, pyragų ir sausainių receptai. Saldūs desertai visai šeimai ir šventėms.",
      keywords: ["desertai", "tortai", "pyragai", "sausainiai", "saldumynai"]
    },
    order: 8,
    isActive: true
  }
];

const filterCategories = [
  {
    label: { lt: "15 minučių patiekalai", en: "15 Minute Dishes" },
    slug: "15-min-patiekalai",
    parentSlug: "receptai",
    type: "filter-category",
    seo: {
      title: "15 minučių receptai - Greiti patiekalai | Paragaujam.lt",
      description: "Greiti receptai iki 15 minučių. Lengvi ir skanūs patiekalai užimtiems žmonėms.",
      keywords: ["greiti receptai", "15 minučių", "lengvi patiekalai"]
    },
    order: 100,
    isActive: true
  },
  {
    label: { lt: "Be glitimo", en: "Gluten Free" },
    slug: "be-glitimo",
    parentSlug: "receptai",
    type: "filter-category",
    seo: {
      title: "Be glitimo receptai - Sveiki patiekalai | Paragaujam.lt",
      description: "Receptai be glitimo. Sveiki ir skanūs patiekalai žmonėms su glitimo netoleravimu.",
      keywords: ["be glitimo", "sveiki receptai", "gluten free"]
    },
    order: 101,
    isActive: true
  },
  {
    label: { lt: "Vegetariški patiekalai", en: "Vegetarian" },
    slug: "vegetariski",
    parentSlug: "receptai",
    type: "filter-category",
    seo: {
      title: "Vegetariški receptai - Sveiki ir skanūs | Paragaujam.lt",
      description: "Vegetariški patiekalai be mėsos. Sveiki ir maistingi receptai vegetarams.",
      keywords: ["vegetariški receptai", "be mėsos", "sveiki patiekalai"]
    },
    order: 102,
    isActive: true
  }
];

async function seedCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('receptai');
    const categoriesCollection = db.collection('categories');
    
    // Clear existing categories
    await categoriesCollection.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert main categories
    const allCategories = [...categoryHierarchy, ...filterCategories];
    const result = await categoriesCollection.insertMany(allCategories);
    console.log(`Inserted ${result.insertedCount} categories`);
    
    // Create indexes
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    await categoriesCollection.createIndex({ type: 1 });
    await categoriesCollection.createIndex({ parentSlug: 1 });
    await categoriesCollection.createIndex({ order: 1 });
    console.log('Created indexes');
    
    console.log('✅ Categories seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await client.close();
  }
}

// Run the seeding
seedCategories();
