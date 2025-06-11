# 🗄️ Database Schema Design - Lithuanian Recipe Website

## **Overview**

Optimized MongoDB schema for 10k+ recipes with hierarchical categories, free-form tags, and fast read performance.

## **URL Structure**
- **Recipe URLs**: `domain.lt/receptas/recipe-slug`
- **Category Pages**: `domain.lt/receptu-tipai/desertai/lengvi-desertai`
- **Tag Search Pages**: `domain.lt/paieska/tag-value`

## **Collections**

### **1. `recipes` Collection**

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
  
  // Categorization (ONE main category path)
  categoryPath: "pagal-ingredienta/mesa/vistiena/krutinele",
  categoryIds: [ObjectId, ObjectId, ObjectId, ObjectId], // For efficient querying
  
  // Breadcrumb data (denormalized for performance)
  breadcrumbs: [
    { title: "Receptai", slug: "receptai", url: "/receptai" },
    { title: "Pagal ingredientą", slug: "pagal-ingredienta", url: "/receptu-tipai/pagal-ingredienta" },
    { title: "Mėsa", slug: "mesa", url: "/receptu-tipai/pagal-ingredienta/mesa" },
    { title: "Vištiena", slug: "vistiena", url: "/receptu-tipai/pagal-ingredienta/mesa/vistiena" },
    { title: "Krūtinėlė", slug: "krutinele", url: "/receptu-tipai/pagal-ingredienta/mesa/vistiena/krutinele" }
  ],
  
  // Tags (free-form, clickable)
  tags: ["vištiena", "krūtinėlė", "grybai", "orkaitėje", "30 minučių", "šeimai"],
  
  // Additional metadata
  image: "/images/vistienos-krutineles-kepsnys.jpg",
  rating: { average: 4.5, count: 23 },
  difficulty: "lengvas",
  
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

### **2. `categories` Collection**

```javascript
{
  _id: ObjectId,
  title: { lt: "Krūtinėlė", en: "Breast" },
  slug: "krutinele",
  
  // Hierarchy
  parentId: ObjectId, // Points to "vistiena" category
  level: 4, // Depth in hierarchy (1=root, 2=sub, etc.)
  path: "pagal-ingredienta/mesa/vistiena/krutinele",
  fullPath: ["pagal-ingredienta", "mesa", "vistiena", "krutinele"],
  
  // Breadcrumb chain (denormalized)
  ancestors: [
    { _id: ObjectId, title: "Pagal ingredientą", slug: "pagal-ingredienta", level: 1 },
    { _id: ObjectId, title: "Mėsa", slug: "mesa", level: 2 },
    { _id: ObjectId, title: "Vištiena", slug: "vistiena", level: 3 }
  ],
  
  // Metadata
  description: { lt: "Vištienos krūtinėlės receptai", en: "Chicken breast recipes" },
  icon: "🍗",
  recipeCount: 47, // Updated periodically
  
  // SEO
  seo: {
    metaTitle: "Vištienos krūtinėlės receptai (47) - Paragaujam.lt",
    metaDescription: "Geriausi vištienos krūtinėlės receptai. 47 patikrinti receptai su nuotraukomis.",
    keywords: ["vištienos krūtinėlė", "receptai", "vištiena"]
  },
  
  // Display settings
  isActive: true,
  sortOrder: 1,
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### **3. `tags` Collection**

```javascript
{
  _id: ObjectId,
  name: "vištiena",
  slug: "vistiena", // URL-safe version
  
  // Metadata
  recipeCount: 156, // Updated periodically
  description: "Receptai su vištiena",
  
  // Related tags (for suggestions)
  relatedTags: ["krūtinėlė", "šlaunelė", "sparneliai", "mėsa"],
  
  // SEO for tag pages
  seo: {
    metaTitle: "Vištienos receptai (156) - Paragaujam.lt",
    metaDescription: "156 vištienos receptai su nuotraukomis ir instrukcijomis.",
    keywords: ["vištiena", "receptai", "vištienos patiekalai"]
  },
  
  // Statistics
  popularityScore: 8.5, // Based on clicks, searches
  trending: false,
  
  createdAt: ISODate,
  updatedAt: ISODate,
  lastUsed: ISODate
}
```

### **4. `page_configs` Collection**

```javascript
{
  _id: ObjectId,
  pageType: "category", // "category", "tag", "recipe"
  path: "pagal-ingredienta/mesa/vistiena/krutinele",
  
  // Available filters for this page
  availableFilters: {
    "pagal-trukme": ["per-15-min", "per-30-min", "per-1-val"],
    "pagal-dieta": ["be-gliuteno", "be-laktozes"],
    "pagal-gaminimo-buda": ["orkaiteje", "greitpuodyje"],
    "pagal-proga": ["šeimai", "pietūs-į-darbą"]
  },
  
  // Quick filters (shown prominently)
  quickFilters: ["per-30-min", "lengvas", "šeimai"],
  
  // SEO settings
  seo: {
    titleTemplate: "{category} receptai ({count}) - Paragaujam.lt",
    descriptionTemplate: "{count} {category} receptai su nuotraukomis ir instrukcijomis."
  },
  
  updatedAt: ISODate
}
```

## **Indexing Strategy**

```javascript
// recipes collection indexes
db.recipes.createIndex({ "categoryPath": 1, "publishedAt": -1 })
db.recipes.createIndex({ "categoryIds": 1, "rating.average": -1 })
db.recipes.createIndex({ "tags": 1, "publishedAt": -1 })
db.recipes.createIndex({ "slug": 1 }, { unique: true })
db.recipes.createIndex({ "title.lt": "text", "description.lt": "text", "tags": "text" })

// categories collection indexes
db.categories.createIndex({ "path": 1 }, { unique: true })
db.categories.createIndex({ "parentId": 1, "sortOrder": 1 })
db.categories.createIndex({ "level": 1, "isActive": 1 })

// tags collection indexes
db.tags.createIndex({ "slug": 1 }, { unique: true })
db.tags.createIndex({ "recipeCount": -1 })
db.tags.createIndex({ "popularityScore": -1 })
```

## **Performance Optimizations**

1. **Denormalized breadcrumbs** in recipes for fast rendering
2. **Category IDs array** for efficient category filtering
3. **Recipe counts** cached in categories and tags
4. **Compound indexes** for common query patterns
5. **Text search index** for full-text search capabilities

This schema supports:
- ✅ Fast category page loading
- ✅ Efficient tag-based filtering
- ✅ SEO-optimized URLs
- ✅ Scalable to 10k+ recipes
- ✅ Flexible tag system
- ✅ Hierarchical breadcrumbs
