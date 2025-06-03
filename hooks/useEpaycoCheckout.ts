import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { EPAYCO_CONFIG } from '@/lib/epayco/config';
import type { EpaycoHandler, EpaycoData } from '@/types/epayco';

export const useEpaycoCheckout = () => {
  const initializeCheckout = useCallback(
    async (orderData: {
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
    }) => {
      try {
        if (!window.ePayco) {
          throw new Error('ePayco no está inicializado');
        }

        if (!EPAYCO_CONFIG.key) {
          throw new Error('La clave de ePayco no está configurada');
        }

        const handler = window.ePayco.checkout.configure({
          key: EPAYCO_CONFIG.key,
          test: EPAYCO_CONFIG.test,
          external: 'false',
          name: orderData.name,
          description: orderData.description,
          currency: 'cop',
          amount: orderData.amount,
          tax_base: orderData.amount - orderData.tax,
          tax: orderData.tax,
          country: 'co',
          lang: 'es',
          confirmation: EPAYCO_CONFIG.confirmation,
          response: EPAYCO_CONFIG.response,
          email_billing: orderData.email,
          name_billing: orderData.name,
          address_billing: orderData.address,
          type_doc_billing: orderData.document_type,
          mobilephone_billing: orderData.phone,
          number_doc_billing: orderData.document
        });

        const data: EpaycoData = {
          name: orderData.name,
          description: orderData.description,
          invoice: orderData.invoice,
          currency: 'cop',
          amount: orderData.amount,
          tax_base: orderData.amount - orderData.tax,
          tax: orderData.tax,
          country: 'co',
          lang: 'es',
          external: 'false',
          response: EPAYCO_CONFIG.response,
          confirmation: EPAYCO_CONFIG.confirmation,
          name_billing: orderData.name,
          address_billing: orderData.address,
          type_doc_billing: orderData.document_type,
          mobilephone_billing: orderData.phone,
          number_doc_billing: orderData.document,
          email_billing: orderData.email
        };

        handler.open(data);

        return true;
      } catch (error) {
        console.error('Error al inicializar el checkout de ePayco:', error);
        toast.error('Error al inicializar el pago. Por favor, intente nuevamente.');
        return false;
      }
    },
    []
  );

  return {
    initializeCheckout
  };
};
