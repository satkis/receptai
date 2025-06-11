// Enhanced SEO Head component following Google's best practices
import React, { Fragment } from 'react';
import Head from 'next/head';
import { SEOData } from '@/utils/seo-enhanced';
import { SEO_CONFIG } from '@/config/seo-constants';

interface SEOHeadProps {
  seo: SEOData;
  children?: React.ReactNode;
}

export default function SEOHead({ seo, children }: SEOHeadProps) {
  const jsonLd = Array.isArray(seo.structuredData) 
    ? seo.structuredData 
    : [seo.structuredData].filter(Boolean);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <meta name="author" content={SEO_CONFIG.defaultMeta.author} />
      <meta name="robots" content={seo.robots} />
      <meta name="viewport" content={SEO_CONFIG.defaultMeta.viewport} />
      <meta charSet={SEO_CONFIG.defaultMeta.charset} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.canonical} />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="lt" />
      <meta name="language" content="Lithuanian" />
      
      {/* Hreflang for multilingual support */}
      {seo.hreflang?.map((lang) => (
        <link
          key={lang.lang}
          rel="alternate"
          hrefLang={lang.lang}
          href={lang.url}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={seo.canonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />
      <meta property="og:url" content={seo.openGraph.url} />
      <meta property="og:type" content={seo.openGraph.type} />
      <meta property="og:locale" content={seo.openGraph.locale} />
      <meta property="og:site_name" content={seo.openGraph.siteName} />
      
      {/* Open Graph Images */}
      {seo.openGraph.images.map((image, index) => (
        <Fragment key={index}>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={image.width.toString()} />
          <meta property="og:image:height" content={image.height.toString()} />
          <meta property="og:image:alt" content={image.alt} />
        </Fragment>
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />
      <meta name="twitter:site" content={seo.twitter.site} />
      <meta name="twitter:creator" content={seo.twitter.creator} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SEO_CONFIG.siteName} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch for better performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Structured Data (JSON-LD) */}
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 0)
          }}
        />
      ))}
      
      {/* Additional custom head content */}
      {children}
    </Head>
  );
}

// Utility component for recipe-specific SEO
interface RecipeSEOHeadProps {
  recipe: any;
  children?: React.ReactNode;
}

export function RecipeSEOHead({ recipe, children }: RecipeSEOHeadProps) {
  const title = typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas';
  const description = typeof recipe.description === 'string' ? recipe.description : recipe.description?.lt || '';
  const image = typeof recipe.image === 'string' ? recipe.image : recipe.image?.url || '/images/placeholder-recipe.jpg';
  const totalTime = recipe.totalTimeMinutes || 30;
  const servings = typeof recipe.servings === 'number' ? recipe.servings : recipe.servings?.amount || 4;
  
  return (
    <Head>
      {/* Recipe-specific meta tags */}
      <meta name="recipe:prep_time" content={recipe.prepTimeMinutes?.toString() || "0"} />
      <meta name="recipe:cook_time" content={recipe.cookTimeMinutes?.toString() || "0"} />
      <meta name="recipe:total_time" content={totalTime.toString()} />
      <meta name="recipe:serves" content={servings.toString()} />
      <meta name="recipe:cuisine" content={recipe.categories?.cuisine || "Lietuviška"} />
      <meta name="recipe:category" content={recipe.categories?.main || "Pagrindinis patiekalas"} />
      <meta name="recipe:method" content="Gaminimas" />
      <meta name="recipe:difficulty" content={recipe.difficulty || "vidutinis"} />
      
      {/* Recipe ingredients as meta tags */}
      {recipe.ingredients?.slice(0, 5).map((ingredient: any, index: number) => {
        const name = typeof ingredient.name === 'string' ? ingredient.name : ingredient.name?.lt || '';
        return (
          <meta
            key={index}
            name="recipe:ingredient"
            content={name}
          />
        );
      })}
      
      {/* Recipe dietary information */}
      {recipe.categories?.dietary?.map((diet: string, index: number) => (
        <meta
          key={index}
          name="recipe:diet"
          content={diet}
        />
      ))}
      
      {/* Recipe rating */}
      {recipe.rating && recipe.rating.count > 0 && (
        <>
          <meta name="recipe:rating" content={recipe.rating.average.toString()} />
          <meta name="recipe:rating_count" content={recipe.rating.count.toString()} />
        </>
      )}
      
      {/* Recipe nutrition */}
      {recipe.nutrition && (
        <>
          <meta name="recipe:calories" content={recipe.nutrition.calories?.toString() || ""} />
          <meta name="recipe:protein" content={recipe.nutrition.protein?.toString() || ""} />
          <meta name="recipe:fat" content={recipe.nutrition.fat?.toString() || ""} />
          <meta name="recipe:carbs" content={recipe.nutrition.carbs?.toString() || ""} />
        </>
      )}
      
      {/* Recipe publication date */}
      <meta name="article:published_time" content={recipe.publishedAt || recipe.createdAt || new Date().toISOString()} />
      <meta name="article:modified_time" content={recipe.updatedAt || recipe.createdAt || new Date().toISOString()} />
      <meta name="article:author" content={recipe.author?.name || SEO_CONFIG.siteName} />
      <meta name="article:section" content={recipe.categories?.main || "Receptai"} />
      
      {/* Recipe tags */}
      {recipe.keywords?.map((keyword: string, index: number) => (
        <meta
          key={index}
          name="article:tag"
          content={keyword}
        />
      ))}
      
      {children}
    </Head>
  );
}

// Utility component for category/subcategory SEO
interface CategorySEOHeadProps {
  category: {
    title: string;
    description?: string;
    slug: string;
    recipeCount?: number;
  };
  subcategory?: {
    title: string;
    description?: string;
    slug: string;
    recipeCount?: number;
  };
  children?: React.ReactNode;
}

export function CategorySEOHead({ category, subcategory, children }: CategorySEOHeadProps) {
  const title = subcategory ? `${subcategory.title} - ${category.title}` : category.title;
  const recipeCount = subcategory?.recipeCount || category.recipeCount || 0;
  
  return (
    <Head>
      {/* Category-specific meta tags */}
      <meta name="category:name" content={category.title} />
      <meta name="category:slug" content={category.slug} />
      <meta name="category:recipe_count" content={recipeCount.toString()} />
      
      {subcategory && (
        <>
          <meta name="subcategory:name" content={subcategory.title} />
          <meta name="subcategory:slug" content={subcategory.slug} />
          <meta name="subcategory:recipe_count" content={subcategory.recipeCount?.toString() || "0"} />
        </>
      )}
      
      {/* Collection page meta tags */}
      <meta name="collection:type" content="recipe_category" />
      <meta name="collection:language" content="lt" />
      <meta name="collection:cuisine" content="Lietuviška" />
      
      {children}
    </Head>
  );
}
