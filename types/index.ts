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

// Recipe Types - SEO Optimized
export interface Recipe {
  _id?: ObjectId | string;
  slug: string;
  canonicalUrl?: string;
  language?: string;

  title: {
    lt: string;
    en?: string;
  };

  description: {
    lt: string;
    en?: string;
  };

  // SEO Metadata
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    focusKeyword: string;
  };

  author: {
    userId?: ObjectId | string;
    name: string;
    profileUrl: string;
  };

  status: 'published' | 'draft' | 'archived';
  language: string;
  translations?: string[];

  servings: number;
  servingsUnit: string;
  difficulty?: 'lengvas' | 'vidutinis' | 'sunkus';

  ingredients: {
    main: NewIngredient[];
    sides?: {
      category: string; // e.g., "Padažui", "Garnyrui", "Užpilui"
      items: NewIngredient[];
    };
  };
  instructions: NewInstruction[];
  notes?: Array<{
    text: {
      lt: string;
      en?: string;
    };
    priority: number;
  }>;

  // Enhanced Image Schema
  image: RecipeImage;

  // Engagement Metrics
  rating?: {
    average: number;
    count: number;
  };

  engagement?: {
    views: number;
    saves: number;
    shares: number;
    commentsCount: number;
    avgTimeOnPage: number;
    bounceRate: number;
  };

  // Enhanced Tags
  tags: string[];

  // Schema.org Structured Data
  schemaOrg?: RecipeSchemaOrg;

  // Enhanced Categorization
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;

  // Publishing & SEO
  featured?: boolean;
  trending?: boolean;
  seasonal?: string[];

  // Technical SEO
  sitemap?: {
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    lastmod: Date | string;
  };

  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;

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

  // Category system
  primaryCategoryPath: string; // e.g., "receptai/mesa/vistiena"
  secondaryCategories?: string[]; // e.g., ["receptai/salotos/vistiena", "receptai/greitai"]
  categoryIds?: ObjectId[]; // For efficient querying

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

  // Legacy breadcrumb fields
  categoryPath?: string;
  breadcrumbs?: Array<{
    title: string;
    slug: string;
    url: string;
  }>;
}

export interface NewIngredient {
  name: {
    lt: string;
    en?: string;
  };
  quantity: string;
  vital: boolean;
}

export interface NewInstruction {
  step: number;
  text: {
    lt: string;
    en?: string;
  };
  timeMinutes?: number; // Time for this specific step
  image?: string; // Optional step image URL
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

// Schema.org Recipe Structured Data
export interface RecipeSchemaOrg {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string[];
  author: {
    '@type': string;
    name: string;
    url: string;
  };
  publisher: {
    '@type': string;
    name: string;
    url: string;
    logo: {
      '@type': string;
      url: string;
      width: number;
      height: number;
    };
  };
  datePublished: string;
  dateModified: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeYield: string;
  recipeCategory: string;
  recipeCuisine: string;
  keywords: string;
  recipeIngredient: string[];
  recipeInstructions: Array<{
    '@type': string;
    name: string;
    text: string;
    url: string;
  }>;
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
    bestRating: string;
    worstRating: string;
  };
}

// Utility Types
export type Locale = 'lt' | 'en';

export interface LocalizedContent {
  lt: string;
  en?: string;
}
