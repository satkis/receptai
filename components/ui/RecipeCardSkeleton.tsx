// Recipe Card Skeleton for Loading States
// Provides visual feedback while search results are loading

interface RecipeCardSkeletonProps {
  count?: number;
}

export default function RecipeCardSkeleton({ count = 12 }: RecipeCardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse flex flex-col h-full"
        >
          {/* Image Skeleton */}
          <div className="relative w-full h-40 flex-shrink-0 bg-gray-200">
            {/* Time/Servings Overlay Skeleton */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <div className="bg-gray-300 rounded-md w-16 h-6"></div>
              <div className="bg-gray-300 rounded-md w-20 h-5"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-3 flex-1 flex flex-col">
            {/* Title Skeleton */}
            <div className="mb-2">
              <div className="bg-gray-200 rounded h-4 w-full mb-1"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4"></div>
            </div>

            {/* Ingredients Skeleton */}
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1">
                <div className="bg-gray-200 rounded-full h-6 w-16"></div>
                <div className="bg-gray-200 rounded-full h-6 w-20"></div>
                <div className="bg-gray-200 rounded-full h-6 w-14"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Single Recipe Card Skeleton (for individual use)
export function SingleRecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="relative w-full h-40 flex-shrink-0 bg-gray-200">
        {/* Time/Servings Overlay Skeleton */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <div className="bg-gray-300 rounded-md w-16 h-6"></div>
          <div className="bg-gray-300 rounded-md w-20 h-5"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="mb-2">
          <div className="bg-gray-200 rounded h-4 w-full mb-1"></div>
          <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        </div>

        {/* Ingredients Skeleton */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1">
            <div className="bg-gray-200 rounded-full h-6 w-16"></div>
            <div className="bg-gray-200 rounded-full h-6 w-20"></div>
            <div className="bg-gray-200 rounded-full h-6 w-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Loading State with Message
export function SearchLoadingSkeleton({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <span className="text-lg">
            Ieškoma "{searchTerm}" receptų...
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Tikrinama visų receptų duomenų bazė
        </p>
      </div>

      {/* Recipe Grid Skeleton */}
      <RecipeCardSkeleton count={8} />
    </div>
  );
}
