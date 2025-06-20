export class CSVError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CSVError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ParseError extends Error {
  constructor(
    message: string,
    public line?: number,
    public column?: number
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorType: 'csv' | 'validation' | 'parse' | 'network' | 'unknown';
  retryable: boolean;
}

export function createErrorState(error: Error): ErrorState {
  let errorType: ErrorState['errorType'] = 'unknown';
  let retryable = false;

  if (error instanceof CSVError) {
    errorType = 'csv';
    retryable = error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT';
  } else if (error instanceof ValidationError) {
    errorType = 'validation';
    retryable = false;
  } else if (error instanceof ParseError) {
    errorType = 'parse';
    retryable = false;
  } else if (error.message.includes('fetch') || error.message.includes('network')) {
    errorType = 'network';
    retryable = true;
  }

  return {
    hasError: true,
    error,
    errorType,
    retryable
  };
}

export function getErrorMessage(error: Error): string {
  if (error instanceof CSVError) {
    switch (error.code) {
      case 'EMPTY_FILE':
        return 'The CSV file is empty or contains no valid data.';
      case 'INVALID_FORMAT':
        return 'The file format is not valid. Please ensure it\'s a proper CSV file.';
      case 'MISSING_HEADERS':
        return 'The CSV file is missing required column headers.';
      case 'NETWORK_ERROR':
        return 'Failed to load the CSV file. Please check your connection and try again.';
      case 'FILE_TOO_LARGE':
        return 'The CSV file is too large to process. Please use a smaller file.';
      default:
        return error.message;
    }
  }

  if (error instanceof ValidationError) {
    return `Invalid data in field "${error.field}": ${error.message}`;
  }

  if (error instanceof ParseError) {
    const location = error.line ? ` at line ${error.line}` : '';
    return `Parse error${location}: ${error.message}`;
  }

  return error.message || 'An unexpected error occurred.';
}

export function getErrorSuggestions(error: Error): string[] {
  if (error instanceof CSVError) {
    switch (error.code) {
      case 'EMPTY_FILE':
        return [
          'Check that the CSV file contains data',
          'Ensure the file was uploaded correctly',
          'Try uploading a different CSV file'
        ];
      case 'INVALID_FORMAT':
        return [
          'Ensure the file has a .csv extension',
          'Check that columns are separated by commas',
          'Verify the file is not corrupted'
        ];
      case 'MISSING_HEADERS':
        return [
          'Add the required column headers to your CSV',
          'Check the sample CSV format for reference',
          'Ensure headers match the expected format'
        ];
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ];
      case 'FILE_TOO_LARGE':
        return [
          'Split the CSV into smaller files',
          'Remove unnecessary columns',
          'Contact support for large file processing'
        ];
    }
  }

  if (error instanceof ValidationError) {
    return [
      'Check the data format in the CSV file',
      'Ensure all required fields are present',
      'Verify data types match expected formats'
    ];
  }

  if (error instanceof ParseError) {
    return [
      'Check for malformed CSV syntax',
      'Ensure quotes are properly escaped',
      'Verify line endings are consistent'
    ];
  }

  return [
    'Try refreshing the page',
    'Check your internet connection',
    'Contact support if the problem persists'
  ];
}

export function isRetryableError(error: Error): boolean {
  return createErrorState(error).retryable;
}

export function logError(error: Error, context?: Record<string, unknown>): void {
  console.error('Application Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  });
}
