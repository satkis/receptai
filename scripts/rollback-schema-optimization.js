// MongoDB Compass Script: Rollback Recipe Schema Optimization
// Restores removed fields from schemaOrg data

console.log('🔄 Starting Recipe Schema Rollback...');

const totalRecipes = db.recipes_new.countDocuments();
console.log(`📊 Total recipes to rollback: ${totalRecipes}`);

// 1. RESTORE RATING FIELD
console.log('\n🔄 Step 1: Restoring rating field from schemaOrg...');

const recipesWithSchemaRating = db.recipes_new.find({
  "schemaOrg.aggregateRating.ratingValue": { $exists: true },
  "rating": { $exists: false }
}).count();

if (recipesWithSchemaRating > 0) {
  console.log(`🔄 Restoring rating field for ${recipesWithSchemaRating} recipes...`);
  
  db.recipes_new.updateMany(
    {
      "schemaOrg.aggregateRating.ratingValue": { $exists: true },
      "rating": { $exists: false }
    },
    [
      {
        $set: {
          "rating": {
            "average": { $toDouble: "$schemaOrg.aggregateRating.ratingValue" },
            "count": { $toInt: "$schemaOrg.aggregateRating.reviewCount" }
          }
        }
      }
    ]
  );
  console.log('✅ Rating field restored');
}

// 2. RESTORE ENGAGEMENT FIELD (with default values)
console.log('\n🔄 Step 2: Restoring engagement field...');

db.recipes_new.updateMany(
  { "engagement": { $exists: false } },
  {
    $set: {
      "engagement": {
        "views": 0,
        "saves": 0,
        "shares": 0,
        "commentsCount": 0,
        "avgTimeOnPage": 180,
        "bounceRate": 0.25
      }
    }
  }
);

// 3. RESTORE SEO.FOCUSKEYWORD (from first tag or title)
console.log('\n🔄 Step 3: Restoring seo.focusKeyword...');

db.recipes_new.updateMany(
  { "seo.focusKeyword": { $exists: false } },
  [
    {
      $set: {
        "seo.focusKeyword": {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] },
            then: { $arrayElemAt: ["$tags", 0] },
            else: {
              $toLower: {
                $arrayElemAt: [
                  { $split: [{ $ifNull: ["$title.lt", "receptas"] }, " "] },
                  0
                ]
              }
            }
          }
        }
      }
    }
  ]
);

// 4. RESTORE CATEGORYPATH (from primaryCategoryPath)
console.log('\n🔄 Step 4: Restoring categoryPath...');

db.recipes_new.updateMany(
  { 
    "categoryPath": { $exists: false },
    "primaryCategoryPath": { $exists: true }
  },
  [
    {
      $set: {
        "categoryPath": {
          $arrayElemAt: [
            { $split: ["$primaryCategoryPath", "/"] },
            -1
          ]
        }
      }
    }
  ]
);

// 5. RESTORE INSTRUCTIONS TIMEMINUTES (with default values)
console.log('\n🔄 Step 5: Restoring instructions timeMinutes...');

// Add default timeMinutes based on step number
db.recipes_new.updateMany(
  { "instructions.0": { $exists: true } },
  [
    {
      $set: {
        "instructions": {
          $map: {
            input: "$instructions",
            as: "instruction",
            in: {
              $mergeObjects: [
                "$$instruction",
                {
                  "timeMinutes": {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$$instruction.step", 1] }, then: 15 },
                        { case: { $eq: ["$$instruction.step", 2] }, then: 20 },
                        { case: { $eq: ["$$instruction.step", 3] }, then: 25 },
                        { case: { $eq: ["$$instruction.step", 4] }, then: 10 }
                      ],
                      default: 15
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]
);

// 6. VERIFICATION
console.log('\n✅ Step 6: Verification...');

const sampleRecipe = db.recipes_new.findOne(
  {},
  {
    slug: 1,
    "rating.average": 1,
    "rating.count": 1,
    "engagement.views": 1,
    "seo.focusKeyword": 1,
    "categoryPath": 1,
    "instructions.timeMinutes": 1
  }
);

console.log('Sample restored recipe:', JSON.stringify(sampleRecipe, null, 2));

// Count restored fields
const stats = {
  withRating: db.recipes_new.find({ "rating": { $exists: true } }).count(),
  withEngagement: db.recipes_new.find({ "engagement": { $exists: true } }).count(),
  withFocusKeyword: db.recipes_new.find({ "seo.focusKeyword": { $exists: true } }).count(),
  withCategoryPath: db.recipes_new.find({ "categoryPath": { $exists: true } }).count(),
  withInstructionTiming: db.recipes_new.find({ "instructions.timeMinutes": { $exists: true } }).count()
};

console.log('\n📈 Rollback Statistics:');
console.log(`📊 Recipes with rating field: ${stats.withRating}`);
console.log(`📊 Recipes with engagement field: ${stats.withEngagement}`);
console.log(`📊 Recipes with focusKeyword: ${stats.withFocusKeyword}`);
console.log(`📊 Recipes with categoryPath: ${stats.withCategoryPath}`);
console.log(`📊 Recipes with instruction timing: ${stats.withInstructionTiming}`);

console.log('\n🎉 Schema rollback completed successfully!');
console.log('\n📝 Summary of restored fields:');
console.log('   ✅ Restored rating field from schemaOrg data');
console.log('   ✅ Restored engagement field with default values');
console.log('   ✅ Restored seo.focusKeyword from tags/title');
console.log('   ✅ Restored categoryPath from primaryCategoryPath');
console.log('   ✅ Restored instructions[].timeMinutes with defaults');

console.log('\n💡 Note: Some data may have default values since original data was removed.');
console.log('🔄 Your schema has been rolled back to the previous structure.');
