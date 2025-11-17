# 📸 **Image Rename Workflow - Updated**

## ✅ **What Changed**

The `image-prep-and-load.js` script now renames images to match the recipe slug from MongoDB's `image.src` field instead of keeping the original Wikibooks filename.

---

## 🔄 **Workflow**

### **Before**
```
Wikibooks Image: CookbookTurkeyWrap.jpg
                    ↓
Moved to uploads/to-upload as: CookbookTurkeyWrap.jpg ❌
```

### **After**
```
Wikibooks Image: CookbookTurkeyWrap.jpg
                    ↓
MongoDB recipe.image.src: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/kalakutu-suktinukai-tortilijose.jpg
                    ↓
Renamed and moved to: kalakutu-suktinukai-tortilijose.jpg ✅
```

---

## 📋 **Process Steps**

### **Step 1: Find Local Image**
- Query MongoDB for Wikibooks recipes
- Extract Wikibooks URL slug
- Find matching JSON file in `scripts/wiki/output/`
- Read `image.filename` from JSON (original Wikibooks filename)
- Locate the actual image file

### **Step 2: Extract Final Filename**
- Get `image.src` from MongoDB recipe
- Extract filename from S3 URL
- Example: `https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/kalakutu-suktinukai-tortilijose.jpg`
- Result: `kalakutu-suktinukai-tortilijose.jpg`

### **Step 3: Rename and Move**
- Copy image from `scripts/wiki/output/` to `uploads/to-upload/`
- Rename to final S3 filename (recipe slug based)
- Log original and final filenames

---

## 🎯 **Key Functions**

### **getFinalFileNameFromImageSrc(imageSrc)**
Extracts the final filename from the S3 URL in `image.src`

```javascript
// Input
"https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/kalakutu-suktinukai-tortilijose.jpg"

// Output
"kalakutu-suktinukai-tortilijose.jpg"
```

### **renameAndMoveImage(sourcePath, targetFileName)**
Copies image from source to target directory with new filename

```javascript
// Input
sourcePath: "scripts/wiki/output/CookbookTurkeyWrap.jpg"
targetFileName: "kalakutu-suktinukai-tortilijose.jpg"

// Output
"uploads/to-upload/kalakutu-suktinukai-tortilijose.jpg"
```

---

## 📊 **Example Output**

```
[OK] Image prepared for Kalakutienos suktinukai tortilijose
     Original: CookbookTurkeyWrap.jpg
     Renamed:  kalakutu-suktinukai-tortilijose.jpg
     Moved to: C:\Users\karolis\VibeCoding\receptai\uploads\to-upload
```

---

## 🔗 **Data Flow**

```
MongoDB Recipe
├── slug: "kalakutu-suktinukai-tortilijose"
├── image.src: "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/kalakutu-suktinukai-tortilijose.jpg"
└── originalSource.url: "https://en.wikibooks.org/wiki/Cookbook:Turkey_Wrap"
        ↓
Extract Wikibooks slug: "turkey-wrap"
        ↓
Find JSON: "turkey-wrap-wikibooks-raw.json"
        ↓
Read image.filename: "CookbookTurkeyWrap.jpg"
        ↓
Find local image: "scripts/wiki/output/CookbookTurkeyWrap.jpg"
        ↓
Extract final filename from image.src: "kalakutu-suktinukai-tortilijose.jpg"
        ↓
Copy and rename: "uploads/to-upload/kalakutu-suktinukai-tortilijose.jpg" ✅
```

---

## ✨ **Benefits**

✅ **Consistent Naming**: Images match recipe slugs  
✅ **S3 Ready**: Filenames match final S3 paths  
✅ **Easy Tracking**: Know which image belongs to which recipe  
✅ **Automatic**: No manual renaming needed  
✅ **Verified**: Logs show original and final names  

---

## 📝 **Usage**

```bash
npm run image-prep-and-load
```

**Output**:
- ✅ Images renamed to recipe slugs
- ✅ Moved to `uploads/to-upload/`
- ✅ Ready for S3 upload with `npm run upload:watch`

---

## 🔍 **Verification**

Check the `uploads/to-upload/` folder:

```
uploads/to-upload/
├── kalakutu-suktinukai-tortilijose.jpg  ✅ (renamed from CookbookTurkeyWrap.jpg)
├── other-recipe-slug.jpg                ✅ (renamed from OriginalWikibooksName.jpg)
└── ...
```

---

## 📌 **Notes**

- Original Wikibooks filename is preserved in MongoDB's `originalImage.fileName`
- Final filename is based on recipe slug from `image.src`
- Script handles multiple recipes in one run
- Warnings shown for recipes without matching local images
- Errors logged for any processing failures

---

## ✅ **Status**

✅ **Implemented and tested**  
✅ **Images renamed correctly**  
✅ **Ready for production use**  


