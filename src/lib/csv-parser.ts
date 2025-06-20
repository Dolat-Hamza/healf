import Papa from 'papaparse';
import { Product } from '@/types/product';

export interface CSVRow {
  [key: string]: string;
}

function parsePriceRange(priceRangeStr: string): { min: number; max: number } {
  if (!priceRangeStr) return { min: 0, max: 0 };
  
  try {
    const priceRange = JSON.parse(priceRangeStr);
    const minPrice = priceRange.min_variant_price?.amount || 
                    priceRange.minVariantPrice?.amount || 
                    priceRange.min?.amount || '0';
    const maxPrice = priceRange.max_variant_price?.amount || 
                    priceRange.maxVariantPrice?.amount || 
                    priceRange.max?.amount || '0';
    
    return {
      min: parseFloat(minPrice),
      max: parseFloat(maxPrice)
    };
  } catch  {
    const priceMatch = priceRangeStr.match(/\$?(\d+(?:\.\d{2})?)/g);
    if (priceMatch && priceMatch.length > 0) {
      const prices = priceMatch.map(p => parseFloat(p.replace('$', '')));
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
    
    const singlePrice = priceRangeStr.match(/(\d+(?:\.\d{2})?)/);
    if (singlePrice) {
      const price = parseFloat(singlePrice[1]);
      return { min: price, max: price };
    }
    
    return { min: 0, max: 0 };
  }
}

function parseImages(imagesStr: string): string[] {
  if (!imagesStr) return [];
  
  try {
    const images = JSON.parse(imagesStr);
    return Array.isArray(images) ? images.map(img => img.url || img).filter(Boolean) : [];
  } catch {
    return imagesStr.split(',').map(url => url.trim()).filter(Boolean);
  }
}

export function parseCSVToProducts(csvData: string | CSVRow[]): Product[] {
  let data: CSVRow[];
  
  if (typeof csvData === 'string') {
    const firstLine = csvData.split('\n')[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = tabCount > commaCount ? '\t' : ',';
    
    console.log('Auto-detected delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');
    console.log('First line sample:', firstLine.substring(0, 200));
    
    const result = Papa.parse<CSVRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      delimiter: delimiter,
      quoteChar: '"',
      escapeChar: '"',
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
      console.warn(`CSV parsing had ${result.errors.length} errors, but continuing...`);
    }
    
    data = result.data;
    console.log('Parsed CSV headers:', Object.keys(data[0] || {}));
  } else {
    data = csvData;
  }

  if (!data || data.length === 0) {
    throw new Error('No data found in CSV file');
  }

  console.log('CSV columns detected:', Object.keys(data[0] || {}));
  console.log('Sample row:', data[0]);

  return data.map((row, index) => {
    try {
      return {
        id: row.ID || row.id || `product-${index}`,
        title: row.TITLE || row.title || `Product ${index + 1}`,
        description: row.DESCRIPTION || row.description || '',
        descriptionHtml: row.DESCRIPTION_HTML || row.BODY_HTML || row.description_html || row.body_html || '',
        vendor: row.VENDOR || row.vendor || 'Unknown Vendor',
        handle: row.HANDLE || row.handle || `product-${index}`,
        productType: row.PRODUCT_TYPE || row.product_type || row.type || 'General',
        tags: (row.TAGS || row.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
        status: (row.STATUS || row.status || 'active').toLowerCase(),
        priceRange: parsePriceRange(row.PRICE_RANGE_V2 || row.PRICE_RANGE || row.price_range_v2 || row.price_range || ''),
        images: parseImages(row.IMAGES || row.images || ''),
        featuredImage: row.FEATURED_IMAGE || row.featured_image || '',
        totalVariants: parseInt(row.TOTAL_VARIANTS || row.total_variants || '1'),
        totalInventory: parseInt(row.TOTAL_INVENTORY || row.total_inventory || '0'),
        isGiftCard: (row.IS_GIFT_CARD || row.is_gift_card || '').toLowerCase() === 'true',
        hasOutOfStockVariants: (row.HAS_OUT_OF_STOCK_VARIANTS || row.has_out_of_stock_variants || '').toLowerCase() === 'true',
        createdAt: row.CREATED_AT || row.created_at || '',
        updatedAt: row.UPDATED_AT || row.updated_at || '',
        publishedAt: row.PUBLISHED_AT || row.published_at || '',
        onlineStoreUrl: row.ONLINE_STORE_URL || row.online_store_url || '',
        adminGraphqlApiId: row.ADMIN_GRAPHQL_API_ID || row.admin_graphql_api_id || '',
      };
    } catch (error) {
      console.error(`Error parsing row ${index}:`, error, row);
      return {
        id: `product-${index}`,
        title: `Product ${index + 1}`,
        description: '',
        descriptionHtml: '',
        vendor: 'Unknown Vendor',
        handle: `product-${index}`,
        productType: 'General',
        tags: [],
        status: 'active',
        priceRange: { min: 0, max: 0 },
        images: [],
        featuredImage: '',
        totalVariants: 1,
        totalInventory: 0,
        isGiftCard: false,
        hasOutOfStockVariants: false,
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        onlineStoreUrl: '',
        adminGraphqlApiId: '',
      };
    }
  });
}

export async function loadCSVFromFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const products = parseCSVToProducts(result.data as CSVRow[]);
          resolve(products);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
