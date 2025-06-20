import { useMemo } from 'react';
import { Product } from '../types/product';

export interface AutocompleteSuggestion {
  value: string;
  label: string;
  type: 'title' | 'vendor' | 'tag' | 'productType';
}

export function useAutocomplete(products: Product[]): AutocompleteSuggestion[] {
  return useMemo(() => {
    if (!products.length) return [];

    const suggestions: AutocompleteSuggestion[] = [];
    const seen = new Set<string>();

    const addSuggestion = (value: string, type: AutocompleteSuggestion['type']) => {
      if (!value || value.length < 2) return;
      const cleanValue = value.trim();
      const key = `${type}:${cleanValue.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          value: cleanValue,
          label: cleanValue,
          type
        });
      }
    };

    const vendors = new Set<string>();
    products.forEach(product => {
      if (product.vendor && product.vendor.trim()) {
        vendors.add(product.vendor.trim());
      }
    });
    Array.from(vendors).slice(0, 15).forEach(vendor => {
      addSuggestion(vendor, 'vendor');
    });

    const productTypes = new Set<string>();
    products.forEach(product => {
      if (product.productType && product.productType.trim()) {
        productTypes.add(product.productType.trim());
      }
    });
    Array.from(productTypes).slice(0, 15).forEach(type => {
      addSuggestion(type, 'productType');
    });

    const tags = new Set<string>();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tags.add(tag.trim());
          }
        });
      }
    });
    Array.from(tags).slice(0, 20).forEach(tag => {
      addSuggestion(tag, 'tag');
    });

    const titles = products
      .filter(product => product.title && product.title.trim())
      .sort((a, b) => {
        const aInventory = a.totalInventory || 0;
        const bInventory = b.totalInventory || 0;
        if (aInventory !== bInventory) {
          return bInventory - aInventory;
        }
        return a.title.length - b.title.length;
      })
      .slice(0, 30)
      .map(product => product.title.trim());

    titles.forEach(title => {
      addSuggestion(title, 'title');
    });

    const shuffled = [...suggestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 50);
  }, [products]);
}
