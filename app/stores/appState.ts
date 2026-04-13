import { defineStore } from "pinia"

export const useAppStore = defineStore('appState', () => {
  interface Poi {
    id : string
    title : string
    description : string
    lat : number
    lng : number
    historicalImgUrl : string
    modernImgUrl : string 
    year : string
  }

  const isMapLoaded = ref(false)
  const selectedLocation = ref<string | null>(null)
  const isModelOpen = ref(false)
  const selectedPoi = ref<Poi | null> (null)

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