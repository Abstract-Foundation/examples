import { PaymentMethod } from '@/services/onramp';
import { PaymentMethodCard } from './PaymentMethodCard';

interface PaymentMethodSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodSelect: (paymentMethod: PaymentMethod) => void;
  onBack: () => void;
}

export function PaymentMethodSelection({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onBack,
}: PaymentMethodSelectionProps) {

  function handlePaymentMethodSelect(paymentMethod: PaymentMethod) {
    onPaymentMethodSelect(paymentMethod);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-xl font-semibold text-white">
          Select Payment Method
        </h2>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.paymentMethod}
            paymentMethod={method}
            isSelected={selectedPaymentMethod?.paymentMethod === method.paymentMethod}
            onClick={() => handlePaymentMethodSelect(method)}
          />
        ))}
      </div>
    </div>
  );
}