import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Utensils, Coffee, Cookie, Salad, Wine } from 'lucide-react';

interface FilterCategoryProps {
  categories: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  showAsGrid?: boolean;
}

const categoryIcons: Record<string, any> = {
  'Pirmieji patiekalai': Utensils,
  'Antrieji patiekalai': ChefHat,
  'Saldumynai': Cookie,
  'Užkandžiai': Salad,
  'Gėrimai': Coffee,
  'Salotos': Salad,
};

const categoryColors: Record<string, string> = {
  'Pirmieji patiekalai': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'Antrieji patiekalai': 'bg-green-100 text-green-800 hover:bg-green-200',
  'Saldumynai': 'bg-pink-100 text-pink-800 hover:bg-pink-200',
  'Užkandžiai': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Gėrimai': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'Salotos': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
};

export default function FilterCategory({
  categories,
  selectedCategory = '',
  onCategoryChange,
  showAsGrid = false,
}: FilterCategoryProps) {
  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category === selectedCategory ? '' : category);
    }
  };

  if (showAsGrid) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category] || ChefHat;
          const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
          
          return (
            <Link
              key={category}
              href={`/receptai?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
              className={`${colorClass} p-6 rounded-xl text-center transition-all duration-200 hover:scale-105 hover:shadow-md group`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-white/50 rounded-lg group-hover:bg-white/80 transition-colors duration-200">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-medium text-sm">{category}</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryClick('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === ''
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Visi
      </button>
      
      {categories.map((category) => {
        const Icon = categoryIcons[category] || ChefHat;
        const isSelected = selectedCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
