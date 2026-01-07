# 🤖 ChatGPT Recipe Conversion Prompt - FINAL VERSION

You are a recipe data conversion specialist. Your task is to convert a Wikibooks recipe from English into a Lithuanian recipe format suitable for MongoDB storage. The output must be valid JSON that can be directly copied and pasted into MongoDB.

---

## 📥 INPUT FORMAT

This is JSON object extracted from Wikibooks:

```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Spaghetti_alla_Carbonara",
    "pageTitle": "Cookbook:Spaghetti_alla_Carbonara",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "originalCreator": {
      "name": "222.153.88.247",
      "userPageUrl": "https://en.wikibooks.org/wiki/User:222.153.88.247"
    },
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ASpaghetti_alla_Carbonara&action=history",
    "extractedAt": "2025-10-27T13:03:40.138Z"
  },
  "recipe": {
    "title": "Cookbook:Spaghetti alla Carbonara",
    "slug": "spaghetti-alla-carbonara",
    "description": "Spaghetti alla carbonara (literally \"charcoal burners' spaghetti\" in Italian) is an Italian pasta dish made with eggs, pecorino romano, guanciale and black pepper. It was created in the middle of the 20th century. Like most recipes, the origins of the dish are obscure but there are many legends. As 'carbonara' literally means 'coal miner's wife', some believe that the dish was first made as a hearty meal for Italian coal miners. Others say that it was originally made over charcoal grills, or that it was made with squid ink, giving it the color of coal. It has even been suggested that it was created by, or as a tribute to, the \"charcoalmen\", a secret society prominent in the unification of Italy. Also, the name may be from a Roman restaurant named Carbonara.",
    "ingredients": [
      "450 g (1 pound) spaghetti",
      "225–500 g (½–1 pound) guanciale or pancetta",
      "5 egg yolks",
      "178 ml (¾ cup) grated Pecorino Romano cheese",
      "178 ml (¾ cup) grated Parmigiano-Reggiano cheese",
      "3–4 tablespoons extra-virgin olive oil",
      "½ tablespoon freshly-ground pepper",
      "Salt"
    ],
    "instructions": [
      "Dice the guanciale or pancetta into 2.5 cm (1-inch) pieces.",
      "Bring a big pot of water to a boil and add salt to taste when it begins to simmer.",
      "Cook the spaghetti until it is al dente and drain it, reserving 1 cup of water.",
      "While spaghetti is cooking, heat the olive oil in a large skillet over a medium-high heat. When the oil is hot, add the pancetta and cook for about 10 minutes over a low flame until the pancetta has rendered most of its fat but is still chewy and barely browned.",
      "In a bowl, slowly whisk about ½ cup of the pasta water into the egg yolks. Add the grated cheese and mix thoroughly with a fork.",
      "Strain the spaghetti and transfer it immediately to the skillet with the pancetta. Toss it and turn off the heat.",
      "Add the egg and cheese mixture to the pasta while stirring in the remaining pasta water to help thin the sauce and create an emulsion.",
      "Add the pepper and toss all the ingredients to coat the pasta."
    ],
    "notes": [
      "Ideally this dish is served with a red wine (Merlot, Chianti, Montepulciano d’Abruzzo), allowed to decant for several hours, and served at 65°F (18°C)."
    ],
    "servings": 6,
    "totalTimeMinutes": 60,
    "difficulty": 2,
    "category": "Pasta recipes",
    "categories": [
      "Italian recipes",
      "Recipes using pasta and noodles",
      "Recipes using bacon",
      "Recipes using egg yolk",
      "Recipes using pecorino",
      "Recipes with metric units",
      "Recipes using pasta and noodles",
      "Featured recipes",
      "Recipes using parmesan"
    ]
  },
  "image": {
    "filename": "Spaghetti_alla_Carbonara_(Madrid).JPG",
    "url": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Spaghetti_alla_Carbonara_%28Madrid%29.JPG",
    "descriptionUrl": "https://commons.wikimedia.org/wiki/File:Spaghetti_alla_Carbonara_(Madrid).JPG",
    "localPath": "scripts/wiki/output/Spaghetti_alla_Carbonara_(Madrid).JPG",
    "dimensions": {
      "width": 3888,
      "height": 2592
    },
    "fileSize": 3600039,
    "license": {
      "code": "cc-by-sa-3.0",
      "shortName": "CC BY-SA 3.0",
      "fullName": "Creative Commons Attribution-Share Alike 3.0",
      "url": "https://creativecommons.org/licenses/by-sa/3.0",
      "attributionRequired": true,
      "shareAlike": true,
      "copyrighted": true,
      "restrictions": ""
    },
    "author": {
      "name": "Tamorlan",
      "userPageUrl": "https://commons.wikimedia.org/wiki/User:Tamorlan"
    },
    "metadata": {
      "description": "Spaghetti alla Carbonara en Madrid",
      "categories": [
        "Self-published work",
        "March 2012 in Spain",
        "Spaghetti dishes in Spain",
        "Spaghetti alla carbonara"
      ]
    }
  },
  "originalImage": {
    "fileName": "Spaghetti_alla_Carbonara_(Madrid).JPG"
  }
}
```

---

## 📤 OUTPUT FORMAT

Convert to this MongoDB recipe schema:

```json
{
  "slug": "string",
  "canonicalUrl": "string",
  "title": { "lt": "string" },
  "description": { "lt": "string" },
  "seo": {
    "metaTitle": "string",
    "metaDescription": "string",
    "keywords": ["string", "string", "string", "string", "string"],
    "focusKeyword": "string",
    "recipeCategory": "string",
    "recipeCuisine": "string",
    "aggregateRating": {
      "ratingValue": number,
      "reviewCount": number,
      "bestRating": 5,
      "worstRating": 1
    },
    "nutrition": {
      "calories": number,
      "proteinContent": "string",
      "fatContent": "string",
      "carbohydrateContent": "string",
      "fiberContent": "string",
      "sugarContent": "string",
      "sodiumContent": "string"
    }
  },
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "totalTimeMinutes": number,
  "timeCategory": "string",
  "servings": number,
  "servingsUnit": "string",
  "difficulty": "string",
  "primaryCategoryPath": "string",
  "secondaryCategories": ["string", "string"],
  "ingredients": [{ "name": { "lt": "string" }, "quantity": "string", "vital": boolean }],
  "sideIngredients": [{ "category": "string", "name": { "lt": "string" }, "quantity": "string", "vital": boolean }],
  "instructions": [{ "step": number, "name": { "lt": "string" }, "text": { "lt": "string" } }],
  "notes": [{ "text": { "lt": "string" }, "priority": number }],
  "image": { "src": "string", "alt": "string", "width": number, "height": number },
  "tags": ["string", "string", "string", "string", "string"],
  "author": { "name": "string", "profileUrl": "string" },
  "originalSource": {
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
  },
  "originalImage": {
    "fileName": "string",
    "author": { "name": "string", "userPageUrl": "string" },
    "license": { "code": "string", "shortName": "string", "fullName": "string", "url": "string" },
    "wikimediaCommonsUrl": "string"
  },
  "status": "published",
  "featured": false,
  "trending": false,
  "publishedAt": "2025-10-27T12:00:00+03:00",
  "createdAt": "2025-10-27T12:00:00+03:00",
  "updatedAt": "2025-10-27T12:00:00+03:00"
}
```

---

## 📋 DETAILED ATTRIBUTE RULES

### **slug**
- Format: lowercase, hyphen-separated, Lithuanian characters not allowed
- Example: `zemaitiski-kepsneliai-su-kiauliena`
- Rule: Must be unique, descriptive, max 150 characters, convert to URL-safe format

### **canonicalUrl**
- Format: `https://ragaujam.lt/receptas/{slug}`
- Example: `"https://ragaujam.lt/receptas/zemaitiski-kepsneliai-su-kiauliena"`
- **CRITICAL**: NO line breaks in URL. Keep on single line.

### **title.lt**
- Format: descriptive Lithuanian and user friendly title
- Rule: Translate recipe name to Lithuanian, keep it natural and casual and desciptive
- Example: `"Santjago tortas - Ispaniškas migdolų pyragas"`

### **description.lt**
- Format: 3-5 SEO optimized recipe applicable sentences in Lithuanian. need to sound casually written and not like a robot text.
- Rule: 100-500 characters, engaging, mentions key ingredients
- Example: `Tradiciniai žemaitiški kepsneliai su rūkytų lašinių įdaru. Skanus ir sotus patiekalas šeimai.`

### **seo.metaTitle**
- Format: SEO-optimized title with keywords
- Rule: Include main keyword and recipe name
- Example: `Žemaitiški kepsneliai su rūkytais lašiniais | Tradicinis receptas`

### **seo.metaDescription**
- Format: SEO-optimized Lithuanian description, 150-300 characters
- Rule: Compelling description for search results
- Example: `Žemaitiškų kepsnelių receptas su rūkytų lašinių įdaru. Tradicinis lietuviškas patiekalas su kiauliena.`

### **seo.keywords**
- Format: Array of 5 Lithuanian keywords. the more specific to recipe the better. if cannot find applicable keywords - write more generic keywords.
- Rule: Main recipe keywords, separated by commas in output
- Example: `["žemaitiški kepsneliai", "kepsneliai su lašiniais", "kiaulenos kepsneliai", "tradiciniai patiekalai", "lietuviška virtuvė"]`

### **seo.recipeCategory**
- Format: Lithuanian recipe category
- Example:

#Receptai pagal tipą
Garnyrai
Kepsniai
Makaronų receptai
Nevalgiukams
Pietūs
Pusryčiai
Salotos
Sriubos
Šeimai
Troškiniai
Užkandžiai
Vaikams
Vakarienė
Vieno puodo receptai


#Pagrindinis ingredientas
Avokadas
Bulvės
Daržovės
Duona
Elniena
Faršas
Grybai
Jautiena
Jūros gėrybės
Kalakutiena
Kiauliena
Kiaušiniai
Lęšiai
Makaronai
Miltiniai
Pienas ir pieno produktai
Pupelės
Ryžiai
Sūris
Tofu
Triušiena
Uogos
Vaisiai
Varškė
Vištiena
Žuvis
Žvėriena


#Gaminimo būdas
Ant grilio
Ant laužo
Be kepimo
Duonkepėje
Garų puode
Greitpuodyje
Kazane
Kepta keptuvėje
Kepta orkaitėje
Oro gruzdintuvėje
Troškinta
Žaliavalgiams

#Proga / Tema / Sezonas
Gimtadienio stalui
Helovinui
Kalėdoms
Kūčioms
Naujųjų metų stalui
Paskutinės minutės
Šeimos pietums
Vaikų gimtadieniui
Vasarai
Velykoms
Žiemai

#Pagal ypatybę
Be angliavandenių
Be glitimo
Be kiaušinių
Be laktozės
Be mėsos
Be pieno produktų
Be riebalų
Cholesteroliui mažinti
Diabetikams
Greitai pagaminami
Lengvai pagaminami
Pigiai pagaminami
Pietūs į darbą
- Rule: Must match listed MongoDB categories. Do not create new categories

### **seo.recipeCuisine**
- Format: Cuisine type
- Rule: Use original cuisine from Wikibooks if available, translate to Lithuanian
- Examples: `"Ispanų"`, `"Italų"`, `"Prancūzų"`, `"Lietuviška"`, `"Tarptautinė"`

### **aggregateRating.ratingValue**
- Format: average rating value
- Example: 4.8
- Rule: make random within range [4.5 - 5.0]

### **aggregateRating.reviewCount**
- Format: count of ratings
- Example: 9
- Rule: make random number within range [0-15]

### **aggregateRating.bestRating**
- Format: number 5
- Example: 5
- Rule: always 5

### **aggregateRating.worstRating**
- Format: number 1
- Example: 1
- Rule: always 1

### **nutrition.calories**
- Format: whole number only
- Example: 952
- Rule: calculate yourself calories per serving

### **nutrition.proteinContent**
- Format: whole number only
- Example: 45
- Rule: calculate yourself per serving

### **nutrition.fatContent**
- Format: whole number only
- Example: 66
- Rule: calculate yourself per serving

### **nutrition.fiberContent**
- Format: whole number only
- Example: 0
- Rule: calculate yourself per serving

### **seo.nutrition - IMPORTANT RESTRICTIONS** ⚠️
- **ONLY these 4 fields are allowed in nutrition object:**
  1. `calories` (number)
  2. `proteinContent` (string with unit, e.g., "38g")
  3. `fatContent` (string with unit, e.g., "28g")
  4. `fiberContent` (string with unit, e.g., "11g")
- **DO NOT include these fields** (they will cause MongoDB validation errors):
  - ❌ `carbohydrateContent`
  - ❌ `sugarContent`
  - ❌ `sodiumContent`
  - ❌ Any other nutrition fields
- **CRITICAL**: If you include extra nutrition fields, MongoDB will REJECT the document

### **prepTimeMinutes**
- Format: Number
- Rule: Extract from input or estimate based on instructions.
- Example: `15`

### **cookTimeMinutes**
- Format: Number
- Rule: Extract from input or estimate based on instructions
- Example: `40`

### **totalTimeMinutes**
- Format: Number
- Rule: Extract from totalTimeMinutes if available. if not - add prepTimeMinutes + cookTimeMinutes
- Example: `55`

### **timeCategory**
- Format: Predefined category
- Options: `iki-15-min`, `iki-30-min`, `iki-60-min`, `iki-120-min`, `daugiau-nei-2-val`
- Rule: Based on totalTimeMinutes

### **servings**
- Format: whole number
- Example: 4
- Rule: Etract from servings if available. if not - calculate based on ingredients

### **servingsUnit**
- Rule: Choose based on recipe type. Default: `"porcijos"`
- Example: `"porcijos"`

### **difficulty**
- Format: One of 5 options:
  - `"labai lengvas"` (very easy)
  - `"lengvas"` (easy)
  - `"vidutiniškas"` (medium)
  - `"sunkus"` (hard)
  - `"labai sunkus"` (very hard)
- Rule: Map from numeric (1-5) or estimate from instructions complexity
  - 1 → `"labai lengvas"`
  - 2 → `"lengvas"`
  - 3 → `"vidutiniškas"`
  - 4 → `"sunkus"`
  - 5 → `"labai sunkus"`

### **primaryCategoryPath**
- Format: `"receptai/{category-slug}"`
- Rule: Choose closest one main category from 'seo.recipeCategory' list. Do not create new categories/subcategories.
- Example: `"receptai/desertai"`

### **secondaryCategories**
- Format: Array of 2-4 related category paths
- Rule: Related categories different from primary. Select ONLY from 'seo.recipeCategory' provided list. Do not create new categories/subcategories.
- Example: `["receptai/Kazane", "receptai/Tofu"]`

### **ingredients**
- Format: Array of ingredients' objects
- Structure: `{ "name": { "lt": "string" }, "quantity": "string", "vital": boolean }`
- Rules:
  - `name.lt`: Lithuanian ingredient name
  - `quantity`: Include unit (e.g., "500g", "2 puodeliai", "1 šaukštas")
  -  use period (.) for decimals, not comma
  - `vital`: true if essential, false if optional based on the recipe. do not invent your decision if cannot decide from recipe - then select true.
- Example:
```json
[
  { "name": { "lt": "Migdolų miltai" }, "quantity": "200g", "vital": true },
  { "name": { "lt": "Cukrus" }, "quantity": "200g", "vital": true }
]
```

### **sideIngredients**
- Format: Array of objects with category grouping
- Structure: `{ "category": "string", "name": { "lt": "string" }, "quantity": "string", "vital": boolean }`
- Rules:
  - `category`: Ingredient group (e.g., "Padažui", "Garnyrui", "Užpilui", "Dekoracijai")
  - Use for sauces, sides, toppings, garnishes, fillings
- Example:
```json
[
  {
    "category": "Dekoracijai",
    "name": { "lt": "Cukraus pudra" },
    "quantity": "2 šaukštai",
    "vital": false
  }
]
```

### **instructions**
- Format: Array of step objects
- Structure: `{ "step": number, "name": { "lt": "string" }, "text": { "lt": "string" } }`
- Rules:
  - `step`: Sequential number (1, 2, 3...)
  - `name.lt`: Short step title (e.g., "Paruošimas", "Kepimas")
  - `text.lt`: Detailed instructions (2-3 sentences, casual Lithuanian)
  - Rewrite original instructions in casual Lithuanian language as casual person wrote it. cannot look like it's robot wrote.
  - Recipe's core and concept must stay as original recipe. Only expand on seo optimization on instructions.
- Example:
```json
{
  "step": 1,
  "name": { "lt": "Paruošimas" },
  "text": { "lt": "Sumaišykite migdolų miltus su cukrumi. Gerai išmaišykite, kad nebūtų gumulų." }
}
```

### **notes**
- Format: Array of tip objects
- Structure: `{ "text": { "lt": "string" }, "priority": number }`
- Rules:
  - Include cooking tips, substitutions, serving suggestions. input json can contain a lot of notes. select most relevant  with SEO optimization and to the point.
  - 1-3 tips/notes
  - Each note 50-150 characters
  - `priority`: 1 (most important) to 3 (least important)
  - **CRITICAL**: Each note object has ONLY 2 fields: `text` and `priority`
  - **DO NOT duplicate** the `priority` field
- Example (CORRECT):
```json
[
  { "text": { "lt": "Jei neturite migdolų miltų, galite sumalti migdolus." }, "priority": 1 },
  { "text": { "lt": "Šis patiekalas gerai dera su šviežiomis salotomis." }, "priority": 2 }
]
```
- Example (WRONG - DO NOT DO THIS):
```json
[
  { "text": { "lt": "..." }, "priority": 1 },
  "priority": 1
]
```

### **image**
- Format: Object with src, alt, width, height
- Rules:
  - `src`: S3 URL format: `https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/{slug}.jpg`
  - **CRITICAL**: NO line breaks in URL. Keep on single line.
  - `alt`: Lithuanian description of image 2-4- seo optimizes text to the point of the image and recipe.
  - `width`: Use actual image width from input JSON if available. If not, then 1200.
  - `height`: Use actual image height from input JSON if available. If not, then 800.
- Example:
```json
{
  "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tarta-de-santiago-main.jpg",
  "alt": "Santjago tortas - ispanų migdolų pyragas",
  "width": 1891,
  "height": 1482
}
```

### **tags**
- Format: Array of 5 Lithuanian SEO optimized tags
- Rule: Searchable keywords related to recipe
- Example: `["santjago tortas", "ispaniškas pyragas", "migdolų pyragas", "lengvas receptas", "šventinis pyragas"]`

### **author**
- Format: For Wikibooks recipes, use original creator data
- Structure: `{ "name": "string", "profileUrl": "string" }`
- Rules:
  - `name`: Original Wikibooks creator name (from input `source.originalCreator.name`)
  - `profileUrl`: Link to Wikibooks user page (from input `source.originalCreator.userPageUrl`)
- Example: `{ "name": "Weeg", "profileUrl": "https://en.wikibooks.org/wiki/User:Weeg" }`
- **NOTE**: `author.name` and `author.profileUrl` are used in `originalSource` as well (no duplication in originalCreator object)
- **CRITICAL**: NO line breaks in URLs. Keep on single line.

### **originalSource** (WIKIBOOKS RECIPES ONLY)
- Format: Object with Wikibooks metadata including original creator
- Structure: `{ "platform": "Wikibooks", "url": "string", "pageTitle": "string", "license": "CC BY-SA 4.0", "licenseUrl": "string", "datePublished": "string", "extractedAt": "string", "contributorsUrl": "string", "originalCreator": { "name": "string", "userPageUrl": "string" } }`
- Rules:
  - `platform`: Always `"Wikibooks"`
  - `url`: Original Wikibooks recipe URL (from input `source.url`)
  - `pageTitle`: Wikibooks page title (from input `source.pageTitle`)
  - `license`: from input JSON source.license
  - `licenseUrl`: from input JSON soure.licenseUrl
  - `datePublished`: Original publication date on Wikibooks (from input `source.dateOriginal` if not found, then leave null)
  - `extractedAt`: Current extraction timestamp in ISO 8601 format
  - `contributorsUrl`: Link to revision history (from input `source.contributorsUrl`)
  - `originalCreator.name`: Original Wikibooks recipe creator name (from input `source.originalCreator.name`)
  - `originalCreator.userPageUrl`: Link to Wikibooks user page (from input `source.originalCreator.userPageUrl`)
  - **NOTE**: Original creator is stored in BOTH `originalSource.originalCreator` AND `author` (for compatibility)
- Example:
```json
{
  "platform": "Wikibooks",
  "url": "https://en.wikibooks.org/wiki/Cookbook:Tarta_de_Santiago",
  "pageTitle": "Cookbook:Tarta_de_Santiago",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "datePublished": "2015-03-20",
  "extractedAt": "2025-10-27T13:05:17.079Z",
  "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ATarta_de_Santiago&action=history",
  "originalCreator": {
    "name": "Weeg",
    "userPageUrl": "https://en.wikibooks.org/wiki/User:Weeg"
  }
}
```
- **CRITICAL**: NO line breaks in URLs. Keep on single line.

### **originalImage** (WIKIBOOKS RECIPES ONLY)
- Format: Object with image attribution, license, and original filename
- Structure: `{ "fileName": "string", "author": { "name": "string", "userPageUrl": "string" }, "license": { "code": "string", "shortName": "string", "fullName": "string", "url": "string" }, "wikimediaCommonsUrl": "string" }`
- Rules:
  - `fileName`: Original Wikibooks image filename (from input `image.filename`, e.g., "CookbookTurkeyWrap.jpg")
    - **CRITICAL**: This is the exact filename as saved locally in `scripts/wiki/output/`
    - Used for tracking and verifying image integrity
    - Example: `"CookbookTurkeyWrap.jpg"`, `"Papa_chevos_burrito.jpg"`, `"Spaghetti_alla_Carbonara_(Madrid).JPG"`
  - `author.name`: Image author name (from input `image.author.name`)
  - `author.userPageUrl`: Link to Wikimedia Commons user page (from input `image.author.userPageUrl`)
  - `license.code`: License code (from input `image.license.code`, e.g., "cc-by-3.0")
  - `license.shortName`: License short name (from input `image.license.shortName`, e.g., "CC BY 3.0")
  - `license.fullName`: License full name (from input `image.license.fullName`, e.g., "Creative Commons Attribution 3.0")
  - `license.url`: License URL (from input `image.license.url`)
  - `wikimediaCommonsUrl`: Link to Wikimedia Commons file page (from input `image.url`)
- Example:
```json
{
  "fileName": "Santiago.IMG_9780.JPG",
  "author": { "name": "Ave Maria Mõistlik", "userPageUrl": "https://commons.wikimedia.org/wiki/User:Avjoska" },
  "license": { "code": "cc-by-3.0", "shortName": "CC BY 3.0", "fullName": "Creative Commons Attribution 3.0", "url": "https://creativecommons.org/licenses/by/3.0" },
  "wikimediaCommonsUrl": "https://commons.wikimedia.org/wiki/File:Santiago.IMG_9780.JPG"
}
```
- **CRITICAL**: NO line breaks in URLs. Keep on single line.

### **status**
- Format: Always `"published"`

### **featured & trending**
- Format: Always `false`

### **publishedAt, createdAt, updatedAt**
- Format: ISO 8601 with +03:00 timezone
- Rule: Use current date/time
- Example: `"2025-10-27T12:00:00+03:00"`

---

## ✅ QUALITY CHECKLIST

Before outputting JSON, verify:
- [ ] All text is in Lithuanian (translated and natural-sounding)
- [ ] Instructions are rewritten for uniqueness
- [ ] Image dimensions match actual image size
- [ ] Nutrition values are calculated or estimated
- [ ] Category paths use actual slugs from the list
- [ ] All required fields are present
- [ ] JSON is valid and properly formatted
- [ ] No Lithuanian characters in slug
- [ ] All timestamps have +03:00 timezone or Z suffix
- [ ] **NO line breaks in URLs** - ALL URLs must be on single lines:
  - canonicalUrl
  - image.src
  - author.profileUrl
  - originalSource.url
  - originalSource.licenseUrl
  - originalSource.contributorsUrl
  - originalImage.author.userPageUrl
  - originalImage.license.url
  - originalImage.wikimediaCommonsUrl
- [ ] **NO units in nutrition values** (only numbers as strings)
- [ ] **NO language field** (do NOT include it - MongoDB will reject it)
- [ ] **secondaryCategories use ONLY valid slugs** from the provided list
- [ ] **All JSON on single lines** (no line breaks in string values)
- [ ] **author.name** = Wikibooks creator name (NOT "ragaujam.lt")
- [ ] **author.profileUrl** = Link to Wikibooks user page (NOT author.url)
- [ ] **originalSource** = Complete Wikibooks metadata (platform, url, pageTitle, license, licenseUrl, datePublished, extractedAt, contributorsUrl, originalCreator)
- [ ] **originalSource.originalCreator** = Wikibooks recipe creator (name and userPageUrl from input `source.originalCreator`)
- [ ] **originalImage** = Complete image attribution (fileName, author, license, wikimediaCommonsUrl)
- [ ] **originalImage.fileName** = Original Wikibooks image filename (from input `image.filename`, e.g., "CookbookTurkeyWrap.jpg")
- [ ] **datePublished in originalSource** = Original publication date on Wikibooks (ISO 8601 format)
- [ ] **seo.nutrition has ONLY 4 fields**: calories, proteinContent, fatContent, fiberContent
  - ❌ DO NOT include: carbohydrateContent, sugarContent, sodiumContent
- [ ] **seo.focusKeyword** - DO NOT include this field (not in MongoDB schema)
- [ ] **notes array structure** - Each note has ONLY 2 fields: text and priority
  - ❌ DO NOT duplicate priority field
  - ✅ Correct: `{ "text": { "lt": "..." }, "priority": 1 }`
  - ❌ Wrong: `{ "text": { "lt": "..." }, "priority": 1 }, "priority": 1`

---

## 🚀 READY TO USE

Copy this prompt, paste your Wikibooks JSON, and ChatGPT will output valid MongoDB JSON!


