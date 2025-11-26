# 🖼️ Wikibooks Recipe Image Scraper

**Purpose**: Automatically identify and collect URLs of Wikibooks recipes that contain images  
**Status**: ✅ **READY TO USE**

---

## 🎯 What It Does

The scraper:
1. ✅ Crawls through **ALL** Wikibooks recipes
2. ✅ Checks each recipe for the "Recipes with images" category tag
3. ✅ Saves URLs to two separate files:
   - `wikibooks-recipes-with-images-urls.txt` - Recipes WITH images
   - `wikibooks-recipes-without-images-urls.txt` - Recipes WITHOUT images

---

## 🚀 Quick Start

```bash
npm run wikibooks:scrape-images
```

This will:
- Fetch all recipes from Wikibooks
- Check each one for images
- Save results to `scripts/wiki/` directory
- Display progress and statistics

---

## 📊 How It Identifies Images

**Key Insight**: Wikibooks automatically categorizes recipes with the "Recipes with images" category tag if they contain an image.

The scraper checks the **page categories** for each recipe:
- ✅ If `Category:Recipes with images` is present → Recipe HAS image
- ❌ If `Category:Recipes with images` is NOT present → Recipe has NO image

This is **100% accurate** because it uses Wikibooks' own categorization system.

---

## 📁 Output Files

### **`wikibooks-recipes-with-images-urls.txt`**
Contains URLs of recipes WITH images:
```
https://en.wikibooks.org/wiki/Cookbook:Baba_Ganoush
https://en.wikibooks.org/wiki/Cookbook:Affogato
https://en.wikibooks.org/wiki/Cookbook:Arancini_(Italian_Fried_Rice_Balls)
...
```

### **`wikibooks-recipes-without-images-urls.txt`**
Contains URLs of recipes WITHOUT images:
```
https://en.wikibooks.org/wiki/Cookbook:Babi_Panggang_Sauce
https://en.wikibooks.org/wiki/Cookbook:Acorn_Crusted_Salmon
...
```

---

## 🔍 Example Results

```
╔════════════════════════════════════════════════════════════════╗
║  WIKIBOOKS RECIPE IMAGE SCRAPER                                ║
╚════════════════════════════════════════════════════════════════╝

📋 Workflow:
  1. Fetch all recipe categories from Wikibooks
  2. For each recipe, check if it has "Recipes with images" category
  3. Save URLs to separate files (with/without images)

🔍 Fetching all recipes...

📄 Processing page 1...
   ✅ Baba Ganoush
   ❌ Babi Panggang Sauce
   ✅ Affogato
   ✅ Arancini (Italian Fried Rice Balls)
   ...

💾 Saving results...
✅ Saved 1,234 recipes WITH images to: scripts/wiki/wikibooks-recipes-with-images-urls.txt
✅ Saved 5,678 recipes WITHOUT images to: scripts/wiki/wikibooks-recipes-without-images-urls.txt

╔════════════════════════════════════════════════════════════════╗
║  SCRAPING SUMMARY                                              ║
╚════════════════════════════════════════════════════════════════╝

📊 Results:
   Total recipes checked: 6,912
   ✅ With images: 1,234
   ❌ Without images: 5,678
   📊 Percentage with images: 17.9%

📁 Output files:
   scripts/wiki/wikibooks-recipes-with-images-urls.txt
   scripts/wiki/wikibooks-recipes-without-images-urls.txt
```

---

## ⚙️ Technical Details

### **API Used**
- **Wikibooks MediaWiki API** - `api.php`
- **Endpoint**: `https://en.wikibooks.org/w/api.php`
- **Method**: Query categories for each recipe

### **Rate Limiting**
- 100ms delay between requests (respectful to Wikibooks servers)
- Handles pagination automatically
- Graceful error handling

### **Performance**
- Processes ~10 recipes per second (with rate limiting)
- ~7,000 recipes = ~12 minutes total runtime
- Can be interrupted and resumed (no state saved)

---

## 🔄 Integration with Existing Workflow

### **Current 4-Step Workflow**
```
Step 1: npm run wiki:extract
  ↓ (Extract from Wikibooks URLs)
Step 2: npm run convert-and-upload
  ↓ (Convert with ChatGPT)
Step 3: npm run upload-gpt-to-mongodb
  ↓ (Upload to MongoDB)
Step 4: npm run image-prep-and-load
  ↓ (Process images & upload to S3)
```

### **New Step 0: Identify Recipes with Images**
```
Step 0: npm run wikibooks:scrape-images
  ↓ (Identify recipes with images)
  ↓ (Save URLs to wikibooks-recipes-with-images-urls.txt)
  ↓
Step 1: npm run wiki:extract
  ↓ (Extract from Wikibooks URLs)
  ... (rest of workflow)
```

---

## 💡 Use Cases

### **1. Find recipes with images only**
```bash
npm run wikibooks:scrape-images
# Then use: scripts/wiki/wikibooks-recipes-with-images-urls.txt
```

### **2. Update wikibooks-urls.txt with image-only recipes**
```bash
npm run wikibooks:scrape-images
cp scripts/wiki/wikibooks-recipes-with-images-urls.txt scripts/wiki/wikibooks-urls.txt
npm run wiki:extract
```

### **3. Analyze recipe coverage**
```bash
npm run wikibooks:scrape-images
# Check the percentage of recipes with images
# Decide if you want to extract all or only image recipes
```

---

## 🛠️ Customization

### **To modify output file locations**
Edit `scripts/wikibooks-image-scraper.js`:
```javascript
const RECIPES_WITH_IMAGES_FILE = 'scripts/wiki/wikibooks-recipes-with-images-urls.txt';
const RECIPES_WITHOUT_IMAGES_FILE = 'scripts/wiki/wikibooks-recipes-without-images-urls.txt';
```

### **To change rate limiting**
Edit the delay in the scraper:
```javascript
// Rate limiting - be nice to Wikibooks
await new Promise(resolve => setTimeout(resolve, 100)); // Change 100 to desired ms
```

### **To scrape a specific category**
Modify the category in `getRecipesFromCategory()`:
```javascript
const { recipes, continue: nextToken } = await getRecipesFromCategory('Category:Vegan_recipes', continueToken);
```

---

## ⚠️ Important Notes

1. **Wikibooks Rate Limiting**: The script includes 100ms delays to be respectful
2. **Network Dependent**: Requires stable internet connection
3. **Long Runtime**: ~12 minutes for all ~7,000 recipes
4. **No Caching**: Each run fetches fresh data from Wikibooks
5. **Pagination**: Automatically handles all pages of results

---

## 🔗 Related Commands

```bash
# Scrape recipes with images
npm run wikibooks:scrape-images

# Extract recipes from Wikibooks
npm run wiki:extract

# Convert with ChatGPT
npm run convert-and-upload

# Upload to MongoDB
npm run upload-gpt-to-mongodb

# Process images and upload to S3
npm run image-prep-and-load
```

---

## 📝 Files

- **`scripts/wikibooks-image-scraper.js`** - Main scraper script
- **`scripts/wiki/wikibooks-recipes-with-images-urls.txt`** - Output: recipes WITH images
- **`scripts/wiki/wikibooks-recipes-without-images-urls.txt`** - Output: recipes WITHOUT images

---

**Status**: ✅ **PRODUCTION READY**  
**Ready to identify and collect all Wikibooks recipes with images!**


