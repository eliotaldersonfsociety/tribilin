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

declare global {
  interface Window {
    ePayco?: {
      checkout: {
        configure: (config: Epayco.CheckoutConfig) => {
          open: (config?: Epayco.CheckoutConfig) => void;
        };
      };
    };
  }
}

export = Epayco;
export as namespace Epayco;