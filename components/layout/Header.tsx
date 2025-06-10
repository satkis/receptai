import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Search,
  ChefHat,
  Home
} from 'lucide-react';

export default function Header() {
  console.log('Header component rendered');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  console.log('Header - current route:', router.pathname);

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
              <Home className="w-6 h-6 text-orange-500" />
            </Link>

            {/* Mobile Search Bar */}
            <div className="flex-1 mx-4">
              <input
                type="text"
                placeholder="Ieškoti receptų..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
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
              <Home className="w-5 h-5" />
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
            <button
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors duration-200"
              title="Ieškoti"
            >
              <Search className="w-5 h-5" />
            </button>
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
                <Home className="w-5 h-5 mr-2" />
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
