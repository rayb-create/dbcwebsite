import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/products';

export function formatPrice(amountInDzd: number, currency: Currency = 'DZD', isArabic: boolean = false): string {
  const rawNum = typeof amountInDzd === 'number' ? amountInDzd : Number(amountInDzd);
  const safeAmount = isNaN(rawNum) || !isFinite(rawNum) ? 0 : rawNum;
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
