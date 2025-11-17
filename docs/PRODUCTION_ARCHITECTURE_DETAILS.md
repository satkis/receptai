# Production Architecture Details

## 🏗️ System Architecture

### Frontend Stack
- **Framework**: Next.js 15.3.3
- **React**: 18.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Frankfurt region - fra1)

### Backend Stack
- **Database**: MongoDB Atlas (Cloud)
- **Image Storage**: AWS S3 (eu-north-1)
- **API**: Next.js API routes
- **Authentication**: (Future implementation)

### Performance Optimization
- **ISR**: Incremental Static Regeneration enabled
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Caching**: 1-year cache for recipe images
- **CDN**: Vercel Edge Network

---

## 📁 Project Structure

```
receptai/
├── components/
│   ├── recipe/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeGrid.tsx
│   │   ├── RecipeDetails.tsx
│   │   └── WikibooksDisclaimer.tsx
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── navigation/
│   │   ├── Breadcrumb.tsx
│   │   ├── CategoryMenu.tsx
│   │   └── SearchBar.tsx
│   └── seo/
│       ├── SchemaOrgRecipe.tsx
│       ├── RecipeSEO.tsx
│       └── CategorySEO.tsx
├── pages/
│   ├── index.tsx (Homepage)
│   ├── receptas/[slug].tsx (Recipe pages)
│   ├── receptai/[...category].tsx (Category pages)
│   ├── paieska.tsx (Search page)
│   ├── api/ (API routes)
│   └── sitemap.xml.tsx (Dynamic sitemap)
├── lib/
│   └── mongodb.ts (Database connection)
├── utils/
│   ├── schema-org.ts
│   └── enhanced-recipe-schema.ts
├── scripts/
│   ├── wiki/extract-wikibooks-recipe.js
│   └── image-prep-and-load.js
├── public/
│   ├── robots.txt (Static)
│   └── favicon.ico
├── uploads/
│   ├── uploaded/ (Processed images)
│   ├── metadata/ (Image metadata)
│   └── ocr-workspace/ (OCR processing)
├── docs/ (Documentation)
├── next.config.js
├── vercel.json
├── tailwind.config.js
└── package.json
```

---

## 🔄 Request Flow

### Homepage Request
```
User visits ragaujam.lt/
  ↓
Vercel receives request
  ↓
Next.js redirect: / → /receptai (307)
  ↓
Browser follows redirect to www.ragaujam.lt/receptai
  ↓
Next.js serves /receptai page
  ↓
getStaticProps fetches recipes from MongoDB
  ↓
Page renders with ISR cache
  ↓
Images load from AWS S3
  ↓
User sees recipe grid (200 OK)
```

### Recipe Page Request
```
User visits ragaujam.lt/receptas/cepelinai
  ↓
Vercel receives request
  ↓
Next.js checks ISR cache
  ↓
If cached: Serve instantly (200 OK)
If not cached: Generate on-demand (blocking)
  ↓
getStaticProps fetches recipe from MongoDB
  ↓
Schema.org structured data generated
  ↓
Images optimized and served from S3
  ↓
Page renders with full recipe details
```

---

## 🗄️ Database Schema

### recipes_new Collection
```javascript
{
  _id: ObjectId,
  slug: String,
  title: { lt: String },
  description: { lt: String },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: Array,
    recipeCategory: String,
    recipeCuisine: String,
    aggregateRating: { ratingValue, reviewCount, bestRating, worstRating },
    nutrition: { calories, proteinContent, fatContent, ... }
  },
  prepTimeMinutes: Number,
  cookTimeMinutes: Number,
  totalTimeMinutes: Number,
  servings: Number,
  difficulty: String,
  primaryCategoryPath: String,
  secondaryCategories: Array,
  ingredients: [{ name: { lt: String }, quantity: String, vital: Boolean }],
  instructions: [{ step: Number, name: { lt: String }, text: { lt: String } }],
  image: { src: String, alt: String, width: Number, height: Number },
  tags: Array,
  author: { name: String, profileUrl: String },
  status: String,
  featured: Boolean,
  trending: Boolean,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### categories_new Collection
```javascript
{
  _id: ObjectId,
  path: String,
  parentPath: String,
  level: Number,
  title: { lt: String },
  slug: String,
  seo: { metaTitle, metaDescription, keywords, canonicalUrl },
  filters: { manual: Array, auto: Array, timeFilters: Array },
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🖼️ Image Pipeline

### Upload Process
1. User uploads image to `uploads/to-upload/`
2. Script detects new image
3. Extracts metadata from database (by slug matching)
4. Compresses image (WebP/AVIF)
5. Uploads to AWS S3: `receptu-images/receptai/{slug}.jpg`
6. Updates database with image URL
7. Moves processed image to `uploads/uploaded/`

### Serving Process
1. Next.js Image component requests image
2. Vercel CDN checks cache
3. If cached: Serve from edge (instant)
4. If not cached: Fetch from S3, optimize, cache
5. Serve WebP/AVIF based on browser support
6. Cache for 1 year (31536000 seconds)

---

## 🔐 Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 ISR Configuration

| Page Type | Revalidate | Fallback | Pre-generate |
|-----------|-----------|----------|--------------|
| Recipe | 3600s (1h) | blocking | Top 50 |
| Category | 7200s (2h) | blocking | Top 20 |
| All Recipes | 3600s (1h) | static | Always |
| Search | 7200s (2h) | hybrid | Static filters |
| Sitemap | 86400s (24h) | static | Always |

---

## 🚀 Deployment Process

### Development
```bash
npm run dev  # Local development on :3000
```

### Staging
```bash
git push origin staging
# Vercel auto-deploys to staging-ragaujam.vercel.app
```

### Production
```bash
git push origin main
vercel --prod --yes
vercel alias set {deployment-url} ragaujam.lt
vercel alias set {deployment-url} www.ragaujam.lt
```

---

## 🔍 Monitoring & Health Checks

### Key Metrics
- Page load time: <500ms (ISR cached)
- Core Web Vitals: >90 score
- Database response: <100ms
- Image load: <200ms (CDN cached)

### Health Check URLs
- Homepage: https://ragaujam.lt/
- Recipes: https://ragaujam.lt/receptai
- Sitemap: https://ragaujam.lt/sitemap.xml
- API: https://ragaujam.lt/api/recipes

---

**Last Updated**: November 17, 2025

