
You are a recipe data conversion specialist. Your task is to convert a Wikibooks recipe from English into a Lithuanian recipe format suitable for MongoDB storage.

⚠️ **CRITICAL INSTRUCTION**: You MUST respond with ONLY valid JSON. No explanations, no markdown, no text before or after. Just the JSON object.

Start your response with `{` and end with `}`. Nothing else.

---

## 📥 INPUT RECIPE JSON

This is JSON object extracted from Wikibooks:

```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Aadun_(Nigerian_Corn_Flour_with_Palm_Oil)",
    "pageTitle": "Cookbook:Aadun_(Nigerian_Corn_Flour_with_Palm_Oil)",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "originalCreator": {
      "name": "Tesleemah",
      "userPageUrl": "https://en.wikibooks.org/wiki/User:Tesleemah"
    },
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3AAadun_(Nigerian_Corn_Flour_with_Palm_Oil)&action=history",
    "extractedAt": "2025-11-17T19:23:55.648Z"
  },
  "recipe": {
    "title": "Cookbook:Aadun (Nigerian Corn Flour with Palm Oil)",
    "slug": "aadun-nigerian-corn-flour-with-palm-oil",
    "description": "Aadun is a snack common amongst Yoruba-speaking people of Nigeria. There are two types of aadun: one made from pure corn flour and one made from corn flour mixed with palm oil and salt. This recipe is for the latter. The Kogi people add ground beans to modify the taste.",
    "ingredients": [
      "1 cup corn flour",
      "¼ cup palm oil",
      "½ teaspoon chile pepper",
      "½ teaspoon salt"
    ],
    "instructions": [
      "Combine the corn flour, palm oil, chili pepper, and salt in a bowl.",
      "Leave the mixture to sit for 2–3 hours.",
      "Shape the mixture as desired, and serve with drinks."
    ],
    "notes": [],
    "servings": null,
    "totalTimeMinutes": null,
    "difficulty": null,
    "category": null,
    "categories": [
      "Yoruba recipes",
      "Recipes using chile",
      "Recipes using corn flour",
      "Recipes using palm oil",
      "Recipes using salt"
    ]
  },
  "image": {
    "filename": "Àádùn2.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/a/aa/%C3%80%C3%A1d%C3%B9n2.jpg",
    "descriptionUrl": "https://commons.wikimedia.org/wiki/File:%C3%80%C3%A1d%C3%B9n2.jpg",
    "localPath": "scripts/wiki/output/Àádùn2.jpg",
    "dimensions": {
      "width": 1920,
      "height": 1920
    },
    "fileSize": 840506,
    "license": {
      "code": "cc-by-sa-4.0",
      "shortName": "CC BY-SA 4.0",
      "fullName": "Creative Commons Attribution-Share Alike 4.0",
      "url": "https://creativecommons.org/licenses/by-sa/4.0",
      "attributionRequired": true,
      "shareAlike": true,
      "copyrighted": true,
      "restrictions": ""
    },
    "author": {
      "name": "Gbolahan Adebayo",
      "userPageUrl": "https://commons.wikimedia.org/wiki/User:Sheys%20Ditty"
    },
    "metadata": {
      "description": "This picture is for the article creation of Àádùn in Nigeria",
      "categories": [
        "Taken with Tecno WX3 Pro",
        "Cuisine of Nigeria",
        "Self-published work"
      ]
    }
  },
  "originalImage": {
    "fileName": "Àádùn2.jpg"
  }
}
```

---

## 📤 OUTPUT RECIPE JSON EXAMPLE

Convert to this MongoDB recipe schema:

```json example from another recipe
{
  "slug": "tradiciniai-barsciai-su-burokeliais",
  "canonicalUrl": "https://ragaujam.lt/receptas/tradiciniai-barsciai-su-burokeliais",
  "title": {
    "lt": "Tradiciniai barščiai su burokėliais ir daržovėmis"
  },
  "description": {
    "lt": "Barščiai – tai soti ir maistinga burokėlių daržovių sriuba, kilusi iš Ukrainos, bet tapusi daugelio Rytų ir Centrinės Europos šalių kulinarijos paveldo dalimi. Šis receptas padės jums paruošti tirštus ir ryškiai raudonus barščius su bulvėmis, kopūstais ir morkomis. Patiekite karštus su šaukštu grietinės ar jogurto, pabarstytus krapais – tai tikras jaukumas."
  },
  "seo": {
    "metaTitle": "Tradiciniai barščiai (Borscht) | Receptas su burokėliais ir kopūstais",
    "metaDescription": "Autentiškas barščių receptas, gaminamas su burokėliais, bulvėmis, morkomis ir kopūstais. Tradicinis Rytų Europos patiekalas, puikiai tinkantis sotiems pietums ar vakarienei.",
    "keywords": [
      "barščiai",
      "burokėlių sriuba",
      "vegetariška sriuba",
      "rytų europos virtuvė",
      "sotūs pietūs"
    ],
    "recipeCategory": "Sriubos",
    "recipeCuisine": "Ukrainiečių",
    "nutrition": {
      "calories": 250,
      "proteinContent": "7g",
      "fatContent": "12g",
      "fiberContent": "8g"
    }
  },
  "aggregateRating": {
    "ratingValue": 4.9,
    "reviewCount": 14,
    "bestRating": 5,
    "worstRating": 1
  },
  "prepTimeMinutes": 20,
  "cookTimeMinutes": 55,
  "totalTimeMinutes": 75,
  "timeCategory": "iki-120-min",
  "servings": 6,
  "servingsUnit": "porcijos",
  "difficulty": "lengvas",
  "primaryCategoryPath": "receptai/Sriubos",
  "secondaryCategories": [
    "receptai/Daržovės",
    "receptai/Šeimai",
    "receptai/Pietūs"
  ],
  "ingredients": [
    {
      "name": {
        "lt": "Plonai supjaustytos bulvės"
      },
      "quantity": "1.5 puodelio (apie 3 mažos)",
      "vital": true
    },
    {
      "name": {
        "lt": "Plonai supjaustyti burokėliai"
      },
      "quantity": "1 puodelis",
      "vital": true
    },
    {
      "name": {
        "lt": "Vanduo"
      },
      "quantity": "4 puodeliai",
      "vital": true
    },
    {
      "name": {
        "lt": "Sviestas"
      },
      "quantity": "1-2 šaukštai",
      "vital": true
    },
    {
      "name": {
        "lt": "Smulkintas svogūnas"
      },
      "quantity": "1.5 puodelio (apie ⅓ didelio)",
      "vital": true
    },
    {
      "name": {
        "lt": "Druska"
      },
      "quantity": "1.5 arb. šaukštelio",
      "vital": true
    },
    {
      "name": {
        "lt": "Smulkintas saliero stiebas"
      },
      "quantity": "1 vnt.",
      "vital": true
    },
    {
      "name": {
        "lt": "Smulkinta vidutinio dydžio morka"
      },
      "quantity": "1 vnt.",
      "vital": true
    },
    {
      "name": {
        "lt": "Suskaldytas (smulkintas) kopūstas"
      },
      "quantity": "3-4 puodeliai (apie ⅓ didelio)",
      "vital": true
    },
    {
      "name": {
        "lt": "Šviežiai malti juodieji pipirai"
      },
      "quantity": "Šiek tiek",
      "vital": true
    },
    {
      "name": {
        "lt": "Džiovinti krapai"
      },
      "quantity": "1 arb. šaukštelis",
      "vital": true
    },
    {
      "name": {
        "lt": "Obuolių sidro actas"
      },
      "quantity": "1-2 šaukštai",
      "vital": true
    },
    {
      "name": {
        "lt": "Rudas cukrus arba medus"
      },
      "quantity": "1-2 šaukštai",
      "vital": true
    },
    {
      "name": {
        "lt": "Pomidorų tyrė arba pomidorų pasta"
      },
      "quantity": "1 puodelis tyrės arba 0.25-0.5 puodelio pastos",
      "vital": true
    }
  ],
  "sideIngredients": [
    {
      "category": "Patiekimui",
      "name": {
        "lt": "Grietinė arba jogurtas"
      },
      "quantity": "Pagal skonį",
      "vital": false
    },
    {
      "category": "Patiekimui",
      "name": {
        "lt": "Švieži krapai"
      },
      "quantity": "Pagal skonį",
      "vital": false
    }
  ],
  "instructions": [
    {
      "step": 1,
      "name": {
        "lt": "Bulvių ir burokėlių virimas"
      },
      "text": {
        "lt": "Sudėkite bulves, burokėlius ir vandenį į vidutinio dydžio puodą. Uždenkite ir virkite ant vidutinės ugnies, kol daržovės suminkštės (tai užtruks apie 20–30 minučių). Kol tai verda, tęskite toliau su kitomis daržovėmis."
      }
    },
    {
      "step": 2,
      "name": {
        "lt": "Svogūnų pakepinimas"
      },
      "text": {
        "lt": "Dideliame sriubos puode (galite naudoti ir ketaus puodą) ištirpinkite sviestą. Sudėkite smulkintus svogūnus ir druską. Kepkite ant vidutinės ugnies, retkarčiais pamaišydami, apie 8–10 minučių, kol svogūnai taps permatomi."
      }
    },
    {
      "step": 3,
      "name": {
        "lt": "Kitų daržovių troškinimas"
      },
      "text": {
        "lt": "Į keptuvę su svogūnais suberkite salierus, morkas ir kopūstus. Supilkite 2 puodelius vandens, kuriame verda bulvės ir burokėliai. Uždenkite ir troškinkite ant vidutinės ugnies maždaug 8–10 minučių, kol daržovės suminkštės."
      }
    },
    {
      "step": 4,
      "name": {
        "lt": "Barščių užbaigimas"
      },
      "text": {
        "lt": "Sudėkite likusius ingredientus (įskaitant išvirusias bulves, burokėlius ir likusį vandenį, kuriame virė). Uždenkite ir virkite ant mažos ugnies dar mažiausiai 15 minučių. Paragaukite ir pakoreguokite prieskonius. Jei sriuba per skysta, leiskite jai virti atidengtame puode arba įdėkite šiek tiek daugiau pomidorų pastos."
      }
    },
    {
      "step": 5,
      "name": {
        "lt": "Patiekimas"
      },
      "text": {
        "lt": "Barščius patiekite karštus. Įpilkite į lėkštes ir ant viršaus uždėkite šaukštą grietinės arba jogurto bei pabarstykite šviežiais krapais. Grietinę galima patiekti ir atskirai, kad kiekvienas galėtų įsidėti pagal savo skonį."
      }
    }
  ],
  "notes": [
    {
      "text": {
        "lt": "Rūgšti terpė yra labai svarbi autentiškam skoniui ir burokėlių spalvos išsaugojimui. Obuolių sidro actą galite pakeisti raugintais kopūstais arba didesniu kiekiu pomidorų."
      },
      "priority": 1
    }
  ],
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/tradiciniai-barsciai-su-burokeliais.jpg",
    "alt": "Tradiciniai raudonieji barščiai, patiekiami dubenyje su grietine ir krapais",
    "width": 1280,
    "height": 960
  },
  "tags": [
    "tradiciniai barščiai",
    "burokėlių sriuba",
    "ukrainietiška virtuvė",
    "vegetariška sriuba",
    "pietūs su sriuba"
  ],
  "author": {
    "name": "Gentgeen",
    "profileUrl": "https://en.wikibooks.org/wiki/User:Gentgeen"
  },
  "originalSource": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Borscht",
    "pageTitle": "Cookbook:Borscht",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "datePublished": null,
    "extractedAt": "2025-11-09T19:07:55+02:00",
    "contributorsUrl": "https://en.wikibooks.org/w/index.php?title=Cookbook%3ABorscht&action=history",
    "originalCreator": {
      "name": "Gentgeen",
      "userPageUrl": "https://en.wikibooks.org/wiki/User:Gentgeen"
    }
  },
  "originalImage": {
    "fileName": "Borscht.jpg",
    "author": {
      "name": "No machine-readable author provided. Karmosin~commonswiki assumed (based on copyright claims).",
      "userPageUrl": "https://commons.wikimedia.org/wiki/User:Karmosin~commonswiki"
    },
    "license": {
      "code": "cc-by-sa-3.0",
      "shortName": "CC BY-SA 3.0",
      "fullName": "Creative Commons Attribution-Share Alike 3.0",
      "url": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    "wikimediaCommonsUrl": "https://upload.wikimedia.org/wikipedia/commons/5/50/Borscht.jpg"
  },
  "status": "published",
  "featured": false,
  "trending": false,
  "publishedAt": "2025-11-09T19:07:55+02:00",
  "createdAt": "2025-11-09T19:07:55+02:00",
  "updatedAt": "2025-11-09T19:07:55+02:00"
}

```

---

## 📋 DETAILED ATTRIBUTE RULES

### **slug**
- Format: Lithuanian characters not allowed, lowercase, hyphen-separated
- Example: `zemaitiski-kepsneliai-su-kiauliena`
- Rule: Lithuanian characters not allowed, Must be unique and SEO expanded text, descriptive, max 200 characters, convert to URL-safe format

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
- Format: URL-safe category slug (lowercase, no Lithuanian letters, dashes instead of spaces)
- Rule: Must match listed MongoDB categories. Do not create new categories. Use ONLY the slugs provided below.
- Example: `juros-gerybes` (NOT "Jūros gėrybės")
- Conversion rule: Replace Lithuanian letters (ą→a, č→c, ę→e, ė→e, į→i, š→s, ų→u, ū→u, ž→z), convert to lowercase, replace spaces with dashes

**ALLOWED CATEGORY SLUGS (Use these EXACTLY):**

garnyrai
kepsniai
pietus
pusryciai
salotos
sriubos
seimai
trokiniai
uzkandziai
vaikams
vakariene
desertai

avokadas
bulves
darzoves
duona
elniena
kiauliena
grybai
jautiena
juros-gerybes
kalakutiena
kiauliena
kiausini
lesiai
makaronai
miltiniai
pienas-ir-pieno-produktai
pupeles
ryziai
suris
tofu
triusena
uogos
vaisiai
varske
vistiena
zuvis
zveriena

ant-grilio
ant-lauzo
be-kepimo
duonkepeje
garu-puode
greitpuodyje
kazane
kepta-keptuveje
kepta-orkaiteje
oro-gruzdintuveje
zaliavalgiam

gimtadienio-stalui
helovinui
kaledos
kucios
naujuju-metu-stalui
paskutines-minutes
seimos-pietums
vaiku-gimtadieniui
vasarai
velykoms
ziemai

be-glitimo
be-kiausinio
be-laktozes
be-mesos
be-pieno-produktu
be-riebalu
pietus-i-darba


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

