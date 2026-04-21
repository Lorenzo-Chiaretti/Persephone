import { defineStore } from "pinia"

//Only for test
export const useStore = defineStore('app', {
  state: () => ({
    // Force this to true so the overlay shows up immediately when you load the page
    isArActive: false, 
    
    // Change this manually in code, or use the buttons below to test the UI
    arState: 'locating', // Try changing to: 'ready' or 'idle'
    
    // Set a string here to test the red error message
    arError: '' 
  }),
  actions: {
    // This is the function your Exit button calls
    setArActive(status: boolean) {
      this.isArActive = status
    }
  }
})


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