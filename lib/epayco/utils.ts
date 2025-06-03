import { EPAYCO_CONFIG } from './config';

export const generateReferenceCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TX_${timestamp}_${random}`;
};

export const getEpaycoEndpointUrl = (endpoint: 'confirmation' | 'response') => {
  return EPAYCO_CONFIG[endpoint];
};

export const calculateTaxBase = (amount: number, taxRate: number = 0.19) => {
  const taxBase = amount / (1 + taxRate);
  const tax = amount - taxBase;
  return {
    taxBase: Number(taxBase.toFixed(2)),
    tax: Number(tax.toFixed(2)),
  };
};

export const formatCurrency = (amount: number, currency: string = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
