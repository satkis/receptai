# 🚀 Schema V2 Migration Guide - Multiple Categories & Performance Optimization

## 📋 **Overview**

This migration updates your recipe website to support:
- ✅ **Multiple categories per recipe** with primary canonical URLs
- ✅ **Exclusive time filtering** with optimized performance
- ✅ **Updated URL structure** (removed `/receptu-tipai/`)
- ✅ **Compound database indexes** for lightning-fast queries
- ✅ **Denormalized time categories** for maximum performance

## 🗄️ **Database Schema Changes**

### **New Recipe Schema Fields**
```javascript
{
  // PRIMARY CATEGORY (for canonical URL and breadcrumbs)
  primaryCategoryPath: "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  primaryCategoryId: ObjectId,
  
  // ALL CATEGORIES (for filtering and search)
  allCategories: [
    "pagal-pagrindini-ingredienta/vistienos-patiekalai",
    "patiekalo-tipas/karsti-patiekalai", 
    "pagal-laika/iki-30-min"
  ],
  allCategoryIds: [ObjectId1, ObjectId2, ObjectId3],
  
  // TIME CATEGORY (denormalized for performance)
  timeCategory: "iki-30-min" // Auto-calculated from totalTimeMinutes
}
```

### **Updated Category Schema**
```javascript
{
  // New URL structure (no /receptu-tipai/)
  path: "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  
  // Performance optimization
  availableTimeFilters: [
    { value: "iki-30-min", label: "iki 30 min.", count: 23 },
    { value: "30-60-min", label: "30–60 min.", count: 18 }
  ]
}
```

## 🔧 **Migration Steps**

### **Step 1: Run Database Migration**
```bash
# Navigate to project directory
cd /path/to/your/project

# Install dependencies (if needed)
npm install

# Run the migration script
node scripts/migration/schema-v2-migration.js
```

### **Step 2: Verify Migration Results**
Check your MongoDB collections:
```javascript
// Check recipes have new fields
db.recipes_new.findOne({}, {
  primaryCategoryPath: 1,
  allCategories: 1,
  timeCategory: 1
});

// Check categories have time filters
db.categories_new.findOne({}, {
  availableTimeFilters: 1
});
```

### **Step 3: Update Your Environment**
Ensure your `.env.local` file has:
```env
MONGODB_URI=your_mongodb_connection_string
```

### **Step 4: Test New Functionality**
1. **Category Pages**: Visit `/patiekalo-tipas/karsti-patiekalai`
2. **Recipe Pages**: Visit `/receptas/your-recipe-slug`
3. **Tag Search**: Visit `/paieska/your-tag`
4. **Time Filtering**: Test exclusive time filter selection

## 🎯 **New URL Structure**

### **Before (Old URLs)**
```
domain.lt/receptu-tipai/patiekalo-tipas/karsti-patiekalai
domain.lt/receptu-tipai/pagal-ingredienta/mesa/vistiena
```

### **After (New URLs)**
```
domain.lt/patiekalo-tipas/karsti-patiekalai
domain.lt/pagal-pagrindini-ingredienta/vistienos-patiekalai
```

### **Recipe URLs (Unchanged)**
```
domain.lt/receptas/recipe-slug
domain.lt/paieska/tag-name
```

## ⚡ **Performance Optimizations**

### **New Database Indexes**
```javascript
// Compound indexes for lightning-fast queries
{ "allCategories": 1, "timeCategory": 1, "publishedAt": -1 }
{ "allCategories": 1, "rating.average": -1 }
{ "tags": 1, "timeCategory": 1, "publishedAt": -1 }
```

### **Query Performance Examples**
```javascript
// Category page with time filter (uses compound index)
db.recipes_new.find({
  "allCategories": "pagal-pagrindini-ingredienta/vistienos-patiekalai",
  "timeCategory": "iki-30-min"
}).sort({ "publishedAt": -1 });

// Tag search with time filter (uses compound index)
db.recipes_new.find({
  "tags": "vištiena",
  "timeCategory": "30-60-min"
}).sort({ "publishedAt": -1 });
```

## 🏷️ **Time Category System**

### **Automatic Time Categorization**
```javascript
// Auto-calculated based on totalTimeMinutes
function calculateTimeCategory(totalTimeMinutes) {
  if (totalTimeMinutes <= 30) return "iki-30-min";
  if (totalTimeMinutes <= 60) return "30-60-min";
  if (totalTimeMinutes <= 120) return "1-2-val";
  return "virs-2-val";
}
```

### **Exclusive Time Filtering**
- ✅ Only one time filter can be selected at a time
- ✅ Selecting new filter automatically deselects previous
- ✅ Clear visual indication of active filter
- ✅ Filter counts show only for available recipes

## 📁 **New Files Created**

### **Frontend Pages**
- `pages/[...category].tsx` - New category pages (no /receptu-tipai/)
- Updated `pages/receptas/[slug].tsx` - Recipe pages with new breadcrumbs
- Updated `pages/paieska/[tag].tsx` - Tag search with time filtering

### **API Endpoints**
- `pages/api/recipes/by-category-v2.ts` - Optimized category filtering
- `pages/api/recipes/by-tag-v2.ts` - Optimized tag search

### **Utilities**
- `utils/timeCategories.ts` - Time category utilities
- `scripts/migration/schema-v2-migration.js` - Migration script

### **Documentation**
- `docs/database-schema-design-v2.md` - Updated schema documentation
- `MIGRATION_V2_GUIDE.md` - This migration guide

## 🔍 **Manual Category Assignment**

### **Adding Secondary Categories**
You can manually assign recipes to multiple categories:

```javascript
// Example: Add recipe to multiple categories
db.recipes_new.updateOne(
  { slug: "vistienos-krutineles-kepsnys-su-grybais" },
  {
    $set: {
      allCategories: [
        "pagal-pagrindini-ingredienta/vistienos-patiekalai", // Primary
        "patiekalo-tipas/karsti-patiekalai",                 // Secondary
        "pagal-laika/iki-30-min",                           // Secondary
        "mitybos-pasirinkimai-dietiniai/sveiki-patiekalai"  // Secondary
      ]
    }
  }
);
```

### **Category Path Reference**
Use these exact paths for category assignment:
```
patiekalo-tipas/karsti-patiekalai
pagal-pagrindini-ingredienta/vistienos-patiekalai
saldumynai-ir-kepiniai/desertai
mitybos-pasirinkimai-dietiniai/sveiki-patiekalai
vaikiskiai-patiekalai/maistas-vaikams
pagal-laika/iki-30-min
proga/gimtadieniui
pasaulio-virtuve/lietuvos-virtuve
gerimai/nealkoholiniai-gerimai
papildoma/padazai-ir-uzpilai
```

## 🚨 **Important Notes**

### **SEO Considerations**
- ✅ **Canonical URLs**: Each recipe has ONE primary category for canonical URL
- ✅ **Breadcrumbs**: Based on primary category only
- ✅ **No Duplicate Content**: Multiple categories don't create duplicate URLs

### **Performance Considerations**
- ✅ **Compound Indexes**: Ensure all indexes are created for optimal performance
- ✅ **Query Optimization**: Use `allCategories` for filtering, `primaryCategoryPath` for canonical
- ✅ **Caching**: API responses cached for 5 minutes

### **Backward Compatibility**
- ⚠️ **Old URLs**: Will need redirects from old `/receptu-tipai/` URLs
- ✅ **Recipe URLs**: Unchanged, no redirects needed
- ✅ **Database**: Old fields preserved during migration

## ✅ **Verification Checklist**

After migration, verify:
- [ ] All recipes have `timeCategory` field
- [ ] All recipes have `allCategories` array
- [ ] All categories have `availableTimeFilters`
- [ ] Database indexes are created
- [ ] Category pages load without `/receptu-tipai/`
- [ ] Time filters work exclusively (one at a time)
- [ ] Recipe breadcrumbs use new URL structure
- [ ] Tag search includes time filtering

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Missing timeCategory**: Re-run migration script
2. **Slow queries**: Verify indexes are created
3. **404 errors**: Check category path format
4. **Filter not working**: Verify `availableTimeFilters` populated

### **Support**
If you encounter issues:
1. Check MongoDB logs for errors
2. Verify all environment variables
3. Test with a small dataset first
4. Check browser console for JavaScript errors

---

**Migration completed successfully! Your recipe website now supports multiple categories with optimized performance and exclusive time filtering.**
