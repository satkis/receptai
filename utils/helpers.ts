import { Ingredient } from '@/types';

// Format time duration
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} val`;
  }
  
  return `${hours} val ${remainingMinutes} min`;
};

// Format date for Lithuanian locale
export const formatDate = (date: Date | string, locale: 'lt' | 'en' = 'lt'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en-US', options);
};

// Calculate adjusted ingredient amounts based on servings
export const adjustIngredientAmount = (
  ingredient: Ingredient,
  newServings: number,
  originalServings: number
): Ingredient => {
  const ratio = newServings / originalServings;
  const adjustedAmount = ingredient.amount * ratio;
  
  // Round to reasonable precision
  const roundedAmount = Math.round(adjustedAmount * 100) / 100;
  
  return {
    ...ingredient,
    amount: roundedAmount,
  };
};

// Format ingredient for display
export const formatIngredient = (ingredient: Ingredient): string => {
  const amount = ingredient.amount % 1 === 0 
    ? ingredient.amount.toString() 
    : ingredient.amount.toFixed(2).replace(/\.?0+$/, '');
  
  return `${amount} ${ingredient.unit} ${ingredient.name}`;
};

// Generate recipe excerpt
export const generateExcerpt = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random string for tokens
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Calculate reading time
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Format number with Lithuanian locale
export const formatNumber = (num: number, locale: 'lt' | 'en' = 'lt'): string => {
  return num.toLocaleString(locale === 'lt' ? 'lt-LT' : 'en-US');
};

// Get difficulty color
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Get difficulty text in Lithuanian
export const getDifficultyText = (difficulty: string, locale: 'lt' | 'en' = 'lt'): string => {
  const translations = {
    lt: {
      easy: 'Lengvas',
      medium: 'Vidutinis',
      hard: 'Sunkus',
    },
    en: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
  };
  
  return translations[locale][difficulty as keyof typeof translations.lt] || difficulty;
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Validate image file
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

// Generate color from string (for avatars)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Truncate text with word boundary
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};
