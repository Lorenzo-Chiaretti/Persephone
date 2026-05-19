import type { Poi } from '~/stores/appState' 

export interface Coordinates {
  lat: number;
  lng: number; 
}

// Formula di Haversine per calcolare la distanza in metri
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Raggio della terra in metri
  const toRadians = (deg: number) => deg * (Math.PI / 180);

  const phi1 = toRadians(coord1.lat);
  const phi2 = toRadians(coord2.lat);
  const deltaPhi = toRadians(coord2.lat - coord1.lat);
  const deltaLambda = toRadians(coord2.lng - coord1.lng); 

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

/**
 * Controlla se l'utente è vicino a un POI.
 * @param userLocation Le coordinate attuali dell'utente
 * @param allPois L'array completo di tutti i POI dal database
 * @param thresholdMeters La distanza massima in metri per considerare l'utente "arrivato"
 */
export const getCurrentPOI = (
  userLocation: Coordinates, 
  allPois: Poi[], 
  thresholdMeters: number = 50 // Raggio di default: 50 metri
): Poi | null => {
  if (!userLocation || !allPois || allPois.length === 0) return null;

  for (const poi of allPois) {
    const poiLocation = { lat: poi.lat, lng: poi.lng };
    const distance = calculateDistance(userLocation, poiLocation);
    
    if (distance <= thresholdMeters) {
      return poi; // Trovato! Restituiamo l'intero oggetto POI
    }
  }

  return null; // Nessun POI nel raggio
};