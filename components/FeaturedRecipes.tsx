import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from './RecipeCard';

interface FeaturedRecipesProps {
  recipes: Recipe[];
}

export default function FeaturedRecipes({ recipes }: FeaturedRecipesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / recipes.length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : recipes.length - 1;
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = currentIndex < recipes.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nėra rekomenduojamų receptų</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {recipes.length > 1 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -ml-4"
            aria-label="Ankstesnis receptas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -mr-4"
            aria-label="Kitas receptas"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}

      {/* Recipes container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-thin space-x-6 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe._id?.toString()}
            className="flex-shrink-0 w-80"
            style={{ scrollSnapAlign: 'start' }}
          >
            <RecipeCard
              recipe={recipe}
              showSaveButton
              showAuthor
              className="h-full"
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {recipes.length > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {recipes.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={`Eiti į ${index + 1} receptą`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
