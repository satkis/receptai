# 📸 **Image Prep and Load Automation Script**

## 🎯 **Overview**

The `image-prep-and-load` script automates the workflow of preparing Wikibooks recipe images for upload to S3. It:

1. **Queries MongoDB** for recently created Wikibooks recipes
2. **Matches local images** from the Wikibooks output directory
3. **Renames images** to final S3 filenames
4. **Moves images** to the upload queue for processing

---

## 🚀 **Quick Start**

### **Run the Script**
```bash
npm run image-prep-and-load
```

### **Expected Output**
```
📸 Image Prep and Load Automation

Configuration:
  Wikibooks Output: c:\Users\karolis\VibeCoding\receptai\scripts\wiki\output
  Upload Target:    c:\Users\karolis\VibeCoding\receptai\uploads\to-upload
  MongoDB DB:       receptai

🔗 Connecting to MongoDB...
✅ MongoDB connected

📋 Querying Wikibooks recipes...
✅ Found 2 Wikibooks recipes with images

🔄 Processing recipes:

[OK] Image prepared for Alžyriškas kuskusas su mėsa ir daržovėmis
     Original: algerian-couscous-with-meat-and-vegetables-main.jpg
     Renamed:  alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
     Moved to: c:\Users\karolis\VibeCoding\receptai\uploads\to-upload

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

## 📋 **Workflow Details**

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

**Example**:
```
Wikibooks URL: https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables
Extracted slug: algerian-couscous-with-meat-and-vegetables
Normalized: algerian-couscous-with-meat-and-vegetables
Local file: algerian-couscous-with-meat-and-vegetables-main.jpg ✅
```

### **Step 3: Filename Extraction**
Extract final filename from MongoDB `image.src` URL:

```
image.src: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
Final filename: alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg
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

## 🔍 **Logging Output**

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

## 🔧 **Configuration**

### **Environment Variables Required**
```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=receptai
```

### **Hardcoded Paths**
- **Wikibooks Output**: `scripts/wiki/output/`
- **Upload Target**: `uploads/to-upload/`
- **MongoDB Collection**: `recipes_new`

---

## 📊 **Summary Report**

After processing, the script displays:

```
======================================================================
📊 SUMMARY
======================================================================
✅ Successful:  <count>
⚠️  Warnings:    <count>
❌ Errors:      <count>
📦 Total:       <count>
======================================================================
```

**Exit Codes**:
- `0` - Success (no errors)
- `1` - Errors occurred

---

## 🔄 **Integration with Upload Workflow**

After running this script:

1. Images are in `uploads/to-upload/`
2. Run `npm run upload:watch` to monitor and upload
3. Images are compressed and uploaded to S3
4. Metadata is extracted from MongoDB
5. Files are organized into processed folders

---

## 🛠️ **Helper Functions**

### **normalizeSlug(slug)**
Converts slug to lowercase, replaces spaces/underscores with hyphens, removes special characters.

### **getSlugFromUrl(url)**
Extracts slug from Wikibooks URL, removes "Cookbook:" prefix.

### **getFinalFileNameFromImageSrc(imageSrc)**
Extracts filename from S3 URL.

### **findMatchingLocalImage(wikibooksSlug)**
Searches for matching image file in Wikibooks output directory.

### **renameAndMoveImage(sourcePath, targetFileName)**
Copies and renames image to target directory.

### **connectMongoDB()**
Establishes MongoDB connection with retry logic.

### **getWikibooksRecipes(db)**
Queries MongoDB for Wikibooks recipes with images.

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

## 📝 **Example Workflow**

```bash
# 1. Extract Wikibooks recipes (creates images in scripts/wiki/output/)
npm run wiki:extract

# 2. Prepare and load images (moves to uploads/to-upload/)
npm run image-prep-and-load

# 3. Watch and upload (compresses and uploads to S3)
npm run upload:watch

# 4. Done! Images are on S3 with metadata
```

---

**Status**: ✅ **Production Ready**


