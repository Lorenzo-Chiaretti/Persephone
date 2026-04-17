// app/stores/appState.ts
import { defineStore } from "pinia"
import { ref } from "vue" // Assicurati di importare ref

export const useAppStore = defineStore('appState', () => {
  interface Poi {
    id: string
    title: string
    description: string
    lat: number
    lng: number
    historicalImgUrl: string
    modernImgUrl: string 
    year: string
    altitude?: number // Aggiungiamo l'altitudine opzionale per l'AR
  }

  const isMapLoaded = ref(false)
  const selectedLocation = ref<string | null>(null)
  const isModelOpen = ref(false)
  const selectedPoi = ref<Poi | null>(null)

  const arActive = ref(false)
  const arTrackingStatus = ref<'idle' | 'scanning' | 'localized' | 'error'>('idle')

  function setLocation(locationName: string) {
    selectedLocation.value = locationName
  }

  function setMapReady() {
    isMapLoaded.value = true
  }

  function setArTracking(status: 'idle' | 'scanning' | 'localized' | 'error') {
    arTrackingStatus.value = status
  }

  function toggleAr(value: boolean) {
    arActive.value = value
    if (!value) arTrackingStatus.value = 'idle'
  }

  return { 
    isMapLoaded, 
    selectedLocation, 
    setLocation, 
    setMapReady,
    isModelOpen,
    selectedPoi,
    // Export nuovi stati
    arActive,
    arTrackingStatus,
    setArTracking,
    toggleAr
  }
})