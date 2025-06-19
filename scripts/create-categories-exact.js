// MongoDB Compass Script: Create Categories from categ-subcateg.md
// Run in receptai database - Creates only main categories as specified

console.log('🏗️ Creating categories from categ-subcateg.md...');

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

// Helper function to generate SEO content
function generateSEO(title) {
  const slug = createSlug(title);
  const lowerTitle = title.toLowerCase();
  
  // SEO content mapping for specific categories
  const seoContent = {
    // Receptai pagal tipą
    'Garnyrai': {
      desc: 'Skanūs ir maistingi garnyrai kiekvienai dienai - bulvių, ryžių, makaronų ir daržovių patiekalai. Puikus papildymas prie mėsos, žuvies ar vegetariškų patiekalų. Lengvi ir greitai pagaminami garnyrai šeimos stalui.',
      keywords: ['garnyrai', 'bulvių garnyrai', 'ryžių garnyrai', 'daržovių garnyrai', 'makaronų garnyrai']
    },
    'Kepsniai': {
      desc: 'Sultingi ir aromatingi kepsniai - mėsos, paukštienos ir žuvies receptai orkaitėje ir keptuvėje. Nuo klasikinių lietuviškų kepsnių iki tarptautinių specialybių. Tobulas pasirinkimas šeimos pietums ir šventiniam stalui.',
      keywords: ['kepsniai', 'mėsos kepsniai', 'vištienos kepsniai', 'žuvies kepsniai', 'orkaitėje kepti']
    },
    'Sriubos': {
      desc: 'Šildančios ir maistingos sriubos visoms metų laikoms - nuo lengvų daržovių sriubų iki sočių mėsos sriubų. Klasikinės lietuviškos sriubos ir tarptautinės virtuvės receptai. Idealus pasirinkimas pietums ir vakarienei.',
      keywords: ['sriubos', 'lietuviškos sriubos', 'daržovių sriubos', 'mėsos sriubos', 'šaltibarščiai']
    },
    'Troškiniai': {
      desc: 'Aromatingi ir sotūs troškiniai lėtam gaminimui - mėsos, daržovių ir mišrūs patiekalai. Tradiciniai lietuviški troškiniai ir šiuolaikiniai sprendimai. Puikus pasirinkimas šeimos vakarienei ir šventiniam stalui.',
      keywords: ['troškiniai', 'mėsos troškiniai', 'daržovių troškiniai', 'lietuviški troškiniai', 'lėtas gaminimas']
    },
    'Salotos': {
      desc: 'Gaivios ir maistingos salotos kiekvienai progai - nuo lengvų vasaros salotų iki sočių žiemos mišrainių. Daržovių, mėsos ir žuvies salotos su originaliais padažais. Sveikos mitybos sprendimai.',
      keywords: ['salotos', 'daržovių salotos', 'mėsos salotos', 'žuvies salotos', 'sveikos salotos']
    },
    'Užkandžiai': {
      desc: 'Skanūs užkandžiai svečių priėmimui ir kasdienybei - nuo greitų užkandėlių iki iškilmingų kanapių. Karšti ir šalti užkandžiai, sumuštiniai ir originalūs sprendimai vaišėms.',
      keywords: ['užkandžiai', 'karšti užkandžiai', 'šalti užkandžiai', 'kanapės', 'sumuštiniai']
    },
    
    // Pagrindinis ingredientas
    'Jautiena': {
      desc: 'Aukštos kokybės jautienos receptai - nuo klasikinių steikų iki aromatingų troškinių. Sultingi kepsniai, šventiniai patiekalai ir kasdieniai sprendimai. Profesionalūs patarimai jautienos ruošimui ir gaminimui.',
      keywords: ['jautienos receptai', 'jautienos kepsniai', 'steikai', 'jautienos troškinys', 'mėsos gaminimas']
    },
    'Kiauliena': {
      desc: 'Skanūs kiaulienos patiekalai lietuviškai virtuvei - nuo kasdienių receptų iki šventinių specialybių. Kumpiai, šonkauliai, kotletai ir tradiciniai patiekalai. Ekonomiški ir maistingi sprendimai šeimai.',
      keywords: ['kiaulienos receptai', 'kiaulienos kepsniai', 'šonkauliai', 'lietuviška kiauliena', 'šeimos receptai']
    },
    'Vištiena': {
      desc: 'Universalūs vištienos receptai kiekvienai dienai - nuo greitų sparnelių iki šventinės vištos su įdaru. Sultingi krūtinėlės kepsniai, aromatingi šlaunelių troškiniai ir sveiki salotų receptai.',
      keywords: ['vištienos receptai', 'vištienos kepsniai', 'vištos sparneliai', 'vištienos salotos', 'paukštienos gaminimas']
    },
    'Žuvis': {
      desc: 'Sveikas ir skanus žuvies gaminimas - jūros ir gėlavandenės žuvies receptai su lietuviškais akcentais. Kepta, virta, rūkyta žuvis ir žuvies patiekalai šventėms. Maistingi sprendimai sveikai mitybai.',
      keywords: ['žuvies receptai', 'kepta žuvis', 'žuvies patiekalai', 'sveika mityba', 'jūros gėrybės']
    },
    'Bulvės': {
      desc: 'Lietuviškos virtuvės pagrindas - bulvių receptai nuo paprastų virtos bulvių iki sudėtingų apkepų. Bulvių kugelis, cepelinai, bulviniai blynai ir šiuolaikiniai sprendimai. Tradicijos ir inovacijos.',
      keywords: ['bulvių receptai', 'bulvių kugelis', 'cepelinai', 'bulviniai blynai', 'lietuviška virtuvė']
    },
    'Grybai': {
      desc: 'Aromatingi grybų patiekalai - nuo paprastų keptų grybų iki iškilmingų grybų sriubų. Miško grybai, šampinjonai ir egzotiški grybai. Vegetariški sprendimai ir mėsos patiekalų papildymai.',
      keywords: ['grybų receptai', 'keptų grybų', 'grybų sriuba', 'miško grybai', 'vegetariški receptai']
    },
    
    // Gaminimo būdas
    'Kepta orkaitėje': {
      desc: 'Orkaitėje kepti patiekalai - sveikesnis gaminimo būdas be papildomo riebalų. Mėsos kepsniai, daržovių apkepai, žuvies patiekalai ir desertai. Lengvas gaminimas su puikiais rezultatais.',
      keywords: ['kepta orkaitėje', 'orkaitės receptai', 'kepti patiekalai', 'sveika mityba', 'be riebalų']
    },
    'Kepta keptuvėje': {
      desc: 'Greitai ir skaniai keptuvėje - kasdienių patiekalų receptai užimtiems žmonėms. Kepsniai, blynai, kiaušinienės ir daržovių patiekalai. Praktiškas gaminimas su minimaliu laiku.',
      keywords: ['kepta keptuvėje', 'greiti receptai', 'keptuvės patiekalai', 'kasdieniai receptai', 'greitai pagaminami']
    },
    'Ant grilio': {
      desc: 'Vasaros gaminimo malonumas - grilio receptai lauko virtuvei ir balkonui. Mėsos kepsniai, daržovės, žuvis ir vegetariški patiekalai ant grilio. Sveika ir skani alternatyva tradiciniam kepimui.',
      keywords: ['ant grilio', 'grilio receptai', 'vasaros gaminimas', 'lauko virtuvė', 'kepti ant grilio']
    },
    
    // Proga / Tema / Sezonas
    'Kalėdoms': {
      desc: 'Tradiciniai kalėdiniai patiekalai lietuviškai šventei - nuo šventinio stalo iki saldžių dovanų. Kalėdų pyragai, kepsniai, saldumynai ir gėrimai šeimos susibūrimams. Autentiški receptai kalėdinei nuotaikai.',
      keywords: ['kalėdiniai receptai', 'kalėdų stalas', 'šventiniai patiekalai', 'kalėdų pyragai', 'lietuviškos kalėdos']
    },
    'Velykoms': {
      desc: 'Velykų šventės receptai - margučiai, velykinis pyragas, šventinis stalas ir pavasario patiekalai. Tradiciniai lietuviški Velykų papročiai virtuvėje ir šiuolaikiniai sprendimai šeimos šventei.',
      keywords: ['velykų receptai', 'margučiai', 'velykinis pyragas', 'šventinis stalas', 'pavasario patiekalai']
    },
    'Vasarai': {
      desc: 'Gaivūs vasaros patiekalai karštoms dienoms - šaltos sriubos, gaivios salotos, grilio receptai ir vėsinantys desertai. Sezoninių daržovių ir vaisių panaudojimas. Lengvi ir skanūs sprendimai.',
      keywords: ['vasaros receptai', 'šaltos sriubos', 'gaivios salotos', 'sezoniniai patiekalai', 'vasaros virtuvė']
    },
    'Žiemai': {
      desc: 'Šildantys žiemos patiekalai šaltam sezonui - sotūs troškiniai, karštos sriubos, kepti patiekalai ir šilti desertai. Vitaminų turtingi sprendimai ir konservuotų produktų panaudojimas.',
      keywords: ['žiemos receptai', 'šildantys patiekalai', 'karštos sriubos', 'sotūs troškiniai', 'žiemos virtuvė']
    }
  };
  
  let metaTitle = `${title} receptai - Paragaujam.lt`;
  let canonicalUrl = `https://paragaujam.lt/receptai/${slug}`;
  let metaDescription, keywords;
  
  if (seoContent[title]) {
    metaDescription = seoContent[title].desc;
    keywords = seoContent[title].keywords;
  } else {
    metaDescription = `Atraskite geriausius ${lowerTitle} receptus. Lengvi ir skanūs ${lowerTitle} patiekalai su nuotraukomis ir instrukcijomis kiekvienai dienai.`;
    keywords = [lowerTitle, `${lowerTitle} receptai`, 'lietuviški receptai', 'maistas', 'gaminimas'];
  }
  
  return { metaTitle, metaDescription, keywords, canonicalUrl };
}

// Categories from categ-subcateg.md (exact structure)
const categories = [
  // Receptai pagal tipą
  'Garnyrai', 'Kepsniai', 'Makaronų receptai', 'Nevalgiukams', 'Pietūs', 'Pusryčiai', 
  'Salotos', 'Sriubos', 'Šeimai', 'Troškiniai', 'Užkandžiai', 'Vaikams', 'Vakarienė', 
  'Vieno puodo receptai',
  
  // Pagrindinis ingredientas
  'Avokadas', 'Bulvės', 'Daržovės', 'Duona', 'Elniena', 'Faršas', 'Grybai', 'Jautiena', 
  'Jūros gėrybės', 'Kalakutiena', 'Kiauliena', 'Kiaušiniai', 'Lęšiai', 'Makaronai', 
  'Miltiniai', 'Pienas ir pieno produktai', 'Pupelės', 'Ryžiai', 'Sūris', 'Tofu', 
  'Triušiena', 'Uogos', 'Vaisiai', 'Varškė', 'Vištiena', 'Žuvis', 'Žvėriena',
  
  // Gaminimo būdas
  'Ant grilio', 'Ant laužo', 'Be kepimo', 'Duonkepėje', 'Garų puode', 'Greitpuodyje', 
  'Kazane', 'Kepta keptuvėje', 'Kepta orkaitėje', 'Oro gruzdintuvėje', 'Troškinta', 
  'Žaliavalgiams',
  
  // Proga / Tema / Sezonas
  'Gimtadienio stalui', 'Helovinui', 'Kalėdoms', 'Kūčioms', 'Naujųjų metų stalui', 
  'Paskutinės minutės', 'Šeimos pietums', 'Vaikų gimtadieniui', 'Vasarai', 'Velykoms', 
  'Žiemai',
  
  // Pagal ypatybę
  'Be angliavandenių', 'Be glitimo', 'Be kiaušinių', 'Be laktozės', 'Be mėsos', 
  'Be pieno produktų', 'Be riebalų', 'Cholesteroliui mažinti', 'Diabetikams', 
  'Greitai pagaminami', 'Lengvai pagaminami', 'Pigiai pagaminami', 'Pietūs į darbą'
];

console.log(`📊 Creating ${categories.length} categories from categ-subcateg.md...`);

// Clear existing categories
console.log('🗑️ Clearing existing categories_new...');
db.categories_new.deleteMany({});

// Create categories
const categoriesToInsert = [];

categories.forEach((title, index) => {
  const slug = createSlug(title);
  const path = slug;
  const seo = generateSEO(title);
  
  const category = {
    path: path,
    parentPath: null,
    level: 1,
    title: { lt: title },
    slug: slug,
    seo: seo,
    filters: {
      manual: [],
      auto: [],
      timeFilters: ['iki-30-min', '30-60-min', '1-2-val']
    },
    isActive: true,
    sortOrder: index + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categoriesToInsert.push(category);
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
  const count = db.categories_new.find({ level: 1 }).count();
  console.log(`\n🎉 Categories creation completed!`);
  console.log(`📊 Total categories: ${count}`);
  
  console.log('\n📋 Sample categories created:');
  db.categories_new.find({ level: 1 }).limit(10).forEach(cat => {
    console.log(`  🔸 ${cat.title.lt} (${cat.path})`);
  });
  
  console.log('\n🚀 Categories from categ-subcateg.md ready for your website!');
  
} catch (error) {
  console.error('❌ Error creating categories:', error);
}
