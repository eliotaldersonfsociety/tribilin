'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@radix-ui/react-label";

interface PaymentMethodProps {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  isProcessing: boolean;
  userSaldo: number | null;
  isSignedIn: boolean;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethod,
  setPaymentMethod,
  isProcessing,
  userSaldo,
  isSignedIn,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Pago</h2>
      <p className="text-sm text-gray-600 mb-4">
        Todas las transacciones son seguras y están encriptadas.
      </p>

      <RadioGroup
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="mb-8 space-y-2"
        disabled={isProcessing}
      >
        {/* Opción Saldo */}
        {isSignedIn && (
          <Label
            htmlFor="saldo"
            className={`border rounded-md p-4 flex justify-between items-center cursor-pointer transition-colors duration-150 ${
              paymentMethod === 'saldo'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem id="saldo" value="saldo" />
              <span>
                Saldo Disponible:{' '}
                <span className="font-semibold">
                  ${userSaldo?.toFixed(2) ?? '0.00'}
                </span>
              </span>
            </div>
            <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">
              $
            </div>
          </Label>
        )}

        {/* Opción ePayco */}
        <Label
          htmlFor="epayco"
          className={`border rounded-md p-4 flex justify-between items-center cursor-pointer transition-colors duration-150 ${
            paymentMethod === 'epayco'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem id="epayco" value="epayco" />
            <div>
              <span>Pagar con ePayco</span>
              <span className="text-xs block text-gray-500">
                (Tarjetas, PSE, Nequi, etc.)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <img src="/p4.svg" alt="Visa" className="h-5" />
            <img src="/p3.svg" alt="Mastercard" className="h-5" />
            <img src="/p2.svg" alt="American Express" className="h-5" />
            <img src="/p1.svg" alt="PSE" className="h-5" />
            <span className="text-xs text-gray-500 ml-1">+ Más</span>
          </div>
        </Label>
      </RadioGroup>

      {/* Paneles contextuales */}
      {paymentMethod === 'saldo' && isSignedIn && (
        <div className="border-t-0 rounded-b-md px-4 py-2 bg-gray-50 text-sm text-gray-600 -mt-2">
          Se usará tu saldo disponible. Asegúrate de tener suficiente.
        </div>
      )}
      {paymentMethod === 'epayco' && (
        <div className="border-t-0 rounded-b-md px-4 py-2 bg-gray-50 text-sm text-gray-600 -mt-2">
          Serás redirigido a la pasarela segura de ePayco para completar tu pago.
        </div>
      )}
    </div>
  );
};
