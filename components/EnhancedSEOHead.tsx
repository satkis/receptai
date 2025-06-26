// Enhanced SEO Head Component following Google's best practices
import Head from 'next/head';
import { Recipe } from '@/types';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  recipe?: Recipe;
  noindex?: boolean;
  structuredData?: object[];
}

export default function EnhancedSEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  recipe,
  noindex = false,
  structuredData = []
}: SEOHeadProps) {
  const siteName = 'Ragaujam.lt';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  
  // Ensure absolute URLs
  const absoluteCanonicalUrl = canonicalUrl.startsWith('http') 
    ? canonicalUrl 
    : `${baseUrl}${canonicalUrl}`;
  
  const absoluteOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : `${baseUrl}${ogImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteCanonicalUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="lt" />
      <meta name="language" content="Lithuanian" />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={absoluteCanonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="lt_LT" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@ragaujam" />
      <meta name="twitter:creator" content="@ragaujam" />
      
      {/* Recipe-specific meta tags */}
      {recipe && (
        <>
          <meta property="og:type" content="article" />
          <meta property="article:published_time" content={recipe.publishedAt} />
          <meta property="article:modified_time" content={recipe.updatedAt} />
          <meta property="article:author" content={recipe.author.name} />
          <meta property="article:section" content="Receptai" />
          {recipe.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          
          {/* Recipe-specific Twitter tags */}
          <meta name="twitter:label1" content="Gaminimo laikas" />
          <meta name="twitter:data1" content={`${recipe.totalTimeMinutes} min`} />
          <meta name="twitter:label2" content="Porcijos" />
          <meta name="twitter:data2" content={`${recipe.servings} ${recipe.servingsUnit}`} />
        </>
      )}
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#f97316" />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//receptu-images.s3.eu-north-1.amazonaws.com" />
      
      {/* Preconnect for Critical Resources */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Ragaujam.lt" />
      <meta name="publisher" content="Ragaujam.lt" />
      <meta name="copyright" content="© 2024 Ragaujam.lt" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Geo Tags for Lithuanian audience */}
      <meta name="geo.region" content="LT" />
      <meta name="geo.country" content="Lithuania" />
      <meta name="geo.placename" content="Lithuania" />
      
      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Head>
  );
}

// Specialized component for recipe pages
export function RecipeSEOHead({ recipe }: { recipe: Recipe }) {
  const title = recipe.seo?.metaTitle || `${recipe.title.lt} - Ragaujam.lt`;
  const description = recipe.seo?.metaDescription || recipe.description.lt;
  
  return (
    <EnhancedSEOHead
      title={title}
      description={description}
      canonicalUrl={recipe.canonicalUrl}
      ogImage={recipe.image.src}
      ogType="article"
      recipe={recipe}
    />
  );
}

// Specialized component for category pages
export function CategorySEOHead({ 
  category, 
  recipes 
}: { 
  category: any; 
  recipes: Recipe[];
}) {
  const title = category.seo?.metaTitle || `${category.title.lt} - Ragaujam.lt`;
  const description = category.seo?.metaDescription || 
    `Atraskite geriausius ${category.title.lt.toLowerCase()} receptus. ${recipes.length} patikrintų receptų su nuotraukomis ir instrukcijomis.`;
  
  return (
    <EnhancedSEOHead
      title={title}
      description={description}
      canonicalUrl={`/receptai/${category.path}`}
      ogType="website"
    />
  );
}
