import axios from 'axios';
import { haversine, getBoundingBox } from '../lib/geo';
import { UserMonitorConfig } from './userConfigService';

interface FlightCheckResult {
  totalUsers: number;
  totalPlanes: number;
  newPlanes: number;
  timestamp: string;
  userResults: UserFlightResult[];
}

interface UserFlightResult {
  email: string;
  location: { lat: number; lon: number; radius: number };
  planesFound: number;
  newPlanes: number;
}

/**
 * Serwis do sprawdzania samolotów dla wielu użytkowników jednocześnie
 * Zoptymalizowany dla Vercel Cron Jobs
 */
export class FlightChecker {
  /**
   * Sprawdza samoloty dla wszystkich użytkowników
   */
  static async checkFlightsForUsers(
    users: UserMonitorConfig[],
    lastSeenPlanes: Map<string, number>,
    expiryMs: number = 300000
  ): Promise<FlightCheckResult> {
    console.log(`🔍 Sprawdzanie samolotów dla ${users.length} użytkowników`);

    const userResults: UserFlightResult[] = [];
    let totalPlanes = 0;
    let totalNewPlanes = 0;

    // Grupuj użytkowników według lokalizacji dla optymalizacji
    const locationGroups = this.groupUsersByLocation(users);
    console.log(`📊 Pogrupowano użytkowników w ${locationGroups.length} lokalizacji`);

    for (const group of locationGroups) {
      try {
        const result = await this.checkFlightsForGroup(group, lastSeenPlanes, expiryMs);
        userResults.push(...result.userResults);
        totalPlanes += result.totalPlanes;
        totalNewPlanes += result.newPlanes;
      } catch (error) {
        console.error(`❌ Błąd dla grupy użytkowników:`, error);
        // Dodaj wyniki z błędem dla użytkowników z tej grupy
        for (const user of group) {
          userResults.push({
            email: user.email,
            location: { lat: user.latitude, lon: user.longitude, radius: user.radius },
            planesFound: 0,
            newPlanes: 0,
          });
        }
      }
    }

    // Wyczyść stare wpisy
    this.cleanupOldEntries(lastSeenPlanes, expiryMs);

    console.log(`📊 Łącznie: ${totalPlanes} samolotów, ${totalNewPlanes} nowych`);

    return {
      totalUsers: users.length,
      totalPlanes,
      newPlanes: totalNewPlanes,
      timestamp: new Date().toISOString(),
      userResults,
    };
  }

  /**
   * Sprawdza samoloty dla grupy użytkowników w podobnej lokalizacji
   */
  private static async checkFlightsForGroup(
    users: UserMonitorConfig[],
    lastSeenPlanes: Map<string, number>,
    expiryMs: number
  ) {
    // Używamy pierwszego użytkownika jako punktu odniesienia i największego promienia
    const baseUser = users[0];
    const maxRadius = Math.max(...users.map(u => u.radius));
    
    const { lamin, lamax, lomin, lomax } = getBoundingBox(
      baseUser.latitude,
      baseUser.longitude,
      maxRadius + 10 // Dodaj bufor
    );

    console.log(`🌍 Sprawdzanie regionu: ${baseUser.latitude.toFixed(4)}, ${baseUser.longitude.toFixed(4)} (${maxRadius + 10}km) dla ${users.length} użytkowników`);

    const res = await axios.get('https://opensky-network.org/api/states/all', {
      params: { lamin, lamax, lomin, lomax },
      timeout: 30000,
    });

    const planes = res.data.states || [];
    const now = Date.now();
    const userResults: UserFlightResult[] = [];

    // Sprawdź każdego użytkownika osobno
    for (const user of users) {
      let planesFound = 0;
      let newPlanes = 0;

      for (const plane of planes) {
        const icao = plane[0];
        const callsign = plane[1]?.trim() || null;
        const lon = plane[5];
        const lat = plane[6];
        const alt = plane[7];

        if (!lat || !lon) continue;

        const dist = haversine(user.latitude, user.longitude, lat, lon);
        if (dist <= user.radius) {
          planesFound++;
          const lastSeenKey = `${user.email}:${icao}`;
          const lastSeen = lastSeenPlanes.get(lastSeenKey);
          
          if (!lastSeen || now - lastSeen > expiryMs) {
            newPlanes++;
            const altitudeText = alt ? `${Math.round(alt)} m` : 'Nieznana wysokość';
            const callsignText = callsign || 'Nieznany';
            const distanceText = dist.toFixed(2);
            
            console.log(
              `✈️  [${user.email}] ${callsignText} (${icao}) - ${lat.toFixed(4)}, ${lon.toFixed(4)} - ${altitudeText} - ${distanceText} km`
            );
            
            lastSeenPlanes.set(lastSeenKey, now);
          }
        }
      }

      if (planesFound === 0) {
        console.log(`🔍 [${user.email}] Brak samolotów w zasięgu ${user.radius}km`);
      } else {
        console.log(`📊 [${user.email}] Znaleziono ${planesFound} samolotów, ${newPlanes} nowych`);
      }

      userResults.push({
        email: user.email,
        location: { lat: user.latitude, lon: user.longitude, radius: user.radius },
        planesFound,
        newPlanes,
      });
    }

    return {
      userResults,
      totalPlanes: userResults.reduce((sum, r) => sum + r.planesFound, 0),
      newPlanes: userResults.reduce((sum, r) => sum + r.newPlanes, 0),
    };
  }

  /**
   * Grupuje użytkowników według lokalizacji (optymalizacja)
   */
  private static groupUsersByLocation(users: UserMonitorConfig[]): UserMonitorConfig[][] {
    const groups: UserMonitorConfig[][] = [];
    const processed = new Set<string>();

    for (const user of users) {
      if (processed.has(user.email)) continue;

      const group = [user];
      processed.add(user.email);

      // Znajdź użytkowników w pobliżu (20km) - można je sprawdzać razem
      for (const otherUser of users) {
        if (processed.has(otherUser.email)) continue;

        const distance = haversine(
          user.latitude,
          user.longitude,
          otherUser.latitude,
          otherUser.longitude
        );

        if (distance <= 20) {
          group.push(otherUser);
          processed.add(otherUser.email);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Czyści stare wpisy z cache
   */
  private static cleanupOldEntries(lastSeenPlanes: Map<string, number>, expiryMs: number): void {
    const now = Date.now();
    for (const [key, timestamp] of lastSeenPlanes.entries()) {
      if (now - timestamp > expiryMs * 2) {
        lastSeenPlanes.delete(key);
      }
    }
  }
}
