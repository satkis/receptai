# ⚡ **Image Prep and Load - Quick Reference**

## 🎯 **What It Does**

Automates moving Wikibooks recipe images from `scripts/wiki/output/` to `uploads/to-upload/` with proper renaming.

---

## 🚀 **Usage**

```bash
npm run image-prep-and-load
```

---

## 📋 **Workflow**

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
Done! Ready for npm run upload:watch
```

---

## 📁 **Directories**

| Purpose | Path |
|---------|------|
| **Source** | `scripts/wiki/output/` |
| **Target** | `uploads/to-upload/` |
| **MongoDB** | `recipes_new` collection |

---

## 📝 **File Naming**

### **Source Files** (Wikibooks output)
```
algerian-couscous-with-meat-and-vegetables-main.jpg
peanut-butter-and-jelly-sandwich-main.png
```

### **Target Files** (After rename)
```
alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
sviestas-ir-marmeladas-sumustainis.png
```

---

## 🔍 **Matching Logic**

1. Extract slug from Wikibooks URL
2. Normalize: lowercase, replace spaces/underscores with hyphens
3. Search for file: `<normalized-slug>-main.jpg` or `.png`
4. If found → rename to final S3 filename

**Example**:
```
URL: https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables
Slug: algerian-couscous-with-meat-and-vegetables
File: algerian-couscous-with-meat-and-vegetables-main.jpg ✅
```

---

## 📊 **Output Summary**

```
✅ Successful:  2
⚠️  Warnings:    0
❌ Errors:      0
📦 Total:       2
```

---

## ⚠️ **Status Codes**

| Code | Meaning |
|------|---------|
| `[OK]` | Image successfully prepared |
| `[WARN]` | No matching image found |
| `[ERROR]` | Missing data or processing failed |

---

## 🔧 **Requirements**

- ✅ MongoDB connection (`MONGODB_URI` in `.env.local`)
- ✅ Wikibooks recipes in MongoDB with `originalSource.platform = "Wikibooks"`
- ✅ Images in `scripts/wiki/output/` with `-main.jpg` or `-main.png` suffix
- ✅ Write permissions on `uploads/to-upload/`

---

## 🐛 **Common Issues**

| Issue | Solution |
|-------|----------|
| No recipes found | Check MongoDB has Wikibooks recipes |
| Images not matching | Verify filename format: `<slug>-main.jpg` |
| MongoDB connection fails | Check `MONGODB_URI` in `.env.local` |
| Permission denied | Check write permissions on target directory |

---

## 🔄 **Integration**

```bash
# Step 1: Extract Wikibooks recipes
npm run wiki:extract

# Step 2: Prepare and load images
npm run image-prep-and-load

# Step 3: Watch and upload to S3
npm run upload:watch
```

---

## 📝 **Log Example**

```
[OK] Image prepared for Alžyriškas kuskusas su mėsa ir daržovėmis
     Original: algerian-couscous-with-meat-and-vegetables-main.jpg
     Renamed:  alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
     Moved to: c:\Users\karolis\VibeCoding\receptai\uploads\to-upload
```

---

## ✨ **Key Features**

✅ **Automatic matching** - No manual filename entry  
✅ **Slug normalization** - Handles spaces, underscores, special chars  
✅ **Extension preservation** - Keeps .jpg or .png  
✅ **File overwriting** - Replaces existing files  
✅ **Error handling** - Detailed logging for troubleshooting  
✅ **Summary report** - Success/warning/error counts  

---

**Status**: ✅ **Ready to Use**


