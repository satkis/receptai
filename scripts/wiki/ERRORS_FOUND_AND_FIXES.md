# ❌ **Errors Found in ChatGPT Output - Alžyriškas Kuskusas**

## 🔍 **Schema Validation Errors**

### **Error 1: Line Breaks in URLs** ❌
**Location**: Multiple fields
**Problem**: URLs have line breaks in the middle, breaking the format

**Affected Fields**:
1. `canonicalUrl` - Line break after `receptas/alziriskas-kuskusas-su-mesa-ir-darzovemis`
2. `author.profileUrl` - Line break after `User:SvnnyBvnny`
3. `originalSource.url` - Line break after `Meat_and_Vegetables`
4. `originalSource.licenseUrl` - Line break after `4.0/`
5. `originalSource.contributorsUrl` - Line break after `history`
6. `originalImage.author.userPageUrl` - Line break after `Yasmineziat`
7. `originalImage.license.url` - Line break after `4.0/`
8. `originalImage.wikimediaCommonsUrl` - Line break after `.jpg`
9. `image.src` - Line break after `darzovemis.jpg`

**Fix**: Remove all line breaks from URLs - keep them on single lines

---

### **Error 2: Extra `priority` Field in Notes** ❌
**Location**: `notes` array
**Problem**: Each note object has `priority` field TWICE

**Current (WRONG)**:
```json
"notes": [
  { "text": { "lt": "..." }, "priority": 1 },
  "priority": 1
]
```

**Should Be**:
```json
"notes": [
  { "text": { "lt": "..." }, "priority": 1 }
]
```

**Schema Definition** (types/index.ts line 253-256):
```typescript
notes: Array<{
  text: { lt: string };
  priority: number;
}>;
```

---

### **Error 3: Invalid `seo.nutrition` Fields** ❌
**Location**: `seo.nutrition`
**Problem**: Schema only allows 4 nutrition fields, but ChatGPT added 7

**Schema Allows** (types/index.ts line 221-226):
```typescript
nutrition: {
  calories: number;
  proteinContent: string;
  fatContent: string;
  fiberContent: string;
};
```

**ChatGPT Generated** (WRONG):
```json
"nutrition": {
  "calories": 774,
  "proteinContent": "38g",
  "fatContent": "28g",
  "carbohydrateContent": "92g",      // ❌ NOT IN SCHEMA
  "fiberContent": "11g",
  "sugarContent": "3g",              // ❌ NOT IN SCHEMA
  "sodiumContent": "0.8g"            // ❌ NOT IN SCHEMA
}
```

**Fix**: Remove `carbohydrateContent`, `sugarContent`, `sodiumContent`

---

### **Error 4: Invalid `seo.focusKeyword` Field** ❌
**Location**: `seo` object
**Problem**: `focusKeyword` is not in the schema

**ChatGPT Generated**:
```json
"focusKeyword": "alžyriškas kuskusas"  // ❌ NOT IN SCHEMA
```

**Schema Does NOT Have This Field**

**Fix**: Remove `focusKeyword` completely

---

### **Error 5: `datePublished` is `null`** ⚠️
**Location**: `originalSource.datePublished`
**Problem**: Should be a valid date string or null, but null is acceptable

**Current**:
```json
"datePublished": null
```

**Schema Allows** (types/index.ts line 289):
```typescript
datePublished: Date | string;
```

**Note**: `null` is acceptable if the original Wikibooks recipe doesn't have a publication date. This is NOT a critical error, but should be a valid ISO 8601 date if available.

---

## 📋 **Summary of Errors**

| Error | Type | Severity | Count |
|-------|------|----------|-------|
| Line breaks in URLs | Format | 🔴 Critical | 9 |
| Duplicate `priority` in notes | Structure | 🔴 Critical | 3 |
| Extra nutrition fields | Schema | 🔴 Critical | 3 |
| Invalid `focusKeyword` | Schema | 🔴 Critical | 1 |
| `datePublished` is null | Data | 🟡 Warning | 1 |

---

## ✅ **How to Fix the Prompt**

### **Fix 1: Add URL Validation Rule**
Add to quality checklist:
```
- [ ] **NO line breaks in URLs** - All URLs must be on single lines
  - canonicalUrl
  - image.src
  - author.profileUrl
  - originalSource.url
  - originalSource.licenseUrl
  - originalSource.contributorsUrl
  - originalImage.author.userPageUrl
  - originalImage.license.url
  - originalImage.wikimediaCommonsUrl
```

### **Fix 2: Clarify Notes Structure**
Add to field rules:
```
### **notes**
- Format: Array of objects
- Structure: [{ "text": { "lt": "string" }, "priority": number }]
- Rules:
  - Each note has ONLY two fields: text and priority
  - NO duplicate priority fields
  - Priority: 1 (highest), 2, 3, etc.
```

### **Fix 3: Restrict Nutrition Fields**
Add to field rules:
```
### **seo.nutrition**
- Format: Object with ONLY these 4 fields:
  - calories: number
  - proteinContent: string (e.g., "38g")
  - fatContent: string (e.g., "28g")
  - fiberContent: string (e.g., "11g")
- Rules:
  - DO NOT include: carbohydrateContent, sugarContent, sodiumContent
  - DO NOT include: any other nutrition fields
  - Only these 4 fields are allowed
```

### **Fix 4: Remove focusKeyword**
Add to field rules:
```
### **seo.focusKeyword** ❌ DO NOT USE
- This field is NOT in the MongoDB schema
- Remove it completely from output
- Use only: metaTitle, metaDescription, keywords
```

---

## 🚀 **Next Steps**

1. Update `CHATGPT_CONVERSION_PROMPT_FINAL.md` with these fixes
2. Add stricter validation rules
3. Test with ChatGPT again
4. Verify all URLs are on single lines
5. Verify notes structure is correct
6. Verify nutrition has only 4 fields


