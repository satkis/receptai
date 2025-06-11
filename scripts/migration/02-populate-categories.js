// Category Structure Population Script
// Populates the hierarchical category structure

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

// Category structure based on your requirements
const categoryStructure = [
  {
    title: { lt: "Patiekalų tipai", en: "Dish Types" },
    slug: "patiekalu-tipai",
    icon: "🍽️",
    description: { lt: "Receptai pagal patiekalo tipą", en: "Recipes by dish type" },
    children: [
      { title: { lt: "Pusryčiai", en: "Breakfast" }, slug: "pusryciai" },
      { title: { lt: "Pietūs", en: "Lunch" }, slug: "pietus" },
      { title: { lt: "Vakarienė", en: "Dinner" }, slug: "vakariene" },
      { title: { lt: "Užkandžiai", en: "Snacks" }, slug: "uzkandziai" },
      {
        title: { lt: "Desertai", en: "Desserts" },
        slug: "desertai",
        children: [
          { title: { lt: "Lengvi desertai", en: "Light desserts" }, slug: "lengvi-desertai" },
          { title: { lt: "Tortai ir pyragai", en: "Cakes and pies" }, slug: "tortai-ir-pyragai" },
          { title: { lt: "Tiramisu, tinginys, saldainiai", en: "Tiramisu, lazy cake, sweets" }, slug: "tiramisu-tinginys-saldainiai" }
        ]
      },
      { title: { lt: "Sriubos", en: "Soups" }, slug: "sriubos" },
      { title: { lt: "Troškiniiai", en: "Stews" }, slug: "troskiniai" },
      {
        title: { lt: "Salotos", en: "Salads" },
        slug: "salotos",
        children: [
          { title: { lt: "Cezario", en: "Caesar" }, slug: "cezario" },
          { title: { lt: "Su avokadu ar burata", en: "With avocado or beetroot" }, slug: "su-avokadu-ar-burata" }
        ]
      }
    ]
  },
  {
    title: { lt: "Pagal ingredientą", en: "By Ingredient" },
    slug: "pagal-ingredienta",
    icon: "🍗",
    description: { lt: "Receptai pagal pagrindinį ingredientą", en: "Recipes by main ingredient" },
    children: [
      {
        title: { lt: "Mėsa", en: "Meat" },
        slug: "mesa",
        children: [
          {
            title: { lt: "Vištiena", en: "Chicken" },
            slug: "vistiena",
            children: [
              { title: { lt: "Krūtinėlė", en: "Breast" }, slug: "krutinele" },
              { title: { lt: "Farsas", en: "Ground chicken" }, slug: "farsas" }
            ]
          },
          { title: { lt: "Jautiena", en: "Beef" }, slug: "jautiena" },
          {
            title: { lt: "Kiauliena", en: "Pork" },
            slug: "kiauliena",
            children: [
              { title: { lt: "Farsas", en: "Ground pork" }, slug: "farsas" },
              { title: { lt: "Kumpis ir nugarinė", en: "Ham and back" }, slug: "kumpis-ir-nugarine" }
            ]
          },
          { title: { lt: "Triušiena", en: "Rabbit" }, slug: "triusiena" },
          { title: { lt: "Kalakutiena", en: "Turkey" }, slug: "kalakutiena" }
        ]
      },
      {
        title: { lt: "Žuvis ir jūrų gėrybės", en: "Fish and seafood" },
        slug: "zuvis-ir-juru-gerybes",
        children: [
          { title: { lt: "Lašiša", en: "Salmon" }, slug: "lasisa" },
          { title: { lt: "Menkė", en: "Cod" }, slug: "menke" },
          { title: { lt: "Lydeka", en: "Pike" }, slug: "lydeka" },
          { title: { lt: "Krevetės", en: "Shrimp" }, slug: "krevetes" }
        ]
      },
      {
        title: { lt: "Daržovės", en: "Vegetables" },
        slug: "darzoves",
        children: [
          { title: { lt: "Cukinija", en: "Zucchini" }, slug: "cukinija" },
          { title: { lt: "Brokoliai", en: "Broccoli" }, slug: "brokoliai" },
          { title: { lt: "Pomidorai", en: "Tomatoes" }, slug: "pomidorai" },
          { title: { lt: "Agurkai", en: "Cucumbers" }, slug: "agurkai" }
        ]
      },
      {
        title: { lt: "Ankštiniai", en: "Legumes" },
        slug: "ankstiniai",
        children: [
          { title: { lt: "Avinžirniai", en: "Peas" }, slug: "avinzirniai" },
          { title: { lt: "Lęšiai", en: "Lentils" }, slug: "lesiai" }
        ]
      },
      {
        title: { lt: "Kiaušiniai ir pieno produktai", en: "Eggs and dairy" },
        slug: "kiausiniai-ir-pieno-produktai",
        children: [
          { title: { lt: "Varškė", en: "Cottage cheese" }, slug: "varske" },
          { title: { lt: "Maskarpone", en: "Mascarpone" }, slug: "maskarpone" },
          { title: { lt: "Mozzarella", en: "Mozzarella" }, slug: "mozzarella" },
          { title: { lt: "Feta", en: "Feta" }, slug: "feta" }
        ]
      },
      {
        title: { lt: "Grūdai, makaronai, ryžiai", en: "Grains, pasta, rice" },
        slug: "grudai-makaronai-ryziai",
        children: [
          { title: { lt: "Makaronai", en: "Pasta" }, slug: "makaronai" },
          { title: { lt: "Ryžiai", en: "Rice" }, slug: "ryziai" },
          { title: { lt: "Quinoa", en: "Quinoa" }, slug: "quinoa" },
          { title: { lt: "Orzo", en: "Orzo" }, slug: "orzo" }
        ]
      },
      {
        title: { lt: "Vaisiai ir uogos", en: "Fruits and berries" },
        slug: "vaisiai-ir-uogos",
        children: [
          { title: { lt: "Bananai", en: "Bananas" }, slug: "bananai" },
          { title: { lt: "Obuoliai", en: "Apples" }, slug: "obuoliai" },
          { title: { lt: "Rabarbarai", en: "Rhubarb" }, slug: "rabarbarai" }
        ]
      }
    ]
  },
  {
    title: { lt: "Pagal dietą", en: "By Diet" },
    slug: "pagal-dieta",
    icon: "🥗",
    description: { lt: "Receptai pagal dietos poreikius", en: "Recipes by dietary needs" },
    children: [
      { title: { lt: "Be gliuteno", en: "Gluten-free" }, slug: "be-gliuteno" },
      { title: { lt: "Be laktozės", en: "Lactose-free" }, slug: "be-laktozes" },
      { title: { lt: "Be cukraus", en: "Sugar-free" }, slug: "be-cukraus" },
      { title: { lt: "Be kiaušinių", en: "Egg-free" }, slug: "be-kiausiniu" },
      { title: { lt: "Be mėsos", en: "Meat-free" }, slug: "be-mesos" },
      { title: { lt: "Be pieno", en: "Dairy-free" }, slug: "be-pieno" },
      { title: { lt: "Keto - mažai angliavandenių", en: "Keto - low carb" }, slug: "keto-mazai-angliavandeniu" },
      { title: { lt: "Diabetikams", en: "For diabetics" }, slug: "diabetikams" },
      { title: { lt: "Lieknėjimui", en: "For weight loss" }, slug: "lieknejimui" },
      { title: { lt: "Refliuksui", en: "For reflux" }, slug: "refliuksui" },
      { title: { lt: "Vaikams", en: "For children" }, slug: "vaikams" },
      { title: { lt: "Alergiškiems", en: "For allergic" }, slug: "alergiskiems" }
    ]
  },
  {
    title: { lt: "Pagal trukmę", en: "By Duration" },
    slug: "pagal-trukme",
    icon: "⏱️",
    description: { lt: "Receptai pagal gaminimo trukmę", en: "Recipes by cooking time" },
    children: [
      { title: { lt: "Greitai paruošiami", en: "Quick to prepare" }, slug: "greitai-paruosiami" },
      { title: { lt: "Per 15 min", en: "Under 15 min" }, slug: "per-15-min" },
      { title: { lt: "Per 30 min", en: "Under 30 min" }, slug: "per-30-min" },
      { title: { lt: "Paprasti receptai", en: "Simple recipes" }, slug: "paprasti-receptai" },
      { title: { lt: "Lengvi receptai", en: "Easy recipes" }, slug: "lengvi-receptai" }
    ]
  },
  {
    title: { lt: "Pagal auditoriją", en: "By Audience" },
    slug: "pagal-auditorija",
    icon: "👨‍👩‍👧‍👦",
    description: { lt: "Receptai pagal tikslinę auditoriją", en: "Recipes by target audience" },
    children: [
      { title: { lt: "Vaikams", en: "For children" }, slug: "vaikams" },
      { title: { lt: "Nevalgūkams", en: "For picky eaters" }, slug: "nevalgiukams" },
      { title: { lt: "Sveiką šeimai", en: "For healthy family" }, slug: "sveikai-seimai" },
      { title: { lt: "Receptas vienam", en: "Recipe for one" }, slug: "receptas-vienam" },
      { title: { lt: "Pietūs į darbą", en: "Lunch for work" }, slug: "pietus-i-darba" }
    ]
  }
];

async function insertCategoriesRecursively(db, categories, parentId = null, parentPath = '', level = 1) {
  const insertedCategories = [];
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const currentPath = parentPath ? `${parentPath}/${category.slug}` : category.slug;
    
    const doc = {
      title: category.title,
      slug: category.slug,
      level: level,
      path: currentPath,
      fullPath: currentPath.split('/'),
      parentId: parentId,
      ancestors: [], // Will be populated later
      description: category.description || { lt: `${category.title.lt} receptai`, en: `${category.title.en} recipes` },
      icon: category.icon || "📝",
      recipeCount: 0,
      isActive: true,
      sortOrder: i + 1,
      seo: {
        metaTitle: `${category.title.lt} receptai - Paragaujam.lt`,
        metaDescription: `Geriausi ${category.title.lt.toLowerCase()} receptai su nuotraukomis ir instrukcijomis.`,
        keywords: [category.title.lt.toLowerCase(), "receptai", "lietuviški"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('categories_new').insertOne(doc);
    insertedCategories.push({ ...doc, _id: result.insertedId });
    
    console.log(`✅ Inserted category: ${currentPath} (Level ${level})`);
    
    if (category.children) {
      await insertCategoriesRecursively(db, category.children, result.insertedId, currentPath, level + 1);
    }
  }
  
  return insertedCategories;
}

async function updateCategoryAncestors(db) {
  console.log('🔄 Updating category ancestors...');
  
  const categories = await db.collection('categories_new').find({}).sort({ level: 1 }).toArray();
  
  for (const category of categories) {
    if (category.parentId) {
      const ancestors = [];
      let currentParentId = category.parentId;
      
      while (currentParentId) {
        const parent = await db.collection('categories_new').findOne({ _id: currentParentId });
        if (parent) {
          ancestors.unshift({
            _id: parent._id,
            title: parent.title.lt,
            slug: parent.slug,
            path: parent.path,
            level: parent.level
          });
          currentParentId = parent.parentId;
        } else {
          break;
        }
      }
      
      await db.collection('categories_new').updateOne(
        { _id: category._id },
        { $set: { ancestors: ancestors } }
      );
    }
  }
  
  console.log('✅ Category ancestors updated');
}

async function populateCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🌳 Populating category structure...');
    
    // Clear existing categories_new if any
    await db.collection('categories_new').deleteMany({});
    
    // Insert categories recursively
    await insertCategoriesRecursively(db, categoryStructure);
    
    // Update ancestors
    await updateCategoryAncestors(db);
    
    // Verify insertion
    const totalCategories = await db.collection('categories_new').countDocuments();
    console.log(`📊 Total categories inserted: ${totalCategories}`);
    
    // Show category tree
    const rootCategories = await db.collection('categories_new').find({ level: 1 }).toArray();
    console.log('🌳 Category tree:');
    for (const root of rootCategories) {
      console.log(`  ${root.icon} ${root.title.lt} (${root.path})`);
    }
    
  } catch (error) {
    console.error('❌ Error populating categories:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  populateCategories()
    .then(() => {
      console.log('🎉 Category population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Category population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateCategories };
