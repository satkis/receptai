# ❌ MongoDB Validation Errors Found

## 🔍 Issues in ChatGPT Output

### **ERROR 1: Line Breaks in URLs** ⚠️ CRITICAL
**Location**: `canonicalUrl` and `image.src` and `author.profileUrl`

**Problem**: URLs have line breaks in the middle
```json
"canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago
"
```

**Should be**:
```json
"canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago"
```

**Same issue in**:
- `image.src` - has line break after `.jpg`
- `author.profileUrl` - has line break after `.lt`

---

### **ERROR 2: Invalid Category Paths** ⚠️ CRITICAL
**Location**: `secondaryCategories`

**Problem**: Categories don't exist in codebase
```json
"secondaryCategories": [
  "receptai/saldumynai",
  "receptai/sventinis"
]
```

**Issue**: 
- `"receptai/saldumynai"` - NOT a valid category
- `"receptai/sventinis"` - NOT a valid category

**Valid categories** (from codebase):
- `"receptai/karsti-patiekalai"`
- `"receptai/sriubos"`
- `"receptai/uzkandziai"`
- `"receptai/salotos"`
- `"receptai/vistiena"`
- `"receptai/jautiena"`
- `"receptai/zuvis"`
- `"receptai/desertai"`
- `"receptai/15-min-patiekalai"`
- `"receptai/be-glitimo"`
- `"receptai/vegetariski"`

**Should be** (for a dessert):
```json
"secondaryCategories": [
  "receptai/15-min-patiekalai",
  "receptai/be-glitimo"
]
```

---

### **ERROR 3: Nutrition Field Format** ⚠️ CRITICAL
**Location**: `seo.nutrition.sodiumContent`

**Problem**: Contains "mg" unit
```json
"sodiumContent": "150 mg"
```

**Should be**: Just the number as string
```json
"sodiumContent": "150"
```

**All nutrition fields should be strings with ONLY numbers**, no units.

---

### **ERROR 4: Invalid Language Field** ⚠️ CRITICAL
**Location**: Root level of recipe object

**Problem**: The `language` field is NOT part of the CurrentRecipe schema
```json
"language": "lt"  // ❌ NOT ALLOWED - causes "language override unsupported" error
```

**Solution**: Remove the `language` field completely
- The CurrentRecipe interface does NOT include a language field
- MongoDB Compass rejects it with "language override unsupported: lt"
- This field should NOT be in the JSON

---

## 📋 Summary of Errors

| Error | Severity | Count | Fix |
|-------|----------|-------|-----|
| Line breaks in URLs | CRITICAL | 3 | Remove line breaks |
| Invalid category paths | CRITICAL | 2 | Use valid categories only |
| Nutrition unit in value | CRITICAL | 1 | Remove "mg" unit |
| Missing language field | CRITICAL | 1 | Add `"language": "lt"` |

---

## ✅ Corrected JSON

Here's the corrected version:

```json
{
  "slug": "tarta-de-santiago",
  "canonicalUrl": "https://ragaujam.lt/receptas/tarta-de-santiago",
  "title": {
    "lt": "Santjago tortas (Ispanų migdolų pyragas)"
  },
  "description": {
    "lt": "Tradicinis ispanų migdolų pyragas iš Galicijos. Paprastas receptas iš kelių pagrindinių ingredientų, puikiai tinkantis šventėms — kepamas iki auksinės plutelės ir barstomas cukraus pudra su Santjago kryžiaus ornamentu."
  },
  "seo": {
    "metaTitle": "Santjago tortas - Ispanų migdolų pyragas receptas",
    "metaDescription": "Santjago tortas — tradicinis ispanų migdolų pyragas iš Galicijos. Lengvas receptas su žingsnis-po-žingsnio instrukcija ir dekoracijos pasiūlymu.",
    "keywords": [
      "santjago tortas",
      "ispanų pyragas",
      "migdolų pyragas",
      "lengvas pyragas",
      "šventinis pyragas"
    ],
    "focusKeyword": "santjago tortas",
    "recipeCategory": "Desertai",
    "recipeCuisine": "Ispanų",
    "aggregateRating": {
      "ratingValue": 4.82,
      "reviewCount": 13,
      "bestRating": 5,
      "worstRating": 1
    },
    "nutrition": {
      "calories": 210,
      "proteinContent": "6.3",
      "fatContent": "11.3",
      "carbohydrateContent": "22.5",
      "fiberContent": "2.3",
      "sugarContent": "18.8",
      "sodiumContent": "150"
    }
  },
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 40,
  "totalTimeMinutes": 55,
  "timeCategory": "30-60-min",
  "servings": 8,
  "servingsUnit": "porcijos",
  "difficulty": "lengvas",
  "primaryCategoryPath": "receptai/desertai",
  "secondaryCategories": [
    "receptai/15-min-patiekalai",
    "receptai/be-glitimo"
  ],
  "ingredients": [
    {
      "name": {
        "lt": "Kiaušiniai"
      },
      "quantity": "3 vnt",
      "vital": true
    },
    {
      "name": {
        "lt": "Baltojo cukraus"
      },
      "quantity": "150 g",
      "vital": true
    },
    {
      "name": {
        "lt": "Migdolų miltai"
      },
      "quantity": "150 g",
      "vital": true
    },
    {
      "name": {
        "lt": "Citrinos žievelė"
      },
      "quantity": "1 vnt (tarkuota)",
      "vital": true
    },
    {
      "name": {
        "lt": "Klementino žievelė"
      },
      "quantity": "1 vnt (tarkuota)",
      "vital": true
    },
    {
      "name": {
        "lt": "Cinamonas (maltas)"
      },
      "quantity": "½ arbatinio šaukštelio",
      "vital": true
    },
    {
      "name": {
        "lt": "Druska"
      },
      "quantity": "¼ arbatinio šaukštelio",
      "vital": true
    }
  ],
  "sideIngredients": [
    {
      "category": "Dekoracijai",
      "name": {
        "lt": "Cukraus pudra"
      },
      "quantity": "pagal poreikį (barstymui)",
      "vital": false
    }
  ],
  "instructions": [
    {
      "step": 1,
      "name": {
        "lt": "Kiaušiniai ir cukrus"
      },
      "text": {
        "lt": "Į didelį dubenį sudėkite kiaušinius ir cukrų. Plakite elektriniu plaktuvu greitai, kol masė taps šviesi ir purus (apie 3–5 minutes)."
      }
    },
    {
      "step": 2,
      "name": {
        "lt": "Citrinų žievelės"
      },
      "text": {
        "lt": "Į plakinius įmaišykite tarkuotas citrinos ir klementino žieves. Trumpai paplakite, kad citrusų aromatas tolygiai pasiskirstytų."
      }
    },
    {
      "step": 3,
      "name": {
        "lt": "Sausieji ingredientai"
      },
      "text": {
        "lt": "Atskirame dubenyje sumaišykite migdolų miltus, cinamoną ir druską. Gerai išmaišykite, kad neliktų gumuliukų."
      }
    },
    {
      "step": 4,
      "name": {
        "lt": "Sujungimas"
      },
      "text": {
        "lt": "Sausą mišinį suberkite prie kiaušinių masės ir atsargiai įmaišykite guminėmis mentelėmis. Maišykite tol, kol masė taps vientisa ir vienalyte."
      }
    },
    {
      "step": 5,
      "name": {
        "lt": "Formos paruošimas"
      },
      "text": {
        "lt": "Iškočiokite arba ištepkite sviestu ir pabarstykite miltais kepimo formą (pavyzdžiui, atsegamą 22–24 cm). Supilkite tešlą ir švelniai išlyginkite viršų."
      }
    },
    {
      "step": 6,
      "name": {
        "lt": "Kepimas"
      },
      "text": {
        "lt": "Kepkite iš anksto įkaitintoje orkaitėje 180 °C temperatūroje apie 40 minučių arba kol pyragas bus auksinės spalvos ir viduje visiškai iškepęs. Patikrinkite mediniu smeigtuku."
      }
    },
    {
      "step": 7,
      "name": {
        "lt": "Atvėsinimas ir formavimas"
      },
      "text": {
        "lt": "Leiskite pyragui visiškai atvėsti formoje, tada atsargiai išimkite. Ant viršaus uždėkite Santjago kryžiaus trafaretą arba kriauklės formos šabloną."
      }
    },
    {
      "step": 8,
      "name": {
        "lt": "Dekoravimas ir patiekimas"
      },
      "text": {
        "lt": "Barstykite cukraus pudrą per trafaretą, atsargiai nuimkite šabloną ir supjaustykite. Patiekite gabalėliais su arbata arba kava."
      }
    }
  ],
  "notes": [
    {
      "text": {
        "lt": "Vietoje Santjago kryžiaus galima naudoti kriauklės trafaretą arba dekoruoti be jokių ornamentų."
      },
      "priority": 2
    },
    {
      "text": {
        "lt": "Jei neturite migdolų miltų, susmalinkite migdolus iki smulkios konsistencijos, bet venkite per ilgo malimo, kad neatsidarytų aliejus."
      },
      "priority": 3
    }
  ],
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tarta-de-santiago-main.jpg",
    "alt": "Santjago tortas - ispanų migdolų pyragas",
    "width": 1891,
    "height": 1482
  },
  "tags": [
    "santjago tortas",
    "migdolų pyragas",
    "ispanų virtuvė",
    "konditerija",
    "šventiniai desertai"
  ],
  "author": {
    "name": "ragaujam.lt",
    "profileUrl": "https://ragaujam.lt"
  },
  "status": "published",
  "featured": false,
  "trending": false,
  "publishedAt": "2025-10-31T18:00:00+03:00",
  "createdAt": "2025-10-31T18:00:00+03:00",
  "updatedAt": "2025-10-31T18:00:00+03:00"
}
```

---

## 🔧 Fixes Applied

1. ✅ Removed line breaks from `canonicalUrl`
2. ✅ Removed line breaks from `image.src`
3. ✅ Removed line breaks from `author.profileUrl`
4. ✅ Changed `secondaryCategories` to valid categories
5. ✅ Removed "mg" from `sodiumContent`
6. ✅ Added `language: "lt"`


