'use client';

import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface DeliveryInfo {
  name: string;
  address: string;
  phone: string;
  document: string;
  documentType: string;
}

interface DeliveryInfoFormProps {
  deliveryInfo: DeliveryInfo;
  handleDeliveryInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isProcessing: boolean;
}

export const DeliveryInfoForm: React.FC<DeliveryInfoFormProps> = ({
  deliveryInfo,
  handleDeliveryInfoChange,
  isProcessing,
}) => {
  return (
    <Accordion type="single" collapsible className="mb-6">
      <AccordionItem value="delivery">
        <AccordionTrigger className="text-xl font-semibold">
          Información de Entrega
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block mb-2">Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={deliveryInfo.name}
                onChange={handleDeliveryInfoChange}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Dirección</label>
              <input
                type="text"
                name="address"
                value={deliveryInfo.address}
                onChange={handleDeliveryInfoChange}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={deliveryInfo.phone}
                onChange={handleDeliveryInfoChange}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Tipo de Documento</label>
              <select
                name="documentType"
                value={deliveryInfo.documentType}
                onChange={handleDeliveryInfoChange}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                required
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Número de Documento</label>
              <input
                type="text"
                name="document"
                value={deliveryInfo.document}
                onChange={handleDeliveryInfoChange}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                required
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
