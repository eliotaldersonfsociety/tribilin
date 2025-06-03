// lib/currency.ts
export async function getExchangeRates() {
    const res = await fetch('http://localhost:3000/api/exchange-rates');
    return res.json();
  }
  
  export function formatCurrency(value: number, currency: string, locale: string) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }