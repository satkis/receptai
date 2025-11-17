# 📸 **npm run upload:watch - Complete Summary**

## ❓ **Your Questions Answered**

### **Q1: Where do I add photos?**
**A**: `uploads/to-upload/` folder

**Path**: `c:\Users\karolis\VibeCoding\receptai\uploads\to-upload\`

**Filename format**: `recipe-slug.jpg` (must match MongoDB recipe slug exactly)

---

### **Q2: Where do SEO keywords come from?**
**A**: Automatically extracted from MongoDB recipe data

**Sources** (in order of priority):
1. **Recipe Title** - First 3 words
2. **seo.keywords** - Array of 5 SEO keywords
3. **tags** - First 3 recipe tags
4. **ingredients** - Vital ingredients only
5. **seo.recipeCuisine** - Cuisine type (stored separately)
6. **seo.recipeCategory** - Recipe category (stored separately)

---

### **Q3: How are keywords added to S3?**
**A**: As metadata headers in the S3 object

**Process**:
1. Extract keywords from MongoDB
2. Combine all sources into single string
3. Convert Lithuanian characters to ASCII (ą→a, č→c, etc.)
4. Add as `keywords` metadata header to S3 object
5. Also add: `alt-text`, `cuisine`, `category`, `description`

---

## 🔄 **Complete Workflow**

```
1. START
   └─ npm run upload:watch

2. MONITOR
   └─ Watches uploads/to-upload/ every 2 seconds

3. DETECT
   └─ New image: recipe-slug.jpg

4. COMPRESS
   └─ Sharp: 1200x800px, 85% quality
   └─ Saves to uploads/temp/compressed_recipe-slug.jpg

5. QUERY MONGODB
   └─ Finds recipe by slug
   └─ Extracts all metadata

6. EXTRACT KEYWORDS
   ├─ Title words: "Žemaitiški", "kepsneliai", "su"
   ├─ SEO keywords: "žemaitiški kepsneliai", "kepsneliai su lašiniais", ...
   ├─ Tags: "tradicinis", "lietuviška", ...
   ├─ Ingredients: "Kiauliena", "Lašiniai"
   └─ Combined: "zemaitiskai,kepsneliai,su,tradicinis,lietuviska,kiauliena,lasiniai"

7. CONVERT ASCII
   └─ Remove Lithuanian characters
   └─ Remove special characters
   └─ Sanitize for S3 headers

8. UPLOAD TO S3
   ├─ Bucket: receptu-images
   ├─ Path: receptai/recipe-slug.jpg
   ├─ File: Compressed version
   └─ Metadata: keywords, cuisine, category, alt-text, description

9. ORGANIZE FILES
   ├─ Move original: uploads/to-upload/ → uploads/uploaded/
   ├─ Delete temp: uploads/temp/compressed_recipe-slug.jpg
   └─ Save backup: uploads/metadata/recipe-slug.jpg.json

10. DONE
    └─ Image on S3 with full SEO metadata!
```

---

## 📊 **Metadata Extraction Example**

### **MongoDB Recipe**
```javascript
{
  slug: "tikroji-svogunu-sriuba",
  title: { lt: "Tikroji svogūnų sriuba" },
  seo: {
    keywords: ["svogūnų sriuba", "tradicinė sriuba", "lengva sriuba", "šilta sriuba", "šeimos pietūs"],
    recipeCuisine: "Lietuviška",
    recipeCategory: "Sriubos"
  },
  tags: ["tradicinis", "lietuviška", "šeimos pietūs"],
  ingredients: [
    { name: { lt: "Svogūnai" }, vital: true },
    { name: { lt: "Sviestas" }, vital: true },
    { name: { lt: "Sultinys" }, vital: true }
  ]
}
```

### **Extracted Keywords**
```
1. Title (first 3): Tikroji, svogūnų, sriuba
2. SEO keywords: svogūnų sriuba, tradicinė sriuba, lengva sriuba, šilta sriuba, šeimos pietūs
3. Tags (first 3): tradicinis, lietuviška, šeimos pietūs
4. Vital ingredients: Svogūnai, Sviestas, Sultinys

Combined: Tikroji,svogūnų,sriuba,svogūnų sriuba,tradicinė sriuba,lengva sriuba,šilta sriuba,šeimos pietūs,tradicinis,lietuviška,šeimos pietūs,Svogūnai,Sviestas,Sultinys
```

### **Converted to ASCII**
```
Tikroji,svogunu,sriuba,svogunu sriuba,tradicine sriuba,lengva sriuba,silta sriuba,seimos pietus,tradicinis,lietuviska,seimos pietus,Svogunu,Sviestas,Sultinys
```

### **S3 Metadata**
```json
{
  "keywords": "Tikroji,svogunu,sriuba,svogunu sriuba,tradicine sriuba,lengva sriuba,silta sriuba,seimos pietus,tradicinis,lietuviska,seimos pietus,Svogunu,Sviestas,Sultinys",
  "alt-text": "Tikroji svogunu sriuba",
  "cuisine": "Lietuviska",
  "category": "Sriubos",
  "description": "Tikroji svogunu sriuba - tradicinis lietuviu patiekalas..."
}
```

---

## 🚀 **Quick Start**

### **1. Start Watcher**
```bash
npm run upload:watch
```

### **2. Add Image**
```bash
# Copy image to uploads/to-upload/
# Filename MUST match recipe slug
cp my-photo.jpg uploads/to-upload/tikroji-svogunu-sriuba.jpg
```

### **3. Watch Output**
```
📷 New image detected: tikroji-svogunu-sriuba.jpg
🔄 Compressing image...
✅ Compressed: 1.2MB (52% reduction)
📊 Recipe data found for tikroji-svogunu-sriuba
✅ Successfully uploaded: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tikroji-svogunu-sriuba.jpg
```

### **4. Done!**
Image is on S3 with SEO keywords automatically added!

---

## 📁 **File Organization**

```
uploads/
├── to-upload/              ← DROP IMAGES HERE
│   └── recipe-slug.jpg
├── uploaded/               ← Processed originals
│   └── recipe-slug.jpg
├── temp/                   ← Temporary files (auto-deleted)
│   └── compressed_recipe-slug.jpg
└── metadata/               ← Metadata backups
    └── recipe-slug.jpg.json
```

---

## ⚠️ **Important Rules**

1. **Filename = Recipe Slug**
   - Must match MongoDB recipe slug exactly
   - Example: `tikroji-svogunu-sriuba.jpg`

2. **Recipe Must Exist**
   - Recipe must be in MongoDB `recipes_new` collection
   - Must have matching `slug` field

3. **SEO Fields Required**
   - `title.lt` - Recipe title
   - `seo.keywords` - Array of keywords
   - `tags` - Array of tags
   - `ingredients` - Array with vital flag
   - `seo.recipeCuisine` - Cuisine type
   - `seo.recipeCategory` - Recipe category

4. **Image Format**
   - Supported: .jpg, .jpeg, .png, .webp, .gif
   - Will be compressed to 1200x800px max

---

## 🔐 **Requirements**

- ✅ MongoDB connection configured
- ✅ AWS credentials in `.env.local`
- ✅ S3 bucket `receptu-images` accessible
- ✅ Recipe exists in MongoDB with matching slug
- ✅ Recipe has SEO metadata fields

---

## 📝 **Files Created**

| File | Purpose |
|------|---------|
| `docs/UPLOAD_WATCH_GUIDE.md` | Detailed guide with all steps |
| `docs/UPLOAD_WATCH_QUICK_REFERENCE.md` | Quick reference card |
| `docs/UPLOAD_WATCH_SUMMARY.md` | This file - complete summary |

---

## ✨ **Summary**

**Where to add photos**: `uploads/to-upload/`

**Where keywords come from**: MongoDB recipe fields (title, seo.keywords, tags, ingredients, cuisine, category)

**How keywords added to S3**: As metadata headers with ASCII conversion

**Automatic process**: Yes! Just drop image and system handles everything.

---

**Status**: ✅ **Ready to Use**


