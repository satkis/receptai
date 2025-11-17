# 🔄 **Wikibooks Recipe Workflow - Complete Guide**

## 📋 **End-to-End Workflow**

This guide shows the complete workflow for extracting Wikibooks recipes, converting them to MongoDB format, and inserting them into your database.

---

## **Phase 1: Extract Wikibooks Recipe**

### **Step 1.1: Prepare Recipe URLs**
Create a list of Wikibooks recipe URLs you want to extract:
```
https://en.wikibooks.org/wiki/Cookbook:Tarta_de_Santiago
https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara
https://en.wikibooks.org/wiki/Cookbook:Mapo_Tofu
```

### **Step 1.2: Run Extraction Script**
```bash
node scripts/wiki/extract-wikibooks-recipe.js
```

### **Step 1.3: Output Files**
Script creates:
- `{slug}-wikibooks-raw.json` - Recipe JSON with all metadata
- `{slug}-main.JPG` - Downloaded recipe image
- `{slug}-error.log` - Error log (if any errors)

### **Step 1.4: Example Output Structure**
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

## **Phase 2: Convert with ChatGPT**

### **Step 2.1: Open ChatGPT Prompt**
Open file: `scripts/wiki/CHATGPT_CONVERSION_PROMPT_FINAL.md`

### **Step 2.2: Copy Prompt**
Copy the entire content (all 464 lines).

### **Step 2.3: Open ChatGPT**
Go to: https://chat.openai.com

### **Step 2.4: Paste Prompt + JSON**
In ChatGPT, paste:
```
[PASTE ENTIRE CHATGPT_CONVERSION_PROMPT_FINAL.md CONTENT HERE]

---

Now convert this Wikibooks JSON to MongoDB format:

[PASTE YOUR WIKIBOOKS JSON HERE]
```

### **Step 2.5: Get MongoDB-Ready JSON**
ChatGPT will output valid JSON with:
- ✅ Lithuanian translations
- ✅ Wikibooks author information
- ✅ Original source metadata
- ✅ Image attribution
- ✅ All required fields

### **Step 2.6: Example Output**
```json
{
  "slug": "tarta-de-santiago",
  "canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago",
  "title": { "lt": "Santjago tortas" },
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
  "publishedAt": "2025-10-27T14:30:00+03:00",
  "createdAt": "2025-10-27T14:30:00+03:00",
  "updatedAt": "2025-10-27T14:30:00+03:00"
}
```

---

## **Phase 3: Insert into MongoDB**

### **Step 3.1: Copy JSON**
Copy the JSON output from ChatGPT.

### **Step 3.2: Open MongoDB Compass**
Launch MongoDB Compass application.

### **Step 3.3: Connect to Database**
- Connection string: `mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai`
- Database: `receptai`
- Collection: `recipes_new`

### **Step 3.4: Insert Document**
1. Click "Insert Document" button
2. Paste the JSON
3. Click "Insert"

### **Step 3.5: Verify**
- Check that document was inserted
- Verify all fields are present
- Check that `originalSource` and `originalImage` are populated

---

## **Phase 4: Display on Website** (Future)

### **Step 4.1: Create Disclaimer Component**
React component to display at bottom of Wikibooks recipes:
- Original creator name
- Link to original recipe
- License information
- Image attribution
- Translation/adaptation notice

### **Step 4.2: Update Recipe Page**
Check if recipe is from Wikibooks (`originalSource !== null`):
- Show disclaimer if Wikibooks recipe
- Display image attribution separately

### **Step 4.3: Deploy**
Deploy changes to production.

---

## ✅ **Verification Checklist**

### **After Extraction**
- [ ] JSON file created
- [ ] Image file downloaded
- [ ] `source.originalCreator.name` populated
- [ ] `source.datePublished` populated
- [ ] `image.license` populated

### **After ChatGPT Conversion**
- [ ] `author.name` = Wikibooks creator (NOT "ragaujam.lt")
- [ ] `author.url` = Link to Wikibooks user page
- [ ] `originalSource.platform` = "Wikibooks"
- [ ] `originalSource.license` = "CC BY-SA 4.0"
- [ ] `originalSource.datePublished` = Original publication date
- [ ] `originalImage.license.code` = License code (e.g., "cc-by-3.0")
- [ ] All text is in Lithuanian
- [ ] No line breaks in URLs
- [ ] JSON is valid

### **After MongoDB Insertion**
- [ ] Document inserted successfully
- [ ] All fields present in database
- [ ] `originalSource` object populated
- [ ] `originalImage` object populated
- [ ] Recipe displays correctly on website

---

## 🚀 **Quick Commands**

```bash
# Extract recipe
node scripts/wiki/extract-wikibooks-recipe.js

# View extracted JSON
cat scripts/wiki/output/tarta-de-santiago-wikibooks-raw.json

# View ChatGPT prompt
cat scripts/wiki/CHATGPT_CONVERSION_PROMPT_FINAL.md
```

---

## 📁 **Key Files**

| File | Purpose |
|------|---------|
| `extract-wikibooks-recipe.js` | Extraction script |
| `CHATGPT_CONVERSION_PROMPT_FINAL.md` | ChatGPT prompt |
| `CHATGPT_PROMPT_USAGE_GUIDE.md` | Usage guide |
| `MONGODB_SCHEMA_UPDATED.md` | Schema examples |
| `types/index.ts` | TypeScript interface |

---

## ✨ **Status: READY TO USE**

All components are in place. You can now:
1. Extract Wikibooks recipes
2. Convert with ChatGPT
3. Insert into MongoDB
4. Display on website (with disclaimer component)


