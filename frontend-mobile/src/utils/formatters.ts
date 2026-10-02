/**
 * Formats a numeric price into INR currency (e.g. ₹1,299)
 */
export function formatPrice(price: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    // Fallback if Intl is not available on older engines
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  }
}

/**
 * Calculates discount percentage if original price is greater than current price
 */
export function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
