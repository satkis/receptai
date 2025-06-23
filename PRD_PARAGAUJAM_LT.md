# 📋 Product Requirements Document (PRD)
# Ragaujam.lt - Lithuanian Recipe Website

**Version**: 2.0  
**Date**: January 2025  
**Status**: Implementation Ready  

---

## 🎯 **Executive Summary**

Paragaujam.lt is a high-performance, SEO-optimized Lithuanian recipe website designed to rank #1 for Lithuanian recipe keywords while delivering exceptional user experience through lightning-fast page loads and intuitive navigation.

### **Core Mission**
Become Lithuania's premier recipe destination by combining traditional Lithuanian cuisine with modern web performance and SEO best practices.

### **Success Metrics**
- **SEO**: Rank in top 3 for 50+ Lithuanian recipe keywords within 6 months
- **Performance**: Core Web Vitals scores >90 across all pages
- **User Engagement**: <2s page load times, >3 pages per session
- **Growth**: 10k+ monthly organic visitors within 12 months

---

## 🏗️ **Current Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Database**: MongoDB with optimized collections
- **Hosting**: Vercel (Edge Functions + CDN)
- **Images**: AWS S3 + CloudFront CDN
- **Performance**: ISR (Incremental Static Regeneration)

### **URL Structure (SEO-Optimized)**
```
domain.lt/receptas/[recipe-slug]                    # Recipe pages
domain.lt/receptu-tipai/[...category-path]          # Category pages  
domain.lt/paieska/[tag-slug]                        # Tag search pages
domain.lt/                                          # Homepage
domain.lt/sitemap.xml                               # Dynamic sitemap
```

### **Database Collections**
- **recipes_new**: Optimized recipe data with denormalized breadcrumbs
- **categories_new**: Hierarchical category structure (5 levels deep)
- **tags_new**: Free-form tag system with popularity scoring

---

## 🎨 **User Experience Requirements**

### **Performance Requirements (Critical)**

#### **Page Load Speed Targets**
- **First Contentful Paint (FCP)**: <1.2s
- **Largest Contentful Paint (LCP)**: <2.0s  
- **Cumulative Layout Shift (CLS)**: <0.1
- **First Input Delay (FID)**: <100ms
- **Time to Interactive (TTI)**: <3.0s

#### **Performance Implementation Strategy**
1. **Static Generation**: Pre-generate popular recipe/category pages
2. **Image Optimization**: WebP/AVIF formats, responsive sizing, lazy loading
3. **Code Splitting**: Route-based and component-based splitting
4. **Caching Strategy**: CDN + Browser + API response caching
5. **Bundle Optimization**: Tree shaking, minification, compression

### **Mobile-First Design Requirements**

#### **Responsive Breakpoints**
```css
xs: 475px    /* Small phones */
sm: 640px    /* Large phones */
md: 768px    /* Tablets */
lg: 1024px   /* Small laptops */
xl: 1280px   # Large laptops
2xl: 1536px  # Desktops
```

#### **Touch-Friendly Interactions**
- **Minimum touch targets**: 44px × 44px
- **Ingredient checkboxes**: Large, easy-to-tap areas
- **Tag buttons**: Rounded, prominent, with hover states
- **Navigation**: Thumb-friendly bottom navigation on mobile

### **User Interface Components**

#### **Recipe Page UX**
- **Hero Section**: Large image, title, key metrics (time, servings, difficulty)
- **Sticky Ingredients**: Fixed sidebar on desktop, collapsible on mobile
- **Interactive Elements**: Click-to-cross ingredients, progress tracking
- **Breadcrumb Navigation**: Always visible, SEO-optimized
- **Tag System**: Clickable tags leading to search results

#### **Category Page UX**
- **Filter System**: Collapsible filters, clear active state indicators
- **Recipe Grid**: Masonry layout, infinite scroll or pagination
- **Sort Options**: Newest, rating, time, popularity
- **Loading States**: Skeleton screens, progressive loading

---

## 🔍 **SEO Optimization Requirements**

### **Technical SEO (Critical)**

#### **Structured Data Implementation**
```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Recipe Title",
  "description": "Recipe Description", 
  "image": ["https://domain.lt/image.jpg"],
  "author": {"@type": "Organization", "name": "Paragaujam.lt"},
  "datePublished": "2024-01-01",
  "prepTime": "PT15M",
  "cookTime": "PT25M", 
  "totalTime": "PT40M",
  "recipeYield": "4",
  "recipeIngredient": ["500g vištienos krūtinėlė", "300g grybai"],
  "recipeInstructions": [
    {"@type": "HowToStep", "text": "Step instructions"}
  ],
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "320 calories"
  },
  "aggregateRating": {
    "@type": "AggregateRating", 
    "ratingValue": "4.5",
    "ratingCount": "12"
  }
}
```

#### **Meta Tags Strategy**
- **Title Tags**: `{Recipe Name} - {Category} receptas | Paragaujam.lt` (max 60 chars)
- **Meta Descriptions**: Include prep time, difficulty, key ingredients (max 160 chars)
- **Open Graph**: Recipe images, descriptions optimized for social sharing
- **Canonical URLs**: Prevent duplicate content issues

#### **URL Optimization**
- **Recipe URLs**: `/receptas/vistienos-krutineles-kepsnys-su-grybais`
- **Category URLs**: `/receptu-tipai/pagal-ingredienta/mesa/vistiena`
- **Lithuanian Characters**: Properly converted to URL-safe slugs
- **Breadcrumb URLs**: Hierarchical, crawlable structure

### **Content SEO Strategy**

#### **Keyword Targeting**
- **Primary Keywords**: "lietuviški receptai", "tradiciniai patiekalai"
- **Long-tail Keywords**: "vištienos krūtinėlės receptas", "greiti pietūs receptai"
- **Local SEO**: "receptai Lietuvoje", "lietuviška virtuvė"

#### **Content Requirements**
- **Recipe Descriptions**: 150-300 words, keyword-rich but natural
- **Category Descriptions**: Unique content for each category page
- **Alt Text**: Descriptive image alt text with keywords
- **Internal Linking**: Strategic linking between related recipes/categories

### **Site Architecture for SEO**

#### **Information Architecture**
```
Homepage
├── Receptų tipai/
│   ├── Patiekalų tipai/
│   │   ├── Pusryčiai/ (recipes)
│   │   ├── Pietūs/ (recipes)
│   │   └── Vakarienė/ (recipes)
│   └── Pagal ingredientą/
│       ├── Mėsa/
│       │   ├── Vištiena/ (recipes)
│       │   └── Jautiena/ (recipes)
│       └── Žuvis/ (recipes)
├── Paieška/
│   ├── [tag-name]/ (tag-based recipe lists)
└── Receptas/
    └── [recipe-slug]/ (individual recipes)
```

#### **Sitemap Generation**
- **Dynamic XML Sitemap**: Auto-generated from database
- **Priority Levels**: Homepage (1.0), Categories (0.8), Recipes (0.6)
- **Update Frequency**: Daily for new content, weekly for existing
- **Image Sitemaps**: Include recipe images for Google Images SEO

---

## 🚀 **Feature Requirements**

### **Core Features (Implemented)**

#### **Recipe Display System**
- ✅ **Interactive Ingredients**: Click to cross out completed ingredients
- ✅ **Clickable Tags**: Navigate to tag-based search results  
- ✅ **Breadcrumb Navigation**: Hierarchical category navigation
- ✅ **Recipe Metadata**: Prep time, cook time, servings, difficulty
- ✅ **Structured Data**: Full Recipe schema implementation

#### **Category & Search System**
- ✅ **Hierarchical Categories**: 5-level deep category structure
- ✅ **Advanced Filtering**: Multiple filter types with counts
- ✅ **Tag-based Search**: Dedicated pages for each tag
- ✅ **Pagination**: Efficient pagination with SEO-friendly URLs

### **Enhanced Features (To Implement)**

#### **Interactive Recipe Features**
- 🔄 **Step-by-step Progress Tracker**: Visual progress indicator while cooking
- 🔄 **Dynamic Serving Adjustment**: Multiply ingredient quantities automatically
- 🔄 **Print-friendly Version**: Optimized recipe printing layout

#### **User Engagement Features**  
- 🔄 **Anonymous Rating System**: 5-star rating without user accounts
- 🔄 **Guest Comments**: Simple comment system for recipe feedback
- 🔄 **"I Cooked This" Counter**: Social proof without authentication
- 🔄 **Social Sharing**: Facebook, Pinterest, WhatsApp sharing buttons

#### **Performance Features**
- 🔄 **Lazy Loading**: Progressive image and content loading
- 🔄 **Offline Support**: Service worker for basic offline functionality  
- 🔄 **Search Suggestions**: Real-time search suggestions as user types

---

## 📊 **Performance Monitoring Requirements**

### **Core Web Vitals Tracking**
- **Real User Monitoring (RUM)**: Track actual user performance
- **Lighthouse CI**: Automated performance testing in deployment pipeline
- **PageSpeed Insights**: Regular monitoring of Google's performance scores

### **SEO Monitoring**
- **Google Search Console**: Track rankings, clicks, impressions
- **Structured Data Testing**: Validate recipe schema markup
- **Mobile Usability**: Monitor mobile-specific SEO issues

### **Analytics Requirements**
- **Page Load Times**: Track by page type (recipe, category, search)
- **User Engagement**: Bounce rate, time on page, pages per session
- **Search Performance**: Track internal search usage and results

---

## 🎯 **Success Criteria & KPIs**

### **Technical Performance KPIs**
- **Core Web Vitals**: All metrics in "Good" range (green)
- **Page Load Speed**: 95% of pages load under 2 seconds
- **Mobile Performance**: Mobile PageSpeed score >90
- **Uptime**: 99.9% availability

### **SEO Performance KPIs**
- **Organic Traffic**: 10k+ monthly organic visitors within 12 months
- **Keyword Rankings**: Top 3 positions for 50+ target keywords
- **Featured Snippets**: Capture 10+ recipe featured snippets
- **Local SEO**: Rank #1 for "lietuviški receptai" in Lithuania

### **User Experience KPIs**
- **Bounce Rate**: <40% across all page types
- **Session Duration**: >3 minutes average
- **Pages per Session**: >2.5 pages
- **Mobile Usage**: >70% of traffic from mobile devices

---

## 🔧 **Implementation Priorities**

### **Phase 1: Performance Optimization (Weeks 1-2)**
1. Implement lazy loading for images and components
2. Optimize bundle size and implement code splitting
3. Set up comprehensive caching strategy
4. Implement service worker for offline support

### **Phase 2: Enhanced Interactivity (Weeks 3-4)**
1. Build step-by-step progress tracker
2. Implement dynamic serving size adjustment
3. Add print-friendly recipe layouts
4. Enhance mobile touch interactions

### **Phase 3: User Engagement (Weeks 5-6)**
1. Implement anonymous rating system
2. Build guest comment system
3. Add "I cooked this" counter functionality
4. Integrate social sharing buttons

### **Phase 4: SEO Enhancement (Weeks 7-8)**
1. Optimize all structured data implementations
2. Enhance internal linking strategy
3. Implement advanced sitemap features
4. Add search suggestions functionality

---

## 📋 **Quality Assurance Requirements**

### **Performance Testing**
- **Load Testing**: Test with 1000+ concurrent users
- **Mobile Testing**: Test on actual devices, not just emulators
- **Network Testing**: Test on slow 3G connections
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge

### **SEO Testing**
- **Structured Data Validation**: Google's Rich Results Test
- **Mobile-Friendly Test**: Google's Mobile-Friendly Test Tool
- **PageSpeed Testing**: Both mobile and desktop scores
- **Accessibility Testing**: WCAG 2.1 AA compliance

### **User Experience Testing**
- **Usability Testing**: Test recipe cooking flow with real users
- **A/B Testing**: Test different layouts for conversion optimization
- **Heat Map Analysis**: Track user interaction patterns
- **Form Testing**: Test all interactive elements thoroughly

---

## 🚀 **Technical Implementation Details**

### **Performance Optimization Strategy**

#### **Image Optimization**
```javascript
// Next.js Image Component Configuration
<Image
  src={recipe.image}
  alt={recipe.title.lt}
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
  format="webp"
/>
```

#### **Code Splitting Strategy**
```javascript
// Route-based splitting
const RecipePage = dynamic(() => import('../components/RecipePage'), {
  loading: () => <RecipePageSkeleton />,
  ssr: true
});

// Component-based splitting
const CommentsSection = dynamic(() => import('../components/Comments'), {
  loading: () => <CommentsSkeleton />,
  ssr: false
});
```

#### **Caching Implementation**
```javascript
// API Response Caching
export async function getStaticProps({ params }) {
  return {
    props: { recipe },
    revalidate: 3600, // 1 hour ISR
  };
}

// Browser Caching Headers
const nextConfig = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
    ];
  },
};
```

### **SEO Implementation Details**

#### **Dynamic Meta Tags**
```javascript
// Recipe Page Meta Tags
<Head>
  <title>{recipe.seo.metaTitle}</title>
  <meta name="description" content={recipe.seo.metaDescription} />
  <meta name="keywords" content={recipe.seo.keywords.join(', ')} />
  <link rel="canonical" href={`https://ragaujam.lt/receptas/${recipe.slug}`} />

  {/* Open Graph */}
  <meta property="og:title" content={recipe.seo.metaTitle} />
  <meta property="og:description" content={recipe.seo.metaDescription} />
  <meta property="og:image" content={`https://ragaujam.lt${recipe.image}`} />
  <meta property="og:url" content={`https://ragaujam.lt/receptas/${recipe.slug}`} />
  <meta property="og:type" content="article" />

  {/* Recipe Structured Data */}
  <script type="application/ld+json">
    {JSON.stringify(generateRecipeStructuredData(recipe))}
  </script>
</Head>
```

#### **Sitemap Generation**
```javascript
// Dynamic Sitemap Generation
export async function getServerSideProps({ res }) {
  const recipes = await getRecipes();
  const categories = await getCategories();

  const sitemap = generateSitemap(recipes, categories);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}
```

### **Database Optimization**

#### **Query Optimization**
```javascript
// Optimized Recipe Queries
const recipes = await db.collection('recipes_new')
  .find({
    categoryPath: { $regex: `^${categoryPath}` },
    tags: { $in: filterTags }
  })
  .sort({ publishedAt: -1 })
  .limit(12)
  .project({
    slug: 1,
    title: 1,
    description: 1,
    image: 1,
    totalTimeMinutes: 1,
    servings: 1,
    tags: 1,
    rating: 1,
    difficulty: 1
  })
  .toArray();
```

#### **Index Strategy**
```javascript
// MongoDB Indexes for Performance
db.recipes_new.createIndex({ "categoryPath": 1, "publishedAt": -1 });
db.recipes_new.createIndex({ "tags": 1, "rating.average": -1 });
db.recipes_new.createIndex({ "slug": 1 }, { unique: true });
db.recipes_new.createIndex({
  "title.lt": "text",
  "description.lt": "text",
  "tags": "text"
});
```

---

## 📱 **Mobile Optimization Requirements**

### **Progressive Web App (PWA) Features**
- **Service Worker**: Cache critical resources for offline access
- **Web App Manifest**: Enable "Add to Home Screen" functionality
- **Push Notifications**: Optional recipe reminders (future feature)

### **Mobile Performance Optimizations**
- **Touch Gestures**: Swipe navigation between recipe steps
- **Viewport Optimization**: Proper viewport meta tags
- **Font Loading**: Optimize web font loading for mobile
- **Critical CSS**: Inline critical CSS for faster rendering

### **Mobile UX Enhancements**
- **Bottom Navigation**: Easy thumb access on large phones
- **Collapsible Sections**: Expandable ingredient/instruction sections
- **Voice Commands**: "Next step" voice navigation (future feature)
- **Haptic Feedback**: Subtle vibrations for interactions

---

## 🔒 **Security & Privacy Requirements**

### **Data Protection**
- **GDPR Compliance**: Cookie consent, data processing transparency
- **Privacy Policy**: Clear data usage policies
- **Anonymous Analytics**: No personal data collection without consent
- **Secure Headers**: CSP, HSTS, X-Frame-Options implementation

### **Performance Security**
- **Rate Limiting**: Prevent API abuse and DDoS attacks
- **Input Validation**: Sanitize all user inputs (comments, search)
- **XSS Protection**: Prevent cross-site scripting attacks
- **CSRF Protection**: Secure form submissions

---

## 📈 **Analytics & Monitoring**

### **Performance Monitoring Tools**
- **Google PageSpeed Insights**: Regular performance audits
- **Lighthouse CI**: Automated performance testing
- **Web Vitals**: Real user monitoring implementation
- **Vercel Analytics**: Built-in performance monitoring

### **SEO Monitoring Tools**
- **Google Search Console**: Search performance tracking
- **Google Analytics 4**: User behavior analysis
- **Schema Markup Validator**: Structured data validation
- **Mobile-Friendly Test**: Mobile usability monitoring

### **Business Metrics Tracking**
- **Recipe Engagement**: Most viewed, highest rated recipes
- **Search Patterns**: Popular search terms and filters
- **User Journey**: Path analysis through site navigation
- **Conversion Tracking**: Recipe saves, shares, prints

---

This comprehensive PRD provides the roadmap for building Paragaujam.lt into Lithuania's premier recipe website, with uncompromising focus on performance, SEO excellence, and exceptional user experience.
