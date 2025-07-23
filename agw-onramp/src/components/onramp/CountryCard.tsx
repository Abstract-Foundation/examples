import { Country } from '@/services/onramp';

interface CountryCardProps {
  country: Country;
  isSelected?: boolean;
  onClick: () => void;
}

export function CountryCard({ country, isSelected = false, onClick }: CountryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
        isSelected
          ? 'border-green-500 bg-green-500/5'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <img
            src={country.flagImageUrl}
            alt={`${country.name} flag`}
            className="w-8 h-6 object-cover rounded"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium truncate">
              {country.name}
            </h3>
            <span className="text-gray-400 text-sm font-mono group-hover:text-green-400 group-hover:font-bold transition-all duration-300 group-hover:tracking-wide">
              {country.countryCode}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}