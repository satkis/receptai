# 📊 Sample Data Upload Guide

## 🎯 **Quick Start - Automated Import**

### **Option 1: Run the Import Script (Recommended)**
```bash
# Install dependencies if needed
npm install mongodb dotenv

# Run the automated import script
node scripts/import-sample-data.js
```

This will automatically import all sample data and create optimized indexes.

---

## 📋 **Manual Upload - Copy-Paste Method**

If you prefer to manually upload data using MongoDB Compass or mongosh:

### **1. page_configs Collection**
```javascript
// Copy from: sample-data/page_configs_sample.json
// Creates 7 category pages: sumustiniai, uzkandžiai, desertai, vistiena, zuvis, lietuviska, vegetariski
```

### **2. filter_definitions Collection**
```javascript
// Copy from: sample-data/filter_definitions_sample.json
// Creates 26 filter options across 6 categories
```

### **3. recipes Collection (Enhanced)**
```javascript
// Copy from: sample-data/enhanced_recipes_sample.json
// Creates 3 sample recipes with new category structure
```

### **4. groups Collection**
```javascript
// Copy from: sample-data/groups_sample.json
// Creates 5 recipe groups for organization
```

### **5. categories Collection**
```javascript
// Copy from: sample-data/categories_sample.json
// Creates 11 category definitions
```

---

## 🔍 **Required MongoDB Indexes**

After importing data, create these indexes for optimal performance:

### **Primary Filtering Indexes**
```javascript
// 1. Category + Time + Rating
db.recipes.createIndex({ 
  "status": 1, 
  "categories.mealType": 1, 
  "categories.mainIngredient": 1,
  "timing.totalTimeMinutes": 1,
  "rating.average": -1
}, { name: "recipes_category_time_rating" });

// 2. Dietary + Cuisine + Time
db.recipes.createIndex({ 
  "status": 1, 
  "categories.dietary": 1, 
  "categories.cuisine": 1,
  "timing.totalTimeMinutes": 1
}, { name: "recipes_dietary_cuisine_time" });

// 3. Time + Meal Type + Rating
db.recipes.createIndex({ 
  "status": 1,
  "categories.timeRequired": 1,
  "categories.mealType": 1,
  "rating.average": -1,
  "createdAt": -1
}, { name: "recipes_time_meal_rating" });

// 4. Unique Slug Index
db.recipes.createIndex({ 
  "slug": 1 
}, { name: "recipes_slug_unique", unique: true });
```

### **Supporting Collection Indexes**
```javascript
// Page configs
db.page_configs.createIndex({ slug: 1 }, { unique: true });

// Filter definitions
db.filter_definitions.createIndex({ type: 1, active: 1, order: 1 });

// Groups
db.groups.createIndex({ slug: 1 });

// Categories
db.categories.createIndex({ type: 1, active: 1 });
```

---

## 📁 **Sample Data Structure Overview**

### **Enhanced Recipe Schema**
```javascript
{
  "slug": "vistienos-sumustiniai",
  "title": { "lt": "Vištienos sumuštiniai", "en": "Chicken Sandwiches" },
  "categories": {
    "cuisine": ["lietuviska"],
    "mealType": ["sumustiniai", "pietus"],
    "dietary": ["sveika", "baltyminga"],
    "mainIngredient": ["vistiena"],
    "timeRequired": "15min",
    "customTags": ["greitas", "vaikams"]
  },
  "timing": {
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 5,
    "totalTimeMinutes": 15,
    "activeTimeMinutes": 8,
    "restTimeMinutes": 2
  }
  // ... rest of recipe data
}
```

### **Page Configuration Schema**
```javascript
{
  "slug": "sumustiniai",
  "category": "mealType",
  "categoryValue": "sumustiniai",
  "seo": {
    "title": "Sumuštinių receptai - Paragaujam.lt",
    "description": "Geriausi sumuštinių receptai...",
    "canonicalUrl": "/receptai/sumustiniai"
  },
  "quickFilters": [
    { "type": "timeRequired", "values": ["15min", "30min"], "order": 1 }
  ]
}
```

---

## 🧪 **Testing Your Setup**

### **1. Verify Data Import**
```javascript
// Check collections exist and have data
db.page_configs.countDocuments()      // Should return 7
db.filter_definitions.countDocuments() // Should return 26
db.recipes.countDocuments()           // Should return 3+ (your existing + new)
db.groups.countDocuments()            // Should return 5
db.categories.countDocuments()        // Should return 11
```

### **2. Test Category Pages**
Visit these URLs in your browser:
- `http://localhost:3000/receptai/sumustiniai`
- `http://localhost:3000/receptai/vistiena`
- `http://localhost:3000/receptai/vegetariski`
- `http://localhost:3000/receptai/desertai`

### **3. Test Filtering**
- Click on filter pills (time, dietary, ingredients)
- Verify URL updates without page reload
- Check that recipe counts update correctly

### **4. Test API Endpoints**
```bash
# Category API
curl "http://localhost:3000/api/recipes/category/sumustiniai"

# Filters API
curl "http://localhost:3000/api/filters/sumustiniai"

# With filters applied
curl "http://localhost:3000/api/recipes/category/sumustiniai?filters=timeRequired:15min,dietary:vegetariski"
```

---

## 🚀 **Production Deployment**

### **Environment Variables**
Make sure these are set in production:
```env
MONGODB_URI=mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### **Performance Verification**
- Category page load: <50ms
- Filter switching: <20ms
- Infinite scroll: <30ms per batch

---

## 📈 **Expected Results**

After importing sample data, you'll have:

✅ **7 Category Pages** ready to use
✅ **26 Filter Options** across 6 categories
✅ **3 Sample Recipes** with enhanced schema
✅ **Optimized Indexes** for fast queries
✅ **SEO-Ready URLs** and meta tags
✅ **Pill-Shaped Filters** with counts
✅ **Infinite Scroll** pagination

**Your enhanced filtering system is now ready for production!** 🎉

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Collection not found"** - Run the import script first
2. **"Slow queries"** - Verify indexes were created
3. **"Filter not working"** - Check recipe categories match filter definitions
4. **"Page not found"** - Verify page_configs collection has the category slug

### **Debug Commands:**
```javascript
// Check if indexes exist
db.recipes.getIndexes()

// Check sample recipe structure
db.recipes.findOne({}, { categories: 1, timing: 1 })

// Check page config
db.page_configs.findOne({ slug: "sumustiniai" })
```
