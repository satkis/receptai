# Wikibooks Recipe Conversion Workflow Setup

## 📋 Overview

This workflow automates the process of extracting recipes from Wikibooks, converting them to MongoDB format, and organizing them for import.

---

## 🚀 Quick Start

### **Step 1: Add Wikibooks URLs**

Edit: `scripts/wiki/wikibooks-urls.txt`

Add one URL per line:
```
https://en.wikibooks.org/wiki/Cookbook:Affogato
https://en.wikibooks.org/wiki/Cookbook:Aadun_(Nigerian_Corn_Flour_with_Palm_Oil)
https://en.wikibooks.org/wiki/Cookbook:Borscht
```

### **Step 2: Run the Workflow**

```bash
npm run convert-and-upload
```

This will:
1. ✅ Extract recipes from Wikibooks URLs
2. ✅ Convert all recipes to MongoDB format
3. ✅ Move successfully converted files to processed folder

---

## 📁 Directory Structure

```
scripts/wiki/output/
├── *-wikibooks-raw.json          # Extracted recipes (temporary)
├── chatGPT/
│   └── {slug}.json               # Converted recipes (ready for MongoDB)
└── processed/
    ├── wiki_json_raw/            # Successfully processed recipes
    └── wiki_images/              # Downloaded recipe images
```

---

## 🔄 Workflow Steps

### **Step 1: Extract (Manual Trigger)**

```bash
npm run wiki:extract
```

**What it does**:
- Reads URLs from `scripts/wiki/wikibooks-urls.txt`
- Downloads recipe data and images
- Saves to `scripts/wiki/output/`

**Output**:
- `{recipe}-wikibooks-raw.json` files
- Recipe images in `scripts/wiki/output/`

---

### **Step 2: Convert (Automatic)**

```bash
npm run convert-and-upload
```

**What it does**:
- Reads all `*-wikibooks-raw.json` files
- Sends each to ChatGPT for conversion
- Saves converted recipes to `scripts/wiki/output/chatGPT/`
- Moves source files to `scripts/wiki/output/processed/wiki_json_raw/`

**Output**:
- `{slug}.json` files in `chatGPT/` folder
- Source files moved to `processed/` folder

---

## 📊 Workflow Diagram

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
         Convert each recipe to MongoDB format
         ↓
         {slug}.json files created in chatGPT/
         ↓
         Move source files to processed/
         ↓
         Ready for MongoDB import
```

---

## ✅ Setup Checklist

- [ ] `scripts/wiki/wikibooks-urls.txt` exists
- [ ] `scripts/wiki/output/` directory exists
- [ ] `scripts/wiki/output/processed/wiki_json_raw/` directory exists
- [ ] `scripts/wiki/output/processed/wiki_images/` directory exists
- [ ] `scripts/wiki/output/chatGPT/` directory exists
- [ ] `OPENAI_API_KEY` is set in `.env.local`
- [ ] `npm run wiki:extract` works
- [ ] `npm run convert-and-upload` works

---

## 🎯 Next Steps

After workflow completes:

1. **Review converted recipes**:
   ```bash
   ls scripts/wiki/output/chatGPT/
   ```

2. **Check a recipe**:
   ```bash
   cat scripts/wiki/output/chatGPT/{slug}.json
   ```

3. **Import to MongoDB**:
   - Open MongoDB Compass
   - Go to `receptai` database → `recipes_new` collection
   - Click "Insert Document"
   - Paste JSON from converted recipe
   - Click "Insert"

4. **Verify on website**:
   - Visit https://ragaujam.lt/receptas/{slug}
   - Check recipe displays correctly

---

## 🔧 Troubleshooting

### **Error: "No recipes to convert"**
- Check that `npm run wiki:extract` completed successfully
- Verify files exist in `scripts/wiki/output/`

### **Error: "Conversion failed"**
- Check OpenAI API key in `.env.local`
- Check API rate limits
- Review error message in console

### **Error: "File not found"**
- Verify directory paths are correct
- Check file permissions

---

## 💡 Tips

- **Batch processing**: The script processes recipes one at a time with 2-second delays to avoid rate limiting
- **Retry logic**: If a recipe fails, it's skipped and the workflow continues
- **Cost tracking**: Each recipe costs ~$0.05 (50% cheaper with optimized prompt)
- **Safety**: Source files are only deleted after successful conversion

---

## 📚 Related Files

- **Workflow script**: `scripts/wiki/convert-and-upload.js`
- **Converter script**: `scripts/wiki/convert-wikibooks-with-assistant.js`
- **Extractor script**: `scripts/wiki/extract-wikibooks-recipe.js`
- **Prompt template**: `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md`
- **URLs file**: `scripts/wiki/wikibooks-urls.txt`

---

## 🚀 Ready to Start?

1. Add URLs to `scripts/wiki/wikibooks-urls.txt`
2. Run `npm run wiki:extract`
3. Run `npm run convert-and-upload`
4. Import recipes to MongoDB
5. Verify on website

**Let's go!** 🎉

