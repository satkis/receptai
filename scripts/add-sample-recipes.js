// Add Sample Recipes with New Schema
// Run this AFTER restructure-mongodb.js
// Usage: mongosh receptai < add-sample-recipes.js

use('receptai');

// Get group IDs for referencing
const groups = db.groups.find({}).toArray();
const groupMap = {};
groups.forEach(group => {
  groupMap[group.slug] = group._id;
});

print("📝 Adding sample recipes with new schema...");

db.recipes.insertMany([
  {
    "slug": "tradiciniai-cepelinai-su-mesos-idaru",
    "title": {
      "lt": "Tradiciniai cepelinai su mėsos įdaru",
      "en": "Traditional Cepelinai with Meat Filling"
    },
    "description": {
      "lt": "Autentiški lietuviški cepelinai su sultingu mėsos įdaru ir spirgučiais",
      "en": "Authentic Lithuanian cepelinai with juicy meat filling and cracklings"
    },
    "availableLanguages": ["lt", "en"],
    
    "image": {
      "url": "/images/cepelinai-main.jpg",
      "versions": [
        { "url": "/images/cepelinai-16x9.jpg", "ratio": "16x9" },
        { "url": "/images/cepelinai-4x3.jpg", "ratio": "4x3" },
        { "url": "/images/cepelinai-1x1.jpg", "ratio": "1x1" }
      ]
    },
    "keywords": ["cepelinai", "bulvės", "mėsa", "lietuviška", "tradicinis"],
    
    "prepTimeMinutes": 60,
    "cookTimeMinutes": 30,
    "totalTimeMinutes": 90,
    "servings": {
      "amount": 4,
      "unit": {
        "lt": "porcijos",
        "en": "servings"
      }
    },
    
    "ingredients": [
      {
        "amount": 2,
        "unit": { "lt": "kg", "en": "kg" },
        "name": { "lt": "Bulvės", "en": "Potatoes" }
      },
      {
        "amount": 500,
        "unit": { "lt": "g", "en": "g" },
        "name": { "lt": "Kiaulienos mėsa", "en": "Pork meat" }
      },
      {
        "amount": 1,
        "unit": { "lt": "vnt", "en": "piece" },
        "name": { "lt": "Svogūnas", "en": "Onion" }
      },
      {
        "amount": 200,
        "unit": { "lt": "g", "en": "g" },
        "name": { "lt": "Spirgučiai", "en": "Cracklings" }
      }
    ],
    
    "instructions": [
      {
        "step": 1,
        "text": {
          "lt": "Nulupkite ir sutarkuokite bulves smulkiu tarkuoju",
          "en": "Peel and grate potatoes with fine grater"
        }
      },
      {
        "step": 2,
        "text": {
          "lt": "Paruoškite mėsos įdarą su svogūnais",
          "en": "Prepare meat filling with onions"
        }
      },
      {
        "step": 3,
        "text": {
          "lt": "Suformuokite cepelinų formos kukulius",
          "en": "Shape into zeppelin-like dumplings"
        }
      },
      {
        "step": 4,
        "text": {
          "lt": "Virkite sūdytame vandenyje 25-30 minučių",
          "en": "Boil in salted water for 25-30 minutes"
        }
      }
    ],
    
    "nutrition": {
      "calories": "650 kcal",
      "protein": "28g",
      "fat": "22g",
      "carbohydrates": "85g"
    },
    
    "filters": {
      "cuisine": "lithuanian",
      "mealType": "main-course",
      "dietary": [],
      "seasonal": ["winter"]
    },
    "groupIds": [groupMap["vaikams-draugiski"]],
    
    "rating": {
      "average": 4.8,
      "count": 127
    },
    "author": {
      "name": "Receptai.lt"
    },
    "status": "public",
    "createdAt": new Date("2024-01-15"),
    "updatedAt": new Date()
  },
  
  {
    "slug": "saltibarsciai-su-bulvemis",
    "title": {
      "lt": "Šaltibarščiai su bulvėmis ir kiaušiniais",
      "en": "Cold Beet Soup with Potatoes and Eggs"
    },
    "description": {
      "lt": "Gaivūs vasariški šaltibarščiai su šviežiais daržovėmis ir grietinėle",
      "en": "Refreshing summer cold beet soup with fresh vegetables and sour cream"
    },
    "availableLanguages": ["lt", "en"],
    
    "image": {
      "url": "/images/saltibarsciai-main.jpg",
      "versions": [
        { "url": "/images/saltibarsciai-16x9.jpg", "ratio": "16x9" },
        { "url": "/images/saltibarsciai-4x3.jpg", "ratio": "4x3" },
        { "url": "/images/saltibarsciai-1x1.jpg", "ratio": "1x1" }
      ]
    },
    "keywords": ["šaltibarščiai", "burokėliai", "vasara", "šalta sriuba"],
    
    "prepTimeMinutes": 20,
    "cookTimeMinutes": 0,
    "totalTimeMinutes": 20,
    "servings": {
      "amount": 6,
      "unit": {
        "lt": "porcijos",
        "en": "servings"
      }
    },
    
    "ingredients": [
      {
        "amount": 1,
        "unit": { "lt": "l", "en": "l" },
        "name": { "lt": "Burokėlių sultys", "en": "Beetroot juice" }
      },
      {
        "amount": 300,
        "unit": { "lt": "ml", "en": "ml" },
        "name": { "lt": "Rūgštus grietinėlė", "en": "Sour cream" }
      },
      {
        "amount": 4,
        "unit": { "lt": "vnt", "en": "pieces" },
        "name": { "lt": "Virtos bulvės", "en": "Boiled potatoes" }
      },
      {
        "amount": 3,
        "unit": { "lt": "vnt", "en": "pieces" },
        "name": { "lt": "Kiaušiniai", "en": "Eggs" }
      }
    ],
    
    "instructions": [
      {
        "step": 1,
        "text": {
          "lt": "Sumaišykite burokėlių sultis su grietinėle",
          "en": "Mix beetroot juice with sour cream"
        }
      },
      {
        "step": 2,
        "text": {
          "lt": "Supjaustykite bulves ir kiaušinius",
          "en": "Chop potatoes and eggs"
        }
      }
    ],
    
    "nutrition": {
      "calories": "180 kcal",
      "protein": "8g",
      "fat": "6g",
      "carbohydrates": "25g"
    },
    
    "filters": {
      "cuisine": "lithuanian",
      "mealType": "soup",
      "dietary": ["vegetarian"],
      "seasonal": ["summer"]
    },
    "groupIds": [groupMap["30-minuciu-patiekalai"], groupMap["sriubos"]],
    
    "rating": {
      "average": 4.6,
      "count": 89
    },
    "author": {
      "name": "Receptai.lt"
    },
    "status": "public",
    "createdAt": new Date("2024-02-01"),
    "updatedAt": new Date()
  },

  {
    "slug": "veganiski-blynai-su-uogomis",
    "title": {
      "lt": "Veganiški blynai su uogomis",
      "en": "Vegan Pancakes with Berries"
    },
    "description": {
      "lt": "Purus veganiški blynai su šviežiomis uogomis ir klevų sirupu",
      "en": "Fluffy vegan pancakes with fresh berries and maple syrup"
    },
    "availableLanguages": ["lt", "en"],
    
    "image": {
      "url": "/images/vegan-pancakes-main.jpg",
      "versions": [
        { "url": "/images/vegan-pancakes-16x9.jpg", "ratio": "16x9" },
        { "url": "/images/vegan-pancakes-4x3.jpg", "ratio": "4x3" },
        { "url": "/images/vegan-pancakes-1x1.jpg", "ratio": "1x1" }
      ]
    },
    "keywords": ["veganiški", "blynai", "pusryčiai", "uogos"],
    
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 15,
    "totalTimeMinutes": 25,
    "servings": {
      "amount": 4,
      "unit": {
        "lt": "porcijos",
        "en": "servings"
      }
    },
    
    "ingredients": [
      {
        "amount": 200,
        "unit": { "lt": "g", "en": "g" },
        "name": { "lt": "Miltai", "en": "Flour" }
      },
      {
        "amount": 250,
        "unit": { "lt": "ml", "en": "ml" },
        "name": { "lt": "Augalinis pienas", "en": "Plant milk" }
      },
      {
        "amount": 150,
        "unit": { "lt": "g", "en": "g" },
        "name": { "lt": "Mišrios uogos", "en": "Mixed berries" }
      }
    ],
    
    "instructions": [
      {
        "step": 1,
        "text": {
          "lt": "Sumaišykite sausus ingredientus",
          "en": "Mix dry ingredients"
        }
      },
      {
        "step": 2,
        "text": {
          "lt": "Įpilkite augalinį pieną ir išmaišykite",
          "en": "Add plant milk and mix"
        }
      }
    ],
    
    "nutrition": {
      "calories": "220 kcal",
      "protein": "6g",
      "fat": "3g",
      "carbohydrates": "42g"
    },
    
    "filters": {
      "cuisine": "international",
      "mealType": "breakfast",
      "dietary": ["vegan", "dairy-free"],
      "seasonal": ["summer"]
    },
    "groupIds": [groupMap["30-minuciu-patiekalai"], groupMap["veganiski-patiekalai"], groupMap["vaikams-draugiski"]],
    
    "rating": {
      "average": 4.7,
      "count": 156
    },
    "author": {
      "name": "Receptai.lt"
    },
    "status": "public",
    "createdAt": new Date("2024-03-01"),
    "updatedAt": new Date()
  }
]);

print("✅ Sample recipes added: " + db.recipes.countDocuments());
print("🎉 Database restructure complete!");
