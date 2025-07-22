import React from 'react';

interface Props {
  includeTax: boolean;
  taxRate: number;
  onIncludeTaxChange: (value: boolean) => void;
  onTaxRateChange: (value: number) => void;
  className?: string;
}

export const VATSection: React.FC<Props> = ({ includeTax, taxRate, onIncludeTaxChange, onTaxRateChange, className }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">Include VAT</label>
      <div className="flex flex-col md:flex-row items-start gap-2 md:gap-2">
        <button
          type="button"
          aria-pressed={includeTax}
          onClick={() => onIncludeTaxChange(!includeTax)}
          className={`relative inline-flex h-8 w-16 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-0 ${includeTax ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span
            className={`inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${includeTax ? 'translate-x-8' : 'translate-x-0'}`}
          />
        </button>
        {includeTax && (
          <div className="flex gap-2 mt-2 md:mt-0">
            {[0, 5, 8, 23].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onTaxRateChange(rate)}
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 cursor-pointer ${
                  taxRate === rate ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                }`}
              >
                {rate}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 