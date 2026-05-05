import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue' // Aggiunto shallowRef

export type ArStatus = 'IDLE' | 'LOADING' | 'SCANNING' | 'ACTIVE' | 'ERROR'

export const useArStore = defineStore('ar', () => {
  const status = ref<ArStatus>('IDLE')
  const errorMessage = ref<string | null>(null)
  const session = shallowRef<XRSession | null>(null)

  // --- AGGIUNGI QUESTA RIGA ---
  const selectedPoi = ref<{ id: string } | null>(null)

  const isIdle = computed(() => status.value === 'IDLE')
  const isLoading = computed(() => status.value === 'LOADING')
  const isScanning = computed(() => status.value === 'SCANNING')
  const isActive = computed(() => status.value === 'ACTIVE')
  const isError = computed(() => status.value === 'ERROR')

  function startLoading() {
    status.value = 'LOADING'
    errorMessage.value = null
  }

  function setCameraReady(xrSession: XRSession) {
    status.value = 'SCANNING'
    session.value = xrSession
  }

  function setLocalized() {
    if (status.value !== 'ACTIVE') status.value = 'ACTIVE'
  }

  function setLostTracking() {
    if (status.value === 'ACTIVE') status.value = 'SCANNING'
  }

  function triggerError(message: string) {
    status.value = 'ERROR'
    errorMessage.value = message
  }

  function resetSession() {
    status.value = 'IDLE'
    errorMessage.value = null
    selectedPoi.value = null // Reset del POI alla chiusura
    if (session.value) {
      try {
        session.value.end()
      } catch (e) {
        console.warn(e)
      }
    }
    session.value = null
  }

  return {
    status,
    errorMessage,
    session,
    selectedPoi, // --- AGGIUNGI QUESTO ---
    isIdle,
    isLoading,
    isActive,
    isError,
    isScanning,
    startLoading,
    setCameraReady,
    setLocalized,
    setLostTracking,
    triggerError,
    resetSession
  }
})
