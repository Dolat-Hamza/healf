import React, { useState, useMemo, useCallback } from 'react';

interface UseCSVPerformanceOptions {
  chunkSize?: number;
  maxRows?: number;
  enableVirtualization?: boolean;
}

interface CSVPerformanceResult<T> {
  processedData: T[];
  isLimited: boolean;
  totalRows: number;
  visibleRows: number;
  loadNextChunk: () => void;
  hasMoreChunks: boolean;
  currentChunk: number;
  totalChunks: number;
}

export function useCSVPerformance<T>(
  data: T[],
  options: UseCSVPerformanceOptions = {}
): CSVPerformanceResult<T> {
  const {
    chunkSize = 500,
    maxRows = 1000,
    enableVirtualization = true
  } = options;

  const [currentChunk, setCurrentChunk] = useState(0);

  const { processedData, isLimited, totalChunks } = useMemo(() => {
    const totalRows = data.length;
    const isLimited = totalRows > maxRows;
    const limitedData = isLimited ? data.slice(0, maxRows) : data;
    
    const totalChunks = Math.ceil(limitedData.length / chunkSize);
    
    if (!enableVirtualization) {
      return {
        processedData: limitedData,
        isLimited,
        totalChunks
      };
    }

    const startIndex = currentChunk * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, limitedData.length);
    const processedData = limitedData.slice(0, endIndex);

    return {
      processedData,
      isLimited,
      totalChunks
    };
  }, [data, currentChunk, chunkSize, maxRows, enableVirtualization]);

  const loadNextChunk = useCallback(() => {
    setCurrentChunk(prev => Math.min(prev + 1, totalChunks - 1));
  }, [totalChunks]);

  const hasMoreChunks = currentChunk < totalChunks - 1;

  return {
    processedData,
    isLimited,
    totalRows: data.length,
    visibleRows: processedData.length,
    loadNextChunk,
    hasMoreChunks,
    currentChunk,
    totalChunks
  };
}

export function useCSVSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  searchTerm: string,
  debounceMs: number = 300
): T[] {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useMemo(() => {
    if (!debouncedSearchTerm.trim()) return data;

    const lowercaseSearch = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return String(value || '').toLowerCase().includes(lowercaseSearch);
      })
    );
  }, [data, searchFields, debouncedSearchTerm]);
}
