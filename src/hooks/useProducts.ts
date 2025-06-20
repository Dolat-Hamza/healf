import { useState, useEffect, useMemo } from 'react';
import { Product, SearchFilters, SortOption, SearchResult } from '@/types/product';
import { searchProducts } from '@/lib/search';
import { useDebounce } from './useDebounce';

interface UseProductsProps {
  products: Product[];
  pageSize?: number;
}

export function useProducts({ products, pageSize = 12 }: UseProductsProps) {
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'title', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedQuery = useDebounce(filters.query, 300);
  
  const debouncedFilters = useMemo(() => ({
    ...filters,
    query: debouncedQuery
  }), [filters, debouncedQuery]);

  const filteredProducts = useMemo(() => {
    return searchProducts(products, debouncedFilters, sortOption);
  }, [products, debouncedFilters, sortOption]);

  const paginatedResult = useMemo((): SearchResult => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page: currentPage,
      pageSize
    };
  }, [filteredProducts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, sortOption]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ query: '' });
    setSortOption({ field: 'title', direction: 'asc' });
  };

  return {
    result: paginatedResult,
    filters,
    sortOption,
    updateFilters,
    setSortOption,
    setCurrentPage,
    clearFilters,
    totalPages: Math.ceil(filteredProducts.length / pageSize)
  };
}
