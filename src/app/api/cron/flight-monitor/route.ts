/**
 * Vercel Cron Job endpoint dla monitorowania samolotów - BEZ AUTORYZACJI
 * Wywołuje się automatycznie przez cron-job.org
 * Sprawdza samoloty bezpośrednio w endpoincie używając OpenSky API
 */

import axios from 'axios';
import { NextResponse } from 'next/server';
import { emailService } from '../../../../shared/email/email';
import { getBoundingBox, haversine } from '../../../../shared/lib/geo';
import { UserConfigService } from '../../../../shared/services/userConfigService';

// Przechowywanie ostatnio widzianych samolotów w pamięci (w produkcji użyj Redis/Database)
const lastSeenPlanes = new Map<string, number>();

// Funkcja do czyszczenia wygasłych wpisów z cache
function clearExpiredCache(expiryMs: number) {
  const now = Date.now();
  const expired = [];

  for (const [key, timestamp] of lastSeenPlanes.entries()) {
    if (now - timestamp > expiryMs) {
      expired.push(key);
    }
  }

  expired.forEach((key) => lastSeenPlanes.delete(key));
}

// Funkcja do wywołania OpenSky API z retry logic
async function fetchOpenSkyData(lamin: number, lamax: number, lomin: number, lomax: number, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get('https://opensky-network.org/api/states/all', {
        params: { lamin, lamax, lomin, lomax },
        timeout: 15000, // Krótszy timeout - 15s
        headers: {
          'User-Agent': 'FlightChecker/1.0',
        },
      });

      return response.data?.states || [];
    } catch (error) {
      if (attempt === retries) {
        // Ostatnia próba - rzuć błąd
        throw error;
      }

      // Pauza przed kolejną próbą (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function POST() {
  try {
    const expiryMs = parseInt(process.env.FLIGHT_MONITOR_EXPIRY || '3600000'); // 1 godzina domyślnie

    // Pobierz wszystkich aktywnych użytkowników z bazy danych
    const users = await UserConfigService.getAllActiveUsers();

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Brak aktywnych użytkowników',
        timestamp: new Date().toISOString(),
        totalUsers: 0,
        totalPlanes: 0,
        newPlanes: 0,
      });
    }

    let totalPlanes = 0;
    let totalNewPlanes = 0;
    const userResults = [];
    const now = Date.now();

    // Sprawdź samoloty dla każdego użytkownika
    for (const user of users) {
      // Pobierz bounding box dla użytkownika
      const { lamin, lamax, lomin, lomax } = getBoundingBox(user.latitude, user.longitude, user.radius);

      try {
        // Wywołaj OpenSky API z retry logic
        const planes = await fetchOpenSkyData(lamin, lamax, lomin, lomax);
        let userPlanes = 0;
        let userNewPlanes = 0;

        for (const plane of planes) {
          const icao = plane[0];
          const callsign = plane[1];
          const lon = plane[5];
          const lat = plane[6];
          const alt = plane[7];

          if (!lat || !lon || plane[8]) continue; // Pomiń jeśli brak pozycji lub samolot na ziemi

          // Sprawdź dystans
          const distance = haversine(user.latitude, user.longitude, lat, lon);
          if (distance <= user.radius) {
            userPlanes++;
            totalPlanes++;

            // Sprawdź czy to nowy samolot dla tego użytkownika
            const cacheKey = `${user.email}:${icao}`;
            const lastSeen = lastSeenPlanes.get(cacheKey);

            if (!lastSeen || now - lastSeen > expiryMs) {
              userNewPlanes++;
              totalNewPlanes++;

              const altitudeText = alt ? `${Math.round(alt * 3.28084)}ft` : 'brak wysokości';
              console.log(
                `✈️  [${user.email}] ${callsign?.trim() || 'Unknown'} (${icao}) - ${lat.toFixed(4)}, ${lon.toFixed(4)} - ${altitudeText} - ${distance.toFixed(1)}km`,
              );

              // Wyślij email o nowym samolocie
              try {
                await emailService.sendFlightNotification({
                  email: user.email,
                  callsign: callsign?.trim() || undefined,
                  icao,
                  latitude: lat,
                  longitude: lon,
                  altitude: alt || undefined,
                  distance: parseFloat(distance.toFixed(1)),
                });
                console.log(`📧 Email wysłany do ${user.email} o samolocie ${callsign || icao}`);
              } catch (emailError) {
                console.error(`❌ Błąd wysyłania emaila do ${user.email}:`, emailError);
              }

              lastSeenPlanes.set(cacheKey, now);
            }
          }
        }

        userResults.push({
          email: user.email,
          planesFound: userPlanes,
          newPlanes: userNewPlanes,
          location: `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`,
          radius: `${user.radius}km`,
          emailsSent: userNewPlanes, // Liczba wysłanych emaili = liczba nowych samolotów
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        userResults.push({
          email: user.email,
          planesFound: 0,
          newPlanes: 0,
          location: `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`,
          radius: `${user.radius}km`,
          emailsSent: 0,
          error: `API Timeout: ${errorMessage.includes('ETIMEDOUT') ? 'Serwer nie odpowiada' : errorMessage}`,
        });
      }

      // Krótka pauza między użytkownikami żeby nie przeciążyć API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Wyczyść stare wpisy z cache
    clearExpiredCache(expiryMs);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      totalPlanes,
      newPlanes: totalNewPlanes,
      totalEmailsSent: totalNewPlanes,
      totalTracked: lastSeenPlanes.size,
      userResults,
    });
  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania samolotów:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
