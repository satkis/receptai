# 🚀 Implementation Plan & Migration Strategy

## **Phase 1: Database Schema Migration**

### **Step 1: Create New Collections**

```javascript
// scripts/01-create-collections.js
db.createCollection("categories_new");
db.createCollection("tags_new");
db.createCollection("recipes_new");
db.createCollection("page_configs");

// Create indexes
db.categories_new.createIndex({ "path": 1 }, { unique: true });
db.categories_new.createIndex({ "parentId": 1, "sortOrder": 1 });
db.categories_new.createIndex({ "level": 1, "isActive": 1 });

db.tags_new.createIndex({ "slug": 1 }, { unique: true });
db.tags_new.createIndex({ "recipeCount": -1 });
db.tags_new.createIndex({ "popularityScore": -1 });

db.recipes_new.createIndex({ "slug": 1 }, { unique: true });
db.recipes_new.createIndex({ "categoryPath": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "categoryIds": 1, "rating.average": -1 });
db.recipes_new.createIndex({ "tags": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "title.lt": "text", "description.lt": "text", "tags": "text" });
```

### **Step 2: Populate Categories**

```javascript
// scripts/02-populate-categories.js
const categoryStructure = [
  {
    title: { lt: "Patiekalų tipai", en: "Dish Types" },
    slug: "patiekalu-tipai",
    level: 1,
    path: "patiekalu-tipai",
    children: [
      {
        title: { lt: "Pusryčiai", en: "Breakfast" },
        slug: "pusryciai",
        level: 2,
        path: "patiekalu-tipai/pusryciai"
      },
      {
        title: { lt: "Desertai", en: "Desserts" },
        slug: "desertai",
        level: 2,
        path: "patiekalu-tipai/desertai",
        children: [
          {
            title: { lt: "Lengvi desertai", en: "Light Desserts" },
            slug: "lengvi-desertai",
            level: 3,
            path: "patiekalu-tipai/desertai/lengvi-desertai"
          }
        ]
      }
    ]
  },
  {
    title: { lt: "Pagal ingredientą", en: "By Ingredient" },
    slug: "pagal-ingredienta",
    level: 1,
    path: "pagal-ingredienta",
    children: [
      {
        title: { lt: "Mėsa", en: "Meat" },
        slug: "mesa",
        level: 2,
        path: "pagal-ingredienta/mesa",
        children: [
          {
            title: { lt: "Vištiena", en: "Chicken" },
            slug: "vistiena",
            level: 3,
            path: "pagal-ingredienta/mesa/vistiena",
            children: [
              {
                title: { lt: "Krūtinėlė", en: "Breast" },
                slug: "krutinele",
                level: 4,
                path: "pagal-ingredienta/mesa/vistiena/krutinele"
              }
            ]
          }
        ]
      }
    ]
  }
];

async function insertCategoriesRecursively(categories, parentId = null) {
  for (const category of categories) {
    const doc = {
      title: category.title,
      slug: category.slug,
      level: category.level,
      path: category.path,
      fullPath: category.path.split('/'),
      parentId: parentId,
      ancestors: [], // Will be populated after insertion
      recipeCount: 0,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.categories_new.insertOne(doc);
    
    if (category.children) {
      await insertCategoriesRecursively(category.children, result.insertedId);
    }
  }
}

// Execute migration
await insertCategoriesRecursively(categoryStructure);

// Update ancestors after all categories are inserted
await updateCategoryAncestors();
```

### **Step 3: Migrate Existing Recipes**

```javascript
// scripts/03-migrate-recipes.js
async function migrateRecipes() {
  const oldRecipes = await db.recipes.find({}).toArray();
  
  for (const oldRecipe of oldRecipes) {
    // Determine category path based on existing data
    const categoryPath = determineCategoryPath(oldRecipe);
    const categoryIds = await getCategoryIds(categoryPath);
    const breadcrumbs = await generateBreadcrumbs(categoryPath);
    
    // Extract tags from existing data
    const tags = extractTags(oldRecipe);
    
    const newRecipe = {
      slug: oldRecipe.slug,
      title: oldRecipe.title,
      description: oldRecipe.description,
      language: oldRecipe.language || "lt",
      
      servings: oldRecipe.servings,
      prepTimeMinutes: oldRecipe.prepTimeMinutes || 0,
      cookTimeMinutes: oldRecipe.cookTimeMinutes || 0,
      totalTimeMinutes: oldRecipe.totalTimeMinutes || 30,
      
      ingredients: oldRecipe.ingredients,
      instructions: oldRecipe.instructions,
      
      // New categorization
      categoryPath: categoryPath,
      categoryIds: categoryIds,
      breadcrumbs: breadcrumbs,
      tags: tags,
      
      image: oldRecipe.image,
      rating: oldRecipe.rating || { average: 0, count: 0 },
      difficulty: oldRecipe.difficulty || "vidutinis",
      
      seo: generateSEO(oldRecipe),
      
      createdAt: oldRecipe.createdAt || new Date(),
      updatedAt: new Date(),
      publishedAt: oldRecipe.publishedAt || oldRecipe.createdAt || new Date()
    };
    
    await db.recipes_new.insertOne(newRecipe);
  }
}

function determineCategoryPath(recipe) {
  // Logic to determine category based on existing recipe data
  // This would be customized based on your current data structure
  if (recipe.categories?.main === "Vištiena") {
    return "pagal-ingredienta/mesa/vistiena/krutinele";
  }
  // Add more logic based on your data
  return "patiekalu-tipai/pietus"; // Default fallback
}

function extractTags(recipe) {
  const tags = [];
  
  // Extract from existing categories
  if (recipe.categories?.dietary) {
    tags.push(...recipe.categories.dietary);
  }
  
  // Extract from group labels
  if (recipe.groupLabels) {
    tags.push(...recipe.groupLabels);
  }
  
  // Add time-based tags
  if (recipe.totalTimeMinutes <= 30) {
    tags.push("30 minučių");
  }
  
  // Add difficulty tags
  if (recipe.difficulty) {
    tags.push(recipe.difficulty);
  }
  
  return [...new Set(tags)]; // Remove duplicates
}
```

## **Phase 2: Frontend Implementation**

### **Step 1: Update Routing**

```typescript
// Update pages structure
// 1. Rename pages/receptai/[category]/[subcategory]/[recipe].tsx 
//    to pages/receptas/[slug].tsx

// 2. Create pages/receptu-tipai/[...category].tsx

// 3. Create pages/paieska/[tag].tsx

// 4. Update all internal links to use new URL structure
```

### **Step 2: Implement Components**

```bash
# Create component structure
mkdir -p components/pages/RecipePage
mkdir -p components/pages/CategoryPage  
mkdir -p components/pages/TagPage
mkdir -p components/shared
mkdir -p hooks

# Implement components in order:
# 1. Shared components (Breadcrumb, TagList, FilterBar)
# 2. Page-specific components
# 3. Hooks for state management
# 4. SEO components
```

### **Step 3: API Endpoints**

```typescript
// Create new API endpoints:
// pages/api/recipes/[slug].ts - Single recipe
// pages/api/recipes/by-category.ts - Category filtering
// pages/api/recipes/by-tag.ts - Tag search
// pages/api/categories/[...path].ts - Category data
// pages/api/tags/[tag].ts - Tag data
```

## **Phase 3: SEO & Performance**

### **Step 1: SEO Implementation**

```typescript
// 1. Implement SEO components for each page type
// 2. Add structured data generation
// 3. Update sitemap generation
// 4. Implement canonical URLs
// 5. Add meta tag optimization
```

### **Step 2: Performance Optimization**

```typescript
// 1. Implement lazy loading for recipe grids
// 2. Add infinite scroll for large result sets
// 3. Optimize images with Next.js Image component
// 4. Add caching strategies
// 5. Implement service worker for offline support
```

## **Phase 4: Testing & Deployment**

### **Step 1: Testing Strategy**

```bash
# 1. Unit tests for components
npm run test:unit

# 2. Integration tests for API endpoints
npm run test:integration

# 3. E2E tests for user flows
npm run test:e2e

# 4. Performance testing
npm run test:performance

# 5. SEO testing
npm run test:seo
```

### **Step 2: Gradual Deployment**

```bash
# 1. Deploy to staging environment
# 2. Test all functionality
# 3. Run SEO audit
# 4. Performance testing
# 5. Deploy to production with feature flags
# 6. Gradually enable new features
# 7. Monitor performance and SEO metrics
```

## **Migration Timeline**

### **Week 1: Database Migration**
- [ ] Create new collections and indexes
- [ ] Populate category structure
- [ ] Migrate existing recipes
- [ ] Test data integrity

### **Week 2: Core Frontend**
- [ ] Implement new routing structure
- [ ] Create shared components
- [ ] Build recipe pages with new URL structure
- [ ] Implement tag system

### **Week 3: Category & Tag Pages**
- [ ] Build category pages with filtering
- [ ] Implement tag search pages
- [ ] Add breadcrumb navigation
- [ ] Test filtering functionality

### **Week 4: SEO & Performance**
- [ ] Implement SEO components
- [ ] Add structured data
- [ ] Optimize performance
- [ ] Generate sitemaps

### **Week 5: Testing & Deployment**
- [ ] Comprehensive testing
- [ ] SEO audit
- [ ] Performance optimization
- [ ] Production deployment

## **Rollback Strategy**

1. **Database**: Keep old collections until migration is confirmed successful
2. **Frontend**: Use feature flags to switch between old and new systems
3. **URLs**: Implement redirects from old URLs to new structure
4. **Monitoring**: Track key metrics during migration

This implementation plan ensures:
- ✅ Zero-downtime migration
- ✅ Data integrity preservation
- ✅ SEO continuity with proper redirects
- ✅ Performance optimization
- ✅ Comprehensive testing coverage
