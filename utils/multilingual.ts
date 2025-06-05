import { Recipe } from '@/types';

export type Locale = 'lt' | 'en';

export function getLocalizedText(
  content: string | { lt: string; en: string },
  locale: Locale = 'lt'
): string {
  if (typeof content === 'string') {
    return content;
  }
  return content[locale] || content.lt || content.en || '';
}

export function getRecipeTitle(recipe: Recipe, locale: Locale = 'lt'): string {
  return getLocalizedText(recipe.title, locale);
}

export function getRecipeDescription(recipe: Recipe, locale: Locale = 'lt'): string {
  return getLocalizedText(recipe.description, locale);
}

export function getIngredientName(
  ingredient: any,
  locale: Locale = 'lt'
): string {
  if (typeof ingredient.name === 'string') {
    return ingredient.name;
  }
  return getLocalizedText(ingredient.name, locale);
}

export function getInstructionText(
  instruction: any,
  locale: Locale = 'lt'
): string {
  if (typeof instruction.text === 'string') {
    return instruction.text;
  }
  return getLocalizedText(instruction.text, locale);
}

// Helper to get recipe timing information
export function getRecipeTiming(recipe: Recipe) {
  return {
    prepTime: recipe.categories?.prepTimeMinutes || recipe.prepTime || 0,
    cookTime: recipe.categories?.cookTimeMinutes || recipe.cookTime || 0,
    totalTime: recipe.categories?.totalTimeMinutes || recipe.totalTime || 0,
  };
}

// Helper to get recipe difficulty
export function getRecipeDifficulty(recipe: Recipe): 'Easy' | 'Medium' | 'Hard' {
  if (recipe.categories?.effort) {
    return recipe.categories.effort;
  }
  
  if (recipe.difficulty) {
    return recipe.difficulty === 'easy' ? 'Easy' : 
           recipe.difficulty === 'medium' ? 'Medium' : 'Hard';
  }
  
  return 'Easy';
}

// Helper to get recipe rating
export function getRecipeRating(recipe: Recipe) {
  return {
    average: recipe.rating?.average || recipe.averageRating || 0,
    count: recipe.rating?.count || recipe.totalRatings || 0,
  };
}

// Helper to get vital ingredients
export function getVitalIngredients(recipe: Recipe, locale: Locale = 'lt') {
  if (!recipe.ingredients) return [];

  return recipe.ingredients
    .filter(ing => typeof ing === 'object' && 'vital' in ing && ing.vital)
    .map(ing => ({
      name: getIngredientName(ing, locale),
      quantity: ing.quantity || '',
    }));
}

// Helper to get total ingredients count
export function getTotalIngredientsCount(recipe: Recipe): number {
  if (!recipe.ingredients) return 0;
  return recipe.ingredients.length;
}

// Helper to get vital ingredients count
export function getVitalIngredientsCount(recipe: Recipe): number {
  if (!recipe.ingredients) return 0;
  return recipe.ingredients.filter(ing => typeof ing === 'object' && 'vital' in ing && ing.vital).length;
}

// Helper to format time display
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}
