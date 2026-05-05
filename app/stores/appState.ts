import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appState', () => {
  interface Poi {
    id: string
    title_it: string
    title_en: string
    description_it: string
    description_en: string
    year_it?: string
    year_en?: string
    title?: string
    description?: string
    year?: string
    lat: number
    lng: number
    historicalImgUrl: string
    modernImgUrl: string
    altitude?: number
  }

  const isMapLoaded = ref(false)
  const isModelOpen = ref(false)
  const selectedPoi = ref<Poi | null>(null)

  function setMapReady() {
    isMapLoaded.value = true
  }

  return {
    isMapLoaded,
    setMapReady,
    isModelOpen,
    selectedPoi
  }
})
