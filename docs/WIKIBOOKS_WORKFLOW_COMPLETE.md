# 🔄 **Complete Wikibooks to MongoDB Workflow**

## ❌ **What Went Wrong**

You uploaded 4 Lithuanian recipes to MongoDB with Wikibooks URLs:
1. `Cookbook:Spaghetti_alla_Carbonara`
2. `Cookbook:Algerian_Couscous`
3. `Cookbook:Peanut_Butter_and_Jelly_Sandwich`
4. `Cookbook:Algerian_Couscous_with_Meat_and_Vegetables`

But the images in `scripts/wiki/output/` are from **different recipes**:
- `turkey-wrap-main.jpg` (from `Cookbook:Turkey_Wrap`)
- `burrito-main.jpg` (from `Cookbook:Burrito`)

**Result**: The `npm run image-prep-and-load` script couldn't find matching images for your 4 recipes.

---

## ✅ **Correct Workflow**

### **Step 1: Extract Images from Wikibooks**

Add the Wikibooks URLs to `scripts/wiki/wikibooks-urls.txt`:

```
https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous
https://en.wikibooks.org/wiki/Cookbook:Peanut_Butter_and_Jelly_Sandwich
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables
```

Then run:
```bash
npm run wiki:extract
```

**Output**:
- `scripts/wiki/output/spaghetti-alla-carbonara-main.jpg`
- `scripts/wiki/output/algerian-couscous-main.jpg`
- `scripts/wiki/output/peanut-butter-and-jelly-sandwich-main.jpg`
- `scripts/wiki/output/algerian-couscous-with-meat-and-vegetables-main.jpg`

---

### **Step 2: Prepare and Load Images**

Run:
```bash
npm run image-prep-and-load
```

**What it does**:
1. Queries MongoDB for recipes with `originalSource.platform = "Wikibooks"`
2. Extracts English slug from Wikibooks URL
3. Finds matching image in `scripts/wiki/output/` (e.g., `spaghetti-alla-carbonara-main.jpg`)
4. Extracts final S3 filename from `image.src` (e.g., `spageti-alla-carbonara.jpg`)
5. Renames and moves to `uploads/to-upload/`

**Output**:
- `uploads/to-upload/spageti-alla-carbonara.jpg`
- `uploads/to-upload/alzirietiskas-kuskusas.jpg`
- `uploads/to-upload/sumustinis-su-zemesiupes-sviestu-ir-uogiene.jpg`
- `uploads/to-upload/alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg`

---

### **Step 3: Upload to S3**

Run:
```bash
npm run upload:watch
```

**What it does**:
1. Watches `uploads/to-upload/` for new images
2. Compresses images
3. Extracts SEO metadata from MongoDB
4. Uploads to S3 with metadata headers

---

## 🔍 **How Image Matching Works**

### **Example: Spaghetti alla Carbonara**

**MongoDB Recipe**:
```json
{
  "slug": "spageti-alla-carbonara",
  "title": { "lt": "Spagečiai karbonara – klasikinis itališkas makaronų patiekalas" },
  "originalSource": {
    "url": "https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara"
  },
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/spageti-alla-carbonara.jpg"
  }
}
```

**Matching Process**:

1. **Extract English slug from URL**:
   - URL: `https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara`
   - Extract: `Cookbook:Spaghetti_alla_Carbonara`
   - Remove prefix: `Spaghetti_alla_Carbonara`
   - Normalize: `spaghetti-alla-carbonara`

2. **Search for matching image**:
   - Look for: `spaghetti-alla-carbonara-main.jpg` or `.png`
   - Found: `scripts/wiki/output/spaghetti-alla-carbonara-main.jpg` ✅

3. **Extract final S3 filename**:
   - URL: `https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/spageti-alla-carbonara.jpg`
   - Extract: `spageti-alla-carbonara.jpg`

4. **Rename and move**:
   - From: `scripts/wiki/output/spaghetti-alla-carbonara-main.jpg`
   - To: `uploads/to-upload/spageti-alla-carbonara.jpg`

---

## 🚀 **Quick Start - 3 Steps**

### **Step 1: Extract Images**
```bash
# Edit scripts/wiki/wikibooks-urls.txt and add URLs
npm run wiki:extract
```

### **Step 2: Prepare Images**
```bash
npm run image-prep-and-load
```

### **Step 3: Upload to S3**
```bash
npm run upload:watch
```

---

## 📋 **Current Status**

### **In MongoDB** ✅
- 4 Wikibooks recipes with Lithuanian titles
- All have `originalSource.url` pointing to Wikibooks
- All have `image.src` with S3 URLs

### **In scripts/wiki/output/** ✅
- `turkey-wrap-main.jpg` (from Turkey Wrap recipe)
- `burrito-main.jpg` (from Burrito recipe)

### **Missing** ❌
- Images for the 4 recipes in MongoDB
- Need to extract: Spaghetti alla Carbonara, Algerian Couscous, Peanut Butter and Jelly Sandwich, Algerian Couscous with Meat and Vegetables

---

## 🔧 **What to Do Now**

### **Option 1: Extract Missing Images** (Recommended)

1. Edit `scripts/wiki/wikibooks-urls.txt`:
```
https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous
https://en.wikibooks.org/wiki/Cookbook:Peanut_Butter_and_Jelly_Sandwich
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables
```

2. Run extraction:
```bash
npm run wiki:extract
```

3. Run image prep:
```bash
npm run image-prep-and-load
```

4. Upload to S3:
```bash
npm run upload:watch
```

### **Option 2: Use Existing Images**

If you want to use the Turkey Wrap and Burrito images:

1. Delete the 4 Lithuanian recipes from MongoDB
2. Convert Turkey Wrap and Burrito to Lithuanian using ChatGPT
3. Upload as new recipes
4. Run `npm run image-prep-and-load`

---

## 📊 **Slug Matching Reference**

| Wikibooks URL | English Slug | Image File | Lithuanian Slug | S3 Filename |
|---|---|---|---|---|
| `Cookbook:Spaghetti_alla_Carbonara` | `spaghetti-alla-carbonara` | `spaghetti-alla-carbonara-main.jpg` | `spageti-alla-carbonara` | `spageti-alla-carbonara.jpg` |
| `Cookbook:Algerian_Couscous` | `algerian-couscous` | `algerian-couscous-main.jpg` | `alzirietiskas-kuskusas` | `alzirietiskas-kuskusas.jpg` |
| `Cookbook:Turkey_Wrap` | `turkey-wrap` | `turkey-wrap-main.jpg` | *(not in DB)* | *(not in DB)* |
| `Cookbook:Burrito` | `burrito` | `burrito-main.jpg` | *(not in DB)* | *(not in DB)* |

---

## ⚠️ **Important Notes**

1. **English slug extraction**: The script extracts English slugs from Wikibooks URLs
2. **Image naming**: Images must be named `<english-slug>-main.jpg` or `.png`
3. **S3 filename**: The final S3 filename comes from MongoDB `image.src` (can be Lithuanian)
4. **Matching is one-way**: English slug → Image file → Lithuanian S3 filename

---

## 🎯 **Next Steps**

1. **Extract the 4 missing images** from Wikibooks
2. **Run image-prep-and-load** to rename and move them
3. **Upload to S3** using upload:watch
4. **Done!** Images will be on your website

---

**Status**: ⚠️ **Waiting for image extraction**


