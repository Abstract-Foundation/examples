"use client";

/**
 * Detects the user's country to provide a better UX.
 * 
 * The widget asks for the user's country, so we load their country.
 * We also load their native currency to show them on the input field.
 * 
 * Detection strategy:
 * 1. First try server-side detection via Vercel geo headers (most accurate)
 * 2. Fall back to client-side timezone detection (less accurate but works offline) 
 * 3. Finally default to US if all else fails (ensures app always works)
 */

import { useState, useEffect } from 'react';

export interface GeoLocation {
  country?: string; // ISO country code like 'US', 'GB', 'DE'
  region?: string; // State/province if available
  city?: string; // City if available  
  detected: boolean; // Whether we successfully detected their location (vs fallback)
}

export function useGeoLocation(): GeoLocation {
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({
    detected: false, // Start as undetected
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Strategy 1: Try server-side geo detection first
        // This uses Vercel's geo headers which are very accurate
        const response = await fetch('/api/geo');
        if (response.ok) {
          const data = await response.json();
          if (data.country) {
            setGeoLocation({
              country: data.country,
              region: data.region,
              city: data.city,
              detected: true, // Successfully detected
            });
            return;
          }
        }

        // Strategy 2: Fall back to client-side timezone detection
        // Less accurate but works when server-side detection fails
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryFromTimezone = getCountryFromTimezone(timezone);
        
        if (countryFromTimezone) {
          setGeoLocation({
            country: countryFromTimezone,
            detected: true,
          });
          return;
        }

        // Strategy 3: Default to US as final fallback
        // This ensures the app always works even if geo detection completely fails
        setGeoLocation({
          country: 'US',
          detected: false, // This is a fallback, not real detection
        });
      } catch (error) {
        console.warn('Failed to detect geo-location:', error);
        // Use fallback on any error
        setGeoLocation({
          country: 'US',
          detected: false,
        });
      }
    };

    detectLocation();
  }, []);

  return geoLocation;
}

// Timezone-based country detection as a fallback
// This is less accurate than IP-based detection but works when that fails
function getCountryFromTimezone(timezone: string): string | null {
  // Direct mappings for common timezones
  const timezoneCountryMap: Record<string, string> = {
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Phoenix': 'US',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'America/Montreal': 'CA',
    'Europe/London': 'GB',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Europe/Stockholm': 'SE',
    'Europe/Zurich': 'CH',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Singapore': 'SG',
    'Asia/Hong_Kong': 'HK',
    'Asia/Seoul': 'KR',
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
  };

  // Check direct mapping first
  if (timezoneCountryMap[timezone]) {
    return timezoneCountryMap[timezone];
  }

  // For unmapped timezones, try some pattern matching
  // Extract country from timezone format like "America/New_York" 
  if (timezone.startsWith('America/')) {
    // Most America/* timezones are US, with some exceptions for Canada
    if (timezone.includes('Toronto') || timezone.includes('Vancouver') || timezone.includes('Montreal')) {
      return 'CA';
    }
    return 'US'; // Default America/* to US
  }

  if (timezone.startsWith('Europe/')) {
    // Try to map European cities to countries
    const city = timezone.split('/')[1];
    const europeanCities: Record<string, string> = {
      'London': 'GB',
      'Berlin': 'DE',
      'Paris': 'FR',
      'Rome': 'IT',
      'Madrid': 'ES',
      'Amsterdam': 'NL',
      'Stockholm': 'SE',
      'Zurich': 'CH',
    };
    return europeanCities[city] || null;
  }

  // If we can't determine the country, return null
  // The calling code will fall back to US
  return null;
}