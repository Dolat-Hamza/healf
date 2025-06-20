export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function formatPriceRange(priceRange?: { min: number; max: number } | null): string {
  if (!priceRange || 
      typeof priceRange.min !== 'number' || 
      typeof priceRange.max !== 'number' ||
      isNaN(priceRange.min) || 
      isNaN(priceRange.max)) {
    return 'Price not available';
  }
  
  if (priceRange.min === priceRange.max) {
    return formatPrice(priceRange.min);
  }
  return `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}
