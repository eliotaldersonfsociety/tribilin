'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { EPAYCO_CONFIG } from '@/lib/epayco/config';

declare global {
  interface Window {
    ePayco: {

      checkout: {
        configure: (config: { key: string; test: boolean }) => {
          open: (data: any) => void;
        };
      };
    };
  }
}

export default function EpaycoScript() {
  useEffect(() => {
    const handleScriptLoad = () => {
      if (window.ePayco?.checkout) {
        console.log('ePayco inicializado correctamente');
        // Verificar la configuración
        console.log('Configuración de ePayco:', {
          key: EPAYCO_CONFIG.key ? 'Configurada' : 'No configurada',
          test: EPAYCO_CONFIG.test,
          response: EPAYCO_CONFIG.response,
          confirmation: EPAYCO_CONFIG.confirmation
        });
      } else {
        console.warn('El objeto ePayco.checkout no está disponible después de cargar el script');
      }
    };

    // Intentar inicializar si el script ya está cargado
    handleScriptLoad();

    // Agregar un listener para detectar cuando ePayco esté disponible
    const checkEpayco = setInterval(() => {
      if (window.ePayco?.checkout) {
        handleScriptLoad();
        clearInterval(checkEpayco);
      }
    }, 1000);

    return () => {
      clearInterval(checkEpayco);
    };
  }, []);

  return (
    <Script
      src="https://checkout.epayco.co/checkout.js"
      strategy="afterInteractive"
      id="epayco-script"
      onError={(e) => {
        console.error('Error al cargar el script de ePayco:', e);
      }}
      onLoad={() => {
        console.log('Script de ePayco cargado correctamente');
      }}
    />
  );
}