# 📸 **Image Prep and Load - Complete Documentation**

## 🎯 **Overview**

The `image-prep-and-load` script is a production-ready Node.js automation tool that bridges the gap between Wikibooks recipe extraction and S3 image upload. It automatically:

1. **Queries MongoDB** for Wikibooks recipes with images
2. **Matches local images** from the Wikibooks output directory
3. **Renames images** to their final S3 filenames
4. **Moves images** to the upload queue for processing

---

## 🚀 **Quick Start**

### **Installation**
The script is already installed. Just run:

```bash
npm run image-prep-and-load
```

### **Expected Output**
```
📸 Image Prep and Load Automation

Configuration:
  Wikibooks Output: c:\...\scripts\wiki\output
  Upload Target:    c:\...\uploads\to-upload
  MongoDB DB:       receptai

🔗 Connecting to MongoDB...
✅ MongoDB connected

📋 Querying Wikibooks recipes...
✅ Found 2 Wikibooks recipes with images

🔄 Processing recipes:

[OK] Image prepared for Alžyriškas kuskusas su mėsa ir daržovėmis
     Original: algerian-couscous-with-meat-and-vegetables-main.jpg
     Renamed:  alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
     Moved to: c:\...\uploads\to-upload

======================================================================
📊 SUMMARY
======================================================================
✅ Successful:  1
⚠️  Warnings:    0
❌ Errors:      0
📦 Total:       2
======================================================================
```

---

## 📋 **How It Works**

### **Step 1: MongoDB Query**
Finds all recipes where:
- `originalSource.platform = "Wikibooks"`
- `originalSource.url` exists
- `image.src` exists

### **Step 2: Slug Matching**
For each recipe:
1. Extract slug from Wikibooks URL
2. Normalize slug (lowercase, replace spaces/underscores with hyphens)
3. Search for matching file in `scripts/wiki/output/`
4. Match pattern: `<slug>-main.jpg` or `<slug>-main.png`

### **Step 3: Filename Extraction**
Extract final filename from MongoDB `image.src` URL:
```
https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
                                                                    ↓
                                                    alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
```

### **Step 4: Rename and Move**
1. Copy local image to `uploads/to-upload/`
2. Rename to final S3 filename
3. Preserve file extension (jpg/png)
4. Overwrite if file already exists

---

## 📁 **Directory Structure**

```
scripts/wiki/output/
├── algerian-couscous-with-meat-and-vegetables-main.jpg
├── algerian-couscous-with-meat-and-vegetables-wikibooks-raw.json
├── peanut-butter-and-jelly-sandwich-main.png
└── peanut-butter-and-jelly-sandwich-wikibooks-raw.json

uploads/to-upload/
├── alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg  ← Moved here
└── sviestas-ir-marmeladas-sumustainis.png         ← Moved here
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required in .env.local
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

### **Hardcoded Paths**
- **Wikibooks Output**: `scripts/wiki/output/`
- **Upload Target**: `uploads/to-upload/`
- **MongoDB Collection**: `recipes_new`

---

## 📊 **Logging Output**

### **Success Message**
```
[OK] Image prepared for <recipe-title>
     Original: <source-filename>
     Renamed:  <final-filename>
     Moved to: <target-directory>
```

### **Warning Message**
```
[WARN] No image found for <wikibooks-url>
```

### **Error Message**
```
[ERROR] Missing image.src for <recipe-id>
[ERROR] Could not extract slug from URL: <url>
[ERROR] Could not extract filename from image.src: <url>
[ERROR] Failed to process image for <recipe-title>: <error-message>
```

---

## 🔄 **Integration with Other Scripts**

### **Complete Workflow**
```bash
# 1. Extract Wikibooks recipes (creates images)
npm run wiki:extract

# 2. Prepare and load images (moves to upload queue)
npm run image-prep-and-load

# 3. Watch and upload (compresses and uploads to S3)
npm run upload:watch

# 4. Done! Images are on S3 with metadata
```

---

## 🛠️ **Helper Functions**

| Function | Purpose |
|----------|---------|
| `normalizeSlug()` | Convert slug to lowercase, replace spaces/underscores with hyphens |
| `getSlugFromUrl()` | Extract slug from Wikibooks URL, remove "Cookbook:" prefix |
| `getFinalFileNameFromImageSrc()` | Extract filename from S3 URL |
| `findMatchingLocalImage()` | Search for matching image file in output directory |
| `renameAndMoveImage()` | Copy and rename image to target directory |
| `connectMongoDB()` | Establish MongoDB connection with retry logic |
| `getWikibooksRecipes()` | Query MongoDB for Wikibooks recipes with images |

---

## ⚠️ **Important Notes**

1. **File Overwriting**: Existing files in `uploads/to-upload/` will be overwritten
2. **Extension Preservation**: File extension is preserved from `image.src` URL
3. **Normalization**: Slug normalization is case-insensitive and removes special characters
4. **MongoDB Connection**: Requires valid `MONGODB_URI` environment variable
5. **Directory Creation**: Target directory is created automatically if it doesn't exist

---

## 🐛 **Troubleshooting**

### **No recipes found**
- Check if Wikibooks recipes exist in MongoDB
- Verify `originalSource.platform = "Wikibooks"`
- Verify `image.src` field exists

### **Images not matching**
- Check filename format: `<slug>-main.jpg` or `<slug>-main.png`
- Verify slug normalization (lowercase, hyphens)
- Check Wikibooks output directory path

### **MongoDB connection fails**
- Verify `MONGODB_URI` is set in `.env.local`
- Check MongoDB Atlas network access settings
- Verify connection string is correct

### **Permission errors**
- Check write permissions on `uploads/to-upload/` directory
- Check read permissions on `scripts/wiki/output/` directory

---

## 📚 **Documentation Files**

| Document | Purpose | Time |
|----------|---------|------|
| `IMAGE_PREP_AND_LOAD_QUICK_REFERENCE.md` | Quick lookup | 2 min |
| `IMAGE_PREP_AND_LOAD_GUIDE.md` | Detailed guide | 10 min |
| `IMAGE_PREP_AND_LOAD_CODE_REFERENCE.md` | Code details | 15 min |
| `IMAGE_PREP_AND_LOAD_INDEX.md` | Navigation | 2 min |
| `IMAGE_PREP_AND_LOAD_SUMMARY.md` | Complete summary | 5 min |

---

## ✨ **Key Features**

✅ **Automatic matching** - No manual filename entry  
✅ **Slug normalization** - Handles spaces, underscores, special chars  
✅ **Extension preservation** - Keeps .jpg or .png  
✅ **File overwriting** - Replaces existing files  
✅ **Error handling** - Detailed logging for troubleshooting  
✅ **Summary report** - Success/warning/error counts  
✅ **Production ready** - Async/await, fs/promises, error handling  
✅ **ESM syntax** - Modern JavaScript modules  
✅ **Cross-platform** - Works on Windows, Mac, Linux  

---

## 📝 **Exit Codes**

| Code | Meaning |
|------|---------|
| `0` | Success (no errors) |
| `1` | Errors occurred |

---

## 🎯 **Next Steps**

1. **Run the script**: `npm run image-prep-and-load`
2. **Check results**: `ls uploads/to-upload/`
3. **Upload images**: `npm run upload:watch`
4. **Verify on S3**: Check S3 bucket for uploaded images

---

## 📦 **Package.json Entry**

```json
{
  "scripts": {
    "image-prep-and-load": "node scripts/image-prep-and-load.js"
  }
}
```

---

## ✅ **Production Ready**

- ✅ Clean, modular code
- ✅ Comprehensive error handling
- ✅ Detailed logging
- ✅ ESM syntax
- ✅ fs/promises for async operations
- ✅ MongoDB connection pooling
- ✅ Cross-platform compatibility
- ✅ Fully documented

---

**Status**: ✅ **Complete and Ready to Use**


