// Time category utilities for recipe filtering

export interface TimeCategory {
  value: string;
  label: string;
  maxMinutes?: number;
  minMinutes?: number;
}

export const timeCategories: TimeCategory[] = [
  { value: "iki-30-min", label: "iki 30 min.", maxMinutes: 30 },
  { value: "30-60-min", label: "30–60 min.", minMinutes: 31, maxMinutes: 60 },
  { value: "1-2-val", label: "1–2 val.", minMinutes: 61, maxMinutes: 120 },
  { value: "virs-2-val", label: "virš 2 val.", minMinutes: 121 }
];

/**
 * Calculate time category based on total cooking time
 */
export function calculateTimeCategory(totalTimeMinutes: number): string {
  if (totalTimeMinutes <= 30) return "iki-30-min";
  if (totalTimeMinutes <= 60) return "30-60-min";
  if (totalTimeMinutes <= 120) return "1-2-val";
  return "virs-2-val";
}

/**
 * Get time category label by value
 */
export function getTimeCategoryLabel(value: string): string {
  const category = timeCategories.find(cat => cat.value === value);
  return category?.label || value;
}

/**
 * Get all time categories with zero counts (for initialization)
 */
export function getEmptyTimeFilters(): Array<{ value: string; label: string; count: number }> {
  return timeCategories.map(cat => ({
    value: cat.value,
    label: cat.label,
    count: 0
  }));
}

/**
 * Convert Lithuanian characters to URL-safe slugs
 */
export function lithuanianToSlug(text: string): string {
  const lithuanianMap: Record<string, string> = {
    'ą': 'a', 'Ą': 'A',
    'č': 'c', 'Č': 'C',
    'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E',
    'į': 'i', 'Į': 'I',
    'š': 's', 'Š': 'S',
    'ų': 'u', 'Ų': 'U',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z'
  };

  return text
    .split('')
    .map(char => lithuanianMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build MongoDB query for time filtering
 */
export function buildTimeQuery(timeFilter: string | null): Record<string, any> {
  if (!timeFilter) return {};
  
  return { timeCategory: timeFilter };
}

/**
 * Get time filter counts for a given base query
 */
export async function getTimeFilterCounts(
  db: any, 
  baseQuery: Record<string, any>
): Promise<Array<{ value: string; label: string; count: number }>> {
  const counts = await Promise.all(
    timeCategories.map(async (category) => {
      const count = await db.collection('recipes_new').countDocuments({
        ...baseQuery,
        timeCategory: category.value
      });
      return {
        value: category.value,
        label: category.label,
        count
      };
    })
  );
  
  // Only return filters that have recipes
  return counts.filter(filter => filter.count > 0);
}
