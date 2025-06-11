# 🚀 Database Migration Guide

This guide walks you through migrating your Lithuanian recipe website to the new optimized schema with hierarchical categories, tags, and improved SEO.

## 📋 **Prerequisites**

1. **MongoDB Atlas** connection configured in `.env.local`
2. **Node.js** and **npm** installed
3. **Backup** of your current database (recommended)

## 🔧 **Environment Setup**

Make sure your `.env.local` file contains:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/receptai
```

## 🎯 **Migration Steps**

### **Step 1: Run the Migration**

Execute the full migration process:

```bash
npm run migrate
```

This will:
- ✅ Create new collections (`categories_new`, `tags_new`, `recipes_new`, `page_configs`)
- ✅ Create optimized indexes
- ✅ Populate hierarchical category structure
- ✅ Migrate existing recipes with new categorization
- ✅ Extract and organize tags
- ✅ Generate SEO metadata

### **Step 2: Verify Migration**

Check that the migration completed successfully:

```bash
npm run migrate:verify
```

This will validate:
- All collections exist
- Data counts are correct
- Indexes are properly created
- Sample data structure is valid

### **Step 3: Test New Frontend**

Start the development server:

```bash
npm run dev
```

Test the new URL structure:
- **Recipe pages**: `http://localhost:3002/receptas/recipe-slug`
- **Category pages**: `http://localhost:3002/receptu-tipai/patiekalu-tipai/desertai`
- **Tag search**: `http://localhost:3002/paieska/vistiena`

## 🗂️ **New URL Structure**

### **Before (Old)**
```
/receptai/category/subcategory/recipe-slug
```

### **After (New)**
```
/receptas/recipe-slug                           # Recipe pages
/receptu-tipai/category/subcategory             # Category pages  
/paieska/tag-value                              # Tag search pages
```

## 📊 **Database Schema Changes**

### **New Collections**

1. **`categories_new`** - Hierarchical category structure
2. **`tags_new`** - Tag metadata with counts and relationships
3. **`recipes_new`** - Recipes with new categorization system
4. **`page_configs`** - SEO and filtering configurations

### **Key Improvements**

- ✅ **Hierarchical categories** with breadcrumb support
- ✅ **Free-form tag system** for flexible grouping
- ✅ **Denormalized breadcrumbs** for fast rendering
- ✅ **SEO-optimized metadata** for each page type
- ✅ **Performance indexes** for 10k+ recipes

## 🏷️ **Tag System**

### **How Tags Work**

1. **Clickable tags** on recipe pages link to search results
2. **Tag pages** show all recipes with that tag
3. **Related tags** suggest similar content
4. **Popularity scoring** ranks tags by usage

### **Tag Examples**

- **Ingredients**: `vištiena`, `grybai`, `sūris`
- **Time**: `30 minučių`, `per 15 min`, `greitas`
- **Diet**: `vegetariška`, `be gliuteno`, `keto`
- **Audience**: `vaikams`, `šeimai`, `pietūs į darbą`

## 🔍 **SEO Improvements**

### **Structured Data**

- ✅ **Recipe schema** for rich snippets
- ✅ **Breadcrumb schema** for navigation
- ✅ **Collection pages** for category listings

### **Meta Tags**

- ✅ **Unique titles** for each page type
- ✅ **Optimized descriptions** with recipe counts
- ✅ **Canonical URLs** to prevent duplicates
- ✅ **Open Graph** for social sharing

## 🛠️ **Troubleshooting**

### **Migration Failed?**

Clean up and retry:

```bash
npm run migrate:cleanup
npm run migrate
```

### **Missing Data?**

Check the migration logs for specific errors and fix data issues before retrying.

### **Performance Issues?**

Verify indexes were created:

```bash
npm run migrate:verify
```

### **Frontend Errors?**

1. Check that new collections exist
2. Verify environment variables
3. Restart development server

## 📈 **Performance Monitoring**

### **Key Metrics to Watch**

- **Page load times** (should be < 2s)
- **Database query performance** (indexed queries)
- **SEO rankings** (improved with structured data)
- **User engagement** (better navigation with tags)

### **Optimization Tips**

1. **Monitor tag usage** and clean up unused tags
2. **Update recipe counts** periodically
3. **Cache category data** for faster loading
4. **Optimize images** with Next.js Image component

## 🔄 **Rollback Plan**

If you need to rollback:

1. **Stop using new collections**:
   ```bash
   npm run migrate:cleanup
   ```

2. **Revert frontend changes**:
   - Switch back to old page routes
   - Update API endpoints
   - Restore old components

3. **Keep old collections** as backup until migration is stable

## 📝 **Post-Migration Tasks**

### **Immediate**
- [ ] Test all recipe pages load correctly
- [ ] Verify category navigation works
- [ ] Check tag search functionality
- [ ] Test mobile responsiveness

### **Within 1 Week**
- [ ] Monitor SEO performance
- [ ] Update sitemap generation
- [ ] Set up redirects from old URLs
- [ ] Train content team on new tag system

### **Within 1 Month**
- [ ] Analyze user behavior with new navigation
- [ ] Optimize tag relationships
- [ ] Add more category filters
- [ ] Consider removing old collections

## 🎉 **Success Criteria**

Migration is successful when:

- ✅ All recipes accessible via new URLs
- ✅ Category pages load with proper filtering
- ✅ Tag search returns relevant results
- ✅ SEO metadata is properly generated
- ✅ Mobile navigation works smoothly
- ✅ Page load times are under 2 seconds

## 📞 **Support**

If you encounter issues:

1. Check the migration logs for specific errors
2. Verify your MongoDB connection
3. Ensure all environment variables are set
4. Test with a small subset of data first

**The new architecture provides a solid foundation for scaling to 10k+ recipes with improved SEO, better user experience, and flexible content organization!** 🚀
