# 📝 **ChatGPT Conversion Prompt - Updated**

## ✅ **What Changed**

The ChatGPT conversion prompt file has been updated to include:
1. **New `originalImage.fileName` attribute** - tracks original Wikibooks image filenames
2. **New `originalSource.originalCreator` object** - stores Wikibooks recipe creator information
3. **Updated documentation** - comprehensive rules for both new attributes

---

## 🔄 **Key Updates**

### **1. originalImage.fileName (NEW)**

**Location**: `originalImage` object

**Purpose**: Track the original Wikibooks image filename for attribution and verification

**Mapping**:
```
Input:  image.filename (from Wikibooks API)
Output: originalImage.fileName (in MongoDB)
```

**Examples**:
- `"CookbookTurkeyWrap.jpg"`
- `"Papa_chevos_burrito.jpg"`
- `"Spaghetti_alla_Carbonara_(Madrid).JPG"`

**Rules**:
- Must match the exact filename saved locally in `scripts/wiki/output/`
- Used for tracking and verifying image integrity
- Always include this field for Wikibooks recipes

---

### **2. originalSource.originalCreator (NEW)**

**Location**: `originalSource` object

**Purpose**: Store the original Wikibooks recipe creator information

**Structure**:
```json
"originalCreator": {
  "name": "string",
  "userPageUrl": "string"
}
```

**Mapping**:
```
Input:  source.originalCreator.name
        source.originalCreator.userPageUrl
Output: originalSource.originalCreator.name
        originalSource.originalCreator.userPageUrl
```

**Example**:
```json
{
  "name": "Weeg",
  "userPageUrl": "https://en.wikibooks.org/wiki/User:Weeg"
}
```

**Rules**:
- Extract from input `source.originalCreator`
- Store in BOTH `originalSource.originalCreator` AND `author` (for compatibility)
- Always include for Wikibooks recipes

---

## 📋 **Updated OUTPUT FORMAT**

### **originalSource Object**
```json
{
  "platform": "Wikibooks",
  "url": "string",
  "pageTitle": "string",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "datePublished": "string",
  "extractedAt": "string",
  "contributorsUrl": "string",
  "originalCreator": {
    "name": "string",
    "userPageUrl": "string"
  }
}
```

### **originalImage Object**
```json
{
  "fileName": "string",
  "author": { "name": "string", "userPageUrl": "string" },
  "license": { "code": "string", "shortName": "string", "fullName": "string", "url": "string" },
  "wikimediaCommonsUrl": "string"
}
```

---

## ✨ **Quality Checklist Updates**

Added to checklist:
- ✅ `originalSource.originalCreator` = Wikibooks recipe creator (name and userPageUrl)
- ✅ `originalImage.fileName` = Original Wikibooks image filename (e.g., "CookbookTurkeyWrap.jpg")

---

## 📂 **File Modified**

- `scripts/wiki/CHATGPT_CONVERSION_PROMPT_FINAL.md`

**Changes**:
1. Updated INPUT FORMAT example (lines 69-105)
2. Updated OUTPUT FORMAT schema (lines 160-179)
3. Added `originalSource.originalCreator` documentation (lines 543-575)
4. Added `originalImage.fileName` documentation (lines 577-601)
5. Updated quality checklist (lines 642-655)

---

## 🚀 **How to Use**

1. Copy the updated prompt from `scripts/wiki/CHATGPT_CONVERSION_PROMPT_FINAL.md`
2. Paste your Wikibooks JSON (from `scripts/wiki/output/`)
3. ChatGPT will now output MongoDB JSON with:
   - ✅ `originalImage.fileName` - original image filename
   - ✅ `originalSource.originalCreator` - recipe creator info
   - ✅ All other required fields

---

## 📝 **Example Output**

```json
{
  "slug": "turkey-wrap",
  "title": { "lt": "Kalakutės suktinis" },
  "originalSource": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Turkey_Wrap",
    "pageTitle": "Cookbook:Turkey_Wrap",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "datePublished": null,
    "extractedAt": "2025-11-09T16:24:02.941Z",
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ATurkey_Wrap&action=history",
    "originalCreator": {
      "name": "AlbertCahalan",
      "userPageUrl": "https://en.wikibooks.org/wiki/User:AlbertCahalan"
    }
  },
  "originalImage": {
    "fileName": "CookbookTurkeyWrap.jpg",
    "author": { "name": "No machine-readable author provided. AlbertCahalan~commonswiki assumed (based on copyright claims).", "userPageUrl": "https://commons.wikimedia.org/wiki/User:AlbertCahalan~commonswiki" },
    "license": { "code": "pd", "shortName": "Public domain", "fullName": "Public domain", "url": "" },
    "wikimediaCommonsUrl": "https://commons.wikimedia.org/wiki/File:CookbookTurkeyWrap.jpg"
  }
}
```

---

## ✅ **Status**

✅ **Prompt updated and ready to use**  
✅ **All new attributes documented**  
✅ **Quality checklist updated**  
✅ **Examples provided**  


