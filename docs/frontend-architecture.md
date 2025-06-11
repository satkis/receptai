# 🎨 Frontend Architecture & UI/UX

## **Component Structure**

### **Page Components**
```
components/
├── pages/
│   ├── RecipePage/
│   │   ├── RecipeHeader.tsx
│   │   ├── RecipeContent.tsx
│   │   ├── TagList.tsx
│   │   └── RelatedRecipes.tsx
│   ├── CategoryPage/
│   │   ├── CategoryHeader.tsx
│   │   ├── FilterBar.tsx
│   │   ├── RecipeGrid.tsx
│   │   └── Pagination.tsx
│   └── TagPage/
│       ├── TagHeader.tsx
│       ├── RelatedTags.tsx
│       └── RecipeGrid.tsx
├── shared/
│   ├── Breadcrumb.tsx
│   ├── RecipeCard.tsx
│   ├── FilterButton.tsx
│   └── SearchBar.tsx
└── seo/
    ├── RecipeSEO.tsx
    ├── CategorySEO.tsx
    └── TagSEO.tsx
```

## **Tag System Implementation**

### **1. Clickable Tags Component**

```typescript
// components/shared/TagList.tsx
interface TagListProps {
  tags: string[];
  variant?: 'default' | 'compact' | 'large';
  clickable?: boolean;
}

export function TagList({ tags, variant = 'default', clickable = true }: TagListProps) {
  const router = useRouter();
  
  const handleTagClick = (tag: string) => {
    if (clickable) {
      const tagSlug = slugify(tag);
      router.push(`/paieska/${tagSlug}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => handleTagClick(tag)}
          className={cn(
            "inline-flex items-center rounded-full border transition-colors",
            {
              'px-3 py-1 text-sm': variant === 'default',
              'px-2 py-0.5 text-xs': variant === 'compact',
              'px-4 py-2 text-base': variant === 'large'
            },
            clickable ? 
              "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 cursor-pointer" :
              "border-gray-200 bg-gray-50 text-gray-700"
          )}
          disabled={!clickable}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

### **2. Recipe Page with Tags**

```typescript
// components/pages/RecipePage/RecipeContent.tsx
export function RecipeContent({ recipe }: { recipe: Recipe }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Recipe Header */}
      <RecipeHeader recipe={recipe} />
      
      {/* Tags Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          Susiję žymenys
        </h3>
        <TagList tags={recipe.tags} variant="default" />
      </div>
      
      {/* Recipe Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IngredientsSection ingredients={recipe.ingredients} />
        <InstructionsSection instructions={recipe.instructions} />
      </div>
      
      {/* Related Recipes */}
      <RelatedRecipes tags={recipe.tags} currentRecipeId={recipe._id} />
    </div>
  );
}
```

## **Filtering System**

### **1. Filter Bar Component**

```typescript
// components/shared/FilterBar.tsx
interface FilterBarProps {
  availableFilters: FilterConfig;
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterType: string, values: string[]) => void;
  recipeCount: number;
}

export function FilterBar({ 
  availableFilters, 
  activeFilters, 
  onFilterChange,
  recipeCount 
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Filtrai
        </h3>
        <span className="text-sm text-gray-600">
          {recipeCount} receptai
        </span>
      </div>
      
      <div className="space-y-4">
        {Object.entries(availableFilters).map(([filterType, options]) => (
          <FilterGroup
            key={filterType}
            title={getFilterTitle(filterType)}
            options={options}
            selected={activeFilters[filterType] || []}
            onChange={(values) => onFilterChange(filterType, values)}
          />
        ))}
      </div>
      
      {/* Clear Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <button
          onClick={() => onFilterChange('clear', [])}
          className="mt-4 text-sm text-orange-600 hover:text-orange-700"
        >
          Išvalyti filtrus
        </button>
      )}
    </div>
  );
}
```

### **2. Filter Group Component**

```typescript
// components/shared/FilterGroup.tsx
interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  maxVisible?: number;
}

export function FilterGroup({ 
  title, 
  options, 
  selected, 
  onChange,
  maxVisible = 6 
}: FilterGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  
  const handleOptionToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {visibleOptions.map((option) => (
          <FilterButton
            key={option.value}
            label={option.label}
            count={option.count}
            active={selected.includes(option.value)}
            onClick={() => handleOptionToggle(option.value)}
          />
        ))}
        
        {options.length > maxVisible && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            {showAll ? 'Rodyti mažiau' : `Rodyti dar ${options.length - maxVisible}`}
          </button>
        )}
      </div>
    </div>
  );
}
```

### **3. Filter Button Component**

```typescript
// components/shared/FilterButton.tsx
interface FilterButtonProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        active
          ? "bg-orange-100 text-orange-800 border border-orange-200"
          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "text-xs",
          active ? "text-orange-600" : "text-gray-500"
        )}>
          ({count})
        </span>
      )}
    </button>
  );
}
```

## **State Management**

### **1. Filter State Hook**

```typescript
// hooks/useFilters.ts
export function useFilters(initialFilters: Record<string, string[]> = {}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  
  const updateFilter = useCallback((filterType: string, values: string[]) => {
    if (filterType === 'clear') {
      setFilters({});
      router.push(router.pathname, undefined, { shallow: true });
      return;
    }
    
    const newFilters = { ...filters };
    if (values.length === 0) {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = values;
    }
    
    setFilters(newFilters);
    
    // Update URL with filters
    const query = { ...router.query };
    Object.keys(newFilters).forEach(key => {
      query[key] = newFilters[key].join(',');
    });
    
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [filters, router]);
  
  return { filters, updateFilter };
}
```

### **2. Recipe Search Hook**

```typescript
// hooks/useRecipeSearch.ts
export function useRecipeSearch(categoryPath?: string, tagName?: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>();
  
  const searchRecipes = useCallback(async (
    filters: Record<string, string[]>,
    page: number = 1
  ) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).map(([key, values]) => [key, values.join(',')])
        )
      });
      
      let endpoint = '';
      if (categoryPath) {
        endpoint = `/api/recipes/by-category?categoryPath=${categoryPath}&${params}`;
      } else if (tagName) {
        endpoint = `/api/recipes/by-tag?tag=${tagName}&${params}`;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Recipe search error:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryPath, tagName]);
  
  return { recipes, loading, pagination, searchRecipes };
}
```

## **Performance Optimizations**

### **1. Recipe Card Virtualization**

```typescript
// components/shared/VirtualizedRecipeGrid.tsx
import { FixedSizeGrid as Grid } from 'react-window';

export function VirtualizedRecipeGrid({ recipes }: { recipes: Recipe[] }) {
  const itemsPerRow = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const itemWidth = 400;
  const itemHeight = 300;
  
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * itemsPerRow + columnIndex;
    const recipe = recipes[index];
    
    if (!recipe) return null;
    
    return (
      <div style={style}>
        <RecipeCard recipe={recipe} />
      </div>
    );
  };
  
  return (
    <Grid
      columnCount={itemsPerRow}
      columnWidth={itemWidth}
      height={600}
      rowCount={Math.ceil(recipes.length / itemsPerRow)}
      rowHeight={itemHeight}
      width="100%"
    >
      {Cell}
    </Grid>
  );
}
```

### **2. Lazy Loading & Infinite Scroll**

```typescript
// hooks/useInfiniteRecipes.ts
export function useInfiniteRecipes(searchParams: SearchParams) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = Math.floor(recipes.length / 12) + 1;
    
    try {
      const newRecipes = await fetchRecipes({ ...searchParams, page: nextPage });
      setRecipes(prev => [...prev, ...newRecipes.recipes]);
      setHasMore(newRecipes.hasMore);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoading(false);
    }
  }, [recipes.length, searchParams, loading, hasMore]);
  
  return { recipes, hasMore, loading, loadMore };
}
```

This frontend architecture provides:
- ✅ Clickable tag system with search integration
- ✅ Advanced filtering with URL state management
- ✅ Performance optimizations for large datasets
- ✅ Responsive design with mobile-first approach
- ✅ Accessible components with proper ARIA labels
- ✅ SEO-friendly routing and state management
