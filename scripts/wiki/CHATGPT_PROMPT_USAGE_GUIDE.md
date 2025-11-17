# 🤖 ChatGPT Prompt Usage Guide - Updated Schema

## 📋 **How to Use the Updated Prompt**

### **Step 1: Prepare Your Wikibooks JSON**

Use the extracted Wikibooks JSON from your extraction script. Example:

```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Tarta_de_Santiago",
    "pageTitle": "Cookbook:Tarta_de_Santiago",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "originalCreator": {
      "name": "Weeg",
      "userPageUrl": "https://en.wikibooks.org/wiki/User:Weeg"
    },
    "datePublished": "2015-03-20T00:00:00Z",
    "extractedAt": "2025-10-27T13:05:17.079Z",
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ATarta_de_Santiago&action=history"
  },
  "recipe": { ... },
  "image": {
    "author": { "name": "Ave Maria Mõistlik", "userPageUrl": "https://commons.wikimedia.org/wiki/User:Avjoska" },
    "license": { "code": "cc-by-3.0", "shortName": "CC BY 3.0", "fullName": "Creative Commons Attribution 3.0", "url": "https://creativecommons.org/licenses/by/3.0" },
    "wikimediaCommonsUrl": "https://commons.wikimedia.org/wiki/File:Santiago.IMG_9780.JPG"
  }
}
```

---

### **Step 2: Copy the ChatGPT Prompt**

Open: `scripts/wiki/CHATGPT_CONVERSION_PROMPT_FINAL.md`

Copy the entire content (all 500+ lines).

---

### **Step 3: Open ChatGPT**

Go to: https://chat.openai.com

---

### **Step 4: Paste Prompt + JSON**

In ChatGPT, paste:

```
[PASTE ENTIRE CHATGPT_CONVERSION_PROMPT_FINAL.md CONTENT HERE]

---

Now convert this Wikibooks JSON to MongoDB format:

[PASTE YOUR WIKIBOOKS JSON HERE]
```

---

### **Step 5: Get MongoDB-Ready JSON**

ChatGPT will output valid JSON with:
- ✅ Lithuanian translations
- ✅ Wikibooks author information
- ✅ Original source metadata
- ✅ Image attribution
- ✅ All required fields

---

## 🔍 **What Changed in the Prompt**

### **Author Field**
**Before**: `{ "name": "ragaujam.lt", "profileUrl": "https://ragaujam.lt" }`

**After**: `{ "name": "Weeg", "url": "https://en.wikibooks.org/wiki/User:Weeg", "profileUrl": "https://en.wikibooks.org/wiki/User:Weeg" }`

### **New Fields Added**
1. **`author.url`** - Link to Wikibooks user page (Google Schema.org)
2. **`originalSource`** - Complete Wikibooks metadata
3. **`originalImage`** - Image attribution with separate license

### **Key Rules**
- `author.name` = Wikibooks creator (NOT "ragaujam.lt")
- `originalSource.datePublished` = Original publication date on Wikibooks
- `originalImage.license` = May be different from recipe license
- All URLs must be on single lines (no line breaks)

---

## ✅ **Verification Checklist**

After ChatGPT generates JSON, verify:

- [ ] `author.name` = Wikibooks creator name (e.g., "Weeg")
- [ ] `author.url` = Link to Wikibooks user page
- [ ] `originalSource.platform` = "Wikibooks"
- [ ] `originalSource.url` = Original recipe URL
- [ ] `originalSource.license` = "CC BY-SA 4.0"
- [ ] `originalSource.originalCreator.name` = Creator name
- [ ] `originalSource.datePublished` = Original publication date
- [ ] `originalSource.extractedAt` = Extraction timestamp
- [ ] `originalImage.author.name` = Image author name
- [ ] `originalImage.license.code` = License code (e.g., "cc-by-3.0")
- [ ] `originalImage.wikimediaCommonsUrl` = Wikimedia Commons URL
- [ ] No line breaks in any URLs
- [ ] All text is in Lithuanian
- [ ] JSON is valid and properly formatted

---

## 📝 **Example Output**

ChatGPT will generate something like:

```json
{
  "slug": "tarta-de-santiago",
  "canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago",
  "title": { "lt": "Santjago tortas" },
  "description": { "lt": "Tradicinė ispaniška torta iš migdolų miltų..." },
  "author": {
    "name": "Weeg",
    "url": "https://en.wikibooks.org/wiki/User:Weeg",
    "profileUrl": "https://en.wikibooks.org/wiki/User:Weeg"
  },
  "originalSource": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Tarta_de_Santiago",
    "pageTitle": "Cookbook:Tarta_de_Santiago",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "originalCreator": { "name": "Weeg", "userPageUrl": "https://en.wikibooks.org/wiki/User:Weeg" },
    "datePublished": "2015-03-20T00:00:00Z",
    "extractedAt": "2025-10-27T13:05:17.079Z",
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ATarta_de_Santiago&action=history"
  },
  "originalImage": {
    "author": { "name": "Ave Maria Mõistlik", "userPageUrl": "https://commons.wikimedia.org/wiki/User:Avjoska" },
    "license": { "code": "cc-by-3.0", "shortName": "CC BY 3.0", "fullName": "Creative Commons Attribution 3.0", "url": "https://creativecommons.org/licenses/by/3.0" },
    "wikimediaCommonsUrl": "https://commons.wikimedia.org/wiki/File:Santiago.IMG_9780.JPG"
  },
  "status": "published",
  "featured": false,
  "trending": false,
  "publishedAt": "2025-10-27T14:30:00+03:00",
  "createdAt": "2025-10-27T14:30:00+03:00",
  "updatedAt": "2025-10-27T14:30:00+03:00"
}
```

---

## 🚀 **Next: MongoDB Insertion**

1. Copy the JSON output from ChatGPT
2. Open MongoDB Compass
3. Go to `receptai` database → `recipes_new` collection
4. Click "Insert Document"
5. Paste the JSON
6. Click "Insert"

✅ Done! Recipe is now in MongoDB with full Wikibooks attribution.


