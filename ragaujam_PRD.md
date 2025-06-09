# 🥣 Lithuanian Recipe Website – Product Requirements Document

## Overview

A multilingual, SEO-optimized recipe website that allows users to browse, filter, and eventually submit recipes. The MVP focuses on Lithuanian content with MongoDB Atlas cloud database. Recipes are grouped by manually curated tags (e.g., "vegetariška", "30 minučių") and searchable using various filters. Built with Next.js, React, Tailwind CSS, and DaisyUI with mobile-first design principles.

**Current Status:** ✅ MVP Phase 1 - Core functionality implemented with MongoDB Atlas integration.

## Goals

- Build a fast, scalable platform for recipe discovery.
- Provide a clear and localized UI in Lithuanian (English support planned).
- Allow users to browse recipes using combined filters (e.g., Vegan + Lithuanian + 30min).
- Enable recipe submissions by users in later phases.
- Prioritize mobile-first design and speed (LCP, TTI, SEO).

## Non-Goals

- No social features (likes, follows) in MVP.
- No account creation or login in phase 1.
- No full e-commerce/meal planning integration (possible later).

## Requirements

### Functional Requirements

#### ✅ Recipe Display
- Display recipes with:
  - Title, Description
  - Image
  - Cooking time (Total only in UI)
  - Portion size
  - Ingredients (3 main, "+X" for rest)
  - Badges from group tags (e.g., Vegetariška, 30 min.)
- Support both `lt` and `en` versions (fallback to `lt` if missing)
- Sortable by newest, total time, and rating
- Schema.org recipe metadata embedded

#### ✅ Filtering
- Filters available in UI:
  - Language (`lt`, `en`)
  - Dietary (`vegetariška`, `be glitimo`, etc.)
  - Cuisine
  - Group tags (`30 min`, `burgeriai`, `vaikiški`)
  - Time (e.g., ≤30 min)
- Filters can be **combined**
- Filter results paginated (e.g., 12 per page)

#### ✅ Group Tags
- Admin-defined tags stored in `groups` collection
- Recipes store `groupIds` + `groupLabels[]` at write time
- Tags shown as badges on each recipe card

#### ✅ Admin Tools (MVP via backend/API)
- CRUD for group tags
- Add new recipes via API (phase 1)
- Phase 2: simple UI for user submission

## Data Models

### 🍲 `recipes` Collection

```ts
{
  _id: ObjectId,
  slug: "vistyte-su-darzovemis",
  title: { lt: "Vištiena su daržovėmis", en: "Chicken with Vegetables" },
  description: { lt: "...", en: "..." },
  language: "lt",
  translations: ["en"],

  servings: 4,
  servingsUnit: "porcijos",

  ingredients: [
    { name: { lt: "Vištiena", en: "Chicken" }, quantity: "300g", vital: true },
    { name: { lt: "Morka", en: "Carrot" }, quantity: "2 vnt", vital: false }
  ],

  instructions: [...],
  nutrition: { calories: 500, fat: 20, protein: 30, carbs: 40 },



  groupIds: [ObjectId, ObjectId],
  groupLabels: ["30 minučių", "Vegetariška"],

  categories: {
    cuisine: "Lietuviška",
    dietary: ["be glitimo"],
    seasonal: ["Žiema"],
    nutritionFocus: ["Baltymai"],
    occasion: ["Kalėdos"]
  },

  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  totalTimeMinutes: 45,

  rating: { average: 4.5, count: 10 },
  commentsCount: 4,

  author: {
    userId: null,
    name: "System",
    profileUrl: "/user/system"
  },

  createdAt: ISODate,
  updatedAt: ISODate,

  seo: {
    metaTitle: "...",
    metaDescription: "...",
    keywords: ["vištiena", "lengvas receptas"]
  },

  schemaOrg: { ... }
}
```

### 🏷️ `groups` Collection

```ts
{
  _id: ObjectId,
  label: {
    lt: "30 minučių",
    en: "30 minutes"
  },
  slug: "30min",
  icon: "clock",
  priority: 1,
  createdAt: ISODate
}
```

## API Requirements

✅ **Implemented APIs:**
- `GET /api/recipes/mongodb?groupSlug=...&limit=...` – filtered search with pagination
- `GET /api/recipes/[slug]` – full recipe detail from MongoDB Atlas
- `GET /api/custom-groups` – list of available group tags
- `POST /recipes` – create recipe (Phase 2: user-generated)

✅ **Database Connection:**
- MongoDB Atlas cloud database with username/password authentication
- Environment variables configured in `.env.local`
- Connection string: `mongodb+srv://username:password@cluster.mongodb.net/receptai`

## Indexing Strategy (MongoDB)

- Compound index on: { language: 1, totalTimeMinutes: 1, groupIds: 1 }
- Secondary indexes:
  - { slug: 1 }
  - { groupIds: 1 }
  - { createdAt: -1 }
  - { rating.average: -1 }
- Full-text indexes (optional later) for title/description search

## Success Metrics

- Page load time < 2s (mobile)
- Recipe detail bounce rate < 35%
- At least 1,000 indexed recipes by Q4
- Filters return results < 150ms at 10k+ recipes

## ✅ Current Implementation Status

### **Completed Features:**
- ✅ **MongoDB Atlas Integration** - Cloud database with authentication
- ✅ **Recipe Display System** - Clean layout with ingredients and instructions
- ✅ **Filtering & Search** - Group-based filtering with pagination
- ✅ **Mobile-First Design** - Responsive layout with Tailwind CSS
- ✅ **Lithuanian UI** - All interface text in Lithuanian
- ✅ **Clean Ingredients List** - Simple layout with icons and cross-out functionality
- ✅ **Recipe Cards** - 2 side-by-side on mobile, 3 on desktop
- ✅ **SEO Optimization** - Schema.org metadata and structured data

### **Architecture:**
- **Frontend:** Next.js 14 + React + TypeScript
- **Styling:** Tailwind CSS + DaisyUI
- **Database:** MongoDB Atlas (Cloud)
- **Deployment:** Ready for Vercel/Netlify

### **File Structure:**
```
/pages
  /api
    /recipes
      [slug].ts          # Individual recipe API
      mongodb.ts         # Recipe search/filter API
    custom-groups.ts     # Group tags API
  /recipes
    [slug].tsx          # Recipe detail page
  new-recipes.tsx       # Recipe listing page
  index.tsx            # Homepage

/components
  NewRecipeCard.tsx     # Recipe card component
  Layout.tsx           # Main layout wrapper
  Header.tsx           # Navigation header

/utils
  ingredientIcons.ts    # Ingredient icon mapping
  multilingual.ts      # Language utilities
```

## Open Questions

- Do you want to include featured recipes/pinned content?
- Should we support image upload or just external links for images?
- Will you require moderation/approval flow for user-submitted recipes?
