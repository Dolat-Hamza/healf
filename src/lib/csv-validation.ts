import { Product } from '@/types/product';
import { CSVError, ValidationError, ParseError } from './error-handling';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validProducts: Product[];
  invalidProducts: Array<{ row: number; data: unknown; errors: string[] }>;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    processingTime: number;
  };
}

export interface CSVValidationOptions {
  strictMode: boolean;
  allowMissingFields: boolean;
  maxFileSize: number;
  maxRows: number;
  requiredFields: string[];
  skipEmptyRows: boolean;
  validateDataTypes: boolean;
}

const DEFAULT_OPTIONS: CSVValidationOptions = {
  strictMode: false,
  allowMissingFields: true,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxRows: 100000, // 100k rows max
  requiredFields: ['ID', 'TITLE', 'VENDOR'],
  skipEmptyRows: true,
  validateDataTypes: true
};

export function validateCSVFile(file: File, options: Partial<CSVValidationOptions> = {}): ValidationResult {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!file) {
    throw new CSVError('No file provided', 'NO_FILE');
  }

  if (file.size === 0) {
    throw new CSVError('CSV file is empty', 'EMPTY_FILE');
  }

  if (file.size > opts.maxFileSize) {
    throw new CSVError(
      `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(opts.maxFileSize / 1024 / 1024)}MB)`,
      'FILE_TOO_LARGE'
    );
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    warnings.push('File does not have .csv extension - ensure it contains CSV data');
  }

  if (file.type && !file.type.includes('csv') && !file.type.includes('text')) {
    warnings.push('File MIME type suggests it may not be a CSV file');
  }

  const processingTime = performance.now() - startTime;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validProducts: [],
    invalidProducts: [],
    summary: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      processingTime
    }
  };
}

export function validateCSVContent(csvContent: string, options: Partial<CSVValidationOptions> = {}): ValidationResult {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const validProducts: Product[] = [];
  const invalidProducts: Array<{ row: number; data: unknown; errors: string[] }> = [];

  try {
    if (!csvContent || !csvContent.trim()) {
      throw new CSVError('CSV content is empty', 'EMPTY_FILE');
    }

    let lines = csvContent.split(/\r?\n/);
    if (opts.skipEmptyRows) {
      lines = lines.filter(line => line.trim());
    }
    
    if (lines.length === 0) {
      throw new CSVError('No valid lines found in CSV', 'EMPTY_FILE');
    }

    if (lines.length > opts.maxRows) {
      throw new CSVError(
        `CSV contains ${lines.length} rows, which exceeds the maximum of ${opts.maxRows}`,
        'FILE_TOO_LARGE'
      );
    }

    if (lines.length < 1) {
      throw new CSVError('CSV must contain at least a header row', 'MISSING_HEADERS');
    }

    const headerLine = lines[0];
    if (!headerLine.trim()) {
      throw new CSVError('Header row is empty', 'MISSING_HEADERS');
    }

    const headers = parseCSVLine(headerLine);
    
    const missingRequired = opts.requiredFields.filter(field => 
      !headers.some(header => header.toUpperCase() === field.toUpperCase())
    );
    
    if (missingRequired.length > 0) {
      throw new CSVError(
        `Missing required headers: ${missingRequired.join(', ')}`,
        'MISSING_HEADERS'
      );
    }

    if (lines.length === 1) {
      warnings.push('CSV contains only headers, no data rows');
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const rowErrors: string[] = [];

      try {
        if (!line.trim() && opts.skipEmptyRows) {
          continue;
        }

        const values = parseCSVLine(line);
        
        if (values.length !== headers.length) {
          rowErrors.push(`Column count mismatch: expected ${headers.length}, got ${values.length}`);
        }

        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        const missingRequiredValues = opts.requiredFields.filter(field => {
          const headerMatch = headers.find(h => h.toUpperCase() === field.toUpperCase());
          return headerMatch && !rowData[headerMatch]?.trim();
        });

        if (missingRequiredValues.length > 0 && !opts.allowMissingFields) {
          rowErrors.push(`Missing required field values: ${missingRequiredValues.join(', ')}`);
        }

        if (rowErrors.length > 0) {
          invalidProducts.push({ row: i + 1, data: rowData, errors: rowErrors });
        } else {
          try {
            const product = parseRowToProduct(rowData, headers, opts);
            validProducts.push(product);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            invalidProducts.push({ 
              row: i + 1, 
              data: rowData, 
              errors: [errorMessage] 
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Row parsing error';
        invalidProducts.push({ 
          row: i + 1, 
          data: line, 
          errors: [errorMessage] 
        });
      }
    }

    if (validProducts.length > 10000) {
      warnings.push('Large dataset detected - consider implementing pagination for better performance');
    }

    if (invalidProducts.length > validProducts.length * 0.1) {
      warnings.push('High error rate detected - please review CSV format and data quality');
    }

  } catch (error) {
    if (error instanceof CSVError) {
      throw error;
    }
    throw new ParseError(`Failed to parse CSV content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const processingTime = performance.now() - startTime;

  return {
    isValid: errors.length === 0 && invalidProducts.length === 0,
    errors,
    warnings,
    validProducts,
    invalidProducts,
    summary: {
      totalRows: validProducts.length + invalidProducts.length,
      validRows: validProducts.length,
      invalidRows: invalidProducts.length,
      processingTime
    }
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  result.push(current.trim());
  return result;
}

function parseRowToProduct(rowData: Record<string, string>, headers: string[], options: CSVValidationOptions): Product {
  const parseJSON = (value: string, fallback: unknown = null, fieldName?: string) => {
    if (!value || !value.trim()) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      if (options.validateDataTypes && fieldName) {
        throw new ValidationError(`Invalid JSON format in field ${fieldName}`, fieldName, value);
      }
      return fallback;
    }
  };

  const parseNumber = (value: string, fallback: number = 0, fieldName?: string): number => {
    if (!value || !value.trim()) return fallback;
    const num = parseFloat(value);
    if (isNaN(num)) {
      if (options.validateDataTypes && fieldName) {
        throw new ValidationError(`Invalid number format in field ${fieldName}`, fieldName, value);
      }
      return fallback;
    }
    return num;
  };

  const parseBoolean = (value: string): boolean => {
    if (!value) return false;
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  };

  const getFieldValue = (fieldName: string): string => {
    const header = headers.find(h => h.toUpperCase() === fieldName.toUpperCase());
    return header ? rowData[header] || '' : '';
  };

  try {
    const priceRangeData = parseJSON(getFieldValue('PRICE_RANGE_V2'), { min: 0, max: 0 }, 'PRICE_RANGE_V2');
    const images = parseJSON(getFieldValue('IMAGES'), [], 'IMAGES');
    const tags = parseJSON(getFieldValue('TAGS'), [], 'TAGS');

    return {
      id: getFieldValue('ID') || '',
      title: getFieldValue('TITLE') || '',
      handle: getFieldValue('HANDLE') || '',
      vendor: getFieldValue('VENDOR') || '',
      productType: getFieldValue('PRODUCT_TYPE') || '',
      description: getFieldValue('DESCRIPTION') || '',
      descriptionHtml: getFieldValue('DESCRIPTION_HTML') || getFieldValue('BODY_HTML') || '',
      status: getFieldValue('STATUS') || 'draft',
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
      featuredImage: getFieldValue('FEATURED_IMAGE') || '',
      priceRange: {
        min: parseNumber(priceRangeData?.min?.toString(), 0, 'PRICE_RANGE_V2.min'),
        max: parseNumber(priceRangeData?.max?.toString(), 0, 'PRICE_RANGE_V2.max')
      },
      totalVariants: parseNumber(getFieldValue('TOTAL_VARIANTS'), 1, 'TOTAL_VARIANTS'),
      totalInventory: parseNumber(getFieldValue('TOTAL_INVENTORY'), 0, 'TOTAL_INVENTORY'),
      isGiftCard: parseBoolean(getFieldValue('IS_GIFT_CARD')),
      hasOutOfStockVariants: parseBoolean(getFieldValue('HAS_OUT_OF_STOCK_VARIANTS')),
      createdAt: getFieldValue('CREATED_AT') || '',
      updatedAt: getFieldValue('UPDATED_AT') || '',
      publishedAt: getFieldValue('PUBLISHED_AT') || '',
      onlineStoreUrl: getFieldValue('ONLINE_STORE_URL') || '',
      adminGraphqlApiId: getFieldValue('ADMIN_GRAPHQL_API_ID') || ''
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ParseError(`Failed to parse product data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getValidationSummary(result: ValidationResult): string {
  const { summary, errors, warnings } = result;
  const successRate = summary.totalRows > 0 ? (summary.validRows / summary.totalRows * 100).toFixed(1) : '0';
  
  let message = `Processed ${summary.totalRows} rows in ${summary.processingTime.toFixed(2)}ms. `;
  message += `Success rate: ${successRate}% (${summary.validRows} valid, ${summary.invalidRows} invalid).`;
  
  if (errors.length > 0) {
    message += ` Errors: ${errors.length}.`;
  }
  
  if (warnings.length > 0) {
    message += ` Warnings: ${warnings.length}.`;
  }
  
  return message;
}

export function sanitizeProduct(product: Product): Product {
  return {
    ...product,
    id: product.id.trim(),
    title: product.title.trim(),
    description: product.description.trim(),
    vendor: product.vendor.trim(),
    handle: product.handle.trim().toLowerCase(),
    productType: product.productType.trim(),
    tags: product.tags.map(tag => tag.trim()).filter(Boolean),
    status: product.status.trim().toLowerCase(),
    priceRange: {
      min: Math.max(0, product.priceRange.min),
      max: Math.max(0, product.priceRange.max)
    }
  };
}
