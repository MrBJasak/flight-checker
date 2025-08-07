/**
 * Oblicza odległość między dwoma punktami geograficznymi używając wzoru Haversine
 * @param lat1 Szerokość geograficzna punktu 1
 * @param lon1 Długość geograficzna punktu 1
 * @param lat2 Szerokość geograficzna punktu 2
 * @param lon2 Długość geograficzna punktu 2
 * @returns Odległość w kilometrach
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Promień Ziemi w km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Oblicza bounding box dla danego punktu i promienia
 * @param lat Szerokość geograficzna środka
 * @param lon Długość geograficzna środka
 * @param radiusKm Promień w kilometrach
 * @returns Obiekt z współrzędnymi bounding box
 */
export function getBoundingBox(lat: number, lon: number, radiusKm: number) {
  const latRadian = (lat * Math.PI) / 180;
  const degLat = radiusKm / 111.32; // 1 stopień szerokości ≈ 111.32 km
  const degLon = radiusKm / (111.32 * Math.cos(latRadian));

  return {
    lamin: lat - degLat,
    lamax: lat + degLat,
    lomin: lon - degLon,
    lomax: lon + degLon,
  };
}
