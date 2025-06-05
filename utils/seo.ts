import { Recipe } from '@/types';

export const generateRecipeStructuredData = (recipe: Recipe) => {
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image,
    author: {
      '@type': 'Person',
      name: recipe.author.name,
    },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.totalTime}M`,
    recipeYield: recipe.servings.toString(),
    recipeCategory: recipe.category,
    recipeCuisine: 'Lithuanian',
    keywords: recipe.tags.join(', '),
    recipeIngredient: recipe.ingredients.map(
      (ing) => `${ing.amount} ${ing.unit} ${ing.name}`
    ),
    recipeInstructions: recipe.instructions.map((inst, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: inst.text,
      ...(inst.image && { image: inst.image }),
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.nutrition.calories} calories`,
      proteinContent: `${recipe.nutrition.protein}g`,
      carbohydrateContent: `${recipe.nutrition.carbs}g`,
      fatContent: `${recipe.nutrition.fat}g`,
      fiberContent: `${recipe.nutrition.fiber}g`,
      sugarContent: `${recipe.nutrition.sugar}g`,
      sodiumContent: `${recipe.nutrition.sodium}mg`,
    },
    aggregateRating: recipe.totalRatings > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.averageRating,
      reviewCount: recipe.totalRatings,
    } : undefined,
    review: recipe.comments
      .filter(comment => comment.rating && comment.rating > 0)
      .slice(0, 5) // Limit to 5 reviews
      .map(comment => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: comment.rating,
        },
        author: {
          '@type': 'Person',
          name: comment.userName,
        },
        reviewBody: comment.text,
        datePublished: comment.createdAt,
      })),
  };

  return structuredData;
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

export const generateWebsiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Paragaujam.lt',
    description: 'Geriausi lietuviški receptai - nuo tradicinių patiekalų iki modernių kulinarijos sprendimų',
    url: 'https://paragaujam.lt',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://paragaujam.lt/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Paragaujam.lt',
    description: 'Lietuviškų receptų svetainė',
    url: 'https://paragaujam.lt',
    logo: 'https://paragaujam.lt/logo.png',
    sameAs: [
      'https://www.facebook.com/paragaujam',
      'https://www.instagram.com/paragaujam',
    ],
  };
};

export const generateMetaTags = (
  title: string,
  description: string,
  image?: string,
  url?: string,
  type: 'website' | 'article' = 'website'
) => {
  const baseUrl = process.env.SITE_URL || 'https://paragaujam.lt';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Paragaujam.lt',
      locale: 'lt_LT',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateRecipeSlug = (title: string, id?: string): string => {
  const baseSlug = slugify(title);
  return id ? `${baseSlug}-${id.slice(-6)}` : baseSlug;
};
