import { defineStore } from "pinia"

export const useAppStore = defineStore('appState', () => {
  const isMapLoaded = ref(false)
  const selectedLocation = ref<string | null>(null)
  const isModelOpen = ref(false)
  const selectedPoi = ref<any | null> (null)

  function setLocation(locationName : string) {
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