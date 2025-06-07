import { ObjectId } from 'mongodb';

// User Types
export interface User {
  _id?: ObjectId | string;
  email: string;
  name: string;
  image?: string;
  provider?: 'google' | 'facebook' | 'email';
  providerId?: string;
  savedRecipes: string[];
  shoppingList: ShoppingListItem[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: 'lt' | 'en';
  dietaryRestrictions: string[];
  allergies: string[];
  defaultServings: number;
}

export interface ShoppingListItem {
  ingredient: string;
  amount: string;
  unit: string;
  recipeId: string;
  recipeName: string;
  checked: boolean;
  addedAt: Date;
}

// Recipe Types
export interface Recipe {
  _id?: ObjectId | string;
  slug: string;

  title: {
    lt: string;
    en: string;
  };

  description: {
    lt: string;
    en: string;
  };

  author: {
    userId?: ObjectId | string;
    name: string;
    profileUrl: string;
  };

  status: 'public' | 'draft';
  language: string;
  translations: string[];

  servings: number;
  servingsUnit: string;

  ingredients: NewIngredient[];
  instructions: NewInstruction[];

  tips?: {
    lt: string[];
    en: string[];
  };

  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };

  swapSuggestions?: Array<{
    original: string;
    alternatives: string[];
  }>;

  categories: {
    cuisine: string;
    mealType: string;
    effort: 'Easy' | 'Medium' | 'Hard';
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    totalTimeMinutes: number;
    dietary: string[];
    seasonal: string[];
    occasion: string[];
    nutritionFocus: string[];
    tags: string[];
  };

  rating: {
    average: number;
    count: number;
  };

  commentsCount: number;
  createdAt: string;
  updatedAt: string;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  schemaOrg?: any;

  // Legacy fields for backward compatibility
  image?: string;
  images?: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  averageRating?: number;
  totalRatings?: number;
  views?: number;
  saves?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  ratings?: Rating[];
  comments?: Comment[];
  seoTitle?: string;
  seoDescription?: string;
  structuredData?: any;
}

export interface NewIngredient {
  name: {
    lt: string;
    en: string;
  };
  quantity: string;
  vital: boolean;
}

export interface NewInstruction {
  stepNumber: number;
  text: {
    lt: string;
    en: string;
  };
  image?: {
    url: string;
    alt: {
      lt: string;
      en: string;
    };
  };
}

// Legacy interfaces for backward compatibility
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  alternatives?: string[];
}

export interface Instruction {
  step: number;
  text: string;
  image?: string;
  timer?: number; // seconds
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface Rating {
  userId: string;
  rating: number; // 1-5
  createdAt: Date;
}

export interface Comment {
  _id?: ObjectId | string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  rating?: number;
  cookedIt: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentReply[];
}

export interface CommentReply {
  _id?: ObjectId | string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: Date;
}

// Search and Filter Types
export interface SearchFilters {
  category?: string;
  difficulty?: string;
  maxTime?: number;
  tags?: string[];
  ingredients?: string[];
  dietaryRestrictions?: string[];
}

export interface SearchResult {
  recipes: Recipe[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface RecipeFormData {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  image?: File;
}

// Component Props Types
export interface RecipeCardProps {
  recipe: Recipe;
  showSaveButton?: boolean;
  showAuthor?: boolean;
  className?: string;
}

export interface IngredientListProps {
  ingredients: Ingredient[];
  servings: number;
  originalServings: number;
  onIngredientClick?: (ingredient: Ingredient) => void;
  checkedIngredients?: Set<string>;
}

export interface InstructionListProps {
  instructions: Instruction[];
  currentStep?: number;
  onStepComplete?: (step: number) => void;
}

// Utility Types
export type Locale = 'lt' | 'en';

export interface LocalizedContent {
  lt: string;
  en: string;
}
