# 📸 **Image Prep and Load - Complete Summary**

## ✅ **What Was Built**

A production-ready Node.js automation script that:

1. **Queries MongoDB** for Wikibooks recipes with images
2. **Matches local images** from `scripts/wiki/output/`
3. **Renames images** to final S3 filenames
4. **Moves images** to `uploads/to-upload/` for processing

---

## 🚀 **How to Use**

### **Run the Script**
```bash
npm run image-prep-and-load
```

### **What Happens**
```
1. Connects to MongoDB
2. Finds all Wikibooks recipes with images
3. For each recipe:
   - Extracts slug from Wikibooks URL
   - Searches for matching local image file
   - Extracts final S3 filename
   - Renames and moves image to upload queue
4. Displays summary report
```

---

## 📁 **File Structure**

```
scripts/
├── image-prep-and-load.js          ← Main script (NEW)
└── wiki/
    └── output/
        ├── algerian-couscous-with-meat-and-vegetables-main.jpg
        └── peanut-butter-and-jelly-sandwich-main.png

uploads/
└── to-upload/
    ├── alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg  ← Moved here
    └── sviestas-ir-marmeladas-sumustainis.png         ← Moved here
```

---

## 🔄 **Workflow**

```
MongoDB Query
    ↓
Find Wikibooks recipes
    ↓
Extract URL slug
    ↓
Normalize slug
    ↓
Search for matching image
    ↓
Extract final S3 filename
    ↓
Rename and move image
    ↓
Generate summary report
```

---

## 📊 **Output Example**

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

## 🔧 **Technical Details**

### **Language & Framework**
- **Node.js ESM** - Modern JavaScript modules
- **fs/promises** - Async file operations
- **MongoDB Driver** - Database queries
- **path module** - Cross-platform path handling

### **Key Functions**
- `normalizeSlug()` - Standardize slug format
- `getSlugFromUrl()` - Extract slug from URL
- `getFinalFileNameFromImageSrc()` - Extract S3 filename
- `findMatchingLocalImage()` - Search for matching file
- `renameAndMoveImage()` - Copy and rename file
- `connectMongoDB()` - Establish DB connection
- `getWikibooksRecipes()` - Query MongoDB

### **Error Handling**
- ✅ Validates environment variables
- ✅ Handles MongoDB connection errors
- ✅ Validates recipe data
- ✅ Handles file system errors
- ✅ Graceful error recovery
- ✅ Detailed error logging

---

## 📋 **Requirements**

### **Environment Variables**
```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=receptai
```

### **Directories**
- ✅ `scripts/wiki/output/` - Source images
- ✅ `uploads/to-upload/` - Target directory (auto-created)

### **MongoDB**
- ✅ `recipes_new` collection
- ✅ Wikibooks recipes with `originalSource.platform = "Wikibooks"`
- ✅ Recipes with `image.src` field

---

## 🎯 **Matching Logic**

### **Example**

**Wikibooks URL**:
```
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables
```

**Extracted Slug**:
```
algerian-couscous-with-meat-and-vegetables
```

**Local File**:
```
algerian-couscous-with-meat-and-vegetables-main.jpg
```

**Final S3 Filename** (from MongoDB):
```
alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
```

**Result**:
```
Renamed: algerian-couscous-with-meat-and-vegetables-main.jpg
    →    alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
Moved to: uploads/to-upload/
```

---

## 📊 **Status Codes**

| Code | Meaning |
|------|---------|
| `[OK]` | Image successfully prepared |
| `[WARN]` | No matching image found |
| `[ERROR]` | Missing data or processing failed |

---

## 🔄 **Integration**

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

## 📚 **Documentation**

| Document | Purpose |
|----------|---------|
| `IMAGE_PREP_AND_LOAD_QUICK_REFERENCE.md` | Quick lookup (2 min) |
| `IMAGE_PREP_AND_LOAD_GUIDE.md` | Detailed guide (10 min) |
| `IMAGE_PREP_AND_LOAD_CODE_REFERENCE.md` | Code details (15 min) |
| `IMAGE_PREP_AND_LOAD_INDEX.md` | Navigation guide |
| `IMAGE_PREP_AND_LOAD_SUMMARY.md` | This file |

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

## 🐛 **Troubleshooting**

### **No recipes found**
- Check if Wikibooks recipes exist in MongoDB
- Verify `originalSource.platform = "Wikibooks"`
- Verify `image.src` field exists

### **Images not matching**
- Check filename format: `<slug>-main.jpg` or `.png`
- Verify slug normalization (lowercase, hyphens)
- Check Wikibooks output directory path

### **MongoDB connection fails**
- Verify `MONGODB_URI` is set in `.env.local`
- Check MongoDB Atlas network access settings
- Verify connection string is correct

### **Permission errors**
- Check write permissions on `uploads/to-upload/`
- Check read permissions on `scripts/wiki/output/`

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


