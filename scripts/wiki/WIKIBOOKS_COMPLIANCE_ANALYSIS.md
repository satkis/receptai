# 📋 Wikibooks CC BY-SA 4.0 Compliance Analysis

## 🔍 Analysis Based on Official Policies

I've reviewed:
- ✅ CC BY-SA 4.0 License Deed
- ✅ Wikimedia Foundation Terms of Use
- ✅ Wikimedia Foundation Privacy Policy
- ✅ Google Recipe Schema Best Practices

---

## 📌 MUST-HAVE Data Points for CC BY-SA 4.0 Compliance

### **1. Attribution (REQUIRED)**
Per CC BY-SA 4.0 Section 3.a:
- ✅ **Original Creator Name** - Must display
- ✅ **Link to Original Recipe** - Must provide URL to Wikibooks page
- ✅ **License Type** - Must state "CC BY-SA 4.0"
- ✅ **License Link** - Must link to https://creativecommons.org/licenses/by-sa/4.0/

### **2. Indicate Changes Made (REQUIRED)**
Per CC BY-SA 4.0 Section 3.a.1.A:
- ✅ **Translation Indicator** - Must state recipe was translated from English to Lithuanian
- ✅ **Adaptation Indicator** - Must state recipe was adapted/modified
- ✅ **Extraction Date** - When recipe was extracted from Wikibooks

### **3. ShareAlike Compliance (REQUIRED)**
Per CC BY-SA 4.0 Section 3.b:
- ✅ **Your License** - Your translated content must also be CC BY-SA 4.0
- ✅ **Derivative Works** - Anyone reusing your translation must also use CC BY-SA 4.0

---

## 🖼️ Image Attribution (SEPARATE REQUIREMENT)

**IMPORTANT**: Wikibooks images have SEPARATE licenses!

From your extracted data:
- Recipe image: CC BY 3.0 (different from recipe CC BY-SA 4.0)
- Image author: "Ave Maria Mõistlik"
- Image URL: https://commons.wikimedia.org/wiki/File:Santiago.IMG_9780.JPG

**Must Store**:
- ✅ Image author name
- ✅ Image license type (CC BY 3.0, not CC BY-SA 4.0)
- ✅ Image license URL
- ✅ Link to Wikimedia Commons file page

---

## 🔗 Wikimedia Terms of Use Requirements

From Section 7 (Licensing of Content):
- ✅ **Attribution Requirements** - Already covered above
- ✅ **Hyperlink or URL** - Link to original recipe page
- ✅ **Alternative stable copy** - Link to Wikimedia Commons
- ✅ **List of authors** - Original creator name

---

## 🎯 Google Recipe Schema SEO Recommendations

From Google's Recipe Schema documentation, I found these OPTIONAL but SEO-beneficial fields:

### **Recommended to Store (for SEO)**:
1. **`datePublished`** - When recipe was originally published on Wikibooks
2. **`author.url`** - Link to original creator's Wikibooks profile
3. **`video`** - If Wikibooks recipe has video (VideoObject with thumbnails, duration, etc.)
4. **`keywords`** - Additional descriptive terms (already in your schema)
5. **`recipeCategory`** - Type of meal (already in your schema)
6. **`recipeCuisine`** - Cuisine type (already in your schema)

### **NOT Recommended to Store**:
- Wikibooks contributor history (too granular, not needed for SEO)
- Wikibooks page revision history (not needed)

---

## ❓ CLARIFYING QUESTIONS (Need Your Input)

### **Q1: Image Attribution Display**
Should the image attribution be:
- **Option A**: Separate from recipe attribution (different license, different author)
- **Option B**: Combined with recipe attribution
- **Option C**: Only show if image author is different from recipe author

### **Q2: Author Field Usage**
Currently you have `author.name` and `author.profileUrl`. For Wikibooks recipes:
- Should `author.name` = Wikibooks creator name (e.g., "Weeg")
- Should `author.profileUrl` = Link to their Wikibooks user page?
- Or should we create a separate `originalAuthor` object?

### **Q3: Disclaimer Display Location**
Where should the CC BY-SA 4.0 disclaimer appear on your website?
- **Option A**: Bottom of recipe page (footer)
- **Option B**: Collapsible "Source" section
- **Option C**: Hover tooltip on recipe title
- **Option D**: All of the above

### **Q4: Your Own License**
When users see your translated recipes, should they see:
- "This recipe is licensed under CC BY-SA 4.0" (same as original)
- Or something different?

---

## 📊 Proposed MongoDB Schema Extension

```typescript
originalSource?: {
  platform: "Wikibooks",
  url: string,                    // https://en.wikibooks.org/wiki/...
  pageTitle: string,              // "Cookbook:Tarta_de_Santiago"
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  originalCreator: {
    name: string,                 // "Weeg"
    userPageUrl: string           // https://en.wikibooks.org/wiki/User:Weeg
  },
  extractedAt: Date,              // 2025-10-27T13:05:17.079Z
  contributorsUrl: string         // Link to revision history
}

originalImage?: {
  author: {
    name: string,                 // "Ave Maria Mõistlik"
    userPageUrl: string           // https://commons.wikimedia.org/wiki/User:Avjoska
  },
  license: {
    code: string,                 // "cc-by-3.0"
    shortName: string,            // "CC BY 3.0"
    fullName: string,             // "Creative Commons Attribution 3.0"
    url: string                   // https://creativecommons.org/licenses/by/3.0
  },
  wikimediaCommonsUrl: string     // https://commons.wikimedia.org/wiki/File:...
}
```

---

**Status**: ⏳ **AWAITING YOUR ANSWERS TO Q1-Q4**

Once you answer these questions, I'll finalize the schema and create the disclaimer component.

