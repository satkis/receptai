require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function addMissingCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('➕ Adding missing categories...');
  
  const missingCategories = [
    {
      path: "sriubos",
      parentPath: null,
      level: 1,
      title: { lt: "Sriubos" },
      slug: "sriubos",
      seo: {
        metaTitle: "Sriubos - receptai | Paragaujam.lt",
        metaDescription: "Geriausi sriubų receptai. Šiltos ir šaltos sriubos, vegetariškos ir mėsiškos.",
        keywords: ["sriubos", "vegetariška sriuba", "pupelių sriuba", "žiemos sriubos"],
        canonicalUrl: "https://paragaujam.lt/receptai/sriubos"
      },
      filters: {
        manual: [
          { value: "vegetariška", label: "Vegetariška", priority: 1 },
          { value: "pupelės", label: "Su pupelėmis", priority: 2 },
          { value: "daržovės", label: "Daržovių", priority: 3 },
          { value: "žiemai", label: "Žiemos", priority: 4 }
        ],
        auto: [],
        timeFilters: ["30-60-min", "1-2-val", "virs-2-val"]
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  for (const category of missingCategories) {
    // Check if category already exists
    const existing = await db.collection('categories_new').findOne({ path: category.path });
    
    if (existing) {
      console.log(`ℹ️  Category already exists: ${category.path}`);
    } else {
      await db.collection('categories_new').insertOne(category);
      console.log(`✅ Added category: ${category.path} (${category.title.lt})`);
    }
  }
  
  // Update karsti-patiekalai filters to include the new tags
  console.log('\n🔄 Updating karsti-patiekalai filters...');
  
  await db.collection('categories_new').updateOne(
    { path: "karsti-patiekalai" },
    {
      $set: {
        "filters.manual": [
          { value: "kepsniai", label: "Kepsniai", priority: 1 },
          { value: "is vistenos", label: "Iš vištienos", priority: 2 },
          { value: "apkepai", label: "Apkepai", priority: 3 },
          { value: "bendri", label: "Bendri", priority: 4 },
          { value: "greitas", label: "Greitas", priority: 5 },
          { value: "paprastas", label: "Paprastas", priority: 6 }
        ],
        updatedAt: new Date()
      }
    }
  );
  
  console.log('✅ Updated karsti-patiekalai filters');
  
  // Show final category list
  console.log('\n📊 All categories:');
  const allCategories = await db.collection('categories_new').find({}).toArray();
  
  allCategories.forEach(cat => {
    console.log(`- ${cat.path} (${cat.title.lt})`);
    console.log(`  Filters: ${cat.filters.manual.map(f => f.label).join(', ')}`);
    console.log('');
  });
  
  await client.close();
  console.log('🎉 Done! You can now visit both category pages.');
}

addMissingCategories().catch(console.error);
