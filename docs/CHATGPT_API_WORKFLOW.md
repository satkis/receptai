# Complete ChatGPT API Workflow

## 🎯 End-to-End Recipe Processing

### Phase 1: Setup (One-time)

```bash
# 1. Install OpenAI SDK
npm install openai

# 2. Add API key to .env.local
echo "OPENAI_API_KEY=sk-proj-xxxxx" >> .env.local

# 3. Verify connection
node scripts/wiki/test-openai-connection.js
```

### Phase 2: Extract Wikibooks Recipe

```bash
# 1. Add Wikibooks URLs to file
echo "https://en.wikibooks.org/wiki/Cookbook:Recipe_Name" >> scripts/wiki/wikibooks-urls.txt

# 2. Extract recipe data
npm run wiki:extract

# Output: scripts/wiki/output/recipe-slug-wikibooks.json
```

### Phase 3: Convert with ChatGPT

```bash
# 1. Convert to MongoDB format
npm run wiki:convert scripts/wiki/output/recipe-slug-wikibooks.json

# Output: scripts/wiki/output/recipe-slug-converted.json
# Inserted: MongoDB recipes_new collection
```

### Phase 4: Verify & Publish

```bash
# 1. Check MongoDB Compass
# - Open: https://cloud.mongodb.com
# - Database: receptai
# - Collection: recipes_new
# - Find: recipe by slug

# 2. Verify on website
# - Visit: https://ragaujam.lt/receptas/recipe-slug
# - Check: All fields display correctly
# - Check: Images load
# - Check: SEO meta tags present
```

---

## 📋 Detailed Step-by-Step

### Step 1: Prepare Wikibooks URLs

**File**: `scripts/wiki/wikibooks-urls.txt`

```
# Add one URL per line
https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous
https://en.wikibooks.org/wiki/Cookbook:Baked_Beans
https://en.wikibooks.org/wiki/Cookbook:Carrot_Cake

# Lines starting with # are ignored
# Empty lines are ignored
```

### Step 2: Extract Wikibooks Data

```bash
npm run wiki:extract
```

**What happens**:
1. Reads first URL from `wikibooks-urls.txt`
2. Calls MediaWiki API
3. Extracts recipe data (title, ingredients, instructions)
4. Downloads main image
5. Saves JSON to `scripts/wiki/output/`
6. Logs URL to `processed-wikibooks-urls.txt`

**Output file**: `scripts/wiki/output/recipe-slug-wikibooks.json`

```json
{
  "title": "Algerian Couscous",
  "description": "Traditional North African dish...",
  "ingredients": [...],
  "instructions": [...],
  "image": {
    "filename": "Algerian_Couscous.jpg",
    "url": "https://..."
  }
}
```

### Step 3: Convert with ChatGPT

```bash
npm run wiki:convert scripts/wiki/output/recipe-slug-wikibooks.json
```

**What happens**:
1. Reads Wikibooks JSON
2. Loads conversion prompt from `CHATGPT_CONVERSION_PROMPT_FINAL.md`
3. Sends to ChatGPT API
4. Validates response JSON
5. Inserts to MongoDB
6. Saves converted JSON to `output/`

**Output file**: `scripts/wiki/output/recipe-slug-converted.json`

```json
{
  "_id": ObjectId(...),
  "slug": "algerian-couscous",
  "title": { "lt": "Alžirinė kuškus" },
  "description": { "lt": "Tradicinis Šiaurės Afrikos patiekalas..." },
  "ingredients": [
    {
      "name": { "lt": "Kuškus" },
      "quantity": "2 puodeliai",
      "vital": true
    }
  ],
  "instructions": [...],
  "seo": {
    "metaTitle": "Alžirinė kuškus - Ragaujam.lt",
    "metaDescription": "Tradicinis Šiaurės Afrikos receptas...",
    "keywords": ["kuškus", "alžirinė virtuvė"]
  },
  "image": {
    "src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/algerian-couscous.jpg",
    "alt": "Alžirinė kuškus"
  },
  "author": {
    "name": "Wikibooks",
    "profileUrl": "https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous"
  },
  "publishedAt": "2025-11-17T10:00:00Z",
  "createdAt": "2025-11-17T10:00:00Z",
  "updatedAt": "2025-11-17T10:00:00Z"
}
```

### Step 4: Verify in MongoDB

```bash
# Open MongoDB Compass
# Connection: mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai

# Navigate to:
# Database: receptai
# Collection: recipes_new
# Filter: { "slug": "algerian-couscous" }

# Verify fields:
# ✅ slug
# ✅ title.lt (Lithuanian)
# ✅ ingredients with vital flag
# ✅ instructions with steps
# ✅ seo.metaTitle
# ✅ author.name = "Wikibooks"
# ✅ image.src (S3 URL)
```

### Step 5: Verify on Website

```bash
# Visit: https://ragaujam.lt/receptas/algerian-couscous

# Check:
# ✅ Recipe title displays
# ✅ Image loads from S3
# ✅ Ingredients list shows
# ✅ Instructions display
# ✅ Time/servings show
# ✅ Wikibooks disclaimer visible
# ✅ Meta tags in HTML source
```

---

## 🔄 Batch Processing

### Process Multiple Recipes

```bash
# 1. Add multiple URLs
cat >> scripts/wiki/wikibooks-urls.txt << EOF
https://en.wikibooks.org/wiki/Cookbook:Recipe_1
https://en.wikibooks.org/wiki/Cookbook:Recipe_2
https://en.wikibooks.org/wiki/Cookbook:Recipe_3
EOF

# 2. Run batch conversion
npm run wiki:batch-convert

# This will:
# - Extract each recipe
# - Convert with ChatGPT
# - Insert to MongoDB
# - Log results
```

---

## 📊 Monitoring

### Check Processing Status

```bash
# View processed URLs
cat scripts/wiki/processed-wikibooks-urls.txt

# View error logs
ls scripts/wiki/output/logs/

# View converted recipes
ls scripts/wiki/output/*-converted.json

# Check MongoDB count
# In MongoDB Compass:
# db.recipes_new.countDocuments({ "author.name": "Wikibooks" })
```

### Monitor API Costs

```bash
# View API usage log
tail -f logs/api-usage.log

# Calculate daily cost
grep "$(date +%Y-%m-%d)" logs/api-usage.log | awk '{sum+=$NF} END {print "Today: $" sum}'

# Calculate monthly cost
grep "$(date +%Y-%m)" logs/api-usage.log | awk '{sum+=$NF} END {print "Month: $" sum}'
```

---

## ⚠️ Troubleshooting

### Recipe Not Appearing on Website

```bash
# 1. Check MongoDB
# - Verify document exists
# - Check slug is correct
# - Verify status field

# 2. Check image
# - Verify image.src is valid S3 URL
# - Check S3 bucket permissions
# - Verify image file exists

# 3. Check cache
# - Clear browser cache
# - Wait for ISR revalidation (1 hour)
# - Or manually trigger: npm run generate-sitemap
```

### ChatGPT Conversion Failed

```bash
# 1. Check error log
cat scripts/wiki/output/logs/recipe-slug-error.log

# 2. Verify JSON format
node -e "console.log(JSON.parse(require('fs').readFileSync('scripts/wiki/output/recipe-slug-wikibooks.json')))"

# 3. Try manual conversion
# - Copy Wikibooks JSON
# - Go to: https://chat.openai.com
# - Paste prompt + JSON
# - Get output manually
```

### API Rate Limit

```bash
# Add delay between requests
# In batch-convert.js:
const DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds

// Or use queue system
const pQueue = require('p-queue');
const queue = new pQueue({ concurrency: 1, interval: 60000, intervalCap: 3 });
```

---

## 📈 Performance Optimization

### Reduce Costs
- Use `gpt-3.5-turbo` for testing
- Batch similar recipes
- Cache conversion prompts
- Reuse successful conversions

### Speed Up Processing
- Use `gpt-4o` (faster than turbo)
- Parallel processing (with rate limit)
- Optimize prompt length
- Pre-validate JSON

---

## ✅ Checklist

- [ ] OpenAI account created
- [ ] API key in `.env.local`
- [ ] `openai` package installed
- [ ] Wikibooks URLs in `wikibooks-urls.txt`
- [ ] Extract script working
- [ ] ChatGPT conversion working
- [ ] MongoDB insertion working
- [ ] Website displaying recipes
- [ ] Images loading from S3
- [ ] Wikibooks disclaimer showing

---

**Status**: Ready for production use

