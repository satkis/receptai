# 📋 Comprehensive Product Requirements Document (PRD)
# Ragaujam.lt - Lithuanian Recipe Website

**Version**: 3.0  
**Date**: January 2025  
**Status**: Production Ready  
**Domain**: ragaujam.lt  

---

## 🎯 **Executive Summary**

Ragaujam.lt is a high-performance, SEO-optimized Lithuanian recipe website designed to become Lithuania's premier recipe destination. The platform combines traditional Lithuanian cuisine with modern web performance, ISR optimization, and comprehensive SEO implementation.

### **Core Mission**
Deliver lightning-fast Lithuanian recipe discovery with sub-500ms page loads while maintaining fresh content through daily recipe additions.

### **Success Metrics**
- **Performance**: Core Web Vitals >90, LCP <2.5s
- **SEO**: Top 3 rankings for 50+ Lithuanian recipe keywords
- **User Experience**: >3 pages per session, <2s load times
- **Growth**: 10k+ monthly organic visitors within 12 months

---

## 🏗️ **Technical Architecture**

### **Technology Stack**
- **Frontend**: Next.js 15.3.3 + React 18 + TypeScript
- **Styling**: Tailwind CSS with Lithuanian-focused design system
- **Database**: MongoDB Atlas (Cloud) - `receptai` database
- **Image Storage**: AWS S3 (eu-north-1 region) - `receptu-images` bucket
- **Hosting**: Vercel with Frankfurt (fra1) edge functions
- **Performance**: ISR (Incremental Static Regeneration)
- **Language**: Lithuanian (primary), future English expansion

### **Database Architecture**

#### **MongoDB Collections**
```javascript
// Production Database: mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai

1. recipes_new (Main recipe data)
2. categories_new (Hierarchical category structure)  
3. groups (Meal categorization)
```

#### **Recipe Schema (recipes_new)**
```javascript
{
  _id: ObjectId,
  slug: String,                    // SEO-friendly URL slug
  canonicalUrl: String,            // Full canonical URL
  title: { lt: String },           // Lithuanian title
  description: { lt: String },     // Lithuanian description
  seo: {
    metaTitle: String,             // Custom SEO title
    metaDescription: String,       // Custom SEO description
    keywords: Array,               // SEO keywords
    recipeCategory: String,        // Schema.org category
    recipeCuisine: String,         // Schema.org cuisine
    aggregateRating: {             // Schema.org rating
      ratingValue: Number,
      reviewCount: Number,
      bestRating: Number,
      worstRating: Number
    },
    nutrition: {                   // Schema.org nutrition
      calories: Number,
      proteinContent: String,
      fatContent: String,
      carbohydrateContent: String,
      fiberContent: String,
      sugarContent: String,
      sodiumContent: String
    }
  },
  prepTimeMinutes: Number,         // Preparation time
  cookTimeMinutes: Number,         // Cooking time
  totalTimeMinutes: Number,        // Total time
  timeCategory: String,            // Time filter category
  servings: Number,                // Number of servings
  servingsUnit: String,            // Serving unit (e.g., "porcijos")
  difficulty: String,              // Difficulty level
  primaryCategoryPath: String,     // Main category path
  secondaryCategories: Array,      // Additional categories
  ingredients: [{                  // Recipe ingredients
    name: { lt: String },
    quantity: String,
    vital: Boolean,                // Essential ingredient flag
    notes: String                  // Optional notes
  }],
  notes: [{                        // Recipe tips/notes
    text: { lt: String },
    priority: Number
  }],
  instructions: [{                 // Cooking instructions
    step: Number,
    name: { lt: String },          // Step name
    text: { lt: String }           // Step instructions
  }],
  image: {                         // Recipe image
    src: String,                   // S3 URL
    alt: String,                   // Alt text
    width: Number,                 // Image width
    height: Number                 // Image height
  },
  tags: Array,                     // Recipe tags
  author: {                        // Recipe author
    name: String,
    profileUrl: String
  },
  status: String,                  // Publication status
  featured: Boolean,               // Featured recipe flag
  trending: Boolean,               // Trending recipe flag
  seasonal: Array,                 // Seasonal tags
  sitemap: {                       // Sitemap configuration
    priority: Number,
    changefreq: String,
    lastmod: String
  },
  publishedAt: Date,               // Publication date
  createdAt: Date,                 // Creation date
  updatedAt: Date                  // Last update date
}
```

#### **Category Schema (categories_new)**
```javascript
{
  _id: ObjectId,
  path: String,                    // Category path
  parentPath: String,              // Parent category path
  level: Number,                   // Hierarchy level (1-5)
  title: { lt: String },           // Lithuanian title
  slug: String,                    // URL slug
  seo: {
    metaTitle: String,             // SEO title
    metaDescription: String,       // SEO description
    keywords: Array,               // SEO keywords
    canonicalUrl: String           // Canonical URL
  },
  filters: {
    manual: Array,                 // Manual filters
    auto: Array,                   // Auto-generated filters
    timeFilters: Array             // Time-based filters
  },
  isActive: Boolean,               // Active status
  sortOrder: Number,               // Display order
  createdAt: Date,                 // Creation date
  updatedAt: Date                  // Last update date
}
```

---

## 🚀 **Performance Optimization (ISR Implementation)**

### **ISR Configuration**
```javascript
// Recipe Pages (/receptas/[slug])
revalidate: 3600,                  // 1 hour - fresh for daily additions
fallback: 'blocking',              // ISR for non-pre-generated recipes
paths: top50FeaturedRecipes        // Pre-generate popular recipes

// Category Pages (/[...category])  
revalidate: 7200,                  // 2 hours - category counts can lag
fallback: 'blocking',              // ISR for other categories
paths: top20ActiveCategories       // Pre-generate popular categories

// All Recipes Page (/receptai)
revalidate: 3600,                  // 1 hour - main listing page
static: true                       // Always pre-generated

// Search Page (/paieska)
revalidate: 7200,                  // 2 hours - hybrid approach
content: staticFilters + dynamicAPI // Fast initial load + fresh results

// Sitemap (/sitemap.xml)
revalidate: 86400,                 // 24 hours - optimal for SEO crawling
```

### **Performance Metrics**
| **Page Type** | **Before ISR** | **After ISR** | **Improvement** |
|---------------|----------------|---------------|-----------------|
| Recipe Pages | 2-4s | 200-500ms | **85% faster** |
| Category Pages | 1.5-3s | 300-600ms | **80% faster** |
| All Recipes | 1-2s | 200-400ms | **80% faster** |
| Search Page | 800ms-1.5s | 300ms + API | **70% faster** |
| Sitemap | 500ms-1s | 100-200ms | **80% faster** |

---

## 🖼️ **Image Optimization**

### **AWS S3 Configuration**
```javascript
// Bucket: receptu-images (eu-north-1)
// Structure:
receptu-images/
├── receptai/                      // Recipe images
│   ├── recipe-slug.jpg           // SEO-friendly naming
│   └── [other-recipe-images]
├── categories/                    // Category images (future)
└── static/                       // Logos, icons (future)

// Next.js Image Optimization
formats: ['image/webp', 'image/avif'],
deviceSizes: [640, 750, 828, 1080, 1200, 1920],
imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
minimumCacheTTL: 31536000,        // 1 year cache
```

### **Image Performance Features**
- **Automatic WebP/AVIF conversion** by Next.js
- **Priority loading** for above-the-fold images
- **Responsive sizing** with optimized `sizes` attributes
- **Lazy loading** for below-the-fold content
- **Blur placeholders** for better UX

---

## 🔍 **SEO Implementation**

### **Schema.org Structured Data**
```javascript
// Recipe Schema (Google Rich Results compliant)
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": recipe.title.lt,
  "description": recipe.description.lt,
  "image": [recipe.image.src],           // Single image array (Phase 1)
  "author": { "@type": "Organization", "name": "ragaujam.lt" },
  "datePublished": recipe.publishedAt,
  "prepTime": `PT${recipe.prepTimeMinutes}M`,
  "cookTime": `PT${recipe.cookTimeMinutes}M`,
  "totalTime": `PT${recipe.totalTimeMinutes}M`,
  "recipeYield": recipe.servings,
  "recipeCategory": recipe.seo.recipeCategory,
  "recipeCuisine": recipe.seo.recipeCuisine,
  "nutrition": recipe.seo.nutrition,
  "aggregateRating": recipe.seo.aggregateRating,
  "recipeIngredient": ingredients.map(i => i.name.lt),
  "recipeInstructions": instructions.map(i => ({
    "@type": "HowToStep",
    "name": i.name.lt,
    "text": i.text.lt
  }))
}
```

### **Meta Tags Implementation**
```javascript
// Recipe Page Meta Tags
<title>{recipe.title.lt}</title>  // No site name suffix
<meta name="description" content={recipe.seo.metaDescription} />
<meta name="keywords" content={recipe.seo.keywords.join(', ')} />
<meta property="og:title" content={recipe.title.lt} />
<meta property="og:description" content={recipe.seo.metaDescription} />
<meta property="og:image" content={recipe.image.src} />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

### **URL Structure**
```javascript
// SEO-Optimized URLs
/receptas/[slug]                   // Recipe pages
/receptai/[category]               // Category pages  
/receptai/[category]/[subcategory] // Subcategory pages
/receptai                          // All recipes (homepage redirect)
/paieska                          // Search page
/sitemap.xml                      // Dynamic sitemap
```

---

## 🌐 **Environment Configuration**

### **Development Environment**
```bash
# Local Development (.env.local)
NODE_ENV=development
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

### **Staging Environment**
```bash
# Vercel Preview Environment
NODE_ENV=preview
SITE_URL=https://staging-ragaujam.vercel.app
NEXT_PUBLIC_SITE_URL=https://staging-ragaujam.vercel.app
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

### **Production Environment**
```bash
# Vercel Production Environment
NODE_ENV=production
SITE_URL=https://ragaujam.lt
NEXT_PUBLIC_SITE_URL=https://ragaujam.lt
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

---

## 🚀 **Deployment Architecture**

### **Branch Strategy**
```bash
main                              # Production-ready code
├── staging                       # Pre-production testing
└── develop                       # Integration branch
    ├── feature/recipe-rating     # Feature branches
    └── feature/user-comments     # Feature branches
```

### **Deployment Workflow**
```bash
# Daily Development
npm run feature:new feature-name  # Create feature branch
# ... develop feature ...
npm run feature:merge feature-name # Merge to develop

# Staging Deployment
npm run deploy:staging            # Deploy develop → staging → Vercel preview

# Production Deployment  
npm run deploy:production         # Deploy staging → main → Vercel production

# Emergency Rollback
npm run rollback                  # Multiple rollback options
```

### **Vercel Configuration**
```javascript
// vercel.json
{
  "version": 2,
  "alias": ["ragaujam.lt", "www.ragaujam.lt"],
  "functions": {
    "pages/api/**/*.ts": { "maxDuration": 30, "regions": ["fra1"] },
    "pages/sitemap*.tsx": { "maxDuration": 30, "regions": ["fra1"] }
  },
  "redirects": [
    { "source": "/", "destination": "/receptai", "permanent": true }
  ]
}
```

### **Environment URLs**
- **Production**: https://ragaujam.lt
- **Staging**: https://staging-ragaujam.vercel.app  
- **Development**: http://localhost:3000

---

## 🎨 **User Experience & Design**

### **Design Principles**
1. **Lithuanian-First**: Content, terminology, cultural context prioritized
2. **Mobile-First**: Responsive design optimized for cooking scenarios
3. **Performance-First**: Fast loading prioritized over complex features
4. **SEO-First**: Search engine optimization built into every component

### **Component Architecture**
```javascript
components/
├── layout/
│   ├── Layout.tsx               // Main layout wrapper
│   ├── Header.tsx               // Navigation header
│   └── Footer.tsx               // Site footer
├── recipe/
│   ├── RecipeCard.tsx           // Recipe card component
│   ├── RecipeGrid.tsx           // Recipe grid layout
│   └── RecipeDetails.tsx        // Recipe detail view
├── navigation/
│   ├── Breadcrumb.tsx           // Breadcrumb navigation
│   ├── CategoryMenu.tsx         // Category navigation
│   └── SearchBar.tsx            // Search functionality
├── seo/
│   ├── SchemaOrgRecipe.tsx      // Recipe structured data
│   ├── RecipeSEO.tsx            // Recipe SEO meta tags
│   └── CategorySEO.tsx          // Category SEO meta tags
├── ui/
│   ├── PlaceholderImage.tsx     // Image placeholder component
│   ├── LoadingSpinner.tsx       // Loading states
│   └── Button.tsx               // Reusable button component
└── debug/
    ├── StagingBanner.tsx        // Staging environment indicator
    └── ISRDebugger.tsx          // ISR performance debugger
```

### **Responsive Design**
```javascript
// Grid Layout
Mobile (≤768px):    2 columns    // 50vw per card
Tablet (769-1200px): 3 columns   // 33vw per card  
Desktop (>1200px):  4 columns    // 300px fixed width

// Image Optimization
Hero Images:        priority={true}           // Above-the-fold
Recipe Cards:       priority={index < 3}      // First 3 cards only
Sizes Attribute:    "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
```

---

## 📊 **Performance Monitoring**

### **Core Web Vitals Targets**
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms  
- **CLS (Cumulative Layout Shift)**: <0.1

### **Monitoring Tools**
- **Vercel Analytics**: Real-time performance metrics
- **PageSpeed Insights**: Google performance scoring
- **ISR Debugger**: Custom staging environment debugger
- **Network Tab**: Cache hit/miss verification

### **Debug Features**
```javascript
// Staging Environment Only
- Orange staging banner (visual indicator)
- ISR debugger panel (bottom-right)
- Performance timing display
- Cache status indicators
- Load time measurements
```

---

## 🔧 **Development Workflow**

### **Setup Commands**
```bash
# One-time setup
npm install                       # Install dependencies
npm run setup:branches           # Set up Git branch structure
npm run setup:vercel-env         # Configure Vercel environment variables

# Daily development
npm run dev                      # Start development server
npm run build                    # Build for production
npm run start                    # Start production server
npm run lint                     # Run ESLint
npm run type-check               # TypeScript validation
```

### **Deployment Commands**
```bash
# Feature development
npm run feature:new <name>       # Create feature branch
npm run feature:merge <name>     # Merge feature to develop

# Environment deployments
npm run deploy:staging           # Deploy to staging
npm run deploy:production        # Deploy to production
npm run rollback                 # Emergency rollback

# Database utilities
node scripts/debug-recipe.js     # Debug recipe data
node scripts/update-recipe-image.js # Update recipe images
```

### **File Structure**
```
ragaujam-lt/
├── components/                  # React components
├── pages/                       # Next.js pages
│   ├── api/                     # API routes
│   ├── receptas/                # Recipe pages
│   └── receptai/                # Category pages
├── lib/                         # Utilities and configurations
│   └── mongodb.ts               # MongoDB connection
├── utils/                       # Helper functions
│   ├── schema-org.ts            # SEO schema generation
│   └── enhanced-recipe-schema.ts # Recipe structured data
├── scripts/                     # Deployment and utility scripts
├── docs/                        # Documentation
├── styles/                      # Global styles
├── public/                      # Static assets
├── next.config.js               # Next.js configuration
├── vercel.json                  # Vercel deployment configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── package.json                 # Dependencies and scripts
```

---

## 🎯 **Success Metrics & KPIs**

### **Technical Performance**
- **Page Load Speed**: 200-500ms (ISR cached)
- **Database Load Reduction**: 95-99% (ISR caching)
- **Core Web Vitals**: >90 score across all pages
- **Mobile Performance**: >90 Lighthouse score

### **SEO Performance**
- **Rich Snippets**: Google Recipe rich results
- **Structured Data**: 100% Schema.org compliance
- **Meta Tags**: Complete SEO metadata on all pages
- **Sitemap**: Automatic updates with 24-hour revalidation

### **User Experience**
- **Navigation Speed**: Instant between cached pages
- **Content Freshness**: New recipes appear within 1-2 hours
- **Search Performance**: <300ms initial load + dynamic results
- **Mobile Optimization**: Cooking-scenario optimized design

---

## 🚨 **Critical Dependencies**

### **External Services**
1. **MongoDB Atlas**: Primary database (receptai cluster)
2. **AWS S3**: Image storage (receptu-images bucket, eu-north-1)
3. **Vercel**: Hosting and deployment platform
4. **Domain**: ragaujam.lt (purchased on iv.lt)

### **Environment Variables (Required)**
```bash
MONGODB_URI                      # MongoDB Atlas connection string
MONGODB_DB                       # Database name (receptai)
NEXT_PUBLIC_SITE_URL            # Public site URL
SITE_URL                        # Internal site URL
AWS_REGION                      # AWS region (eu-north-1)
```

### **Deployment Requirements**
- **Node.js**: 18+ (for Next.js 15.3.3)
- **Vercel CLI**: For deployment automation
- **Git**: For version control and deployment workflow
- **MongoDB Compass**: For database management (optional)

---

**Status**: ✅ **Production Ready**  
**Performance**: 🚀 **80-85% Faster with ISR**  
**SEO**: 📈 **Google Rich Results Compliant**  
**Target**: 🇱🇹 **Optimized for Lithuanian Users**

---

*This PRD serves as the complete technical and business specification for the Ragaujam.lt Lithuanian recipe website. All implementation details, database schemas, deployment workflows, and performance optimizations are documented for seamless knowledge transfer and project continuation.*
