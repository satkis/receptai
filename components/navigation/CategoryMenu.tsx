import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Category {
  _id: string;
  title: { lt: string };
  slug: string;
  path: string;
  level: number;
  parentPath?: string;
  isActive: boolean;
}

interface CategoryMenuProps {
  isVisible: boolean;
  isMobile?: boolean;
  onCategoryClick?: () => void;
}

export default function CategoryMenu({ isVisible, isMobile = false, onCategoryClick }: CategoryMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchCategories();
    }
  }, [isVisible]);

  // Group categories by themes from categ-subcateg.md
  const categoryThemes = {
    'Receptai pagal tipą': [
      'Garnyrai', 'Kepsniai', 'Makaronų receptai', 'Nevalgiukams', 'Pietūs', 'Pusryčiai',
      'Salotos', 'Sriubos', 'Šeimai', 'Troškiniai', 'Užkandžiai', 'Vaikams', 'Vakarienė',
      'Vieno puodo receptai'
    ],
    'Pagrindinis ingredientas': [
      'Avokadas', 'Bulvės', 'Daržovės', 'Duona', 'Elniena', 'Faršas', 'Grybai', 'Jautiena',
      'Jūros gėrybės', 'Kalakutiena', 'Kiauliena', 'Kiaušiniai', 'Lęšiai', 'Makaronai',
      'Miltiniai', 'Pienas ir pieno produktai', 'Pupelės', 'Ryžiai', 'Sūris', 'Tofu',
      'Triušiena', 'Uogos', 'Vaisiai', 'Varškė', 'Vištiena', 'Žuvis', 'Žvėriena'
    ],
    'Gaminimo būdas': [
      'Ant grilio', 'Ant laužo', 'Be kepimo', 'Duonkepėje', 'Garų puode', 'Greitpuodyje',
      'Kazane', 'Kepta keptuvėje', 'Kepta orkaitėje', 'Oro gruzdintuvėje', 'Troškinta',
      'Žaliavalgiams'
    ],
    'Proga / Tema / Sezonas': [
      'Gimtadienio stalui', 'Helovinui', 'Kalėdoms', 'Kūčioms', 'Naujųjų metų stalui',
      'Paskutinės minutės', 'Šeimos pietums', 'Vaikų gimtadieniui', 'Vasarai', 'Velykoms',
      'Žiemai'
    ],
    'Pagal ypatybę': [
      'Be angliavandenių', 'Be glitimo', 'Be kiaušinių', 'Be laktozės', 'Be mėsos',
      'Be pieno produktų', 'Be riebalų', 'Cholesteroliui mažinti', 'Diabetikams',
      'Greitai pagaminami', 'Lengvai pagaminami', 'Pigiai pagaminami', 'Pietūs į darbą'
    ]
  };

  // Group categories by themes
  const groupedCategories = Object.entries(categoryThemes).map(([themeName, categoryTitles]) => ({
    theme: themeName,
    categories: categories.filter(cat => categoryTitles.includes(cat.title.lt))
  }));

  // Toggle theme expansion
  const toggleTheme = (themeName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(themeName)) {
      newExpanded.delete(themeName);
    } else {
      newExpanded.add(themeName);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle category click
  const handleCategoryClick = (href: string) => {
    // Force server-side navigation to ensure fresh data
    if (router.asPath === href) {
      // If same page, force refresh
      router.replace(href);
    } else {
      // Navigate to new page with server-side rendering
      window.location.href = href;
    }

    if (onCategoryClick) {
      onCategoryClick();
    }
  };

  if (!isVisible) return null;

  const menuClasses = isMobile 
    ? "w-full bg-white border-t border-gray-200 py-4"
    : "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40";

  return (
    <div className={menuClasses}>
      <div className={isMobile ? "px-4" : "p-4"}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Kategorijos
        </h2>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <nav className="space-y-4">
            {groupedCategories.map(({ theme, categories: themeCategories }) => (
              <div key={theme} className="space-y-1">
                {/* Theme Header */}
                <button
                  onClick={() => toggleTheme(theme)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-800 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-md transition-colors"
                >
                  <span>{theme}</span>
                  <span className="text-gray-400 text-xs">
                    {expandedCategories.has(theme) ? '−' : '+'}
                  </span>
                </button>

                {/* Categories under theme */}
                {expandedCategories.has(theme) && (
                  <div className="ml-2 space-y-1">
                    {themeCategories.map((category) => (
                      <button
                        key={category.path}
                        onClick={() => handleCategoryClick(`/receptai/${category.path}`)}
                        className={`w-full text-left block px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors ${
                          router.asPath === `/receptai/${category.path}`
                            ? 'text-orange-600 bg-orange-50 font-medium'
                            : ''
                        }`}
                      >
                        {category.title.lt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

// API endpoint to fetch categories
export async function getCategoriesData() {
  // This would be called from /pages/api/categories.ts
  return [];
}
