export const EPAYCO_CONFIG = {
  key: process.env.NEXT_PUBLIC_EPAYCO_KEY,
  test: true, // Forzar modo de pruebas
  currency: 'COP',
  country: 'CO',
  lang: 'es',
  external: 'true',
  response: `${process.env.NEXT_PUBLIC_BASE_URL}/thankyou/ok`,
  confirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/epayco/confirmation`,
  name_billing: '',
  description: '',
  title: 'Pago con ePayco',
  tax: '0',
  tax_base: '0',
  currency_info: {
    code: 'COP',
    symbol: '$',
  },
  type_doc_billing: 'CC',
  mobilephone_billing: '',
  number_doc_billing: '',
  methodsDisable: []
} as const;

export const EPAYCO_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
} as const;

export type EpaycoStatus = typeof EPAYCO_STATUS[keyof typeof EPAYCO_STATUS];

export const mapEpaycoStatus = (status: string): EpaycoStatus => {
  const statusMap: Record<string, EpaycoStatus> = {
    '1': EPAYCO_STATUS.APPROVED,
    '2': EPAYCO_STATUS.REJECTED,
    '3': EPAYCO_STATUS.PENDING,
    '4': EPAYCO_STATUS.FAILED,
    '5': EPAYCO_STATUS.EXPIRED,
    'Aceptada': EPAYCO_STATUS.APPROVED,
    'Rechazada': EPAYCO_STATUS.REJECTED,
    'Pendiente': EPAYCO_STATUS.PENDING,
    'Fallida': EPAYCO_STATUS.FAILED,
    'Expirada': EPAYCO_STATUS.EXPIRED,
  };

  return statusMap[status] || EPAYCO_STATUS.PENDING;
};
