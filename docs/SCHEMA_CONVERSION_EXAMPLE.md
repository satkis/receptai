# 🔄 Database to Google Schema Conversion

## ✅ **How It Works:**

### **1. Database Stores Raw Data:**
```json
{
  "instructions": [
    {
      "step": 1,
      "text": {
        "lt": "Įkaitinkite puodą su alyvuogių aliejumi..."
      }
    }
  ],
  "ingredients": [
    {
      "name": { "lt": "Baltosios pupelės" },
      "quantity": "500 g",
      "vital": true
    }
  ],
  "aggregateRating": {
    "ratingValue": 4.8,
    "reviewCount": 23
  }
}
```

### **2. Schema Generator Converts to Google Format:**
```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "name": "Žingsnis 1",
      "text": "Įkaitinkite puodą su alyvuogių aliejumi...",
      "url": "https://ragaujam.lt/receptas/slug#step1"
    }
  ],
  "recipeIngredient": [
    "500 g Baltosios pupelės"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 23,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

## 🔧 **Schema Generator Functions:**

### **HowToStep Conversion:**
```typescript
// DB Data → Google Schema
recipeInstructions: recipe.instructions.map((instruction: any) => ({
  '@type': 'HowToStep',
  name: `Žingsnis ${instruction.step}`,
  text: instruction.text.lt,
  url: `${baseUrl}/receptas/${recipe.slug}#step${instruction.step}`
}))
```

### **Ingredient Conversion:**
```typescript
// DB Data → Google Schema
recipeIngredient: recipe.ingredients.map((ingredient: any) => 
  `${ingredient.quantity} ${ingredient.name.lt}`
)
```

### **Rating Conversion:**
```typescript
// DB Data → Google Schema
aggregateRating: {
  '@type': 'AggregateRating',
  ratingValue: recipe.aggregateRating.ratingValue,
  reviewCount: recipe.aggregateRating.reviewCount,
  bestRating: 5,
  worstRating: 1
}
```

## 📊 **Complete Conversion Map:**

| **Database Field** | **Google Schema Output** | **Conversion** |
|-------------------|-------------------------|----------------|
| `title.lt` | `name` | Direct mapping |
| `description.lt` | `description` | Direct mapping |
| `image.src` | `image` | Array with multiple formats |
| `prepTimeMinutes` | `prepTime` | Convert to ISO 8601 (`PT20M`) |
| `cookTimeMinutes` | `cookTime` | Convert to ISO 8601 (`PT40M`) |
| `totalTimeMinutes` | `totalTime` | Convert to ISO 8601 (`PT60M`) |
| `servings` + `servingsUnit` | `recipeYield` | Combine values |
| `ingredients[]` | `recipeIngredient[]` | Map to string array |
| `instructions[]` | `recipeInstructions[]` | Convert to HowToStep |
| `tags[]` | `keywords` | Join with commas |
| `primaryCategoryPath` | `recipeCategory` | Extract category name |
| `nutrition` | `nutrition` | Add @type wrapper |
| `aggregateRating` | `aggregateRating` | Add @type wrapper |
| `publishedAt` | `datePublished` | ISO 8601 format |
| `updatedAt` | `dateModified` | ISO 8601 format |

## ✅ **Benefits of This Approach:**

1. **Clean Database** - Only stores actual recipe data
2. **Flexible Schema** - Can update Google requirements without DB changes
3. **Multiple Formats** - Same data can generate different schemas
4. **Maintainable** - Schema logic is centralized in one function
5. **Future-Proof** - Easy to add new Google requirements

## 🚀 **Usage in Recipe Page:**

```typescript
// In your recipe page component
import { generateEnhancedRecipeSchema } from '@/utils/enhanced-recipe-schema';

export default function RecipePage({ recipe }) {
  // Generate Google-compliant schema from DB data
  const enhancedSchema = generateEnhancedRecipeSchema(recipe);

  return (
    <>
      {/* Inject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(enhancedSchema)
        }}
      />
      
      {/* Your recipe UI */}
      <div>...</div>
    </>
  );
}
```

## 🎯 **Result:**

Every recipe page automatically gets:
- ✅ **HowToStep** instructions with anchor links
- ✅ **AggregateRating** with proper @type
- ✅ **Multiple image formats** for rich results
- ✅ **ISO 8601 time formats**
- ✅ **Proper ingredient formatting**
- ✅ **Complete Google compliance**

**All generated dynamically from your clean database structure!** 🎉
