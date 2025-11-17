# ✅ ChatGPT Prompt Review & Optimization

## 📋 Analysis Summary

I reviewed your prompt against the actual MongoDB schema and codebase. Here are my findings:

---

## ❌ MISSING ATTRIBUTES (Must Add to Output)

### **1. `seo.nutrition` (CRITICAL)**
**Status**: Missing from your prompt output  
**Required**: YES  
**Structure**:
```json
"nutrition": {
  "calories": 952,
  "proteinContent": "45",
  "fatContent": "66",
  "carbohydrateContent": "0",
  "fiberContent": "0",
  "sugarContent": "0",
  "sodiumContent": "0"
}
```
**Rules**:
- All values as strings (except calories which is number)
- Calculate per serving based on ingredients
- If unknown, use "0"
- Include all 7 fields

### **2. `seo.focusKeyword` (RECOMMENDED)**
**Status**: Missing from your prompt output  
**Required**: NO (but recommended)  
**Type**: String  
**Example**: `"spagečiai karbonara"`  
**Rule**: Main SEO keyword (1-3 words)

### **3. `image.width` & `image.height` (CRITICAL)**
**Status**: You have hardcoded 1200x800  
**Issue**: Should match actual image dimensions  
**Rule**: Use actual image dimensions from Wikibooks JSON:
- From input: `image.dimensions.width` and `image.dimensions.height`
- Example: 1891 x 1482 (from Tarta de Santiago)

---

## ⚠️ INCORRECT ATTRIBUTE FORMATS

### **1. `difficulty` - WRONG FORMAT**
**Your format**: `"DIFFICULTY_LEVEL"` (string)  
**Actual format**: String with specific values  
**Valid options**:
- `"labai-lengvas"` (very easy)
- `"lengvas"` (easy)
- `"vidutiniškas"` (medium)
- `"sunkus"` (hard)
- `"labai-sunkus"` (very hard)

**Mapping from numeric (1-5)**:
- 1 → `"labai-lengvas"`
- 2 → `"lengvas"`
- 3 → `"vidutiniškas"`
- 4 → `"sunkus"`
- 5 → `"labai-sunkus"`

### **2. `timeCategory` - WRONG OPTIONS**
**Your options**: `iki-15-min`, `iki-30-min`, `iki-60-min`, `iki-120-min`, `daugiau-nei-2-val`  
**Actual options** (from codebase):
- `"iki-30-min"` (up to 30 min)
- `"30-60-min"` (30-60 min)
- `"1-2-val"` (1-2 hours)
- `"virs-2-val"` (over 2 hours)

**Mapping rules**:
- totalTimeMinutes ≤ 30 → `"iki-30-min"`
- 31-60 → `"30-60-min"`
- 61-120 → `"1-2-val"`
- 121+ → `"virs-2-val"`

### **3. `servingsUnit` - WRONG OPTIONS**
**Your options**: `porcijos`, `gabaliukai`, `vienetai`  
**Actual options** (from codebase):
- `"porcijos"` (portions) - most common
- `"gabaliukai"` (pieces)
- `"vienetai"` (units)
- `"šaukštai"` (spoons)
- `"puodeliai"` (cups)
- `"gramų"` (grams)
- `"kilogramų"` (kilograms)

**Rule**: Adapt to recipe type. For most recipes: `"porcijos"`

### **4. `recipeCategory` - INCOMPLETE LIST**
**Your list**: Only 8 categories  
**Actual categories** (from codebase):

**Main Categories**:
- `"Karšti patiekalai"` (Hot dishes)
- `"Sriubos"` (Soups)
- `"Užkandžiai"` (Snacks)
- `"Salotos ir mišrainės"` (Salads)
- `"Vištiena"` (Chicken)
- `"Jautiena"` (Beef)
- `"Žuvis ir jūros gėrybės"` (Fish & Seafood)
- `"Desertai"` (Desserts)

**Filter Categories**:
- `"15 minučių patiekalai"` (15 min dishes)
- `"Be glitimo"` (Gluten free)
- `"Vegetariški patiekalai"` (Vegetarian)

**Rule**: Choose ONE from above list based on recipe type

### **5. `primaryCategoryPath` - WRONG FORMAT**
**Your example**: `receptai/pagrindini-patiekalas`  
**Actual format**: `receptai/{CATEGORY_SLUG}`  
**Valid examples**:
- `"receptai/karsti-patiekalai"`
- `"receptai/sriubos"`
- `"receptai/uzkandziai"`
- `"receptai/salotos"`
- `"receptai/vistiena"`
- `"receptai/jautiena"`
- `"receptai/zuvis"`
- `"receptai/desertai"`

**Rule**: Use category slug from the list above

### **6. `secondaryCategories` - WRONG FORMAT**
**Your example**: `["receptai/lietuviska", "receptai/tradiciniai"]`  
**Issue**: These categories don't exist in codebase  
**Valid examples**:
- `["receptai/vistiena", "receptai/salotos"]`
- `["receptai/jautiena", "receptai/karsti-patiekalai"]`
- `["receptai/zuvis", "receptai/uzkandziai"]`

**Rule**: 
- 2-4 related categories from the main list
- Must be different from primaryCategoryPath
- Choose based on recipe ingredients/type

---

## ✅ CORRECT ATTRIBUTES (No Changes Needed)

- ✅ `slug` - Format correct
- ✅ `canonicalUrl` - Format correct
- ✅ `title.lt` - Format correct
- ✅ `description.lt` - Format correct
- ✅ `seo.metaTitle` - Format correct
- ✅ `seo.metaDescription` - Format correct
- ✅ `seo.keywords` - Format correct (5 keywords)
- ✅ `seo.recipeCuisine` - Format correct
- ✅ `seo.aggregateRating` - Format correct
- ✅ `prepTimeMinutes` - Format correct
- ✅ `cookTimeMinutes` - Format correct
- ✅ `totalTimeMinutes` - Format correct
- ✅ `servings` - Format correct
- ✅ `ingredients` - Format correct
- ✅ `sideIngredients` - Format correct
- ✅ `instructions` - Format correct
- ✅ `notes` - Format correct
- ✅ `image.src` - Format correct
- ✅ `image.alt` - Format correct
- ✅ `tags` - Format correct
- ✅ `author` - Format correct
- ✅ `status` - Format correct
- ✅ `featured` - Format correct
- ✅ `trending` - Format correct
- ✅ `publishedAt`, `createdAt`, `updatedAt` - Format correct

---

## 🎯 QUESTIONS FOR YOU

Before finalizing the prompt, I need clarification on:

### **Q1: Image Dimensions**
Should ChatGPT use:
- A) Actual dimensions from Wikibooks JSON (e.g., 1891x1482)?
- B) Always use 1200x800 (standard)?
- C) Calculate aspect ratio and suggest dimensions?

**My recommendation**: Use actual dimensions from input JSON

### **Q2: Nutrition Calculation**
Should ChatGPT:
- A) Calculate nutrition values based on ingredients?
- B) Use estimated values (rough estimates)?
- C) Leave as "0" if not available?

**My recommendation**: Estimate based on ingredients, or use "0" if unsure

### **Q3: Cuisine Type**
For Wikibooks recipes (international), should ChatGPT:
- A) Use the original cuisine (e.g., "Italų" for Spaghetti)?
- B) Always use "Tarptautinė" (International)?
- C) Detect from recipe name/ingredients?

**My recommendation**: Use original cuisine type

### **Q4: Recipe Category Mapping**
For recipes that don't fit perfectly, should ChatGPT:
- A) Choose closest category from the list?
- B) Ask for clarification?
- C) Use "Karšti patiekalai" as default?

**My recommendation**: Choose closest category

---

## 📝 FINAL CHECKLIST

Before you use the prompt with ChatGPT, ensure:

- [ ] Add `seo.nutrition` with all 7 fields
- [ ] Add `seo.focusKeyword` (optional but recommended)
- [ ] Fix `image.width` and `image.height` to use actual dimensions
- [ ] Update `difficulty` options to use hyphens
- [ ] Update `timeCategory` options to match codebase
- [ ] Update `recipeCategory` to use actual categories
- [ ] Update `primaryCategoryPath` to use actual category slugs
- [ ] Update `secondaryCategories` to use actual category slugs
- [ ] Verify all other attributes are correct

---

## 🚀 NEXT STEPS

1. Answer the 4 questions above
2. I'll update the prompt with all corrections
3. You can then use it with ChatGPT
4. Test with Tarta de Santiago recipe

**Status**: 🔴 **NEEDS FIXES** - 6 attributes need correction


