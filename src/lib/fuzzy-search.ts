import { Product } from '@/types/product';

export interface FuzzySearchOptions {
  threshold: number;
  includeScore: boolean;
  keys: (keyof Product)[];
}

export interface FuzzySearchResult {
  item: Product;
  score: number;
  matches: Array<{
    key: string;
    value: string;
    indices: number[][];
  }>;
}

export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

export function calculateSimilarityScore(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1 - (queryLower.length / textLower.length) * 0.1;
  }
  
  const distance = calculateLevenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  
  return Math.max(0, 1 - distance / maxLength);
}

export function findMatchIndices(query: string, text: string): number[][] {
  const indices: number[][] = [];
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let startIndex = 0;
  let index = textLower.indexOf(queryLower, startIndex);
  
  while (index !== -1) {
    indices.push([index, index + queryLower.length - 1]);
    startIndex = index + 1;
    index = textLower.indexOf(queryLower, startIndex);
  }
  
  return indices;
}

export function fuzzySearch(
  products: Product[],
  query: string,
  options: Partial<FuzzySearchOptions> = {}
): FuzzySearchResult[] {
  const {
    threshold = 0.3,
    keys = ['title', 'description', 'vendor', 'productType']
  } = options;

  if (!query.trim()) {
    return products.map(product => ({
      item: product,
      score: 1,
      matches: []
    }));
  }

  const results: FuzzySearchResult[] = [];

  for (const product of products) {
    let bestScore = 0;
    const matches: FuzzySearchResult['matches'] = [];

    for (const key of keys) {
      const value = String(product[key] || '');
      const score = calculateSimilarityScore(query, value);
      
      if (score > bestScore) {
        bestScore = score;
      }
      
      if (score > threshold) {
        const indices = findMatchIndices(query, value);
        if (indices.length > 0) {
          matches.push({
            key: String(key),
            value,
            indices
          });
        }
      }
    }

    if (bestScore >= threshold) {
      results.push({
        item: product,
        score: bestScore,
        matches
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function highlightMatches(text: string, indices: number[][]): string {
  if (!indices.length) return text;
  
  let result = '';
  let lastIndex = 0;
  
  for (const [start, end] of indices) {
    result += text.slice(lastIndex, start);
    result += `<mark class="bg-yellow-200 font-medium">${text.slice(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  }
  
  result += text.slice(lastIndex);
  return result;
}
