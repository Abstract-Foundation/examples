import Image from 'next/image';
import { PaymentMethod } from '@/services/onramp';
import { getPaymentMethodDisplayName, getPaymentMethodIcon } from '@/utils/deviceDetection';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onClick: () => void;
}

export function PaymentMethodCard({ paymentMethod, isSelected = false, onClick }: PaymentMethodCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
        isSelected
          ? 'border-green-500 bg-green-500/5'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium truncate">
          {getPaymentMethodDisplayName(paymentMethod)}
        </h3>
        <div className="flex-shrink-0">
          {paymentMethod.logos?.dark ? (
            <Image
              src={paymentMethod.logos.dark}
              alt={`${paymentMethod.name} logo`}
              width={32}
              height={32}
              className="rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <span className="text-lg">
                {getPaymentMethodIcon(paymentMethod)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}