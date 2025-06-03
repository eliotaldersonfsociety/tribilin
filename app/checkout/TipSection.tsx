import React from 'react';

interface TipSectionProps {
  totalPrice: number;
  tipAmount: string | null;
  setTipAmount: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TipSection: React.FC<TipSectionProps> = ({ totalPrice, tipAmount, setTipAmount }) => {
  const tipPercentages = ['5', '10', '20', 'none'];

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-bold mb-4">
        ¿Agregar propina? <span className="text-base font-normal text-gray-500">(Opcional)</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {tipPercentages.map((perc) => (
          <button
            key={perc}
            className={`flex flex-col items-center justify-center h-auto py-3 text-center transition-colors duration-150 rounded-md border ${
              tipAmount === perc ? 'bg-blue-500 text-white border-blue-500 ring-2 ring-offset-1 ring-blue-500' : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => setTipAmount(tipAmount === perc ? null : perc)}
          >
            {perc !== 'none' ? (
              <>
                <span className="text-sm font-medium">{perc}%</span>
                <span className="text-xs text-gray-500">${(totalPrice * (parseInt(perc) / 100)).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-medium">Ninguna</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs mb-6 text-center text-gray-500">
        Las propinas son voluntarias y muy apreciadas por el equipo.
      </p>
    </div>
  );
};
