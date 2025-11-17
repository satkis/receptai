# 🚀 ChatGPT Prompt - Quick Reference Guide

## 📋 Valid Options for Enum Fields

### **difficulty** (5 options)
```
"labai-lengvas"    → Very easy
"lengvas"          → Easy
"vidutiniškas"     → Medium
"sunkus"           → Hard
"labai-sunkus"     → Very hard
```

### **timeCategory** (4 options)
```
"iki-30-min"       → Up to 30 minutes
"30-60-min"        → 30-60 minutes
"1-2-val"          → 1-2 hours
"virs-2-val"       → Over 2 hours
```

### **servingsUnit** (7 options)
```
"porcijos"         → Portions (most common)
"gabaliukai"       → Pieces
"vienetai"         → Units
"šaukštai"         → Spoons
"puodeliai"        → Cups
"gramų"            → Grams
"kilogramų"        → Kilograms
```

### **recipeCategory** (11 options)
```
"Karšti patiekalai"           → Hot dishes
"Sriubos"                     → Soups
"Užkandžiai"                  → Snacks
"Salotos ir mišrainės"        → Salads
"Vištiena"                    → Chicken
"Jautiena"                    → Beef
"Žuvis ir jūros gėrybės"      → Fish & Seafood
"Desertai"                    → Desserts
"15 minučių patiekalai"       → 15 min dishes
"Be glitimo"                  → Gluten free
"Vegetariški patiekalai"      → Vegetarian
```

### **primaryCategoryPath** (8 main slugs)
```
"receptai/karsti-patiekalai"
"receptai/sriubos"
"receptai/uzkandziai"
"receptai/salotos"
"receptai/vistiena"
"receptai/jautiena"
"receptai/zuvis"
"receptai/desertai"
```

---

## 🔄 Auto-Calculate Rules

### **timeCategory from totalTimeMinutes**
```
≤ 30 min    → "iki-30-min"
31-60 min   → "30-60-min"
61-120 min  → "1-2-val"
121+ min    → "virs-2-val"
```

### **difficulty from numeric (1-5)**
```
1 → "labai-lengvas"
2 → "lengvas"
3 → "vidutiniškas"
4 → "sunkus"
5 → "labai-sunkus"
```

### **totalTimeMinutes**
```
totalTimeMinutes = prepTimeMinutes + cookTimeMinutes
```

---

## 📐 Image Dimensions

**Rule**: Use actual dimensions from input JSON
```json
"image": {
  "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/{slug}-main.jpg",
  "alt": "Lithuanian description",
  "width": <actual_width_from_input>,
  "height": <actual_height_from_input>
}
```

---

## 🥗 Nutrition Calculation

**Rule**: Calculate per serving based on ingredients

```json
"nutrition": {
  "calories": <number>,
  "proteinContent": "<string>",
  "fatContent": "<string>",
  "carbohydrateContent": "<string>",
  "fiberContent": "<string>",
  "sugarContent": "<string>",
  "sodiumContent": "<string>"
}
```

**Note**: All values except calories are strings. If unsure, estimate or use "0".

---

## 🏷️ Slug Format

**Rules**:
- Lowercase only
- Hyphens for spaces
- No Lithuanian characters
- No special characters
- Max 100 characters

**Examples**:
```
"tarta-de-santiago"
"spageciai-karbonara"
"vistienos-salotos"
```

---

## 🔗 URL Format

**canonicalUrl**:
```
https://ragaujam.lt/receptas/{slug}
```

**Image src**:
```
https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/{slug}-main.jpg
```

---

## 📅 Timestamp Format

**All timestamps use ISO 8601 with +03:00 timezone**:
```
"2025-10-27T12:00:00+03:00"
```

---

## ✨ Key Rules Summary

1. **All text in Lithuanian** - Translate and make it sound natural/casual
2. **Rewrite instructions** - Don't copy directly from source
3. **Use actual image dimensions** - From input JSON, not hardcoded
4. **Calculate nutrition** - Based on ingredients
5. **Use original cuisine** - From Wikibooks if available
6. **Choose closest category** - If doesn't fit, create new one
7. **Valid JSON output** - Must be copy-paste ready for MongoDB
8. **No Lithuanian characters in slug** - Only a-z, 0-9, hyphens
9. **All timestamps with +03:00** - Lithuania timezone
10. **Author always ragaujam.lt** - Fixed value

---

## 🎯 Testing Checklist

Before using output in MongoDB:
- [ ] Valid JSON (no syntax errors)
- [ ] All required fields present
- [ ] No Lithuanian characters in slug
- [ ] Image dimensions are numbers
- [ ] Timestamps have +03:00 timezone
- [ ] Category paths are valid
- [ ] Nutrition values are reasonable
- [ ] Instructions are unique/rewritten
- [ ] All text is in Lithuanian

---

## 📞 Need Help?

If ChatGPT output doesn't match these rules:
1. Check the full prompt: `CHATGPT_CONVERSION_PROMPT_FINAL.md`
2. Review the detailed attribute rules section
3. Verify enum values match exactly
4. Check timestamp format (+03:00)
5. Ensure image dimensions are from input JSON


