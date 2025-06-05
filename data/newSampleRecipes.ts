import { Recipe } from '@/types';

export const newSampleRecipes: Recipe[] = [
  {
    _id: '1',
    slug: 'chicken-soup',
    
    title: {
      lt: 'Vištienos sriuba',
      en: 'Chicken Soup'
    },
    
    description: {
      lt: 'Soti ir skani sriuba šaltam vakarui.',
      en: 'Hearty and tasty soup for a cold evening.'
    },
    
    author: {
      name: 'Chef Maria',
      profileUrl: '/user/chef-maria'
    },
    
    status: 'public',
    language: 'lt',
    translations: ['en'],
    
    servings: 4,
    servingsUnit: 'servings',
    
    ingredients: [
      {
        name: {
          lt: 'Vištiena',
          en: 'Chicken'
        },
        quantity: '300g',
        vital: true
      },
      {
        name: {
          lt: 'Morka',
          en: 'Carrot'
        },
        quantity: '2 vnt.',
        vital: true
      },
      {
        name: {
          lt: 'Svogūnas',
          en: 'Onion'
        },
        quantity: '1 vnt.',
        vital: true
      },
      {
        name: {
          lt: 'Bulvės',
          en: 'Potatoes'
        },
        quantity: '3 vnt.',
        vital: false
      },
      {
        name: {
          lt: 'Druska',
          en: 'Salt'
        },
        quantity: '1 šaukštelis',
        vital: false
      }
    ],
    
    instructions: [
      {
        stepNumber: 1,
        text: {
          lt: 'Supjaustykite vištieną mažais gabaliukais.',
          en: 'Cut the chicken into small pieces.'
        }
      },
      {
        stepNumber: 2,
        text: {
          lt: 'Supjaustykite daržoves kubeliais.',
          en: 'Cut vegetables into cubes.'
        }
      },
      {
        stepNumber: 3,
        text: {
          lt: 'Virti 30 minučių.',
          en: 'Cook for 30 minutes.'
        }
      }
    ],
    
    nutrition: {
      calories: 500,
      carbs: 35,
      protein: 40,
      fat: 20
    },
    
    categories: {
      cuisine: 'Lithuanian',
      mealType: 'Dinner',
      effort: 'Easy',
      prepTimeMinutes: 15,
      cookTimeMinutes: 45,
      totalTimeMinutes: 60,
      dietary: ['gluten-free'],
      seasonal: ['Winter'],
      occasion: ['Christmas'],
      nutritionFocus: ['High Protein'],
      tags: ['traditional', 'family', 'hearty']
    },
    
    rating: {
      average: 4.6,
      count: 28
    },
    
    commentsCount: 12,
    
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-06-04T12:00:00Z',
    
    seo: {
      metaTitle: 'Vištienos sriuba – Tradicinis lietuviškas receptas',
      metaDescription: 'Greitas ir lengvas vištienos sriubos receptas vakarienei.',
      keywords: ['vištienos sriuba', 'lengvas receptas', 'lietuviškas maistas']
    },
    
    // Legacy fields for compatibility
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
    averageRating: 4.6,
    totalRatings: 28,
    views: 1250,
    prepTime: 15,
    cookTime: 45,
    totalTime: 60,
    difficulty: 'easy',
    category: 'Sriubos',
    tags: ['traditional', 'family', 'hearty']
  },
  
  {
    _id: '2',
    slug: 'beef-stew',
    
    title: {
      lt: 'Jautienos troškinys',
      en: 'Beef Stew'
    },
    
    description: {
      lt: 'Sultingas jautienos troškinys su daržovėmis.',
      en: 'Rich and tender beef stew with vegetables.'
    },
    
    author: {
      name: 'Chef Anton',
      profileUrl: '/user/chef-anton'
    },
    
    status: 'public',
    language: 'lt',
    translations: ['en'],
    
    servings: 6,
    servingsUnit: 'servings',
    
    ingredients: [
      {
        name: {
          lt: 'Jautiena',
          en: 'Beef'
        },
        quantity: '800g',
        vital: true
      },
      {
        name: {
          lt: 'Morka',
          en: 'Carrot'
        },
        quantity: '3 vnt.',
        vital: true
      },
      {
        name: {
          lt: 'Bulvės',
          en: 'Potatoes'
        },
        quantity: '4 vnt.',
        vital: true
      },
      {
        name: {
          lt: 'Svogūnas',
          en: 'Onion'
        },
        quantity: '2 vnt.',
        vital: false
      }
    ],
    
    instructions: [
      {
        stepNumber: 1,
        text: {
          lt: 'Supjaustykite jautieną kubeliais.',
          en: 'Cut beef into cubes.'
        }
      },
      {
        stepNumber: 2,
        text: {
          lt: 'Apkepkite mėsą aukštoje temperatūroje.',
          en: 'Brown the meat at high temperature.'
        }
      }
    ],
    
    nutrition: {
      calories: 650,
      carbs: 30,
      protein: 45,
      fat: 35
    },
    
    categories: {
      cuisine: 'European',
      mealType: 'Dinner',
      effort: 'Medium',
      prepTimeMinutes: 20,
      cookTimeMinutes: 120,
      totalTimeMinutes: 140,
      dietary: [],
      seasonal: ['Winter'],
      occasion: ['Sunday'],
      nutritionFocus: ['High Protein'],
      tags: ['hearty', 'comfort', 'winter']
    },
    
    rating: {
      average: 4.8,
      count: 45
    },
    
    commentsCount: 18,
    
    createdAt: '2025-06-02T10:00:00Z',
    updatedAt: '2025-06-04T14:00:00Z',
    
    seo: {
      metaTitle: 'Jautienos troškinys – Šeimos receptas',
      metaDescription: 'Sultingas jautienos troškinys su daržovėmis šeimai.',
      keywords: ['jautienos troškinys', 'šeimos receptas', 'vakarienė']
    },
    
    // Legacy fields
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
    averageRating: 4.8,
    totalRatings: 45,
    views: 2100,
    prepTime: 20,
    cookTime: 120,
    totalTime: 140,
    difficulty: 'medium',
    category: 'Troškiniai',
    tags: ['hearty', 'comfort', 'winter']
  },

  {
    _id: '3',
    slug: 'pasta-carbonara',

    title: {
      lt: 'Makaronai Carbonara',
      en: 'Pasta Carbonara'
    },

    description: {
      lt: 'Kremingi italų makaronai su kiaušiniais ir šonine.',
      en: 'Creamy Italian pasta with bacon and eggs.'
    },

    author: {
      name: 'Chef Isabella',
      profileUrl: '/user/chef-isabella'
    },

    status: 'public',
    language: 'lt',
    translations: ['en'],

    servings: 2,
    servingsUnit: 'servings',

    ingredients: [
      {
        name: {
          lt: 'Makaronai',
          en: 'Pasta'
        },
        quantity: '200g',
        vital: true
      },
      {
        name: {
          lt: 'Šoninė',
          en: 'Bacon'
        },
        quantity: '100g',
        vital: true
      },
      {
        name: {
          lt: 'Kiaušiniai',
          en: 'Eggs'
        },
        quantity: '2 vnt.',
        vital: true
      }
    ],

    instructions: [
      {
        stepNumber: 1,
        text: {
          lt: 'Išvirkite makароnus.',
          en: 'Cook the pasta.'
        }
      }
    ],

    nutrition: {
      calories: 580,
      carbs: 45,
      protein: 25,
      fat: 35
    },

    categories: {
      cuisine: 'Italian',
      mealType: 'Dinner',
      effort: 'Easy',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      totalTimeMinutes: 30,
      dietary: [],
      seasonal: [],
      occasion: ['Date Night'],
      nutritionFocus: ['High Protein'],
      tags: ['quick', 'creamy', 'italian']
    },

    rating: {
      average: 4.7,
      count: 156
    },

    commentsCount: 45,

    createdAt: '2025-06-03T15:00:00Z',
    updatedAt: '2025-06-04T16:00:00Z',

    seo: {
      metaTitle: 'Makaronai Carbonara – Autentiškas italų receptas',
      metaDescription: 'Greitas ir skanus carbonara receptas su šonine ir kiaušiniais.',
      keywords: ['carbonara', 'makaronai', 'italų virtuvė']
    },

    // Legacy fields
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop',
    averageRating: 4.7,
    totalRatings: 156,
    views: 3200,
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    difficulty: 'easy',
    category: 'Makaronai',
    tags: ['quick', 'creamy', 'italian']
  },

  {
    _id: '4',
    slug: 'salmon-teriyaki',

    title: {
      lt: 'Lašiša Teriyaki',
      en: 'Salmon Teriyaki'
    },

    description: {
      lt: 'Glazūruota lašiša su saldžiu teriyaki padažu.',
      en: 'Glazed salmon with sweet teriyaki sauce.'
    },

    author: {
      name: 'Chef Yuki',
      profileUrl: '/user/chef-yuki'
    },

    status: 'public',
    language: 'lt',
    translations: ['en'],

    servings: 2,
    servingsUnit: 'servings',

    ingredients: [
      {
        name: {
          lt: 'Lašiša',
          en: 'Salmon'
        },
        quantity: '400g',
        vital: true
      },
      {
        name: {
          lt: 'Sojų padažas',
          en: 'Soy Sauce'
        },
        quantity: '3 šaukštai',
        vital: true
      },
      {
        name: {
          lt: 'Medus',
          en: 'Honey'
        },
        quantity: '2 šaukštai',
        vital: false
      }
    ],

    instructions: [
      {
        stepNumber: 1,
        text: {
          lt: 'Paruoškite teriyaki padažą.',
          en: 'Prepare teriyaki sauce.'
        }
      }
    ],

    nutrition: {
      calories: 420,
      carbs: 15,
      protein: 35,
      fat: 25
    },

    categories: {
      cuisine: 'Japanese',
      mealType: 'Dinner',
      effort: 'Medium',
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      totalTimeMinutes: 40,
      dietary: ['gluten-free'],
      seasonal: [],
      occasion: ['Healthy'],
      nutritionFocus: ['High Protein', 'Omega-3'],
      tags: ['healthy', 'fish', 'asian']
    },

    rating: {
      average: 4.9,
      count: 89
    },

    commentsCount: 23,

    createdAt: '2025-06-04T09:00:00Z',
    updatedAt: '2025-06-04T18:00:00Z',

    seo: {
      metaTitle: 'Lašiša Teriyaki – Sveika japonų virtuvė',
      metaDescription: 'Sveika ir skani lašiša su teriyaki padažu.',
      keywords: ['lašiša', 'teriyaki', 'japonų virtuvė', 'sveikas maistas']
    },

    // Legacy fields
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    averageRating: 4.9,
    totalRatings: 89,
    views: 1890,
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    difficulty: 'medium',
    category: 'Žuvis',
    tags: ['healthy', 'fish', 'asian']
  }
];
