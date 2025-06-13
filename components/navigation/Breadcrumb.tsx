import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  schemaData?: any; // Schema.org BreadcrumbList data
  containerless?: boolean; // New prop to render without container styling
}

export default function Breadcrumb({ items, className = '', schemaData, containerless = false }: BreadcrumbProps) {
  const pathname = usePathname();

  // Show breadcrumbs on recipe pages and category pages
  const shouldShowBreadcrumbs = pathname.startsWith('/receptas/') || items;

  if (!shouldShowBreadcrumbs) {
    return null;
  }

  // Generate breadcrumb items based on current route if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname);

  // Generate Schema.org structured data
  const generateSchemaData = () => {
    if (schemaData) return schemaData;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Pagrindinis",
          "item": baseUrl
        },
        ...breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 2,
          "name": item.label,
          "item": item.href ? `${baseUrl}${item.href}` : undefined
        }))
      ]
    };
  };

  return (
    <>
      {/* Breadcrumb navigation */}
      {containerless ? (
        // Containerless version for use inside other containers
        <nav className={`${className}`} aria-label="Breadcrumb">
          <div className="overflow-x-auto scrollbar-hide">
            <ol className="flex items-center space-x-2 text-sm whitespace-nowrap min-w-max">
              {/* Home */}
              <li className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-orange-600 transition-colors flex items-center"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">Pagrindinis</span>
                </Link>
              </li>

              {breadcrumbItems.map((item, index) => (
                <li key={index} className="flex items-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                  {item.href && !item.isActive && index < breadcrumbItems.length - 1 ? (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-orange-600 transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="text-gray-900 font-medium whitespace-nowrap"
                      aria-current={item.isActive ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : (
        // Default version with full container styling
        <nav className={`bg-gray-50 border-b border-gray-200 ${className}`} aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              {/* Mobile: Horizontal scrollable breadcrumbs */}
              <div className="overflow-x-auto scrollbar-hide">
                <ol className="flex items-center space-x-2 text-sm whitespace-nowrap min-w-max">
                  {/* Home */}
                  <li className="flex-shrink-0">
                    <Link
                      href="/"
                      className="text-gray-500 hover:text-orange-600 transition-colors flex items-center"
                    >
                      <Home className="w-4 h-4" />
                      <span className="sr-only">Pagrindinis</span>
                    </Link>
                  </li>

                  {breadcrumbItems.map((item, index) => (
                    <li key={index} className="flex items-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                      {item.href && !item.isActive && index < breadcrumbItems.length - 1 ? (
                        <Link
                          href={item.href}
                          className="text-gray-500 hover:text-orange-600 transition-colors whitespace-nowrap"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className="text-gray-900 font-medium whitespace-nowrap"
                          aria-current={item.isActive ? "page" : undefined}
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  if (pathSegments[0] === 'receptas') {
    items.push({ label: 'Receptai', href: '/receptai' });

    // Handle recipe structure: /receptas/[slug]
    if (pathSegments[1]) {
      const recipeSlug = pathSegments[1];
      const recipeTitle = formatRecipeTitle(recipeSlug);
      items.push({ label: recipeTitle, isActive: true });
    }
  } else if (pathSegments[0] === 'receptai') {
    items.push({ label: 'Receptai', href: '/receptai' });

    // Handle category structure: /receptai/[category]/[subcategory]
    if (pathSegments[1]) {
      const categorySlug = pathSegments[1];
      const categoryTitle = formatCategoryTitle(categorySlug);

      if (pathSegments[2]) {
        // Has subcategory
        items.push({
          label: categoryTitle,
          href: `/receptai/${categorySlug}`
        });

        const subcategorySlug = pathSegments[2];
        const subcategoryTitle = formatSubcategoryTitle(subcategorySlug);
        items.push({ label: subcategoryTitle, isActive: true });
      } else {
        // Category page only
        items.push({ label: categoryTitle, isActive: true });
      }
    }
  }

  return items;
}

function formatRecipeTitle(slug: string): string {
  // Convert slug to readable title
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCategoryTitle(slug: string): string {
  // Convert category slug to readable title
  const categoryMap: { [key: string]: string } = {
    'karsti-patiekalai': 'Karšti patiekalai',
    'sriubos': 'Sriubos',
    'uzkandziai': 'Užkandžiai',
    'salotos': 'Salotos ir mišrainės',
    'vistiena': 'Vištiena',
    'jautiena': 'Jautiena',
    'zuvis': 'Žuvis ir jūros gėrybės',
    'desertai': 'Desertai',
    '15-min-patiekalai': '15 minučių patiekalai',
    'be-glitimo': 'Be glitimo',
    'vegetariski': 'Vegetariški patiekalai'
  };

  return categoryMap[slug] || formatRecipeTitle(slug);
}

function formatSubcategoryTitle(slug: string): string {
  // Convert subcategory slug to readable title
  const subcategoryMap: { [key: string]: string } = {
    'kepsniai-karbonadai': 'Kepsniai ir karbonadai',
    'troskiniai': 'Troškiniai',
    'apkepai': 'Apkepai',
    'koses-tyres': 'Košės ir tyrės',
    'klasikines-sriubos': 'Klasikinės sriubos',
    'vistienos-sriuba': 'Vištienos sriuba',
    'darzoviu-sriubos': 'Daržovių sriubos',
    'rugstynių-sriuba': 'Rūgštynių sriuba',
    'vieno-kasnio': 'Vieno kąsnio užkandžiai',
    'prie-alaus': 'Užkandžiai prie alaus',
    'sumustiniai': 'Sumuštiniai',
    'vistienos-salotos': 'Vištienos salotos',
    'jautienos-salotos': 'Jautienos salotos',
    'darzoviu-salotos': 'Daržovių salotos',
    'vistienos-patiekalai': 'Vištienos patiekalai',
    'jautienos-patiekalai': 'Jautienos patiekalai',
    'jautienos-troskiniai': 'Troškiniai iš jautienos',
    'zuvies-patiekalai': 'Žuvies patiekalai',
    'lasisa': 'Receptai su lašiša',
    'juros-gerybes': 'Jūros gėrybių patiekalai',
    'tortai': 'Tortai',
    'pyragai': 'Pyragai',
    'keksai': 'Keksai',
    'sausainiai': 'Sausainiai'
  };

  return subcategoryMap[slug] || formatRecipeTitle(slug);
}

// Utility function to generate breadcrumbs from recipe data
export function generateRecipeBreadcrumbs(recipe: any): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Receptai",
      href: "/receptai"
    }
  ];

  // Add main category if available
  if (recipe.breadcrumb?.main) {
    breadcrumbs.push({
      label: recipe.breadcrumb.main.label,
      href: `/receptai/${recipe.breadcrumb.main.slug}`
    });
  }

  // Add subcategory if available
  if (recipe.breadcrumb?.sub) {
    breadcrumbs.push({
      label: recipe.breadcrumb.sub.label,
      href: `/receptai/${recipe.breadcrumb.main.slug}/${recipe.breadcrumb.sub.slug}`
    });
  }

  // Add current recipe
  breadcrumbs.push({
    label: recipe.title?.lt || recipe.title,
    href: `/receptai/${recipe.breadcrumb?.main?.slug || 'receptas'}/${recipe.breadcrumb?.sub?.slug || 'patiekalas'}/${recipe.slug}`,
    isActive: true
  });

  return breadcrumbs;
}

// Utility function to generate category page breadcrumbs
export function generateCategoryBreadcrumbs(
  categorySlug: string,
  subcategorySlug?: string,
  categoryData?: any
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Receptai",
      href: "/receptai"
    }
  ];

  // Add main category
  if (categoryData?.label?.lt) {
    breadcrumbs.push({
      label: categoryData.label.lt,
      href: `/receptai/${categorySlug}`,
      isActive: !subcategorySlug
    });
  } else {
    // Fallback if no category data
    breadcrumbs.push({
      label: formatCategoryTitle(categorySlug),
      href: `/receptai/${categorySlug}`,
      isActive: !subcategorySlug
    });
  }

  // Add subcategory if present
  if (subcategorySlug) {
    const subcategoryLabel = categoryData?.subcategories?.find(
      (sub: any) => sub.slug === subcategorySlug
    )?.label || formatSubcategoryTitle(subcategorySlug);

    breadcrumbs.push({
      label: subcategoryLabel,
      href: `/receptai/${categorySlug}/${subcategorySlug}`,
      isActive: true
    });
  }

  return breadcrumbs;
}
