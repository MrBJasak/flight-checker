/**
 * Vercel Cron Job endpoint dla monitorowania samolotów
 * Wywołuje się automatycznie w określonych interwałach
 */

import { NextRequest, NextResponse } from 'next/server';
import { FlightChecker } from '../../../../shared/services/flightChecker';
import { UserConfigService } from '../../../../shared/services/userConfigService';

// Przechowywanie ostatnio widzianych samolotów w pamięci (w produkcji użyj Redis/Database)
const lastSeenPlanes = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    // Sprawdź token autoryzacji (zabezpieczenie przed nieautoryzowanymi wywołaniami)
    const authToken = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (!expectedToken || authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pobierz konfigurację z zmiennych środowiskowych lub domyślne wartości
    const expiryMs = parseInt(process.env.FLIGHT_MONITOR_EXPIRY || '300000');

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

    console.log(`� Znaleziono ${users.length} aktywnych użytkowników`);

    // Wykonaj sprawdzenie dla wszystkich użytkowników
    const result = await FlightChecker.checkFlightsForUsers(users, lastSeenPlanes, expiryMs);

    return NextResponse.json({
      success: true,
      timestamp: result.timestamp,
      totalUsers: result.totalUsers,
      totalPlanes: result.totalPlanes,
      newPlanes: result.newPlanes,
      totalTracked: lastSeenPlanes.size,
      userResults: result.userResults, // Szczegółowe wyniki dla każdego użytkownika
    });

  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania samolotów:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint dla testowania
export async function GET() {
  try {
    const users = await UserConfigService.getAllActiveUsers();
    
    return NextResponse.json({
      message: 'Vercel Cron Job endpoint dla monitorowania samolotów',
      usage: 'POST z authorization header',
      activeUsers: users.length,
      users: users.map(u => ({
        email: u.email,
        location: `${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`,
        radius: `${u.radius}km`,
      })),
      env: {
        cronSecret: process.env.CRON_SECRET ? 'ustawione' : 'nie ustawione',
        expiryMs: process.env.FLIGHT_MONITOR_EXPIRY || '300000 (default)',
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Vercel Cron Job endpoint dla monitorowania samolotów',
      error: 'Błąd podczas pobierania użytkowników',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
