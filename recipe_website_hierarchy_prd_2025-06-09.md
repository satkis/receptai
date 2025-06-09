
# 📄 Recipe Website Category Hierarchy & SEO PRD

**Date:** 2025-06-09  
**Author:** AI System (Based on discussion with project owner)  
**Target:** Implementation via LLM in Cursor environment (Next.js based)  
**Goal:** Structure recipe website for optimal SEO, user experience, and dynamic scalability.

---

## 🎯 Objective

Design a category hierarchy structure with clean URL routing and SEO-focused pages for a Lithuanian recipe website. Enable:

- Breadcrumb navigation for UX + structured data SEO
- Dynamic and static pages for main categories, subcategories, and recipe-level paths
- Sitemap integration for Google crawling
- Filterable landing pages by cooking time, cuisine, and dietary restrictions
- Multilingual support in future

---

## 🧭 URL Structure

| Page Type                  | Example URL                                                  |
|---------------------------|--------------------------------------------------------------|
| All Recipes Landing       | `/receptai`                                                  |
| Main Category             | `/receptai/vistiena`                                         |
| Subcategory               | `/receptai/vistiena/salotos`                                 |
| Specific Recipe           | `/receptai/vistiena/salotos/vistienos-su-avokadu`           |
| Time-Based Recipes        | `/receptai/15-min-patiekalai`                                |
| Cuisine-Based Recipes     | `/receptai/itališki`                                         |
| Dietary-Based Recipes     | `/receptai/be-glitimo`                                       |

---

## 🗂️ Hierarchy Design

# 🥘 Receptų Kategorijos ir subkategorijos

## 🥘 Patiekalo tipas
- Karšti patiekalai
  - Kepsniai ir karbonadai
  - Troškiniai
  - Apkepai
  - Košės ir tyrės
- Sriubos
  - Klasikinės sriubos
  - Vištienos sriuba
  - Daržovių sriubos
  - Rūgštynių sriuba
- Užkandžiai
  - Vieno kąsnio užkandžiai
  - Užkandžiai prie alaus
  - Sumuštiniai
- Garnyrai
  - Bulvių garnyrai
  - Ryžiai, grikiai
  - Makaronai
- Salotos ir mišrainės
  - Vištienos salotos
  - Jautienos salotos
  - Daržovių salotos
- Picos
- Blynai ir vafliai
- Kremai ir padažai
- Konservuoti patiekalai

## 🥩 Pagal pagrindinį ingredientą
- Vištiena
  - Vištienos patiekalai
  - Vištienos salotos
- Jautiena
  - Jautienos patiekalai
  - Troškiniai iš jautienos
- Kiauliena
  - Kiaulienos patiekalai
  - Kepsniai ir kotletai
- Žuvis ir jūros gėrybės
  - Žuvies patiekalai
  - Receptai su lašiša
  - Receptai su silke
  - Jūros gėrybių patiekalai
- Paukštiena
- Aviena
- Veršiena
- Žvėriena
- Grybai
- Daržovės
  - Daržovių troškiniai
- Bulvės
- Kiaušiniai ir pieno produktai
- Miltai ir kruopos
- Soja
- Vaisiai ir uogos
- Riešutai
- Šokoladas
- Makaronai

## 🍰 Saldumynai ir kepiniai
- Desertai
- Pyragai
  - Obuolių pyragai
  - Šokoladiniai pyragai
- Keksai ir keksiukai
- Tortai
- Saldūs apkepai
- Sausainiai
- Naminiai ledai

## 🥦 Mitybos pasirinkimai / Dietiniai
- Sveiki patiekalai
- Be glitimo
- Be laktozės
- Keto receptai
- Vegetariški patiekalai
- Veganiški receptai

## 👶 Vaikiški patiekalai
- Maistas vaikams
- Patrauklūs receptai šeimai

## 🕒 Pagal laiką
- iki 30 min.
- 30–60 min.
- 1-2 val.
- virš 2 val. 
- Lėti troškiniai
- Savaitgalio patiekalai

## 🧑‍🍳 Proga
- Gimtadieniui
- Velykoms
- Kalėdoms
- Kūčioms
- Naujiesiems metams
- Valentino dienai
- Mamos dienai
- Tėvo dienai
- Joninėms
- Užgavėnėms
- Helovinui
- Vestuvėms
- Pyragų dienai
- Iškylai

## 🌍 Pasaulio virtuvė
- Lietuvos virtuvė
- Italijos virtuvė
- Ispanijos virtuvė
- Prancūzijos virtuvė
- Amerikos virtuvė
- Meksikos virtuvė
- Indijos virtuvė
- Kinijos virtuvė
- Japonijos virtuvė
- Tailando virtuvė
- Graikijos virtuvė
- Turkijos virtuvė
- Vokietijos virtuvė
- Rusijos virtuvė
- Ukrainos virtuvė
- Lenkijos virtuvė
- Latvijos virtuvė
- Čekijos virtuvė
- Skandinavijos virtuvės


## 🍹 Gėrimai
- Nealkoholiniai gėrimai
- Kava / arbata
- Alkoholiniai kokteiliai
  - Degtinės kokteiliai
  - Romo kokteiliai
  - Brendžio kokteiliai
  - Džino kokteiliai
  - Tekilos kokteiliai
  - Šampano kokteiliai

## 🧂 Papildoma
- Padažai ir užpilai
- Konservavimas (marinatai, uogienės, atsargos žiemai)


---


### Filters for Custom Pages
- **Time-based:** 15-min-patiekalai, 30-min-patiekalai, 1-val-patiekalai
- **Cuisine:** Itališki, Japoniški, Lietuviški, Indiski
- **Diet:** Be glitimo, Be laktozės, Vegetariški, Keto

---

## 🧬 Data Structure

### Recipes Collection

```ts
{
  title: "Vištienos salotos su avokadu",
  slug: "vistienos-salotos-su-avokadu",
  categories: {
    main: "Vištiena",
    sub: "Salotos",
    cuisine: "Itališka",
    timeGroup: "15 min",
    dietary: ["Be glitimo"]
  },
  ...
}
```

### Categories Collection

```ts
{
  label: "Vištiena",
  slug: "vistiena",
  parentSlug: "receptai",
  type: "main-category"
}
```

---

## 🧭 Breadcrumb Strategy

Dynamic generation from recipe data:
```
Pagrindinis > Receptai > Vištiena > Salotos > Vištienos salotos su avokadu
```

### SEO Schema.org Example:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Receptai",
      "item": "https://domain.lt/receptai"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Vištiena",
      "item": "https://domain.lt/receptai/vistiena"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Salotos",
      "item": "https://domain.lt/receptai/vistiena/salotos"
    }
  ]
}
```

---

## ⚙️ Technical Stack Notes

- Framework: Next.js (using file-based routing)
- Recommended: Use ISR or SSG for category/subcategory pages
- Slug-based dynamic routing under `/pages/receptai/[category]/[subcategory]/[slug].tsx`

---

## 🗺️ Sitemap & SEO Optimization

- Generate sitemap dynamically using `next-sitemap`
- Include all category and subcategory pages
- Add static metadata (`meta title`, `description`, Open Graph) per page
- Serve featured recipes if category is empty
- Future: Add alternate language support using `/lt/`, `/en/` route prefixes

---

## 🏁 Summary

This structure will:
- Help users easily explore content
- Improve site’s internal linking & crawl depth
- Support robust SEO and long-tail keyword matching
- Provide structured breadcrumb trails
- Scale well with new content, categories, or languages

