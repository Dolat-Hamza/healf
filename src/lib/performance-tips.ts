export interface PerformanceTip {
  category: 'csv' | 'search' | 'ui' | 'memory';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  threshold?: number;
}

export function analyzePerformance(data: {
  csvSize: number;
  productCount: number;
  searchTime: number;
  renderTime: number;
  memoryUsage?: number;
}): PerformanceTip[] {
  const tips: PerformanceTip[] = [];

  if (data.csvSize > 10 * 1024 * 1024) { // 10MB
    tips.push({
      category: 'csv',
      severity: 'warning',
      title: 'Large CSV File Detected',
      description: `CSV file size is ${(data.csvSize / 1024 / 1024).toFixed(2)}MB`,
      recommendation: 'Consider splitting into smaller files or implementing server-side processing',
      threshold: 10 * 1024 * 1024
    });
  }

  if (data.csvSize > 50 * 1024 * 1024) { // 50MB
    tips.push({
      category: 'csv',
      severity: 'critical',
      title: 'Very Large CSV File',
      description: `CSV file size is ${(data.csvSize / 1024 / 1024).toFixed(2)}MB`,
      recommendation: 'Use database storage instead of CSV for better performance',
      threshold: 50 * 1024 * 1024
    });
  }

  if (data.productCount > 1000) {
    tips.push({
      category: 'ui',
      severity: 'info',
      title: 'Large Product Dataset',
      description: `${data.productCount} products loaded`,
      recommendation: 'Implement pagination or virtual scrolling for better UI performance',
      threshold: 1000
    });
  }

  if (data.productCount > 10000) {
    tips.push({
      category: 'search',
      severity: 'warning',
      title: 'Very Large Product Dataset',
      description: `${data.productCount} products loaded`,
      recommendation: 'Consider implementing server-side search and filtering',
      threshold: 10000
    });
  }

  if (data.searchTime > 100) { // 100ms
    tips.push({
      category: 'search',
      severity: 'warning',
      title: 'Slow Search Performance',
      description: `Search taking ${data.searchTime.toFixed(2)}ms`,
      recommendation: 'Implement search indexing or use Web Workers for search operations',
      threshold: 100
    });
  }

  if (data.searchTime > 500) { // 500ms
    tips.push({
      category: 'search',
      severity: 'critical',
      title: 'Very Slow Search Performance',
      description: `Search taking ${data.searchTime.toFixed(2)}ms`,
      recommendation: 'Move search operations to server-side or implement search service',
      threshold: 500
    });
  }

  if (data.renderTime > 16) { // 60fps threshold
    tips.push({
      category: 'ui',
      severity: 'warning',
      title: 'Slow Rendering Performance',
      description: `Rendering taking ${data.renderTime.toFixed(2)}ms`,
      recommendation: 'Implement React.memo, useMemo, and virtual scrolling',
      threshold: 16
    });
  }

  if (data.memoryUsage && data.memoryUsage > 100 * 1024 * 1024) { // 100MB
    tips.push({
      category: 'memory',
      severity: 'warning',
      title: 'High Memory Usage',
      description: `Memory usage is ${(data.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      recommendation: 'Implement data cleanup and consider lazy loading strategies',
      threshold: 100 * 1024 * 1024
    });
  }

  return tips;
}

export const PERFORMANCE_BEST_PRACTICES = {
  csv: [
    'Keep CSV files under 10MB for client-side processing',
    'Use server-side processing for files larger than 50MB',
    'Validate CSV structure before full parsing',
    'Implement streaming for very large files',
    'Consider using binary formats (like Parquet) for large datasets'
  ],
  search: [
    'Implement debounced search to reduce API calls',
    'Use search indexing for large datasets',
    'Consider fuzzy search libraries like Fuse.js',
    'Implement search result caching',
    'Use Web Workers for heavy search operations'
  ],
  ui: [
    'Implement virtual scrolling for large lists',
    'Use React.memo for expensive components',
    'Implement pagination with reasonable page sizes',
    'Use skeleton loading states',
    'Optimize images with proper sizing and lazy loading'
  ],
  memory: [
    'Clean up event listeners and subscriptions',
    'Use object pooling for frequently created objects',
    'Implement proper garbage collection strategies',
    'Monitor memory usage in production',
    'Use WeakMap and WeakSet where appropriate'
  ]
};

export function getScalabilityRecommendations(productCount: number): {
  current: string;
  recommended: string;
  reasoning: string;
}[] {
  const recommendations: {
    current: string;
    recommended: string;
    reasoning: string;
  }[] = [];

  if (productCount < 1000) {
    recommendations.push({
      current: 'CSV file processing',
      recommended: 'Continue with CSV + client-side processing',
      reasoning: 'Small dataset works well with current approach'
    });
  } else if (productCount < 10000) {
    recommendations.push({
      current: 'CSV file processing',
      recommended: 'Consider SQLite or IndexedDB',
      reasoning: 'Medium dataset would benefit from structured storage'
    });
  } else {
    recommendations.push({
      current: 'CSV file processing',
      recommended: 'Migrate to database (PostgreSQL, MongoDB)',
      reasoning: 'Large dataset requires proper database with indexing'
    });
  }

  if (productCount > 1000) {
    recommendations.push({
      current: 'Client-side search',
      recommended: 'Server-side search with pagination',
      reasoning: 'Reduce client memory usage and improve search performance'
    });
  }

  if (productCount > 5000) {
    recommendations.push({
      current: 'Full dataset loading',
      recommended: 'Implement lazy loading and virtual scrolling',
      reasoning: 'Improve initial load time and reduce memory footprint'
    });
  }

  return recommendations;
}

export function measurePerformance<T>(
  operation: () => T,
  label: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

export function createPerformanceMonitor() {
  const metrics: Record<string, number[]> = {};

  return {
    measure<T>(operation: () => T, label: string): T {
      const start = performance.now();
      const result = operation();
      const duration = performance.now() - start;
      
      if (!metrics[label]) {
        metrics[label] = [];
      }
      metrics[label].push(duration);
      
      return result;
    },
    
    getMetrics() {
      const summary: Record<string, {
        count: number;
        average: number;
        min: number;
        max: number;
        total: number;
      }> = {};
      
      for (const [label, times] of Object.entries(metrics)) {
        summary[label] = {
          count: times.length,
          average: times.reduce((a, b) => a + b, 0) / times.length,
          min: Math.min(...times),
          max: Math.max(...times),
          total: times.reduce((a, b) => a + b, 0)
        };
      }
      
      return summary;
    },
    
    reset() {
      Object.keys(metrics).forEach(key => {
        metrics[key] = [];
      });
    }
  };
}
