export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: paise % 100 === 0 ? 0 : 2 }).format(paise / 100);
}

export function pricePerMl(pricePaise: number, sizeMl: number): string {
  if (!sizeMl) return "";
  return `${formatINR(Math.round(pricePaise / (sizeMl * 100)) * 100)}/ml`;
}

export function discountPercent(pricePaise: number, compareAtPaise?: number | null): number {
  if (!compareAtPaise || compareAtPaise <= pricePaise) return 0;
  return Math.round((1 - pricePaise / compareAtPaise) * 100);
}
