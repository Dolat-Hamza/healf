import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';
import { ProductGridSkeleton } from '../ui/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  searchQuery?: string;
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  favoriteIds?: Set<string>;
  className?: string;
}

export const ProductGrid = React.memo(function ProductGrid({
  products,
  searchQuery,
  isLoading = false,
  onAddToCart,
  onToggleFavorite,
  favoriteIds = new Set(),
  className = ''
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        type="no-results"
        title="No products found"
        description="We couldn't find any products matching your search criteria."
        searchQuery={searchQuery}
        action={{
          label: 'Clear filters',
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          searchQuery={searchQuery}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteIds.has(product.id)}
        />
      ))}
    </div>
  );
});
