// Recipe Category Mapping Utility
// Maps existing recipes to new category hierarchy

export interface RecipeCategoryMapping {
  main: string;
  sub: string;
  cuisine?: string;
  timeGroup?: string;
  dietary?: string[];
  occasion?: string[];
  dishType?: string;
}

export interface BreadcrumbData {
  main: { label: string; slug: string };
  sub: { label: string; slug: string };
}

// Mapping rules based on recipe titles and existing categories
export function mapRecipeToCategories(recipe: any): {
  categories: RecipeCategoryMapping;
  breadcrumb: BreadcrumbData;
} {
  const title = recipe.title?.lt?.toLowerCase() || '';
  const existingCategories = recipe.categories || {};
  
  // Default mapping
  let main = "Karšti patiekalai";
  let sub = "Kepsniai ir karbonadai";
  let mainSlug = "karsti-patiekalai";
  let subSlug = "kepsniai-karbonadai";

  // 🥩 Ingredient-based mapping
  if (title.includes('vištiena') || title.includes('vištienos') || title.includes('chicken')) {
    main = "Vištiena";
    mainSlug = "vistiena";
    
    if (title.includes('salotos') || title.includes('salad')) {
      sub = "Vištienos salotos";
      subSlug = "vistienos-salotos";
    } else {
      sub = "Vištienos patiekalai";
      subSlug = "vistienos-patiekalai";
    }
  }
  else if (title.includes('jautiena') || title.includes('jautienos') || title.includes('beef')) {
    main = "Jautiena";
    mainSlug = "jautiena";
    
    if (title.includes('troškinys') || title.includes('stew')) {
      sub = "Troškiniai iš jautienos";
      subSlug = "jautienos-troskiniai";
    } else {
      sub = "Jautienos patiekalai";
      subSlug = "jautienos-patiekalai";
    }
  }
  else if (title.includes('žuvis') || title.includes('žuvies') || title.includes('lašiša') || title.includes('fish') || title.includes('salmon')) {
    main = "Žuvis ir jūros gėrybės";
    mainSlug = "zuvis";
    
    if (title.includes('lašiša') || title.includes('salmon')) {
      sub = "Receptai su lašiša";
      subSlug = "lasisa";
    } else {
      sub = "Žuvies patiekalai";
      subSlug = "zuvies-patiekalai";
    }
  }
  
  // 🍰 Dessert mapping
  else if (title.includes('tortas') || title.includes('tortai') || title.includes('cake')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Tortai";
    subSlug = "tortai";
  }
  else if (title.includes('pyragas') || title.includes('pyragai') || title.includes('pie')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Pyragai";
    subSlug = "pyragai";
  }
  else if (title.includes('keksas') || title.includes('keksai') || title.includes('muffin')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Keksai";
    subSlug = "keksai";
  }
  else if (title.includes('sausainis') || title.includes('sausainiai') || title.includes('cookie')) {
    main = "Desertai";
    mainSlug = "desertai";
    sub = "Sausainiai";
    subSlug = "sausainiai";
  }
  
  // 🥣 Soup mapping
  else if (title.includes('sriuba') || title.includes('sriubos') || title.includes('soup')) {
    main = "Sriubos";
    mainSlug = "sriubos";
    
    if (title.includes('vištienos')) {
      sub = "Vištienos sriuba";
      subSlug = "vistienos-sriuba";
    } else if (title.includes('daržovių') || title.includes('vegetable')) {
      sub = "Daržovių sriubos";
      subSlug = "darzoviu-sriubos";
    } else if (title.includes('rūgštynių')) {
      sub = "Rūgštynių sriuba";
      subSlug = "rugstynių-sriuba";
    } else {
      sub = "Klasikinės sriubos";
      subSlug = "klasikines-sriubos";
    }
  }
  
  // 🥗 Salad mapping
  else if (title.includes('salotos') || title.includes('salad')) {
    main = "Salotos ir mišrainės";
    mainSlug = "salotos";
    
    if (title.includes('vištienos')) {
      sub = "Vištienos salotos";
      subSlug = "vistienos-salotos";
    } else if (title.includes('jautienos')) {
      sub = "Jautienos salotos";
      subSlug = "jautienos-salotos";
    } else {
      sub = "Daržovių salotos";
      subSlug = "darzoviu-salotos";
    }
  }
  
  // 🍞 Snack mapping
  else if (title.includes('sumuštinis') || title.includes('sumustiniai') || title.includes('sandwich')) {
    main = "Užkandžiai";
    mainSlug = "uzkandziai";
    sub = "Sumuštiniai";
    subSlug = "sumustiniai";
  }
  else if (title.includes('užkandis') || title.includes('užkandžiai') || title.includes('snack')) {
    main = "Užkandžiai";
    mainSlug = "uzkandziai";
    sub = "Vieno kąsnio užkandžiai";
    subSlug = "vieno-kasnio";
  }

  // Determine time group
  let timeGroup = "30–60 min.";
  const totalTime = recipe.totalTimeMinutes || 45;
  if (totalTime <= 15) {
    timeGroup = "iki 15 min.";
  } else if (totalTime <= 30) {
    timeGroup = "iki 30 min.";
  } else if (totalTime <= 60) {
    timeGroup = "30–60 min.";
  } else if (totalTime <= 120) {
    timeGroup = "1-2 val.";
  } else {
    timeGroup = "virš 2 val.";
  }

  // Determine cuisine (use existing or default to Lithuanian)
  let cuisine = existingCategories.cuisine || "Lietuviška";
  
  // Map existing cuisine values
  const cuisineMapping: { [key: string]: string } = {
    "Lietuviška": "Lietuvos virtuvė",
    "Itališka": "Italijos virtuvė",
    "Azijietiška": "Kinijos virtuvė",
    "Amerikietiška": "Amerikos virtuvė"
  };
  cuisine = cuisineMapping[cuisine] || cuisine;

  // Determine dietary restrictions
  let dietary: string[] = [];
  if (existingCategories.dietary) {
    const dietaryMapping: { [key: string]: string } = {
      "vegetariška": "Vegetariški patiekalai",
      "veganiška": "Veganiški receptai",
      "be glitimo": "Be glitimo",
      "be laktozės": "Be laktozės",
      "keto": "Keto receptai"
    };
    
    dietary = existingCategories.dietary.map((diet: string) => 
      dietaryMapping[diet] || diet
    );
  }

  // Determine dish type
  let dishType = "Karšti patiekalai";
  if (main === "Sriubos") dishType = "Sriubos";
  else if (main === "Užkandžiai") dishType = "Užkandžiai";
  else if (main === "Salotos ir mišrainės") dishType = "Salotos ir mišrainės";
  else if (main === "Desertai") dishType = "Saldumynai ir kepiniai";

  return {
    categories: {
      main,
      sub,
      cuisine,
      timeGroup,
      dietary,
      dishType
    },
    breadcrumb: {
      main: { label: main, slug: mainSlug },
      sub: { label: sub, slug: subSlug }
    }
  };
}

// Recipe update utility
export function updateRecipeWithCategories(recipe: any) {
  const { categories, breadcrumb } = mapRecipeToCategories(recipe);
  
  return {
    ...recipe,
    categories: {
      ...recipe.categories,
      ...categories
    },
    breadcrumb,
    // Update slug structure for new hierarchy
    categoryPath: `${breadcrumb.main.slug}/${breadcrumb.sub.slug}`,
    // SEO enhancements
    seo: {
      ...recipe.seo,
      canonicalUrl: `/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}/${recipe.slug}`,
      breadcrumbSchema: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Receptai",
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/receptai`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumb.main.label,
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/receptai/${breadcrumb.main.slug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": breadcrumb.sub.label,
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": recipe.title.lt,
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/receptai/${breadcrumb.main.slug}/${breadcrumb.sub.slug}/${recipe.slug}`
          }
        ]
      }
    }
  };
}
