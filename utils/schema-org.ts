// Schema.org Recipe structured data generator
// Optimized for Google Search rich snippets and SEO

import { Recipe, RecipeSchemaOrg, CurrentRecipe } from '@/types';

/**
 * Generate Schema.org Recipe structured data
 * Based on Google's Recipe guidelines: https://developers.google.com/search/docs/appearance/structured-data/recipe
 */
export function generateRecipeSchemaOrg(recipe: Recipe): RecipeSchemaOrg {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  // Convert time to ISO 8601 duration format (PT15M = 15 minutes)
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `PT${minutes}M`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `PT${hours}H${remainingMinutes}M` : `PT${hours}H`;
  };

  // Generate recipe ingredients list
  const recipeIngredients = (() => {
    if (!recipe.ingredients) return [];

    // Handle new structure with main and sides
    if (typeof recipe.ingredients === 'object' && 'main' in recipe.ingredients) {
      const mainIngredients = recipe.ingredients.main.map(ingredient => {
        const name = ingredient.name.lt;
        return `${ingredient.quantity} ${name}`;
      });

      const sideIngredients = recipe.ingredients.sides?.items.map(ingredient => {
        const name = ingredient.name.lt;
        return `${ingredient.quantity} ${name}`;
      }) || [];

      return [...mainIngredients, ...sideIngredients];
    }

    // Legacy support for old flat array structure
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.map(ingredient => {
        const name = ingredient.name.lt;
        const notes = ingredient.notes ? ` (${ingredient.notes})` : '';
        return `${ingredient.quantity} ${name}${notes}`;
      });
    }

    return [];
  })();

  // Generate recipe instructions
  const recipeInstructions = recipe.instructions.map(instruction => ({
    '@type': 'HowToStep',
    name: `Žingsnis ${instruction.step}`,
    text: instruction.text.lt,
    url: `${baseUrl}/receptas/${recipe.slug}#step${instruction.step}`
  }));

  // Generate category from primaryCategoryPath
  const getRecipeCategory = (categoryPath: string): string => {
    const pathParts = categoryPath.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Map category slugs to display names
    const categoryMap: { [key: string]: string } = {
      'desertai': 'Desertas',
      'sriubos': 'Sriuba',
      'pagrindinis-patiekalas': 'Pagrindinis patiekalas',
      'uzkandziai': 'Užkandis',
      'salotai': 'Salotos',
      'gerimai': 'Gėrimas',
      'pyragai': 'Pyragas',
      'mesa': 'Mėsos patiekalas',
      'vistiena': 'Vištienos patiekalas',
      'jautiena': 'Jautienos patiekalas',
      'kiauliena': 'Kiaulienos patiekalas',
      'zuvis': 'Žuvies patiekalas',
      'vegetariska': 'Vegetariškas patiekalas'
    };
    
    return categoryMap[lastPart] || 'Patiekalas';
  };

  const schemaOrg: RecipeSchemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title.lt,
    description: recipe.description.lt,
    image: [recipe.image.src],
    author: {
      '@type': 'Organization',
      name: recipe.author.name,
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ragaujam.lt',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60
      }
    },
    datePublished: recipe.publishedAt || new Date().toISOString(),
    dateModified: recipe.updatedAt || new Date().toISOString(),
    prepTime: formatDuration(recipe.prepTimeMinutes || 0),
    cookTime: formatDuration(recipe.cookTimeMinutes || 0),
    totalTime: formatDuration(recipe.totalTimeMinutes),
    recipeYield: `${recipe.servings} ${recipe.servingsUnit}`,
    recipeCategory: getRecipeCategory(recipe.primaryCategoryPath),
    recipeCuisine: 'Lietuviška',
    keywords: recipe.tags.join(', '),
    recipeIngredient: recipeIngredients,
    recipeInstructions: recipeInstructions
  };

  // Add rating if available (check both rating field and schemaOrg.aggregateRating)
  if (recipe.rating && recipe.rating.count > 0) {
    schemaOrg.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.average.toString(),
      reviewCount: recipe.rating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    };
  } else if (recipe.schemaOrg?.aggregateRating) {
    // Use existing schemaOrg rating if no separate rating field
    schemaOrg.aggregateRating = recipe.schemaOrg.aggregateRating;
  }

  return schemaOrg;
}

/**
 * Generate SEO metadata for recipe
 */
export function generateRecipeSEO(recipe: Recipe) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  // Generate meta title if not provided
  const metaTitle = recipe.seo?.metaTitle || 
    `${recipe.title.lt} - Ragaujam.lt`;

  // Generate meta description if not provided
  const metaDescription = recipe.seo?.metaDescription || 
    `${recipe.description.lt} Receptas su nuotraukomis ir instrukcijomis.`;

  // Generate keywords if not provided
  const keywords = recipe.seo?.keywords || recipe.tags;

  return {
    metaTitle,
    metaDescription,
    keywords,
    canonicalUrl: recipe.canonicalUrl || `${baseUrl}/receptas/${recipe.slug}`,
    ogImage: recipe.image.src,
    ogImageAlt: recipe.image.alt
  };
}



/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  };
}

/**
 * Generate Schema.org Recipe structured data for CurrentRecipe interface
 * Handles the new nutrition structure and enhanced ImageObject
 */
export function generateCurrentRecipeSchemaOrg(recipe: CurrentRecipe) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';

  // Convert time to ISO 8601 duration format
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `PT${minutes}M`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `PT${hours}H${remainingMinutes}M` : `PT${hours}H`;
  };

  // Generate recipe ingredients (main + side ingredients)
  const recipeIngredients = [
    ...recipe.ingredients.map(ingredient =>
      `${ingredient.quantity} ${ingredient.name.lt}`
    ),
    ...recipe.sideIngredients.map(ingredient =>
      `${ingredient.quantity} ${ingredient.name.lt}`
    )
  ];

  // Generate recipe instructions with enhanced HowToStep format
  const recipeInstructions = recipe.instructions.map(instruction => ({
    '@type': 'HowToStep',
    name: instruction.name.lt,
    text: instruction.text.lt,
    url: `${baseUrl}/receptas/${recipe.slug}#step${instruction.step}`
  }));

  // Enhanced ImageObject structure
  const imageObject = {
    '@type': 'ImageObject',
    url: recipe.image.src,
    width: recipe.image.width,
    height: recipe.image.height,
    caption: recipe.image.alt,
    inLanguage: 'lt',
    representativeOfPage: true
  };

  // Always include nutrition with servingSize, conditionally add nutrition values
  const nutritionInfo: any = {
    '@type': 'NutritionInformation',
    servingSize: `1 ${recipe.servingsUnit || 'porcija'}`
  };

  // If seo.nutrition exists, add valid nutrition values
  if (recipe.seo.nutrition) {
    const nutrition = recipe.seo.nutrition;

    // Only add valid nutrition values (not zero, not empty, not missing)
    const hasValidCalories = nutrition.calories && nutrition.calories > 0;
    const hasValidProtein = nutrition.proteinContent && nutrition.proteinContent !== "0" && nutrition.proteinContent.trim() !== "";
    const hasValidFat = nutrition.fatContent && nutrition.fatContent !== "0" && nutrition.fatContent.trim() !== "";
    const hasValidFiber = nutrition.fiberContent && nutrition.fiberContent !== "0" && nutrition.fiberContent.trim() !== "";

    if (hasValidCalories) {
      nutritionInfo.calories = `${nutrition.calories} calories`;
    }
    if (hasValidProtein) {
      nutritionInfo.proteinContent = nutrition.proteinContent;
    }
    if (hasValidFat) {
      nutritionInfo.fatContent = nutrition.fatContent;
    }
    if (hasValidFiber) {
      nutritionInfo.fiberContent = nutrition.fiberContent;
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title.lt,
    description: recipe.description.lt,
    image: imageObject,
    author: {
      '@type': 'Organization',
      name: recipe.author.name,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ragaujam.lt',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: recipe.seo.aggregateRating.ratingValue,
      reviewCount: recipe.seo.aggregateRating.reviewCount,
      bestRating: recipe.seo.aggregateRating.bestRating,
      worstRating: recipe.seo.aggregateRating.worstRating
    },
    prepTime: formatDuration(recipe.prepTimeMinutes),
    cookTime: formatDuration(recipe.cookTimeMinutes),
    totalTime: formatDuration(recipe.totalTimeMinutes),
    datePublished: recipe.publishedAt,
    dateModified: recipe.updatedAt,
    recipeYield: [
      recipe.servings.toString(),
      `${recipe.servings} ${recipe.servingsUnit}`
    ],
    nutrition: nutritionInfo,
    recipeIngredient: recipeIngredients,
    recipeInstructions: recipeInstructions,
    recipeCategory: recipe.seo.recipeCategory,
    recipeCuisine: recipe.seo.recipeCuisine,
    keywords: recipe.tags.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': recipe.canonicalUrl
    }
  };
}

/**
 * Check if nutrition data exists and should be displayed
 * Returns true if any of the 4 nutrition values are valid (not zero/empty)
 */
export function hasNutritionData(nutrition?: { calories?: number; proteinContent?: string; fatContent?: string; fiberContent?: string }): boolean {
  if (!nutrition) return false;

  const hasValidCalories = nutrition.calories && nutrition.calories > 0;
  const hasValidProtein = nutrition.proteinContent && nutrition.proteinContent !== "0" && nutrition.proteinContent.trim() !== "";
  const hasValidFat = nutrition.fatContent && nutrition.fatContent !== "0" && nutrition.fatContent.trim() !== "";
  const hasValidFiber = nutrition.fiberContent && nutrition.fiberContent !== "0" && nutrition.fiberContent.trim() !== "";

  return hasValidCalories || hasValidProtein || hasValidFat || hasValidFiber;
}
