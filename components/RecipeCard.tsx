import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Eye,
  ChefHat
} from 'lucide-react';

import { Recipe } from '@/types';
import { formatTime, getDifficultyColor, getDifficultyText } from '@/utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
  showSaveButton?: boolean;
  showAuthor?: boolean;
  className?: string;
}

export default function RecipeCard({ 
  recipe, 
  showSaveButton = false, 
  showAuthor = false,
  className = '' 
}: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSaveRecipe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('Prisijunkite, kad galėtumėte išsaugoti receptus');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe._id,
          action: isSaved ? 'unsave' : 'save',
        }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Receptas pašalintas iš išsaugotų' : 'Receptas išsaugotas');
      } else {
        throw new Error('Nepavyko išsaugoti recepto');
      }
    } catch (error) {
      toast.error('Įvyko klaida. Bandykite dar kartą.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`recipe-card ${className}`}>
      <Link href={`/recipes/${recipe.slug}`}>
        <div className="relative">
          <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="recipe-card-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            
            {/* Overlay with difficulty badge */}
            <div className="absolute top-3 left-3">
              <span className={`${getDifficultyColor(recipe.difficulty)} px-2 py-1 rounded-full text-xs font-medium`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
            </div>

            {/* Save button */}
            {showSaveButton && (
              <button
                onClick={handleSaveRecipe}
                disabled={isLoading}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                  isSaved 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Featured badge */}
            {recipe.isFeatured && (
              <div className="absolute top-3 right-3">
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                  Rekomenduojama
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {recipe.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(recipe.totalTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings}</span>
                </div>
              </div>

              {/* Rating */}
              {recipe.averageRating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{recipe.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({recipe.totalRatings})</span>
                </div>
              )}
            </div>

            {/* Author and stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {showAuthor && (
                <div className="flex items-center space-x-2">
                  <ChefHat className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{recipe.author.name}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{recipe.views}</span>
                </div>
                {recipe.saves > 0 && (
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{recipe.saves}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="badge-tag text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {recipe.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{recipe.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
