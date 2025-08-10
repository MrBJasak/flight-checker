/**
 * Funkcja do rozpoznania linii lotniczych na podstawie znaku wywoławczego
 */
export function getAirline(callsign: string): string {
  if (!callsign) return '';

  const cs = callsign.trim().toUpperCase();

  // Polskie linie
  if (cs.startsWith('LOT')) return 'LOT Polish Airlines';
  if (cs.startsWith('ENT')) return 'Enter Air';
  if (cs.startsWith('SLK')) return 'SprintAir';

  // Europejskie linie
  if (cs.startsWith('DLH')) return 'Lufthansa';
  if (cs.startsWith('BAW')) return 'British Airways';
  if (cs.startsWith('AFR')) return 'Air France';
  if (cs.startsWith('KLM')) return 'KLM';
  if (cs.startsWith('AUA')) return 'Austrian Airlines';
  if (cs.startsWith('SWR')) return 'Swiss International';
  if (cs.startsWith('SAS')) return 'SAS Scandinavian';
  if (cs.startsWith('FIN')) return 'Finnair';
  if (cs.startsWith('IBE')) return 'Iberia';
  if (cs.startsWith('AEE')) return 'Aegean Airlines';
  if (cs.startsWith('TAP')) return 'TAP Air Portugal';
  if (cs.startsWith('CSA')) return 'Czech Airlines';
  if (cs.startsWith('MSR')) return 'EgyptAir';

  // Tanich linie (LCC)
  if (cs.startsWith('RYR')) return 'Ryanair';
  if (cs.startsWith('EZY')) return 'easyJet';
  if (cs.startsWith('WZZ')) return 'Wizz Air';
  if (cs.startsWith('VLG')) return 'Vueling';
  if (cs.startsWith('EWG')) return 'Eurowings';
  if (cs.startsWith('BEL')) return 'Brussels Airlines';

  // Amerykańskie linie
  if (cs.startsWith('UAL')) return 'United Airlines';
  if (cs.startsWith('AAL')) return 'American Airlines';
  if (cs.startsWith('DAL')) return 'Delta Air Lines';
  if (cs.startsWith('SWA')) return 'Southwest Airlines';
  if (cs.startsWith('JBU')) return 'JetBlue Airways';

  // Azjatyckie linie
  if (cs.startsWith('ANA')) return 'ANA All Nippon Airways';
  if (cs.startsWith('JAL')) return 'Japan Airlines';
  if (cs.startsWith('CCA')) return 'Air China';
  if (cs.startsWith('CES')) return 'China Eastern';
  if (cs.startsWith('CSN')) return 'China Southern';
  if (cs.startsWith('SIA')) return 'Singapore Airlines';
  if (cs.startsWith('THA')) return 'Thai Airways';
  if (cs.startsWith('UAE')) return 'Emirates';
  if (cs.startsWith('QTR')) return 'Qatar Airways';
  if (cs.startsWith('ETD')) return 'Etihad Airways';

  // Cargo linie
  if (cs.startsWith('FDX')) return 'FedEx';
  if (cs.startsWith('UPS')) return 'UPS Airlines';
  if (cs.startsWith('DHL')) return 'DHL';
  if (cs.startsWith('GTI')) return 'Atlas Air';

  // Rosyjskie/Ukraińskie linie
  if (cs.startsWith('AFL')) return 'Aeroflot';
  if (cs.startsWith('SBI')) return 'S7 Airlines';
  if (cs.startsWith('AUI')) return 'Ukraine International';

  // Inne popularne
  if (cs.startsWith('ELY')) return 'El Al';
  if (cs.startsWith('THY')) return 'Turkish Airlines';
  if (cs.startsWith('SVA')) return 'Saudi Arabian Airlines';

  return ''; // Nieznana linia
}

export function getDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return `${directions[index]} (${Math.round(degrees)}°)`;
}
