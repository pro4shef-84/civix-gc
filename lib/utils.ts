export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function formatCurrency(value?: number) {
  if (value === undefined) return 'N/A';
  return `$${value.toLocaleString()}`;
}
