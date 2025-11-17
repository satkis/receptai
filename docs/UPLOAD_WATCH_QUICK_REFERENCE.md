# ⚡ **npm run upload:watch - Quick Reference**

## 🎯 **TL;DR**

1. **Start**: `npm run upload:watch`
2. **Add image**: `uploads/to-upload/recipe-slug.jpg`
3. **Wait**: System automatically uploads to S3 with SEO metadata
4. **Done**: Image on S3 with keywords from MongoDB

---

## 📁 **Folder Structure**

```
uploads/
├── to-upload/          ← DROP IMAGES HERE
├── uploaded/           ← Processed originals
├── temp/               ← Temporary compressed files
└── metadata/           ← Metadata backups
```

---

## 📸 **Image Naming**

**Format**: `recipe-slug.jpg`

**Must match MongoDB recipe slug exactly!**

```
✅ tikroji-svogunu-sriuba.jpg
✅ alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
❌ my-photo.jpg (no matching recipe)
❌ Photo_2025.jpg (wrong format)
```

---

## 🔄 **What Happens Automatically**

| Step | Action | Details |
|------|--------|---------|
| 1 | **Detect** | Watcher finds new image every 2 seconds |
| 2 | **Compress** | Sharp: 1200x800px, 85% quality, ~50% smaller |
| 3 | **Query MongoDB** | Finds recipe by slug |
| 4 | **Extract Keywords** | From title, seo.keywords, tags, ingredients |
| 5 | **Convert ASCII** | Removes Lithuanian characters for S3 |
| 6 | **Upload S3** | Compressed file + metadata headers |
| 7 | **Organize** | Move original, delete temp, save backup |

---

## 🔍 **Where SEO Keywords Come From**

**MongoDB Recipe Fields**:

```javascript
// 1. Recipe Title (first 3 words)
recipe.title.lt = "Žemaitiški kepsneliai su rūkytais lašiniais"
// → "Žemaitiški", "kepsneliai", "su"

// 2. SEO Keywords (array)
recipe.seo.keywords = ["žemaitiški kepsneliai", "kepsneliai su lašiniais", ...]
// → All 5 keywords

// 3. Tags (array)
recipe.tags = ["tradicinis", "lietuviška", "šeimos pietūs"]
// → First 3 tags

// 4. Vital Ingredients
recipe.ingredients = [
  { name: { lt: "Kiauliena" }, vital: true },
  { name: { lt: "Lašiniai" }, vital: true }
]
// → "Kiauliena", "Lašiniai"

// 5. Cuisine Type
recipe.seo.recipeCuisine = "Lietuviška"
// → Stored as "cuisine" metadata

// 6. Recipe Category
recipe.seo.recipeCategory = "Kepsniai"
// → Stored as "category" metadata
```

---

## ☁️ **S3 Metadata Added**

```json
{
  "alt-text": "Žemaitiški kepsneliai",
  "recipe-slug": "tikroji-svogunu-sriuba",
  "keywords": "zemaitiskai,kepsneliai,lasiniai,tradicinis,lietuviska",
  "category": "Kepsniai",
  "cuisine": "Lietuviska",
  "description": "Tradiciniai zemaitiskai kepsneliai...",
  "upload-date": "2025-11-06"
}
```

**S3 URL**:
```
https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/recipe-slug.jpg
```

---

## 🚀 **Usage**

### **Start Watcher**
```bash
npm run upload:watch
```

### **Add Image**
```bash
# Copy image to uploads/to-upload/
cp my-photo.jpg uploads/to-upload/recipe-slug.jpg
```

### **Stop Watcher**
```bash
Ctrl+C
```

---

## ⚠️ **Common Issues**

| Problem | Solution |
|---------|----------|
| Image not uploading | Filename must match recipe slug exactly |
| No metadata extracted | Recipe must exist in MongoDB |
| Upload fails | Check AWS credentials in `.env.local` |
| Keywords are generic | Recipe must have `seo.keywords` field |

---

## 📊 **File Locations**

| Purpose | Path |
|---------|------|
| Upload folder | `uploads/to-upload/` |
| Processed originals | `uploads/uploaded/` |
| Metadata backups | `uploads/metadata/` |
| Temp compressed | `uploads/temp/` |

---

## 🔐 **Requirements**

- ✅ MongoDB recipe with matching slug
- ✅ AWS credentials in `.env.local`
- ✅ S3 bucket `receptu-images` accessible
- ✅ Image file in supported format (.jpg, .png, .webp, .gif)

---

## 📝 **Example Workflow**

```bash
# 1. Start watcher
npm run upload:watch

# 2. In another terminal, add image
cp ~/Downloads/my-recipe.jpg uploads/to-upload/tikroji-svogunu-sriuba.jpg

# 3. Watch the output
📷 New image detected: tikroji-svogunu-sriuba.jpg
🔄 Compressing image...
✅ Compressed: 1.2MB (52% reduction)
📊 Recipe data found for tikroji-svogunu-sriuba
✅ Successfully uploaded: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tikroji-svogunu-sriuba.jpg

# 4. Done! Image is on S3 with SEO metadata
```

---

## 🎯 **Key Points**

1. **Filename = Recipe Slug** - Must match exactly
2. **Keywords Automatic** - Extracted from MongoDB
3. **Compression Automatic** - ~50% size reduction
4. **ASCII Conversion** - Lithuanian chars removed for S3
5. **Metadata Backup** - Saved locally for reference

---

**Status**: ✅ **Ready to Use**


