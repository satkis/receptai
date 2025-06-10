// Filter Pills Component for Category Pages
// Pill-shaped filter buttons with counts and icons

import { useState, useEffect } from 'react';

interface FilterOption {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  count: number;
  active: boolean;
}

interface FilterGroup {
  label: { lt: string; en: string };
  order: number;
  options: FilterOption[];
}

interface FilterPillsProps {
  availableFilters: { [key: string]: FilterGroup };
  activeFilters: { [key: string]: string[] };
  onFilterChange: (filterType: string, value: string, isActive: boolean) => void;
  onClearFilters: () => void;
}

export default function FilterPills({
  availableFilters,
  activeFilters,
  onFilterChange,
  onClearFilters
}: FilterPillsProps) {
  // Local state for immediate UI updates to prevent visual lag
  const [localActiveFilters, setLocalActiveFilters] = useState(activeFilters);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync local state with props when they change
  useEffect(() => {
    setLocalActiveFilters(activeFilters);
  }, [activeFilters]);
  // Safety check for availableFilters
  if (!availableFilters || typeof availableFilters !== 'object') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <p className="text-gray-500 text-sm">Filtrai kraunami...</p>
      </div>
    );
  }

  // Sort filter groups by order (customizable per page)
  const sortedFilterGroups = Object.entries(availableFilters)
    .sort(([, a], [, b]) => (a?.order || 0) - (b?.order || 0));

  // Check if any filters are active (use local state for immediate UI updates)
  const hasActiveFilters = Object.values(localActiveFilters).some(values => values.length > 0);

  // Check if a filter is currently active (use local state for immediate UI updates)
  const isFilterActive = (filterType: string, value: string) => {
    return localActiveFilters[filterType]?.includes(value) || false;
  };

  // Separate filter groups by type
  const timeFilters = sortedFilterGroups.find(([type]) => type === 'timeRequired')?.[1];
  const ingredientFilters = sortedFilterGroups.find(([type]) => type === 'mainIngredient')?.[1];
  const otherFilters = sortedFilterGroups.filter(([type]) => !['timeRequired', 'mainIngredient'].includes(type));

  // Handle single selection for time and ingredient filters
  const handleSingleSelection = (filterType: string, value: string) => {
    // Prevent rapid clicking
    if (isProcessing) return;
    setIsProcessing(true);

    const currentSelections = localActiveFilters[filterType] || [];

    // If clicking the same filter, deselect it
    if (currentSelections.includes(value)) {
      const newLocalFilters = { ...localActiveFilters };
      delete newLocalFilters[filterType];
      setLocalActiveFilters(newLocalFilters);
      onFilterChange(filterType, value, false);
    } else {
      // For single selection: completely replace with only the new selection
      const newLocalFilters = { ...localActiveFilters };
      newLocalFilters[filterType] = [value];

      // Update local state FIRST for immediate visual feedback
      setLocalActiveFilters(newLocalFilters);

      // Then handle the async operations
      currentSelections.forEach(selectedValue => {
        if (selectedValue !== value) {
          onFilterChange(filterType, selectedValue, false);
        }
      });
      onFilterChange(filterType, value, true);
    }

    // Reset processing state after delay to prevent rapid clicking
    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
      {/* Time Filters Row */}
      {timeFilters && timeFilters.options && timeFilters.options.length > 0 && (
        <div>
          {/* Mobile: Horizontal scroll carousel */}
          <div className="md:hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {timeFilters.options.map(option => (
                <div key={option.key} className="flex-shrink-0">
                  <FilterPill
                    option={option}
                    isActive={isFilterActive('timeRequired', option.key)}
                    onClick={() => handleSingleSelection('timeRequired', option.key)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: Flex wrap */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {timeFilters.options.map(option => (
                <FilterPill
                  key={option.key}
                  option={option}
                  isActive={isFilterActive('timeRequired', option.key)}
                  onClick={() => handleSingleSelection('timeRequired', option.key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Ingredient Filters Row */}
      {ingredientFilters && ingredientFilters.options && ingredientFilters.options.length > 0 && (
        <div>
          {/* Mobile: Horizontal scroll carousel */}
          <div className="md:hidden">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {ingredientFilters.options.map(option => (
                <div key={option.key} className="flex-shrink-0">
                  <FilterPill
                    option={option}
                    isActive={isFilterActive('mainIngredient', option.key)}
                    onClick={() => handleSingleSelection('mainIngredient', option.key)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: Flex wrap */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {ingredientFilters.options.map(option => (
                <FilterPill
                  key={option.key}
                  option={option}
                  isActive={isFilterActive('mainIngredient', option.key)}
                  onClick={() => handleSingleSelection('mainIngredient', option.key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Filters (if any) */}
      {otherFilters.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {otherFilters.map(([filterType, filterGroup]) => {
              if (!filterGroup || !filterGroup.options || !Array.isArray(filterGroup.options)) {
                return null;
              }

              return filterGroup.options.map(option => (
                <FilterPill
                  key={`${filterType}-${option.key}`}
                  option={option}
                  isActive={isFilterActive(filterType, option.key)}
                  onClick={() => onFilterChange(filterType, option.key, !isFilterActive(filterType, option.key))}
                />
              ));
            })}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border bg-gray-100 text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            Išvalyti filtrus ✕
          </button>
        </div>
      )}
    </div>
  );
}

// Individual Filter Pill Component
interface FilterPillProps {
  option: FilterOption;
  isActive: boolean;
  onClick: () => void;
}

function FilterPill({ option, isActive, onClick }: FilterPillProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isClicked) return; // Prevent multiple clicks
    setIsClicked(true);
    onClick();
    // Reset click state after delay
    setTimeout(() => setIsClicked(false), 500);
  };

  const baseClasses = "inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border";

  const activeClasses = isClicked
    ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
    : isActive
    ? "bg-orange-500 text-white border-orange-500 shadow-md cursor-pointer hover:bg-orange-600"
    : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50 cursor-pointer";

  return (
    <button
      onClick={handleClick}
      disabled={isClicked}
      className={`${baseClasses} ${activeClasses}`}
      style={{
        backgroundColor: isActive && option.color && !isClicked ? option.color : undefined,
        borderColor: isActive && option.color && !isClicked ? option.color : undefined
      }}
    >
      {option.icon && <span className="text-base">{option.icon}</span>}
      <span>{option.label}</span>
    </button>
  );
}
