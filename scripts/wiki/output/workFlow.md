# 🚀 Wikibooks Recipe Workflow

## Step 1: Add URLs
**Status**: MANUAL
**Description**: Add Wikibooks recipe URLs to `scripts/wiki/wikibooks-urls.txt` (one per line)

---

## Step 2: Automated Conversion & Upload Pipeline
**Status**: MANUAL (trigger) → AUTOMATIC (execution)
**Command**: `npm run convert-and-upload`

### 2a. Extract Recipes from Wikibooks
**Status**: ✅ AUTOMATIC
**Command**: `npm run wiki:extract`
**Output**:
- Raw JSON files → `scripts/wiki/output/*-wikibooks-raw.json`
- Images → `scripts/wiki/output/` (original filenames)

### 2b. Convert to MongoDB Format
**Status**: ✅ AUTOMATIC
**Process**:
- Reads all `*-wikibooks-raw.json` files
- Sends to ChatGPT for conversion
- Outputs → `scripts/wiki/output/chatGPT/{slug}.json`
- Includes retry logic and safety measures

### 2c. Organize Converted Files
**Status**: ✅ AUTOMATIC
**Process**:
- Successfully converted raw files moved to `scripts/wiki/output/processed/wiki_json_raw/`
- Tracks conversion progress

### 2d. Upload to MongoDB
**Status**: ✅ MANUAL
**Command**: `npm run upload-gpt-to-mongodb`
**Process**:
- Reads all JSON files from `scripts/wiki/output/chatGPT/`
- Uploads to MongoDB `receptai.recipes_new` collection
- Detects existing recipes by slug (updates if exists)
- Moves successfully uploaded files to `scripts/wiki/output/chatGPT/uploaded-to-mongodb/` 
- Includes error handling and progress reporting

### 2e. Image Processing & AWS S3 Upload
**Status**: ✅ MANUAL
**Command**: `npm run image-prep-and-load`
**Process**:
- Query MongoDB for today's Wikibooks recipes with images
- Find matching local images in `scripts/wiki/output/`
- Convert all images to JPG format (PNG, WebP, GIF, etc. → JPG)
- Rename to slug-based format: `{slug}.jpg`
- Compress images (max 1200x800, quality 85)
- Upload to AWS S3 `receptu-images/receptai/` bucket
- Update MongoDB recipes with S3 image URLs
- Move processed images to `scripts/wiki/output/processed/wiki_images/`
- Remove images from main `scripts/wiki/output/` folder
- Clean up temporary files

---

## 📊 Complete Workflow Summary

```
Step 1: Add URLs to wikibooks-urls.txt
         ↓
Step 2: npm run convert-and-upload
         ├─ 2a: npm run wiki:extract (extract recipes & images)
         ├─ 2b: Convert to MongoDB format (ChatGPT)
         ├─ 2c: Organize converted files

STEP 3: npm run upload-gpt-to-mongodb (upload to MongoDB)
         └─ 2d: uploads to mongoDB and moves json to ✅
         ↓
Step 4: 2e: npm run image-prep-and-load (complete image workflow) ✅
         ├─ Convert to JPG
         ├─ Compress images
         ├─ Upload to S3
         ├─ Update MongoDB with S3 URLs
         ├─ Move to processed/wiki_images/
         └─ Remove from output folder
         ↓
Step 5: ✅ Recipes live on website with images!
```

---

## 🎯 Status

✅ **COMPLETE** - All steps automated and working!

**Full workflow now runs with just 3 commands:**
1. `npm run wiki:extract` - extract wiki recipes to create raw jsons.
1. `npm run convert-and-upload` - Extract & convert recipes
2. `npm run upload-gpt-to-mongodb` - Upload to MongoDB
3. `npm run image-prep-and-load` - Process & upload images to S3
