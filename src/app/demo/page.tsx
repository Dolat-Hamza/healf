'use client';

import React, {useEffect, useState} from 'react';
import {SearchBar} from '@/components/search/SearchBar';
import {ProductCard} from '@/components/products/ProductCard';
import {ProductGrid} from '@/components/products/ProductGrid';
import {LoadingSpinner, ProductGridSkeleton} from '@/components/ui/LoadingSpinner';
import {EmptyState} from '@/components/ui/EmptyState';
import {ErrorBoundary} from '@/components/ui/ErrorBoundary';
import {CSVDataViewer} from '@/components/tables/CSVDataViewer';
import {FilterSidebar} from '@/components/filters/FilterSidebar';
import {Product} from '@/types/product';
import {loadCSVFromFile, parseCSVToProducts} from '@/lib/csv-parser';
import {applyFilters, clearFilters, FilterState, getActiveFilterCount, getFilterOptions} from '@/lib/filters';
import {SortOptionConfig, sortOptions} from '@/lib/sorting';
import {useAutocomplete} from '@/hooks/useAutocomplete';

export default function DemoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showLoading, setShowLoading] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);
    const [showError, setShowError] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all loaded products
    const [productsLoaded, setProductsLoaded] = useState(20); // Track how many products are loaded
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [filterState, setFilterState] = useState<FilterState>({
        vendors: [],
        productTypes: [],
        statuses: [],
        priceRange: {min: 0, max: 10000},
        tags: []
    });
    const [sortOption, setSortOption] = useState<SortOptionConfig>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const autocompleteSuggestions = useAutocomplete(allProducts);

    useEffect(() => {
        const loadDefaultCSV = async () => {
            try {
                setIsLoadingProducts(true);
                const response = await fetch('/data/sample-products.csv');
                const csvText = await response.text();
                const parsedProducts = parseCSVToProducts(csvText);
                setAllProducts(parsedProducts); // Store all products
                setProducts(parsedProducts.slice(0, 20)); // Only load first 20 products by default
                console.log('Loaded default CSV data:', parsedProducts);
                setProductsLoaded(20);
            } catch (error) {
                console.error('Error loading default CSV:', error);
                setUploadError('Failed to load default product data');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadDefaultCSV();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoadingProducts(true);
            setUploadError(null);
            const uploadedProducts = await loadCSVFromFile(file);
            setProducts(uploadedProducts);
            setAllProducts(uploadedProducts); // Also update all products
            setProductsLoaded(uploadedProducts.length); // Update loaded products count
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setUploadError('Failed to parse CSV file. Please check the format.');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const searchFilteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredProducts = applyFilters(searchFilteredProducts, filterState);

    const filterOptions = getFilterOptions(products);
    const activeFilterCount = getActiveFilterCount(filterState);

    const handleFilterChange = (key: keyof FilterState, value: unknown) => {
        setFilterState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilters = () => {
        setFilterState(clearFilters());
    };

    const handleAddToCart = (product: Product) => {
        alert(`Added ${product.title} to cart!`);
    };

    const handleToggleFavorite = (product: Product) => {
        const newFavorites = new Set(favoriteIds);
        if (newFavorites.has(product.id)) {
            newFavorites.delete(product.id);
        } else {
            newFavorites.add(product.id);
        }
        setFavoriteIds(newFavorites);
    };

    const handleLoadMore = () => {
        const nextLoaded = productsLoaded + 20;
        setProducts(allProducts.slice(0, nextLoaded));
        setProductsLoaded(nextLoaded);
    };

    const ErrorComponent = () => {
        throw new Error('Demo error for testing error boundary');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-poppins font-bold ">
                        🎨 Product Search Platform - Interactive Demo
                    </h1>
                    <p className="mt-2 text-gray-600 font-inter">
                        Comprehensive showcase of all implemented components, features, and real-time interactions
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* CSV Upload Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">📁 CSV Data Management</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                Upload your own CSV file (or use the default sample data)
                            </label>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        {uploadError && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                {uploadError}
                            </div>
                        )}
                        <div className="text-sm text-gray-600">
                            <p><strong>Expected CSV columns:</strong> ID, TITLE, DESCRIPTION, DESCRIPTION_HTML, VENDOR,
                                HANDLE, PRODUCT_TYPE, TAGS, STATUS, PRICE_RANGE_V2, IMAGES, FEATURED_IMAGE,
                                TOTAL_VARIANTS, TOTAL_INVENTORY, IS_GIFT_CARD, HAS_OUT_OF_STOCK_VARIANTS, CREATED_AT,
                                UPDATED_AT, PUBLISHED_AT, ONLINE_STORE_URL, ADMIN_GRAPHQL_API_ID</p>
                            <p className="mt-1"><strong>Currently loaded:</strong> {products.length} products</p>
                        </div>
                    </div>
                </div>

                {/* Demo Controls */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">🎛️ Demo Controls</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowLoading(!showLoading)}
                            className={`px-4 py-2 rounded-md ${
                                showLoading
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {showLoading ? 'Hide' : 'Show'} Loading State
                        </button>
                        <button
                            onClick={() => setShowEmpty(!showEmpty)}
                            className={`px-4 py-2 rounded-md ${
                                showEmpty
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {showEmpty ? 'Hide' : 'Show'} Empty State
                        </button>
                        <button
                            onClick={() => setShowError(!showError)}
                            className={`px-4 py-2 rounded-md ${
                                showError
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {showError ? 'Hide' : 'Show'} Error State
                        </button>
                    </div>
                </div>

                {/* Search Bar Component */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">🔍 Search Bar Component</h2>
                    <p className="text-gray-600 font-inter mb-4">
                        Debounced search input with clear functionality, loading states, and real-time filtering
                    </p>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search products..."
                        isSearching={showLoading}
                        onClear={() => setSearchQuery('')}
                        suggestions={autocompleteSuggestions}
                        onSelect={(value) => setSearchQuery(value)}
                    />
                </div>

                {/* Filter Sidebar Component */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">🎛️ Filter Sidebar Component</h2>
                    <p className="text-gray-600 font-inter mb-4">
                        Advanced filtering with vendor, product type, price range, status filters, and sorting options
                    </p>

                    <div className="mb-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {isSidebarOpen ? 'Hide' : 'Show'} Filter Sidebar
                        </button>
                        {activeFilterCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {activeFilterCount} active filters
              </span>
                        )}
                    </div>

                    <div className="relative">
                        <FilterSidebar
                            filterState={filterState}
                            onFilterChange={handleFilterChange}
                            filterOptions={filterOptions}
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                            sortOptions={sortOptions}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={handleClearFilters}
                            isOpen={isSidebarOpen}
                            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        />

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-poppins text-white font-medium mb-2">Filtered Results</h3>
                            <p className="text-sm text-white">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                            {searchQuery && (
                                <p className="text-sm text-gray-600">
                                    Search: &quot;{searchQuery}&quot;
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Card Component */}
                <div className="bg-white text-black rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">🛍️ Product Card Component</h2>
                    <p className="text-gray-600 font-inter mb-4">
                        Responsive product cards with images, pricing, action buttons, and interactive hover effects
                    </p>
                    {isLoadingProducts || showLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : showEmpty || filteredProducts.length === 0 ? (
                        <EmptyState
                            type="no-results"
                            title="No products found"
                            description="Try adjusting your search or upload a CSV file with product data"
                            searchQuery={searchQuery}
                            action={{
                                label: 'Clear search',
                                onClick: () => setSearchQuery('')
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.slice(0, 3).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    searchQuery={searchQuery}
                                    onAddToCart={handleAddToCart}
                                    onToggleFavorite={handleToggleFavorite}
                                    isFavorite={favoriteIds.has(product.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading States */}
                {showLoading && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-poppins font-semibold mb-4">⏳ Loading Components</h2>
                        <p className="text-gray-600 font-inter mb-4">
                            Various loading states, skeleton screens, and performance-optimized animations
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-poppins font-medium mb-2">Loading Spinner</h3>
                                <LoadingSpinner/>
                            </div>
                            <div>
                                <h3 className="font-poppins font-medium mb-2">Product Grid Skeleton</h3>
                                <ProductGridSkeleton/>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty States */}
                {showEmpty && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-poppins font-semibold mb-4">📭 Empty State Components</h2>
                        <p className="text-gray-600 font-inter mb-4">
                            User-friendly empty states for different scenarios with clear call-to-action buttons
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-poppins font-medium mb-2">No Search Results</h3>
                                <EmptyState
                                    type="no-results"
                                    title="No products found"
                                    description="We couldn't find any products matching your search criteria."
                                    searchQuery="demo search"
                                    action={{
                                        label: 'Clear filters',
                                        onClick: () => alert('Filters cleared!')
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="font-poppins font-medium mb-2">No Products Available</h3>
                                <EmptyState
                                    type="no-products"
                                    title="No products available"
                                    description="There are currently no products in the catalog."
                                    action={{
                                        label: 'Add products',
                                        onClick: () => alert('Add products clicked!')
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Boundary */}
                {showError && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-poppins font-semibold mb-4">🚨 Error Boundary Component</h2>
                        <p className="text-gray-600 font-inter mb-4">
                            Error handling with user-friendly error messages and graceful fallbacks
                        </p>
                        <ErrorBoundary>
                            <ErrorComponent/>
                        </ErrorBoundary>
                    </div>
                )}

                {/* Product Grid Component */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-xl font-poppins font-semibold mb-4">📱 Product Grid Component</h2>
                    <p className="text-gray-600 font-inter mb-4">
                        Responsive grid layout with memoized performance optimizations and lazy loading
                    </p>
                    <ProductGrid
                        products={filteredProducts}
                        searchQuery={searchQuery}
                        isLoading={isLoadingProducts || showLoading}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={handleToggleFavorite}
                        favoriteIds={favoriteIds}
                    />
                    {/* Load More Button */}
                    {allProducts.length > products.length && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
                                disabled={isLoadingProducts}
                            >
                                Load More Products
                            </button>
                        </div>
                    )}
                </div>

                {/* Feature Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border mb-10 p-6">
                    <h2 className="text-xl font-poppins font-semibold mb-4">✨ Features Implemented</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-blue-600 mb-2">🔍 Search &amp; Filtering</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Debounced search input</li>
                                <li>• Fuzzy search capabilities</li>
                                <li>• Multi-field filtering</li>
                                <li>• Real-time results</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-green-600 mb-2">🎨 UI/UX Design</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Responsive design</li>
                                <li>• Tailwind CSS styling</li>
                                <li>• Accessibility features</li>
                                <li>• Loading states</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-purple-600 mb-2">⚡ Performance</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• React.memo optimization</li>
                                <li>• Virtual scrolling</li>
                                <li>• Memoized computations</li>
                                <li>• Lazy loading</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-red-600 mb-2">🛡️ Error Handling</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Error boundaries</li>
                                <li>• CSV validation</li>
                                <li>• Graceful fallbacks</li>
                                <li>• User feedback</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-yellow-600 mb-2">📊 Data Processing</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• CSV parsing</li>
                                <li>• Type validation</li>
                                <li>• Performance monitoring</li>
                                <li>• Scalability analysis</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-poppins font-medium text-indigo-600 mb-2">🔧 Developer Experience</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• TypeScript integration</li>
                                <li>• Custom hooks</li>
                                <li>• Modular architecture</li>
                                <li>• Comprehensive docs</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Advanced CSV Data Viewer with Performance Optimizations */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-poppins font-semibold mb-4">📊 Advanced CSV Data Viewer</h2>
                    <p className="text-gray-600 font-inter mb-4">
                        Performance-optimized CSV viewer with smart rendering for JSON/HTML content,
                        virtualization for large datasets (9000+ rows), and interactive data exploration with real-time filtering.
                    </p>
                    <CSVDataViewer/>
                </div>
            </div>
        </div>
    );
}
