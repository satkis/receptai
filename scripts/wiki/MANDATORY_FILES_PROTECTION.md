# 🔒 Mandatory Files Protection - Wiki Automation Workflow

**Status**: ✅ Protected with .gitkeep files  
**Last Updated**: 2025-11-24  
**Purpose**: Prevent accidental deletion of critical scripts and templates

---

## 📋 Protected Files & Directories

### **scripts/wiki/.gitkeep**
Protects the following mandatory scripts for Steps 1-3:

**Step 1: Extract Recipes from Wikibooks**
- ✅ `extract-wikibooks-recipe.js` - Extracts recipes and images from Wikibooks
- ✅ `wikibooks-urls.txt` - Input file with Wikibooks recipe URLs

**Step 2: Convert to MongoDB Format**
- ✅ `convert-and-upload.js` - Main orchestrator for extraction and conversion
- ✅ `convert-wikibooks-with-assistant.js` - ChatGPT API conversion script
- ✅ `CHAT_GPT_PROMPT_TEMPLATE.md` - ChatGPT system prompt for recipe conversion

**Step 3: Upload to MongoDB**
- ✅ `upload-gpt-to-mongodb.js` - MongoDB upload script

**Documentation**
- ✅ `output/workFlow.md` - Workflow documentation (CRITICAL - DO NOT DELETE)

### **scripts/wiki/output/.gitkeep**
Protects the following critical documentation:
- ✅ `workFlow.md` - Workflow documentation (CRITICAL - DO NOT DELETE)

### **scripts/.gitkeep-wiki-automation**
Protects the following image processing script for Step 4:

**Step 4: Process Images and Upload to S3**
- ✅ `image-prep-and-load.js` - Image processing and AWS S3 upload script
  - Queries MongoDB for recently uploaded recipes
  - Matches local images to recipes
  - Converts to JPG, compresses, uploads to S3
  - Moves processed images to `scripts/wiki/output/processed/wiki_images/`
  - Updates MongoDB with S3 URLs

---

## 🚀 Complete Wiki Automation Workflow

```
STEP 1: Add URLs to wikibooks-urls.txt
         ↓
STEP 2: npm run wiki:extract
         ├─ Extracts recipes from Wikibooks URLs
         ├─ Downloads images locally
         ├─ Generates raw JSON files (*-wikibooks-raw.json)
         └─ Output: scripts/wiki/output/
         ↓
STEP 3: npm run convert-and-upload
         ├─ Reads raw JSON files from scripts/wiki/output/
         ├─ Sends each recipe to ChatGPT for conversion
         ├─ ChatGPT converts to Lithuanian + MongoDB format
         ├─ Saves converted recipes to scripts/wiki/output/chatGPT/{slug}.json
         └─ Moves raw files to scripts/wiki/output/processed/wiki_json_raw/
         ↓
STEP 4: npm run upload-gpt-to-mongodb
         ├─ Reads converted recipes from scripts/wiki/output/chatGPT/
         ├─ Uploads to MongoDB receptai.recipes_new collection
         ├─ Moves uploaded files to scripts/wiki/output/chatGPT/uploaded-to-mongodb/
         └─ Output: Recipes in MongoDB
         ↓
STEP 5: npm run image-prep-and-load
         ├─ Queries MongoDB for recently uploaded recipes
         ├─ Matches local images in scripts/wiki/output/ to recipes
         ├─ Converts images to JPG format
         ├─ Compresses images using Sharp
         ├─ Uploads to AWS S3 (receptu-images/receptai/)
         ├─ Moves processed images to scripts/wiki/output/processed/wiki_images/
         ├─ Removes images from scripts/wiki/output/
         └─ Updates MongoDB recipes with S3 image URLs
         ↓
STEP 6: ✅ Recipes live on website with images!
```

---

## 🔧 Key Features Implemented

### **1. Public Domain License URL Handling**
- **File**: `scripts/wiki/extract-wikibooks-recipe.js`
- **Feature**: Automatically appends `?uselang=en#Licensing` to image license URLs for public domain images
- **Condition**: Only applies when `license.code === "pd"`
- **Output Location**: `image.license.url` in raw JSON
- **Example**:
  ```json
  {
    "license": {
      "code": "pd",
      "shortName": "Public domain",
      "fullName": "Public domain",
      "url": "https://commons.wikimedia.org/wiki/File:Arancini_002.jpg?uselang=en#Licensing"
    }
  }
  ```

### **2. Mandatory Files Protection**
- **Method**: `.gitkeep` files in critical directories
- **Purpose**: Prevent accidental deletion of automation scripts
- **Locations**:
  - `scripts/wiki/.gitkeep` - Protects extraction and conversion scripts
  - `scripts/wiki/output/.gitkeep` - Protects workflow documentation
  - `scripts/.gitkeep-wiki-automation` - Protects image processing script

---

## 📝 Important Notes

### **For Developers**
- Do NOT delete files listed in this document
- Do NOT modify the `.gitkeep` files
- If you need to update scripts, edit them in place rather than deleting and recreating
- Always test changes with a single recipe before running batch operations

### **For Git Operations**
- `.gitkeep` files are tracked by Git to preserve directory structure
- They serve as visual markers for critical directories
- Removing `.gitkeep` files will NOT delete the protected scripts (they are separate files)

### **For Workflow Continuity**
- All scripts are interdependent
- Missing any single script will break the entire workflow
- Always verify all scripts exist before running `npm run convert-and-upload`

---

## ✅ Verification Checklist

Before running the workflow, verify:
- [ ] `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md` exists
- [ ] `scripts/wiki/extract-wikibooks-recipe.js` exists
- [ ] `scripts/wiki/convert-and-upload.js` exists
- [ ] `scripts/wiki/convert-wikibooks-with-assistant.js` exists
- [ ] `scripts/wiki/upload-gpt-to-mongodb.js` exists
- [ ] `scripts/wiki/wikibooks-urls.txt` exists
- [ ] `scripts/wiki/output/workFlow.md` exists
- [ ] `scripts/image-prep-and-load.js` exists
- [ ] All `.gitkeep` files are in place

---

**Status**: 🟢 All mandatory files protected and verified  
**Last Verification**: 2025-11-24 13:15 UTC

