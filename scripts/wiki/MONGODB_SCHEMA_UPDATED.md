# 📋 MongoDB Schema Update - Wikibooks Attribution Support

## ✅ **Schema Changes Summary**

Updated `CurrentRecipe` interface in `types/index.ts` to support Wikibooks recipes with CC BY-SA 4.0 compliance.

### **New Fields Added:**

1. **`originalSource`** (optional) - Wikibooks recipe source metadata
2. **`originalImage`** (optional) - Wikibooks image attribution (separate license)

---

## 📝 **Example 1: Wikibooks Recipe (Tarta de Santiago)**

```json
{
  "_id": "ObjectId",
  "slug": "tarta-de-santiago",
  "canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago",
  
  "title": { "lt": "Santjago tortas" },
  "description": { "lt": "Tradicinė ispaniška torta iš Galicijos..." },
  
  "seo": {
    "metaTitle": "Santjago tortas - Tradicinė ispaniška recepta",
    "metaDescription": "Sužinokite kaip paruošti autentišką Santjago tortą...",
    "keywords": ["santjago torta", "ispaniška torta", "desertas"],
    "recipeCategory": "Desertas",
    "recipeCuisine": "Ispaniška",
    "aggregateRating": {
      "ratingValue": 4.5,
      "reviewCount": 12,
      "bestRating": 5,
      "worstRating": 1
    },
    "nutrition": {
      "calories": 280,
      "proteinContent": "8g",
      "fatContent": "15g",
      "fiberContent": "2g"
    }
  },
  
  "prepTimeMinutes": 20,
  "cookTimeMinutes": 40,
  "totalTimeMinutes": 60,
  "timeCategory": "vidutinis",
  "servings": 8,
  "servingsUnit": "porcijos",
  "difficulty": "vidutinis",
  
  "primaryCategoryPath": "receptai/desertai/tortai",
  "secondaryCategories": ["receptai/ispaniskas-maistas"],
  
  "ingredients": [
    { "name": { "lt": "Migdolai" }, "quantity": "200g", "vital": true },
    { "name": { "lt": "Cukrus" }, "quantity": "200g", "vital": true }
  ],
  
  "sideIngredients": [
    {
      "category": "Padažui",
      "name": { "lt": "Šokoladas" },
      "quantity": "100g",
      "vital": false
    }
  ],
  
  "notes": [
    { "text": { "lt": "Migdolai turi būti smulkiai sumalti" }, "priority": 1 }
  ],
  
  "instructions": [
    {
      "step": 1,
      "name": { "lt": "Paruošimas" },
      "text": { "lt": "Sumalti migdolus..." }
    }
  ],
  
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tarta-de-santiago.jpg",
    "alt": "Santjago torta",
    "width": 1200,
    "height": 800
  },
  
  "tags": ["desertas", "torta", "ispanija"],
  
  "author": {
    "name": "Weeg",
    "profileUrl": "https://en.wikibooks.org/wiki/User:Weeg"
  },

  "originalSource": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Tarta_de_Santiago",
    "pageTitle": "Cookbook:Tarta_de_Santiago",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "datePublished": "2015-03-20T00:00:00Z",
    "extractedAt": "2025-10-27T13:05:17.079Z",
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ATarta_de_Santiago&action=history"
  },
  
  "originalImage": {
    "author": {
      "name": "Ave Maria Mõistlik",
      "userPageUrl": "https://commons.wikimedia.org/wiki/User:Avjoska"
    },
    "license": {
      "code": "cc-by-3.0",
      "shortName": "CC BY 3.0",
      "fullName": "Creative Commons Attribution 3.0",
      "url": "https://creativecommons.org/licenses/by/3.0"
    },
    "wikimediaCommonsUrl": "https://commons.wikimedia.org/wiki/File:Santiago.IMG_9780.JPG"
  },
  
  "status": "published",
  "featured": false,
  "trending": false,
  
  "publishedAt": "2025-10-27T14:30:00Z",
  "createdAt": "2025-10-27T14:30:00Z",
  "updatedAt": "2025-10-27T14:30:00Z"
}
```

---

## 📝 **Example 2: Original Recipe (No Wikibooks)**

```json
{
  "_id": "ObjectId",
  "slug": "lietuviska-sriuba",
  "canonicalUrl": "https://ragaujam.lt/receptas/lietuviska-sriuba",
  
  "title": { "lt": "Lietuviška šriuba" },
  "description": { "lt": "Tradicinė lietuviška šriuba..." },
  
  "author": {
    "name": "Ragaujam.lt",
    "profileUrl": "https://ragaujam.lt"
  },
  
  "originalSource": null,
  "originalImage": null,
  
  "publishedAt": "2025-10-27T14:30:00Z",
  "createdAt": "2025-10-27T14:30:00Z",
  "updatedAt": "2025-10-27T14:30:00Z"
}
```

---

## 🔑 **Key Points**

### **For Wikibooks Recipes:**
- ✅ `author.name` = Wikibooks creator (e.g., "Weeg")
- ✅ `author.profileUrl` = Link to Wikibooks user page
- ✅ `originalSource` = Full Wikibooks metadata (NO originalCreator object - use author instead)
- ✅ `originalImage` = Separate image attribution (may have different license)
- ✅ `datePublished` = Original publication date on Wikibooks

### **For Original Recipes:**
- ✅ `author.name` = Your website name or creator
- ✅ `originalSource` = null
- ✅ `originalImage` = null

### **License Compliance:**
- Recipe: CC BY-SA 4.0 (from Wikibooks)
- Image: May be different (e.g., CC BY 3.0)
- Both must be displayed on website

---

## 🚀 **Next Steps**

1. ✅ MongoDB schema updated
2. ⏳ Update ChatGPT prompt to include new fields
3. ⏳ Create disclaimer component for recipe pages
4. ⏳ Test with Tarta de Santiago recipe

