import React from 'react';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  type: 'no-results' | 'no-products' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  searchQuery?: string;
}

export function EmptyState({ type, title, description, action, searchQuery }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'no-results':
        return <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />;
      default:
        return (
          <div className="text-6xl text-gray-400 mb-4">
            📦
          </div>
        );
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium  mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
        {searchQuery && (
          <span className="block mt-2 font-medium">
            No results found for &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
      
      {type === 'no-results' && (
        <div className="mt-6 text-sm text-gray-500">
          <p>Try adjusting your search or filters:</p>
          <ul className="mt-2 space-y-1">
            <li>• Check your spelling</li>
            <li>• Use fewer or different keywords</li>
            <li>• Remove some filters</li>
            <li>• Try more general terms</li>
          </ul>
        </div>
      )}
    </div>
  );
}
