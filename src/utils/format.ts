import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/products';

/**
 * Safely parses any numeric price or amount from numbers or numeric strings
 * (e.g. 1500, "1500", "1,500", "1 500", "1,500 DA", "1500 DZD", "500 د.ج").
 * Returns null if the value is missing, empty, or unparseable.
 * Does NOT mask values with || 0.
 */
export function parseNumericPrice(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Remove currency letters/symbols (DA, DZD, €, $, د.ج) and extra spaces
    const cleaned = trimmed
      .replace(/[^\d.,-]/g, '')
      .replace(/\s+/g, '');

    if (!cleaned) return null;

    // Handle thousands separators vs decimal separators:
    // e.g. "1,500" has comma followed by 3 digits -> thousands separator
    // e.g. "1500,50" has comma followed by 2 digits -> decimal separator
    let normalized = cleaned;
    const partsComma = cleaned.split(',');
    if (partsComma.length === 2 && partsComma[1].length === 3 && !cleaned.includes('.')) {
      normalized = cleaned.replace(/,/g, '');
    } else if (partsComma.length === 2 && partsComma[1].length <= 2 && !cleaned.includes('.')) {
      normalized = cleaned.replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }

    const parsed = parseFloat(normalized);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  }
  return null;
}

export function formatPrice(amountInDzd: number, currency: Currency = 'DZD', isArabic: boolean = false): string {
  const parsed = parseNumericPrice(amountInDzd);
  const safeAmount = parsed !== null ? parsed : 0;
  const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.DZD;
  const converted = safeAmount * (rateInfo?.rate || 1);

  if (currency === 'DZD') {
    const formatted = Math.round(converted).toLocaleString('fr-DZ');
    return isArabic ? `${formatted} د.ج` : `${formatted} DZD`;
  }
  if (currency === 'EUR') {
    return `${Math.round(converted).toLocaleString()} €`;
  }
  if (currency === 'GBP') {
    return `£${Math.round(converted).toLocaleString()}`;
  }
  return `$${Math.round(converted).toLocaleString()}`;
}

export function generateOrderNumber(): string {
  const prefix = 'DBC-DZ';
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomPart}`;
}
