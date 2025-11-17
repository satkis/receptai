# 📸 **npm run upload:watch - Complete Guide**

## 🎯 **What It Does**

`npm run upload:watch` is an automated image upload system that:
1. **Monitors** a local folder for new images
2. **Extracts** SEO metadata from MongoDB recipes
3. **Compresses** images for web optimization
4. **Uploads** to AWS S3 with metadata
5. **Organizes** files into processed folders

---

## 📁 **Where to Add Photos**

### **Upload Folder Location**
```
c:\Users\karolis\VibeCoding\receptai\uploads\to-upload\
```

### **File Naming Convention**
```
recipe-slug.jpg
```

**Examples**:
- `tikroji-svogunu-sriuba.jpg`
- `alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg`
- `zemaiciai-kepsneliai.jpg`

**Important**: The filename (without extension) must match the recipe `slug` in MongoDB exactly!

---

## 🔄 **How It Works - Step by Step**

### **Step 1: Watch for New Images** 👀
```javascript
// Monitors uploads/to-upload folder every 2 seconds
const watcher = setInterval(checkForNewImages, 2000);
```

- Checks every 2 seconds for new image files
- Supports: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Ignores files starting with `compressed_`

---

### **Step 2: Compress Image** 🗜️
```javascript
// Uses Sharp library to compress
const maxWidth = 1200;
const maxHeight = 800;
const quality = 85;
```

**What happens**:
- Resizes to max 1200x800px (maintains aspect ratio)
- Compresses to 85% quality
- Saves to `uploads/temp/compressed_filename.jpg`
- Reduces file size by ~40-50%

**Example**:
```
Original: 2.5MB → Compressed: 1.2MB (52% reduction)
```

---

### **Step 3: Extract SEO Keywords from MongoDB** 🔍

**The system queries MongoDB and extracts**:

| Source | What's Extracted | Example |
|--------|------------------|---------|
| **Recipe Title** | First 3 words | "Žemaitiški kepsneliai su" |
| **seo.keywords** | Array of 5 keywords | ["žemaitiški kepsneliai", "kepsneliai su lašiniais", ...] |
| **tags** | Recipe tags | ["tradicinis", "lietuviška", ...] |
| **ingredients** | Vital ingredients only | ["Kiauliena", "Lašiniai"] |
| **seo.recipeCuisine** | Cuisine type | "Lietuviška" |
| **seo.recipeCategory** | Recipe category | "Kepsniai" |

**Example MongoDB Query**:
```javascript
// Matches filename to recipe slug
const recipe = await db.collection('recipes_new').findOne({ 
  slug: 'tikroji-svogunu-sriuba' 
});

// Extracts keywords
keywords = [
  ...recipe.title.lt.split(' ').slice(0, 3),  // Title words
  ...recipe.seo.keywords.slice(0, 5),         // SEO keywords
  ...recipe.tags.slice(0, 3),                 // Tags
  ...vitalIngredients.slice(0, 2)             // Vital ingredients
];
```

---

### **Step 4: Convert to ASCII** 🔤

**Why?** S3 metadata headers cannot contain Lithuanian characters!

**Conversion**:
```
ą → a,  č → c,  ę → e,  ė → e,  į → i
š → s,  ų → u,  ū → u,  ž → z
```

**Example**:
```
Input:  "Žemaitiški kepsneliai su rūkytais lašiniais"
Output: "Zemaitiskai kepsneliai su rukytais lasiniais"
```

---

### **Step 5: Upload to S3 with Metadata** ☁️

**S3 Bucket**: `receptu-images`
**Region**: `eu-north-1`
**Path**: `receptai/recipe-name.jpg`

**Metadata Added to S3**:
```json
{
  "alt-text": "Žemaitiški kepsneliai",
  "recipe-slug": "tikroji-svogunu-sriuba",
  "width": "1200",
  "height": "800",
  "keywords": "zemaitiskai,kepsneliai,lasiniai,tradicinis,lietuviska",
  "upload-date": "2025-11-06",
  "category": "Kepsniai",
  "cuisine": "Lietuviska",
  "description": "Tradiciniai zemaitiskai kepsneliai su rukytais lasiniais..."
}
```

**S3 URL Generated**:
```
https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tikroji-svogunu-sriuba.jpg
```

---

### **Step 6: Organize Files** 📁

After successful upload:

| Folder | What Happens |
|--------|--------------|
| `uploads/to-upload/` | Original file removed |
| `uploads/uploaded/` | Original file moved here |
| `uploads/temp/` | Compressed file deleted |
| `uploads/metadata/` | Metadata JSON backup saved |

**Metadata Backup Example**:
```
uploads/metadata/tikroji-svogunu-sriuba.jpg.json
```

---

## 🚀 **How to Use**

### **1. Start the Watcher**
```bash
npm run upload:watch
```

**Output**:
```
👀 Watching for new images...
📁 Drop images in: c:\Users\karolis\VibeCoding\receptai\uploads\to-upload
🔄 Supported formats: .jpg, .jpeg, .png, .webp, .gif
⏹️  Press Ctrl+C to stop
```

### **2. Add Image to Folder**
```
Copy: my-recipe-photo.jpg
To:   uploads/to-upload/recipe-slug.jpg
```

### **3. Watch the Magic** ✨
```
📷 New image detected: recipe-slug.jpg
🔄 Compressing image: recipe-slug.jpg (2.5MB)
   Original: 2448x3264, jpeg
   Resizing to max 1200x800
✅ Compressed: 1.2MB (52% reduction)
📊 Recipe data found for recipe-slug:
   Title: Žemaitiški kepsneliai
   Keywords: zemaitiskai,kepsneliai,lasiniai,tradicinis,lietuviska
   Cuisine: Lietuviska
   Description: Tradiciniai zemaitiskai kepsneliai...
✅ Successfully uploaded: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/recipe-slug.jpg
📁 Moved original to processed folder: recipe-slug.jpg
🗑️  Cleaned up compressed file
```

---

## ⚠️ **Important Notes**

### **Filename Must Match Recipe Slug**
```
❌ WRONG: my-photo.jpg (no matching recipe)
✅ CORRECT: tikroji-svogunu-sriuba.jpg (matches recipe slug)
```

### **Recipe Must Exist in MongoDB**
If recipe not found:
```
⚠️  No recipe found for slug: unknown-recipe
Using default metadata
```

### **SEO Keywords Are Automatic**
- No manual keyword entry needed
- Extracted from: title, seo.keywords, tags, ingredients
- Automatically converted to ASCII
- Stored in S3 metadata

### **Image Compression is Automatic**
- All images compressed before upload
- Original file preserved in `uploads/uploaded/`
- Metadata backup saved in `uploads/metadata/`

---

## 📊 **Metadata Extraction Priority**

When extracting keywords, the system uses this priority:

1. **Recipe Title** (first 3 words)
2. **SEO Keywords** (from seo.keywords array)
3. **Tags** (from tags array)
4. **Vital Ingredients** (marked as vital: true)

**Example**:
```
Recipe: "Žemaitiški kepsneliai su rūkytais lašiniais"

Keywords extracted:
1. From title: "Žemaitiški", "kepsneliai", "su"
2. From seo.keywords: "žemaitiški kepsneliai", "kepsneliai su lašiniais", ...
3. From tags: "tradicinis", "lietuviška", ...
4. From ingredients: "Kiauliena", "Lašiniai"

Final: "zemaitiskai,kepsneliai,su,zemaitiskai kepsneliai,kepsneliai su lasiniais,tradicinis,lietuviska,kiauliena,lasiniai"
```

---

## 🔧 **Troubleshooting**

### **Image Not Uploading**
1. Check filename matches recipe slug exactly
2. Verify recipe exists in MongoDB
3. Check AWS credentials in `.env.local`
4. Check S3 bucket permissions

### **Metadata Not Extracted**
1. Verify recipe has `seo.keywords` field
2. Check recipe has `title.lt` field
3. Verify recipe has `tags` array

### **Upload Fails**
1. Check internet connection
2. Verify AWS credentials
3. Check S3 bucket exists
4. Check file permissions

---

## 📝 **Summary**

| Step | What Happens | Where |
|------|--------------|-------|
| 1 | Drop image | `uploads/to-upload/` |
| 2 | Watcher detects | Every 2 seconds |
| 3 | Compress | `uploads/temp/` |
| 4 | Extract metadata | MongoDB query |
| 5 | Convert to ASCII | In memory |
| 6 | Upload to S3 | `receptu-images` bucket |
| 7 | Organize files | Move to `uploads/uploaded/` |
| 8 | Save backup | `uploads/metadata/` |

**Result**: Image on S3 with full SEO metadata! ✅


