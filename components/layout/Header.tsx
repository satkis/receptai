import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Icons replaced with emojis

export default function Header() {
  console.log('Header component rendered');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  console.log('Header - current route:', router.pathname);

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
    { name: 'Receptai', href: '/receptai' }, // Updated to use Lithuanian URL
    { name: 'Kategorijos', href: '/receptai' }, // Updated to use Lithuanian URL
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="block md:hidden">
          {/* Top row - Logo and Menu */}
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👨‍🍳</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Paragaujam.lt
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className={`flex items-center ${
                router.pathname === '/'
                  ? 'text-orange-500 font-medium'
                  : 'text-gray-700 hover:text-orange-500'
              } transition-colors duration-200`}
            >
              <span className="text-lg">🏠</span>
            </Link>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  router.pathname.startsWith(item.href)
                    ? 'text-orange-500 font-medium'
                    : 'text-gray-700 hover:text-orange-500'
                } transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Search */}
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-gray-50">
            <div className="space-y-2">
              <Link
                href="/"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  router.pathname === '/'
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
                } transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg mr-2">🏠</span>
                Pagrindinis
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    router.pathname.startsWith(item.href)
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
                  } transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
