import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CategoryMenu from '../navigation/CategoryMenu';
// Icons replaced with emojis

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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

  // Handle search form submission with loading state
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      try {
        await router.push(`/paieska?q=${encodeURIComponent(searchQuery.trim())}`);
      } finally {
        // Reset loading state after navigation
        setTimeout(() => setIsSearching(false), 500);
      }
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
              <Image
                src="/logo/logo-compact.png"
                alt="Ragaujam.lt"
                width={120}
                height={40}
                priority
                className="h-6 w-auto"
              />
            </Link>

            {/* Mobile Search Bar */}
            <div className="flex-1 mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isSearching ? "Ieškoma..." : "Ieškoti receptų..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                    className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      isSearching ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                </div>
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
            <Link href="/receptai" className="flex items-center">
              <Image
                src="/logo/logo-main.png"
                alt="Ragaujam.lt - Lietuviški receptai"
                width={180}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 flex justify-center">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder={isSearching ? "Ieškoma..." : "Ieškoti receptų..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  className={`w-64 px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    isSearching ? 'bg-gray-50 text-gray-500' : 'bg-white'
                  }`}
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>
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
