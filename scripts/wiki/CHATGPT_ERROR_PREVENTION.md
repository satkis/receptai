# 🚨 ChatGPT Error Prevention Guide

## Common Errors Found in ChatGPT Output

### **ERROR 1: Line Breaks in URLs** 🔴 CRITICAL

**Problem**: ChatGPT sometimes adds line breaks in the middle of URLs

**Affected Fields**:
- `canonicalUrl`
- `image.src`
- `author.profileUrl`

**Example of ERROR**:
```json
"canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago
"
```

**Correct Format**:
```json
"canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago"
```

**How to Fix**:
1. Find all URLs in the JSON
2. Remove any line breaks (newlines) within the URL
3. Keep URL on a single line
4. Verify no extra spaces or characters

---

### **ERROR 2: Invalid Category Paths** 🔴 CRITICAL

**Problem**: ChatGPT creates category paths that don't exist in the codebase

**Example of ERROR**:
```json
"secondaryCategories": [
  "receptai/saldumynai",
  "receptai/sventinis"
]
```

**Valid Categories ONLY**:
```
receptai/karsti-patiekalai
receptai/sriubos
receptai/uzkandziai
receptai/salotos
receptai/vistiena
receptai/jautiena
receptai/zuvis
receptai/desertai
receptai/15-min-patiekalai
receptai/be-glitimo
receptai/vegetariski
```

**How to Fix**:
1. Check each category in `secondaryCategories`
2. Verify it's in the valid list above
3. Replace invalid ones with valid alternatives
4. Example: `receptai/saldumynai` → `receptai/15-min-patiekalai`

---

### **ERROR 3: Units in Nutrition Values** 🔴 CRITICAL

**Problem**: Nutrition fields include units (mg, g, etc.)

**Example of ERROR**:
```json
"nutrition": {
  "calories": 210,
  "proteinContent": "6.3g",
  "fatContent": "11.3g",
  "sodiumContent": "150 mg"
}
```

**Correct Format**:
```json
"nutrition": {
  "calories": 210,
  "proteinContent": "6.3",
  "fatContent": "11.3",
  "sodiumContent": "150"
}
```

**How to Fix**:
1. Remove all units from nutrition values
2. Keep only the number
3. All values except calories should be strings
4. Calories should be a number

---

### **ERROR 4: Invalid Language Field** 🔴 CRITICAL

**Problem**: The `language` field is NOT part of the CurrentRecipe schema and causes MongoDB error

**Example of ERROR**:
```json
{
  "slug": "tarta-de-santiago",
  "canonicalUrl": "...",
  "language": "lt",  // ❌ NOT ALLOWED
  "title": { "lt": "..." }
}
```

**MongoDB Error**: `language override unsupported: lt`

**Correct Format**:
```json
{
  "slug": "tarta-de-santiago",
  "canonicalUrl": "...",
  "title": { "lt": "..." }
  // NO language field
}
```

**How to Fix**:
1. Remove the `language` field completely
2. Do NOT add it to the JSON
3. The CurrentRecipe schema does not support this field

---

## ✅ Pre-Submission Checklist

Before pasting JSON into MongoDB, verify:

- [ ] **No line breaks in URLs**
  - Check: `canonicalUrl`
  - Check: `image.src`
  - Check: `author.profileUrl`

- [ ] **Valid category paths**
  - Check: `primaryCategoryPath` is in valid list
  - Check: `secondaryCategories` all in valid list
  - Check: No custom/made-up categories

- [ ] **Nutrition values have no units**
  - Check: `proteinContent` is just number
  - Check: `fatContent` is just number
  - Check: `sodiumContent` is just number
  - Check: No "mg", "g", "%" symbols

- [ ] **NO language field**
  - Check: `language` field is NOT present
  - Check: Remove if ChatGPT added it
  - Check: MongoDB will reject it with "language override unsupported" error

- [ ] **JSON is valid**
  - Check: No syntax errors
  - Check: All quotes are closed
  - Check: All brackets are matched

---

## 🔧 Quick Fix Commands

### **Remove Line Breaks from URLs**
```
Find: https://...
      " (with line break)
Replace: https://..." (single line)
```

### **Replace Invalid Categories**
```
receptai/saldumynai → receptai/15-min-patiekalai
receptai/sventinis → receptai/be-glitimo
```

### **Remove Units from Nutrition**
```
"6.3g" → "6.3"
"150 mg" → "150"
"11.3g" → "11.3"
```

### **Add Language Field**
```
Add after "canonicalUrl":
"language": "lt",
```

---

## 📊 Error Frequency

Based on testing with ChatGPT:

| Error | Frequency | Severity |
|-------|-----------|----------|
| Line breaks in URLs | 80% | CRITICAL |
| Invalid categories | 60% | CRITICAL |
| Units in nutrition | 40% | CRITICAL |
| Invalid language field | 90% | CRITICAL |

---

## 🎯 Prevention Tips

1. **Always use the latest prompt** - `CHATGPT_CONVERSION_PROMPT_FINAL.md`
2. **Copy the entire prompt** - Don't modify it
3. **Paste Wikibooks JSON exactly** - Don't edit it
4. **Review output carefully** - Check all 4 error types
5. **Use the corrected JSON file** - As template for future recipes

---

## 📞 If Errors Persist

If ChatGPT keeps making the same errors:

1. Copy the corrected JSON example
2. Show it to ChatGPT as a reference
3. Ask it to follow the exact format
4. Request it to validate before output
5. Ask for a checklist confirmation

---

## ✨ Success Indicators

Your JSON is ready when:
- ✅ All URLs on single lines
- ✅ All categories are valid
- ✅ Nutrition has no units
- ✅ Language field present
- ✅ MongoDB accepts it without errors


