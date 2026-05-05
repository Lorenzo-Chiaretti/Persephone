import { defineStore } from "pinia"
import { ref, computed } from "vue" 

export type ArStatus = 'IDLE' | 'LOADING' | 'SCANNING' | 'ACTIVE' | 'ERROR'

export const useArStore = defineStore('ar', () => {

    //STATE
    const status = ref<ArStatus>('IDLE')
    const errorMessage = ref<string | null>(null)
    const session = shallowRef<XRSession | null>(null)

    //GETTERS
    const isIdle = computed(() => status.value === 'IDLE')
    const isLoading = computed(() => status.value === 'LOADING')
    const isScanning = computed(() => status.value === 'SCANNING')
    const isActive = computed(() => status.value === 'ACTIVE')
    const isError = computed(() => status.value === 'ERROR')

    //ACTION
    function startLoading() {
        status.value = 'LOADING'
        errorMessage.value = null
    }

    function setCameraReady(xrSession : XRSession){
        status.value = 'SCANNING'
        session.value = xrSession
    }

    function setLocalized(){
        if(status.value !== 'ACTIVE'){
            status.value = 'ACTIVE'
        }
    }

    function setLostTracking(){
        if(status.value === 'ACTIVE'){
            status.value = 'SCANNING'
        }
    }

    function triggerError(message: string) {
        status.value = 'ERROR'
        errorMessage.value = message
    }

    function resetSession() {
        status.value = 'IDLE'
        errorMessage.value = null

        if (session.value) {
            try {
                session.value.end()
            } catch (e) {
                console.warn('Errore durante la chiusura della sessione WebXR:', e)
            }
        }
        session.value = null
    }

    //EXPORT
    return {
        // State
        status,
        errorMessage,
        session,
        // Getters
        isIdle,
        isLoading,
        isActive,
        isError,
        isScanning,
        // Actions
        startLoading,
        setCameraReady,
        setLocalized,
        setLostTracking,
        triggerError,
        resetSession
    }
})