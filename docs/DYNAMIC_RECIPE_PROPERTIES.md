# 🔄 Dynamic Recipe Properties Strategy

## 🎯 **Problem Solved:**
Instead of hardcoded values like `'Lietuviška'` for all recipes, we now have flexible, dynamic properties that can be:
1. **Explicitly set** in database per recipe
2. **Auto-detected** from existing tags and categories
3. **Defaulted** to sensible fallbacks

## ✅ **Implementation Strategy:**

### **Option 1: Database Fields (Recommended for New Recipes)**

Add these optional fields to your recipe schema:

```json
{
  "recipeCuisine": "Itališka",
  "recipeCategory": "Sriuba", 
  "cookingMethod": "Virimas",
  "suitableForDiet": ["VegetarianDiet"],
  "recipeOrigin": "Toskana, Italija"
}
```

### **Option 2: Smart Auto-Detection (Works with Existing Recipes)**

The schema generator now automatically detects:

```typescript
// Auto-detects cuisine from tags
recipeCuisine: recipe.recipeCuisine || getRecipeCuisine(recipe.tags)

// Examples:
// Tags: ["italija", "pasta"] → "Itališka"
// Tags: ["kinija", "wok"] → "Kiniška" 
// Tags: ["lietuviska"] → "Lietuviška"
```

## 🔧 **Current Auto-Detection Logic:**

### **Cuisine Detection:**
```typescript
const cuisineMap = {
  'italija': 'Itališka',
  'prancuzija': 'Prancūziška', 
  'kinija': 'Kiniška',
  'indija': 'Indiška',
  'meksika': 'Meksikonų',
  'graikija': 'Graikų',
  'japonija': 'Japoniška',
  'tailandas': 'Tailandiečių',
  'vokietija': 'Vokiška',
  'ispanija': 'Ispaniška'
  // Default: 'Lietuviška'
};
```

### **Category Detection:**
```typescript
const categoryMap = {
  'receptai/sriubos': 'Sriuba',
  'receptai/desertas': 'Desertas', 
  'receptai/gerimai': 'Gėrimas',
  'receptai/salotos': 'Užkandis'
  // Default: 'Pagrindinis patiekalas'
};
```

## 📊 **Priority System:**

1. **Database Field** (highest priority)
2. **Auto-Detection** from tags/categories  
3. **Default Value** (fallback)

```typescript
// Example logic:
recipeCuisine: recipe.recipeCuisine || getRecipeCuisine(recipe.tags) || 'Lietuviška'
```

## 🚀 **Implementation Options:**

### **Option A: Gradual Migration (Recommended)**

1. **Keep existing recipes** as-is
2. **Auto-detection works** immediately for all recipes
3. **Add explicit fields** only for new recipes or when editing

**Benefits:**
- ✅ No database migration needed
- ✅ Works with existing 10k+ recipes
- ✅ Improves over time

### **Option B: Bulk Update Script**

Create a script to analyze existing recipes and add explicit fields:

```javascript
// Bulk update script example
db.recipes_new.find({}).forEach(recipe => {
  const updates = {};
  
  // Auto-detect cuisine
  if (!recipe.recipeCuisine) {
    updates.recipeCuisine = getRecipeCuisine(recipe.tags);
  }
  
  // Auto-detect cooking method
  if (recipe.tags.includes('orkaiteje')) {
    updates.cookingMethod = 'Kepimas orkaitėje';
  } else if (recipe.tags.includes('ant-lauzo')) {
    updates.cookingMethod = 'Kepimas ant lauzo';
  }
  
  if (Object.keys(updates).length > 0) {
    db.recipes_new.updateOne(
      { _id: recipe._id },
      { $set: updates }
    );
  }
});
```

## 📋 **Extended Dynamic Properties:**

### **Cooking Method Detection:**
```json
// From tags → cookingMethod
"ant-lauzo" → "Kepimas ant lauzo"
"orkaiteje" → "Kepimas orkaitėje" 
"virimas" → "Virimas"
"kepimas" → "Kepimas"
"griliavimas" → "Griliavimas"
```

### **Dietary Restrictions:**
```json
// From tags → suitableForDiet
"vegetariska" → ["VegetarianDiet"]
"veganiška" → ["VeganDiet"] 
"be-angliavandeniu" → ["LowCarbDiet"]
"be-glitimo" → ["GlutenFreeDiet"]
```

### **Meal Type Detection:**
```json
// From category/tags → mealType
"pusryčiai" → ["Pusryčiai"]
"pietūs" → ["Pietūs"] 
"vakarienė" → ["Vakarienė"]
"užkandis" → ["Užkandis"]
```

## 🎯 **SEO Benefits:**

### **Before (Static):**
```json
{
  "recipeCuisine": "Lietuviška", // All recipes
  "recipeCategory": "Pagrindinis patiekalas" // Most recipes
}
```

### **After (Dynamic):**
```json
{
  "recipeCuisine": "Itališka", // Toskanietiška sriuba
  "recipeCategory": "Sriuba",  // Specific category
  "cookingMethod": "Virimas",  // From tags
  "suitableForDiet": ["VegetarianDiet"] // From tags
}
```

## 🔧 **Implementation Steps:**

### **Step 1: Update Schema Generator** ✅ (Done)
- Added dynamic cuisine detection
- Added fallback system
- Maintains backward compatibility

### **Step 2: Test with Existing Recipe**
```javascript
// Your current recipe with tags: ["italija", "sriuba"]
// Will automatically get:
// recipeCuisine: "Itališka" (from "italija" tag)
// recipeCategory: "Sriuba" (from category path)
```

### **Step 3: Add Explicit Fields (Optional)**
For recipes where auto-detection isn't accurate:
```json
{
  "recipeCuisine": "Fusion", // Override auto-detection
  "cookingMethod": "Sous vide", // Specific technique
  "recipeOrigin": "Šiaurės Italija" // Detailed origin
}
```

## ✅ **Benefits:**

1. **🔄 Backward Compatible** - Works with existing recipes
2. **🎯 More Accurate** - Specific cuisine per recipe
3. **🚀 Better SEO** - More detailed structured data
4. **⚡ Easy Maintenance** - Auto-detection reduces manual work
5. **📈 Scalable** - Works with thousands of recipes

**Your recipe with tags `["italija", "sriuba"]` will now automatically get `recipeCuisine: "Itališka"` instead of the generic `"Lietuviška"`!** 🎉
