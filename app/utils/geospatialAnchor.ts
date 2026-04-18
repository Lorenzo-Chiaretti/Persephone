export const createNaviglioAnchor = async (session: any) => {
  const store = useAppStore(); 
  const poi = store.selectedPoi;

  if (!poi) {
    console.warn("⚠️ Tentativo di creare un'ancora senza un POI selezionato.");
    return null;
  }

  try {
    // CAMBIO QUI: Usiamo l'altitudine reale del piano strada comunicata da Gab (124m)
    const altitude = 124.0; 
    const quaternion = [0, 0, 0, 1];

    const anchor = await session.createGeospatialAnchor(
      poi.lat,
      poi.lng,
      altitude, 
      quaternion
    );

    console.log(`📍 Ancora creata a quota ${altitude}m per: ${poi.title}`);
    return anchor;
  } catch (error) {
    console.error("❌ Errore creazione ancora dinamica:", error);
    store.setArTracking('error');
    return null;
  }
};