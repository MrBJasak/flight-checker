export interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
}

export interface AircraftFilter {
  manufacturername?: string;
  model?: string;
  typecode?: string;
  operator?: string;
}

export interface FormData {
  email: string;
  radius: number;
  location?: LocationData;
  aircraftFilters?: AircraftFilter[];
}

export interface LocationInfo {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    country?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
  };
}
