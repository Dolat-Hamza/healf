import React from 'react';
import { Product } from '@/types/product';
import { formatPriceRange, truncateText } from '@/utils/format';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
  searchQuery?: string;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
}

export const ProductCard = React.memo(function ProductCard({ 
  product, 
  searchQuery, 
  onAddToCart, 
  onToggleFavorite,
  isFavorite = false 
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFavorite?.(product);
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:shadow-blue-100/50 hover:border-blue-200 transition-all duration-300 ease-in-out transform hover:scale-[1.02] overflow-hidden group">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative overflow-hidden">

          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📦</div>
            </div>
          </div>

        
        {/* Status Badge */}
        {product.status !== 'active' && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.status === 'draft' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
          </div>
        )}

        {/* Gift Card Badge */}
        {product.isGiftCard && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              Gift Card
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute p-1.5 rounded-full bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110 opacity-0 group-hover:opacity-100 ${
            product.isGiftCard ? 'top-12 right-2' : 'top-2 right-2'
          }`}
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Vendor */}
        <div className="text-sm font-inter text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
          {highlightText(product.vendor)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-poppins font-semibold  mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200">
          {highlightText(truncateText(product.title, 60))}
        </h3>

        {/* Description */}
        <p className="text-sm font-inter text-gray-700 mb-3 line-clamp-2 group-hover:text-gray-800 transition-colors duration-200">
          {highlightText(truncateText(product.description, 100))}
        </p>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-white rounded-full">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold ">
              {formatPriceRange(product.priceRange)}
            </div>
            {product.totalVariants > 1 && (
              <div className="text-xs text-gray-600">
                {product.totalVariants} variants
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.hasOutOfStockVariants}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform ${
              product.hasOutOfStockVariants
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95'
            }`}
          >
            {product.hasOutOfStockVariants ? (
              'Out of Stock'
            ) : (
              <div className="flex items-center space-x-1">
                <ShoppingCartIcon className="h-4 w-4" />
                <span>Add</span>
              </div>
            )}
          </button>
        </div>

        {/* Inventory Info */}
        <div className="mt-2 text-xs text-gray-600">
          {product.totalInventory > 0 ? (
            `${product.totalInventory} in stock`
          ) : (
            'Limited availability'
          )}
        </div>
      </div>
    </div>
  );
});
