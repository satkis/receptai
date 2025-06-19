// MongoDB Compass Script: Create Complete Categories Collection
// Based on categ-subcateg.md structure with SEO optimization

console.log('🏗️ Creating comprehensive categories_new collection...');

// Use the receptai database
use('receptai');
console.log('📊 Using database: receptai');

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
    metaTitle = `${title} receptai - ${parentTitle} | Paragaujam.lt`;
    metaDescription = `Geriausi ${lowerTitle} receptai su nuotraukomis ir detaliais gaminimo instrukcijomis. Autentiški lietuviški ir tarptautiniai ${lowerTitle} patiekalai.`;
    canonicalUrl = `https://paragaujam.lt/receptai/${createSlug(parentTitle)}/${slug}`;
  } else {
    metaTitle = `${title} receptai - Paragaujam.lt`;
    metaDescription = `Atraskite geriausius ${lowerTitle} receptus. Lengvi ir skanūs ${lowerTitle} patiekalai su nuotraukomis ir instrukcijomis kiekvienai dienai.`;
    canonicalUrl = `https://paragaujam.lt/receptai/${slug}`;
  }
  
  // Generate relevant keywords
  keywords = [
    lowerTitle,
    `${lowerTitle} receptai`,
    'lietuviški receptai',
    'maistas',
    'gaminimas'
  ];
  
  return { metaTitle, metaDescription, keywords, canonicalUrl };
}

// Helper function to generate filters based on category
function generateFilters(title, isSubcategory = false) {
  const filters = {
    manual: [],
    auto: [],
    timeFilters: ['iki-30-min', '30-60-min', '1-2-val']
  };
  
  const lowerTitle = title.toLowerCase();
  
  // Add specific filters based on category type
  if (lowerTitle.includes('sriub')) {
    filters.manual = [
      { value: 'karštos', label: 'Karštos', priority: 1 },
      { value: 'šaltos', label: 'Šaltos', priority: 2 },
      { value: 'tirštos', label: 'Tirštos', priority: 3 }
    ];
  } else if (lowerTitle.includes('mės') || lowerTitle.includes('jautien') || lowerTitle.includes('kiaulien')) {
    filters.manual = [
      { value: 'kepsniai', label: 'Kepsniai', priority: 1 },
      { value: 'troskiniai', label: 'Troškiniai', priority: 2 },
      { value: 'orkaiteje', label: 'Orkaitėje', priority: 3 }
    ];
  } else if (lowerTitle.includes('saldumyn') || lowerTitle.includes('desert')) {
    filters.manual = [
      { value: 'šokoladiniai', label: 'Šokoladiniai', priority: 1 },
      { value: 'vaisių', label: 'Su vaisiais', priority: 2 },
      { value: 'kreminis', label: 'Kreminiai', priority: 3 }
    ];
    filters.timeFilters.push('virs-2-val');
  }
  
  return filters;
}

// Complete category structure based on categ-subcateg.md
const categoryStructure = [
  // Patiekalų tipai
  {
    title: 'Karštieji patiekalai',
    subcategories: [
      'Kepsniai ir troškiniai',
      'Apkepai',
      'Košės ir tyrės',
      'Makaronai ir ryžiai',
      'Paukštienos patiekalai',
      'Mėsos patiekalai',
      'Žuvies patiekalai',
      'Vegetariški karštieji patiekalai'
    ]
  },
  {
    title: 'Sriubos',
    subcategories: [
      'Klasikinės sriubos',
      'Tirštos sriubos',
      'Trintos sriubos',
      'Šaltos sriubos',
      'Saldžios sriubos'
    ]
  },
  {
    title: 'Užkandžiai',
    subcategories: [
      'Vieno kąsnio',
      'Karšti užkandžiai',
      'Užkandžiai prie gėrimų',
      'Sumuštiniai'
    ]
  },
  {
    title: 'Salotos ir mišrainės',
    subcategories: [
      'Gaivios salotos',
      'Sočios salotos',
      'Šiltos salotos'
    ]
  },
  {
    title: 'Blynai ir vafliai',
    subcategories: [
      'Lietiniai',
      'Bulviniai',
      'Mieliniai',
      'Varškėčiai'
    ]
  },
  {
    title: 'Garnyrai',
    subcategories: [
      'Bulvių patiekalai',
      'Grikiai, ryžiai',
      'Makaronai',
      'Daržovės'
    ]
  },
  
  // Pagal pagrindinį ingredientą
  { title: 'Jautiena', subcategories: [] },
  { title: 'Kiauliena', subcategories: [] },
  { title: 'Žuvis', subcategories: [] },
  { title: 'Jūros gėrybės', subcategories: [] },
  {
    title: 'Paukštiena',
    subcategories: [
      'Vištiena',
      'Antiena',
      'Kalakutiena'
    ]
  },
  { title: 'Aviena / Veršiena / Žvėriena', subcategories: [] },
  { title: 'Kiaušiniai', subcategories: [] },
  { title: 'Pienas ir pieno produktai', subcategories: [] },
  { title: 'Sūris', subcategories: [] },
  { title: 'Daržovės', subcategories: [] },
  { title: 'Grybai', subcategories: [] },
  { title: 'Bulvės', subcategories: [] },
  { title: 'Makaronai', subcategories: [] },
  { title: 'Miltai ir kruopos', subcategories: [] },
  { title: 'Vaisiai ir uogos', subcategories: [] },
  { title: 'Soja', subcategories: [] },
  { title: 'Riešutai', subcategories: [] },
  { title: 'Šokoladas', subcategories: [] },
  
  // Saldumynai ir kepiniai
  { title: 'Desertai', subcategories: [] },
  {
    title: 'Pyragai',
    subcategories: [
      'Obuolių pyragai',
      'Šokoladiniai pyragai'
    ]
  },
  { title: 'Tortai', subcategories: [] },
  { title: 'Keksiukai ir keksai', subcategories: [] },
  { title: 'Sausainiai', subcategories: [] },
  { title: 'Ledai (naminiai)', subcategories: [] },
  { title: 'Saldūs apkepai', subcategories: [] },
  { title: 'Vafliai', subcategories: [] }
];

// Continue with more categories...
const additionalCategories = [
  // Mitybos pasirinkimai
  { title: 'Sveika mityba', subcategories: [] },
  { title: 'Vegetariški receptai', subcategories: [] },
  { title: 'Veganiški receptai', subcategories: [] },
  { title: 'Be glitimo', subcategories: [] },
  { title: 'Be laktozės', subcategories: [] },
  { title: 'Keto receptai', subcategories: [] },
  { title: 'Dietiniai receptai', subcategories: [] },
  
  // Pagal gaminimo laiką
  { title: 'Iki 30 minučių', subcategories: [] },
  { title: '30–60 minučių', subcategories: [] },
  { title: '1–2 valandos', subcategories: [] },
  { title: 'Virš 2 valandų', subcategories: [] },
  { title: 'Lėtai ruošiami', subcategories: [] },
  
  // Proginiai receptai
  { title: 'Gimtadieniui', subcategories: [] },
  { title: 'Kalėdoms', subcategories: [] },
  { title: 'Kūčioms', subcategories: [] },
  { title: 'Naujiesiems metams', subcategories: [] },
  { title: 'Velykoms', subcategories: [] },
  { title: 'Joninėms', subcategories: [] },
  { title: 'Užgavėnėms', subcategories: [] },
  { title: 'Valentino dienai', subcategories: [] },
  { title: 'Mamos / Tėvo dienai', subcategories: [] },
  { title: 'Pyragų dienai', subcategories: [] },
  { title: 'Helovinui', subcategories: [] },
  { title: 'Vestuvėms', subcategories: [] },
  { title: 'Iškyla / Piknikas', subcategories: [] },
  
  // Pasaulio virtuvės
  { title: 'Lietuviška', subcategories: [] },
  { title: 'Italų', subcategories: [] },
  { title: 'Prancūzų', subcategories: [] },
  { title: 'Meksikiečių', subcategories: [] },
  { title: 'Indų', subcategories: [] },
  { title: 'Kinų', subcategories: [] },
  { title: 'Japonų', subcategories: [] },
  { title: 'Tailando', subcategories: [] },
  { title: 'Amerikos', subcategories: [] },
  { title: 'Graikų', subcategories: [] },
  { title: 'Turkų', subcategories: [] },
  { title: 'Ispanų', subcategories: [] },
  { title: 'Skandinaviška', subcategories: [] },
  { title: 'Vokiška', subcategories: [] },
  { title: 'Ukrainiečių', subcategories: [] },
  { title: 'Lenkų', subcategories: [] },
  { title: 'Latvijos', subcategories: [] },
  { title: 'Kitos pasaulio virtuvės', subcategories: [] },
  
  // Gėrimai
  {
    title: 'Nealkoholiniai',
    subcategories: [
      'Arbata, kava',
      'Kompotai, kisieliai',
      'Gira'
    ]
  },
  { title: 'Alkoholiniai kokteiliai', subcategories: [] },
  
  // Papildomai / Kiti
  { title: 'Padažai ir užpilai', subcategories: [] },
  { title: 'Kremai', subcategories: [] },
  {
    title: 'Konservavimas ir marinatai',
    subcategories: [
      'Uogienės',
      'Raugintos daržovės',
      'Atsargos žiemai'
    ]
  },
  { title: 'Neįprasti / Egzotiški patiekalai', subcategories: [] },
  { title: 'Ekonomiški receptai', subcategories: [] },
  { title: 'Aštrūs ir pikantiški', subcategories: [] },
  { title: 'Pietūs į darbą', subcategories: [] }
];

// Combine all categories
const allCategories = [...categoryStructure, ...additionalCategories];

console.log(`📊 Total categories to create: ${allCategories.length}`);
console.log(`📊 Total subcategories: ${allCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}`);

// Clear existing categories
console.log('🗑️ Clearing existing categories...');
db.categories_new.deleteMany({});

// Create categories
const categoriesToInsert = [];
let insertOrder = 1;

allCategories.forEach((category) => {
  const mainSlug = createSlug(category.title);
  const mainPath = mainSlug;
  const seo = generateSEO(category.title);
  const filters = generateFilters(category.title);
  
  // Create main category
  const mainCategory = {
    path: mainPath,
    parentPath: null,
    level: 1,
    title: { lt: category.title },
    slug: mainSlug,
    seo: seo,
    filters: filters,
    isActive: true,
    sortOrder: insertOrder++,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categoriesToInsert.push(mainCategory);
  
  // Create subcategories
  category.subcategories.forEach((subcategoryTitle) => {
    const subSlug = createSlug(subcategoryTitle);
    const subPath = `${mainPath}/${subSlug}`;
    const subSeo = generateSEO(subcategoryTitle, true, category.title);
    const subFilters = generateFilters(subcategoryTitle, true);
    
    const subcategory = {
      path: subPath,
      parentPath: mainPath,
      level: 2,
      title: { lt: subcategoryTitle },
      slug: subSlug,
      seo: subSeo,
      filters: subFilters,
      isActive: true,
      sortOrder: insertOrder++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categoriesToInsert.push(subcategory);
  });
});

// Insert all categories
console.log('📝 Inserting categories...');
const result = db.categories_new.insertMany(categoriesToInsert);

console.log(`✅ Successfully created ${result.insertedIds.length} categories!`);

// Create indexes for performance
console.log('📊 Creating indexes...');
try {
  db.categories_new.createIndex({ "path": 1 }, { unique: true });
  db.categories_new.createIndex({ "parentPath": 1, "sortOrder": 1 });
  db.categories_new.createIndex({ "level": 1, "isActive": 1 });
  db.categories_new.createIndex({ "slug": 1 });
  console.log('✅ Indexes created successfully');
} catch (error) {
  console.log('⚠️ Some indexes may already exist');
}

// Show summary
const mainCategories = db.categories_new.find({ level: 1 }).count();
const subcategories = db.categories_new.find({ level: 2 }).count();

console.log('\n🎉 Categories creation completed!');
console.log(`📊 Main categories: ${mainCategories}`);
console.log(`📊 Subcategories: ${subcategories}`);
console.log(`📊 Total: ${mainCategories + subcategories}`);

// Show sample categories
console.log('\n📋 Sample categories created:');
db.categories_new.find({ level: 1 }).limit(5).forEach(cat => {
  console.log(`  🔸 ${cat.title.lt} (${cat.path})`);
});

console.log('\n📋 Sample subcategories created:');
db.categories_new.find({ level: 2 }).limit(5).forEach(cat => {
  console.log(`  🔹 ${cat.title.lt} (${cat.path})`);
});

console.log('\n🚀 Your category menu is ready to use!');
