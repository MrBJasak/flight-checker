import { NextResponse } from 'next/server';
// import { db } from '../../../shared/lib/db';
// import { aircraft } from '../../../shared/lib/db/schema';
// import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Tymczasowo zwracamy mockowe dane, dopóki nie zaimportujemy danych do bazy
    const mockData = {
      manufacturers: [
        'BOEING', 'AIRBUS', 'CESSNA', 'PIPER', 'BEECH', 'EMBRAER', 'BOMBARDIER',
        'CIRRUS', 'DIAMOND', 'MOONEY', 'ROBINSON', 'BELL', 'LEONARDO', 'RAYTHEON'
      ],
      models: [
        'A320', 'A321', 'A330', 'A350', 'B737', 'B747', 'B777', 'B787', 
        '172', '182', 'Citation', 'King Air', 'PA-28', 'SR22', 'R44', 'EC130'
      ],
      typeCodes: [
        'A320', 'A321', 'A332', 'A35K', 'B737', 'B738', 'B739', 'B744', 
        'B772', 'B773', 'B787', 'C172', 'C182', 'C206', 'C25A', 'C25B', 'C56X'
      ],
      operators: [
        'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
        'Lufthansa', 'Air France', 'British Airways', 'KLM', 'Emirates', 'Qatar Airways',
        'LOT Polish Airlines', 'Ryanair', 'EasyJet', 'Wizz Air', 'Private'
      ]
    };

    return NextResponse.json(mockData);

    // Docelowy kod - użyć gdy dane będą w bazie
    /*
    const [manufacturers, models, typeCodes, operators] = await Promise.all([
      // Producenci
      db
        .selectDistinct({ manufacturername: aircraft.manufacturername })
        .from(aircraft)
        .where(sql`${aircraft.manufacturername} IS NOT NULL AND ${aircraft.manufacturername} != ''`)
        .orderBy(aircraft.manufacturername)
        .limit(500),

      // Modele
      db
        .selectDistinct({ model: aircraft.model })
        .from(aircraft)
        .where(sql`${aircraft.model} IS NOT NULL AND ${aircraft.model} != ''`)
        .orderBy(aircraft.model)
        .limit(500),

      // Typy
      db
        .selectDistinct({ typecode: aircraft.typecode })
        .from(aircraft)
        .where(sql`${aircraft.typecode} IS NOT NULL AND ${aircraft.typecode} != ''`)
        .orderBy(aircraft.typecode)
        .limit(200),

      // Operatorzy
      db
        .selectDistinct({ operator: aircraft.operator })
        .from(aircraft)
        .where(sql`${aircraft.operator} IS NOT NULL AND ${aircraft.operator} != ''`)
        .orderBy(aircraft.operator)
        .limit(500),
    ]);

    const response = {
      manufacturers: manufacturers.map(m => m.manufacturername!).filter(Boolean),
      models: models.map(m => m.model!).filter(Boolean),
      typeCodes: typeCodes.map(t => t.typecode!).filter(Boolean),
      operators: operators.map(o => o.operator!).filter(Boolean),
    };

    return NextResponse.json(response);
    */
  } catch (error) {
    console.error('Błąd podczas pobierania opcji samolotów:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać opcji samolotów' },
      { status: 500 }
    );
  }
}
