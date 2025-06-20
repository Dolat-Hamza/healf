import React from 'react';
import { Drawer } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FilterState, FilterOption } from '@/lib/filters';
import { SortOptionConfig } from '@/lib/sorting';

interface FilterSidebarProps {
  filterState: FilterState;
  onFilterChange: (key: keyof FilterState, value: unknown) => void;
  filterOptions: {
    vendors: FilterOption[];
    productTypes: FilterOption[];
    statuses: FilterOption[];
    priceRange: { min: number; max: number; step: number };
    tags: FilterOption[];
  };
  sortOption?: SortOptionConfig;
  onSortChange: (sort: SortOptionConfig) => void;
  sortOptions: SortOptionConfig[];
  activeFilterCount: number;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterSidebar({
  filterState,
  onFilterChange,
  filterOptions,
  sortOption,
  onSortChange,
  sortOptions,
  activeFilterCount,
  onClearFilters,
  isOpen,
  onToggle
}: FilterSidebarProps) {
  return (
    <Drawer
      title="Filters & Sort"
      placement="right"
      onClose={onToggle}
      open={isOpen}
      width={400}
      extra={
        activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear ({activeFilterCount})
          </button>
        )
      }
    >
      <div className="space-y-6">

        {/* Sort Options */}
        <div className="mb-8">
          <label className="block text-sm font-poppins font-medium text-gray-700 mb-3">
            Sort By
          </label>
          <select
            value={sortOption ? `${sortOption.field}-${sortOption.direction}` : ''}
            onChange={(e) => {
              const option = sortOptions.find(opt => 
                `${opt.field}-${opt.direction}` === e.target.value
              );
              if (option) onSortChange(option);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out font-inter"
          >
            {sortOptions.map((option) => (
              <option 
                key={`${option.field}-${option.direction}`} 
                value={`${option.field}-${option.direction}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

          {/* Price Range */}
          <div className="mb-8">
            <label className="block text-sm font-poppins font-medium text-gray-700 mb-3">
              Price Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-inter text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  min={filterOptions.priceRange?.min || 0}
                  max={filterOptions.priceRange?.max || 1000}
                  step={filterOptions.priceRange?.step || 1}
                  value={filterState.priceRange?.min || 0}
                  onChange={(e) => onFilterChange('priceRange', {
                    ...filterState.priceRange,
                    min: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out font-inter"
                />
              </div>
              <div>
                <label className="block text-xs font-inter text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  min={filterOptions.priceRange?.min || 0}
                  max={filterOptions.priceRange?.max || 1000}
                  step={filterOptions.priceRange?.step || 1}
                  value={filterState.priceRange?.max || 1000}
                  onChange={(e) => onFilterChange('priceRange', {
                    ...filterState.priceRange,
                    max: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out font-inter"
                />
              </div>
            </div>
          </div>

          {/* Vendors */}
          <FilterSection
            title="Vendors"
            options={filterOptions.vendors}
            selectedValues={filterState.vendors}
            onChange={(values) => onFilterChange('vendors', values)}
          />

          {/* Product Types */}
          <FilterSection
            title="Product Types"
            options={filterOptions.productTypes}
            selectedValues={filterState.productTypes}
            onChange={(values) => onFilterChange('productTypes', values)}
          />

          {/* Status */}
          <FilterSection
            title="Status"
            options={filterOptions.statuses}
            selectedValues={filterState.statuses}
            onChange={(values) => onFilterChange('statuses', values)}
          />

          {/* Tags */}
          <FilterSection
            title="Tags"
            options={filterOptions.tags.slice(0, 10)}
            selectedValues={filterState.tags}
            onChange={(values) => onFilterChange('tags', values)}
          />

          {/* Boolean Filters */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="gift-card"
                type="checkbox"
                checked={filterState.isGiftCard === true}
                onChange={(e) => onFilterChange('isGiftCard', e.target.checked ? true : undefined)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="gift-card" className="ml-2 text-sm font-inter text-gray-700 hover: transition-colors duration-200 cursor-pointer">
                Gift Cards Only
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="in-stock"
                type="checkbox"
                checked={filterState.hasOutOfStockVariants === false}
                onChange={(e) => onFilterChange('hasOutOfStockVariants', e.target.checked ? false : undefined)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="in-stock" className="ml-2 text-sm font-inter text-gray-700 hover: transition-colors duration-200 cursor-pointer">
                In Stock Only
              </label>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function FilterSection({ title, options, selectedValues, onChange }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-sm font-poppins font-medium text-gray-700 mb-3 hover: transition-colors duration-200"
      >
        {title}
        <ChevronDownIcon 
          className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isExpanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${title}-${option.value}`}
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`${title}-${option.value}`} 
                className="ml-2 text-sm font-inter text-gray-700 flex-1 cursor-pointer hover: transition-colors duration-200"
              >
                {option.label}
                <span className="text-gray-400 ml-1">({option.count})</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
