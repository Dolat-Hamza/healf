import { Product } from '@/types/product';

export interface SortOptionConfig {
  field: keyof Product | 'price' | 'popularity';
  direction: 'asc' | 'desc';
  label: string;
}

export const sortOptions: SortOptionConfig[] = [
  { field: 'title', direction: 'asc', label: 'Name A-Z' },
  { field: 'title', direction: 'desc', label: 'Name Z-A' },
  { field: 'vendor', direction: 'asc', label: 'Vendor A-Z' },
  { field: 'vendor', direction: 'desc', label: 'Vendor Z-A' },
  { field: 'price', direction: 'asc', label: 'Price Low to High' },
  { field: 'price', direction: 'desc', label: 'Price High to Low' },
  { field: 'createdAt', direction: 'desc', label: 'Newest First' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest First' },
  { field: 'totalInventory', direction: 'desc', label: 'Most in Stock' },
  { field: 'totalInventory', direction: 'asc', label: 'Least in Stock' },
  { field: 'totalVariants', direction: 'desc', label: 'Most Variants' },
  { field: 'totalVariants', direction: 'asc', label: 'Least Variants' },
  { field: 'popularity', direction: 'desc', label: 'Most Popular' }
];

export function sortProducts(products: Product[], sortConfig: SortOptionConfig): Product[] {
  return [...products].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortConfig.field) {
      case 'price':
        aValue = (a.priceRange.min + a.priceRange.max) / 2;
        bValue = (b.priceRange.min + b.priceRange.max) / 2;
        break;
      case 'popularity':
        aValue = calculatePopularityScore(a);
        bValue = calculatePopularityScore(b);
        break;
      case 'createdAt':
      case 'updatedAt':
      case 'publishedAt':
        aValue = new Date(a[sortConfig.field] || 0).getTime();
        bValue = new Date(b[sortConfig.field] || 0).getTime();
        break;
      case 'title':
      case 'vendor':
      case 'productType':
      case 'handle':
      case 'status':
        aValue = String(a[sortConfig.field] || '');
        bValue = String(b[sortConfig.field] || '');
        break;
      case 'totalInventory':
      case 'totalVariants':
        aValue = Number(a[sortConfig.field] || 0);
        bValue = Number(b[sortConfig.field] || 0);
        break;
      default:
        aValue = String(a[sortConfig.field as keyof Product] || '');
        bValue = String(b[sortConfig.field as keyof Product] || '');
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }

    return 0;
  });
}

function calculatePopularityScore(product: Product): number {
  let score = 0;
  
  score += product.totalInventory * 0.1;
  
  score += product.totalVariants * 0.2;
  
  if (product.featuredImage) score += 10;
  
  score += product.images.length * 2;
  
  if (product.status === 'active') score += 20;
  
  if (!product.hasOutOfStockVariants) score += 15;
  
  score += product.tags.length * 1;
  
  const avgPrice = (product.priceRange.min + product.priceRange.max) / 2;
  if (avgPrice > 0 && avgPrice < 1000) score += 5;
  
  return score;
}

export function getSortOptionByKey(key: string): SortOptionConfig | undefined {
  return sortOptions.find(option => `${String(option.field)}-${option.direction}` === key);
}

export function createSortKey(field: keyof Product | 'price' | 'popularity', direction: 'asc' | 'desc'): string {
  return `${String(field)}-${direction}`;
}

export function getDefaultSortOption(): SortOptionConfig {
  return sortOptions[0];
}
