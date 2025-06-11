# 🛣️ URL Routing Architecture

## **URL Structure Overview**

### **Recipe URLs**
- **Pattern**: `domain.lt/receptas/[recipe-slug]`
- **Examples**: 
  - `domain.lt/receptas/vistienos-krutineles-kepsnys-su-grybais`
  - `domain.lt/receptas/salti-barsčiai-su-kefyru`

### **Category Pages**
- **Pattern**: `domain.lt/receptu-tipai/[...category-path]`
- **Examples**:
  - `domain.lt/receptu-tipai/patiekalu-tipai/desertai`
  - `domain.lt/receptu-tipai/pagal-ingredienta/mesa/vistiena/krutinele`

### **Tag Search Pages**
- **Pattern**: `domain.lt/paieska/[tag-slug]`
- **Examples**:
  - `domain.lt/paieska/vistiena`
  - `domain.lt/paieska/30-minuciu`

## **Next.js File Structure**

```
pages/
├── receptas/
│   └── [slug].tsx                    # Individual recipe pages
├── receptu-tipai/
│   └── [...category].tsx             # Dynamic category pages
├── paieska/
│   └── [tag].tsx                     # Tag search pages
├── api/
│   ├── recipes/
│   │   ├── [slug].ts                 # Recipe API
│   │   └── by-category.ts            # Category filtering API
│   ├── categories/
│   │   └── [...path].ts              # Category data API
│   └── tags/
│       └── [tag].ts                  # Tag search API
└── sitemap.xml.tsx                   # Dynamic sitemap
```

## **Routing Implementation**

### **1. Recipe Page (`/receptas/[slug].tsx`)**

```typescript
import { GetServerSideProps } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

interface RecipePageProps {
  recipe: Recipe;
  breadcrumbs: Breadcrumb[];
  relatedRecipes: Recipe[];
}

export default function RecipePage({ recipe, breadcrumbs, relatedRecipes }: RecipePageProps) {
  return (
    <>
      <SEOHead recipe={recipe} />
      <Breadcrumb items={breadcrumbs} />
      <RecipeContent recipe={recipe} />
      <TagList tags={recipe.tags} />
      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { db } = await connectToDatabase();
  const slug = params?.slug as string;

  // Get recipe with category data
  const recipe = await db.collection('recipes').findOne({ slug });
  
  if (!recipe) {
    return { notFound: true };
  }

  // Get related recipes by tags
  const relatedRecipes = await db.collection('recipes')
    .find({ 
      tags: { $in: recipe.tags },
      _id: { $ne: recipe._id }
    })
    .limit(6)
    .toArray();

  return {
    props: {
      recipe: JSON.parse(JSON.stringify(recipe)),
      breadcrumbs: recipe.breadcrumbs,
      relatedRecipes: JSON.parse(JSON.stringify(relatedRecipes))
    }
  };
};
```

### **2. Category Page (`/receptu-tipai/[...category].tsx`)**

```typescript
import { GetServerSideProps } from 'next';

interface CategoryPageProps {
  category: Category;
  recipes: Recipe[];
  breadcrumbs: Breadcrumb[];
  availableFilters: FilterConfig;
  pagination: PaginationInfo;
}

export default function CategoryPage({ 
  category, 
  recipes, 
  breadcrumbs, 
  availableFilters,
  pagination 
}: CategoryPageProps) {
  return (
    <>
      <CategorySEOHead category={category} />
      <Breadcrumb items={breadcrumbs} />
      <CategoryHeader category={category} recipeCount={pagination.total} />
      <FilterBar filters={availableFilters} />
      <RecipeGrid recipes={recipes} />
      <Pagination {...pagination} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const { db } = await connectToDatabase();
  const categoryPath = (params?.category as string[])?.join('/');
  
  // Get category data
  const category = await db.collection('categories').findOne({ path: categoryPath });
  
  if (!category) {
    return { notFound: true };
  }

  // Build query with filters
  const filters = buildFiltersFromQuery(query);
  const recipeQuery = {
    categoryPath: { $regex: `^${categoryPath}` },
    ...filters
  };

  // Get recipes with pagination
  const page = parseInt(query.page as string) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const [recipes, totalCount] = await Promise.all([
    db.collection('recipes')
      .find(recipeQuery)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('recipes').countDocuments(recipeQuery)
  ]);

  // Get available filters for this category
  const availableFilters = await getAvailableFilters(db, categoryPath, recipes);

  return {
    props: {
      category: JSON.parse(JSON.stringify(category)),
      recipes: JSON.parse(JSON.stringify(recipes)),
      breadcrumbs: category.ancestors || [],
      availableFilters,
      pagination: {
        current: page,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    }
  };
};
```

### **3. Tag Search Page (`/paieska/[tag].tsx`)**

```typescript
interface TagPageProps {
  tag: Tag;
  recipes: Recipe[];
  relatedTags: string[];
  pagination: PaginationInfo;
}

export default function TagPage({ tag, recipes, relatedTags, pagination }: TagPageProps) {
  return (
    <>
      <TagSEOHead tag={tag} />
      <TagHeader tag={tag} recipeCount={pagination.total} />
      <RelatedTags tags={relatedTags} />
      <RecipeGrid recipes={recipes} />
      <Pagination {...pagination} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const { db } = await connectToDatabase();
  const tagSlug = params?.tag as string;

  // Get tag data
  const tag = await db.collection('tags').findOne({ slug: tagSlug });
  
  if (!tag) {
    return { notFound: true };
  }

  // Get recipes with this tag
  const page = parseInt(query.page as string) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const [recipes, totalCount] = await Promise.all([
    db.collection('recipes')
      .find({ tags: tag.name })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('recipes').countDocuments({ tags: tag.name })
  ]);

  return {
    props: {
      tag: JSON.parse(JSON.stringify(tag)),
      recipes: JSON.parse(JSON.stringify(recipes)),
      relatedTags: tag.relatedTags || [],
      pagination: {
        current: page,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    }
  };
};
```

## **Breadcrumb Generation Logic**

```typescript
// utils/breadcrumbs.ts
export function generateRecipeBreadcrumbs(recipe: Recipe): Breadcrumb[] {
  return [
    { title: "Pagrindinis", url: "/" },
    ...recipe.breadcrumbs,
    { title: recipe.title.lt, url: `/receptas/${recipe.slug}`, current: true }
  ];
}

export function generateCategoryBreadcrumbs(category: Category): Breadcrumb[] {
  return [
    { title: "Pagrindinis", url: "/" },
    { title: "Receptų tipai", url: "/receptu-tipai" },
    ...category.ancestors.map(ancestor => ({
      title: ancestor.title,
      url: `/receptu-tipai/${ancestor.path}`
    })),
    { title: category.title.lt, url: `/receptu-tipai/${category.path}`, current: true }
  ];
}

export function generateTagBreadcrumbs(tag: Tag): Breadcrumb[] {
  return [
    { title: "Pagrindinis", url: "/" },
    { title: "Paieška", url: "/paieska" },
    { title: `"${tag.name}"`, url: `/paieska/${tag.slug}`, current: true }
  ];
}
```

## **URL Helpers**

```typescript
// utils/urls.ts
export const urls = {
  recipe: (slug: string) => `/receptas/${slug}`,
  category: (path: string) => `/receptu-tipai/${path}`,
  tag: (slug: string) => `/paieska/${slug}`,
  
  // SEO-friendly category URLs
  categoryWithFilters: (path: string, filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/receptu-tipai/${path}?${params.toString()}`;
  }
};

export function getCanonicalUrl(path: string): string {
  return `https://domain.lt${path}`;
}
```

This routing architecture provides:
- ✅ SEO-friendly URLs
- ✅ Hierarchical breadcrumbs
- ✅ Efficient database queries
- ✅ Flexible filtering
- ✅ Proper canonical URLs
- ✅ Fast page loading
