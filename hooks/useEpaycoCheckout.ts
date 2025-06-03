import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { EPAYCO_CONFIG } from '@/lib/epayco/config';

interface EpaycoHandler {
  open: (data: EpaycoData) => void;
}

interface EpaycoData {
  //Basic info
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: string;
  tax_base: string;
  tax: string;
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
        configure: (config: { key: string; test: boolean }) => EpaycoHandler;
      };
    };
  }
}

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
      documentType: string;
      invoice: string;
    }) => {
      return new Promise((resolve, reject) => {
        try {
          if (!window.ePayco?.checkout) {
            throw new Error('El objeto ePayco.checkout no está disponible');
          }

          if (!EPAYCO_CONFIG.key) {
            throw new Error('La llave de ePayco no está configurada');
          }

          // Configuración inicial según documentación
          const handler = window.ePayco.checkout.configure({
            key: EPAYCO_CONFIG.key,
            test: EPAYCO_CONFIG.test
          });

          // Datos de la transacción según documentación
          const data = {
            name: orderData.name.trim(),
            description: orderData.description.trim(),
            invoice: orderData.invoice,
            currency: EPAYCO_CONFIG.currency,
            amount: orderData.amount.toString(),
            tax_base: (orderData.amount - orderData.tax).toString(),
            tax: orderData.tax.toString(),
            country: EPAYCO_CONFIG.country,
            lang: EPAYCO_CONFIG.lang,
            external: EPAYCO_CONFIG.external,
            response: EPAYCO_CONFIG.response,
            confirmation: EPAYCO_CONFIG.confirmation,
            name_billing: orderData.name.trim(),
            address_billing: orderData.address.trim(),
            type_doc_billing: orderData.documentType.toUpperCase(),
            mobilephone_billing: orderData.phone.trim(),
            number_doc_billing: orderData.document.trim(),
            email_billing: orderData.email.toLowerCase().trim()
          };

          // Agregar evento para detectar cierre del modal
          const handleCloseModal = (event: Event) => {
            if (event.type === 'epayco_close_modal') {
              window.removeEventListener('epayco_close_modal', handleCloseModal);
              resolve(false);
            }
          };
          window.addEventListener('epayco_close_modal', handleCloseModal);

          // Abrir el checkout según documentación
          handler.open(data);
          resolve(true);
        } catch (error) {
          console.error('Error al inicializar el checkout de ePayco:', error);
          toast.error('Error al iniciar el proceso de pago. Por favor, intenta de nuevo.');
          reject(error);
        }
      });
    },
    []
  );

  return { initializeCheckout };
};