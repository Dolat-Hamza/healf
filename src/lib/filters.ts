import { Product, SearchFilters } from '@/types/product';
import { getUniqueVendors, getUniqueProductTypes, getUniqueStatuses, getPriceRange } from './search';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceRangeFilter {
  min: number;
  max: number;
  step: number;
}

export interface FilterState {
  vendors: string[];
  productTypes: string[];
  statuses: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isGiftCard?: boolean;
  hasOutOfStockVariants?: boolean;
  tags: string[];
}

export function getFilterOptions(products: Product[]): {
  vendors: FilterOption[];
  productTypes: FilterOption[];
  statuses: FilterOption[];
  priceRange: PriceRangeFilter;
  tags: FilterOption[];
} {
  const vendors = getUniqueVendors(products);
  const productTypes = getUniqueProductTypes(products);
  const statuses = getUniqueStatuses(products);
  const priceRangeData = getPriceRange(products);
  
  const allTags = products.flatMap(p => p.tags);
  const tagCounts: Record<string, number> = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    vendors: vendors.map(vendor => ({
      value: vendor,
      label: vendor,
      count: products.filter(p => p.vendor === vendor).length
    })),
    productTypes: productTypes.map(type => ({
      value: type,
      label: type,
      count: products.filter(p => p.productType === type).length
    })),
    statuses: statuses.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: products.filter(p => p.status === status).length
    })),
    priceRange: {
      min: Math.floor(priceRangeData.min),
      max: Math.ceil(priceRangeData.max),
      step: Math.max(1, Math.floor((priceRangeData.max - priceRangeData.min) / 100))
    },
    tags: Object.entries(tagCounts)
      .map(([tag, count]): FilterOption => ({
        value: tag,
        label: tag,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  };
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    if (filters.vendors.length > 0 && !filters.vendors.includes(product.vendor)) {
      return false;
    }

    if (filters.productTypes.length > 0 && !filters.productTypes.includes(product.productType)) {
      return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(product.status)) {
      return false;
    }

    const avgPrice = (product.priceRange.min + product.priceRange.max) / 2;
    if (avgPrice < filters.priceRange.min || avgPrice > filters.priceRange.max) {
      return false;
    }

    if (filters.isGiftCard !== undefined && product.isGiftCard !== filters.isGiftCard) {
      return false;
    }

    if (filters.hasOutOfStockVariants !== undefined && product.hasOutOfStockVariants !== filters.hasOutOfStockVariants) {
      return false;
    }

    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => product.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  });
}

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  
  if (filters.vendors.length > 0) count++;
  if (filters.productTypes.length > 0) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.isGiftCard !== undefined) count++;
  if (filters.hasOutOfStockVariants !== undefined) count++;
  if (filters.tags.length > 0) count++;
  
  return count;
}

export function clearFilters(): FilterState {
  return {
    vendors: [],
    productTypes: [],
    statuses: [],
    priceRange: { min: 0, max: Infinity },
    tags: []
  };
}

export function createSearchFiltersFromState(query: string, filterState: FilterState): SearchFilters {
  return {
    query,
    vendor: filterState.vendors.length === 1 ? filterState.vendors[0] : undefined,
    productType: filterState.productTypes.length === 1 ? filterState.productTypes[0] : undefined,
    status: filterState.statuses.length === 1 ? filterState.statuses[0] : undefined,
    minPrice: filterState.priceRange.min > 0 ? filterState.priceRange.min : undefined,
    maxPrice: filterState.priceRange.max < Infinity ? filterState.priceRange.max : undefined,
    isGiftCard: filterState.isGiftCard,
    hasOutOfStockVariants: filterState.hasOutOfStockVariants
  };
}
