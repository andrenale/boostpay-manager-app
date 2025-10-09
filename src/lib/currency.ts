/**
 * Utility functions for currency formatting in Brazilian Real (BRL)
 */

/**
 * Formats a number or string value to Brazilian currency format
 * @param value - The value to format (number, string, or undefined)
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') {
    return 'R$ 0,00';
  }

  let numericValue: number;

  // If it's a string, clean it and convert to number
  if (typeof value === 'string') {
    // Remove all non-numeric characters except comma and dot
    const cleanValue = value.replace(/[^\d,.]/g, '');
    
    // Handle different formats
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      // Format like "1.234,56" - remove dots, replace comma with dot
      numericValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
    } else if (cleanValue.includes(',')) {
      // Format like "1234,56" - replace comma with dot
      numericValue = parseFloat(cleanValue.replace(',', '.'));
    } else {
      // Format like "1234" or "1234.56"
      numericValue = parseFloat(cleanValue);
    }
  } else {
    numericValue = value;
  }

  // Check if the conversion resulted in a valid number
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  // Format to Brazilian currency
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Parses a Brazilian currency string to a number
 * @param currencyString - String like "R$ 1.234,56"
 * @returns Numeric value (e.g., 1234.56)
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and spaces
  const cleanValue = currencyString.replace(/[R$\s]/g, '');
  
  // Handle Brazilian format: replace dots with empty string, comma with dot
  const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats currency input as user types (real-time formatting)
 * @param value - Current input value
 * @returns Formatted value for input field
 */
export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Convert to cents and then to currency
  const cents = parseInt(digits);
  const reais = cents / 100;
  
  return formatCurrency(reais).replace('R$ ', '');
}