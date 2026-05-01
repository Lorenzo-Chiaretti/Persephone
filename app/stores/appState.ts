// app/stores/appState.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appState', () => {
  // 🛠️ FIX: Interfaccia Poi aggiornata per supportare il multilingua
  interface Poi {
    id: string

    // Campi multilingua
    title_it: string
    title_en: string
    description_it: string
    description_en: string
    year_it?: string
    year_en?: string

    // Fallback opzionali (se qualche json vecchio non è aggiornato)
    title?: string
    description?: string
    year?: string

    lat: number
    lng: number
    historicalImgUrl: string
    modernImgUrl: string
    altitude?: number // Aggiunto per l'AR
  }

  const isMapLoaded = ref(false)
  const selectedLocation = ref<string | null>(null)
  const isModelOpen = ref(false)
  const selectedPoi = ref<Poi | null>(null)

  function setLocation(locationName: string) {
    selectedLocation.value = locationName
  }

  function setMapReady() {
    isMapLoaded.value = true
  }

  return {
    isMapLoaded,
    selectedLocation,
    setLocation,
    setMapReady,
    isModelOpen,
    selectedPoi
  }
})
