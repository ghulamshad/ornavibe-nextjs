/** Format amount with currency symbol. Default symbol is Rs. (PKR). */
export function formatCurrency(amount: number | string, symbol: string = 'Rs.'): string {
  return `${symbol}${Number(amount).toFixed(2)}`;
}
