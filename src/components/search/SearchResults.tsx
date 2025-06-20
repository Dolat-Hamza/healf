import React from 'react';
import { Product } from '../../types/product';
import { ProductGrid } from '../products/ProductGrid';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';

interface SearchResultsProps {
  products: Product[];
  searchQuery: string;
  isLoading: boolean;
  error: Error | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  favoriteProducts?: Set<string>;
}

export function SearchResults({
  products,
  searchQuery,
  isLoading,
  error,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
  onRetry,
  onClearSearch,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts = new Set()
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Search Error"
        description="An error occurred while searching for products. Please try again."
        action={onRetry ? {
          label: 'Try Again',
          onClick: onRetry
        } : undefined}
      />
    );
  }

  if (products.length === 0 && !searchQuery) {
    return (
      <EmptyState
        type="no-products"
        title="No Products Available"
        description="There are currently no products to display. Please check back later or contact support if this seems incorrect."
      />
    );
  }

  if (products.length === 0 && searchQuery) {
    return (
      <EmptyState
        type="no-results"
        title="No Results Found"
        description="We couldn't find any products matching your search criteria."
        searchQuery={searchQuery}
        action={onClearSearch ? {
          label: 'Clear Search',
          onClick: onClearSearch
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {searchQuery ? (
            <span>
              Found <span className="font-medium">{totalResults}</span> results for{' '}
              <span className="font-medium">&ldquo;{searchQuery}&rdquo;</span>
            </span>
          ) : (
            <span>
              Showing <span className="font-medium">{totalResults}</span> products
            </span>
          )}
        </div>
        
        {searchQuery && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        searchQuery={searchQuery}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        favoriteIds={favoriteProducts}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalResults}
            itemsPerPage={Math.ceil(totalResults / totalPages)}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

interface SearchResultsContainerProps {
  products: Product[];
  searchQuery: string;
  isLoading: boolean;
  error: Error | null;
  itemsPerPage?: number;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  favoriteProducts?: Set<string>;
  onRetry?: () => void;
  onClearSearch?: () => void;
}

export function SearchResultsContainer({
  products,
  searchQuery,
  isLoading,
  error,
  itemsPerPage = 12,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts,
  onRetry,
  onClearSearch
}: SearchResultsContainerProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, products.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SearchResults
      products={currentProducts}
      searchQuery={searchQuery}
      isLoading={isLoading}
      error={error}
      totalResults={products.length}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onRetry={onRetry}
      onClearSearch={onClearSearch}
      onAddToCart={onAddToCart}
      onToggleFavorite={onToggleFavorite}
      favoriteProducts={favoriteProducts}
    />
  );
}
