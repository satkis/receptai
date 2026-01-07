# Step 2d: Upload Recipes to MongoDB

## 📋 Overview

This step automatically uploads all converted recipes from ChatGPT to MongoDB and organizes the files.

---

## 🚀 Quick Start

```bash
npm run upload-gpt-to-mongodb
```

This will:
1. ✅ Read all JSON files from `scripts/wiki/output/chatGPT/`
2. ✅ Upload to MongoDB `receptai.recipes_new` collection
3. ✅ Move successfully uploaded files to `uploaded-to-mongodb/` folder

---

## 📁 Directory Structure

```
scripts/wiki/output/chatGPT/
├── {slug}.json                    # Converted recipes (ready to upload)
├── {slug}.json
└── uploaded-to-mongodb/           # Successfully uploaded recipes
    ├── {slug}.json
    └── {slug}.json
```

---

## 🔄 What the Script Does

### **1. Connect to MongoDB**
- Reads `MONGODB_URI` from `.env.local`
- Connects to `receptai` database
- Accesses `recipes_new` collection

### **2. Upload Each Recipe**
For each JSON file:
- Reads the recipe data
- Checks if recipe already exists (by slug)
- **If exists**: Updates the existing recipe
- **If new**: Inserts as new recipe
- Logs the result

### **3. Organize Files**
- Successfully uploaded files are moved to `uploaded-to-mongodb/`
- Failed files remain in `chatGPT/` for retry

---

## ✅ Prerequisites

### **Environment Variables**
Make sure `.env.local` has:
```bash
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

### **MongoDB Connection**
- MongoDB Atlas account active
- `receptai` database exists
- `recipes_new` collection exists

### **Converted Recipes**
- JSON files in `scripts/wiki/output/chatGPT/`
- Valid MongoDB recipe format

---

## 📊 Workflow

```
npm run upload-gpt-to-mongodb
         ↓
Connect to MongoDB
         ↓
Read all JSON files from chatGPT/
         ↓
For each recipe:
  - Check if exists by slug
  - Update or Insert
  - Move to uploaded-to-mongodb/
         ↓
Summary report
         ↓
Done!
```

---

## 🎯 Output

### **Console Output**
```
╔════════════════════════════════════════════════════════════════╗
║         MONGODB RECIPE UPLOAD                                  ║
╚════════════════════════════════════════════════════════════════╝

📋 Workflow:
  1. Read all JSON files from scripts/wiki/output/chatGPT/
  2. Upload to MongoDB receptai.recipes_new collection
  3. Move successfully uploaded files to uploaded-to-mongodb/

📁 Created directory: scripts/wiki/output/chatGPT/uploaded-to-mongodb
✅ Connected to MongoDB

📋 Found 5 recipes to upload

[1/5] Uploading: affogato-italiskas-desertas
   ✅ Inserted successfully (ID: 507f1f77bcf86cd799439011)
   📁 Moved to uploaded-to-mongodb/

[2/5] Uploading: adobo-vistiena-filipinietiskai
   ⚠️  Recipe already exists (slug: adobo-vistiena-filipinietiskai)
   📝 Updating existing recipe...
   ✅ Updated successfully
   📁 Moved to uploaded-to-mongodb/

...

📊 Results:
   Total recipes: 5
   ✅ Successful: 5
   ❌ Failed: 0

✅ Recipes uploaded to MongoDB!

📁 Uploaded files moved to:
   scripts/wiki/output/chatGPT/uploaded-to-mongodb

🌐 Next steps:
   1. Visit https://ragaujam.lt/receptas/{slug}
   2. Verify recipes display correctly
   3. Check MongoDB for any issues
```

---

## 🔍 Features

✅ **Automatic Duplicate Detection**
- Checks if recipe already exists by slug
- Updates existing recipes instead of duplicating

✅ **Error Handling**
- Graceful failure handling
- Failed recipes remain for retry
- Detailed error messages

✅ **File Organization**
- Successfully uploaded files moved to `uploaded-to-mongodb/`
- Easy to track what's been uploaded

✅ **Progress Tracking**
- Shows current progress [X/Total]
- Displays MongoDB insert IDs
- Summary report at end

---

## 🚨 Troubleshooting

### **Error: "MONGODB_URI not set"**
- Check `.env.local` file
- Verify `MONGODB_URI` is set correctly
- Restart terminal after changing `.env.local`

### **Error: "Connection failed"**
- Check MongoDB Atlas is running
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas

### **Error: "Collection not found"**
- Verify `receptai` database exists
- Verify `recipes_new` collection exists
- Check database name in `.env.local`

### **Recipe not appearing on website**
- Check recipe slug is correct
- Verify recipe data in MongoDB Compass
- Check website cache (hard refresh)

---

## 📚 Related Files

- **Upload script**: `scripts/wiki/upload-gpt-to-mongodb.js`
- **Converter script**: `scripts/wiki/convert-wikibooks-with-assistant.js`
- **Workflow script**: `scripts/wiki/convert-and-upload.js`
- **Workflow reference**: `scripts/wiki/output/workFlow.md`

---

## 🔄 Complete Workflow

```
Step 1: Add URLs to wikibooks-urls.txt
         ↓
Step 2a: npm run wiki:extract
         ↓
Step 2b: npm run convert-and-upload
         ↓
Step 2c: Recipes converted to JSON
         ↓
Step 2d: npm run upload-gpt-to-mongodb  ← YOU ARE HERE
         ↓
Step 3: Recipes live on website!
```

---

## ✅ Checklist

- [ ] `.env.local` has `MONGODB_URI`
- [ ] MongoDB Atlas is running
- [ ] `receptai` database exists
- [ ] `recipes_new` collection exists
- [ ] JSON files in `scripts/wiki/output/chatGPT/`
- [ ] Run `npm run upload-gpt-to-mongodb`
- [ ] Check MongoDB for recipes
- [ ] Verify on website

---

## 🚀 Ready to Upload!

```bash
npm run upload-gpt-to-mongodb
```

**Let's go!** 🎉

