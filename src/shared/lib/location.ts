import { LocationInfo } from '../types';

export const getLocationInfo = async (lat: number, lon: number): Promise<LocationInfo | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FlightChecker/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Nie udało się pobrać informacji o lokalizacji');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Błąd podczas pobierania informacji o lokalizacji:', error);
    return null;
  }
};

export const formatAddress = (locationInfo: LocationInfo): string => {
  const { address } = locationInfo;
  const parts = [];

  if (address.road) {
    let street = address.road;
    if (address.house_number) {
      street += ` ${address.house_number}`;
    }
    parts.push(street);
  }

  if (address.city) {
    parts.push(address.city);
  }

  if (address.postcode) {
    parts.push(address.postcode);
  }

  if (address.country) {
    parts.push(address.country);
  }

  return parts.join(', ') || locationInfo.display_name;
};
