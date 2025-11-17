# 📚 Wikibooks Recipe Extractor

Automated tool to extract recipe data from Wikibooks using the MediaWiki API.

## 🚀 Quick Start

### 1. Add Recipe URLs

Edit `wikibooks-urls.txt` and add Wikibooks recipe URLs (one per line):

```
https://en.wikibooks.org/wiki/Cookbook:New_York_Cheesecake
https://en.wikibooks.org/wiki/Cookbook:Chocolate_Chip_Cookies
https://en.wikibooks.org/wiki/Cookbook:Banana_Bread
```

### 2. Run the Extractor

```bash
node scripts/wiki/extract-wikibooks-recipe.js
```

Or use the npm script:

```bash
npm run wiki:extract
```

### 3. Check Output

The script will:
- ✅ Process the **first URL** from `wikibooks-urls.txt`
- ✅ Extract recipe data (title, ingredients, instructions, contributors)
- ✅ Download the main recipe image
- ✅ Save JSON to `scripts/wiki/output/recipe-name-wikibooks-raw.json`
- ✅ Save image to `scripts/wiki/output/recipe-name-main.jpg`
- ✅ Remove processed URL from `wikibooks-urls.txt`
- ✅ Log to `processed-wikibooks-urls.txt`

---

## 📂 File Structure

```
scripts/wiki/
├── wikibooks-urls.txt              # INPUT: URLs to process
├── processed-wikibooks-urls.txt    # LOG: Completed URLs
├── extract-wikibooks-recipe.js     # Main script
├── README.md                       # This file
└── output/
    ├── new-york-cheesecake-wikibooks-raw.json
    ├── new-york-cheesecake-main.jpg
    ├── chocolate-chip-cookies-wikibooks-raw.json
    └── chocolate-chip-cookies-main.jpg
```

---

## 📄 Output JSON Format

```json
{
  "source": {
    "platform": "Wikibooks",
    "url": "https://en.wikibooks.org/wiki/Cookbook:New_York_Cheesecake",
    "pageTitle": "Cookbook:New York Cheesecake",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "contributors": ["User1", "User2", "User3"],
    "lastModified": "2024-01-15T10:30:00Z",
    "extractedAt": "2025-06-30T12:00:00Z"
  },
  "recipe": {
    "title": "New York Cheesecake",
    "slug": "new-york-cheesecake",
    "ingredients": [
      "2 cups graham cracker crumbs",
      "1/2 cup melted butter",
      "4 packages cream cheese, softened",
      "1 1/2 cups sugar"
    ],
    "instructions": [
      "Preheat oven to 350°F (175°C)",
      "Mix graham cracker crumbs with melted butter",
      "Press into bottom of springform pan",
      "Beat cream cheese until fluffy"
    ]
  },
  "image": {
    "filename": "new-york-cheesecake-main.jpg",
    "localPath": "scripts/wiki/output/new-york-cheesecake-main.jpg",
    "sourceUrl": "https://upload.wikimedia.org/...",
    "width": 1200,
    "height": 800,
    "author": "WikiUser123",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  "rawWikitext": "== Ingredients ==\n* 2 cups [[graham cracker]] crumbs\n..."
}
```

---

## 🔧 Features

### ✅ Automatic Data Extraction
- Recipe title, ingredients, instructions
- Page contributors (for attribution)
- Main recipe image with metadata
- License information (CC BY-SA 4.0)

### ✅ Wikitext Cleanup
- Removes wiki markup `[[links]]`
- Removes templates `{{template}}`
- Cleans bold/italic formatting
- Extracts clean ingredient/instruction lists

### ✅ Image Handling
- Downloads main recipe image
- Extracts image metadata (author, license, dimensions)
- Handles recipes without images (creates `-noImage.json`)

### ✅ File Management
- Removes processed URLs from input file
- Logs completed recipes with timestamps
- Organized output directory structure

---

## ⚠️ Error Handling

### Recipe Not Found
```
❌ EXTRACTION FAILED
💥 Error: Wikibooks API Error: The page you specified doesn't exist
```
**Solution:** Check the URL is correct and the page exists on Wikibooks.

### No Image Available
```
⚠️  No image available
📄 JSON saved: recipe-name-wikibooks-raw-noImage.json
```
**Solution:** This is normal - the recipe will be processed without an image.

### Invalid URL Format
```
❌ Error: wikibooks-urls.txt not found!
📝 Create the file at: scripts/wiki/wikibooks-urls.txt
```
**Solution:** Create the input file and add URLs.

---

## 🔗 API Information

**No API keys required!** The MediaWiki API is completely public and free to use.

- **API Endpoint:** `https://en.wikibooks.org/w/api.php`
- **Documentation:** https://www.mediawiki.org/wiki/API:Main_page
- **Rate Limits:** None for reading (be respectful)

---

## 📝 License Compliance

All Wikibooks content is licensed under **CC BY-SA 4.0**:
- ✅ You can translate and adapt the content
- ✅ You must provide attribution (included in JSON output)
- ✅ Your translated content must use the same license
- ✅ You must indicate if changes were made

The script automatically includes all required attribution data in the JSON output.

---

## 🎯 Next Steps

After extracting recipes:

1. **Review the JSON** in `scripts/wiki/output/`
2. **Translate to Lithuanian** (manual or ChatGPT API - coming soon)
3. **Add SEO metadata** (keywords, descriptions)
4. **Upload to MongoDB** (script coming soon)

---

## 🐛 Troubleshooting

### Script won't run
```bash
# Install dependencies
npm install axios cheerio
```

### Permission errors
```bash
# Make sure output directory exists
mkdir -p scripts/wiki/output
```

### Network errors
- Check your internet connection
- Wikibooks might be temporarily down
- Try again in a few minutes

---

**Version:** 1.0  
**Last Updated:** June 30, 2025  
**Author:** Ragaujam.lt Development Team

