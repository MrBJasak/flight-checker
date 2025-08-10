import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Flight Monitor Test Endpoint',
    timestamp: new Date().toISOString(),
    endpoints: {
      cronJob: '/api/cron/flight-monitor',
      test: '/api/test/flight-monitor (current)',
    },
    environment: {
      cronSecret: process.env.CRON_SECRET ? 'SET' : 'NOT SET',
      expiryMs: process.env.FLIGHT_MONITOR_EXPIRY || '300000 (default)',
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'true' : 'false',
    },
    note: 'Konfiguracja użytkowników pobierana z bazy danych (tabela subscriptions)',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Test wywołania cron job endpoint
    const baseUrl = request.nextUrl.origin;
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      return NextResponse.json({
        error: 'CRON_SECRET nie jest ustawione',
        help: 'Ustaw CRON_SECRET w zmiennych środowiskowych',
      }, { status: 400 });
    }

    const response = await fetch(`${baseUrl}/api/cron/flight-monitor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      message: 'Test wywołania cron job',
      status: response.status,
      success: response.ok,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Błąd podczas testowania',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
