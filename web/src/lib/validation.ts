/**
 * Simple wallet address validation (0x followed by hex)
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validation for positive numbers
 */
export function isPositiveAmount(amount: number | string): boolean {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
}
