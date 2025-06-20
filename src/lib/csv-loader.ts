import { parseCSVToProducts } from './csv-parser';
import { Product } from '@/types/product';

export async function loadProductsFromCSV(csvContent: string): Promise<Product[]> {
  try {
    const products = parseCSVToProducts(csvContent);
    return products;
  } catch (error) {
    console.error('Error loading products from CSV:', error);
    throw new Error('Failed to parse CSV data');
  }
}

export async function loadProductsFromFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        const products = await loadProductsFromCSV(csvContent);
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

export async function loadSampleProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/data/sample-products.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch sample CSV');
    }
    const csvContent = await response.text();
    return loadProductsFromCSV(csvContent);
  } catch (error) {
    console.error('Error loading sample products:', error);
    throw new Error('Failed to load sample products');
  }
}
