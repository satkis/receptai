# 📋 Upload Workflow Update

**Date**: 2025-11-24  
**Feature**: Automatic original wiki JSON file archival  
**Status**: ✅ **IMPLEMENTED**

---

## 🎯 What Changed

The `npm run upload-gpt-to-mongodb` command now automatically moves **original wiki JSON files** to the processed folder after successful MongoDB upload.

---

## 📁 File Movement Flow

### **Before (Old Workflow)**
```
scripts/wiki/output/
├── {slug}-wikibooks-raw.json          ← Original wiki JSON (stays here)
└── chatGPT/
    ├── {slug}-gpt-converted.json      ← ChatGPT converted JSON
    └── uploaded-to-mongodb/
        └── {slug}-gpt-converted.json  ← Moved here after upload
```

### **After (New Workflow)**
```
scripts/wiki/output/
├── chatGPT/
│   ├── {slug}-gpt-converted.json      ← ChatGPT converted JSON
│   └── uploaded-to-mongodb/
│       └── {slug}-gpt-converted.json  ← Moved here after upload
└── processed/
    └── wiki-raw-recipes/
        └── {slug}-wikibooks-raw.json  ← Original wiki JSON moved here ✅
```

---

## 🔄 Complete Upload Workflow

When you run `npm run upload-gpt-to-mongodb`:

1. **Read** all ChatGPT-converted JSON files from `scripts/wiki/output/chatGPT/`
2. **Upload** each recipe to MongoDB `receptai.recipes_new` collection
3. **Move** ChatGPT JSON to `scripts/wiki/output/chatGPT/uploaded-to-mongodb/`
4. **Move** original wiki JSON to `scripts/wiki/output/processed/wiki-raw-recipes/` ✅ **NEW**

---

## 📝 Implementation Details

### **New Function: `moveOriginalWikiJson(slug)`**
- Searches for original wiki JSON file matching pattern: `{slug}-wikibooks-raw.json`
- Moves file from `scripts/wiki/output/` to `scripts/wiki/output/processed/wiki-raw-recipes/`
- Handles missing files gracefully (optional operation)
- Logs status for each recipe

### **New Directory: `wiki-raw-recipes/`**
- Automatically created if it doesn't exist
- Stores all original wiki JSON files after successful MongoDB upload
- Keeps workflow organized and prevents accidental re-processing

### **Updated Workflow Display**
```
📋 Workflow:
  1. Read all JSON files from scripts/wiki/output/chatGPT/
  2. Upload to MongoDB receptai.recipes_new collection
  3. Move ChatGPT JSON to uploaded-to-mongodb/
  4. Move original wiki JSON to processed/wiki-raw-recipes/
```

---

## ✅ Benefits

1. **Organization**: Original wiki JSON files are archived separately
2. **Workflow Clarity**: Clear separation between raw, converted, and uploaded files
3. **Prevents Re-processing**: Original files moved away from main output folder
4. **Automatic**: No manual file management needed
5. **Safe**: Gracefully handles missing files

---

## 📊 Example Output

```
╔════════════════════════════════════════════════════════════════╗
║  MONGODB RECIPE UPLOAD                                         ║
╚════════════════════════════════════════════════════════════════╝

📋 Workflow:
  1. Read all JSON files from scripts/wiki/output/chatGPT/
  2. Upload to MongoDB receptai.recipes_new collection
  3. Move ChatGPT JSON to uploaded-to-mongodb/
  4. Move original wiki JSON to processed/wiki-raw-recipes/

📁 Created directory: scripts/wiki/output/processed/wiki-raw-recipes

[1/2] Uploading: austriski-tradiciniai-koldunai
   ✅ Inserted successfully (ID: 69244fbf771a3a02619140ec)
   📁 Moved to uploaded-to-mongodb/
   📁 Moved original wiki JSON to processed/wiki-raw-recipes/

[2/2] Uploading: arancini-italiski-kepti-ryziu-kamuoliukai
   ✅ Inserted successfully (ID: 69244fbf771a3a02619140ed)
   📁 Moved to uploaded-to-mongodb/
   📁 Moved original wiki JSON to processed/wiki-raw-recipes/

✅ Recipes uploaded to MongoDB!
```

---

## 🔧 Files Modified

- **`scripts/wiki/upload-gpt-to-mongodb.js`**
  - Added `WIKI_PROCESSED_DIR` constant
  - Added `ensureProcessedDir()` function
  - Added `moveOriginalWikiJson(slug)` function
  - Updated upload logic to call `moveOriginalWikiJson()`
  - Updated workflow display

---

## 🚀 Usage

No changes needed! Just run as usual:

```bash
npm run upload-gpt-to-mongodb
```

The script will automatically:
- ✅ Upload recipes to MongoDB
- ✅ Move ChatGPT JSON files to `uploaded-to-mongodb/`
- ✅ Move original wiki JSON files to `processed/wiki-raw-recipes/`

---

**Status**: ✅ **PRODUCTION READY**  
**All wiki JSON files are now automatically archived after successful MongoDB upload**


