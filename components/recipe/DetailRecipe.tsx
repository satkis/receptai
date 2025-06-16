import { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Users,
  Star,
  Heart,
  Eye,
  ChefHat,
  Timer,
  Check,
  Plus,
  Minus
} from 'lucide-react';

import { Recipe } from '@/types';
import Breadcrumb, { generateRecipeBreadcrumbs } from '@/components/navigation/Breadcrumb';

interface DetailRecipeProps {
  recipe: Recipe;
}

export default function DetailRecipe({ recipe }: DetailRecipeProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeTimer, setActiveTimer] = useState<number | null>(null);

  const servingMultiplier = servings / recipe.servings;

  // Generate breadcrumb items for this recipe
  const breadcrumbItems = generateRecipeBreadcrumbs(recipe);

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleStep = (step: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(step)) {
      newCompleted.delete(step);
    } else {
      newCompleted.add(step);
    }
    setCompletedSteps(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Lengvas';
      case 'medium': return 'Vidutinis';
      case 'hard': return 'Sunkus';
      default: return 'Nežinomas';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className={`${getDifficultyColor(recipe.difficulty)} px-3 py-1 rounded-full text-sm font-medium`}>
            {getDifficultyText(recipe.difficulty)}
          </span>
          <span className="text-sm text-gray-500">{recipe.category}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {recipe.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          {recipe.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{formatTime(recipe.totalTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{recipe.servings} porcijos</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            <span>{recipe.author.name}</span>
          </div>
          {recipe.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span>{recipe.averageRating.toFixed(1)} ({recipe.totalRatings})</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
        <Image
          src={typeof recipe.image === 'string' ? recipe.image : recipe.image?.src || recipe.image?.url || '/placeholder-recipe.jpg'}
          alt={typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Recipe image'}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
        <Breadcrumb items={breadcrumbItems} containerless={true} />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ingredientai</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                  {servings} porcijos
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    checkedIngredients.has(index) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleIngredient(index)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    checkedIngredients.has(index)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {checkedIngredients.has(index) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      checkedIngredients.has(index) ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {(ingredient.amount * servingMultiplier).toFixed(ingredient.amount < 1 ? 1 : 0)} {ingredient.unit} {ingredient.name}
                    </div>
                    {ingredient.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        {ingredient.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Info */}
            {recipe.nutrition && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Maistinė vertė (1 porcijai)</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Kalorijos:</span>
                    <span className="font-medium ml-2">{Math.round(recipe.nutrition.calories * servingMultiplier / servings)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Baltymai:</span>
                    <span className="font-medium ml-2">{Math.round(recipe.nutrition.protein * servingMultiplier / servings)}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Angliavandeniai:</span>
                    <span className="font-medium ml-2">{Math.round(recipe.nutrition.carbs * servingMultiplier / servings)}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Riebalai:</span>
                    <span className="font-medium ml-2">{Math.round(recipe.nutrition.fat * servingMultiplier / servings)}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gaminimo instrukcijos</h2>
          
          <div className="space-y-6">
            {recipe.instructions.map((instruction, index) => (
              <div
                key={instruction.step}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all ${
                  completedSteps.has(instruction.step) ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                      completedSteps.has(instruction.step)
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                    onClick={() => toggleStep(instruction.step)}
                  >
                    {completedSteps.has(instruction.step) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      instruction.step
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-gray-900 leading-relaxed ${
                      completedSteps.has(instruction.step) ? 'line-through' : ''
                    }`}>
                      {instruction.text}
                    </p>
                    
                    {instruction.timer && (
                      <div className="flex items-center gap-2 mt-3">
                        <Timer className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {Math.floor(instruction.timer / 60)} min {instruction.timer % 60 > 0 ? `${instruction.timer % 60} sek` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
