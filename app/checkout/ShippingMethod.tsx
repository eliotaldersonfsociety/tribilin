import React from 'react';
import { Label } from '@radix-ui/react-label';

export const ShippingMethod: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Método de envío</h2>
      <div className="border rounded-md mb-8">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Using a div as Radios not needed if only one option */}
            <div className="w-4 h-4 border border-gray-400 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div> {/* Visually checked */}
            </div>
            <Label htmlFor="standard-shipping" className="ml-1">Envío Estándar</Label>
          </div>
          <span className="font-medium text-green-600">Gratis</span>
        </div>
      </div>
    </div>
  );
};
