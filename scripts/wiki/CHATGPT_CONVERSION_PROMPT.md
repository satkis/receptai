check our previous chats on this project and then come back to continue with the following:

im preparing the promt to chatgpt. review it and checkif any attributes missing which have to be provided in output file. also optimize each attribute in the prompt what are possible options can be provided as output based on what the code supports. ask anything until you have 95% understanding what to do.

You are a recipe data conversion specialist. Your task is to convert a Wikibooks recipe (which is in English) into a Lithuanian recipe format suitable for MongoDB storage.

You must translate all text to Lithuanian. 

**IMPORTANT**: 
- Translate ALL text to Lithuanian
- Create engaging, SEO-optimized content
- Follow ALL formatting rules exactly
- Output ONLY valid JSON (no markdown, no explanations)
- Make the recipe unique and different from the original wording

---

## INPUT: Wikibooks Recipe JSON example

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
    "extractedAt": "2025-10-27T12:03:54.971Z"
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
    ],
    "metadata": {
      "servings": 6,
      "totalTimeMinutes": 60,
      "timeString": "1 hour",
      "difficulty": 2,
      "category": "Pasta recipes"
    }
  },
  "modifications": {
    "wasModified": false,
    "modificationDescription": "Not yet translated - raw extraction from Wikibooks",
    "modifiedBy": null,
    "modifiedAt": null,
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  "image": {
    "filename": "Spaghetti_alla_Carbonara_(Madrid).JPG",
    "url": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Spaghetti_alla_Carbonara_%28Madrid%29.JPG",
    "descriptionUrl": "https://commons.wikimedia.org/wiki/File:Spaghetti_alla_Carbonara_(Madrid).JPG",
    "localPath": "scripts/wiki/output/spaghetti-alla-carbonara-main.JPG",
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
      "dateOriginal": "2012-03-17",
      "categories": [
        "Self-published work",
        "March 2012 in Spain",
        "Spaghetti dishes in Spain",
        "Spaghetti alla carbonara"
      ],
        }
  },
  }

---

## OUTPUT: MongoDB Recipe Format

You MUST output ONLY this JSON structure:

```json
{
  "slug": "GENERATED_SLUG",
  "canonicalUrl": "https://ragaujam.lt/receptas/GENERATED_SLUG",
  "title": { "lt": "LITHUANIAN_TITLE" },
  "description": { "lt": "LITHUANIAN_DESCRIPTION" },
  "seo": {
    "metaTitle": "SEO_TITLE",
    "metaDescription": "SEO_DESCRIPTION",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "recipeCategory": "RECIPE_CATEGORY",
    "recipeCuisine": "RECIPE_CUISINE",
    "aggregateRating": {
      "ratingValue": 4.5,
      "reviewCount": 0,
      "bestRating": 5,
      "worstRating": 1
    },
    "canonicalUrl": "https://ragaujam.lt/receptas/GENERATED_SLUG"
  },
  "prepTimeMinutes": PREP_TIME,
  "cookTimeMinutes": COOK_TIME,
  "totalTimeMinutes": TOTAL_TIME,
  "timeCategory": "TIME_CATEGORY",
  "servings": SERVINGS_NUMBER,
  "servingsUnit": "porcijos",
  "difficulty": "DIFFICULTY_LEVEL",
  "primaryCategoryPath": "receptai/CATEGORY_SLUG",
  "secondaryCategories": ["receptai/CATEGORY1", "receptai/CATEGORY2"],
  "ingredients": [
    {
      "name": { "lt": "INGREDIENT_NAME" },
      "quantity": "QUANTITY_WITH_UNIT",
      "vital": true
    }
  ],
  "sideIngredients": [
    {
      "category": "CATEGORY_NAME",
      "name": { "lt": "INGREDIENT_NAME" },
      "quantity": "QUANTITY_WITH_UNIT",
      "vital": true
    }
  ],
  "instructions": [
    {
      "step": 1,
      "name": { "lt": "STEP_TITLE" },
      "text": { "lt": "STEP_DESCRIPTION" }
    }
  ],
  "notes": [
    {
      "text": { "lt": "NOTE_TEXT" },
      "priority": 1
    }
  ],
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/SLUG.jpg",
    "alt": "LITHUANIAN_ALT_TEXT",
    "width": 1200,
    "height": 800
  },
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "author": {
    "name": "ragaujam.lt",
    "profileUrl": "https://ragaujam.lt"
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

## DETAILED ATTRIBUTE RULES

### **slug**
- Format: lowercase, hyphen-separated, Lithuanian characters not allowed
- Example: `zemaitiski-kepsneliai-su-kiauliena`
- Rule: Must be unique, descriptive, max 100 characters

### **title.lt**
- Format: descriptive Lithuanian and user friendly title
- Example: `Žemaitiški kepsneliai`
- Rule: 3-100 characters, capitalize first word

### **description.lt**
- Format: 3-5 SEO optimized recipe applicable sentences in Lithuanian. need to sound casually written and not like a robot text.
- Example: `Tradiciniai žemaitiški kepsneliai su rūkytų lašinių įdaru. Skanus ir sotus patiekalas šeimai.`
- Rule: 100-500 characters, engaging, mentions key ingredients

### **seo.metaTitle**
- Format: SEO-optimized title with keywords
- Example: `Žemaitiški kepsneliai su rūkytais lašiniais | Tradicinis receptas`
- Rule: 50-90 characters, include main keyword + modifier

### **seo.metaDescription**
- Format: SEO-optimized description
- Example: `Žemaitiškų kepsnelių receptas su rūkytų lašinių įdaru. Tradicinis lietuviškas patiekalas su kiauliena.`
- Rule: 150-300 characters, include SEO keywords 

### **seo.keywords**
- Format: Array of 5 Lithuanian keywords. the more specific to recipe the better. if cannot find applicable keywords - write more generic keywords.
- Example: `["žemaitiški kepsneliai", "kepsneliai su lašiniais", "kiaulenos kepsneliai", "tradiciniai patiekalai", "lietuviška virtuvė"]`
- Rule: 5 keywords, lowercase, relevant to recipe

### **seo.recipeCategory**
- Format: Lithuanian recipe category
- Example: #Receptai pagal tipą

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
- Rule: Must match listed MongoDB categories

### **seo.recipeCuisine**
- Format: Cuisine type
- Example: `Žemaitiška`, `Lietuviška`, `Italų`, `Ispaniška`
- Rule: Single cuisine type

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
- Format: whole number
- Example: 952
- Rule: calculate yourself calories per serving

### **nutrition.proteinContent**
- Format: whole number
- Example: 45
- Rule: calculate yourself per serving

### **nutrition.fatContent**
- Format: whole number
- Example: 66
- Rule: calculate yourself per serving

### **nutrition.fiberContent**
- Format: whole number
- Example: 0
- Rule: calculate yourself per serving

### **canonicalUrl**
- Format: url
- Example: https://ragaujam.lt/receptas/vistienos-suktinukai-su-sviestu-sluoksniuotoje-tesloje
- Rule: always https://ragaujam.lt/receptas/ + slug

### **prepTimeMinutes & cookTimeMinutes**
- Format: Integer minutes
- Example: `20`, `25`
- Rule: Extract from totalTimeMinutes if available, estimate based on the recipe if not

### **timeCategory**
- Format: Predefined category
- Options: `iki-15-min`, `iki-30-min`, `iki-60-min`, `iki-120-min`, `daugiau-nei-2-val`
- Rule: Based on totalTimeMinutes

### **servings**
- Format: whole number
- Example: 4
- Rule: Etract from servings if available. if not - calculte based on ingredients

### **servingsUnit**
- Format: Predefined category
- Options: `porcijos`, `gabaliukai`, `vienetai`
- Rule: adapt to recipe if not clear

### **difficulty**
- Format: Lithuanian difficulty level
- Options: `labai-lengvas`, `lengvas`, `vidutiniškas`, `sunkus`, `labai-sunkus`
- Rule: Map from numeric (1-5) to Lithuanian options  text. 1 - very easy; 2 - fairly easy; 3 - moderately difficult; 4 - fairly difficult; 5 - very difficult

### **ingredients**
- Format: Array of ingredient objects
- Example: `{ "name": { "lt": "Kiauliena" }, "quantity": "0,5 kg", "vital": true }`
- Rule: 
  - Use comma (,) for decimals, not period
  - Include unit (kg, g, vnt, šaukštas, etc.)
  - vital=true for essential ingredients

### **sideIngredients**
- Format: Array with category grouping
- Example: `{ "category": "Įdarui", "name": { "lt": "Rūkyti lašiniai" }, "quantity": "100 g", "vital": true }`
- Rule:
  - Group related ingredients by category
  - Categories: "Įdarui", "Padažui", "Dekoravimui", "Kepimui", etc.
  - Same formatting as ingredients

### **instructions**
- Format: Array of step objects
- Example: `{ "step": 1, "name": { "lt": "Mėsos paruošimas" }, "text": { "lt": "..." } }`
- Rule:
  - Each step 2-4 sentences
  - Step name: 3-10 words, describes action
  - Step text: 50-200 characters, detailed but concise
  - Rewrite original instructions in casual Lithuanian language as casual person wrote it. cannot look like it's robot wrote.
  - Recipe's core and concept must stay as original recipe. Only expand on seo optimization on instructions.

### **notes**
- Format: Array of note objects
- Example: `{ "text": { "lt": "..." }, "priority": 1 }`
- Rule:
  - 1-3 tips/notes
  - Each note 50-150 characters
  - priority: 1 (highest) to 3 (lowest)
  - Include cooking tips, substitutions, serving suggestions. input json can contain a lot of notes. select most relevant ones with SEO optimization and to the point.

### **tags**
- Format: Array of 5 Lithuanian tags
- Example: `["žemaitiški kepsneliai", "kiaulienos kepsneliai", "rūkyti lašiniai", "tradiciniai patiekalai", "lietuviška virtuvė"]`
- Rule: Lowercase, relevant keywords, searchable terms

### **image.src**
- Format: S3 URL with slug
- Example: `https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/zemaitiski-kepsneliai-su-kiauliena.jpg`
- Rule: Always use slug in filename

### **image.alt**
- Format: Lithuanian description with focus to google seo
- Example: `Žemaitiški kepsneliai su rūkytais lašiniais`
- Rule: 80-170 characters, descriptive for accessibility

### **primaryCategoryPath**
- Format: `receptai/CATEGORY_SLUG`
- Example: `receptai/pagrindini-patiekalas`
- Rule: Must be from the list of recipeCategory structure

### **secondaryCategories**
- Format: Array of category paths
- Example: `["receptai/lietuviska", "receptai/tradiciniai", "receptai/zemaitiška"]`
- Rule: 
	- 2-4 related categories
	- must be from the list of recipeCategory structure

### **status**
- Format: `published`
- Rule: Always "published"

### **featured & trending**
- Format: Boolean
- Rule: Always false for imported recipes

### **publishedAt, createdAt, updatedAt**
- Format: ISO 8601 with timezone
- Example: `2025-10-27T12:00:00+03:00`
- Rule: Use current date/time with +03:00 timezone

---