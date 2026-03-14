// Minimal Currency type used by formatting helpers. The previous import from
// a multi-tenant currencies service is not present in this project, so we
// declare the subset we actually need here.
export interface Currency {
  code: string;
  symbol: string;
  symbol_position?: 'before' | 'after';
  decimal_places?: number;
}

/**
 * Format an amount with currency symbol
 */
export function formatCurrency(
  amount: number | string,
  currency?: Currency | null,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }

  const showSymbol = options?.showSymbol !== false;
  const showCode = options?.showCode || false;

  if (!currency) {
    // Default formatting if no currency provided
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const decimalPlaces = currency.decimal_places || 2;
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (showCode && !showSymbol) {
    return `${formattedAmount} ${currency.code}`;
  }

  if (showSymbol) {
    if (currency.symbol_position === 'before') {
      return `${currency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currency.symbol}`;
    }
  }

  return formattedAmount;
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency?: Currency | null): string {
  if (!currency) {
    return '₹'; // Default symbol
  }
  return currency.symbol;
}

/**
 * Get currency code for display
 */
export function getCurrencyCode(currency?: Currency | null): string {
  if (!currency) {
    return 'INR'; // Default code
  }
  return currency.code;
}
