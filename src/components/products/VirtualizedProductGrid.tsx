import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';

interface VirtualizedProductGridProps {
  products: Product[];
  searchQuery?: string;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  favoriteIds?: Set<string>;
  containerHeight?: number;
  itemHeight?: number;
  className?: string;
}

export const VirtualizedProductGrid = React.memo(function VirtualizedProductGrid({
  products,
  searchQuery,
  onAddToCart,
  onToggleFavorite,
  favoriteIds = new Set(),
  containerHeight = 600,
  itemHeight = 320,
  className = ''
}: VirtualizedProductGridProps) {
  const { virtualItems, scrollElementProps, containerProps } = useVirtualScroll(
    products,
    {
      itemHeight,
      containerHeight,
      overscan: 5
    }
  );

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No products to display
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div {...scrollElementProps}>
        <div {...containerProps}>
          {virtualItems.map(({ item: product, offsetTop }) => (
            <div
              key={product.id}
              style={{
                position: 'absolute',
                top: offsetTop,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              <div className="p-2">
                <ProductCard
                  product={product}
                  searchQuery={searchQuery}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favoriteIds.has(product.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {virtualItems.length} of {products.length} products
      </div>
    </div>
  );
});
