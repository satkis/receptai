import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Star, Heart, Bookmark } from 'lucide-react';
import { Recipe } from '@/types';
import {
  getRecipeTitle,
  getRecipeDescription,
  getRecipeTiming,
  getRecipeDifficulty,
  getRecipeRating,
  getVitalIngredients,
  getTotalIngredientsCount,
  getVitalIngredientsCount,
  formatTime
} from '@/utils/multilingual';

interface NewRecipeCardProps {
  recipe: Recipe;
  variant?: 'grid' | 'featured';
  className?: string;
}

export default function NewRecipeCard({ recipe, variant = 'grid', className = '' }: NewRecipeCardProps) {
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Get localized content - use description as display title
  const title = getRecipeTitle(recipe); // Keep for background/future use
  const description = getRecipeDescription(recipe);
  const displayTitle = description; // Use description as the main title
  const vitalIngredients = getVitalIngredients(recipe);
  const allIngredients = recipe.ingredients || [];
  const totalIngredients = getTotalIngredientsCount(recipe);
  const vitalCount = getVitalIngredientsCount(recipe);
  const timing = getRecipeTiming(recipe);
  const effort = getRecipeDifficulty(recipe);
  const rating = getRecipeRating(recipe);

  const servings = recipe.servings || 4;
  const cuisine = recipe.categories?.cuisine || 'Lithuanian';
  const author = recipe.author?.name || 'Chef';

  const handleIngredientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIngredientsExpanded(!isIngredientsExpanded);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (variant === 'featured') {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="relative lg:w-64 h-48 lg:h-auto">
            <Image
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={title}
              fill
              className="object-cover"
            />
            
            {/* Time and Servings Indicators */}
            <div className="absolute top-4 left-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-gray-500">
                  <span>🕒</span>
                  <span className="text-sm font-medium">{formatTime(timing.totalTime)}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-300/80 backdrop-blur-sm rounded-full px-2 py-1 text-gray-700">
                  <span className="text-xs">Porcijos: {servings}</span>
                </div>
              </div>
            </div>
            
            {/* Heart Button */}
            <button
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              onClick={handleHeartClick}
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </button>
            

          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-6">
            <Link href={`/recipes/${recipe.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 hover:text-orange-600 transition-colors line-clamp-2">
                {displayTitle}
              </h3>
            </Link>
            
            {/* Ingredients */}
            {(vitalIngredients.length > 0 || allIngredients.length > 0) && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredientai:</h4>
                <div
                  className="flex flex-wrap gap-1 cursor-pointer"
                  onClick={handleIngredientsClick}
                >
                  {!isIngredientsExpanded ? (
                    <>
                      {vitalIngredients.slice(0, 3).map((ingredient, index) => (
                        <span key={index} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                          {ingredient.name}
                        </span>
                      ))}
                      {totalIngredients > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          +{totalIngredients - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {allIngredients.map((ingredient, index) => {
                        const name = typeof ingredient.name === 'string' ? ingredient.name : ingredient.name?.lt || '';
                        const isVital = typeof ingredient === 'object' && 'vital' in ingredient && ingredient.vital;
                        return (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              isVital
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {name}
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Cuisine and Meal Type */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">{cuisine} virtuvė</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-600 font-medium">Tinka</div>
                <div className="text-xs text-gray-500">{recipe.categories?.mealType === 'Dinner' ? 'Vakarienei' : recipe.categories?.mealType || 'Vakarienei'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (compact)
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}>
        {/* Image Section */}
        <div className="relative h-48">
          <Image
            src={recipe.image || '/placeholder-recipe.jpg'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Time and Servings Indicators */}
          <div className="absolute top-3 left-3">
            <div className="flex flex-col sm:flex-row gap-1">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-gray-500">
                <span>🕒</span>
                <span className="text-xs font-medium">{formatTime(timing.totalTime)}</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-300/80 backdrop-blur-sm rounded-full px-2 py-1 text-gray-700">
                <span className="text-xs">Porcijos: {servings}</span>
              </div>
            </div>
          </div>
          

          
          {/* Heart Button */}
          <button
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            onClick={handleHeartClick}
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="p-4">
          <Link href={`/recipes/${recipe.slug}`}>
            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors text-sm cursor-pointer">
              {displayTitle}
            </h3>
          </Link>
          
          {/* Ingredients */}
          {(vitalIngredients.length > 0 || allIngredients.length > 0) && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Ingredientai:</div>
              <div
                className="flex flex-wrap gap-1 cursor-pointer"
                onClick={handleIngredientsClick}
              >
                {!isIngredientsExpanded ? (
                  <>
                    {vitalIngredients.slice(0, 3).map((ingredient, index) => (
                      <span key={index} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                        {ingredient.name}
                      </span>
                    ))}
                    {totalIngredients > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        +{totalIngredients - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {allIngredients.map((ingredient, index) => {
                      const name = typeof ingredient.name === 'string' ? ingredient.name : ingredient.name?.lt || '';
                      const isVital = typeof ingredient === 'object' && 'vital' in ingredient && ingredient.vital;
                      return (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isVital
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {name}
                        </span>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Hidden for now - Author and Reviews */}
          {/* <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              by <span className="font-medium text-gray-700">{author}</span>
            </div>
            {rating.count > 0 && (
              <div className="text-xs text-gray-500">
                ({rating.count} reviews)
              </div>
            )}
          </div> */}
        </div>
    </div>
  );
}
