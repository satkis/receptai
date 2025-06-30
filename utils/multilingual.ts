import { Recipe } from '@/types';

// Helper function to get recipe title in appropriate language
export function getRecipeTitle(recipe: Recipe): string {
  if (typeof recipe.title === 'string') {
    return recipe.title;
  }
  return recipe.title?.lt || recipe.title?.en || 'Receptas';
}

// Helper function to get recipe description in appropriate language
export function getRecipeDescription(recipe: Recipe): string {
  if (typeof recipe.description === 'string') {
    return recipe.description;
  }
  return recipe.description?.lt || recipe.description?.en || '';
}

// Helper function to get recipe timing information
export function getRecipeTiming(recipe: Recipe): { totalTime: number; prepTime: number; cookTime: number } {
  return {
    totalTime: recipe.totalTimeMinutes || recipe.totalTime || 0,
    prepTime: recipe.prepTimeMinutes || recipe.prepTime || 0,
    cookTime: recipe.cookTimeMinutes || recipe.cookTime || 0
  };
}

// Helper function to get recipe difficulty
export function getRecipeDifficulty(recipe: Recipe): string {
  return recipe.difficulty || 'medium';
}

// Helper function to get recipe rating
export function getRecipeRating(recipe: Recipe): { average: number; count: number } {
  if (recipe.rating) {
    return recipe.rating;
  }
  return {
    average: recipe.averageRating || 0,
    count: recipe.totalRatings || 0
  };
}

// Helper function to get vital ingredients
export function getVitalIngredients(recipe: Recipe): Array<{ name: string; quantity?: string }> {
  if (!recipe.ingredients) return [];

  const vitalIngredients: Array<{ name: string; quantity?: string }> = [];

  // Get vital main ingredients
  if (Array.isArray(recipe.ingredients)) {
    const mainVital = recipe.ingredients
      .filter(ingredient => {
        if (typeof ingredient === 'object' && 'vital' in ingredient) {
          return ingredient.vital;
        }
        return true; // If no vital field, consider all as vital
      })
      .map(ingredient => {
        let name = '';
        let quantity = '';

        if (typeof ingredient === 'object') {
          // Handle multilingual name structure
          if (typeof ingredient.name === 'string') {
            name = ingredient.name;
          } else if (ingredient.name?.lt) {
            name = ingredient.name.lt;
          } else if (ingredient.name?.en) {
            name = ingredient.name.en;
          }

          // Handle quantity
          if ('quantity' in ingredient) {
            quantity = ingredient.quantity || '';
          } else if ('amount' in ingredient && 'unit' in ingredient) {
            quantity = `${ingredient.amount} ${ingredient.unit}`;
          }
        }

        return { name, quantity };
      })
      .filter(ingredient => ingredient.name);

    vitalIngredients.push(...mainVital);
  }

  // Get vital side ingredients
  if (recipe.sideIngredients) {
    const sideVital = recipe.sideIngredients
      .filter(ingredient => ingredient.vital)
      .map(ingredient => ({
        name: typeof ingredient.name === 'string' ? ingredient.name : ingredient.name?.lt || '',
        quantity: ingredient.quantity
      }))
      .filter(ingredient => ingredient.name);

    vitalIngredients.push(...sideVital);
  }

  return vitalIngredients;
}

// Helper function to get total ingredients count
export function getTotalIngredientsCount(recipe: Recipe): number {
  const mainCount = recipe.ingredients?.length || 0;
  const sideCount = recipe.sideIngredients?.length || 0;
  return mainCount + sideCount;
}

// Helper function to get vital ingredients count
export function getVitalIngredientsCount(recipe: Recipe): number {
  let vitalCount = 0;

  // Count vital main ingredients
  if (recipe.ingredients) {
    vitalCount += recipe.ingredients.filter(ingredient => {
      if (typeof ingredient === 'object' && 'vital' in ingredient) {
        return ingredient.vital;
      }
      return true; // If no vital field, consider all as vital
    }).length;
  }

  // Count vital side ingredients
  if (recipe.sideIngredients) {
    vitalCount += recipe.sideIngredients.filter(ingredient => ingredient.vital).length;
  }

  return vitalCount;
}

// Helper function to format time in minutes to readable format
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} val`;
  }
  
  return `${hours} val ${remainingMinutes} min`;
}

// Helper function to get ingredient name in appropriate language
export function getIngredientName(ingredient: any): string {
  if (typeof ingredient === 'string') {
    return ingredient;
  }
  
  if (typeof ingredient === 'object') {
    if (typeof ingredient.name === 'string') {
      return ingredient.name;
    }
    return ingredient.name?.lt || ingredient.name?.en || '';
  }
  
  return '';
}

// Helper function to get ingredient quantity
export function getIngredientQuantity(ingredient: any): string {
  if (typeof ingredient === 'object') {
    if ('quantity' in ingredient) {
      return ingredient.quantity || '';
    }
    if ('amount' in ingredient && 'unit' in ingredient) {
      return `${ingredient.amount} ${ingredient.unit}`;
    }
  }
  return '';
}

// Helper function to check if ingredient is vital
export function isIngredientVital(ingredient: any): boolean {
  if (typeof ingredient === 'object' && 'vital' in ingredient) {
    return ingredient.vital;
  }
  return true; // Default to vital if not specified
}
