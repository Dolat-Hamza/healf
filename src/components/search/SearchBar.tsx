import React, { useMemo } from 'react';
import { AutoComplete } from 'antd';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AutocompleteSuggestion {
  value: string;
  label: string;
  type: 'title' | 'vendor' | 'tag' | 'productType';
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  onClear?: () => void;
  suggestions?: AutocompleteSuggestion[];
  onSelect?: (value: string) => void;
}

export const SearchBar = React.memo(function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search products...", 
  isSearching = false,
  onClear,
  suggestions = [],
  onSelect
}: SearchBarProps) {
  const options = useMemo(() => {
    if (!value.trim() || suggestions.length === 0) return [];
    
    const filtered = suggestions
      .filter(suggestion => 
        suggestion.value.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 8)
      .map(suggestion => ({
        value: suggestion.value,
        label: (
          <div className="flex items-center justify-between py-1">
            <span className=" font-medium truncate">
              {suggestion.value}
            </span>
            <span className="suggestion-type-badge ml-2 flex-shrink-0">
              {suggestion.type}
            </span>
          </div>
        ),
      }));
    
    return filtered;
  }, [value, suggestions]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">

        
        <AutoComplete
          value={value}
          onChange={onChange}
          onSelect={onSelect}
          options={options}
          placeholder={placeholder}
          className="w-full"
          dropdownClassName="search-autocomplete-dropdown"
          notFoundContent={null}
          allowClear={false}
        >
          <input
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-300 ease-in-out transform hover:scale-[1.01] focus:scale-[1.01]"
            autoComplete="off"
            spellCheck="false"
          />
        </AutoComplete>
        
        {value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
            <button
              type="button"
              onClick={() => {
                onChange('');
                onClear?.();
              }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 hover:bg-gray-100 focus:bg-gray-100 rounded-full p-1 transition-all duration-200 ease-in-out transform hover:scale-110 focus:scale-110"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="font-medium">Searching...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
