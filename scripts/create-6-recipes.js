// MongoDB Compass Script to Create 6 Lithuanian Recipes
// Copy and paste this into MongoDB Compass shell or run with: mongosh < create-6-recipes.js

// Connect to your database (adjust connection string if needed)
// use('receptai');

// Recipe data with unique slugs and diverse Lithuanian dishes
const recipes = [
  {
    slug: "cepelinai-su-mesa",
    canonicalUrl: "https://ragaujam.lt/receptas/cepelinai-su-mesa",
    title: { lt: "Cepelinai su mėsa" },
    description: { lt: "Tradiciniai lietuviški cepelinai su mėsos įdaru. Sotus ir skanus nacionalinis patiekalas." },
    seo: {
      metaTitle: "Cepelinai su mėsa - Tradicinis lietuviškas receptas | Ragaujam.lt",
      metaDescription: "Autentiškas cepelinų su mėsa receptas. Tradicinis lietuviškas patiekalas su bulvių tešla ir mėsos įdaru.",
      keywords: ["cepelinai", "lietuviškas receptas", "mėsos įdaras", "bulvės", "tradicinis"],
      focusKeyword: "cepelinai su mėsa"
    },
    prepTimeMinutes: 45,
    cookTimeMinutes: 30,
    totalTimeMinutes: 75,
    timeCategory: "1-2-val",
    servings: 4,
    servingsUnit: "porcijos",
    difficulty: "sunkus",
    primaryCategoryPath: "receptai/karsti-patiekalai",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/tradiciniai"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Karštieji patiekalai", url: "/receptai/karsti-patiekalai" }
    ],
    ingredients: [
      { name: { lt: "Bulvės" }, quantity: "1 kg", vital: true },
      { name: { lt: "Kiaulienos mėsa" }, quantity: "300 g", vital: true },
      { name: { lt: "Svogūnas" }, quantity: "1 didelis", vital: true },
      { name: { lt: "Kiaušinis" }, quantity: "1 vnt.", vital: true },
      { name: { lt: "Miltai" }, quantity: "2 šaukštai", vital: false },
      { name: { lt: "Grietinė" }, quantity: "200 ml", vital: false, notes: "Patiekimui" },
      { name: { lt: "Druska ir pipirai" }, quantity: "pagal skonį", vital: true }
    ],
    instructions: [
      { step: 1, text: { lt: "Nulupkite ir sutarkuokite bulves stambiomis tarkėmis." }, timeMinutes: 15 },
      { step: 2, text: { lt: "Paruoškite mėsos įdarą: susmulkinkite mėsą ir svogūną, pakepkite." }, timeMinutes: 20 },
      { step: 3, text: { lt: "Suformuokite cepeliną: į bulvių masę įdėkite įdarą ir suformuokite." }, timeMinutes: 10 },
      { step: 4, text: { lt: "Virkite sūdytame vandenyje 25-30 min." }, timeMinutes: 30 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/cepelinai.jpg",
      alt: "Cepelinai su mėsa ir grietine",
      width: 1200,
      height: 800,
      caption: "Tradiciniai lietuviški cepelinai"
    },
    rating: { average: 4.9, count: 45 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 240, bounceRate: 0.15 },
    tags: ["cepelinai", "lietuviškas", "tradicinis", "mėsa", "bulvės", "karsti-patiekalai"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: true,
    trending: true,
    seasonal: ["žiema", "ruduo"],
    sitemap: { priority: 0.9, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-10T10:00:00+02:00"),
    createdAt: new Date("2024-01-10T09:30:00+02:00"),
    updatedAt: new Date()
  },

  {
    slug: "saltibarsciai-su-bulvemis",
    canonicalUrl: "https://ragaujam.lt/receptas/saltibarsciai-su-bulvemis",
    title: { lt: "Šaltibarščiai su bulvėmis" },
    description: { lt: "Gaivūs lietuviški šaltibarščiai su bulvėmis ir kiaušiniais. Puikus vasaros pietų pasirinkimas." },
    seo: {
      metaTitle: "Šaltibarščiai su bulvėmis - Vasaros sriuba | Ragaujam.lt",
      metaDescription: "Tradiciniai lietuviški šaltibarščiai su bulvėmis. Gaivi ir sveika vasaros sriuba su burokėliais.",
      keywords: ["šaltibarščiai", "vasaros sriuba", "burokėliai", "bulvės", "gaivus"],
      focusKeyword: "šaltibarščiai"
    },
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    totalTimeMinutes: 15,
    timeCategory: "iki-30-min",
    servings: 4,
    servingsUnit: "porcijos",
    difficulty: "lengvas",
    primaryCategoryPath: "receptai/sriubos",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/vasaros"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Sriubos", url: "/receptai/sriubos" }
    ],
    ingredients: [
      { name: { lt: "Burokėlių gėrimas" }, quantity: "1 l", vital: true },
      { name: { lt: "Virtos bulvės" }, quantity: "4 vnt.", vital: true },
      { name: { lt: "Kiaušiniai" }, quantity: "4 vnt.", vital: true },
      { name: { lt: "Agurkai" }, quantity: "2 vnt.", vital: true },
      { name: { lt: "Grietinė" }, quantity: "200 ml", vital: false },
      { name: { lt: "Krapai" }, quantity: "1 sauja", vital: false },
      { name: { lt: "Druska" }, quantity: "pagal skonį", vital: true }
    ],
    instructions: [
      { step: 1, text: { lt: "Išvirkite kiaušinius ir bulves, atvėsinkite." }, timeMinutes: 0 },
      { step: 2, text: { lt: "Supjaustykite bulves, kiaušinius ir agurkus." }, timeMinutes: 10 },
      { step: 3, text: { lt: "Įpilkite burokėlių gėrimą, pridėkite daržoves." }, timeMinutes: 3 },
      { step: 4, text: { lt: "Patiekite su grietine ir krapais." }, timeMinutes: 2 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/saltibarsciai.jpg",
      alt: "Šaltibarščiai su bulvėmis ir kiaušiniais",
      width: 1200,
      height: 800,
      caption: "Gaivūs lietuviški šaltibarščiai"
    },
    rating: { average: 4.7, count: 32 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 150, bounceRate: 0.25 },
    tags: ["šaltibarščiai", "sriuba", "vasara", "gaivus", "lietuviškas", "burokėliai"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: false,
    trending: false,
    seasonal: ["vasara"],
    sitemap: { priority: 0.8, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-12T14:00:00+02:00"),
    createdAt: new Date("2024-01-12T13:30:00+02:00"),
    updatedAt: new Date()
  },

  {
    slug: "bulviu-kugelis-tradicinis",
    canonicalUrl: "https://ragaujam.lt/receptas/bulviu-kugelis-tradicinis",
    title: { lt: "Bulvių kugelis tradicinis" },
    description: { lt: "Tradicinis lietuviškas bulvių kugelis su šonine. Keptas orkaitėje auksinės spalvos patiekalas." },
    seo: {
      metaTitle: "Bulvių kugelis - Tradicinis lietuviškas receptas | Ragaujam.lt",
      metaDescription: "Autentiškas bulvių kugelio receptas su šonine. Tradicinis lietuviškas keptas patiekalas.",
      keywords: ["bulvių kugelis", "kugelis", "lietuviškas", "šoninė", "keptas"],
      focusKeyword: "bulvių kugelis"
    },
    prepTimeMinutes: 30,
    cookTimeMinutes: 90,
    totalTimeMinutes: 120,
    timeCategory: "virs-2-val",
    servings: 8,
    servingsUnit: "porcijos",
    difficulty: "vidutinis",
    primaryCategoryPath: "receptai/karsti-patiekalai",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/kepiniai"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Karštieji patiekalai", url: "/receptai/karsti-patiekalai" }
    ],
    ingredients: [
      { name: { lt: "Bulvės" }, quantity: "2 kg", vital: true },
      { name: { lt: "Šoninė" }, quantity: "200 g", vital: true },
      { name: { lt: "Kiaušiniai" }, quantity: "3 vnt.", vital: true },
      { name: { lt: "Pienas" }, quantity: "200 ml", vital: true },
      { name: { lt: "Svogūnas" }, quantity: "1 didelis", vital: false },
      { name: { lt: "Druska ir pipirai" }, quantity: "pagal skonį", vital: true }
    ],
    instructions: [
      { step: 1, text: { lt: "Nulupkite ir sutarkuokite bulves smulkiai." }, timeMinutes: 20 },
      { step: 2, text: { lt: "Pakepkite šoninę ir svogūną." }, timeMinutes: 10 },
      { step: 3, text: { lt: "Sumaišykite visus ingredientus." }, timeMinutes: 5 },
      { step: 4, text: { lt: "Kepkite orkaitėje 180°C 90 min." }, timeMinutes: 90 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/kugelis.jpg",
      alt: "Auksinės spalvos bulvių kugelis",
      width: 1200,
      height: 800,
      caption: "Tradicinis lietuviškas bulvių kugelis"
    },
    rating: { average: 4.8, count: 38 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 200, bounceRate: 0.18 },
    tags: ["kugelis", "bulvės", "lietuviškas", "tradicinis", "keptas", "šoninė"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: true,
    trending: false,
    seasonal: ["žiema", "ruduo"],
    sitemap: { priority: 0.8, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-14T16:00:00+02:00"),
    createdAt: new Date("2024-01-14T15:30:00+02:00"),
    updatedAt: new Date()
  },

  {
    slug: "kibinai-su-mesa",
    canonicalUrl: "https://ragaujam.lt/receptas/kibinai-su-mesa",
    title: { lt: "Kibinai su mėsa" },
    description: { lt: "Tradiciniai Trakų kibinai su mėsos įdaru. Traškūs ir skanūs kepiniai su istorija." },
    seo: {
      metaTitle: "Kibinai su mėsa - Trakų specialybė | Ragaujam.lt",
      metaDescription: "Autentiški Trakų kibinai su mėsos įdaru. Tradicinis karaimų patiekalas su traškia tešla.",
      keywords: ["kibinai", "Trakai", "karaimai", "mėsa", "kepiniai"],
      focusKeyword: "kibinai"
    },
    prepTimeMinutes: 60,
    cookTimeMinutes: 25,
    totalTimeMinutes: 85,
    timeCategory: "1-2-val",
    servings: 6,
    servingsUnit: "vnt.",
    difficulty: "sunkus",
    primaryCategoryPath: "receptai/kepiniai",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/tradiciniai"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Kepiniai", url: "/receptai/kepiniai" }
    ],
    ingredients: [
      { name: { lt: "Miltai" }, quantity: "500 g", vital: true },
      { name: { lt: "Jautienos mėsa" }, quantity: "400 g", vital: true },
      { name: { lt: "Svogūnas" }, quantity: "2 vnt.", vital: true },
      { name: { lt: "Kiaušinis" }, quantity: "1 vnt.", vital: true },
      { name: { lt: "Sviestas" }, quantity: "100 g", vital: true },
      { name: { lt: "Vanduo" }, quantity: "150 ml", vital: true },
      { name: { lt: "Druska ir pipirai" }, quantity: "pagal skonį", vital: true }
    ],
    instructions: [
      { step: 1, text: { lt: "Paruoškite tešlą iš miltų, sviesto ir vandens." }, timeMinutes: 30 },
      { step: 2, text: { lt: "Paruoškite įdarą: susmulkinkite mėsą ir svogūną." }, timeMinutes: 20 },
      { step: 3, text: { lt: "Suformuokite kibiną ir uždarykite kraštus." }, timeMinutes: 10 },
      { step: 4, text: { lt: "Kepkite orkaitėje 200°C 25 min." }, timeMinutes: 25 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/kibinai.jpg",
      alt: "Auksiniai kibinai su mėsa",
      width: 1200,
      height: 800,
      caption: "Tradiciniai Trakų kibinai"
    },
    rating: { average: 4.9, count: 52 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 220, bounceRate: 0.12 },
    tags: ["kibinai", "Trakai", "karaimai", "mėsa", "kepiniai", "tradicinis"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: true,
    trending: true,
    seasonal: ["visus-metus"],
    sitemap: { priority: 0.9, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-16T12:00:00+02:00"),
    createdAt: new Date("2024-01-16T11:30:00+02:00"),
    updatedAt: new Date()
  },

  {
    slug: "balandėliai-su-mėsa",
    canonicalUrl: "https://ragaujam.lt/receptas/balandėliai-su-mėsa",
    title: { lt: "Balandėliai su mėsa ir ryžiais" },
    description: { lt: "Tradiciniai lietuviški balandėliai su mėsos ir ryžių įdaru. Trošti pomidorų padaže." },
    seo: {
      metaTitle: "Balandėliai su mėsa - Lietuviškas receptas | Ragaujam.lt",
      metaDescription: "Tradiciniai balandėliai su mėsa ir ryžiais. Trošti pomidorų padaže lietuviškas patiekalas.",
      keywords: ["balandėliai", "mėsa", "ryžiai", "kopūstai", "troškinys"],
      focusKeyword: "balandėliai"
    },
    prepTimeMinutes: 40,
    cookTimeMinutes: 60,
    totalTimeMinutes: 100,
    timeCategory: "1-2-val",
    servings: 6,
    servingsUnit: "porcijos",
    difficulty: "vidutinis",
    primaryCategoryPath: "receptai/karsti-patiekalai",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/troskiniai"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Karštieji patiekalai", url: "/receptai/karsti-patiekalai" }
    ],
    ingredients: [
      { name: { lt: "Kopūstų lapai" }, quantity: "12 vnt.", vital: true },
      { name: { lt: "Maltos mėsos" }, quantity: "500 g", vital: true },
      { name: { lt: "Ryžiai" }, quantity: "150 g", vital: true },
      { name: { lt: "Svogūnas" }, quantity: "1 didelis", vital: true },
      { name: { lt: "Pomidorų padažas" }, quantity: "400 g", vital: true },
      { name: { lt: "Grietinė" }, quantity: "200 ml", vital: false },
      { name: { lt: "Druska ir pipirai" }, quantity: "pagal skonį", vital: true }
    ],
    instructions: [
      { step: 1, text: { lt: "Paruoškite kopūstų lapus - apvirkite ir atvėsinkite." }, timeMinutes: 15 },
      { step: 2, text: { lt: "Sumaišykite mėsą su ryžiais ir svogūnais." }, timeMinutes: 15 },
      { step: 3, text: { lt: "Suvyniokite įdarą į kopūstų lapus." }, timeMinutes: 10 },
      { step: 4, text: { lt: "Trošinkite pomidorų padaže 60 min." }, timeMinutes: 60 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/balandeliai.jpg",
      alt: "Balandėliai pomidorų padaže",
      width: 1200,
      height: 800,
      caption: "Tradiciniai lietuviški balandėliai"
    },
    rating: { average: 4.6, count: 29 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 190, bounceRate: 0.22 },
    tags: ["balandėliai", "mėsa", "ryžiai", "kopūstai", "troškinys", "lietuviškas"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: false,
    trending: false,
    seasonal: ["ruduo", "žiema"],
    sitemap: { priority: 0.7, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-18T15:00:00+02:00"),
    createdAt: new Date("2024-01-18T14:30:00+02:00"),
    updatedAt: new Date()
  },

  {
    slug: "skilandis-naminis",
    canonicalUrl: "https://ragaujam.lt/receptas/skilandis-naminis",
    title: { lt: "Naminis skilandis" },
    description: { lt: "Tradicinis lietuviškas naminis skilandis. Rūkytas ir džiovintas mėsos gaminys su prieskoniais." },
    seo: {
      metaTitle: "Naminis skilandis - Tradicinis receptas | Ragaujam.lt",
      metaDescription: "Autentiškas naminio skilandžio receptas. Tradicinis lietuviškas rūkytas mėsos gaminys.",
      keywords: ["skilandis", "naminis", "rūkytas", "mėsa", "tradicinis"],
      focusKeyword: "naminis skilandis"
    },
    prepTimeMinutes: 120,
    cookTimeMinutes: 0,
    totalTimeMinutes: 120,
    timeCategory: "virs-2-val",
    servings: 10,
    servingsUnit: "porcijos",
    difficulty: "sunkus",
    primaryCategoryPath: "receptai/uzkandziai",
    secondaryCategories: ["receptai/lietuviska-virtuve", "receptai/rukyti"],
    breadcrumbs: [
      { name: "Receptai", url: "/receptai" },
      { name: "Užkandžiai", url: "/receptai/uzkandziai" }
    ],
    ingredients: [
      { name: { lt: "Kiaulienos mėsa" }, quantity: "2 kg", vital: true },
      { name: { lt: "Druska" }, quantity: "60 g", vital: true },
      { name: { lt: "Juodieji pipirai" }, quantity: "2 šaukšteliai", vital: true },
      { name: { lt: "Česnakų" }, quantity: "6 skiltelės", vital: true },
      { name: { lt: "Kmynai" }, quantity: "1 šaukštelis", vital: false },
      { name: { lt: "Žarnos" }, quantity: "1 m", vital: true, notes: "Natūralios" }
    ],
    instructions: [
      { step: 1, text: { lt: "Sumalti mėsą su prieskoniais ir česnakais." }, timeMinutes: 30 },
      { step: 2, text: { lt: "Įkišti masę į žarnas ir surišti." }, timeMinutes: 45 },
      { step: 3, text: { lt: "Pakabinti džiūti 2-3 savaites." }, timeMinutes: 0 },
      { step: 4, text: { lt: "Rūkyti šaltu dūmu 3-5 dienas." }, timeMinutes: 0 }
    ],
    image: {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/skilandis.jpg",
      alt: "Naminis skilandis su duona",
      width: 1200,
      height: 800,
      caption: "Tradicinis lietuviškas naminis skilandis"
    },
    rating: { average: 4.9, count: 18 },
    engagement: { views: 0, saves: 0, shares: 0, commentsCount: 0, avgTimeOnPage: 300, bounceRate: 0.08 },
    tags: ["skilandis", "naminis", "rūkytas", "mėsa", "tradicinis", "užkandis"],
    author: { userId: null, name: "Ragaujam.lt", profileUrl: "https://ragaujam.lt" },
    status: "published",
    featured: true,
    trending: false,
    seasonal: ["ruduo", "žiema"],
    sitemap: { priority: 0.8, changefreq: "monthly", lastmod: new Date().toISOString() },
    publishedAt: new Date("2024-01-20T11:00:00+02:00"),
    createdAt: new Date("2024-01-20T10:30:00+02:00"),
    updatedAt: new Date()
  }
];

// Add schema.org structured data to each recipe
recipes.forEach(recipe => {
  recipe.schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title.lt,
    "description": recipe.description.lt,
    "image": [recipe.image.src],
    "author": {
      "@type": "Organization",
      "name": "Ragaujam.lt",
      "url": "https://ragaujam.lt"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ragaujam.lt",
      "url": "https://ragaujam.lt",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ragaujam.lt/logo.png",
        "width": 600,
        "height": 60
      }
    },
    "datePublished": recipe.publishedAt.toISOString(),
    "dateModified": recipe.updatedAt.toISOString(),
    "prepTime": `PT${recipe.prepTimeMinutes}M`,
    "cookTime": `PT${recipe.cookTimeMinutes}M`,
    "totalTime": `PT${recipe.totalTimeMinutes}M`,
    "recipeYield": `${recipe.servings} ${recipe.servingsUnit}`,
    "recipeCategory": "Lietuviškas patiekalas",
    "recipeCuisine": "Lietuviška",
    "keywords": recipe.tags.join(", "),
    "recipeIngredient": recipe.ingredients.map(ing => `${ing.quantity} ${ing.name.lt}`),
    "recipeInstructions": recipe.instructions.map((inst, index) => ({
      "@type": "HowToStep",
      "name": `Žingsnis ${inst.step}`,
      "text": inst.text.lt,
      "url": `${recipe.canonicalUrl}#step${inst.step}`
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating.average.toString(),
      "reviewCount": recipe.rating.count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  };
});

// Insert recipes into MongoDB
console.log('🍽️ Creating 6 Lithuanian recipes...');

try {
  const result = db.recipes_new.insertMany(recipes);
  console.log(`✅ Successfully created ${result.insertedIds.length} recipes:`);

  recipes.forEach((recipe, index) => {
    console.log(`${index + 1}. ${recipe.title.lt} (${recipe.slug})`);
    console.log(`   Category: ${recipe.primaryCategoryPath}`);
    console.log(`   Time: ${recipe.totalTimeMinutes} min`);
    console.log(`   URL: ${recipe.canonicalUrl}`);
    console.log('');
  });

  console.log('🎉 All recipes created successfully!');
  console.log('📊 Summary:');
  console.log(`   - Total recipes: ${recipes.length}`);
  console.log(`   - Categories: ${[...new Set(recipes.map(r => r.primaryCategoryPath))].join(', ')}`);
  console.log(`   - Average rating: ${(recipes.reduce((sum, r) => sum + r.rating.average, 0) / recipes.length).toFixed(1)}`);

} catch (error) {
  console.error('❌ Error creating recipes:', error);
}
