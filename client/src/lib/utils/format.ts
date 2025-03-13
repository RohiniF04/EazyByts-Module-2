/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number, showCents = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a large number with abbreviations (K, M, B, T)
 */
export function formatLargeNumber(value: number): string {
  if (value < 1000) return value.toString();
  
  const tiers = [
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9, suffix: 'B' },
    { threshold: 1e6, suffix: 'M' },
    { threshold: 1e3, suffix: 'K' }
  ];
  
  for (const { threshold, suffix } of tiers) {
    if (value >= threshold) {
      return (value / threshold).toFixed(1).replace(/\.0$/, '') + suffix;
    }
  }
  
  return value.toString();
}

/**
 * Format a date to a string
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch(format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'medium':
    default:
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
