# 📚 **Image Prep and Load - Documentation Index**

## 🎯 **Quick Navigation**

### **I want to...**

| Goal | Document | Time |
|------|----------|------|
| **Run the script** | [Quick Reference](#quick-reference) | 1 min |
| **Understand the workflow** | [Complete Guide](#complete-guide) | 10 min |
| **Learn the code** | [Code Reference](#code-reference) | 15 min |
| **Troubleshoot issues** | [Complete Guide - Troubleshooting](#troubleshooting) | 5 min |

---

## 📄 **Documentation Files**

### **Quick Reference**
**File**: `docs/IMAGE_PREP_AND_LOAD_QUICK_REFERENCE.md`

**Best for**: Quick lookup while working

**Contains**:
- ✅ What it does (TL;DR)
- ✅ Usage command
- ✅ Workflow diagram
- ✅ Directory structure
- ✅ File naming examples
- ✅ Matching logic
- ✅ Output summary
- ✅ Status codes
- ✅ Requirements
- ✅ Common issues

**Read this if**: You need quick answers

---

### **Complete Guide**
**File**: `docs/IMAGE_PREP_AND_LOAD_GUIDE.md`

**Best for**: Detailed step-by-step learning

**Contains**:
- ✅ Overview and quick start
- ✅ Detailed workflow (4 steps)
- ✅ Directory structure
- ✅ Logging output examples
- ✅ Configuration details
- ✅ Summary report format
- ✅ Integration with upload workflow
- ✅ Helper functions overview
- ✅ Important notes
- ✅ Troubleshooting guide
- ✅ Example workflow

**Read this if**: You want to understand every detail

---

### **Code Reference**
**File**: `docs/IMAGE_PREP_AND_LOAD_CODE_REFERENCE.md`

**Best for**: Developers and technical reference

**Contains**:
- ✅ File location
- ✅ Architecture overview
- ✅ Configuration details
- ✅ All helper functions explained
- ✅ Main runner function
- ✅ Error handling patterns
- ✅ Logging implementation
- ✅ Exit codes
- ✅ Testing guide
- ✅ Performance metrics

**Read this if**: You need to understand or modify the code

---

## 🚀 **Getting Started**

### **Step 1: Quick Start (1 minute)**
```bash
npm run image-prep-and-load
```

### **Step 2: Check Results**
```bash
ls uploads/to-upload/
```

### **Step 3: Next Steps**
```bash
npm run upload:watch
```

---

## 📋 **Workflow Overview**

```
MongoDB Query
    ↓
Find Wikibooks recipes with images
    ↓
Match local image files
    ↓
Extract final S3 filename
    ↓
Rename and move to uploads/to-upload/
    ↓
Done! Ready for upload:watch
```

---

## 🔍 **Key Concepts**

### **Slug Matching**
- Extract slug from Wikibooks URL
- Normalize: lowercase, replace spaces/underscores with hyphens
- Search for file: `<normalized-slug>-main.jpg` or `.png`

### **Filename Extraction**
- Parse S3 URL from MongoDB `image.src`
- Extract final filename
- Preserve file extension

### **File Movement**
- Copy from `scripts/wiki/output/`
- Rename to final S3 filename
- Move to `uploads/to-upload/`
- Overwrite if exists

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

## 🔧 **Requirements**

- ✅ Node.js with ESM support
- ✅ MongoDB connection (`MONGODB_URI` in `.env.local`)
- ✅ Wikibooks recipes in MongoDB
- ✅ Images in `scripts/wiki/output/`
- ✅ Write permissions on `uploads/to-upload/`

---

## 📁 **File Locations**

| Purpose | Path |
|---------|------|
| **Script** | `scripts/image-prep-and-load.js` |
| **Source images** | `scripts/wiki/output/` |
| **Target directory** | `uploads/to-upload/` |
| **MongoDB collection** | `recipes_new` |

---

## 🎯 **Helper Functions**

| Function | Purpose |
|----------|---------|
| `normalizeSlug()` | Convert slug to standard format |
| `getSlugFromUrl()` | Extract slug from Wikibooks URL |
| `getFinalFileNameFromImageSrc()` | Extract filename from S3 URL |
| `findMatchingLocalImage()` | Search for matching image file |
| `renameAndMoveImage()` | Copy and rename image |
| `connectMongoDB()` | Establish MongoDB connection |
| `getWikibooksRecipes()` | Query MongoDB for recipes |

---

## 📝 **Status Codes**

| Code | Meaning |
|------|---------|
| `[OK]` | Image successfully prepared |
| `[WARN]` | No matching image found |
| `[ERROR]` | Missing data or processing failed |

---

## 🐛 **Troubleshooting**

### **No recipes found**
→ See [Complete Guide - Troubleshooting](./IMAGE_PREP_AND_LOAD_GUIDE.md#-troubleshooting)

### **Images not matching**
→ See [Complete Guide - Troubleshooting](./IMAGE_PREP_AND_LOAD_GUIDE.md#-troubleshooting)

### **MongoDB connection fails**
→ See [Complete Guide - Troubleshooting](./IMAGE_PREP_AND_LOAD_GUIDE.md#-troubleshooting)

---

## 🔄 **Integration with Other Scripts**

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

## 📚 **Learning Path**

### **For First-Time Users**
1. Read: [Quick Reference](./IMAGE_PREP_AND_LOAD_QUICK_REFERENCE.md) (2 min)
2. Run: `npm run image-prep-and-load`
3. Check: `ls uploads/to-upload/`

### **For Detailed Understanding**
1. Read: [Complete Guide](./IMAGE_PREP_AND_LOAD_GUIDE.md) (10 min)
2. Read: [Quick Reference](./IMAGE_PREP_AND_LOAD_QUICK_REFERENCE.md) (2 min)
3. Run: `npm run image-prep-and-load`

### **For Developers**
1. Read: [Complete Guide](./IMAGE_PREP_AND_LOAD_GUIDE.md) (10 min)
2. Read: [Code Reference](./IMAGE_PREP_AND_LOAD_CODE_REFERENCE.md) (15 min)
3. Review: `scripts/image-prep-and-load.js`
4. Modify as needed

---

## ✨ **Key Features**

✅ **Automatic matching** - No manual filename entry  
✅ **Slug normalization** - Handles spaces, underscores, special chars  
✅ **Extension preservation** - Keeps .jpg or .png  
✅ **File overwriting** - Replaces existing files  
✅ **Error handling** - Detailed logging for troubleshooting  
✅ **Summary report** - Success/warning/error counts  
✅ **Production ready** - Async/await, fs/promises, error handling  

---

## 🎯 **Next Steps**

1. **Run the script**: `npm run image-prep-and-load`
2. **Check results**: `ls uploads/to-upload/`
3. **Upload images**: `npm run upload:watch`
4. **Verify on S3**: Check S3 bucket for uploaded images

---

**Status**: ✅ **All Documentation Complete**


