// Enhanced SEO utilities following Google's best practices
import { SEO_CONFIG, generatePageSEO, LITHUANIAN_MONTHS } from '@/config/seo-constants';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
    site: string;
    creator: string;
  };
  structuredData: any;
  robots: string;
  hreflang?: Array<{
    lang: string;
    url: string;
  }>;
}

// Generate SEO data for homepage
export function generateHomepageSEO(): SEOData {
  const seo = generatePageSEO('homepage', {
    title: 'Paragaujam.lt',
    description: SEO_CONFIG.siteDescription,
    url: '/',
    keywords: ['lietuviški receptai', 'receptų svetainė', 'gaminimas', 'virtuvė']
  });

  return {
    ...seo,
    structuredData: [
      SEO_CONFIG.structuredData.website,
      SEO_CONFIG.organization,
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Lietuviški receptai',
        description: 'Populiariausi lietuviški receptai',
        numberOfItems: 100, // This should be dynamic
        itemListElement: [] // This should be populated with actual recipes
      }
    ],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  };
}

// Generate SEO data for category pages
export function generateCategorySEO(category: {
  slug: string;
  title: string;
  description?: string;
  recipeCount?: number;
}): SEOData {
  const title = category.title;
  const description = category.description || 
    `Atraskite geriausius ${category.title.toLowerCase()} receptus. ${category.recipeCount || 0} receptų su detaliais gaminimo instrukcijomis.`;
  
  const seo = generatePageSEO('category', {
    title,
    description,
    url: `/receptai/${category.slug}`,
    keywords: [
      category.title.toLowerCase(),
      `${category.title.toLowerCase()} receptai`,
      'lietuviški receptai',
      'gaminimas'
    ]
  });

  return {
    ...seo,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.title} receptai`,
        description,
        url: `${SEO_CONFIG.siteUrl}/receptai/${category.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          name: `${category.title} receptai`,
          numberOfItems: category.recipeCount || 0
        }
      },
      generateBreadcrumbStructuredData([
        { name: 'Pagrindinis', url: '/' },
        { name: 'Receptai', url: '/receptai' },
        { name: category.title, url: `/receptai/${category.slug}` }
      ])
    ],
    robots: 'index, follow'
  };
}

// Generate SEO data for subcategory pages
export function generateSubcategorySEO(
  category: { slug: string; title: string },
  subcategory: { slug: string; title: string; description?: string; recipeCount?: number }
): SEOData {
  const title = `${subcategory.title} - ${category.title}`;
  const description = subcategory.description || 
    `${subcategory.title} receptai kategorijoje ${category.title}. ${subcategory.recipeCount || 0} receptų su išsamiais gaminimo instrukcijomis.`;
  
  const seo = generatePageSEO('subcategory', {
    title,
    description,
    url: `/receptai/${category.slug}/${subcategory.slug}`,
    keywords: [
      subcategory.title.toLowerCase(),
      category.title.toLowerCase(),
      `${subcategory.title.toLowerCase()} receptai`,
      'lietuviški receptai'
    ]
  });

  return {
    ...seo,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${SEO_CONFIG.siteUrl}/receptai/${category.slug}/${subcategory.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          name: title,
          numberOfItems: subcategory.recipeCount || 0
        }
      },
      generateBreadcrumbStructuredData([
        { name: 'Pagrindinis', url: '/' },
        { name: 'Receptai', url: '/receptai' },
        { name: category.title, url: `/receptai/${category.slug}` },
        { name: subcategory.title, url: `/receptai/${category.slug}/${subcategory.slug}` }
      ])
    ],
    robots: 'index, follow'
  };
}

// Generate SEO data for recipe pages
export function generateRecipeSEO(recipe: any): SEOData {
  const title = typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas';
  const description = typeof recipe.description === 'string' 
    ? recipe.description 
    : recipe.description?.lt || `${title} receptas su detaliais gaminimo instrukcijomis.`;
  
  const totalTime = recipe.totalTimeMinutes || 30;
  const servings = typeof recipe.servings === 'number' ? recipe.servings : recipe.servings?.amount || 4;
  const image = typeof recipe.image === 'string' ? recipe.image : recipe.image?.url || '/images/placeholder-recipe.jpg';
  
  // Enhanced description with recipe details
  const enhancedDescription = `${description} Gaminimo laikas: ${totalTime} min. Porcijų: ${servings}. ${
    recipe.categories?.dietary?.length ? `Tinka: ${recipe.categories.dietary.join(', ')}.` : ''
  }`;

  const seo = generatePageSEO('recipe', {
    title,
    description: enhancedDescription,
    url: `/receptai/${recipe.categoryPath}/${recipe.slug}`,
    image,
    keywords: [
      title.toLowerCase(),
      ...(recipe.keywords || []),
      ...(recipe.categories?.dietary || []),
      recipe.categories?.cuisine || 'lietuviška',
      'receptas',
      'gaminimas'
    ]
  });

  return {
    ...seo,
    structuredData: [
      generateRecipeStructuredData(recipe),
      generateBreadcrumbStructuredData([
        { name: 'Pagrindinis', url: '/' },
        { name: 'Receptai', url: '/receptai' },
        { name: recipe.breadcrumb?.main?.label || 'Kategorija', url: `/receptai/${recipe.breadcrumb?.main?.slug}` },
        { name: recipe.breadcrumb?.sub?.label || 'Subkategorija', url: `/receptai/${recipe.categoryPath}` },
        { name: title, url: `/receptai/${recipe.categoryPath}/${recipe.slug}` }
      ])
    ],
    robots: 'index, follow, max-image-preview:large'
  };
}

// Generate Recipe structured data following Schema.org guidelines
export function generateRecipeStructuredData(recipe: any) {
  const title = typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas';
  const description = typeof recipe.description === 'string' ? recipe.description : recipe.description?.lt || '';
  const image = typeof recipe.image === 'string' ? recipe.image : recipe.image?.url || '/images/placeholder-recipe.jpg';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    description,
    image: [image.startsWith('http') ? image : `${SEO_CONFIG.siteUrl}${image}`],
    author: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName
    },
    datePublished: recipe.createdAt || new Date().toISOString(),
    dateModified: recipe.updatedAt || recipe.createdAt || new Date().toISOString(),
    prepTime: recipe.prepTimeMinutes ? `PT${recipe.prepTimeMinutes}M` : undefined,
    cookTime: recipe.cookTimeMinutes ? `PT${recipe.cookTimeMinutes}M` : undefined,
    totalTime: `PT${recipe.totalTimeMinutes || 30}M`,
    recipeCategory: recipe.categories?.main || 'Pagrindinis patiekalas',
    recipeCuisine: recipe.categories?.cuisine || 'Lietuviška',
    recipeYield: `${typeof recipe.servings === 'number' ? recipe.servings : recipe.servings?.amount || 4} porcijos`,
    keywords: [title, ...(recipe.keywords || [])].join(', '),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
      fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
      carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined
    } : undefined,
    recipeIngredient: recipe.ingredients?.map((ing: any) => {
      const name = typeof ing.name === 'string' ? ing.name : ing.name?.lt || '';
      const quantity = ing.quantity || ing.amount || '';
      const unit = typeof ing.unit === 'string' ? ing.unit : ing.unit?.lt || '';
      return `${quantity} ${unit} ${name}`.trim();
    }) || [],
    recipeInstructions: recipe.instructions?.map((inst: any, index: number) => ({
      '@type': 'HowToStep',
      position: inst.step || index + 1,
      text: typeof inst.description === 'string' ? inst.description : inst.description?.lt || inst.text || ''
    })) || [],
    aggregateRating: recipe.rating && recipe.rating.count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.average,
      ratingCount: recipe.rating.count
    } : undefined,
    video: recipe.videoUrl ? {
      '@type': 'VideoObject',
      name: `${title} - gaminimo video`,
      description: `Kaip gaminti ${title.toLowerCase()}`,
      thumbnailUrl: image,
      contentUrl: recipe.videoUrl
    } : undefined
  };
}

// Generate Breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${SEO_CONFIG.siteUrl}${crumb.url}`
    }))
  };
}

// Generate FAQ structured data for recipe pages
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Format date in Lithuanian
export function formatLithuanianDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = LITHUANIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  
  return `${year} m. ${month} ${day} d.`;
}

// Generate meta description with optimal length (150-160 characters)
export function optimizeMetaDescription(description: string, maxLength: number = 155): string {
  if (description.length <= maxLength) return description;
  
  // Find the last complete sentence within the limit
  const truncated = description.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSentence > maxLength - 50) {
    return description.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength - 20) {
    return description.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
}
