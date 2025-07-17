import { Country } from '@/services/onramp';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onClick: () => void;
}

export function CountrySelector({ selectedCountry, onClick }: CountrySelectorProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center hover:scale-105 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-lg p-1"
    >
      {selectedCountry ? (
        <img
          src={selectedCountry.flagImageUrl}
          alt={`${selectedCountry.name} flag`}
          className="w-6 h-6 object-cover rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          loading="lazy"
        />
      ) : (
        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">?</span>
        </div>
      )}
    </button>
  );
}