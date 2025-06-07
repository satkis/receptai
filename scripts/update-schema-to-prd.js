// Update MongoDB Schema to Match PRD Requirements
// Run with: mongosh receptai < update-schema-to-prd.js

use('receptai');

print("🔄 Updating schema to match PRD requirements...");

// Update existing recipes to match PRD schema
db.recipes.updateMany({}, [
  {
    $set: {
      // Add missing PRD fields
      "language": "lt",
      "translations": ["en"],
      "servingsUnit": "porcijos",
      
      // Convert groupIds to groupLabels (denormalized for performance)
      "groupLabels": {
        $map: {
          input: "$groupIds",
          as: "groupId",
          in: {
            $switch: {
              branches: [
                { case: { $eq: ["$$groupId", ObjectId("...30min...")] }, then: "30 minučių" },
                { case: { $eq: ["$$groupId", ObjectId("...kids...")] }, then: "Vaikams draugiški" },
                { case: { $eq: ["$$groupId", ObjectId("...vegan...")] }, then: "Veganiški" },
                { case: { $eq: ["$$groupId", ObjectId("...soups...")] }, then: "Sriubos" }
              ],
              default: "Kita"
            }
          }
        }
      },
      
      // Restructure categories to match PRD
      "categories": {
        "cuisine": "$filters.cuisine",
        "dietary": "$filters.dietary",
        "seasonal": "$filters.seasonal",
        "nutritionFocus": [],
        "occasion": []
      },
      
      // Add SEO fields
      "seo": {
        "metaTitle": { $concat: ["$title.lt", " - Receptai.lt"] },
        "metaDescription": "$description.lt",
        "keywords": "$keywords"
      },
      
      // Add Schema.org structured data
      "schemaOrg": {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "$title.lt",
        "description": "$description.lt",
        "image": "$image.url",
        "prepTime": { $concat: ["PT", { $toString: "$prepTimeMinutes" }, "M"] },
        "cookTime": { $concat: ["PT", { $toString: "$cookTimeMinutes" }, "M"] },
        "totalTime": { $concat: ["PT", { $toString: "$totalTimeMinutes" }, "M"] },
        "recipeYield": { $toString: "$servings.amount" },
        "nutrition": {
          "@type": "NutritionInformation",
          "calories": "$nutrition.calories"
        },
        "author": {
          "@type": "Person",
          "name": "$author.name"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "$rating.average",
          "ratingCount": "$rating.count"
        }
      },
      
      // Add missing fields
      "commentsCount": 0,
      "updatedAt": new Date()
    }
  }
]);

// Update groups to match PRD schema
db.groups.updateMany({}, [
  {
    $set: {
      "icon": {
        $switch: {
          branches: [
            { case: { $eq: ["$slug", "30-minuciu-patiekalai"] }, then: "clock" },
            { case: { $eq: ["$slug", "vaikams-draugiski"] }, then: "baby" },
            { case: { $eq: ["$slug", "veganiski-patiekalai"] }, then: "leaf" },
            { case: { $eq: ["$slug", "sriubos"] }, then: "bowl" }
          ],
          default: "utensils"
        }
      },
      "priority": 1
    }
  }
]);

print("✅ Schema updated to match PRD requirements");
print("📊 Updated recipes: " + db.recipes.countDocuments());
print("📊 Updated groups: " + db.groups.countDocuments());
