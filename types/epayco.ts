export interface EpaycoData {
  amount: number;
  tax: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  document: string;
  document_type: string;
  invoice: string;
}

export interface EpaycoHandler {
  checkout: {
    configure: (config: {
      key: string;
      test: boolean;
      external: string;
      name: string;
      description: string;
      currency: string;
      amount: number;
      tax_base: number;
      tax: number;
      country: string;
      lang: string;
      confirmation: string;
      response: string;
      email_billing: string;
      name_billing: string;
      address_billing: string;
      type_doc_billing: string;
      mobilephone_billing: string;
      number_doc_billing: string;
    }) => {
      open: () => void;
    };
  };
}

declare global {
  interface Window {
    ePayco?: EpaycoHandler;
  }
}
