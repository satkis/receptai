# 📋 Product Requirements Document (PRD)
# Paragaujam.lt - Lithuanian Recipe Website

**Version:** 1.0  
**Date:** January 2025  
**Status:** Pre-Launch Ready  
**Team:** Solo Development Project  

---

## 🎯 Executive Summary

**Paragaujam.lt** is a modern Lithuanian recipe website focused on traditional and contemporary Lithuanian cuisine. The platform provides an SEO-optimized, mobile-first experience for discovering, filtering, and cooking Lithuanian recipes with comprehensive search functionality and performance optimization.

### **Mission Statement**
To preserve and share Lithuanian culinary heritage through a modern, accessible digital platform that makes traditional recipes discoverable and easy to follow for both Lithuanian speakers and international audiences interested in Lithuanian cuisine.

---

## 📊 Product Overview

### **Product Type**
Content-focused recipe website with advanced filtering and search capabilities

### **Target Market**
- **Primary:** Lithuanian speakers (Lithuania, diaspora communities)
- **Secondary:** International users interested in Lithuanian cuisine
- **Tertiary:** Food bloggers and culinary enthusiasts

### **Core Value Proposition**
- **Authentic Lithuanian recipes** with traditional and modern variations
- **Advanced filtering system** by ingredients, cooking time, difficulty, and categories
- **SEO-optimized content** for maximum discoverability
- **Mobile-first responsive design** for cooking while using mobile devices
- **Performance-optimized** for fast loading and smooth user experience

---

## 🏗️ Technical Architecture

### **Technology Stack**
- **Frontend:** Next.js 15.3.3 (React 18, App Router)
- **Styling:** Tailwind CSS with custom Lithuanian-focused design system
- **Database:** MongoDB with optimized collections structure
- **Image Storage:** AWS S3 (eu-north-1 region)
- **Hosting:** Vercel (recommended) or similar Next.js-compatible platform
- **Language:** Lithuanian (primary), English (future expansion)

### **Performance Requirements**
- **Page Load Time:** < 2.5s (LCP)
- **Cumulative Layout Shift:** < 0.1 (CLS)
- **First Input Delay:** < 100ms (FID)
- **Mobile Performance Score:** > 90 (Lighthouse)
- **SEO Score:** > 95 (Lighthouse)

### **Database Collections**
```
├── recipes_new (main recipe data)
├── categories_new (hierarchical category structure)
├── groups (meal categorization)
└── search_analytics (future: search tracking)
```

---

## 🎨 User Experience & Design

### **Design Principles**
1. **Lithuanian-First:** Content, terminology, and cultural context prioritized
2. **Mobile-First:** Responsive design optimized for cooking scenarios
3. **Performance-First:** Fast loading prioritized over complex features
4. **SEO-First:** Search engine optimization built into every component
5. **Accessibility:** WCAG 2.1 AA compliance for inclusive access

### **Visual Design System**
- **Primary Colors:** Orange (#F97316) for warmth and appetite appeal
- **Typography:** System fonts optimized for Lithuanian diacritics
- **Grid System:** 2 columns (mobile), 4 columns (desktop)
- **Component Library:** Custom Tailwind components for consistency

### **User Interface Components**
- **Recipe Cards:** Image, title, vital ingredients, time, servings
- **Filter System:** Category filters + time filters with client-side performance
- **Search Bar:** Fuzzy matching with Lithuanian character normalization
- **Navigation:** Hierarchical breadcrumbs with category-based structure
- **Recipe Pages:** Step-by-step instructions with timing and images

---

## 🔍 Core Features

### **1. Recipe Discovery & Browsing**

#### **Category System**
```
/receptai/
├── karsti-patiekalai/ (Hot dishes)
├── sriubos/ (Soups)
├── kepiniai/ (Baked goods)
├── uzkandziai/ (Appetizers)
├── saldumynai-kepiniai/ (Desserts & pastries)
├── lietuviska-virtuve/ (Lithuanian cuisine)
├── vegetariski-receptai/ (Vegetarian recipes)
└── [additional categories]
```

#### **Recipe Grid Layout**
- **Mobile:** 2 columns for optimal touch interaction
- **Desktop:** 4 columns for efficient content density
- **Responsive gaps:** 16px (mobile), 24px (desktop)
- **Dynamic filtering:** Client-side for instant results

#### **Recipe Card Information**
- High-quality recipe image with S3 optimization
- Recipe title in Lithuanian
- 3-4 vital ingredients as orange pills
- Cooking time with prominent display
- Serving size (subtle display)
- Expandable ingredient list (click to expand/collapse)

### **2. Advanced Filtering System**

#### **Category Filters**
- **Dynamic generation** from recipe tags
- **Manual priority sorting** for optimal UX
- **Exclusive selection** (one filter at a time)
- **Performance optimized** (no recipe counts for speed)

#### **Time Filters**
- **Iki 30 min** (Up to 30 minutes)
- **30-60 min** (30-60 minutes)  
- **1-2 val** (1-2 hours)
- **Virš 2 val** (Over 2 hours)
- **Calculated from totalTimeMinutes** field
- **Exclusive selection** with visual feedback

#### **Filter Behavior**
- **Client-side filtering** for instant results
- **URL parameter updates** for bookmarking/sharing
- **Visual feedback** with orange active states
- **Combined filtering** (one time + one category filter)

### **3. Search Functionality**

#### **Search Features**
- **Fuzzy matching** with Lithuanian character support
- **MongoDB text indexing** for performance
- **Query-based results** with applicable filters
- **SEO-friendly URLs:** `/paieska?q=search-term`
- **No autocomplete** (performance priority)

#### **Search Results**
- Same grid layout as category pages
- Dynamic filter application based on results
- Search term highlighting in results
- Empty state with helpful suggestions

### **4. Recipe Pages**

#### **Recipe Page Structure**
- **Hero image** with optimized loading
- **Recipe metadata:** time, servings, difficulty
- **Ingredient list** with quantities and notes
- **Step-by-step instructions** with timing
- **Breadcrumb navigation** for context
- **SEO optimization** with Schema.org markup

#### **Recipe Data Schema**
```javascript
{
  slug: "unique-recipe-identifier",
  canonicalUrl: "https://ragaujam.lt/receptas/[slug]",
  title: { lt: "Lithuanian title" },
  description: { lt: "Recipe description" },
  primaryCategoryPath: "receptai/category-name",
  totalTimeMinutes: 60,
  ingredients: [{ name: {lt: ""}, quantity: "", vital: boolean }],
  instructions: [{ step: 1, text: {lt: ""}, timeMinutes: 10 }],
  image: { src: "S3-url", alt: "Lithuanian alt text", width: 1200, height: 800 },
  tags: ["lithuanian", "category", "tags"],
  // ... additional SEO and metadata fields
}
```

---

## 🔧 Technical Features

### **1. SEO Optimization**

#### **Sitemap Generation**
- **Dynamic sitemap** (`/sitemap.xml`) with automatic updates
- **Search sitemap** (`/sitemap-search.xml`) for popular terms
- **Next.js sitemap integration** with build-time generation
- **Google Search Console** integration ready

#### **Structured Data**
- **Schema.org Recipe markup** on every recipe page
- **SearchAction schema** for search functionality
- **Organization markup** for brand recognition
- **Breadcrumb markup** for navigation context

#### **Meta Optimization**
- **Dynamic meta titles** with Lithuanian keywords
- **Optimized meta descriptions** under 160 characters
- **Open Graph tags** for social sharing
- **Canonical URLs** for duplicate content prevention

### **2. Performance Optimization**

#### **Image Optimization**
- **AWS S3 integration** with eu-north-1 region
- **Next.js Image component** with automatic optimization
- **WebP/AVIF format** generation
- **Responsive images** with proper sizing
- **Blur placeholders** for smooth loading

#### **Database Performance**
- **MongoDB indexing** for fast queries
- **Optimized aggregation** pipelines
- **Connection pooling** for scalability
- **Query optimization** for filtering operations

#### **Frontend Performance**
- **Server-side rendering** for initial page loads
- **Client-side filtering** for instant interactions
- **Code splitting** with Next.js automatic optimization
- **Minimal JavaScript** bundle size

### **3. Content Management**

#### **Recipe Creation**
- **MongoDB Compass** scripts for bulk recipe creation
- **Standardized schema** for consistency
- **Image upload** to S3 with proper naming
- **SEO metadata** generation tools

#### **Category Management**
- **Hierarchical category** structure
- **Automatic category** creation from recipes
- **Filter generation** from recipe tags
- **Manual priority** sorting for filters

---

## 📱 Responsive Design

### **Mobile Experience (< 1024px)**
- **2-column recipe grid** for optimal touch targets
- **Simplified navigation** with hamburger menu
- **Touch-friendly filters** with adequate spacing
- **Optimized images** for mobile bandwidth
- **Swipe gestures** for recipe card interactions

### **Desktop Experience (≥ 1024px)**
- **4-column recipe grid** for content density
- **Expanded navigation** with full category visibility
- **Hover interactions** for enhanced UX
- **Larger images** with better quality
- **Keyboard navigation** support

### **Tablet Experience (768px - 1023px)**
- **Adaptive layout** between mobile and desktop
- **3-column grid** for balanced content
- **Touch and mouse** interaction support
- **Optimized spacing** for tablet usage patterns

---

## 🌐 Internationalization (Future)

### **Current State**
- **Lithuanian-only** content and interface
- **UTF-8 encoding** for proper diacritic support
- **Lithuanian URL** structure and terminology

### **Future Expansion**
- **English translation** capability built into schema
- **Multi-language** URL routing
- **Cultural adaptation** for international audiences
- **Currency and measurement** localization

---

## 📈 Analytics & Monitoring

### **Performance Monitoring**
- **Core Web Vitals** tracking
- **Page load times** monitoring
- **Error tracking** and reporting
- **Database performance** metrics

### **User Analytics (Future)**
- **Recipe popularity** tracking
- **Search term** analysis
- **User journey** mapping
- **Conversion tracking** for engagement

### **SEO Monitoring**
- **Google Search Console** integration
- **Keyword ranking** tracking
- **Organic traffic** analysis
- **Recipe rich snippet** performance

---

## 🚀 Launch Strategy

### **Pre-Launch Checklist**
- [ ] **Domain setup** and SSL configuration
- [ ] **Google Search Console** property verification
- [ ] **Sitemap submission** to search engines
- [ ] **Performance testing** across devices
- [ ] **Content population** with initial recipes
- [ ] **SEO audit** and optimization
- [ ] **Mobile responsiveness** testing
- [ ] **Database backup** and recovery procedures

### **Launch Phases**

#### **Phase 1: Soft Launch**
- **Limited recipe** collection (50-100 recipes)
- **Core categories** implementation
- **Basic SEO** optimization
- **Performance monitoring** setup

#### **Phase 2: Content Expansion**
- **Recipe collection** growth (500+ recipes)
- **Additional categories** and filters
- **Enhanced search** functionality
- **User feedback** integration

#### **Phase 3: Feature Enhancement**
- **Advanced filtering** options
- **Recipe recommendations** system
- **Social sharing** features
- **Performance optimizations**

---

## 🎯 Success Metrics

### **Technical KPIs**
- **Page Load Speed:** < 2.5s LCP
- **Mobile Performance:** > 90 Lighthouse score
- **SEO Score:** > 95 Lighthouse score
- **Uptime:** > 99.9%

### **Content KPIs**
- **Recipe Collection:** 1000+ recipes by end of year 1
- **Category Coverage:** All major Lithuanian cuisine categories
- **Search Coverage:** 500+ indexed search terms
- **Content Quality:** Average 4.5+ star ratings

### **User Experience KPIs**
- **Bounce Rate:** < 40%
- **Average Session Duration:** > 3 minutes
- **Pages per Session:** > 2.5
- **Mobile Usage:** > 60% of traffic

### **SEO KPIs**
- **Organic Traffic:** Primary traffic source
- **Keyword Rankings:** Top 10 for target Lithuanian recipe terms
- **Rich Snippets:** 80%+ recipe pages with rich snippets
- **Click-Through Rate:** > 5% from search results

---

## 🔮 Future Roadmap

### **Short-term (3-6 months)**
- **Recipe collection** expansion to 500+ recipes
- **Advanced search** with ingredient-based filtering
- **Recipe rating** and review system
- **Social sharing** optimization

### **Medium-term (6-12 months)**
- **User accounts** and recipe saving
- **Shopping list** generation from recipes
- **Recipe recommendations** based on preferences
- **Mobile app** development consideration

### **Long-term (12+ months)**
- **English language** support
- **Recipe video** integration
- **Community features** (user-submitted recipes)
- **Meal planning** functionality
- **Nutrition information** integration

---

## 📞 Contact & Support

**Project Owner:** Solo Developer  
**Technical Stack:** Next.js, MongoDB, AWS S3  
**Deployment:** Ready for production launch  
**Documentation:** Comprehensive setup and deployment guides included  

---

*This PRD represents the current state of Paragaujam.lt as a production-ready Lithuanian recipe website with advanced SEO optimization, performance features, and scalable architecture.*
