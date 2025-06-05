import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';
import { debounce } from '@/utils/helpers';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  enableSuggestions?: boolean;
}

interface SearchSuggestion {
  type: 'recipe' | 'ingredient' | 'category';
  title: string;
  slug?: string;
  category?: string;
}

export default function SearchBar({
  placeholder = 'Ieškoti...',
  className = '',
  onSearch,
  enableSuggestions = true
}: SearchBarProps) {
  console.log('SearchBar component rendered with props:', { placeholder, className, enableSuggestions });

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    console.log('debouncedSearch called with query:', searchQuery);

    if (searchQuery.length < 2) {
      console.log('Query too short, clearing suggestions');
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching suggestions for:', searchQuery);
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Suggestions received:', data.suggestions);
        setSuggestions(data.suggestions || []);
      } else {
        console.error('Suggestions API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Search suggestions error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input changed to:', value);
    setQuery(value);
    setSelectedIndex(-1);

    if (enableSuggestions && value.trim()) {
      console.log('Starting search with suggestions enabled');
      setIsLoading(true);
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      console.log('Clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with query:', query);
    performSearch(query);
  };

  const performSearch = (searchQuery: string) => {
    console.log('performSearch called with:', searchQuery);
    if (!searchQuery.trim()) {
      console.log('Empty query, skipping search');
      return;
    }

    setShowSuggestions(false);

    if (onSearch) {
      console.log('Using custom onSearch callback');
      onSearch(searchQuery);
    } else {
      console.log('Navigating to search page');
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    console.log('Suggestion clicked:', suggestion);

    if (suggestion.type === 'recipe' && suggestion.slug) {
      console.log('Navigating to recipe:', suggestion.slug);
      router.push(`/recipes/${suggestion.slug}`);
    } else if (suggestion.type === 'category' && suggestion.category) {
      console.log('Navigating to category:', suggestion.category);
      router.push(`/recipes?category=${encodeURIComponent(suggestion.category)}`);
    } else {
      console.log('Performing search for suggestion title:', suggestion.title);
      performSearch(suggestion.title);
    }

    setQuery(suggestion.title);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          performSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-container ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="search-icon w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="spinner w-5 h-5 mx-auto mb-2" />
                Ieškoma...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.title}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      suggestion.type === 'recipe' ? 'bg-primary' :
                      suggestion.type === 'ingredient' ? 'bg-secondary' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {suggestion.type === 'recipe' ? 'Receptas' :
                         suggestion.type === 'ingredient' ? 'Ingredientas' :
                         'Kategorija'}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
}
