export const getGeospatialConfig = (overlayElement: HTMLElement | null) => {
  return {
    requiredFeatures: ['local-floor'],
    optionalFeatures: [
      'camera-access', 
      'anchors', 
      'geospatial-api', // Questa riga è il tuo Task 1
      'dom-overlay'
    ],
    domOverlay: overlayElement ? { root: overlayElement } : undefined
  };
};