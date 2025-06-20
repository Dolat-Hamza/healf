import { Product } from '@/types/product';

export interface PerformanceMetrics {
  parseTime: number;
  memoryUsage: number;
  productCount: number;
  strategy: string;
}

export class CSVPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  async measureParsing<T>(
    strategy: string,
    parseFunction: () => Promise<T>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    const result = await parseFunction();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      parseTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      productCount: Array.isArray(result) ? result.length : 0,
      strategy
    };

    this.metrics.push(metrics);
    return { result, metrics };
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      return perfWithMemory.memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getBestStrategy(): string | null {
    if (this.metrics.length === 0) return null;
    
    const fastest = this.metrics.reduce((best, current) => 
      current.parseTime < best.parseTime ? current : best
    );
    
    return fastest.strategy;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new CSVPerformanceMonitor();

export function optimizeCSVParsing(products: Product[]): Product[] {
  return products.map(product => ({
    ...product,
    descriptionHtml: '', // Remove HTML to reduce memory
    adminGraphqlApiId: '', // Remove internal IDs
  }));
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function parseCSVInChunks(
  csvContent: string,
  chunkSize: number = 1000
): Promise<Product[]> {
  const { parseCSVToProducts } = await import('./csv-parser');
  const allProducts = parseCSVToProducts(csvContent);
  
  const chunks = chunkArray(allProducts, chunkSize);
  const processedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      await new Promise(resolve => setTimeout(resolve, 1));
      return chunk;
    })
  );
  
  return processedChunks.flat();
}
