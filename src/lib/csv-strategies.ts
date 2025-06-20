import { Product } from '@/types/product';
import { parseCSVToProducts } from './csv-parser';

export interface CSVParsingStrategy {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  implementation: () => Promise<Product[]>;
}

export class BuildTimeCSVStrategy implements CSVParsingStrategy {
  name = 'Build-Time Parsing';
  description = 'Parse CSV during build process and serve as static JSON';
  pros = [
    'Fastest runtime performance',
    'No client-side parsing overhead',
    'Better SEO with pre-rendered data',
    'Reduced server load',
    'Works offline once loaded'
  ];
  cons = [
    'Static data only - no dynamic updates',
    'Requires rebuild for data changes',
    'Larger bundle size',
    'Not suitable for user uploads'
  ];
  bestFor = [
    'Static product catalogs',
    'Infrequently updated data',
    'Performance-critical applications',
    'SEO-focused sites'
  ];

  async implementation(): Promise<Product[]> {
    const response = await fetch('/data/sample-products.csv');
    const csvContent = await response.text();
    return parseCSVToProducts(csvContent);
  }
}

export class ServerSideCSVStrategy implements CSVParsingStrategy {
  name = 'Server-Side Parsing';
  description = 'Parse CSV on the server via API routes';
  pros = [
    'Dynamic data updates',
    'Better security (no client exposure)',
    'Smaller client bundle',
    'Can handle large files',
    'Server-side validation'
  ];
  cons = [
    'Server processing overhead',
    'Network latency for each request',
    'Requires server resources',
    'More complex caching strategy'
  ];
  bestFor = [
    'Dynamic product catalogs',
    'Admin dashboards',
    'Large datasets',
    'Security-sensitive data'
  ];

  async implementation(): Promise<Product[]> {
    const response = await fetch('/api/products');
    const data = await response.json();
    return data.products;
  }
}

export class ClientSideCSVStrategy implements CSVParsingStrategy {
  name = 'Client-Side Parsing';
  description = 'Parse CSV directly in the browser';
  pros = [
    'Real-time file uploads',
    'No server processing',
    'Immediate feedback',
    'Works with any CSV file',
    'User has full control'
  ];
  cons = [
    'Browser performance impact',
    'Memory limitations',
    'No server-side validation',
    'Larger client bundle',
    'Security concerns with user files'
  ];
  bestFor = [
    'User file uploads',
    'Data analysis tools',
    'Prototyping',
    'Client-side applications'
  ];

  async implementation(): Promise<Product[]> {
    throw new Error('Client-side parsing requires file input');
  }
}

export class HybridCSVStrategy implements CSVParsingStrategy {
  name = 'Hybrid Approach';
  description = 'Combine multiple strategies based on use case';
  pros = [
    'Best of all approaches',
    'Flexible data sources',
    'Optimized performance',
    'Scalable architecture'
  ];
  cons = [
    'More complex implementation',
    'Requires careful strategy selection',
    'Higher development overhead'
  ];
  bestFor = [
    'Production applications',
    'Multi-tenant systems',
    'Complex data requirements',
    'Enterprise solutions'
  ];

  async implementation(): Promise<Product[]> {
    return new ServerSideCSVStrategy().implementation();
  }
}

export const csvStrategies = {
  buildTime: new BuildTimeCSVStrategy(),
  serverSide: new ServerSideCSVStrategy(),
  clientSide: new ClientSideCSVStrategy(),
  hybrid: new HybridCSVStrategy()
};

export function getRecommendedStrategy(useCase: string): CSVParsingStrategy {
  switch (useCase.toLowerCase()) {
    case 'static':
    case 'seo':
      return csvStrategies.buildTime;
    case 'dynamic':
    case 'admin':
      return csvStrategies.serverSide;
    case 'upload':
    case 'user':
      return csvStrategies.clientSide;
    case 'production':
    case 'enterprise':
      return csvStrategies.hybrid;
    default:
      return csvStrategies.serverSide;
  }
}
