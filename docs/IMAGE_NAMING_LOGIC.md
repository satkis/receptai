# 📸 **Image Naming Logic - npm run wiki:extract**

## 🎯 **How Image Names Are Generated**

When you run `npm run wiki:extract`, the script generates image filenames using this formula:

```
IMAGE_FILENAME = {slug}-main.{extension}
```

---

## 📋 **Step-by-Step Process**

### **Step 1: Extract Page Title from URL**

```javascript
URL: https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara
     ↓
PAGE_TITLE: Cookbook:Spaghetti_alla_Carbonara
```

**Code**:
```javascript
function extractPageTitle(url) {
  const match = url.match(/wiki\/(.+)$/);
  return decodeURIComponent(match[1]);
}
```

---

### **Step 2: Generate Slug from Page Title**

```javascript
PAGE_TITLE: Cookbook:Spaghetti_alla_Carbonara
     ↓
1. Convert to lowercase
   → cookbook:spaghetti_alla_carbonara
     ↓
2. Remove "Cookbook:" prefix
   → spaghetti_alla_carbonara
     ↓
3. Replace non-alphanumeric with hyphens
   → spaghetti-alla-carbonara
     ↓
SLUG: spaghetti-alla-carbonara
```

**Code**:
```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/cookbook:/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

---

### **Step 3: Get Image Extension**

```javascript
ORIGINAL_IMAGE_URL: https://commons.wikimedia.org/wiki/Special:FilePath/Couscous_d%27Algerie.jpg
     ↓
EXTENSION: .jpg
```

**Code**:
```javascript
const imageExt = path.extname(mainImage.filename);
// Returns: .jpg or .png or .gif etc.
```

---

### **Step 4: Combine into Final Filename**

```javascript
SLUG: spaghetti-alla-carbonara
EXTENSION: .jpg
     ↓
IMAGE_FILENAME = spaghetti-alla-carbonara-main.jpg
```

**Code**:
```javascript
imageFilename = `${slug}-main${imageExt}`;
// Result: spaghetti-alla-carbonara-main.jpg
```

---

## 📝 **Finding Image Name in JSON**

The generated image filename is stored in the JSON output file at:

```json
{
  "image": {
    "filename": "Couscous_d'Algerie.jpg",        // Original Wikibooks filename
    "url": "https://commons.wikimedia.org/...",  // Original URL
    "localPath": "scripts/wiki/output/spaghetti-alla-carbonara-main.jpg",  // ← LOCAL NAME
    "dimensions": { "width": 1024, "height": 768 },
    "fileSize": 245632,
    "license": "CC BY 2.0",
    "author": "Ernesto Andrade"
  }
}
```

**Key field**: `image.localPath` contains the full path with the generated filename!

---

## 🔍 **Examples**

### **Example 1: Spaghetti alla Carbonara**

| Step | Value |
|------|-------|
| **URL** | `https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara` |
| **Page Title** | `Cookbook:Spaghetti_alla_Carbonara` |
| **Slug** | `spaghetti-alla-carbonara` |
| **Original Image** | `Spaghetti_alla_Carbonara.jpg` |
| **Extension** | `.jpg` |
| **Local Filename** | `spaghetti-alla-carbonara-main.jpg` |
| **Local Path** | `scripts/wiki/output/spaghetti-alla-carbonara-main.jpg` |

**JSON File**: `spaghetti-alla-carbonara-wikibooks-raw.json`

```json
{
  "recipe": {
    "slug": "spaghetti-alla-carbonara"
  },
  "image": {
    "filename": "Spaghetti_alla_Carbonara.jpg",
    "localPath": "scripts/wiki/output/spaghetti-alla-carbonara-main.jpg"
  }
}
```

---

### **Example 2: Algerian Couscous**

| Step | Value |
|------|-------|
| **URL** | `https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous` |
| **Page Title** | `Cookbook:Algerian_Couscous` |
| **Slug** | `algerian-couscous` |
| **Original Image** | `Couscous_d'Algerie.jpg` |
| **Extension** | `.jpg` |
| **Local Filename** | `algerian-couscous-main.jpg` |
| **Local Path** | `scripts/wiki/output/algerian-couscous-main.jpg` |

**JSON File**: `algerian-couscous-wikibooks-raw.json`

```json
{
  "recipe": {
    "slug": "algerian-couscous"
  },
  "image": {
    "filename": "Couscous_d'Algerie.jpg",
    "localPath": "scripts/wiki/output/algerian-couscous-main.jpg"
  }
}
```

---

### **Example 3: Turkey Wrap**

| Step | Value |
|------|-------|
| **URL** | `https://en.wikibooks.org/wiki/Cookbook:Turkey_Wrap` |
| **Page Title** | `Cookbook:Turkey_Wrap` |
| **Slug** | `turkey-wrap` |
| **Original Image** | `CookbookTurkeyWrap.jpg` |
| **Extension** | `.jpg` |
| **Local Filename** | `turkey-wrap-main.jpg` |
| **Local Path** | `scripts/wiki/output/turkey-wrap-main.jpg` |

**JSON File**: `turkey-wrap-wikibooks-raw.json`

```json
{
  "recipe": {
    "slug": "turkey-wrap"
  },
  "image": {
    "filename": "CookbookTurkeyWrap.jpg",
    "localPath": "scripts/wiki/output/turkey-wrap-main.jpg"
  }
}
```

---

## 🔗 **How to Find the Local Image Name**

### **Method 1: Check the JSON File**

Open the JSON file (e.g., `turkey-wrap-wikibooks-raw.json`) and look for:

```json
"image": {
  "localPath": "scripts/wiki/output/turkey-wrap-main.jpg"
}
```

### **Method 2: Use the Slug**

The local filename is always:

```
{recipe.slug}-main.{extension}
```

So if `recipe.slug = "turkey-wrap"`, the image is:

```
turkey-wrap-main.jpg
```

### **Method 3: List Output Folder**

```bash
ls scripts/wiki/output/
```

Output:
```
turkey-wrap-main.jpg
turkey-wrap-wikibooks-raw.json
burrito-main.jpg
burrito-wikibooks-raw.json
spaghetti-alla-carbonara-main.jpg
spaghetti-alla-carbonara-wikibooks-raw.json
```

---

## 📊 **Naming Pattern Reference**

| Component | Source | Example |
|-----------|--------|---------|
| **Slug** | Generated from page title | `spaghetti-alla-carbonara` |
| **Suffix** | Fixed | `-main` |
| **Extension** | From original image | `.jpg`, `.png`, `.gif` |
| **Full Name** | Combination | `spaghetti-alla-carbonara-main.jpg` |

---

## ⚠️ **Important Notes**

1. **Always `-main`**: The suffix is always `-main` (not `-image`, `-photo`, etc.)
2. **Lowercase slug**: The slug is always lowercase with hyphens
3. **Original extension preserved**: If original is `.png`, local is `.png`
4. **One image per recipe**: Only the first image is downloaded as `-main`
5. **JSON stores both names**:
   - `image.filename` = Original Wikibooks filename
   - `image.localPath` = Generated local filename

---

## 🎯 **Quick Reference**

To find the local image name for any recipe:

1. **Open the JSON file**: `{slug}-wikibooks-raw.json`
2. **Look for**: `image.localPath`
3. **Or calculate**: `{recipe.slug}-main.{extension}`

**Example**:
- JSON file: `turkey-wrap-wikibooks-raw.json`
- Local image: `turkey-wrap-main.jpg`
- Full path: `scripts/wiki/output/turkey-wrap-main.jpg`


