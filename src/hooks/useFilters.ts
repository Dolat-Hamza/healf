import { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { FilterState, getFilterOptions, applyFilters, clearFilters, getActiveFilterCount } from '@/lib/filters';
import { SortOptionConfig, sortProducts, getDefaultSortOption } from '@/lib/sorting';

export interface UseFiltersResult {
  filterState: FilterState;
  setFilterState: (filters: FilterState) => void;
  sortOption: SortOptionConfig;
  setSortOption: (sort: SortOptionConfig) => void;
  filteredProducts: Product[];
  filterOptions: ReturnType<typeof getFilterOptions>;
  activeFilterCount: number;
  clearAllFilters: () => void;
  updateFilter: (key: keyof FilterState, value: unknown) => void;
}

export function useFilters(products: Product[]): UseFiltersResult {
  const [filterState, setFilterState] = useState<FilterState>(() => clearFilters());
  const [sortOption, setSortOption] = useState<SortOptionConfig>(() => getDefaultSortOption());

  const filterOptions = useMemo(() => getFilterOptions(products), [products]);

  const filteredProducts = useMemo(() => {
    const filtered = applyFilters(products, filterState);
    return sortProducts(filtered, sortOption);
  }, [products, filterState, sortOption]);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filterState), [filterState]);

  const clearAllFilters = () => {
    setFilterState(clearFilters());
  };

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    filterState,
    setFilterState,
    sortOption,
    setSortOption,
    filteredProducts,
    filterOptions,
    activeFilterCount,
    clearAllFilters,
    updateFilter
  };
}
