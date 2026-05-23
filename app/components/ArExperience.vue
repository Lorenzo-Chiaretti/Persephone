<template>
  <div class="fixed inset-0 z-50 pointer-events-none">

    <!-- "BRING THE WATER BACK!" VOCAL UI & FALLBACK -->
    <div v-if="modelPlaced && !waterVisible" class="absolute inset-x-4 top-4 z-20 flex flex-col items-center gap-3">
      
      <!-- Premium Voice Indicator Card -->
      <Transition name="fade-slide">
        <div 
          v-if="isListening" 
          class="w-full max-w-[360px] bg-black/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden pointer-events-auto"
        >
          <!-- Glowing background accent -->
          <div class="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

          <!-- Mic Icon and Pulse Animation -->
          <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <!-- Pulsing outer rings -->
            <div class="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-60 scale-125" />
            <div class="absolute -inset-1 rounded-full border border-cyan-400/30 animate-pulse" />
            
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
            </svg>
          </div>

          <!-- Prompt text -->
          <div class="text-center z-10">
            <p class="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-0.5">
              {{ locale?.toLowerCase()?.startsWith('it') ? 'Controllo Vocale' : 'Voice Command' }}
            </p>
            <p class="text-white text-[15px] font-medium leading-tight">
              {{ locale?.toLowerCase()?.startsWith('it') ? 'Pronuncia "Risveglia i navigli!"' : 'Say "Bring the water back!"' }}
            </p>
          </div>



          <!-- Subtle Waveform Animation -->
          <div class="flex items-center gap-1 h-3 my-1">
            <span class="w-[3px] h-2 bg-cyan-400 rounded-full animate-wave-bar" style="animation-delay: 0s" />
            <span class="w-[3px] h-3 bg-cyan-400 rounded-full animate-wave-bar" style="animation-delay: 0.15s" />
            <span class="w-[3px] h-1.5 bg-cyan-400 rounded-full animate-wave-bar" style="animation-delay: 0.3s" />
            <span class="w-[3px] h-4 bg-cyan-400 rounded-full animate-wave-bar" style="animation-delay: 0.45s" />
            <span class="w-[3px] h-2.5 bg-cyan-400 rounded-full animate-wave-bar" style="animation-delay: 0.6s" />
          </div>

          <!-- Draining progress bar -->
          <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden absolute bottom-0 left-0 right-0">
            <div 
              class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75"
              :style="{ width: `${timeoutProgress}%` }"
            />
          </div>
        </div>
      </Transition>

      <!-- Fallback physical button -->
      <Transition name="fade-slide">
        <button 
          v-if="showFallbackButton || listeningError"
          @click="triggerWater"
          class="shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 border border-white/20 text-white font-semibold text-sm shadow-xl backdrop-blur-md hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all duration-350 pointer-events-auto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
          </svg>
          <span>{{ locale?.toLowerCase()?.startsWith('it') ? 'Attiva Acqua Manualmente' : 'Bring the Water Back!' }}</span>
        </button>
      </Transition>

    </div>

    <div
      v-if="sceneReady && !modelPlaced"
      class="absolute bottom-12 left-0 right-0 z-20 flex justify-center pointer-events-auto"
    >
      <span class="bg-black/60 text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg border border-white/10 text-center">
        {{ $t('arPlaceHint') }}
      </span>
    </div>

    <!-- A-Frame Scene -->
    <iframe 
      ref="iframeRef"
      :src="iframeSrc" 
      allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone;"
      class="absolute top-0 left-0 w-full h-full border-none z-0 pointer-events-auto"
    ></iframe>

  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
  import { useArStore } from '~/stores/arState'
  import { useAiNonna } from '~/utils/aiNonna'

  const arStore = useArStore()
  const { locale } = useI18n()
  const { stopAll: stopNonnaAll, startContinuousListening: startNonnaListening, isListening: isNonnaListening } = useAiNonna()

  const modelPlaced = computed({
    get: () => arStore.modelPlaced,
    set: (val) => { arStore.modelPlaced = val }
  })
  const waterVisible = computed({
    get: () => arStore.waterVisible,
    set: (val) => { arStore.waterVisible = val }
  })
  const sceneReady = computed({
    get: () => arStore.sceneReady,
    set: (val) => { arStore.sceneReady = val }
  })
  const iframeRef = ref<HTMLIFrameElement | null>(null)

  // Voice activation state
  const isListening = ref(false)
  const listeningError = ref(false)
  const showFallbackButton = ref(false)
  const timeoutProgress = ref(100)
  const liveTranscript = ref('')

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null
  let audioStream: MediaStream | null = null
  let timerInterval: ReturnType<typeof setInterval> | null = null
  let wasNonnaListening = false

  // Pass POI id as query string
  const iframeSrc = computed(() => {
    const poi = arStore.selectedPoi
    if (!poi?.id) return '/ar-scene.html'
    const params = new URLSearchParams({ poi: poi.id })
    if (poi.isIndoor) params.set('mode', 'indoor')
    return `/ar-scene.html?${params.toString()}`
  })

  const stopVoiceListening = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (mediaRecorder) {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      mediaRecorder = null
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
      audioStream = null
    }
    if (socket) {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
      socket = null
    }
    isListening.value = false
    liveTranscript.value = ''
  }

  const triggerWater = () => {
    waterVisible.value = true
  }

  // Watcher per quando l'acqua viene attivata (sia tramite controllo vocale, pulsante locale o overlay di Nonna)
  watch(waterVisible, (visible) => {
    if (visible) {
      stopVoiceListening()
      iframeRef.value?.contentWindow?.postMessage({ type: 'TRIGGER_WATER' }, '*')
      
      // Ripristiniamo l'ascolto di Nonna se era attivo in precedenza
      if (wasNonnaListening) {
        setTimeout(() => {
          console.log("👵 Ripristino dell'ascolto continuo di Nonna...")
          startNonnaListening(locale.value)
        }, 500)
      }
    }
  })

  const handleVoiceError = () => {
    listeningError.value = true
    showFallbackButton.value = true
    stopVoiceListening()
    
    // Ripristiniamo l'ascolto di Nonna immediatamente in caso di errore vocale
    if (wasNonnaListening) {
      console.log("👵 Errore vocale, ripristino immediato dell'ascolto di Nonna...")
      startNonnaListening(locale.value)
    }
  }

  const startVoiceListening = async () => {
    // Salva lo stato di ascolto di Nonna prima di spegnere per liberare il microfono
    wasNonnaListening = isNonnaListening.value
    if (wasNonnaListening) {
      console.log('👵 Nonna sta ascoltando. Spegnimento temporaneo per evitare conflitti microfono...')
      stopNonnaAll()
      // Piccolo ritardo per permettere al browser e sistema operativo di rilasciare il microfono
      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    isListening.value = true
    listeningError.value = false
    showFallbackButton.value = false
    timeoutProgress.value = 100
    liveTranscript.value = ''

    // Timer per fallback (15 secondi) e spegnimento totale di sicurezza (30 secondi)
    const duration = 15000
    const absoluteLimit = 30000
    const intervalTime = 50
    let elapsed = 0

    timerInterval = setInterval(() => {
      elapsed += intervalTime
      
      // La barra di progresso scorre fino a 15 secondi (duration)
      timeoutProgress.value = Math.max(0, 100 - (elapsed / duration) * 100)
      
      if (elapsed >= duration && !showFallbackButton.value) {
        showFallbackButton.value = true
      }
      
      if (elapsed >= absoluteLimit) {
        console.log('⏳ Timeout assoluto (30s) raggiunto. Disattivazione totale del microfono e Deepgram per risparmio token.')
        stopVoiceListening()
      }
    }, intervalTime)

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false // help in noisy environments to avoid amplifying ambient noise
        }
      })
      const { token } = await $fetch<{ token: string }>('/api/dg-token')
      
      const isIt = locale.value?.toLowerCase()?.startsWith('it')
      const lang = isIt ? 'it' : 'en'
      socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&smart_format=true&endpointing=300&filler_words=true`,
        ['token', token]
      )

      mediaRecorder = new MediaRecorder(audioStream)

      socket.onopen = () => {
        console.log('🎙️ Deepgram per Water attivato! Lingua impostata:', lang)
        mediaRecorder?.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && socket?.readyState === 1) {
            socket.send(event.data)
          }
        })
        mediaRecorder?.start(250)
      }

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data)
        if (data.type === 'Metadata') return

        const transcript = data.channel?.alternatives[0]?.transcript?.trim()
        if (transcript && transcript.length > 0) {
          liveTranscript.value = transcript
          
          const lowerTranscript = transcript.toLowerCase()
          
          // Rilevamento italiano super flessibile e robusto
          const matchItalian = 
            lowerTranscript.includes('risveglia i navigli') ||
            lowerTranscript.includes('risveglia navigli') ||
            (lowerTranscript.includes('risveglia') && lowerTranscript.includes('navigli')) ||
            lowerTranscript.includes('risveglia') ||
            lowerTranscript.includes('navigli') ||
            lowerTranscript.includes('acqua')

          // Rilevamento inglese super flessibile e robusto
          const matchEnglish = 
            lowerTranscript.includes('bring the water back') ||
            lowerTranscript.includes('bring back the water') ||
            (lowerTranscript.includes('bring') && lowerTranscript.includes('water') && lowerTranscript.includes('back')) ||
            (lowerTranscript.includes('water') && lowerTranscript.includes('back')) ||
            lowerTranscript.includes('water') ||
            lowerTranscript.includes('bring') ||
            // Supporto per quando la lingua è impostata su IT ma l'utente parla inglese, 
            // e Deepgram trascrive foneticamente in parole italiane
            lowerTranscript.includes('uoter') ||
            lowerTranscript.includes('vuoter')

          if (matchItalian || matchEnglish) {
            console.log('✅ Comando vocale rilevato (unificato)! Attivazione acqua in corso...', lowerTranscript)
            triggerWater()
          }
        }
      }

      socket.onerror = (err) => {
        console.error('❌ Errore Socket Deepgram Water:', err)
        handleVoiceError()
      }

      socket.onclose = () => {
        console.log('🔇 Connessione Deepgram Water chiusa')
        isListening.value = false
      }

    } catch (err) {
      console.error('❌ Inizializzazione vocale fallita:', err)
      handleVoiceError()
    }
  }

  // Watcher per far partire l'ascolto vocale appena il modello viene piazzato
  watch(modelPlaced, (placed) => {
    if (placed && !waterVisible.value) {
      startVoiceListening()
    }
  })

  const handleIframeMessages = (event: MessageEvent) => {
    if (!event.data || !event.data.type) return

    switch (event.data.type) {
      case 'AR_READY':
        console.log('Vue (from iframe): Iframe AR caricato e pronto!')
        sceneReady.value = true
        arStore.setLocalized()
        break
      
      case 'MODEL_PLACED':
        console.log('Vue (from iframe): Model Placed!')
        arStore.modelPlaced = true
        break
      
      case 'USER_NEAR_MODEL':
        console.log('Vue (from iframe): User is near the model!')
        arStore.isNearModel = true
        break
      
      case 'USER_FAR_FROM_MODEL': 
        console.log('Vue (from iframe): User is far from the model!')
        arStore.isNearModel = false
        break
    }
  }

  // ====================================================================================
  // MOUNTING AND UNMOUNTING
  // ====================================================================================

  onMounted(() => {
    window.addEventListener('message', handleIframeMessages)
  })

  onUnmounted(() => {
    stopVoiceListening()
    // Forced iframe cleanup
    if (iframeRef.value) {
      iframeRef.value.src = 'about:blank'
    }
    arStore.resetSession()
    window.removeEventListener('message', handleIframeMessages)
  })
</script>

<style scoped>
.animate-wave-bar {
  animation: wavePulse 0.8s ease-in-out infinite alternate;
}

@keyframes wavePulse {
  from {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  to {
    transform: scaleY(1.2);
    opacity: 1;
  }
}

/* Transizioni */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>