import Head from 'next/head';

interface SearchResultsSEOProps {
  query: string;
  totalResults: number;
  currentPage?: number;
  totalPages?: number;
}

export default function SearchResultsSEO({ 
  query, 
  totalResults, 
  currentPage = 1, 
  totalPages = 1 
}: SearchResultsSEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  const searchUrl = `${baseUrl}/paieska?q=${encodeURIComponent(query)}`;
  
  // Clean query for display
  const cleanQuery = query.trim();
  const isValidQuery = cleanQuery.length > 0;
  
  // Generate title and description
  const title = isValidQuery 
    ? `"${cleanQuery}" receptų paieška - ${totalResults} rezultatai | Paragaujam.lt`
    : 'Receptų paieška | Paragaujam.lt';
    
  const description = isValidQuery
    ? `Rasta ${totalResults} receptų pagal "${cleanQuery}". Atraskite geriausius lietuviškus receptus su nuotraukomis ir instrukcijomis.`
    : 'Ieškokite receptų pagal ingredientus, pavadinimus ar kategorijas. Daugiau nei 1000 lietuviškų receptų.';

  // Generate structured data for search results
  const searchResultsStructuredData = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "url": searchUrl,
    "name": title,
    "description": description,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalResults,
      "itemListElement": [] // This would be populated with actual results in a real implementation
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/paieska?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Pagrindinis",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Paieška",
        "item": `${baseUrl}/paieska`
      },
      ...(isValidQuery ? [{
        "@type": "ListItem",
        "position": 3,
        "name": `"${cleanQuery}"`,
        "item": searchUrl
      }] : [])
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`receptai, paieška, ${cleanQuery}, lietuviški receptai, gaminimas`} />
      <link rel="canonical" href={searchUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={searchUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Paragaujam.lt" />
      <meta property="og:locale" content="lt_LT" />
      <meta property="og:image" content={`${baseUrl}/og-search-image.jpg`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Search-specific meta tags */}
      <meta name="search:query" content={cleanQuery} />
      <meta name="search:results" content={totalResults.toString()} />
      <meta name="search:page" content={currentPage.toString()} />

      {/* Pagination meta tags */}
      {currentPage > 1 && (
        <link 
          rel="prev" 
          href={`${baseUrl}/paieska?q=${encodeURIComponent(query)}&page=${currentPage - 1}`} 
        />
      )}
      {currentPage < totalPages && (
        <link 
          rel="next" 
          href={`${baseUrl}/paieska?q=${encodeURIComponent(query)}&page=${currentPage + 1}`} 
        />
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchResultsStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />

      {/* SEO optimizations */}
      <meta name="robots" content={isValidQuery && totalResults > 0 ? "index, follow" : "noindex, follow"} />
      <meta name="googlebot" content={isValidQuery && totalResults > 0 ? "index, follow" : "noindex, follow"} />
      
      {/* Performance hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Language and region */}
      <meta httpEquiv="content-language" content="lt" />
      <meta name="geo.region" content="LT" />
      <meta name="geo.country" content="Lithuania" />
    </Head>
  );
}
