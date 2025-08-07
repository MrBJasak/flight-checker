export interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
}

export interface FormData {
  email: string;
  radius: number;
  location?: LocationData;
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
