'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {SearchBar} from '@/components/search/SearchBar';
import {ProductCard} from '@/components/products/ProductCard';
import {CSVDataViewer} from '@/components/tables/CSVDataViewer';
import {parseCSVToProducts} from '@/lib/csv-parser';
import {Product} from '@/types/product';

export default function Home() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/data/sample-products.csv');
                const csvText = await response.text();
                const parsedProducts = parseCSVToProducts(csvText);
                setProducts(parsedProducts);
            } catch  {
                setError('Failed to load products from CSV file.');
            } finally {
                setIsLoading(false);
            }
        }
        loadProducts()
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Hero Section */}
            <motion.section
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
            >
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <motion.h1
                            initial={{opacity: 0, y: 30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.2}}
                            className="text-4xl md:text-6xl font-poppins font-bold mb-6 leading-tight"
                        >
                            🔍 Product Search Platform
                        </motion.h1>
                        <motion.p
                            initial={{opacity: 0, y: 30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.4}}
                            className="text-xl md:text-2xl mb-8 text-blue-100 font-inter max-w-3xl mx-auto"
                        >
                            Fast, intuitive, and powerful CSV-based product search with advanced analytics
                        </motion.p>
                        <motion.div
                            initial={{opacity: 0, y: 30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.6}}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href="/demo"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                🚀 Try Demo
                            </Link>
                            <button
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                                📊 Upload CSV
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-poppins font-bold d mb-4">
                            ✨ Powerful Features
                        </h2>
                        <p className="text-xl font-inter text-gray-600 max-w-3xl mx-auto">
                            Everything you need for advanced product data analysis with enterprise-grade performance
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🔍',
                                title: 'Smart Search',
                                description: 'Fuzzy search with debouncing, multi-field filtering, and real-time results'
                            },
                            {
                                icon: '📊',
                                title: 'Data Visualization',
                                description: 'Interactive charts and graphs with Highcharts integration'
                            },
                            {
                                icon: '⚡',
                                title: 'High Performance',
                                description: 'Optimized for 9000+ rows with virtualization and chunked loading'
                            },
                            {
                                icon: '🎨',
                                title: 'Modern UI',
                                description: 'Beautiful interface with Ant Design and Framer Motion animations'
                            },
                            {
                                icon: '📱',
                                title: 'Responsive Design',
                                description: 'Works perfectly on desktop, tablet, and mobile devices'
                            },
                            {
                                icon: '🛡️',
                                title: 'Error Handling',
                                description: 'Robust error boundaries and graceful fallbacks'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.6, delay: index * 0.1}}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-poppins font-semibold  mb-2">{feature.title}</h3>
                                <p className="text-gray-600 font-inter">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Demo Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-4">
                            🎮 Try It Live
                        </h2>
                        <p className="text-xl font-inter  text-white max-w-3xl mx-auto">
                            Experience the search functionality and see a sample product card with real-time interactions
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Search Demo */}
                        <motion.div
                            initial={{opacity: 0, x: -20}}
                            whileInView={{opacity: 1, x: 0}}
                            transition={{duration: 0.6}}
                            className="bg-white rounded-xl shadow-lg p-8"
                        >
                            <h3 className="text-2xl font-poppins font-semibold  mb-6">🔍 Search Component</h3>
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Try searching for products..."
                                isSearching={false}
                                onClear={() => setSearchQuery('')}
                            />
                            <div className="mt-4 text-sm text-gray-600">
                                <p>✨ Features debounced input, clear functionality, and loading states</p>
                            </div>
                        </motion.div>

                        {/* Product Card Demo */}
                        <motion.div
                            initial={{opacity: 0, x: 20}}
                            whileInView={{opacity: 1, x: 0}}
                            transition={{duration: 0.6}}
                            className="bg-white rounded-xl shadow-lg p-8"
                        >
                            <h3 className="text-2xl font-poppins font-semibold  mb-6">🛍️ Product Card</h3>
                            {isLoading && <div>Loading...</div>}
                            {error && <div className="text-red-600">{error}</div>}
                            {!isLoading && !error && products.length > 0 && (
                                <ProductCard
                                    product={products[0]}
                                    searchQuery={searchQuery}
                                    onAddToCart={() => alert('Added to cart!')}
                                    onToggleFavorite={() => alert('Toggled favorite!')}
                                    isFavorite={false}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CSV Upload Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-poppins font-bold  mb-4">
                            📊 Advanced CSV Analysis
                        </h2>
                        <p className="text-xl font-inter text-gray-600 max-w-3xl mx-auto">
                            Upload your CSV file and explore your data with powerful visualization tools and interactive charts
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        className="bg-white rounded-xl shadow-lg p-8"
                    >
                        <CSVDataViewer/>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                    >
                        <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 text-blue-100 font-inter max-w-3xl mx-auto">
                            Explore all components and features in our comprehensive demo with real-time interactions
                        </p>
                        <Link
                            href="/demo"
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg text-lg"
                        >
                            🎨 View Full Demo
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-poppins font-semibold mb-4">🔍 Product Search Platform</h3>
                            <p className="text-gray-400 font-inter">
                                Built with Next.js, TypeScript, Tailwind CSS, Ant Design, Framer Motion, and Highcharts
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-poppins font-semibold mb-4">Features</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>• CSV Data Processing</li>
                                <li>• Advanced Search & Filtering</li>
                                <li>• Data Visualization</li>
                                <li>• Performance Optimization</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-poppins font-semibold mb-4">Technologies</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>• Next.js 14</li>
                                <li>• TypeScript</li>
                                <li>• Ant Design</li>
                                <li>• Highcharts</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Product Search Platform. Built with ❤️ for data analysis.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
