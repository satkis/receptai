# 🍽️ Create 6 Lithuanian Recipes Script

This script creates 6 diverse Lithuanian recipes in your `recipes_new` MongoDB collection.

## 📋 Recipes Included

1. **Cepelinai su mėsa** - Traditional Lithuanian potato dumplings
2. **Šaltibarščiai su bulvėmis** - Cold beetroot soup (summer dish)
3. **Bulvių kugelis tradicinis** - Traditional potato pudding
4. **Kibinai su mėsa** - Trakai kibinai (Karaite pastries)
5. **Balandėliai su mėsa** - Stuffed cabbage rolls
6. **Naminis skilandis** - Homemade smoked sausage

## 🚀 How to Use

### Option 1: MongoDB Compass (Recommended)
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `recipes_new` collection
4. Click the ">" shell icon at bottom
5. Copy and paste the entire content of `create-6-recipes.js`
6. Press Enter to execute

### Option 2: MongoDB Shell (mongosh)
```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the script
mongosh "your-connection-string" < scripts/create-6-recipes.js
```

### Option 3: Node.js Script
```bash
# Make sure you have MongoDB driver installed
npm install mongodb

# Run with Node.js
node scripts/create-6-recipes.js
```

## ✅ What Gets Created

Each recipe includes:
- ✅ **Unique slug** (e.g., `cepelinai-su-mesa`)
- ✅ **Canonical URL** (e.g., `https://paragaujam.lt/receptas/cepelinai-su-mesa`)
- ✅ **Complete SEO metadata** (title, description, keywords)
- ✅ **Structured ingredients** with vital/non-vital marking
- ✅ **Step-by-step instructions** with timing
- ✅ **Image data** (S3 URLs with alt text)
- ✅ **Rating and engagement** metrics
- ✅ **Lithuanian tags** for filtering
- ✅ **Schema.org structured data** for SEO
- ✅ **Category paths** for navigation
- ✅ **Breadcrumbs** for UX

## 📊 Recipe Distribution

| Category | Recipes | Examples |
|----------|---------|----------|
| **karsti-patiekalai** | 3 | Cepelinai, Kugelis, Balandėliai |
| **sriubos** | 1 | Šaltibarščiai |
| **kepiniai** | 1 | Kibinai |
| **uzkandziai** | 1 | Skilandis |

## 🎯 SEO Features

- **Optimized titles** with Lithuanian keywords
- **Meta descriptions** under 160 characters
- **Focus keywords** for each recipe
- **Schema.org markup** for rich snippets
- **Proper image alt text** in Lithuanian
- **Canonical URLs** for SEO

## 🧪 After Running

1. **Check your collection**: `db.recipes_new.find().count()`
2. **Test the website**: Visit `/receptai/karsti-patiekalai`
3. **Verify filtering**: Test category and time filters
4. **Check SEO**: View page source for structured data

## 🔧 Customization

To modify recipes:
1. Edit the `recipes` array in the script
2. Change slugs, titles, ingredients, or instructions
3. Update image URLs to your S3 bucket
4. Adjust categories and tags as needed

## 📝 Notes

- All recipes use **Lithuanian language** content
- **Unique slugs** prevent duplicates
- **Realistic timing** and serving data
- **Traditional Lithuanian** dishes for authenticity
- **SEO-optimized** for Lithuanian search terms
