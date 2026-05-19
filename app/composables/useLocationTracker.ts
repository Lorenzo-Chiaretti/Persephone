// composables/useLocationTracker.ts
import { ref, onScopeDispose } from 'vue'
import poisData from '~~/public/data/pois.json'
import type { Poi } from '~/stores/appState' // adatta al tuo path effettivo
import { getCurrentPOI } from '~/utils/geo'

const THRESHOLD_METERS = 50

const currentPoi = ref<Poi | null>(null)
const currentCoords = ref<{lat: number, lng: number, accuracy: number} | null>(null)
const locationError = ref<GeolocationPositionError | null>(null)
let watchId: number | null = null

export function useLocationTracker() {

  // ─── Handlers interni ──────────────────────────────────────────────────────

  /**
   * Callback di successo di watchPosition.
   * Calcola il POI corrente e aggiorna lo store.
   */
  function onPositionUpdate(position: GeolocationPosition): void {
    locationError.value = null

    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }

    // Usiamo la tua util geo.ts e salviamo il risultato nella nostra variabile
    currentPoi.value = getCurrentPOI(userLocation, poisData as Poi[], THRESHOLD_METERS)
    currentCoords.value = { ...userLocation, accuracy: position.coords.accuracy }
  }

  /**
   * Callback di errore di watchPosition.
   * Espone l'errore e azzera il POI selezionato.
   */
  function onPositionError(error: GeolocationPositionError): void {
    locationError.value = error
    currentPoi.value = null
    console.error(`[useLocationTracker] Geolocation error (Codice: ${error.code}):`, error.message)  }

  // ─── API pubblica ──────────────────────────────────────────────────────────

  /**
   * Avvia il tracciamento GPS.
   * Idempotente: non registra un secondo watcher se già attivo.
   */
  function startTracking(): void {

    if (!navigator?.geolocation) {
      console.error('[useLocationTracker] Geolocation API non disponibile.')
      return
    }

    if (watchId !== null) return // già in ascolto

    watchId = navigator.geolocation.watchPosition(
      onPositionUpdate,
      onPositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,   // ms – riusa una posizione cached fino a 5 s
        timeout: Infinity,    
      },
    )
  }

  /**
   * Ferma il tracciamento GPS e azzera lo stato correlato.
   */
  function stopTracking(): void {
    if (watchId === null) return

    navigator.geolocation.clearWatch(watchId)

    watchId = null
    currentPoi.value = null
    locationError.value = null
  }

  // ─── Cleanup automatico ────────────────────────────────────────────────────
  // Viene chiamato quando il reactive scope che ha invocato il composable
  // viene distrutto (unmount del componente, stop di un effectScope, ecc.)
  //onScopeDispose(() => {
  //  stopTracking()
  //})

  // ─── Return ────────────────────────────────────────────────────────────────
  return {
    currentPoi,
    currentCoords,
    locationError,  // Ref<GeolocationPositionError | null>
    startTracking,
    stopTracking,
  }
}