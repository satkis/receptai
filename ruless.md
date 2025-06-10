You are an expert in modern full-stack web development and the following stack: JavaScript, Node.js, React (with Next.js App Router), Tailwind CSS, DaisyUI, NextAuth, MongoDB, and Mongoose. My project is a Next.js-based recipe website.

I've made many changes with an LLM, so my workspace now contains many new files and folders — some may be unnecessary, temporary, or incorrectly structured.

I need you to:

🔍 1. Analyze the full workspace

Go through every folder and file in the codebase

Identify whether each file is: essential / redundant / for dev only / for production / can be removed or merged

Return a detailed table with the following columns:

Path

Type (component, layout, config, helper, static asset, env, etc.)

Keep? (Yes, No, or Refactor)

Why? (1–2 sentence reason explaining the decision)

📁 2. Suggest file/folder structure improvements

Follow ShipFast naming conventions:

kebab-case for folders

PascalCase for component filenames

camelCase for variables and function naimage.pngmes

Prefix components by type: ButtonSignIn, CardRecipe, etc.

Ensure components are modular and located logically (e.g., app/, components/, lib/, utils/, schemas/, hooks/, api/, public/, etc.)

🌐 3. Prepare the project for DEV and PROD environments

Explain how to organize .env.local, .env.production, and how to keep secrets out of Git

Describe best practices to enable smooth deployment (e.g. Vercel or other)

Advise how to switch between environments

🚀 4. Optimize for SEO, performance, and production

Check for best practices: metadata, canonical tags, Open Graph, structured data (JSON-LD)

Minimize layout shift (CLS) and largest contentful paint (LCP)

Suggest lazy loading and optimization for images (e.g., WebP, responsive sizing)

Limit use client, useState, useEffect; use React Server Components and SSR where appropriate

Wrap dynamic or non-critical components in <Suspense> with fallback

🎨 5. Follow UI/UX and styling best practices

Ensure mobile-first responsive design using Tailwind CSS

Follow DaisyUI usage conventions

Recommend if any components need redesign or reorganization for better UX

Confirm all pages are styled and performant for fast interaction (FID)

6. Database.

suggest if there's optimization needed on the DB collections' schemas.

Please:

Ask me if something is unclear or if you need to explore any file contents

my current mongoDB collections and schemas:

Collections:
categories
filter definitions
groups
page_configs
recipes

Schemas:

CATEGORIES:
{
  "_id": {
    "$oid": "68474466b385d15ecb6fc7f0"
  },
  "label": {
    "lt": "Karšti patiekalai",
    "en": "Hot Dishes"
  },
  "slug": "karsti-patiekalai",
  "parentSlug": "receptai",
  "type": "main-category",
  "subcategories": [
    {
      "label": "Kepsniai ir karbonadai",
      "slug": "kepsniai-karbonadai"
    },
    {
      "label": "Troškiniai",
      "slug": "troskiniai"
    },
    {
      "label": "Apkepai",
      "slug": "apkepai"
    },
    {
      "label": "Košės ir tyrės",
      "slug": "koses-tyres"
    }
  ],
  "seo": {
    "title": "Karšti patiekalai - Receptai | Paragaujam.lt",
    "description": "Skanūs karštų patiekalų receptai: kepsniai, troškiniai, apkepai ir košės. Lengvi ir skanūs receptai kiekvienai dienai.",
    "keywords": [
      "karšti patiekalai",
      "kepsniai",
      "troškiniai",
      "receptai"
    ]
  },
  "order": 1,
  "isActive": true
}

FILTER_DEFINITIONS:
{
  "_id": {
    "$oid": "6846ea47b385d15ecb6fc77e"
  },
  "type": "timeRequired",
  "key": "2h",
  "label": {
    "lt": "iki 2 val.",
    "en": "≤2h"
  },
  "icon": "🕕",
  "color": "#9C27B0",
  "order": 4,
  "active": true,
  "metadata": {
    "maxMinutes": 120
  }
}

GROUPS:
{
  "_id": {
    "$oid": "6846ea96b385d15ecb6fc794"
  },
  "slug": "30-minuciu-patiekalai",
  "label": {
    "lt": "30 minučių patiekalai",
    "en": "30-Minute Meals"
  },
  "description": {
    "lt": "Greiti ir skanūs patiekalai, kuriuos galima paruošti per 30 minučių",
    "en": "Quick and delicious meals that can be prepared in 30 minutes"
  },
  "icon": "🕐",
  "color": "#FF9800",
  "priority": 1,
  "filters": {
    "maxTimeMinutes": 30,
    "autoInclude": true
  },
  "createdAt": {
    "$date": "2024-01-15T10:00:00.000Z"
  }
}

PAGE_CONFIGS:
{
  "_id": {
    "$oid": "6847112db385d15ecb6fc7db"
  },
  "slug": "uzkandžiai",
  "category": "mealType",
  "categoryValue": "uzkandžiai",
  "seo": {
    "title": "Užkandžių receptai - Paragaujam.lt",
    "description": "Skanūs užkandžių receptai šventėms ir kasdienai. Lengvi ir greitai paruošiami užkandžiai.",
    "keywords": [
      "užkandžiai",
      "receptai",
      "šventės",
      "vaišės"
    ],
    "canonicalUrl": "/receptai/uzkandžiai"
  },
  "quickFilters": [
    {
      "type": "timeRequired",
      "values": [
        "15min",
        "30min"
      ],
      "order": 1,
      "label": {
        "lt": "Laikas",
        "en": "Time"
      }
    },
    {
      "type": "dietary",
      "values": [
        "vegetariski",
        "veganiski"
      ],
      "order": 2,
      "label": {
        "lt": "Dieta",
        "en": "Diet"
      }
    },
    {
      "type": "customTags",
      "values": [
        "šventėms",
        "vaikams"
      ],
      "order": 3,
      "label": {
        "lt": "Proga",
        "en": "Occasion"
      }
    }
  ],
  "active": true,
  "createdAt": {
    "$date": "2024-01-15T10:00:00.000Z"
  }
}

RECIPES:
{
  "_id": {
    "$oid": "68474fb8b385d15ecb6fc84d"
  },
  "slug": "recipe-slug-here",
  "title": {
    "lt": "Test Recipe Title",
    "en": "Test Recipe Title"
  },
  "description": {
    "lt": "Test recipe description",
    "en": "Test recipe description"
  },
  "language": "lt",
  "translations": [
    "en"
  ],
  "image": "/images/test-recipe.jpg",
  "status": "published",
  "servings": 4,
  "servingsUnit": "porcijos",
  "ingredients": [
    {
      "name": {
        "lt": "Test ingredient 1",
        "en": "Test ingredient 1"
      },
      "quantity": "100g",
      "vital": true
    },
    {
      "name": {
        "lt": "Test ingredient 2",
        "en": "Test ingredient 2"
      },
      "quantity": "200g",
      "vital": false
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": {
        "lt": "First step description",
        "en": "First step description"
      }
    },
    {
      "step": 2,
      "description": {
        "lt": "Second step description",
        "en": "Second step description"
      }
    }
  ],
  "nutrition": {
    "calories": 300,
    "fat": 10,
    "protein": 15,
    "carbs": 45
  },
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "totalTimeMinutes": 45,
  "rating": {
    "average": 4.5,
    "count": 10
  },
  "commentsCount": 3,
  "author": {
    "userId": null,
    "name": "System",
    "profileUrl": "/user/system"
  },
  "createdAt": {
    "$date": "2024-01-15T10:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-01-15T10:00:00.000Z"
  },
  "categories": {
    "cuisine": "Lietuviška",
    "dietary": [],
    "seasonal": [
      "Vasara"
    ],
    "nutritionFocus": [
      "Baltymai"
    ],
    "occasion": [
      "Kasdien"
    ],
    "main": "Category Main Name",
    "sub": "Subcategory Name",
    "timeGroup": "iki 1 val.",
    "dishType": "Test Dish"
  },
  "breadcrumb": {
    "main": {
      "label": "Category Main Name",
      "slug": "category-slug"
    },
    "sub": {
      "label": "Subcategory Name",
      "slug": "subcategory-slug"
    }
  },
  "categoryPath": "category-slug/subcategory-slug",
  "groupIds": [],
  "groupLabels": [
    "45 minučių"
  ],
  "seo": {
    "metaTitle": "Test Recipe Title - Receptas | Paragaujam.lt",
    "metaDescription": "Test recipe description for SEO",
    "keywords": [
      "test",
      "recipe",
      "cooking"
    ],
    "canonicalUrl": "/receptai/category-slug/subcategory-slug/recipe-slug-here",
    "breadcrumbSchema": {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Receptai",
          "item": "https://paragaujam.lt/receptai"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Category Main Name",
          "item": "https://paragaujam.lt/receptai/category-slug"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Subcategory Name",
          "item": "https://paragaujam.lt/receptai/category-slug/subcategory-slug"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Test Recipe Title",
          "item": "https://paragaujam.lt/receptai/category-slug/subcategory-slug/recipe-slug-here"
        }
      ]
    }
  },
  "schemaOrg": {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "Test Recipe Title",
    "description": "Test recipe description",
    "prepTime": "PT15M",
    "cookTime": "PT30M",
    "totalTime": "PT45M",
    "recipeYield": "4 porcijos",
    "recipeIngredient": [
      "100g test ingredient 1",
      "200g test ingredient 2"
    ],
    "recipeInstructions": [
      {
        "@type": "HowToStep",
        "text": "First step description"
      },
      {
        "@type": "HowToStep",
        "text": "Second step description"
      }
    ],
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": "300 calories"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  }
}