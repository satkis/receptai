import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CategoryMenu from '../navigation/CategoryMenu';
// Icons replaced with emojis

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Check if we should show the sidebar (category/subcategory pages, not recipe pages)
  const shouldShowSidebar = () => {
    const path = router.pathname;
    return (
      path.startsWith('/receptai/') &&
      !path.startsWith('/receptas/') && // Not individual recipe pages
      path !== '/receptai' // Not main recipes page
    );
  };

  // Pre-fill search input from URL query parameter
  useEffect(() => {
    if (router.query.q && typeof router.query.q === 'string') {
      setSearchQuery(decodeURIComponent(router.query.q));
    } else {
      setSearchQuery('');
    }
  }, [router.query.q]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/paieska?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigation = [
    // Removed navigation items as requested
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="block md:hidden">
          {/* Top row - Logo and Menu */}
          <div className="flex items-center justify-between h-16">
            <Link href="/receptai" className="flex items-center">
              <span className="text-orange-500 text-2xl">🏠</span>
            </Link>

            {/* Mobile Search Bar */}
            <div className="flex-1 mx-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Ieškoti receptų..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </form>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              {isMenuOpen ? <span className="text-xl">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/receptai" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👨‍🍳</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Ragaujam.lt
              </span>
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 flex justify-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Ieškoti receptų..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Right side - Empty for balance */}
          <div className="flex items-center">
            {/* Empty space for layout balance */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-gray-50">
            {/* Mobile Category Menu */}
            <CategoryMenu
              isVisible={true}
              isMobile={true}
              onCategoryClick={() => setIsMenuOpen(false)}
            />
          </div>
        )}


      </div>
    </header>
  );
}
