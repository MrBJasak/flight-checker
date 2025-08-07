import { FlightNotificationData } from '../types';

export const getCurrentPlaneTemplate = ({
  callsign,
  distance,
  icao,
  latitude,
  longitude,
  address,
  altitude,
}: Omit<FlightNotificationData, 'email'>): string => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 24px; text-align: center; }
            .content { padding: 24px; }
            .aircraft-info { background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Flight Checker</h1>
              <p>Nowy samolot w Twojej okolicy!</p>
            </div>
            
            <div class="content">
              <h2>Szczegóły lotu</h2>
              
              <div class="aircraft-info">
                <div class="info-row">
                  <span class="label">Znak wywoławczy:</span>
                  <span class="value">${callsign || 'Nieznany'}</span>
                </div>
                <div class="info-row">
                  <span class="label">ICAO:</span>
                  <span class="value">${icao}</span>
                </div>
                <div class="info-row">
                  <span class="label">Pozycja:</span>
                  <span class="value">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</span>
                </div>
                ${
                  altitude
                    ? `
                <div class="info-row">
                  <span class="label">Wysokość:</span>
                  <span class="value">${altitude} m</span>
                </div>
                `
                    : ''
                }
                <div class="info-row">
                  <span class="label">Odległość:</span>
                  <span class="value">${distance.toFixed(2)} km</span>
                </div>
                ${
                  address
                    ? `
                <div class="info-row">
                  <span class="label">Lokalizacja:</span>
                  <span class="value">${address}</span>
                </div>
                `
                    : ''
                }
              </div>

              <p>Samolot został wykryty w Twojej strefie monitorowania. Sprawdź szczegóły na <a href="https://flightradar24.com/data/aircraft/${icao.toLowerCase()}" target="_blank">Flightradar24</a>.</p>
            </div>
            
            <div class="footer">
              <p>Flight Checker - Powiadomienia o lotach</p>
              <p>Jeśli nie chcesz już otrzymywać powiadomień, skontaktuj się z nami.</p>
            </div>
          </div>
        </body>
        </html>
      `;

export const getCurrentPlaneText = ({
  callsign,
  distance,
  icao,
  latitude,
  longitude,
  address,
  altitude,
}: FlightNotificationData): string => `
🛩️ FLIGHT CHECKER - Nowy samolot w okolicy!

Szczegóły lotu:
• Znak wywoławczy: ${callsign || 'Nieznany'}
• ICAO: ${icao}
• Pozycja: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
${altitude ? `• Wysokość: ${altitude} m` : ''}
• Odległość: ${distance.toFixed(2)} km
${address ? `• Lokalizacja: ${address}` : ''}

Więcej informacji: https://flightradar24.com/data/aircraft/${icao.toLowerCase()}
      `;

export const getCurrentPlaneSubject = (callsign: string, icao: string): string => {
  if (!callsign && !icao) return '✈️ Nowy samolot w Twojej okolicy';

  return `✈️ Nowy samolot w Twojej okolicy: ${callsign || icao}`;
};
