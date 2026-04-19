import { defineStore } from "pinia"
import { ref, computed } from "vue" 

export type ArStatus = 'IDLE' | 'LOADING' | 'ACTIVE' | 'ERROR'

export const useArStore = defineStore('ar', () => {

    //STATE
    const status = ref<ArStatus>('IDLE')
    const errorMessage = ref<string | null>(null)
    //TODO: capisci se è utile o è meglio toglierla e se è meglio sostituire any con XRSession
    const session = ref<any | null>(null)

    //GETTERS
    const isIdle = computed(() => status.value === 'IDLE')
    const isLoading = computed(() => status.value === 'LOADING')
    const isActive = computed(() => status.value === 'ACTIVE')
    const isError = computed(() => status.value === 'ERROR')

    //ACTION
    function startLoading() {
        status.value = 'LOADING'
        errorMessage.value = null
    }

    function setSessionActive(xrSession: any = null) {
        status.value = 'ACTIVE'
        session.value = xrSession
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
        // Actions
        startLoading,
        setSessionActive,
        triggerError,
        resetSession
    }
})