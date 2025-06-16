import Head from 'next/head';
import { Recipe } from '@/types';
import { generateRecipeSchemaOrg, generateRecipeSEO, generateBreadcrumbSchema } from '@/utils/schema-org';
interface SchemaOrgRecipeProps {
  recipe: Recipe;
  includeBreadcrumbs?: boolean;
}

export default function SchemaOrgRecipe({ recipe, includeBreadcrumbs = true }: SchemaOrgRecipeProps) {
  // Generate Schema.org structured data
  const recipeSchema = generateRecipeSchemaOrg(recipe);

  // Generate SEO metadata
  const seoData = generateRecipeSEO(recipe);

  // Generate breadcrumb schema if breadcrumbs exist
  const breadcrumbSchema = includeBreadcrumbs && recipe.breadcrumbs
    ? generateBreadcrumbSchema(recipe.breadcrumbs)
    : null;

  return (
    <Head>
      {/* SEO Meta Tags */}
      <title>{seoData.metaTitle}</title>
      <meta name="description" content={seoData.metaDescription} />
      <meta name="keywords" content={seoData.keywords.join(', ')} />
      <link rel="canonical" href={seoData.canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoData.metaTitle} />
      <meta property="og:description" content={seoData.metaDescription} />
      <meta property="og:image" content={seoData.ogImage} />
      <meta property="og:image:alt" content={seoData.ogImageAlt} />
      <meta property="og:url" content={seoData.canonicalUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Paragaujam.lt" />
      <meta property="og:locale" content="lt_LT" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.metaTitle} />
      <meta name="twitter:description" content={seoData.metaDescription} />
      <meta name="twitter:image" content={seoData.ogImage} />
      <meta name="twitter:image:alt" content={seoData.ogImageAlt} />

      {/* Recipe Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeSchema)
        }}
      />

      {/* Breadcrumb Schema.org Structured Data */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Paragaujam.lt" />
      <meta name="language" content="lt" />
    </Head>
  );
}
