# 📋 **Extended Output Schema - originalImage.fileName**

## ✅ **What Changed**

The Wikibooks extraction script now includes a new `originalImage` object with a `fileName` attribute that maps to the original Wikibooks image filename.

---

## 📊 **New Schema Structure**

```json
{
  "source": { ... },
  "recipe": { ... },
  "image": {
    "filename": "CookbookTurkeyWrap.jpg",
    "url": "https://upload.wikimedia.org/...",
    "descriptionUrl": "https://commons.wikimedia.org/...",
    "localPath": "scripts/wiki/output/CookbookTurkeyWrap.jpg",
    "dimensions": { "width": 576, "height": 360 },
    "fileSize": 74815,
    "license": { ... },
    "author": { ... },
    "metadata": { ... }
  },
  "originalImage": {
    "fileName": "CookbookTurkeyWrap.jpg"
  }
}
```

---

## 🔍 **Key Attributes**

### **originalImage Object**

| Attribute | Type | Source | Example |
|-----------|------|--------|---------|
| `fileName` | String | `image.filename` from Wikibooks | `"CookbookTurkeyWrap.jpg"` |

---

## 📝 **Mapping Reference**

```
Wikibooks JSON
└── image.filename
    └── Maps to
        └── originalImage.fileName
```

**Example**:
```json
{
  "image": {
    "filename": "CookbookTurkeyWrap.jpg"
  },
  "originalImage": {
    "fileName": "CookbookTurkeyWrap.jpg"
  }
}
```

---

## 🎯 **Use Cases**

### **1. Track Original Filenames**
Keep a reference to the original Wikibooks filename for attribution and tracking.

```javascript
const originalFileName = recipe.originalImage.fileName;
// "CookbookTurkeyWrap.jpg"
```

### **2. Verify Image Integrity**
Compare the original filename with the locally saved file to ensure correct image was downloaded.

```javascript
const localFile = recipe.image.localPath;
const originalName = recipe.originalImage.fileName;

if (path.basename(localFile) === originalName) {
  console.log('✅ Image filename matches original');
}
```

### **3. Attribution and Licensing**
Include original filename in attribution metadata.

```javascript
const attribution = {
  originalFileName: recipe.originalImage.fileName,
  author: recipe.image.author.name,
  license: recipe.image.license.fullName,
  url: recipe.image.url
};
```

---

## 📂 **File Structure**

```
scripts/wiki/output/
├── turkey-wrap-wikibooks-raw.json
│   └── Contains:
│       ├── image.filename: "CookbookTurkeyWrap.jpg"
│       └── originalImage.fileName: "CookbookTurkeyWrap.jpg"
├── CookbookTurkeyWrap.jpg
│   └── Actual image file (saved with original filename)
├── burrito-wikibooks-raw.json
│   └── Contains:
│       ├── image.filename: "Papa_chevos_burrito.jpg"
│       └── originalImage.fileName: "Papa_chevos_burrito.jpg"
└── Papa_chevos_burrito.jpg
    └── Actual image file (saved with original filename)
```

---

## 🔄 **Workflow Integration**

### **Step 1: Extract from Wikibooks**
```bash
npm run wiki:extract
```

**Output**: JSON with `originalImage.fileName` attribute

### **Step 2: Prepare Images**
```bash
npm run image-prep-and-load
```

**Uses**: `originalImage.fileName` to locate and process images

### **Step 3: Upload to S3**
```bash
npm run upload:watch
```

**Result**: Images uploaded with proper metadata

---

## 💾 **Example JSON Output**

<augment_code_snippet path="scripts/wiki/output/turkey-wrap-wikibooks-raw.json" mode="EXCERPT">
```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Turkey_Wrap",
    "pageTitle": "Cookbook:Turkey_Wrap"
  },
  "recipe": {
    "title": "Cookbook:Turkey Wrap",
    "slug": "turkey-wrap"
  },
  "image": {
    "filename": "CookbookTurkeyWrap.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/1/11/CookbookTurkeyWrap.jpg",
    "localPath": "scripts/wiki/output/CookbookTurkeyWrap.jpg"
  },
  "originalImage": {
    "fileName": "CookbookTurkeyWrap.jpg"
  }
}
```
</augment_code_snippet>

---

## 🚀 **Benefits**

✅ **Traceability**: Always know the original Wikibooks filename  
✅ **Verification**: Confirm images match their source  
✅ **Attribution**: Include original filename in metadata  
✅ **Debugging**: Easier to track image processing issues  
✅ **Future-proof**: Extensible schema for additional attributes  

---

## 📌 **Notes**

- `originalImage.fileName` is always identical to `image.filename`
- Both are set from the Wikibooks API response
- Images are saved locally with this exact filename
- The attribute is `null` if no image is available

---

## ✨ **Status**

✅ **Implemented and tested**  
✅ **All new extractions include this attribute**  
✅ **Ready for production use**


