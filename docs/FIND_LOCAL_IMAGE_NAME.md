# 🔍 **How to Find Local Image Name in JSON**

## ❓ **Your Question**

> "I need to find the name you saved image from wikibook locally inside original json from wikibooks recipe file name."

## ✅ **Answer**

The local image name is stored in the JSON file at:

```json
"image": {
  "localPath": "scripts/wiki/output/turkey-wrap-main.jpg"
}
```

---

## 📍 **Exact Location in JSON**

Open any JSON file (e.g., `turkey-wrap-wikibooks-raw.json`) and look for:

```json
{
  "source": { ... },
  "recipe": { ... },
  "image": {
    "filename": "CookbookTurkeyWrap.jpg",           // ← Original Wikibooks filename
    "url": "https://upload.wikimedia.org/...",     // ← Original URL
    "descriptionUrl": "https://commons.wikimedia.org/...",
    "localPath": "scripts/wiki/output/turkey-wrap-main.jpg",  // ← LOCAL NAME YOU NEED!
    "dimensions": { "width": 576, "height": 360 },
    "fileSize": 74815,
    "license": { ... },
    "author": { ... },
    "metadata": { ... }
  }
}
```

**Key field**: `image.localPath`

---

## 🎯 **Quick Examples**

### **Turkey Wrap**

**JSON File**: `turkey-wrap-wikibooks-raw.json`

```json
"image": {
  "filename": "CookbookTurkeyWrap.jpg",
  "localPath": "scripts/wiki/output/turkey-wrap-main.jpg"
}
```

**Local image name**: `turkey-wrap-main.jpg`

---

### **Burrito**

**JSON File**: `burrito-wikibooks-raw.json`

```json
"image": {
  "filename": "Papa_chevos_burrito.jpg",
  "localPath": "scripts/wiki/output/burrito-main.jpg"
}
```

**Local image name**: `burrito-main.jpg`

---

### **Spaghetti alla Carbonara**

**JSON File**: `spaghetti-alla-carbonara-wikibooks-raw.json`

```json
"image": {
  "filename": "Spaghetti_alla_Carbonara.jpg",
  "localPath": "scripts/wiki/output/spaghetti-alla-carbonara-main.jpg"
}
```

**Local image name**: `spaghetti-alla-carbonara-main.jpg`

---

## 🔄 **The Naming Formula**

The local image name is always generated as:

```
{recipe.slug}-main.{extension}
```

Where:
- `recipe.slug` = Generated from Wikibooks page title
- `-main` = Fixed suffix (always the same)
- `{extension}` = Original image extension (.jpg, .png, etc.)

---

## 📋 **How to Extract It Programmatically**

### **JavaScript/Node.js**

```javascript
const fs = require('fs');

// Read the JSON file
const json = JSON.parse(fs.readFileSync('turkey-wrap-wikibooks-raw.json', 'utf-8'));

// Get local image name
const localImageName = json.image.localPath;
console.log(localImageName);
// Output: scripts/wiki/output/turkey-wrap-main.jpg

// Or just the filename
const filename = localImageName.split('/').pop();
console.log(filename);
// Output: turkey-wrap-main.jpg
```

### **Python**

```python
import json

# Read the JSON file
with open('turkey-wrap-wikibooks-raw.json', 'r') as f:
    data = json.load(f)

# Get local image name
local_image_name = data['image']['localPath']
print(local_image_name)
# Output: scripts/wiki/output/turkey-wrap-main.jpg

# Or just the filename
filename = local_image_name.split('/')[-1]
print(filename)
# Output: turkey-wrap-main.jpg
```

---

## 🗂️ **File Structure Reference**

```
scripts/wiki/output/
├── turkey-wrap-main.jpg                    ← Local image
├── turkey-wrap-wikibooks-raw.json          ← Contains "localPath": "scripts/wiki/output/turkey-wrap-main.jpg"
├── burrito-main.jpg                        ← Local image
├── burrito-wikibooks-raw.json              ← Contains "localPath": "scripts/wiki/output/burrito-main.jpg"
├── spaghetti-alla-carbonara-main.jpg       ← Local image
└── spaghetti-alla-carbonara-wikibooks-raw.json  ← Contains "localPath": "scripts/wiki/output/spaghetti-alla-carbonara-main.jpg"
```

---

## 🔗 **Relationship Between Files**

| JSON File | Contains | Local Image |
|-----------|----------|-------------|
| `turkey-wrap-wikibooks-raw.json` | `image.localPath` | `turkey-wrap-main.jpg` |
| `burrito-wikibooks-raw.json` | `image.localPath` | `burrito-main.jpg` |
| `spaghetti-alla-carbonara-wikibooks-raw.json` | `image.localPath` | `spaghetti-alla-carbonara-main.jpg` |

---

## 💡 **Key Points**

1. **Always in `image.localPath`**: This is the standard location
2. **Full path included**: Includes `scripts/wiki/output/` prefix
3. **Filename only**: Extract the last part after `/` to get just the filename
4. **Matches recipe slug**: The filename always starts with `recipe.slug`
5. **Always `-main` suffix**: The middle part is always `-main`
6. **Extension preserved**: Original image extension is kept

---

## 🎯 **Summary**

To find the local image name saved by `npm run wiki:extract`:

1. **Open the JSON file** (e.g., `turkey-wrap-wikibooks-raw.json`)
2. **Look for** `image.localPath`
3. **Extract the filename** (last part after `/`)
4. **Result**: `turkey-wrap-main.jpg`

That's the local image name! 🎉


