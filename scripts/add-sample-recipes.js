// Add sample recipes for testing category filters
// Run with: node scripts/add-sample-recipes.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function addSampleRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log('Adding sample recipes for karsti-patiekalai category...');

  const sampleRecipes = [
    {
      slug: "vistienos-kepsnys-su-grybais",
      title: {
        lt: "Vištienos kepsnys su grybais",
        en: "Chicken breast with mushrooms"
      },
      description: {
        lt: "Sultingas vištienos kepsnys su grybais. Lengvas ir skanus receptas šeimai.",
        en: "Juicy chicken breast with mushrooms. Easy and delicious recipe for family."
      },
      
      // Recipe data
      servings: 4,
      servingsUnit: "porcijos",
      totalTimeMinutes: 35,
      difficulty: "lengvas",
      
      // Ingredients
      ingredients: [
        {
          name: { lt: "Vištienos krūtinėlė" },
          quantity: "500g",
          vital: true
        },
        {
          name: { lt: "Grybai" },
          quantity: "300g", 
          vital: true
        },
        {
          name: { lt: "Svogūnas" },
          quantity: "1 vnt",
          vital: false
        }
      ],
      
      // Instructions
      instructions: [
        {
          step: 1,
          text: {
            lt: "Paruošti vištienos krūtinėlę - nuplakti, pašaldyti druska ir pipirais."
          }
        },
        {
          step: 2,
          text: {
            lt: "Supjaustyti grybus ir svogūną."
          }
        }
      ],
      
      // Image
      image: {
        url: "/images/vistienos-kepsnys.jpg",
        alt: "Vištienos kepsnys su grybais",
        width: 1200,
        height: 800
      },
      
      // Categorization
      categoryPath: "karsti-patiekalai",
      
      // Tags for filtering
      tags: ["kepsniai", "is vistenos", "grybai", "lengvas"],
      
      // Author
      author: {
        name: "Paragaujam.lt",
        profileUrl: "/user/system"
      },
      
      // Status
      status: "published",
      featured: false,
      trending: false,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    },
    
    {
      slug: "jautienos-troskinys-su-bulvemis",
      title: {
        lt: "Jautienos troškinys su bulvėmis",
        en: "Beef stew with potatoes"
      },
      description: {
        lt: "Tradicinis jautienos troškinys su bulvėmis ir daržovėmis. Šiltas ir sotus patiekalas.",
        en: "Traditional beef stew with potatoes and vegetables. Warm and hearty dish."
      },
      
      servings: 6,
      servingsUnit: "porcijos",
      totalTimeMinutes: 120,
      difficulty: "vidutinis",
      
      ingredients: [
        {
          name: { lt: "Jautienos mėsa" },
          quantity: "800g",
          vital: true
        },
        {
          name: { lt: "Bulvės" },
          quantity: "1kg",
          vital: true
        },
        {
          name: { lt: "Morkos" },
          quantity: "3 vnt",
          vital: true
        }
      ],
      
      instructions: [
        {
          step: 1,
          text: {
            lt: "Supjaustyti jautienos mėsą kubeliais."
          }
        },
        {
          step: 2,
          text: {
            lt: "Apkepti mėsą keptuvėje iki auksinės spalvos."
          }
        }
      ],
      
      image: {
        url: "/images/jautienos-troskinys.jpg",
        alt: "Jautienos troškinys su bulvėmis",
        width: 1200,
        height: 800
      },
      
      categoryPath: "karsti-patiekalai",
      tags: ["troskiniai", "jautiena", "bulves", "vidutinis"],
      
      author: {
        name: "Paragaujam.lt",
        profileUrl: "/user/system"
      },
      
      status: "published",
      featured: true,
      trending: false,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    },
    
    {
      slug: "bulviu-apkepas-su-suriu",
      title: {
        lt: "Bulvių apkepas su sūriu",
        en: "Potato casserole with cheese"
      },
      description: {
        lt: "Kreminis bulvių apkepas su sūriu ir grietine. Puikus garnyras arba atskiras patiekalas.",
        en: "Creamy potato casserole with cheese and cream. Great side dish or standalone meal."
      },
      
      servings: 8,
      servingsUnit: "porcijos",
      totalTimeMinutes: 75,
      difficulty: "lengvas",
      
      ingredients: [
        {
          name: { lt: "Bulvės" },
          quantity: "1.5kg",
          vital: true
        },
        {
          name: { lt: "Sūris" },
          quantity: "200g",
          vital: true
        },
        {
          name: { lt: "Grietinė" },
          quantity: "300ml",
          vital: true
        }
      ],
      
      instructions: [
        {
          step: 1,
          text: {
            lt: "Nulupti ir supjaustyti bulves plonais griežinėliais."
          }
        },
        {
          step: 2,
          text: {
            lt: "Sudėti bulves į kepimo formą sluoksniais."
          }
        }
      ],
      
      image: {
        url: "/images/bulviu-apkepas.jpg",
        alt: "Bulvių apkepas su sūriu",
        width: 1200,
        height: 800
      },
      
      categoryPath: "karsti-patiekalai",
      tags: ["apkepai", "bulves", "suris", "lengvas"],
      
      author: {
        name: "Paragaujam.lt",
        profileUrl: "/user/system"
      },
      
      status: "published",
      featured: false,
      trending: true,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    }
  ];

  // Insert recipes
  const result = await db.collection('recipes_new').insertMany(sampleRecipes);
  console.log(`✅ Added ${result.insertedCount} sample recipes`);
  
  // Show what was added
  console.log('\n📋 Added recipes:');
  sampleRecipes.forEach(recipe => {
    console.log(`- ${recipe.title.lt} (${recipe.totalTimeMinutes}min, tags: ${recipe.tags.join(', ')})`);
  });

  await client.close();
  console.log('\n🎉 Done! You can now test the filters at http://localhost:3000/receptai/karsti-patiekalai');
}

addSampleRecipes().catch(console.error);
