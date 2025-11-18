# Wikibooks Recipe Conversion Guide

## 🎯 Complete Workflow

Convert Wikibooks recipes to MongoDB format using ChatGPT API.

---

## 📋 Step-by-Step Process

### Step 1: Extract Wikibooks Recipe
```bash
npm run wiki:extract
```

This creates JSON files in: `scripts/wiki/output/`
- Files end with `-wikibooks-raw.json`

### Step 2: Convert to MongoDB Format
```bash
node scripts/wiki/convert-wikibooks-to-recipe.js scripts/wiki/output/recipe-name-wikibooks-raw.json
```

**What happens:**
1. Reads the Wikibooks JSON
2. Reads the prompt template from `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md`
3. Sends to ChatGPT API
4. Extracts JSON response
5. Saves to `scripts/wiki/output/chatGPT/{slug}.json`

### Step 3: Import to MongoDB
```bash
# Copy the JSON from scripts/wiki/output/chatGPT/{slug}.json
# Paste into MongoDB Compass
# Or use MongoDB import command
```

---

## 🚀 Quick Example

### Example: Convert Aadun Recipe

```bash
node scripts/wiki/convert-wikibooks-to-recipe.js scripts/wiki/output/aadun-nigerian-corn-flour-with-palm-oil-wikibooks-raw.json
```

**Output:**
```
📖 Reading input file...
✅ Input file loaded

📋 Reading prompt template...
✅ Prompt template loaded

📤 Sending to ChatGPT...
✅ Response received from ChatGPT
   Tokens used: 10595

🔍 Extracting JSON from response...
✅ JSON extracted and parsed
   Slug: aadun-nigerijos-kukuruzu-miltai-su-palmiu-aliejumi

✅ Recipe saved to: scripts\wiki\output\chatGPT\aadun-nigerijos-kukuruzu-miltai-su-palmiu-aliejumi.json

📊 Recipe Summary:
   Title: Aadun - Nigerijos kukurūzų miltai su palmių aliejumi
   Slug: aadun-nigerijos-kukuruzu-miltai-su-palmiu-aliejumi
   Servings: 4
   Prep time: 10 min
   Cook time: 0 min
   Total time: 170 min
   Difficulty: labai lengvas
   Ingredients: 4
   Instructions: 3

✅ Ready to import to MongoDB!
```

---

## 📁 File Locations

| Step | Input | Output |
|------|-------|--------|
| 1. Extract | Wikibooks URL | `scripts/wiki/output/{slug}-wikibooks-raw.json` |
| 2. Convert | `{slug}-wikibooks-raw.json` | `scripts/wiki/output/chatGPT/{slug}.json` |
| 3. Import | `chatGPT/{slug}.json` | MongoDB `recipes_new` collection |

---

## 🔧 How It Works

### Input: Wikibooks JSON
```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:Aadun",
    "originalCreator": { "name": "Tesleemah" }
  },
  "recipe": {
    "title": "Aadun (Nigerian Corn Flour with Palm Oil)",
    "ingredients": ["1 cup corn flour", "¼ cup palm oil"],
    "instructions": ["Combine ingredients", "Leave to sit"]
  }
}
```

### Process
1. **Read prompt template** from `CHAT_GPT_PROMPT_TEMPLATE.md`
2. **Send to ChatGPT** with system prompt + Wikibooks JSON
3. **Extract JSON** from response
4. **Save with slug** as filename

### Output: MongoDB Recipe
```json
{
  "slug": "aadun-nigerijos-kukuruzu-miltai-su-palmiu-aliejumi",
  "title": { "lt": "Aadun - Nigerijos kukurūzų miltai su palmių aliejumi" },
  "description": { "lt": "Aadun yra užkandis..." },
  "seo": { ... },
  "ingredients": [ ... ],
  "instructions": [ ... ]
}
```

---

## 📝 Prompt Template

Located at: `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md`

**Key features:**
- Detailed MongoDB schema rules
- Lithuanian translation guidelines
- SEO optimization instructions
- Nutrition calculation rules
- Category mapping
- Image handling
- Author attribution

**Critical rules:**
- ✅ Response must be ONLY JSON
- ✅ No markdown, no explanations
- ✅ All text in Lithuanian
- ✅ Slug format: lowercase, hyphens, no special chars
- ✅ Nutrition: only 4 fields allowed
- ✅ Categories: must match predefined list
- ✅ URLs: no line breaks, single line only

---

## 🎯 Batch Processing

Convert multiple recipes:

```bash
# Convert all recipes in output folder
for file in scripts/wiki/output/*-wikibooks-raw.json; do
  echo "Converting: $file"
  node scripts/wiki/convert-wikibooks-to-recipe.js "$file"
done
```

---

## 💰 Cost Tracking

Each conversion costs approximately:
- **Input tokens**: 100-200 (Wikibooks JSON)
- **Output tokens**: 1000-2000 (MongoDB recipe)
- **Total**: ~1200-2200 tokens per recipe
- **Cost**: ~$0.05-0.10 per recipe

The script displays token usage for each conversion.

---

## ❌ Troubleshooting

### Error: "File not found"
```bash
❌ WRONG:
node scripts/wiki/convert-wikibooks-to-recipe.js recipe.json

✅ CORRECT:
node scripts/wiki/convert-wikibooks-to-recipe.js scripts/wiki/output/recipe-wikibooks-raw.json
```

### Error: "No JSON found in response"
- ChatGPT didn't return valid JSON
- Check prompt template is correct
- Try again (API might be rate limited)

### Error: "OPENAI_API_KEY not configured"
Make sure `.env.local` has:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Output file not created
Check directory exists:
```bash
mkdir -p scripts/wiki/output/chatGPT
```

---

## ✅ Verification

After conversion, verify the JSON:

```bash
# Check file exists
ls scripts/wiki/output/chatGPT/

# View the JSON
cat scripts/wiki/output/chatGPT/{slug}.json

# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('scripts/wiki/output/chatGPT/{slug}.json')))"
```

---

## 🔗 Related Files

- **Converter script**: `scripts/wiki/convert-wikibooks-to-recipe.js`
- **Prompt template**: `scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md`
- **Extractor script**: `scripts/wiki/extract-wikibooks-recipe.js`
- **ChatGPT docs**: `docs/CHATGPT_API_SIMPLE_EXAMPLES.md`

---

## 📊 Example Output

**Input file**: `aadun-nigerian-corn-flour-with-palm-oil-wikibooks-raw.json`

**Output file**: `aadun-nigerijos-kukuruzu-miltai-su-palmiu-aliejumi.json`

**Recipe details:**
- Title: Aadun - Nigerijos kukurūzų miltai su palmių aliejumi
- Servings: 4
- Prep time: 10 min
- Difficulty: labai lengvas
- Ingredients: 4
- Instructions: 3
- SEO keywords: aadun, nigerijos užkandis, kukurūzų miltai, palmių aliejus, jorubų virtuvė

---

## 🚀 Next Steps

1. ✅ Extract Wikibooks recipe
2. ✅ Convert to MongoDB format
3. ⏭️ Import to MongoDB
4. ⏭️ Verify on website
5. ⏭️ Deploy to production

---

**Status**: ✅ Ready to use!

**Tested with**: Aadun (Nigerian Corn Flour with Palm Oil)

**Result**: ✅ Successfully converted to Lithuanian MongoDB recipe format

