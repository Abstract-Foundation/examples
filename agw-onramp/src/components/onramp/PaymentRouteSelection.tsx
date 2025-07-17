import { PaymentMethod, Quote } from '@/services/onramp';
import { PaymentMethodCard } from './PaymentMethodCard';

interface PaymentRouteSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  selectedProvider: string | null;
  quotes: Quote[];
  onPaymentMethodSelect: (paymentMethod: PaymentMethod) => void;
  onProviderClick: () => void;
  onBack: () => void;
}

export function PaymentRouteSelection({
  paymentMethods,
  selectedPaymentMethod,
  selectedProvider,
  quotes,
  onPaymentMethodSelect,
  onProviderClick,
  onBack,
}: PaymentRouteSelectionProps) {

  function handlePaymentMethodSelect(paymentMethod: PaymentMethod) {
    onPaymentMethodSelect(paymentMethod);
    onBack();
  }

  // Get the best quote for the selected provider (if available)
  const providerQuote = selectedProvider 
    ? quotes.find(q => q.serviceProvider === selectedProvider)
    : null;

  const feePercentage = providerQuote 
    ? ((providerQuote.totalFee / providerQuote.sourceAmountWithoutFees) * 100).toFixed(1)
    : null;

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
          Select Payment Route
        </h2>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      {/* Provider Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          🏢 Provider
        </label>
        <button
          onClick={onProviderClick}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {selectedProvider?.charAt(0) || '?'}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-medium">
                  {selectedProvider || 'Select Provider'}
                </h3>
                {feePercentage && (
                  <p className="text-gray-400 text-sm">
                    {feePercentage}% fees
                  </p>
                )}
              </div>
            </div>
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Payment Methods Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          💳 Payment Methods
        </label>
        <div className="space-y-2">
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
    </div>
  );
}