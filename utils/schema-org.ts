// Schema.org Recipe structured data generator
// Optimized for Google Search rich snippets and SEO

import { Recipe, RecipeSchemaOrg } from '@/types';

/**
 * Generate Schema.org Recipe structured data
 * Based on Google's Recipe guidelines: https://developers.google.com/search/docs/appearance/structured-data/recipe
 */
export function generateRecipeSchemaOrg(recipe: Recipe): RecipeSchemaOrg {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  
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
  const recipeIngredients = recipe.ingredients.map(ingredient => {
    const name = ingredient.name.lt;
    const notes = ingredient.notes ? ` (${ingredient.notes})` : '';
    return `${ingredient.quantity} ${name}${notes}`;
  });

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
      name: 'Paragaujam.lt',
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  
  // Generate meta title if not provided
  const metaTitle = recipe.seo?.metaTitle || 
    `${recipe.title.lt} - Paragaujam.lt`;

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
 * Generate sitemap data for recipe
 */
export function generateRecipeSitemapData(recipe: Recipe) {
  const lastmod = recipe.sitemap?.lastmod || recipe.updatedAt || new Date();

  return {
    priority: recipe.sitemap?.priority || (recipe.featured ? 0.9 : 0.8),
    changefreq: recipe.sitemap?.changefreq || 'monthly',
    lastmod: typeof lastmod === 'string' ? new Date(lastmod) : lastmod
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  
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
