// MongoDB Compass Script: Create Complete Categories with SEO Optimization
// Based on categ-subcateg.md - Run in receptai database

console.log('🏗️ Creating comprehensive categories_new collection with SEO optimization...');

// Verify we're in the receptai database
console.log('📊 Current database:', db.getName());
if (db.getName() !== 'receptai') {
  console.log('⚠️ Please connect to the receptai database first!');
}

// Helper function to create slug from Lithuanian text
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e').replace(/ė/g, 'e')
    .replace(/į/g, 'i').replace(/š/g, 's').replace(/ų/g, 'u').replace(/ū/g, 'u')
    .replace(/ž/g, 'z').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to generate SEO-optimized content
function generateSEO(title, isSubcategory = false, parentTitle = '') {
  const slug = createSlug(title);
  const lowerTitle = title.toLowerCase();
  
  let metaTitle, metaDescription, keywords, canonicalUrl;
  
  // SEO content mapping for specific categories
  const seoContent = {
    // Patiekalų tipai
    'Karštieji patiekalai': {
      desc: 'Atraskite geriausius karštųjų patiekalų receptus lietuviškai virtuvei. Nuo tradicinių kepsnių iki šiuolaikinių apkepų - visi receptai su detaliais gaminimo žingsniais. Puikus pasirinkimas šeimos pietums ir vakarienėms.',
      keywords: ['karšti patiekalai', 'kepsniai', 'troškiniai', 'apkepai', 'lietuviška virtuvė']
    },
    'Kepsniai ir troškiniai': {
      desc: 'Sultingi kepsniai ir aromatingi troškiniai - klasikiniai lietuviški patiekalai šeimos stalui. Mėsos, paukštienos ir žuvies receptai su tradiciniais prieskoniais. Idealūs šaltam sezonui ir šventiniam stalui.',
      keywords: ['kepsniai', 'troškiniai', 'mėsos patiekalai', 'lietuviški kepsniai', 'šeimos receptai']
    },
    'Sriubos': {
      desc: 'Šildančios ir maistingos sriubos kiekvienai dienai - nuo klasikinių lietuviškų iki egzotiškų pasaulio virtuvių. Lengvos daržovių sriubos ir sočios mėsos sriubos su tradiciniais receptais. Tobulas pasirinkimas pietums.',
      keywords: ['sriubos', 'lietuviškos sriubos', 'daržovių sriubos', 'mėsos sriubos', 'šaltibarščiai']
    },
    'Klasikinės sriubos': {
      desc: 'Tradicinės lietuviškos sriubos, perduodamos iš kartos į kartą. Šaltibarščiai, kopūstų sriuba, grybų sriuba ir kitos klasikos. Autentiški receptai su tikrais lietuviškais skoniais ir aromatais.',
      keywords: ['klasikinės sriubos', 'šaltibarščiai', 'kopūstų sriuba', 'lietuviškos tradicijos', 'autentiški receptai']
    },
    
    // Pagal ingredientą
    'Jautiena': {
      desc: 'Aukštos kokybės jautienos receptai - nuo klasikinių kepsnių iki šiuolaikinių kulinarijos sprendimų. Sultingi steikai, aromatingi troškiniai ir šventiniai patiekalai. Profesionalūs patarimai mėsos ruošimui ir gaminimui.',
      keywords: ['jautienos receptai', 'jautienos kepsniai', 'steikai', 'jautienos troškinys', 'mėsos gaminimas']
    },
    'Kiauliena': {
      desc: 'Skanūs kiaulienos patiekalai lietuviškai virtuvei - nuo kasdienių receptų iki šventinių specialybių. Kumpiai, šonkauliai, kotletai ir tradiciniai lietuviški patiekalai. Ekonomiški ir maistingi sprendimai šeimai.',
      keywords: ['kiaulienos receptai', 'kiaulienos kepsniai', 'šonkauliai', 'lietuviška kiauliena', 'šeimos receptai']
    },
    'Žuvis': {
      desc: 'Sveikas ir skanus žuvies gaminimas - jūros ir gėlavandenės žuvies receptai su lietuviškais akcentais. Kepta, virta, rūkyta žuvis ir žuvies patiekalai šventėms. Maistingi ir lengvi receptai sveikai mitybai.',
      keywords: ['žuvies receptai', 'kepta žuvis', 'žuvies patiekalai', 'sveika mityba', 'jūros gėrybės']
    },
    'Vištiena': {
      desc: 'Universalūs vištienos receptai kiekvienai dienai - nuo greitų sparnelių iki šventinės vištos su įdaru. Sultingi krūtinėlės kepsniai, aromatingi šlaunelių troškiniai ir sveiki salotų receptai su vištiena.',
      keywords: ['vištienos receptai', 'vištienos kepsniai', 'vištos sparneliai', 'vištienos salotos', 'paukštienos gaminimas']
    },
    
    // Saldumynai
    'Desertai': {
      desc: 'Saldūs desertai ir gardumynai namų virtuvėje - nuo klasikinių lietuviškų iki šiuolaikinių kulinarijos tendencijų. Kremų, pudingų ir vaisių desertų receptai šventėms ir kasdienybei. Lengvi ir sudėtingi receptai pradedantiesiems ir profesionalams.',
      keywords: ['desertai', 'saldumynai', 'kremai', 'pudingas', 'lietuviški desertai']
    },
    'Pyragai': {
      desc: 'Naminio kepimo pyragai - nuo paprastų obuolių pyragų iki iškilmingų tortų. Tradiciniai lietuviški pyragai ir tarptautinės klasikos receptai. Kepimo patarimai ir dekoravimo idėjos šventėms.',
      keywords: ['pyragai', 'naminis kepimas', 'obuolių pyragai', 'šokoladiniai pyragai', 'kepimo receptai']
    },
    
    // Mitybos pasirinkimai
    'Vegetariški receptai': {
      desc: 'Skanūs ir maistingi vegetariški patiekalai - daržovių, grūdų ir ankštinių augalų receptai pilnaverčiai mitybai. Lietuviški vegetariški sprendimai ir tarptautinės virtuvės. Sveika ir skani alternatyva mėsos patiekalams.',
      keywords: ['vegetariški receptai', 'daržovių patiekalai', 'sveika mityba', 'augaliniai baltymai', 'vegetariškas maistas']
    },
    'Veganiški receptai': {
      desc: 'Pilnavertis veganiškas meniu - receptai be gyvūninės kilmės produktų, turtingi vitaminais ir mineralais. Kūrybiški augaliniai patiekalai, desertai be kiaušinių ir pieno. Sveikos mitybos sprendimai šiuolaikiniam gyvenimo būdui.',
      keywords: ['veganiški receptai', 'augalinis maistas', 'be gyvūninių produktų', 'sveika mityba', 'veganiškas gyvenimo būdas']
    },
    
    // Proginiai
    'Kalėdoms': {
      desc: 'Tradiciniai kalėdiniai patiekalai lietuviškai šventei - nuo šventinio stalo iki saldžių dovanų. Kalėdų pyragai, kepsniai, saldumynai ir gėrimai šeimos susibūrimams. Autentiški receptai kalėdinei nuotaikai kurti.',
      keywords: ['kalėdiniai receptai', 'kalėdų stalas', 'šventiniai patiekalai', 'kalėdų pyragai', 'lietuviškos kalėdos']
    },
    'Velykoms': {
      desc: 'Velykų šventės receptai - margučiai, velykinis pyragas, šventinis stalas ir pavasario patiekalai. Tradiciniai lietuviški Velykų papročiai virtuvėje ir šiuolaikiniai sprendimai šeimos šventei. Pavasario šviežumo receptai.',
      keywords: ['velykų receptai', 'margučiai', 'velykinis pyragas', 'šventinis stalas', 'pavasario patiekalai']
    },
    
    // Pasaulio virtuvės
    'Lietuviška': {
      desc: 'Autentiška lietuviška virtuvė - tradiciniai receptai, perduodami iš kartos į kartą. Cepelinai, kugelis, šaltibarščiai ir kiti tautiniai patiekalai. Lietuvos regionų kulinarijos paveldas ir šiuolaikiniai interpretavimai.',
      keywords: ['lietuviška virtuvė', 'cepelinai', 'kugelis', 'šaltibarščiai', 'tradiciniai receptai']
    },
    'Italų': {
      desc: 'Tikroji italų virtuvė namų aplinkoje - pasta, pica, risotto ir autentiški Italijos regionų receptai. Nuo paprasto spagečių su pomidorais iki sudėtingo osso buco. Italų kulinarijos tradicijos ir šiuolaikiniai sprendimai.',
      keywords: ['italų virtuvė', 'pasta', 'pica', 'risotto', 'italų receptai']
    }
  };
  
  // Generate SEO content
  if (isSubcategory) {
    const parentSlug = createSlug(parentTitle);
    metaTitle = `${title} receptai - ${parentTitle} | Paragaujam.lt`;
    canonicalUrl = `https://paragaujam.lt/receptai/${parentSlug}/${slug}`;
    
    if (seoContent[title]) {
      metaDescription = seoContent[title].desc;
      keywords = seoContent[title].keywords;
    } else {
      metaDescription = `Geriausi ${lowerTitle} receptai su nuotraukomis ir detaliais gaminimo instrukcijomis. Autentiški lietuviški ir tarptautiniai ${lowerTitle} patiekalai šeimos stalui.`;
      keywords = [lowerTitle, `${lowerTitle} receptai`, 'lietuviški receptai', 'maistas', 'gaminimas'];
    }
  } else {
    metaTitle = `${title} receptai - Paragaujam.lt`;
    canonicalUrl = `https://paragaujam.lt/receptai/${slug}`;
    
    if (seoContent[title]) {
      metaDescription = seoContent[title].desc;
      keywords = seoContent[title].keywords;
    } else {
      metaDescription = `Atraskite geriausius ${lowerTitle} receptus. Lengvi ir skanūs ${lowerTitle} patiekalai su nuotraukomis ir instrukcijomis kiekvienai dienai.`;
      keywords = [lowerTitle, `${lowerTitle} receptai`, 'lietuviški receptai', 'maistas', 'gaminimas'];
    }
  }
  
  return { metaTitle, metaDescription, keywords, canonicalUrl };
}

// Complete category structure from categ-subcateg.md
const categoryStructure = [
  // Patiekalų tipai
  {
    title: 'Karštieji patiekalai',
    subcategories: ['Kepsniai ir troškiniai', 'Apkepai', 'Košės ir tyrės', 'Makaronai ir ryžiai', 'Paukštienos patiekalai', 'Mėsos patiekalai', 'Žuvies patiekalai', 'Vegetariški karštieji patiekalai']
  },
  {
    title: 'Sriubos',
    subcategories: ['Klasikinės sriubos', 'Tirštos sriubos', 'Trintos sriubos', 'Šaltos sriubos', 'Saldžios sriubos']
  },
  {
    title: 'Užkandžiai',
    subcategories: ['Vieno kąsnio', 'Karšti užkandžiai', 'Užkandžiai prie gėrimų', 'Sumuštiniai']
  },
  {
    title: 'Salotos ir mišrainės',
    subcategories: ['Gaivios salotos', 'Sočios salotos', 'Šiltos salotos']
  },
  {
    title: 'Blynai ir vafliai',
    subcategories: ['Lietiniai', 'Bulviniai', 'Mieliniai', 'Varškėčiai']
  },
  {
    title: 'Garnyrai',
    subcategories: ['Bulvių patiekalai', 'Grikiai, ryžiai', 'Makaronai', 'Daržovės']
  },
  
  // Pagal pagrindinį ingredientą
  { title: 'Jautiena', subcategories: [] },
  { title: 'Kiauliena', subcategories: [] },
  { title: 'Žuvis', subcategories: [] },
  { title: 'Jūros gėrybės', subcategories: [] },
  {
    title: 'Paukštiena',
    subcategories: ['Vištiena', 'Antiena', 'Kalakutiena']
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
    subcategories: ['Obuolių pyragai', 'Šokoladiniai pyragai']
  },
  { title: 'Tortai', subcategories: [] },
  { title: 'Keksiukai ir keksai', subcategories: [] },
  { title: 'Sausainiai', subcategories: [] },
  { title: 'Ledai (naminiai)', subcategories: [] },
  { title: 'Saldūs apkepai', subcategories: [] },
  { title: 'Vafliai', subcategories: [] },

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
    subcategories: ['Arbata, kava', 'Kompotai, kisieliai', 'Gira']
  },
  { title: 'Alkoholiniai kokteiliai', subcategories: [] },

  // Papildomai / Kiti
  { title: 'Padažai ir užpilai', subcategories: [] },
  { title: 'Kremai', subcategories: [] },
  {
    title: 'Konservavimas ir marinatai',
    subcategories: ['Uogienės', 'Raugintos daržovės', 'Atsargos žiemai']
  },
  { title: 'Neįprasti / Egzotiški patiekalai', subcategories: [] },
  { title: 'Ekonomiški receptai', subcategories: [] },
  { title: 'Aštrūs ir pikantiški', subcategories: [] },
  { title: 'Pietūs į darbą', subcategories: [] }
];

console.log(`📊 Creating ${categoryStructure.length} main categories...`);

// Clear existing categories
console.log('🗑️ Clearing existing categories_new...');
db.categories_new.deleteMany({});

// Create categories
const categoriesToInsert = [];
let sortOrder = 1;

categoryStructure.forEach((category) => {
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
    sortOrder: sortOrder++,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categoriesToInsert.push(mainCategory);
  
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
      sortOrder: sortOrder++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categoriesToInsert.push(subcategory);
  });
});

console.log(`📝 Prepared ${categoriesToInsert.length} categories for insertion...`);

// Insert all categories
try {
  const result = db.categories_new.insertMany(categoriesToInsert);
  console.log(`✅ Successfully created ${result.insertedIds.length} categories!`);
  
  // Create indexes
  console.log('📊 Creating indexes...');
  try {
    db.categories_new.createIndex({ "path": 1 }, { unique: true });
    db.categories_new.createIndex({ "parentPath": 1, "sortOrder": 1 });
    db.categories_new.createIndex({ "level": 1, "isActive": 1 });
    db.categories_new.createIndex({ "slug": 1 });
    console.log('✅ Indexes created successfully');
  } catch (indexError) {
    console.log('⚠️ Some indexes may already exist');
  }
  
  // Show summary
  const mainCount = db.categories_new.find({ level: 1 }).count();
  const subCount = db.categories_new.find({ level: 2 }).count();
  
  console.log('\n🎉 Categories creation completed!');
  console.log(`📊 Main categories: ${mainCount}`);
  console.log(`📊 Subcategories: ${subCount}`);
  console.log(`📊 Total: ${mainCount + subCount}`);
  
  console.log('\n📋 Sample main categories:');
  db.categories_new.find({ level: 1 }).limit(5).forEach(cat => {
    console.log(`  🔸 ${cat.title.lt} (${cat.path})`);
  });
  
  console.log('\n🚀 SEO-optimized categories ready for your website!');
  
} catch (error) {
  console.error('❌ Error creating categories:', error);
}
