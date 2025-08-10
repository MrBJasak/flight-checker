import { db } from '../lib/db';
import { subscriptions } from '../lib/db/schema';

export interface UserMonitorConfig {
  email: string;
  latitude: number;
  longitude: number;
  radius: number;
}

/**
 * Serwis do pobierania konfiguracji monitorowania dla użytkowników
 */
export class UserConfigService {
  /**
   * Pobiera wszystkich aktywnych użytkowników do monitorowania
   */
  static async getAllActiveUsers(): Promise<UserMonitorConfig[]> {
    try {
      const users = await db
        .select({
          email: subscriptions.email,
          latitude: subscriptions.latitude,
          longitude: subscriptions.longitude,
          radius: subscriptions.radius,
        })
        .from(subscriptions);

      return users;
    } catch (error) {
      console.error('❌ Błąd podczas pobierania użytkowników:', error);
      throw error;
    }
  }

  /**
   * Pobiera konfigurację konkretnego użytkownika
   */
  static async getUserConfig(email: string): Promise<UserMonitorConfig | null> {
    try {
      const user = await db
        .select({
          email: subscriptions.email,
          latitude: subscriptions.latitude,
          longitude: subscriptions.longitude,
          radius: subscriptions.radius,
        })
        .from(subscriptions)
        .where(eq(subscriptions.email, email))
        .limit(1);

      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error(`❌ Błąd podczas pobierania konfiguracji dla ${email}:`, error);
      return null;
    }
  }

  /**
   * Grupuje użytkowników według lokalizacji (w celu optymalizacji API calls)
   * Użytkownicy w promieniu 10km są grupowani razem
   */
  static groupUsersByLocation(users: UserMonitorConfig[]): UserMonitorConfig[][] {
    const groups: UserMonitorConfig[][] = [];
    const processed = new Set<string>();

    for (const user of users) {
      if (processed.has(user.email)) continue;

      const group = [user];
      processed.add(user.email);

      // Znajdź innych użytkowników w pobliżu (w promieniu 10km)
      for (const otherUser of users) {
        if (processed.has(otherUser.email)) continue;

        const distance = this.calculateDistance(
          user.latitude,
          user.longitude,
          otherUser.latitude,
          otherUser.longitude
        );

        // Jeśli użytkownicy są blisko siebie (10km), grupuj ich
        if (distance <= 10) {
          group.push(otherUser);
          processed.add(otherUser.email);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Oblicza odległość między dwoma punktami (Haversine)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Promień Ziemi w km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Import eq z drizzle
import { eq } from 'drizzle-orm';
