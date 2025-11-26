# 🚀 Quick Start - Wikibooks Scrapers

---

## 📚 Scrape Recipes Starting with Letter B

```bash
npm run wikibooks:scrape-category -- --letter B
```

**Output**: `scripts/wiki/wikibooks-recipes-letter-B.txt`  
**Contains**: 68 recipe URLs (one per line)  
**Time**: ~2 seconds

---

## 📝 Example Output File

```
https://en.wikibooks.org/wiki/Cookbook:Baba_Ganoush
https://en.wikibooks.org/wiki/Cookbook:Baguette
https://en.wikibooks.org/wiki/Cookbook:Baingan_Bartha_(South_Indian_Eggplant_with_Coconut_and_Chili)_I
https://en.wikibooks.org/wiki/Cookbook:Baked_Potatoes
https://en.wikibooks.org/wiki/Cookbook:Baked_Ziti
... (63 more URLs)
```

---

## 🔤 Scrape Other Letters

```bash
# Letter A
npm run wikibooks:scrape-category -- --letter A

# Letter C
npm run wikibooks:scrape-category -- --letter C

# Letter Z
npm run wikibooks:scrape-category -- --letter Z
```

---

## 🎯 Use with Existing Workflow

```bash
# Step 1: Scrape recipes by letter
npm run wikibooks:scrape-category -- --letter B

# Step 2: Extract recipes from Wikibooks
npm run wiki:extract

# Step 3: Convert with ChatGPT
npm run convert-and-upload

# Step 4: Upload to MongoDB
npm run upload-gpt-to-mongodb

# Step 5: Process images and upload to S3
npm run image-prep-and-load
```

---

## 💾 Custom Output File

```bash
npm run wikibooks:scrape-category -- --letter B --output my-recipes.txt
```

---

## 📊 All Available Letters

A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z

---

## ✅ Verify It Works

```bash
# Run scraper
npm run wikibooks:scrape-category -- --letter B

# Check output file
cat scripts/wiki/wikibooks-recipes-letter-B.txt | head -5

# Should show first 5 URLs
```

---

## 📚 Full Documentation

- **Category Scraper**: `scripts/WIKIBOOKS_CATEGORY_SCRAPER_GUIDE.md`
- **Image Scraper**: `scripts/WIKIBOOKS_IMAGE_SCRAPER_GUIDE.md`
- **Summary**: `scripts/WIKIBOOKS_SCRAPER_SUMMARY.md`

---

**Ready to scrape!** 🎉


