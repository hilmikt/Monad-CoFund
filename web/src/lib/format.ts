/**
 * Shortens a wallet address (e.g. 0x71A...9F2)
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formats a number as MON currency
 */
export function formatMON(amount: number): string {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} MON`;
}
