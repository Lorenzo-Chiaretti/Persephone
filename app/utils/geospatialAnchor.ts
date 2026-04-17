export const createNaviglioAnchor = async (session: any) => {
  const store = useAppStore(); // Usiamo lo store 
  const poi = store.selectedPoi;

  if (!poi) {
    console.warn("⚠️ Tentativo di creare un'ancora senza un POI selezionato.");
    return null;
  }

  try {
    // Usiamo i dati dinamici dello store (lat, lng del POI cliccato)
    const anchor = await session.createGeospatialAnchor(
      poi.lat,
      poi.lng,
      120.0, // Altitudine standard di Milano Via Senato
      [0, 0, 0, 1]
    );

    console.log(`📍 Ancora creata con successo per: ${poi.title}`);
    return anchor;
  } catch (error) {
    console.error("❌ Errore creazione ancora dinamica:", error);
    store.setArTracking('error');
    return null;
  }
};