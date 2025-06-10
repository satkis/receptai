import React, { useState } from 'react';
import { Clock, Utensils, Leaf, Globe } from 'lucide-react';

interface FilterOptions {
  dietary: string[];
  cuisine: string[];
  maxTime: number | null;
  language: string;
}

interface FilterAdvancedProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export default function FilterAdvanced({ filters, onFiltersChange, className = '' }: FilterAdvancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetariška', icon: '🌱' },
    { key: 'vegan', label: 'Veganiška', icon: '🌿' },
    { key: 'gluten-free', label: 'Be glitimo', icon: '🚫🌾' },
    { key: 'dairy-free', label: 'Be pieno', icon: '🚫🥛' },
  ];

  const cuisineOptions = [
    { key: 'lithuanian', label: 'Lietuviška', icon: '🇱🇹' },
    { key: 'european', label: 'Europietiška', icon: '🇪🇺' },
    { key: 'international', label: 'Tarptautinė', icon: '🌍' },
  ];

  const timeOptions = [
    { value: 15, label: '≤ 15 min' },
    { value: 30, label: '≤ 30 min' },
    { value: 60, label: '≤ 1 val' },
    { value: 120, label: '≤ 2 val' },
  ];

  const handleDietaryChange = (dietary: string) => {
    const newDietary = filters.dietary.includes(dietary)
      ? filters.dietary.filter(d => d !== dietary)
      : [...filters.dietary, dietary];
    
    onFiltersChange({ ...filters, dietary: newDietary });
  };

  const handleCuisineChange = (cuisine: string) => {
    const newCuisine = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter(c => c !== cuisine)
      : [cuisine]; // Only one cuisine at a time
    
    onFiltersChange({ ...filters, cuisine: newCuisine });
  };

  const handleTimeChange = (maxTime: number | null) => {
    onFiltersChange({ ...filters, maxTime });
  };

  const handleLanguageChange = (language: string) => {
    onFiltersChange({ ...filters, language });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dietary: [],
      cuisine: [],
      maxTime: null,
      language: 'lt'
    });
  };

  const hasActiveFilters = filters.dietary.length > 0 || filters.cuisine.length > 0 || filters.maxTime !== null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Filter Toggle Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <Utensils className="w-4 h-4" />
            <span className="font-medium">Filtrai</span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
            >
              Išvalyti
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Language Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Kalba</span>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'lt', label: 'Lietuvių' },
                { key: 'en', label: 'English' }
              ].map(lang => (
                <button
                  key={lang.key}
                  onClick={() => handleLanguageChange(lang.key)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.language === lang.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Mityba</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => handleDietaryChange(option.key)}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.dietary.includes(option.key)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Virtuvė</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => handleCuisineChange(option.key)}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.cuisine.includes(option.key)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Laikas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTimeChange(filters.maxTime === option.value ? null : option.value)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.maxTime === option.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
