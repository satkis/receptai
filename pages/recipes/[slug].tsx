import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ChefHat, ArrowLeft, Heart, Bookmark, Share2 } from 'lucide-react';
import SchemaOrgRecipe from '@/components/SchemaOrgRecipe';
import { getMultilingualIngredientIcon } from '@/utils/ingredientIcons';

interface Recipe {
  id: string;
  slug: string;
  title: { lt: string; en: string } | string;
  description: { lt: string; en: string } | string;
  image: { url: string } | string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes: number;
  servings: { amount: number } | number;
  ingredients: Array<{
    name: { lt: string; en: string } | string;
    amount: number | string;
    unit: { lt: string; en: string } | string;
  }>;
  instructions?: Array<{
    step: number;
    text: { lt: string; en: string } | string;
  }>;
  nutrition?: {
    calories: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  author?: {
    name: string;
  };
  keywords?: string[];
  createdAt?: string;
  categories?: string[];
  filters?: {
    cuisine?: string;
    mealType?: string;
    dietary?: string[];
  };
}

interface RecipePageProps {
  recipe: Recipe;
  language: string;
}

export default function RecipePage({ recipe, language = 'lt' }: RecipePageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Initialize checked ingredients array when recipe loads
  useEffect(() => {
    if (recipe.ingredients) {
      setCheckedIngredients(new Array(recipe.ingredients.length).fill(false));
    }
  }, [recipe.ingredients]);

  // Toggle ingredient checked state
  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  // Text truncation helpers
  const truncateText = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  };

  const shouldShowExpandButton = (text: string, maxLength: number = 140) => {
    return text.length > maxLength;
  };

  // Helper functions
  const getTitle = () => {
    if (typeof recipe.title === 'string') return recipe.title;
    return recipe.title[language as keyof typeof recipe.title] || recipe.title.lt || 'Recipe';
  };

  const getDescription = () => {
    if (typeof recipe.description === 'string') return recipe.description;
    return recipe.description[language as keyof typeof recipe.description] || recipe.description.lt || '';
  };

  const getImageUrl = () => {
    if (typeof recipe.image === 'string') return recipe.image;
    return recipe.image?.url || '/images/placeholder-recipe.jpg';
  };

  const getServings = () => {
    if (typeof recipe.servings === 'number') return recipe.servings;
    return recipe.servings?.amount || 4;
  };

  const getIngredientText = (ingredient: any) => {
    const name = typeof ingredient.name === 'string' 
      ? ingredient.name 
      : ingredient.name?.[language] || ingredient.name?.lt || 'Ingredient';
    
    const unit = typeof ingredient.unit === 'string'
      ? ingredient.unit
      : ingredient.unit?.[language] || ingredient.unit?.lt || '';
    
    const amount = typeof ingredient.amount === 'string' 
      ? ingredient.amount 
      : (parseFloat(ingredient.amount || '1') * servingMultiplier).toString();
    
    return { name, unit, amount };
  };

  const getInstructionText = (instruction: any) => {
    if (typeof instruction.text === 'string') return instruction.text;
    return instruction.text?.[language] || instruction.text?.lt || instruction;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getTitle(),
          text: getDescription(),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Nuoroda nukopijuota!');
    }
  };

  return (
    <>
      <SchemaOrgRecipe recipe={recipe} language={language} url={`https://receptai.lt/recipes/${recipe.slug}`} />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-6">
            <Link href="/new-recipes" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Atgal į receptus</span>
            </Link>
          </nav>

          {/* Recipe Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="relative h-64 md:h-80">
              <Image
                src={getImageUrl()}
                alt={getTitle()}
                fill
                className="object-cover"
                priority
              />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-blue-500 fill-blue-500' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Recipe Meta */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{recipe.totalTimeMinutes} min</span>
                </div>
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{getServings()} porcijos</span>
                </div>
                {recipe.filters?.cuisine && (
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <ChefHat className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{recipe.filters.cuisine}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{getTitle()}</h1>
              <div className="text-gray-600 text-lg leading-relaxed">
                {(() => {
                  const description = getDescription();
                  const shouldTruncate = shouldShowExpandButton(description);

                  if (!shouldTruncate) {
                    return <p>{description}</p>;
                  }

                  return (
                    <p>
                      {isDescriptionExpanded ? description : truncateText(description)}
                      {!isDescriptionExpanded && '... '}
                      {isDescriptionExpanded && ' '}
                      <span
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-orange-600 hover:text-orange-700 cursor-pointer transition-colors duration-200"
                      >
                        {isDescriptionExpanded ? 'rodyti mažiau' : 'rodyti viską'}
                      </span>
                    </p>
                  );
                })()}
              </div>
              
              {/* Rating */}
              {recipe.rating && recipe.rating.count > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.round(recipe.rating!.average) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {recipe.rating.average.toFixed(1)} ({recipe.rating.count} įvertinimai)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid xl:grid-cols-5 lg:grid-cols-4 gap-8">
            {/* Ingredients Sidebar */}
            <div className="xl:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8" style={{ minWidth: '350px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Ingredientai</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium px-2">{getServings() * servingMultiplier} porcijos</span>
                    <button
                      onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {recipe.ingredients?.map((ingredient, index) => {
                    const { name, unit, amount } = getIngredientText(ingredient);
                    const icon = getMultilingualIngredientIcon(ingredient);
                    const isChecked = checkedIngredients[index] || false;
                    return (
                      <li key={index} className="flex items-center gap-3 cursor-pointer py-2" onClick={() => toggleIngredient(index)}>
                        <span className={`text-xl transition-all duration-200 ${
                          isChecked ? 'grayscale opacity-50' : ''
                        }`}>
                          {icon}
                        </span>
                        <span className={`flex-1 transition-all duration-200 ${
                          isChecked
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}>
                          {name}
                        </span>
                        <span className={`font-medium transition-all duration-200 ${
                          isChecked
                            ? 'text-gray-400 line-through'
                            : 'text-orange-600'
                        }`}>
                          {amount} {unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Nutrition Info */}
                {recipe.nutrition && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Maistinė vertė</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                        <span className="text-gray-700 font-medium">Kalorijos</span>
                        <span className="font-bold text-orange-600">{recipe.nutrition.calories}</span>
                      </div>
                      {recipe.nutrition.protein && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Baltymai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.protein}</span>
                        </div>
                      )}
                      {recipe.nutrition.carbohydrates && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Angliavandeniai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.carbohydrates}</span>
                        </div>
                      )}
                      {recipe.nutrition.fat && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Riebalai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.fat}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="xl:col-span-3 lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Gaminimo instrukcijos</h2>

                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {instruction.step || index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 leading-relaxed">{getInstructionText(instruction)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500 italic">Gaminimo instrukcijos bus pridėtos netrukus...</p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden space-y-6">
            {/* Ingredients First on Mobile */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Ingredientai</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium px-2">{getServings() * servingMultiplier} porcijos</span>
                  <button
                    onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <ul className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => {
                  const { name, unit, amount } = getIngredientText(ingredient);
                  const icon = getMultilingualIngredientIcon(ingredient);
                  const isChecked = checkedIngredients[index] || false;
                  return (
                    <li key={index} className="flex items-center gap-3 cursor-pointer py-2" onClick={() => toggleIngredient(index)}>
                      <span className={`text-xl transition-all duration-200 ${
                        isChecked ? 'grayscale opacity-50' : ''
                      }`}>
                        {icon}
                      </span>
                      <span className={`flex-1 transition-all duration-200 ${
                        isChecked
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}>
                        {name}
                      </span>
                      <span className={`font-medium transition-all duration-200 ${
                        isChecked
                          ? 'text-gray-400 line-through'
                          : 'text-orange-600'
                      }`}>
                        {amount} {unit}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Nutrition Info on Mobile */}
              {recipe.nutrition && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Maistinė vertė</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center py-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{recipe.nutrition.calories}</div>
                      <div className="text-xs text-gray-600">Kalorijos</div>
                    </div>
                    {recipe.nutrition.protein && (
                      <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{recipe.nutrition.protein}</div>
                        <div className="text-xs text-gray-600">Baltymai</div>
                      </div>
                    )}
                    {recipe.nutrition.carbohydrates && (
                      <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{recipe.nutrition.carbohydrates}</div>
                        <div className="text-xs text-gray-600">Angliavandeniai</div>
                      </div>
                    )}
                    {recipe.nutrition.fat && (
                      <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{recipe.nutrition.fat}</div>
                        <div className="text-xs text-gray-600">Riebalai</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Second on Mobile */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gaminimo instrukcijos</h2>

              {recipe.instructions && recipe.instructions.length > 0 ? (
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                        {instruction.step || index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 leading-relaxed">{getInstructionText(instruction)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic">Gaminimo instrukcijos bus pridėtos netrukus...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const { slug } = params!;
  const language = (query.lang as string) || 'lt';

  try {
    // Fetch recipe from API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recipes/${slug}`);
    
    if (!response.ok) {
      return { notFound: true };
    }

    const data = await response.json();
    
    if (!data.success) {
      return { notFound: true };
    }

    return {
      props: {
        recipe: data.data,
        language,
      },
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return { notFound: true };
  }
};
