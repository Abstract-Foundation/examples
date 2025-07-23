import { PaymentMethod } from '@/services/onramp';
import { getPaymentMethodDisplayName } from '@/utils/deviceDetection';

interface PaymentRouteSelectorProps {
  selectedPaymentMethod: PaymentMethod | null;
  selectedProvider: string | null;
  onClick: () => void;
}

export function PaymentRouteSelector({ 
  selectedPaymentMethod, 
  selectedProvider, 
  onClick 
}: PaymentRouteSelectorProps) {
  const displayText = selectedPaymentMethod && selectedProvider
    ? `${getPaymentMethodDisplayName(selectedPaymentMethod)} via ${selectedProvider}`
    : selectedPaymentMethod
    ? `${getPaymentMethodDisplayName(selectedPaymentMethod)} via Provider`
    : 'Select Payment Route';

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">
          {displayText}
        </span>
        <svg 
          className="w-4 h-4 text-gray-400 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}