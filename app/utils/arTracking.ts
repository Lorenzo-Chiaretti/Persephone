/* Analizza il frame WebXR per determinare lo stato del tracciamento geospaziale.
 */
export const handleGeospatialTracking = (frame: any) => {
  // Richiamiamo lo store Pinia per aggiornare lo stato globale
  const store = useArStore();

  // 1. Cerchiamo la "Pose Geospaziale" (il dato di Google)
  // Il metodo getGeospatialPose() è quello fornito dall'estensione Geospatial
  const geospatialPose = frame.getGeospatialPose ? frame.getGeospatialPose() : null;

  // 2. Se non c'è posizionamento (es. l'utente è al chiuso o sta muovendo il telefono)
  if (!geospatialPose) {
    store.setLostTracking(); // Stato: Scansione in corso...
    return null;
  }

  // 3. Controllo Accuratezza (Cruciale!)
  // Google ci restituisce un valore di confidenza (in metri).
  // Se l'accuratezza orizzontale è peggiore di 5 metri, il Naviglio apparirebbe nel posto sbagliato.
  const isAccurateEnough = geospatialPose.horizontalAccuracy < 5;

  if (isAccurateEnough) {
    // Diciamo allo store che siamo pronti. Scuro (Dev 3) mostrerà la spunta verde.
    store.setLocalized;
    return geospatialPose;
  } else {
    // Siamo vicini, ma la precisione è ancora bassa
    store.setLostTracking;
    return null;
  }
};