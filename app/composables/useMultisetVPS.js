import { NAVIGLIO_LOCATIONS } from '~/constants/navigliLocations'

export function useMultisetVPS() {
  const config = useRuntimeConfig()

  // --- TOKEN MANAGEMENT ---
  // Il token JWT dura 30 minuti. Lo cacchiamo in memoria
  // e lo rinnovia automaticamente 1 minuto prima della scadenza,
  // evitando chiamate inutili ad ogni localizzazione.
  let cachedToken = null
  let tokenExpiry = null

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken

  const clientId = config.public.multisetClientId
  const clientSecret = config.public.multisetClientSecret

  console.log('clientId:', clientId)
  console.log('clientSecret:', clientSecret?.substring(0, 6) + '...')

  console.log('CLIENT_ID presente:', !!clientId, 'SECRET presente:', !!clientSecret) // ← qui

  const authorization = 'Basic ' + btoa(`${clientId}:${clientSecret}`)

  const response = await fetch('https://api.multiset.ai/v1/m2m/token', {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
    }),
  })

  const { token, expiresOn, error } = await response.json()

  if (error) throw new Error(`Auth MultiSet fallita: ${error}`)

  cachedToken = token
  tokenExpiry = new Date(expiresOn).getTime() - 60_000
  return cachedToken
}

  // --- RILEVAMENTO LOCATION VIA GPS ---
  // Usa l'API Geolocation del browser per ottenere lat/lng approssimativa.
  // Poi calcola la distanza da ognuna delle 3 location con la formula
  // di Haversine (distanza su sfera terrestre) e restituisce quella
  // entro il raggio definito, o null se l'utente non è in nessuna zona.
  function getDistanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  async function detectNearbyLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation non supportata'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords

          const match = NAVIGLIO_LOCATIONS.find(loc => {
            const dist = getDistanceMeters(
              latitude, longitude,
              loc.center.lat, loc.center.lng
            )
            return dist <= loc.radiusMeters
          })

          // Restituisce la location trovata (con lat/lng allegati per il geoHint)
          // oppure null se l'utente non è in nessuna zona
          resolve(match ? { ...match, userLat: latitude, userLng: longitude } : null)
        },
        (err) => reject(new Error(`GPS non disponibile: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  // --- LOCALIZZAZIONE VPS ---
  // Manda un singolo frame (già convertito in base64) all'API MultiSet.
  // Passa il geoHint con le coordinate GPS per aiutare il sistema
  // a convergere più velocemente sulla pose corretta.
  // Risponde con { poseFound, position, rotation, confidence }.
  async function queryLocalization(imageBase64, cameraIntrinsics, location) {
    const token = await getToken()

    const res = await fetch('https://api.multiset.ai/v1/vps/map/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mapCode: location.mapCode,
        geoHint: [location.userLat, location.userLng, 0],
        cameraIntrinsics, // { fx, fy, px, py }
        isRightHanded: false,
        resolution: { width: 960, height: 720 },
        queryImage: imageBase64,
      }),
    })

    if (!res.ok) throw new Error(`Errore API MultiSet: ${res.status}`)
    return res.json()
    // { poseFound: bool, position: {x,y,z}, rotation: {x,y,z,w}, confidence: float }
  }

  // --- CATTURA FRAME DA WEBXR ---
  // Estrae il frame corrente dalla camera AR e lo converte in base64
  // per poterlo mandare all'API MultiSet.
  // Usa un canvas offscreen temporaneo come buffer di conversione.
  // --- CATTURA FRAME DA WEBXR (CORRETTA) ---
  // Canvas riusabili creati UNA VOLTA SOLA, non ad ogni frame
// In cima al composable, fuori dalla funzione
let _captureCanvas = null

function captureFrameAsBase64(rendererInstance) {
  try {
    // Cattura quello che Three.js ha renderizzato sull'ultimo frame
    // Il canvas è già disponibile — nessun accesso alla camera necessario
    const canvas = rendererInstance.domElement
    return canvas.toDataURL('image/jpeg', 0.6)
  } catch (err) {
    console.warn('Cattura canvas fallita:', err.message)
    return null
  }
}

// Esporta le nuove funzioni

  // --- CAMERA INTRINSICS ---
  // I parametri intrinseci della camera (lunghezza focale e punto principale)
  // sono necessari all'algoritmo VPS per capire la geometria della proiezione.
  // Su WebXR non sono sempre esposti direttamente — usiamo valori tipici
  // per smartphone moderni come fallback ragionevole.
  function getCameraIntrinsics(xrView) {
    const proj = xrView?.projectionMatrix
    if (proj) {
      return {
        fx: proj[0],
        fy: proj[5],
        px: proj[8],
        py: proj[9],
      }
    }
    // Fallback per risoluzione 960x720
    return { fx: 664.0, fy: 664.0, px: 480.0, py: 360.0 }
  }

  return {
  detectNearbyLocation,
  queryLocalization,
  getCameraIntrinsics,
  captureFrameAsBase64,
}
}