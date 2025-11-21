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
**Status**: ✅ COMPLETE
**Command**: `npm run upload-gpt-to-mongodb`
**Process**:
- Reads all JSON files from `scripts/wiki/output/chatGPT/`
- Uploads to MongoDB `receptai.recipes_new` collection
- Detects existing recipes by slug (updates if exists)
- Moves successfully uploaded files to `scripts/wiki/output/chatGPT/uploaded-to-mongodb/`
- Includes error handling and progress reporting

### 2e. Image Processing & AWS S3 Upload
**Status**: ⏳ TODO
**Command**: `npm run image-prep-and-load` (to be updated)
**Process**:
- Read images from `scripts/wiki/output/` (original filenames, any format)
- Convert all images to JPG format (PNG, WebP, GIF, etc. → JPG)
- Rename to slug-based format: `{slug}.jpg`
- Move to `uploads/to-upload/` for S3 upload
- Upload to AWS S3 `receptu-images/receptai/` bucket
- Move processed images to `scripts/wiki/output/processed/wiki_images/`
- Update recipe JSON with S3 image URLs

---

## 📊 Complete Workflow Summary

```
Step 1: Add URLs to wikibooks-urls.txt
         ↓
Step 2: npm run convert-and-upload
         ├─ 2a: npm run wiki:extract (extract recipes & images)
         ├─ 2b: Convert to MongoDB format (ChatGPT)
         ├─ 2c: Organize converted files
         └─ 2d: npm run upload-gpt-to-mongodb (upload to MongoDB) ✅
         ↓
Step 3: npm run image-prep-and-load (compress & upload images to S3) ⏳
         ↓
Step 4: Recipes live on website!
```

---

## 🎯 Next Steps

1. ✅ Step 2d (MongoDB upload) - COMPLETE
2. ⏳ Step 2e (Image processing) - IN PROGRESS
3. ⏳ Step 3 (Image upload to S3) - TODO
