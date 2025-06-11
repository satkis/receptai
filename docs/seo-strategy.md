# 🔍 SEO Strategy & Implementation

## **SEO Overview**

Comprehensive SEO strategy for Lithuanian recipe website with focus on:
- Unique meta tags per page type
- Structured data (Schema.org)
- Canonical URLs
- Dynamic sitemaps
- Performance optimization

## **Meta Tags Strategy**

### **1. Recipe Pages (`/receptas/[slug]`)**

```typescript
// components/seo/RecipeSEO.tsx
export function RecipeSEO({ recipe }: { recipe: Recipe }) {
  const title = `${recipe.title.lt} - Paragaujam.lt`;
  const description = recipe.description.lt.substring(0, 160);
  const canonical = `https://domain.lt/receptas/${recipe.slug}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Recipe-specific Meta */}
      <meta name="recipe:prep_time" content={recipe.prepTimeMinutes.toString()} />
      <meta name="recipe:cook_time" content={recipe.cookTimeMinutes.toString()} />
      <meta name="recipe:total_time" content={recipe.totalTimeMinutes.toString()} />
      <meta name="recipe:serves" content={recipe.servings.toString()} />
      <meta name="recipe:difficulty" content={recipe.difficulty} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://domain.lt${recipe.image}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={recipe.publishedAt} />
      <meta property="article:section" content="Receptai" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://domain.lt${recipe.image}`} />
      
      {/* Recipe Tags as Keywords */}
      <meta name="keywords" content={recipe.tags.join(', ')} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateRecipeStructuredData(recipe))
        }}
      />
    </Head>
  );
}
```

### **2. Category Pages (`/receptu-tipai/[...path]`)**

```typescript
// components/seo/CategorySEO.tsx
export function CategorySEO({ category, recipeCount }: { category: Category; recipeCount: number }) {
  const countText = recipeCount > 100 ? "100+" : recipeCount.toString();
  const title = `${category.title.lt} receptai (${countText}) - Paragaujam.lt`;
  const description = `${recipeCount} ${category.title.lt.toLowerCase()} receptai su nuotraukomis ir instrukcijomis. Geriausi patikrinti receptai.`;
  const canonical = `https://domain.lt/receptu-tipai/${category.path}`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Category-specific Meta */}
      <meta name="category:name" content={category.title.lt} />
      <meta name="category:recipe_count" content={recipeCount.toString()} />
      <meta name="category:level" content={category.level.toString()} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbStructuredData(category))
        }}
      />
      
      {/* Collection Page Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionStructuredData(category, recipeCount))
        }}
      />
    </Head>
  );
}
```

### **3. Tag Search Pages (`/paieska/[tag]`)**

```typescript
// components/seo/TagSEO.tsx
export function TagSEO({ tag, recipeCount }: { tag: Tag; recipeCount: number }) {
  const countText = recipeCount > 100 ? "100+" : recipeCount.toString();
  const title = `${tag.name} receptai (${countText}) - Paragaujam.lt`;
  const description = `${recipeCount} receptai su "${tag.name}". Raskite geriausius receptus su nuotraukomis ir instrukcijomis.`;
  const canonical = `https://domain.lt/paieska/${tag.slug}`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Tag-specific Meta */}
      <meta name="tag:name" content={tag.name} />
      <meta name="tag:recipe_count" content={recipeCount.toString()} />
      <meta name="search:query" content={tag.name} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      
      {/* Search Results Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSearchResultsStructuredData(tag, recipeCount))
        }}
      />
    </Head>
  );
}
```

## **Structured Data (Schema.org)**

### **Recipe Structured Data**

```typescript
// utils/structured-data.ts
export function generateRecipeStructuredData(recipe: Recipe) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title.lt,
    "description": recipe.description.lt,
    "image": [`https://domain.lt${recipe.image}`],
    "author": {
      "@type": "Organization",
      "name": "Paragaujam.lt"
    },
    "datePublished": recipe.publishedAt,
    "dateModified": recipe.updatedAt,
    "prepTime": `PT${recipe.prepTimeMinutes}M`,
    "cookTime": `PT${recipe.cookTimeMinutes}M`,
    "totalTime": `PT${recipe.totalTimeMinutes}M`,
    "recipeYield": recipe.servings.toString(),
    "recipeCategory": recipe.breadcrumbs[recipe.breadcrumbs.length - 1]?.title,
    "recipeCuisine": "Lietuviška",
    "keywords": recipe.tags.join(", "),
    "recipeIngredient": recipe.ingredients.map(ing => 
      `${ing.quantity} ${ing.name.lt}`
    ),
    "recipeInstructions": recipe.instructions.map(inst => ({
      "@type": "HowToStep",
      "text": inst.text.lt
    })),
    "aggregateRating": recipe.rating.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating.average,
      "ratingCount": recipe.rating.count
    } : undefined,
    "nutrition": recipe.nutrition ? {
      "@type": "NutritionInformation",
      "calories": recipe.nutrition.calories,
      "proteinContent": `${recipe.nutrition.protein}g`,
      "fatContent": `${recipe.nutrition.fat}g`,
      "carbohydrateContent": `${recipe.nutrition.carbs}g`
    } : undefined
  };
}
```

### **Breadcrumb Structured Data**

```typescript
export function generateBreadcrumbStructuredData(category: Category) {
  const items = [
    { name: "Pagrindinis", url: "https://domain.lt/" },
    { name: "Receptų tipai", url: "https://domain.lt/receptu-tipai" },
    ...category.ancestors.map((ancestor, index) => ({
      name: ancestor.title,
      url: `https://domain.lt/receptu-tipai/${ancestor.path}`
    })),
    { name: category.title.lt, url: `https://domain.lt/receptu-tipai/${category.path}` }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
```

## **Dynamic Sitemap Generation**

```typescript
// pages/sitemap.xml.tsx
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { db } = await connectToDatabase();
  
  // Get all recipes
  const recipes = await db.collection('recipes')
    .find({ publishedAt: { $exists: true } })
    .project({ slug: 1, updatedAt: 1 })
    .toArray();
  
  // Get all categories
  const categories = await db.collection('categories')
    .find({ isActive: true })
    .project({ path: 1, updatedAt: 1 })
    .toArray();
  
  // Get popular tags
  const tags = await db.collection('tags')
    .find({ recipeCount: { $gte: 5 } })
    .project({ slug: 1, updatedAt: 1 })
    .toArray();

  const sitemap = generateSitemap({
    recipes,
    categories,
    tags,
    baseUrl: 'https://domain.lt'
  });

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

function generateSitemap({ recipes, categories, tags, baseUrl }: SitemapData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Homepage -->
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      
      <!-- Recipe pages -->
      ${recipes.map(recipe => `
        <url>
          <loc>${baseUrl}/receptas/${recipe.slug}</loc>
          <lastmod>${recipe.updatedAt}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
      
      <!-- Category pages -->
      ${categories.map(category => `
        <url>
          <loc>${baseUrl}/receptu-tipai/${category.path}</loc>
          <lastmod>${category.updatedAt}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
      
      <!-- Tag pages -->
      ${tags.map(tag => `
        <url>
          <loc>${baseUrl}/paieska/${tag.slug}</loc>
          <lastmod>${tag.updatedAt}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`;
}
```

## **Canonical URL Strategy**

```typescript
// utils/canonical.ts
export function getCanonicalUrl(pageType: string, params: any): string {
  const baseUrl = 'https://domain.lt';
  
  switch (pageType) {
    case 'recipe':
      return `${baseUrl}/receptas/${params.slug}`;
    
    case 'category':
      return `${baseUrl}/receptu-tipai/${params.path}`;
    
    case 'tag':
      return `${baseUrl}/paieska/${params.slug}`;
    
    default:
      return baseUrl;
  }
}

// Handle duplicate content
export function getAlternateUrls(recipe: Recipe): string[] {
  // If recipe appears in multiple contexts, list alternates
  return recipe.tags.map(tag => 
    `https://domain.lt/paieska/${slugify(tag)}`
  );
}
```

## **Performance SEO Optimizations**

1. **Image Optimization**: Next.js Image component with proper alt tags
2. **Core Web Vitals**: Optimized loading, layout shift prevention
3. **Mobile-First**: Responsive design with mobile-optimized content
4. **Page Speed**: Lazy loading, code splitting, CDN usage
5. **Structured Data**: Rich snippets for better SERP appearance

This SEO strategy ensures:
- ✅ Unique meta tags for each page type
- ✅ Rich structured data for search engines
- ✅ Proper canonical URLs
- ✅ Dynamic sitemap generation
- ✅ Mobile-first optimization
- ✅ Performance-focused implementation
