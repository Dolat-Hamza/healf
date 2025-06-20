import { useState, useMemo, useCallback } from 'react';
import { Product, SearchFilters, SortOption } from '@/types/product';
import { searchProducts } from '@/lib/search';
import { useDebounce } from './useDebounce';

export interface UseSearchResult {
  filteredProducts: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  sortOption: SortOption | undefined;
  setSortOption: (sort: SortOption | undefined) => void;
  totalResults: number;
  isSearching: boolean;
}

export function useSearch(products: Product[], debounceMs: number = 300): UseSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [sortOption, setSortOption] = useState<SortOption | undefined>();

  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  const isSearching = searchQuery !== debouncedQuery;

  const filteredProducts = useMemo(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      query: debouncedQuery
    };

    return searchProducts(products, searchFilters, sortOption);
  }, [products, debouncedQuery, filters, sortOption]);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSetSortOption = useCallback((sort: SortOption | undefined) => {
    setSortOption(sort);
  }, []);

  return {
    filteredProducts,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    filters,
    setFilters: handleSetFilters,
    sortOption,
    setSortOption: handleSetSortOption,
    totalResults: filteredProducts.length,
    isSearching
  };
}
