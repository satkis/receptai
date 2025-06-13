# Product Requirements Document (PRD)
## Lithuanian Recipe Website - Paragaujam.lt

### 1. Executive Summary

**Product Name**: Paragaujam.lt  
**Product Type**: Lithuanian Recipe Discovery & Cooking Platform  
**Target Market**: Lithuanian-speaking home cooks and food enthusiasts  
**Primary Goal**: Create the leading Lithuanian recipe website with superior SEO performance and user experience  

**Vision Statement**: To become Lithuania's premier digital cookbook, helping users discover, cook, and share traditional and modern Lithuanian recipes with ease.

### 2. Product Overview

#### 2.1 Problem Statement
- Limited high-quality Lithuanian recipe websites with modern UX
- Poor search functionality for Lithuanian ingredients and cooking terms
- Lack of structured, SEO-optimized recipe content in Lithuanian
- No centralized platform for Lithuanian culinary heritage preservation

#### 2.2 Solution
A fast, SEO-optimized recipe website featuring:
- Comprehensive Lithuanian recipe database
- Advanced search with Lithuanian character support
- Mobile-first responsive design
- Rich structured data for Google recipe cards
- Performance-optimized for Core Web Vitals

#### 2.3 Success Metrics
- **SEO**: Top 3 Google rankings for "lietuviški receptai" keywords
- **Performance**: <2.5s LCP, <0.1 CLS, <100ms FID
- **User Engagement**: >3 minutes average session duration
- **Search**: <200ms search response times
- **Content**: 500+ recipes with complete structured data

### 3. Target Users

#### 3.1 Primary Users
- **Lithuanian Home Cooks** (25-55 years)
  - Looking for traditional family recipes
  - Want step-by-step cooking guidance
  - Need ingredient substitution suggestions

- **Food Enthusiasts** (20-45 years)
  - Exploring Lithuanian cuisine
  - Seeking authentic recipes with cultural context
  - Interested in modern takes on traditional dishes

#### 3.2 Secondary Users
- **Recipe Contributors** (30-65 years)
  - Sharing family recipes
  - Building cooking reputation
  - Preserving culinary traditions

### 4. Core Features

#### 4.1 Recipe Discovery
**Priority**: P0 (Must Have)

**Features**:
- Hierarchical category browsing (/category/subcategory)
- Advanced search with Lithuanian character normalization
- Filter by cooking time, difficulty, ingredients
- Featured recipes carousel
- Popular recipes section

**User Stories**:
- As a user, I want to search for "cepelinai" and find all dumpling recipes
- As a user, I want to filter recipes by cooking time under 30 minutes
- As a user, I want to browse recipes by main ingredient (chicken, pork, etc.)

#### 4.2 Recipe Display
**Priority**: P0 (Must Have)

**Features**:
- Structured recipe layout with ingredients and instructions
- Interactive ingredient checklist
- Step-by-step cooking timer
- Serving size calculator
- Print-friendly format
- Recipe rating system

**User Stories**:
- As a user, I want to check off ingredients as I add them
- As a user, I want to adjust recipe portions for different serving sizes
- As a user, I want to set timers for cooking steps

#### 4.3 Search Functionality
**Priority**: P0 (Must Have)

**Features**:
- Real-time search suggestions
- Lithuanian character support (ą, č, ę, ė, į, š, ų, ū, ž)
- Search by recipe name, ingredients, or tags
- Indexable search results pages (/paieska?q=term)
- Search result filtering

**Technical Requirements**:
- MongoDB text search with regex patterns
- Search response time <200ms
- SEO-friendly search URLs
- SearchAction schema markup

#### 4.4 SEO Optimization
**Priority**: P0 (Must Have)

**Features**:
- Recipe structured data (JSON-LD)
- Optimized meta tags for each recipe
- Canonical URLs for all content
- XML sitemap generation
- Open Graph tags for social sharing
- Lithuanian keyword optimization

**Technical Requirements**:
- Recipe schema markup on all recipe pages
- Automatic sitemap updates
- Core Web Vitals optimization
- Mobile-first indexing compliance

### 5. Technical Requirements

#### 5.1 Architecture
- **Frontend**: Next.js 15 with App Router
- **Backend**: Node.js API routes
- **Database**: MongoDB with optimized indexing
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting**: Vercel (recommended for Next.js)

#### 5.2 Performance Requirements
- **Page Load Speed**: <2.5s LCP
- **Search Response**: <200ms
- **Image Optimization**: WebP format, lazy loading
- **Bundle Size**: <500KB initial load
- **Mobile Performance**: 90+ Lighthouse score

#### 5.3 SEO Requirements
- **Structured Data**: Recipe schema on all recipe pages
- **Meta Tags**: Unique titles and descriptions
- **URL Structure**: SEO-friendly slugs
- **Sitemap**: Auto-generated XML sitemap
- **Canonical URLs**: Prevent duplicate content

#### 5.4 Database Schema
```
recipes_new: {
  _id: ObjectId,
  title: String,
  slug: String,
  description: String,
  image: String,
  ingredients: Array,
  instructions: Array,
  cookTimeMinutes: Number,
  prepTimeMinutes: Number,
  totalTimeMinutes: Number,
  servings: Number,
  difficulty: String,
  tags: Array,
  categoryIds: Array,
  categoryPath: String,
  breadcrumbs: Array,
  author: Object,
  createdAt: Date,
  updatedAt: Date
}

categories_new: {
  _id: ObjectId,
  name: String,
  slug: String,
  parentCategory: String,
  level: Number,
  path: String,
  fullPath: String,
  ancestors: Array
}
```

### 6. User Experience Requirements

#### 6.1 Navigation
- Clear hierarchical category structure
- Breadcrumb navigation on all pages
- Mobile-responsive hamburger menu
- Search bar prominently displayed

#### 6.2 Recipe Cards
- Recipe image with overlay text (time/servings)
- Full recipe title visibility
- 3-4 key ingredients in pill format
- Expandable ingredient list (+X more)
- No rating display (as per user preference)

#### 6.3 Mobile Experience
- 2-column recipe grid on mobile
- 3-column grid on desktop
- Touch-friendly interactive elements
- Fast loading on mobile networks

### 7. Content Requirements

#### 7.1 Recipe Content
- Minimum 100 recipes at launch
- Traditional Lithuanian dishes prioritized
- High-quality food photography
- Complete ingredient lists with measurements
- Step-by-step cooking instructions
- Cultural context and recipe history

#### 7.2 Categories
- Hierarchical structure without 'receptu-tipai' prefix
- Main categories: Pirmieji patiekalai, Antrieji patiekalai, Saldumynai, etc.
- Subcategories by main ingredient or cooking method
- SEO-optimized category descriptions

### 8. Launch Strategy

#### 8.1 Phase 1 (MVP)
- Core recipe browsing and search
- 100+ traditional Lithuanian recipes
- Basic SEO optimization
- Mobile-responsive design

#### 8.2 Phase 2 (Enhancement)
- User accounts and recipe favorites
- Recipe rating and reviews
- Advanced filtering options
- Recipe sharing functionality

#### 8.3 Phase 3 (Growth)
- User-generated content
- Recipe collections and meal planning
- Social features and community
- Mobile app development

### 9. Success Criteria

#### 9.1 Technical KPIs
- Core Web Vitals: All metrics in "Good" range
- Search Performance: <200ms average response time
- SEO Rankings: Top 5 for primary Lithuanian recipe keywords
- Uptime: 99.9% availability

#### 9.2 User KPIs
- Session Duration: >3 minutes average
- Bounce Rate: <40%
- Recipe Completion Rate: >60%
- Mobile Traffic: >70% of total visits

#### 9.3 Content KPIs
- Recipe Database: 500+ recipes within 6 months
- Search Coverage: 95% of Lithuanian cooking terms
- Image Quality: All recipes with high-resolution photos
- Structured Data: 100% recipe schema compliance

### 10. Risk Assessment

#### 10.1 Technical Risks
- **Performance**: Recipe images causing slow load times
- **Search**: Lithuanian character handling complexity
- **SEO**: Google algorithm changes affecting rankings
- **Scalability**: Database performance with growing content

#### 10.2 Content Risks
- **Quality**: Maintaining recipe accuracy and testing
- **Copyright**: Ensuring original or properly licensed content
- **Translation**: Accurate Lithuanian culinary terminology
- **Completeness**: Comprehensive ingredient and instruction details

#### 10.3 Mitigation Strategies
- Implement comprehensive image optimization
- Use CDN for static asset delivery
- Regular SEO audits and monitoring
- Automated testing for search functionality
- Content review process for recipe quality

### 11. Future Considerations

#### 11.1 Potential Features
- Recipe video integration
- Nutritional information calculator
- Shopping list generation
- Meal planning tools
- Recipe scaling calculator
- User recipe submissions

#### 11.2 Technical Evolution
- Progressive Web App (PWA) capabilities
- Offline recipe access
- Voice search integration
- AI-powered recipe recommendations
- Multi-language support (English, Russian)

This PRD serves as the foundation for developing Paragaujam.lt into Lithuania's premier recipe website, focusing on performance, SEO, and user experience excellence.
