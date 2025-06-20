import { Product, SearchFilters, SortOption } from '@/types/product';
import { fuzzySearch } from './fuzzy-search';

export interface SearchOptions {
  useFuzzySearch?: boolean;
  fuzzyThreshold?: number;
}

export function searchProducts(
  products: Product[],
  filters: SearchFilters,
  sortOption?: SortOption,
  options: SearchOptions = {}
): Product[] {
  let filteredProducts = products;

  if (filters.query) {
    const query = filters.query.trim();
    
    if (options.useFuzzySearch) {
      const fuzzyResults = fuzzySearch(products, query, {
        threshold: options.fuzzyThreshold || 0.3,
        keys: ['title', 'description', 'vendor', 'productType', 'handle']
      });
      filteredProducts = fuzzyResults.map(result => result.item);
    } else {
      const queryLower = query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(queryLower) ||
        product.description.toLowerCase().includes(queryLower) ||
        product.descriptionHtml.toLowerCase().includes(queryLower) ||
        product.vendor.toLowerCase().includes(queryLower) ||
        product.productType.toLowerCase().includes(queryLower) ||
        product.handle.toLowerCase().includes(queryLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }
  }

  if (filters.vendor) {
    filteredProducts = filteredProducts.filter(product =>
      product.vendor.toLowerCase() === filters.vendor?.toLowerCase()
    );
  }

  if (filters.productType) {
    filteredProducts = filteredProducts.filter(product =>
      product.productType.toLowerCase() === filters.productType?.toLowerCase()
    );
  }

  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.priceRange.min >= filters.minPrice!
    );
  }

  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.priceRange.max <= filters.maxPrice!
    );
  }

  if (filters.status) {
    filteredProducts = filteredProducts.filter(product =>
      product.status.toLowerCase() === filters.status?.toLowerCase()
    );
  }

  if (filters.isGiftCard !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.isGiftCard === filters.isGiftCard
    );
  }

  if (filters.hasOutOfStockVariants !== undefined) {
    filteredProducts = filteredProducts.filter(product =>
      product.hasOutOfStockVariants === filters.hasOutOfStockVariants
    );
  }

  if (sortOption) {
    filteredProducts.sort((a, b) => {
      let aValue = a[sortOption.field];
      let bValue = b[sortOption.field];
      
      if (sortOption.field === 'priceRange') {
        aValue = (a.priceRange.min + a.priceRange.max) / 2;
        bValue = (b.priceRange.min + b.priceRange.max) / 2;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOption.direction === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortOption.direction === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });
  }

  return filteredProducts;
}

export function getUniqueVendors(products: Product[]): string[] {
  return Array.from(new Set(products.map(p => p.vendor).filter(Boolean))).sort();
}

export function getUniqueProductTypes(products: Product[]): string[] {
  return Array.from(new Set(products.map(p => p.productType).filter(Boolean))).sort();
}

export function getUniqueStatuses(products: Product[]): string[] {
  return Array.from(new Set(products.map(p => p.status).filter(Boolean))).sort();
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  const allPrices = products.flatMap(p => [p.priceRange.min, p.priceRange.max]).filter(price => price > 0);
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices)
  };
}

export function getAllTags(products: Product[]): string[] {
  const allTags = products.flatMap(p => p.tags);
  return Array.from(new Set(allTags)).sort();
}
