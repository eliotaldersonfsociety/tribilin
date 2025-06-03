export interface EpaycoHandler {
  open: (data: EpaycoData) => void;
}

export interface EpaycoData {
  //Basic info
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: number;        // Cambiado a number
  tax_base: number;      // Cambiado a number
  tax: number;          // Cambiado a number
  country: string;
  lang: string;
  external: string;
  response: string;
  confirmation: string;
  //Billing info
  name_billing: string;
  address_billing: string;
  type_doc_billing: string;
  mobilephone_billing: string;
  number_doc_billing: string;
  email_billing: string;
}

declare global {
  interface Window {
    ePayco: {
      checkout: {
        configure: (config: Epayco.CheckoutConfig) => EpaycoHandler;
      };
    };
  }
}

export as namespace Epayco;

declare namespace Epayco {
  interface CheckoutConfig {
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
  }

  interface CheckoutResponse {
    success: boolean;
    transaction_id?: string;
    reference_pol?: string;
    reference_sale?: string;
    response_message_pol?: string;
    response_code_pol?: string;
    state_pol?: string;
    value?: string;
    currency?: string;
    payment_method_type?: string;
    payment_method_name?: string;
    installments_number?: string;
    error?: string;
  }
}
