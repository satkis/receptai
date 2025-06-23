// MongoDB Compass Script: Create Categories in receptai database
// Run this in MongoDB Compass shell when connected to receptai database

console.log('🏗️ Creating categories in receptai database...');

// Verify we're in the right database
console.log('📊 Current database:', db.getName());
if (db.getName() !== 'receptai') {
  console.log('⚠️ Please connect to the receptai database first!');
  console.log('💡 In MongoDB Compass: Select "receptai" database from dropdown');
}

// Helper function to create slug from Lithuanian text
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/č/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ė/g, 'e')
    .replace(/į/g, 'i')
    .replace(/š/g, 's')
    .replace(/ų/g, 'u')
    .replace(/ū/g, 'u')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to generate SEO data
function generateSEO(title, isSubcategory = false, parentTitle = '') {
  const slug = createSlug(title);
  const lowerTitle = title.toLowerCase();
  
  let metaTitle, metaDescription, keywords, canonicalUrl;
  
  if (isSubcategory) {
    metaTitle = `${title} receptai - ${parentTitle} | Ragaujam.lt`;
    metaDescription = `Geriausi ${lowerTitle} receptai su nuotraukomis ir detaliais gaminimo instrukcijomis. Autentiški lietuviški ir tarptautiniai ${lowerTitle} patiekalai.`;
    canonicalUrl = `https://ragaujam.lt/receptai/${createSlug(parentTitle)}/${slug}`;
  } else {
    metaTitle = `${title} receptai - Ragaujam.lt`;
    metaDescription = `Atraskite geriausius ${lowerTitle} receptus. Lengvi ir skanūs ${lowerTitle} patiekalai su nuotraukomis ir instrukcijomis kiekvienai dienai.`;
    canonicalUrl = `https://ragaujam.lt/receptai/${slug}`;
  }
  
  keywords = [lowerTitle, `${lowerTitle} receptai`, 'lietuviški receptai', 'maistas', 'gaminimas'];
  
  return { metaTitle, metaDescription, keywords, canonicalUrl };
}

// Sample categories to test (we'll start with just a few)
const testCategories = [
  {
    title: 'Karštieji patiekalai',
    subcategories: [
      'Kepsniai ir troškiniai',
      'Apkepai',
      'Košės ir tyrės'
    ]
  },
  {
    title: 'Sriubos',
    subcategories: [
      'Klasikinės sriubos',
      'Tirštos sriubos',
      'Šaltos sriubos'
    ]
  },
  {
    title: 'Jautiena',
    subcategories: []
  },
  {
    title: 'Kiauliena', 
    subcategories: []
  },
  {
    title: 'Desertai',
    subcategories: []
  }
];

console.log(`📊 Creating ${testCategories.length} test categories...`);

// Clear existing categories_new collection
console.log('🗑️ Clearing existing categories_new...');
db.categories_new.deleteMany({});

// Create categories
const categoriesToInsert = [];
let insertOrder = 1;

testCategories.forEach((category) => {
  const mainSlug = createSlug(category.title);
  const mainPath = mainSlug;
  const seo = generateSEO(category.title);
  
  // Create main category
  const mainCategory = {
    path: mainPath,
    parentPath: null,
    level: 1,
    title: { lt: category.title },
    slug: mainSlug,
    seo: seo,
    filters: {
      manual: [],
      auto: [],
      timeFilters: ['iki-30-min', '30-60-min', '1-2-val']
    },
    isActive: true,
    sortOrder: insertOrder++,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categoriesToInsert.push(mainCategory);
  console.log(`📝 Prepared main category: ${category.title} (${mainPath})`);
  
  // Create subcategories
  category.subcategories.forEach((subcategoryTitle) => {
    const subSlug = createSlug(subcategoryTitle);
    const subPath = `${mainPath}/${subSlug}`;
    const subSeo = generateSEO(subcategoryTitle, true, category.title);
    
    const subcategory = {
      path: subPath,
      parentPath: mainPath,
      level: 2,
      title: { lt: subcategoryTitle },
      slug: subSlug,
      seo: subSeo,
      filters: {
        manual: [],
        auto: [],
        timeFilters: ['iki-30-min', '30-60-min']
      },
      isActive: true,
      sortOrder: insertOrder++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categoriesToInsert.push(subcategory);
    console.log(`📝 Prepared subcategory: ${subcategoryTitle} (${subPath})`);
  });
});

// Insert all categories
console.log(`📝 Inserting ${categoriesToInsert.length} categories...`);

try {
  const result = db.categories_new.insertMany(categoriesToInsert);
  console.log(`✅ Successfully created ${result.insertedIds.length} categories!`);
  
  // Verify insertion
  const count = db.categories_new.countDocuments();
  console.log(`📊 Total documents in categories_new: ${count}`);
  
  // Show created categories
  console.log('\n📋 Created categories:');
  db.categories_new.find({ level: 1 }).forEach(cat => {
    console.log(`  🔸 ${cat.title.lt} (${cat.path})`);
  });
  
  console.log('\n📋 Created subcategories:');
  db.categories_new.find({ level: 2 }).forEach(cat => {
    console.log(`  🔹 ${cat.title.lt} (${cat.path})`);
  });
  
  // Create indexes
  console.log('\n📊 Creating indexes...');
  try {
    db.categories_new.createIndex({ "path": 1 }, { unique: true });
    db.categories_new.createIndex({ "parentPath": 1, "sortOrder": 1 });
    db.categories_new.createIndex({ "level": 1, "isActive": 1 });
    db.categories_new.createIndex({ "slug": 1 });
    console.log('✅ Indexes created successfully');
  } catch (indexError) {
    console.log('⚠️ Some indexes may already exist:', indexError.message);
  }
  
  console.log('\n🎉 Test categories created successfully!');
  console.log('🧪 Test your navigation menu now!');
  
} catch (error) {
  console.error('❌ Error inserting categories:', error);
  console.log('💡 Make sure you are connected to the receptai database');
}
