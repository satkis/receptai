// Unified SEO component optimized for performance and Lithuanian recipe website
// Handles all page types: recipes, categories, search, homepage
// Prioritizes fast loading and comprehensive SEO coverage

import Head from 'next/head';

interface BaseSEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'recipe';
  noindex?: boolean;
}

interface RecipeSEOProps extends BaseSEOProps {
  pageType: 'recipe';
  recipe: {
    slug: string;
    title: { lt: string };
    description: { lt: string };
    image: string;
    totalTimeMinutes: number;
    servings: number;
    ingredients: Array<{ name: { lt: string }; quantity: string }>;
    instructions: Array<{ step: number; text: { lt: string } }>;
    tags: string[];
    rating?: { average: number; count: number };
    difficulty?: string;
    publishedAt?: string;
  };
}

interface CategorySEOProps extends BaseSEOProps {
  pageType: 'category';
  category: {
    name: string;
    path: string;
    recipeCount: number;
  };
  subcategory?: {
    name: string;
    recipeCount: number;
  };
}

interface SearchSEOProps extends BaseSEOProps {
  pageType: 'search';
  query: string;
  totalResults: number;
  currentPage?: number;
  totalPages?: number;
}

interface HomepageSEOProps extends BaseSEOProps {
  pageType: 'homepage';
  totalRecipes?: number;
}

type UnifiedSEOProps = RecipeSEOProps | CategorySEOProps | SearchSEOProps | HomepageSEOProps;

export default function UnifiedSEO(props: UnifiedSEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  const canonical = props.canonical || `${baseUrl}${getCanonicalPath(props)}`;
  const imageUrl = props.image || `${baseUrl}/og-image.jpg`;

  // Generate structured data based on page type
  const structuredData = generateStructuredData(props, baseUrl);

  // Generate meta tags
  const metaTags = generateMetaTags(props, canonical, imageUrl);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={props.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />

      {/* Open Graph */}
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={props.type || 'website'} />
      <meta property="og:site_name" content="Paragaujam.lt" />
      <meta property="og:locale" content="lt_LT" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional meta tags based on page type */}
      {metaTags}

      {/* Performance hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Language and region */}
      <meta httpEquiv="content-language" content="lt" />
      <meta name="geo.region" content="LT" />
      <meta name="geo.country" content="Lithuania" />

      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 0)
          }}
        />
      ))}
    </Head>
  );
}

// Helper functions
function getCanonicalPath(props: UnifiedSEOProps): string {
  switch (props.pageType) {
    case 'recipe':
      return `/receptas/${props.recipe.slug}`;
    case 'category':
      return `/receptai/${props.category.path}`;
    case 'search':
      return `/paieska?q=${encodeURIComponent(props.query)}`;
    case 'homepage':
      return '/';
    default:
      return '/';
  }
}

function generateStructuredData(props: UnifiedSEOProps, baseUrl: string): any[] {
  const data: any[] = [];

  // Always include website data
  data.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": baseUrl,
    "name": "Paragaujam.lt",
    "description": "Geriausi lietuviški receptai su nuotraukomis ir instrukcijomis",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/paieska?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  // Page-specific structured data
  switch (props.pageType) {
    case 'recipe':
      data.push(generateRecipeStructuredData(props.recipe, baseUrl));
      break;
    case 'category':
      data.push(generateCategoryStructuredData(props.category, props.subcategory, baseUrl));
      break;
    case 'search':
      data.push(generateSearchStructuredData(props, baseUrl));
      break;
  }

  return data;
}

function generateRecipeStructuredData(recipe: any, baseUrl: string): any {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title.lt,
    "description": recipe.description.lt,
    "image": [`${baseUrl}${recipe.image}`],
    "url": `${baseUrl}/receptas/${recipe.slug}`,
    "author": {
      "@type": "Organization",
      "name": "Paragaujam.lt"
    },
    "datePublished": recipe.publishedAt || new Date().toISOString(),
    "totalTime": `PT${recipe.totalTimeMinutes || 30}M`,
    "recipeYield": `${recipe.servings || 4} porcijos`,
    "recipeCategory": "Lietuviška virtuvė",
    "recipeCuisine": "Lietuviška",
    "recipeIngredient": recipe.ingredients?.map((ing: any) => 
      `${ing.quantity} ${ing.name.lt}`
    ) || [],
    "recipeInstructions": recipe.instructions?.map((inst: any, index: number) => ({
      "@type": "HowToStep",
      "position": inst.step || index + 1,
      "text": inst.text.lt
    })) || [],
    "aggregateRating": recipe.rating && recipe.rating.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating.average,
      "ratingCount": recipe.rating.count
    } : undefined,
    "keywords": recipe.tags?.join(", ") || ""
  };
}

function generateCategoryStructuredData(category: any, subcategory: any, baseUrl: string): any {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": subcategory ? subcategory.name : category.name,
    "description": `${category.recipeCount} receptų kategorijoje: ${category.name}`,
    "url": `${baseUrl}/receptai/${category.path}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": subcategory ? subcategory.recipeCount : category.recipeCount,
      "itemListElement": []
    }
  };
}

function generateSearchStructuredData(props: SearchSEOProps, baseUrl: string): any {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": `${baseUrl}/paieska?q=${encodeURIComponent(props.query)}`,
    "name": props.title,
    "description": props.description,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": props.totalResults
    }
  };
}

function generateMetaTags(props: UnifiedSEOProps, canonical: string, imageUrl: string): JSX.Element[] {
  const tags: JSX.Element[] = [];

  switch (props.pageType) {
    case 'recipe':
      tags.push(
        <meta key="recipe-time" name="recipe:prep_time" content={props.recipe.totalTimeMinutes?.toString() || "30"} />,
        <meta key="recipe-servings" name="recipe:serves" content={props.recipe.servings?.toString() || "4"} />,
        <meta key="recipe-cuisine" name="recipe:cuisine" content="Lietuviška" />,
        <meta key="keywords" name="keywords" content={props.recipe.tags?.join(', ') || ''} />
      );
      break;
    case 'search':
      tags.push(
        <meta key="search-query" name="search:query" content={props.query} />,
        <meta key="search-results" name="search:results" content={props.totalResults.toString()} />,
        <meta key="keywords" name="keywords" content={`receptai, paieška, ${props.query}, lietuviški receptai`} />
      );
      break;
    case 'category':
      tags.push(
        <meta key="category-name" name="category:name" content={props.category.name} />,
        <meta key="category-count" name="category:recipe_count" content={props.category.recipeCount.toString()} />,
        <meta key="keywords" name="keywords" content={`${props.category.name}, receptai, lietuviški receptai`} />
      );
      break;
    case 'homepage':
      tags.push(
        <meta key="keywords" name="keywords" content="lietuviški receptai, receptų svetainė, gaminimas, virtuvė, maistas" />
      );
      break;
  }

  return tags;
}
