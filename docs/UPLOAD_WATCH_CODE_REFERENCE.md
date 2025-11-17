# 🔧 **npm run upload:watch - Code Reference**

## 📂 **File Structure**

```
scripts/
├── watch-uploads.js          ← Main watcher script
├── upload-images.js          ← Image upload logic
└── ...

uploads/
├── to-upload/                ← Input folder
├── uploaded/                 ← Processed originals
├── temp/                     ← Temporary files
└── metadata/                 ← Metadata backups
```

---

## 🔍 **Key Functions**

### **1. watch-uploads.js**

**Purpose**: Monitor folder for new images

```javascript
// Start watching
npm run upload:watch

// Checks every 2 seconds
const watcher = setInterval(checkForNewImages, 2000);

// Calls uploadImage for each new file
uploadImage(file)
```

**Supported formats**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

---

### **2. upload-images.js**

#### **Function: compressImage()**
```javascript
async function compressImage(inputPath, outputPath) {
  // Uses Sharp library
  // Max size: 1200x800px
  // Quality: 85%
  // Returns compression stats
}
```

**Output**: Compressed file in `uploads/temp/`

---

#### **Function: fetchRecipeData()**
```javascript
async function fetchRecipeData(slug) {
  // Connects to MongoDB
  // Queries recipes_new collection
  // Finds recipe by slug
  // Returns recipe document
}
```

**Query**:
```javascript
const recipe = await db.collection('recipes_new').findOne({ slug });
```

---

#### **Function: generateImageMetadata()**
```javascript
async function generateImageMetadata(filename) {
  // Extracts recipe slug from filename
  // Fetches recipe from MongoDB
  // Extracts keywords from:
  //   - recipe.title.lt (first 3 words)
  //   - recipe.seo.keywords (array)
  //   - recipe.tags (array)
  //   - recipe.ingredients (vital only)
  //   - recipe.seo.recipeCuisine
  //   - recipe.seo.recipeCategory
  // Converts to ASCII
  // Returns metadata object
}
```

**Metadata Object**:
```javascript
{
  'Content-Type': 'image/jpeg',
  'Cache-Control': 'public, max-age=31536000, immutable',
  'alt-text': 'Recipe title',
  'recipe-slug': 'recipe-slug',
  'keywords': 'keyword1,keyword2,keyword3',
  'category': 'Recipe Category',
  'cuisine': 'Cuisine Type',
  'description': 'Recipe description'
}
```

---

#### **Function: convertToASCII()**
```javascript
function convertToASCII(text) {
  // Converts Lithuanian characters
  // ą→a, č→c, ę→e, ė→e, į→i, š→s, ų→u, ū→u, ž→z
  // Removes special characters
  // Sanitizes for S3 headers
  // Returns ASCII string
}
```

**Example**:
```
Input:  "Žemaitiški kepsneliai su rūkytais lašiniais"
Output: "Zemaitiskai kepsneliai su rukytais lasiniais"
```

---

#### **Function: uploadImage()**
```javascript
async function uploadImage(filename) {
  // 1. Compress image
  const compressionStats = await compressImage(inputPath, compressedPath);
  
  // 2. Generate metadata
  const metadata = await generateImageMetadata(filename);
  
  // 3. Upload to S3
  const result = await s3.upload(uploadParams).promise();
  
  // 4. Move original to processed folder
  fs.renameSync(originalPath, processedPath);
  
  // 5. Delete compressed file
  fs.unlinkSync(compressedPath);
  
  // 6. Save metadata backup
  fs.writeFileSync(metadataPath, JSON.stringify(metadataBackup));
}
```

---

## 📊 **Metadata Extraction Code**

### **Extract Keywords from Recipe**

```javascript
const recipeKeywords = [];

// 1. Title words (first 3)
if (recipe.title?.lt) {
  recipeKeywords.push(...recipe.title.lt.toLowerCase().split(' ').slice(0, 3));
}

// 2. SEO keywords (array)
if (recipe.seo?.keywords && Array.isArray(recipe.seo.keywords)) {
  recipeKeywords.push(...recipe.seo.keywords.slice(0, 5));
}

// 3. Tags (first 3)
if (recipe.tags && Array.isArray(recipe.tags)) {
  recipeKeywords.push(...recipe.tags.slice(0, 3));
}

// 4. Vital ingredients
if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
  const vitalIngredients = recipe.ingredients
    .filter(ing => ing.vital)
    .map(ing => ing.name?.lt || ing.name)
    .slice(0, 2);
  recipeKeywords.push(...vitalIngredients);
}

// 5. Combine and convert
keywords = convertToASCII(recipeKeywords.join(','));
```

---

### **Extract Other Metadata**

```javascript
// Alt text (from title)
altText = convertToASCII(recipe.title?.lt || 'Recipe image');

// Description (from description or title)
let rawDescription = recipe.description?.lt || recipe.title?.lt || 'Recipe image';
if (rawDescription.length > 200) {
  rawDescription = rawDescription.substring(0, 200) + '...';
}
description = convertToASCII(rawDescription);

// Cuisine (from SEO)
if (recipe.seo?.recipeCuisine) {
  cuisine = convertToASCII(recipe.seo.recipeCuisine);
}

// Category (from SEO)
if (recipe.seo?.recipeCategory) {
  category = convertToASCII(recipe.seo.recipeCategory);
}
```

---

## ☁️ **S3 Upload Code**

### **Upload Parameters**

```javascript
const uploadParams = {
  Bucket: 'receptu-images',
  Key: `receptai/${filename}`,  // S3 path
  Body: fileContent,             // Compressed file
  ContentType: 'image/jpeg',
  CacheControl: 'public, max-age=31536000, immutable',
  ContentDisposition: `inline; filename="${filename}"`,
  Metadata: {
    'alt-text': metadata['alt-text'],
    'recipe-slug': metadata['recipe-slug'],
    'width': '1200',
    'height': '800',
    'keywords': metadata['keywords'],
    'upload-date': new Date().toISOString().split('T')[0],
    'category': metadata['category'],
    'cuisine': metadata['cuisine'],
    'description': metadata['description']
  }
};

// Upload
const result = await s3.upload(uploadParams).promise();
```

---

## 🔐 **Environment Variables**

**Required in `.env.local`**:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB=receptai

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
```

---

## 📝 **Metadata Backup JSON**

**Location**: `uploads/metadata/recipe-slug.jpg.json`

**Content**:
```json
{
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=31536000, immutable",
  "alt-text": "Recipe title",
  "recipe-slug": "recipe-slug",
  "keywords": "keyword1,keyword2,keyword3",
  "upload-date": "2025-11-06",
  "category": "Recipe Category",
  "cuisine": "Cuisine Type",
  "description": "Recipe description",
  "compressionStats": {
    "originalSize": 2500000,
    "compressedSize": 1200000,
    "compressionRatio": 52
  },
  "uploadedAt": "2025-11-06T10:30:48.519Z",
  "s3Location": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/recipe-slug.jpg"
}
```

---

## 🔄 **File Movement**

### **Before Upload**
```
uploads/to-upload/recipe-slug.jpg
```

### **During Upload**
```
uploads/temp/compressed_recipe-slug.jpg
```

### **After Upload**
```
uploads/uploaded/recipe-slug.jpg          ← Original moved here
uploads/metadata/recipe-slug.jpg.json     ← Metadata backup
uploads/temp/                             ← Cleaned up
```

---

## 🚀 **Usage**

### **Start Watcher**
```bash
npm run upload:watch
```

### **Add Image**
```bash
cp my-photo.jpg uploads/to-upload/recipe-slug.jpg
```

### **Monitor Output**
```
📷 New image detected: recipe-slug.jpg
🔄 Compressing image...
✅ Compressed: 1.2MB (52% reduction)
📊 Recipe data found for recipe-slug
✅ Successfully uploaded: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/recipe-slug.jpg
```

---

## 🔍 **Debugging**

### **Check Metadata Backup**
```bash
cat uploads/metadata/recipe-slug.jpg.json
```

### **Verify S3 Upload**
```bash
# Check S3 metadata
aws s3api head-object --bucket receptu-images --key receptai/recipe-slug.jpg
```

### **Check MongoDB Recipe**
```javascript
// In MongoDB Compass
db.recipes_new.findOne({ slug: "recipe-slug" })
```

---

## ✨ **Summary**

| Component | Purpose |
|-----------|---------|
| `watch-uploads.js` | Monitor folder every 2 seconds |
| `upload-images.js` | Handle compression, metadata, upload |
| `compressImage()` | Compress to 1200x800px, 85% quality |
| `fetchRecipeData()` | Query MongoDB for recipe |
| `generateImageMetadata()` | Extract keywords and metadata |
| `convertToASCII()` | Remove Lithuanian characters |
| `uploadImage()` | Upload to S3 with metadata |

---

**Status**: ✅ **Ready to Use**


