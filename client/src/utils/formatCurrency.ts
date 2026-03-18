export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return 'Contact for price';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
