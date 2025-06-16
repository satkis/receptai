// Complete Recipe Schema for recipes_new Collection
// Lithuanian Recipe Website - Optimized for SEO and Performance

const recipeSchema = {
  // === CORE IDENTIFICATION ===
  _id: "ObjectId", // MongoDB ObjectId
  slug: "vistienos-krutineles-kepsnys-su-grybais", // URL-safe identifier

  // === CONTENT (Multilingual) ===
  title: {
    lt: "Vištienos krūtinėlės kepsnys su grybais",
    en: "Chicken breast with mushrooms" // Optional
  },
  description: {
    lt: "Sultingas vištienos krūtinėlės kepsnys su grybais. Lengvas ir skanus receptas šeimai.",
    en: "Juicy chicken breast with mushrooms. Easy and delicious recipe for family." // Optional
  },
  language: "lt", // Primary language

  // === RECIPE DATA ===
  servings: 4,
  servingsUnit: "portions", // or "people"
  
  // Time in minutes
  prepTimeMinutes: 15,
  cookTimeMinutes: 25,
  totalTimeMinutes: 40,
  
  // Difficulty level
  difficulty: "lengvas", // "lengvas", "vidutinis", "sunkus"

  // === INGREDIENTS ===
  ingredients: [
    {
      name: {
        lt: "Vištienos krūtinėlė",
        en: "Chicken breast" // Optional
      },
      quantity: "500g",
      vital: true // Essential ingredient (affects search/filtering)
    },
    {
      name: {
        lt: "Grybai",
        en: "Mushrooms"
      },
      quantity: "300g",
      vital: true
    },
    {
      name: {
        lt: "Svogūnas",
        en: "Onion"
      },
      quantity: "1 vnt.",
      vital: false
    }
  ],

  // === INSTRUCTIONS ===
  instructions: [
    {
      step: 1,
      text: {
        lt: "Paruošti vištienos krūtinėlę - nuplakti, pašaldyti druska ir pipirais.",
        en: "Prepare chicken breast - pound, season with salt and pepper."
      }
    },
    {
      step: 2,
      text: {
        lt: "Supjaustyti grybus ir svogūną.",
        en: "Slice mushrooms and onion."
      }
    }
  ],

  // === IMAGE (S3 Integration) ===
  image: {
    src: "https://receptu-images.s3.eu-north-1.amazonaws.com/vistienos-kepsnys.jpg",
    alt: "Vištienos krūtinėlės kepsnys su grybais",
    width: 1200,
    height: 800,
    blurHash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH", // Optional for blur placeholder
    formats: { // Optional optimized formats
      webp: "https://receptu-images.s3.eu-north-1.amazonaws.com/vistienos-kepsnys.webp",
      avif: "https://receptu-images.s3.eu-north-1.amazonaws.com/vistienos-kepsnys.avif"
    }
  },

  // === CATEGORIZATION ===
  // Primary category for canonical URL and breadcrumbs
  primaryCategoryPath: "pagal-ingredienta/mesa/vistiena",
  primaryCategoryId: "ObjectId", // Reference to categories_new

  // All categories this recipe belongs to (for cross-categorization)
  allCategories: [
    "pagal-ingredienta/mesa/vistiena",
    "patiekalo-tipas/karsti-patiekalai",
    "pagal-laika/iki-60-min"
  ],
  allCategoryIds: ["ObjectId1", "ObjectId2", "ObjectId3"],

  // Auto-calculated time category for filtering
  timeCategory: "30-60-min", // "iki-30-min", "30-60-min", "1-2-val", "virs-2-val"

  // === TAGS (Free-form, searchable) ===
  tags: ["vištiena", "grybai", "kepsnys", "orkaitėje", "šeimai", "lengvas"],

  // === BREADCRUMBS (Denormalized for performance) ===
  breadcrumbs: [
    { title: "Receptai", slug: "receptai", url: "/" },
    { title: "Pagal ingredientą", slug: "pagal-ingredienta", url: "/pagal-ingredienta" },
    { title: "Mėsa", slug: "mesa", url: "/pagal-ingredienta/mesa" },
    { title: "Vištiena", slug: "vistiena", url: "/pagal-ingredienta/mesa/vistiena" }
  ],

  // === NUTRITION (Optional) ===
  nutrition: {
    calories: 320,
    protein: 35,
    fat: 12,
    carbs: 8,
    fiber: 2,
    sugar: 3
  },

  // === RATING & ENGAGEMENT ===
  rating: {
    average: 4.5,
    count: 23
  },
  
  // Performance metrics
  performance: {
    views: 1250,
    shares: 45,
    saves: 89,
    avgTimeOnPage: 180, // seconds
    bounceRate: 0.25
  },

  // === AUTHOR ===
  author: {
    userId: "ObjectId", // Reference to users collection (optional)
    name: "Paragaujam.lt",
    profileUrl: "https://paragaujam.lt/autorius/paragaujam"
  },

  // === STATUS & PUBLISHING ===
  status: "published", // "draft", "published", "archived"
  featured: false, // Featured on homepage
  trending: false, // Trending recipe
  seasonal: ["vasara", "pavasaris"], // Seasonal tags

  // === SEO OPTIMIZATION ===
  seo: {
    metaTitle: "Vištienos krūtinėlės kepsnys su grybais - Paragaujam.lt",
    metaDescription: "Sultingas vištienos krūtinėlės kepsnys su grybais. Lengvas receptas su nuotraukomis ir instrukcijomis.",
    keywords: ["vištiena", "krūtinėlė", "grybai", "kepsnys", "receptas"],
    canonicalUrl: "https://paragaujam.lt/receptas/vistienos-krutineles-kepsnys-su-grybais",
    lastModified: "2024-01-15T10:30:00Z"
  },

  // === SCHEMA.ORG STRUCTURED DATA ===
  schemaOrg: {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "Vištienos krūtinėlės kepsnys su grybais",
    description: "Sultingas vištienos krūtinėlės kepsnys su grybais",
    image: [
      "https://receptu-images.s3.eu-north-1.amazonaws.com/vistienos-kepsnys.jpg"
    ],
    author: {
      "@type": "Organization",
      name: "Paragaujam.lt"
    },
    datePublished: "2024-01-15T10:30:00Z",
    dateModified: "2024-01-15T10:30:00Z",
    prepTime: "PT15M",
    cookTime: "PT25M",
    totalTime: "PT40M",
    recipeYield: "4",
    recipeCategory: "Karsti patiekalai",
    recipeCuisine: "Lietuviška",
    keywords: "vištiena, grybai, kepsnys",
    nutrition: {
      "@type": "NutritionInformation",
      calories: "320 calories",
      proteinContent: "35g",
      fatContent: "12g",
      carbohydrateContent: "8g"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "23"
    }
  },

  // === TIMESTAMPS ===
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  publishedAt: "2024-01-15T10:30:00Z"
};

// Export for use in scripts
module.exports = recipeSchema;
