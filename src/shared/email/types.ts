export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface FlightNotificationData {
  email: string;
  callsign?: string;
  icao: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
  distance: number;
}

export interface WelcomeEmailData {
  email: string;
  latitude: number;
  longitude: number;
  radius: number;
}
