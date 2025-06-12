# 🗄️ Database Schema Design V2 - Optimized for Multiple Categories

## **Overview**

Optimized MongoDB schema for 10k+ recipes with multiple category assignments, exclusive time filtering, and maximum performance.

## **URL Structure (Updated)**
- **Recipe URLs**: `domain.lt/receptas/recipe-slug`
- **Category Pages**: `domain.lt/patiekalo-tipas/karsti-patiekalai`
- **Tag Search Pages**: `domain.lt/paieska/tag-value`

## **Collections**

### **1. `recipes_new` Collection (Updated)**

```javascript
{
  _id: ObjectId,
  slug: "vistienos-krutineles-kepsnys-su-grybais",
  
  // Content
  title: { lt: "Vištienos krūtinėlės kepsnys su grybais", en: "Chicken breast with mushrooms" },
  description: { lt: "Sultingas vištienos kepsnys...", en: "Juicy chicken breast..." },
  language: "lt",
  
  // Recipe Data
  servings: 4,
  prepTimeMinutes: 15,
  cookTimeMinutes: 25,
  totalTimeMinutes: 40,
  
  ingredients: [
    { 
      name: { lt: "Vištienos krūtinėlė", en: "Chicken breast" }, 
      quantity: "500g", 
      vital: true 
    },
    { 
      name: { lt: "Grybai", en: "Mushrooms" }, 
      quantity: "300g", 
      vital: true 
    }
  ],
  
  instructions: [
    { 
      step: 1, 
      text: { lt: "Paruošti vištienos krūtinėlę...", en: "Prepare chicken breast..." } 
    }
  ],
  
  // PRIMARY CATEGORY (for canonical URL and breadcrumbs)
  primaryCategoryPath: "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  primaryCategoryId: ObjectId,
  
  // Breadcrumb data (denormalized for performance)
  breadcrumbs: [
    { title: "Receptai", slug: "receptai", url: "/" },
    { title: "Pagal pagrindinį ingredientą", slug: "pagal-pagrindini-ingredienta", url: "/pagal-pagrindini-ingredienta" },
    { title: "Vištienos patiekalai", slug: "vistienos-patiekalai", url: "/pagal-pagrindini-ingredienta/vistienos-patiekalai" }
  ],
  
  // ALL CATEGORIES (for filtering and search)
  allCategories: [
    "pagal-pagrindini-ingredienta/vistienos-patiekalai",
    "patiekalo-tipas/karsti-patiekalai", 
    "pagal-laika/iki-30-min",
    "mitybos-pasirinkimai-dietiniai/sveiki-patiekalai"
  ],
  allCategoryIds: [ObjectId1, ObjectId2, ObjectId3, ObjectId4],
  
  // TIME CATEGORY (denormalized for performance)
  timeCategory: "iki-30-min", // Auto-calculated from totalTimeMinutes
  
  // Tags (free-form, clickable)
  tags: ["vištiena", "grybai", "orkaitėje", "30 minučių", "šeimai"],
  
  // Additional metadata
  image: "/images/vistienos-krutineles-kepsnys.jpg",
  rating: { average: 4.5, count: 23 },
  difficulty: "lengvas",
  nutrition: { calories: 320, fat: 12, protein: 35, carbs: 8 },
  
  // SEO
  seo: {
    metaTitle: "Vištienos krūtinėlės kepsnys su grybais - Paragaujam.lt",
    metaDescription: "Sultingas vištienos krūtinėlės kepsnys su grybais. Lengvas receptas šeimai.",
    keywords: ["vištiena", "krūtinėlė", "grybai", "kepsnys"]
  },
  
  // Timestamps
  createdAt: ISODate,
  updatedAt: ISODate,
  publishedAt: ISODate
}
```

### **2. `categories_new` Collection (Updated)**

```javascript
{
  _id: ObjectId,
  title: { lt: "Vištienos patiekalai", en: "Chicken dishes" },
  slug: "vistienos-patiekalai",
  
  // Hierarchy
  parentCategory: "Pagal pagrindinį ingredientą", // Main category name
  parentSlug: "pagal-pagrindini-ingredienta",
  level: 2, // 1=main category, 2=subcategory
  path: "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  fullPath: ["pagal-pagrindini-ingredienta", "vistienos-patiekalai"],
  
  // Parent reference
  parentId: ObjectId, // Points to "Pagal pagrindinį ingredientą" category
  
  // Breadcrumb chain (denormalized)
  ancestors: [
    { 
      _id: ObjectId, 
      title: "Pagal pagrindinį ingredientą", 
      slug: "pagal-pagrindini-ingredienta", 
      level: 1,
      path: "pagal-pagrindini-ingredienta"
    }
  ],
  
  // Metadata
  description: { lt: "Vištienos patiekalų receptai", en: "Chicken dish recipes" },
  icon: "🍗",
  recipeCount: 47, // Updated periodically
  
  // Time filters for this category (performance optimization)
  availableTimeFilters: [
    { value: "iki-30-min", label: "iki 30 min.", count: 23 },
    { value: "30-60-min", label: "30–60 min.", count: 18 },
    { value: "1-2-val", label: "1–2 val.", count: 6 },
    { value: "virs-2-val", label: "virš 2 val.", count: 0 }
  ],
  
  // SEO
  seo: {
    metaTitle: "Vištienos patiekalų receptai (47) - Paragaujam.lt",
    metaDescription: "Geriausi vištienos patiekalų receptai. 47 patikrinti receptai su nuotraukomis.",
    keywords: ["vištienos patiekalai", "receptai", "vištiena"]
  },
  
  // Display settings
  isActive: true,
  sortOrder: 1,
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### **3. Time Category Mapping**

```javascript
// Time category calculation logic
const timeCategories = {
  "iki-30-min": { maxMinutes: 30, label: "iki 30 min." },
  "30-60-min": { minMinutes: 31, maxMinutes: 60, label: "30–60 min." },
  "1-2-val": { minMinutes: 61, maxMinutes: 120, label: "1–2 val." },
  "virs-2-val": { minMinutes: 121, label: "virš 2 val." }
};

// Auto-calculate timeCategory from totalTimeMinutes
function calculateTimeCategory(totalTimeMinutes) {
  if (totalTimeMinutes <= 30) return "iki-30-min";
  if (totalTimeMinutes <= 60) return "30-60-min";
  if (totalTimeMinutes <= 120) return "1-2-val";
  return "virs-2-val";
}
```

## **Indexing Strategy (Performance Optimized)**

```javascript
// recipes_new collection indexes
db.recipes_new.createIndex({ "slug": 1 }, { unique: true });
db.recipes_new.createIndex({ "allCategories": 1, "timeCategory": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "allCategories": 1, "rating.average": -1 });
db.recipes_new.createIndex({ "tags": 1, "timeCategory": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "primaryCategoryPath": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "timeCategory": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "title.lt": "text", "description.lt": "text", "tags": "text" });

// categories_new collection indexes
db.categories_new.createIndex({ "path": 1 }, { unique: true });
db.categories_new.createIndex({ "parentSlug": 1, "sortOrder": 1 });
db.categories_new.createIndex({ "level": 1, "isActive": 1 });
db.categories_new.createIndex({ "slug": 1 });

// tags_new collection indexes (unchanged)
db.tags_new.createIndex({ "slug": 1 }, { unique: true });
db.tags_new.createIndex({ "recipeCount": -1 });
db.tags_new.createIndex({ "popularityScore": -1 });
```

## **Query Performance Examples**

```javascript
// Category page query (lightning fast with compound index)
db.recipes_new.find({
  "allCategories": "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  "timeCategory": "iki-30-min"
}).sort({ "publishedAt": -1 }).limit(12);

// Tag search with time filter
db.recipes_new.find({
  "tags": "vištiena",
  "timeCategory": "30-60-min"
}).sort({ "publishedAt": -1 }).limit(12);

// Primary category canonical lookup
db.recipes_new.findOne({
  "slug": "vistienos-krutineles-kepsnys-su-grybais"
});
```

This schema design ensures:
- ✅ Maximum query performance with compound indexes
- ✅ Exclusive time filter selection
- ✅ Multiple category support without performance penalty
- ✅ Canonical URLs for SEO
- ✅ Denormalized data for fast breadcrumb rendering
