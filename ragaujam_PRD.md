# 🥣 Lithuanian Recipe Website – Product Requirements Document

## Overview

A multilingual, SEO-optimized recipe website that allows users to browse, filter, and eventually submit recipes. The MVP will focus on Lithuanian content, then expand to support English and other languages. Recipes are grouped by manually curated tags (e.g., "vegetariška", "30 minučių") and searchable using various filters (e.g., cuisine, dietary, cooking time). MongoDB will be used with indexing to support fast filtering and future scalability.

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

  tips: {
    lt: [
      "**Paruošimas:** Vištienos gabalėlius pjaustykite vienodo dydžio",
      "**Gaminimas:** Kepkite ant stiprios ugnies, kad mėsa išliktų sultinga",
      "**Patiekimas:** Puikiai tinka su ryžiais ar bulvėmis"
    ],
    en: [
      "**Preparation:** Cut chicken pieces to equal size",
      "**Cooking:** Cook on high heat to keep meat juicy",
      "**Serving:** Goes great with rice or potatoes"
    ]
  },

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

- `GET /recipes?filters...` – filtered search with pagination
- `GET /recipes/:slug` – full recipe detail
- `GET /groups` – list of available group tags
- `POST /recipes` – create recipe (Phase 2: user-generated)

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

## Open Questions

- Do you want to include featured recipes/pinned content?
- Should we support image upload or just external links for images?
- Will you require moderation/approval flow for user-submitted recipes?
