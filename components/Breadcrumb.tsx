import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const router = useRouter();
  
  // Only show breadcrumbs on recipe subpages
  const isRecipeSubpage = router.pathname.startsWith('/recipes/') && router.pathname !== '/recipes';
  
  if (!isRecipeSubpage && !items) {
    return null;
  }

  // Generate breadcrumb items based on current route if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(router);

  return (
    <nav className={`bg-gray-50 border-b border-gray-200 ${className}`} aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {/* Home */}
            <li>
              <Link 
                href="/" 
                className="text-gray-500 hover:text-orange-600 transition-colors flex items-center"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only">Pagrindinis</span>
              </Link>
            </li>

            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                {item.href && index < breadcrumbItems.length - 1 ? (
                  <Link 
                    href={item.href}
                    className="text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}

function generateBreadcrumbItems(router: any): BreadcrumbItem[] {
  const pathSegments = router.pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  if (pathSegments[0] === 'recipes') {
    items.push({ label: 'Receptai', href: '/recipes' });
    
    if (pathSegments[1]) {
      // This is a specific recipe page
      // We could fetch the recipe title here, but for now use the slug
      const recipeSlug = pathSegments[1];
      const recipeTitle = formatRecipeTitle(recipeSlug);
      items.push({ label: recipeTitle });
    }
  }

  if (pathSegments[0] === 'categories') {
    items.push({ label: 'Kategorijos', href: '/categories' });
    
    if (pathSegments[1]) {
      const categorySlug = pathSegments[1];
      const categoryTitle = formatCategoryTitle(categorySlug);
      items.push({ label: categoryTitle });
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
    'sriubos': 'Sriubos',
    'troskiniai': 'Troškiniai',
    'salotos': 'Salotos',
    'desertas': 'Desertai',
    'uzkandziai': 'Užkandžiai',
    'pagrindinis-patiekalas': 'Pagrindiniai patiekalai'
  };
  
  return categoryMap[slug] || formatRecipeTitle(slug);
}
