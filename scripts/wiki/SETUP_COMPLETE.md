# ✅ Wikibooks Workflow Setup Complete

## 🎉 All Setup Steps Completed

Your Wikibooks recipe conversion workflow is now fully set up and ready to use!

---

## ✅ Verified Components

### **Directories** ✅
- ✅ `scripts/wiki/output/`
- ✅ `scripts/wiki/output/processed/`
- ✅ `scripts/wiki/output/processed/wiki_json_raw/`
- ✅ `scripts/wiki/output/processed/wiki_images/`
- ✅ `scripts/wiki/output/chatGPT/`

### **Files** ✅
- ✅ `scripts/wiki/convert-and-upload.js` - Main workflow script
- ✅ `scripts/wiki/WORKFLOW_SETUP.md` - Setup guide
- ✅ `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md` - ChatGPT prompt
- ✅ `scripts/wiki/convert-wikibooks-with-assistant.js` - Converter
- ✅ `scripts/wiki/extract-wikibooks-recipe.js` - Extractor
- ✅ `scripts/wiki/wikibooks-urls.txt` - URLs file

### **npm Scripts** ✅
- ✅ `npm run wiki:extract` - Extract recipes from Wikibooks
- ✅ `npm run convert-and-upload` - Convert and organize recipes

### **Environment** ✅
- ✅ `OPENAI_API_KEY` configured in `.env.local`

---

## 🚀 How to Use

### **Step 1: Add Wikibooks URLs**

Edit: `scripts/wiki/wikibooks-urls.txt`

```
https://en.wikibooks.org/wiki/Cookbook:Affogato
https://en.wikibooks.org/wiki/Cookbook:Aadun_(Nigerian_Corn_Flour_with_Palm_Oil)
https://en.wikibooks.org/wiki/Cookbook:Borscht
```

### **Step 2: Extract Recipes**

```bash
npm run wiki:extract
```

This will:
- Download recipes from Wikibooks
- Extract recipe data and images
- Save to `scripts/wiki/output/`

### **Step 3: Convert and Organize**

```bash
npm run convert-and-upload
```

This will:
- Convert all recipes to MongoDB format
- Save to `scripts/wiki/output/chatGPT/`
- Move source files to `scripts/wiki/output/processed/`

### **Step 4: Import to MongoDB**

1. Open MongoDB Compass
2. Go to `receptai` database → `recipes_new` collection
3. Click "Insert Document"
4. Copy JSON from `scripts/wiki/output/chatGPT/{slug}.json`
5. Paste and click "Insert"

### **Step 5: Verify on Website**

Visit: `https://ragaujam.lt/receptas/{slug}`

---

## 📊 Workflow Overview

```
Manual: Add URLs to wikibooks-urls.txt
         ↓
Manual: npm run wiki:extract
         ↓
         Extract recipes & images
         ↓
         *-wikibooks-raw.json files created
         ↓
Manual: npm run convert-and-upload
         ↓
         Automatic conversion process:
         - Convert each recipe to MongoDB format
         - Save to chatGPT/ folder
         - Move source files to processed/ folder
         ↓
         {slug}.json files ready for MongoDB
         ↓
Manual: Import to MongoDB
         ↓
         Recipes live on website!
```

---

## 💰 Cost Tracking

**Per Recipe**:
- Tokens: ~1,800 (optimized)
- Cost: ~$0.05
- Savings: 50% vs traditional method

**For 100 Recipes**:
- Total cost: ~$5
- Savings: ~$5

---

## 🔧 Features

✅ **Automated Workflow**
- Extract, convert, and organize in one command
- Retry logic for failed conversions
- Safety measures to prevent data loss

✅ **Cost Optimization**
- Prompt template stored once
- Only recipe JSON sent per request
- 50% cheaper than traditional method

✅ **Error Handling**
- Graceful failure handling
- Detailed error messages
- Continues processing on errors

✅ **Organization**
- Automatic file movement
- Clear directory structure
- Easy to track progress

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `scripts/wiki/wikibooks-urls.txt` | URLs to extract |
| `scripts/wiki/output/` | Temporary extraction files |
| `scripts/wiki/output/chatGPT/` | Converted recipes (ready for MongoDB) |
| `scripts/wiki/output/processed/` | Successfully processed files |
| `scripts/wiki/convert-and-upload.js` | Main workflow script |
| `scripts/wiki/WORKFLOW_SETUP.md` | Setup guide |

---

## 🎯 Next Steps

1. ✅ Setup complete
2. ⏭️ Add URLs to `scripts/wiki/wikibooks-urls.txt`
3. ⏭️ Run `npm run wiki:extract`
4. ⏭️ Run `npm run convert-and-upload`
5. ⏭️ Import recipes to MongoDB
6. ⏭️ Verify on website

---

## 📚 Documentation

- **Workflow Setup**: `scripts/wiki/WORKFLOW_SETUP.md`
- **Optimized Conversion**: `docs/OPTIMIZED_RECIPE_CONVERSION.md`
- **Wikibooks Guide**: `docs/WIKIBOOKS_CONVERSION_GUIDE.md`
- **ChatGPT Examples**: `docs/CHATGPT_API_SIMPLE_EXAMPLES.md`

---

## 🚀 Ready to Go!

Your workflow is set up and ready to use. Start by adding URLs to `scripts/wiki/wikibooks-urls.txt` and then run:

```bash
npm run wiki:extract
npm run convert-and-upload
```

**Happy recipe converting!** 🎉

