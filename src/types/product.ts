export interface Product {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  handle: string;
  productType: string;
  tags: string[];
  status: string;
  priceRange: {
    min: number;
    max: number;
  };
  images: string[];
  featuredImage?: string;
  totalVariants: number;
  totalInventory: number;
  isGiftCard: boolean;
  hasOutOfStockVariants: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  onlineStoreUrl?: string;
  adminGraphqlApiId: string;
}

export interface SearchFilters {
  query: string;
  vendor?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  isGiftCard?: boolean;
  hasOutOfStockVariants?: boolean;
}

export interface SortOption {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
