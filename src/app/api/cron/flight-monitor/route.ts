/**
 * Vercel Cron Job endpoint dla monitorowania samolotów - BEZ AUTORYZACJI
 * Wywołuje się automatycznie przez cron-job.org
 * Sprawdza samoloty bezpośrednio w endpoincie używając OpenSky API
 */

import axios from 'axios';
import { NextResponse } from 'next/server';
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

  if (expired.length > 0) {
    console.log(`🧹 Wyczyszczono ${expired.length} wygasłych wpisów z cache`);
  }
}

// Funkcja do wywołania OpenSky API z retry logic
async function fetchOpenSkyData(lamin: number, lamax: number, lomin: number, lomax: number, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 OpenSky API - próba ${attempt}/${retries}`);

      const response = await axios.get('https://opensky-network.org/api/states/all', {
        params: { lamin, lamax, lomin, lomax },
        timeout: 15000, // Krótszy timeout - 15s
        headers: {
          'User-Agent': 'FlightChecker/1.0',
        },
      });

      console.log(`✅ OpenSky API - sukces (${response.data?.states?.length || 0} samolotów)`);
      return response.data?.states || [];
    } catch (error) {
      console.log(
        `❌ OpenSky API - próba ${attempt} nieudana:`,
        error instanceof Error ? error.message : 'Unknown error',
      );

      if (attempt === retries) {
        // Ostatnia próba - rzuć błąd
        throw error;
      }

      // Pauza przed kolejną próbą (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Czekam ${delay}ms przed kolejną próbą...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function POST() {
  try {
    console.log(`🚀 Cron job wywołany: ${new Date().toISOString()}`);

    const expiryMs = parseInt(process.env.FLIGHT_MONITOR_EXPIRY || '3600000'); // 1 godzina domyślnie
    console.log(`🔍 Pobieranie aktywnych użytkowników...`);

    // Pobierz wszystkich aktywnych użytkowników z bazy danych
    const users = await UserConfigService.getAllActiveUsers();

    if (users.length === 0) {
      console.log('⚠️  Brak aktywnych użytkowników do monitorowania');
      return NextResponse.json({
        success: true,
        message: 'Brak aktywnych użytkowników',
        timestamp: new Date().toISOString(),
        totalUsers: 0,
        totalPlanes: 0,
        newPlanes: 0,
      });
    }

    console.log(`👥 Znaleziono ${users.length} aktywnych użytkowników`);

    let totalPlanes = 0;
    let totalNewPlanes = 0;
    const userResults = [];
    const now = Date.now();

    // Sprawdź samoloty dla każdego użytkownika
    for (const user of users) {
      console.log(
        `🔍 Sprawdzanie dla użytkownika: ${user.email} (${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}, ${user.radius}km)`,
      );

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
        });

        console.log(`📊 [${user.email}] Znaleziono ${userPlanes} samolotów (${userNewPlanes} nowych)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ OpenSky API całkowicie niedostępne dla użytkownika ${user.email}:`, errorMessage);

        userResults.push({
          email: user.email,
          planesFound: 0,
          newPlanes: 0,
          location: `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`,
          radius: `${user.radius}km`,
          error: `API Timeout: ${errorMessage.includes('ETIMEDOUT') ? 'Serwer nie odpowiada' : errorMessage}`,
        });
      }

      // Krótka pauza między użytkownikami żeby nie przeciążyć API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Wyczyść stare wpisy z cache
    clearExpiredCache(expiryMs);

    console.log(`✅ Sprawdzenie zakończone - Łącznie: ${totalPlanes} samolotów, ${totalNewPlanes} nowych`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      totalPlanes,
      newPlanes: totalNewPlanes,
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

// GET endpoint dla testowania
export async function GET() {
  try {
    const users = await UserConfigService.getAllActiveUsers();

    return NextResponse.json({
      message: 'Vercel Cron Job endpoint dla monitorowania samolotów - BEZ AUTORYZACJI',
      usage: 'POST - wywołuje monitoring bezpośrednio przez OpenSky API | GET - pokazuje status',
      features: [
        '✈️ Bezpośrednie sprawdzanie OpenSky API',
        '👥 Multi-user support z bazy danych',
        '🔄 Cache dla unikania duplikatów',
        '🧹 Automatyczne czyszczenie wygasłych wpisów',
        '📊 Szczegółowe logi per użytkownik',
        '🔄 Retry logic przy błędach API (3 próby)',
        '⚠️ OpenSky API może być czasowo niestabilne',
      ],
      activeUsers: users.length,
      users: users.map((u) => ({
        email: u.email,
        location: `${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`,
        radius: `${u.radius}km`,
      })),
      env: {
        expiryMs: process.env.FLIGHT_MONITOR_EXPIRY || '3600000 (1 hour default)',
      },
      cache: {
        totalTracked: lastSeenPlanes.size,
        message: 'Liczba unikalnych samolotów w pamięci cache',
      },
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Vercel Cron Job endpoint dla monitorowania samolotów - BEZ AUTORYZACJI',
      error: 'Błąd podczas pobierania użytkowników',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
