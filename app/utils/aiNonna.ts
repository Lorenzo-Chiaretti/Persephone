// aiNonna.ts

import { ref, onUnmounted, watch } from 'vue'
import { useArStore } from '~/stores/arState'

// ─── STATO CONDIVISO (SHARED STATE) PER PREVENIRE CONFLITTI E MULTIPLE ISTANZE ───
const isListening = ref(false)
const isSpeaking = ref(false)
const isChatMode = ref(false)
const chatHistory = ref<{ role: string; content: string }[]>([])
const isNearNonna = ref(false)
const shouldContinueListening = ref(false)
const isMuted = ref(false)
const isConnecting = ref(false)
const isThinking = ref(false)

// Cache dei blob audio per evitare chiamate ripetute a ElevenLabs per le stesse frasi
const ttsBlobCache = new Map<string, Blob>()

const currentLang = ref<string>('it')
const currentPoiLabel = ref<string>('')

let socket: WebSocket | null = null
let mediaRecorder: MediaRecorder | null = null

// Singleton AudioContext — va creato/ripreso in risposta a un gesto utente
let audioCtx: AudioContext | null = null
// Tracciamento del canale sorgente audio attivo per consentire interruzione immediata
let currentAudioSource: AudioBufferSourceNode | null = null
let currentAudioElement: HTMLAudioElement | null = null
let globalAudioElement: HTMLAudioElement | null = null

const getAudioElement = (): HTMLAudioElement => {
  if (!globalAudioElement && typeof window !== 'undefined') {
    globalAudioElement = new Audio()
    globalAudioElement.preservesPitch = true
  }
  return globalAudioElement!
}

// Controllo intervallo periodico di prossimità ("ogni tot")
let proximityInterval: ReturnType<typeof setInterval> | null = null

export const globalStopNonnaAll = () => {
  shouldContinueListening.value = false
  isMuted.value = false
  
  if (mediaRecorder) {
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    mediaRecorder = null
  }

  if (socket) {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close()
    }
    socket = null
  }

  // Interrompi immediatamente l'audio in riproduzione della Nonna
  if (currentAudioSource) {
    try {
      currentAudioSource.stop()
    } catch (e) {
      // Già fermato o mai avviato
    }
    currentAudioSource = null
  }

  if (currentAudioElement) {
    try {
      currentAudioElement.pause()
      currentAudioElement.currentTime = 0
    } catch (e) {
      // Già fermato o mai avviato
    }
    currentAudioElement = null
  }

  isListening.value = false
  isSpeaking.value = false
}

export const resetNonnaState = () => {
  globalStopNonnaAll()
  chatHistory.value = []
  isChatMode.value = false
  isNearNonna.value = false
  currentLang.value = 'it'
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      globalStopNonnaAll()
    }
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    globalStopNonnaAll()
  })
}

export const useAiNonna = () => {
  const arStore = useArStore()

  const unlockAudio = () => {
    // Configura la sessione audio per ignorare l'interruttore silenzioso di iOS
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback'
      } catch (err) {
        console.warn('Errore configurazione AudioSession:', err)
      }
    }

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        // Riproduciamo un piccolissimo campione di silenzio per sbloccare l'audio hardware su iOS
        const buffer = ctx.createBuffer(1, 1, 22050)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(0)
        console.log('🔊 AudioContext sbloccato con successo per iOS.')
      }).catch((err) => {
        console.error('Impossibile sbloccare l\'AudioContext:', err)
      })
    }

    // Sblocca anche l'elemento audio HTML5 per iOS/Safari
    const audio = getAudioElement()
    if (audio) {
      audio.play().then(() => {
        audio.pause()
        console.log('🔊 HTMLAudioElement sbloccato con successo per iOS.')
      }).catch((err) => {
        console.warn('Impossibile sbloccare HTMLAudioElement:', err)
      })
    }
  }

  const toggleMute = () => {
    unlockAudio()
    isMuted.value = !isMuted.value
    if (isMuted.value) {
      // Disattiva subito microfono e socket Deepgram
      if (mediaRecorder) {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop()
        }
        mediaRecorder.stream.getTracks().forEach((track) => track.stop())
        mediaRecorder = null
      }

      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close()
        }
        socket = null
      }

      isListening.value = false
      console.log('🔇 Microfono silenziato.')
    } else {
      console.log('🔊 Microfono riattivato.')
      if (!isSpeaking.value && !isChatMode.value) {
        startContinuousListening(currentLang.value)
      }
    }
  }

  const toggleChatMode = () => {
    unlockAudio()
    isChatMode.value = !isChatMode.value
    if (isChatMode.value) {
      // Se passiamo a tastiera, spegniamo subito microfono e socket
      globalStopNonnaAll()
    } else {
      // Se torniamo a voce, resettiamo lo stato di stop forzato e ripartiamo
      shouldContinueListening.value = true
      startContinuousListening(currentLang.value)
    }
  }

  const getAudioContext = (): AudioContext => {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext()
    }
    // Su iOS il contesto viene sospeso se non c'è interazione: lo riprendiamo
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  }

  // ─── Pulizia hardware e connessioni ────────────────────────────────────────

  const stopAll = () => {
    globalStopNonnaAll()
  }

  // ─── Voce (ElevenLabs) ─────────────────────────────────────────────────────

  const speak = async (text: string): Promise<boolean> => {
    // Se il testo è vuoto o contiene solo spazi, non facciamo alcuna chiamata a ElevenLabs
    if (!text || !text.trim()) {
      console.log('👵 Nonna: Testo vuoto o non valido per la riproduzione audio.')
      return false
    }

    // Se siamo in modalità chat (tastiera), non sprecare token e mostra solo il testo
    if (isChatMode.value) {
      chatHistory.value.push({ role: 'assistant', content: text })
      return true
    }

    // Se l'utente si è allontanato nel frattempo, non riprodurre l'audio
    if (!arStore.isNearModel) {
      console.log('👵 Nonna: Riproduzione audio annullata (lontano dal modello).')
      return false
    }

    isSpeaking.value = true

    try {
      let audioBlob: Blob
      const cacheKey = text.trim().toLowerCase()

      if (ttsBlobCache.has(cacheKey)) {
        console.log('👵 Nonna: Audio recuperato dalla cache per:', text)
        audioBlob = ttsBlobCache.get(cacheKey)!
      } else {
        console.log('👵 Nonna: Audio non in cache. Chiamata a ElevenLabs in corso per:', text)
        audioBlob = await $fetch<Blob>('/api/tts', {
          method: 'POST',
          body: { text }
        })
        ttsBlobCache.set(cacheKey, audioBlob)
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = getAudioElement()
      audio.src = audioUrl
      audio.playbackRate = 1.25
      audio.preservesPitch = true

      // Mostriamo il testo nel fumetto SOLO ora che l'audio è pronto per partire
      chatHistory.value.push({ role: 'assistant', content: text })

      // Se nel frattempo l'utente si è allontanato, non riprodurre nulla
      if (!arStore.isNearModel) {
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
        return false
      }

      currentAudioElement = audio

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          if (currentAudioElement === audio) {
            currentAudioElement = null
          }
          resolve()
        }

        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl)
          if (currentAudioElement === audio) {
            currentAudioElement = null
          }
          reject(e)
        }

        try {
          audio.play().catch((e) => {
            URL.revokeObjectURL(audioUrl)
            if (currentAudioElement === audio) {
              currentAudioElement = null
            }
            reject(e)
          })
        } catch (e) {
          URL.revokeObjectURL(audioUrl)
          if (currentAudioElement === audio) {
            currentAudioElement = null
          }
          reject(e)
        }
      })

      return true
    } catch (e) {
      console.error('Errore TTS / riproduzione audio:', e)
      // Se l'audio fallisce, mostriamo comunque il testo per non bloccare la chat
      if (!chatHistory.value.some(m => m.content === text)) {
        chatHistory.value.push({ role: 'assistant', content: text })
      }
      return false
    } finally {
      isSpeaking.value = false
      if (!isChatMode.value && shouldContinueListening.value && !isMuted.value && arStore.isNearModel) {
        setTimeout(() => startContinuousListening(currentLang.value), 300)
      }
    }
  }

  // ─── Risposta AI (Groq via server) ─────────────────────────────────────────

  const processMessage = async (text: string, isSilent: boolean = false) => {
    const messagesToSend = [...chatHistory.value.slice(-10)]
    
    if (!isSilent) {
      chatHistory.value.push({ role: 'user', content: text })
    }
    
    messagesToSend.push({ role: 'user', content: text })

    try {
      const response = await $fetch<any>('/api/chat', {
        method: 'POST',
        body: {
          messages: messagesToSend,
          poiId: arStore.selectedPoi?.id || 'navigli-generale',
          lang: currentLang.value
        }
      })

      const answer = response.choices?.[0]?.message?.content
      await speak(answer) // attende che l'audio sia FINITO prima di continuare
    } catch (e: any) {
      const statusCode = e.status || e.statusCode || 'Sconosciuto'
      const statusText = e.statusMessage || e.message || ''
      console.log(`👵❌ [ERRORE GROQ / CHAT]: Chiamata fallita con codice ${statusCode}. Dettaglio:`, statusText)
      console.error('Dettaglio errore completo:', e)
      const errorMsg = currentLang.value === 'en'
        ? "Forgive me, my dear, my old memory had a lapse... Could you repeat your question, please?"
        : "Scusa tesoro, la mia vecchia memoria ha avuto un vuoto... Potresti ripetermi la domanda, per favore?"
      chatHistory.value.push({ role: 'assistant', content: errorMsg })
    }
  }

  // ─── Ascolto continuo (Deepgram) ───────────────────────────────────────────

  const startContinuousListening = async (lang: string = 'it') => {
    // LUCCHETTO: Se stiamo già connettendo, blocca subito qualsiasi altra richiesta
    if (isSpeaking.value || isChatMode.value || isListening.value || isMuted.value || isConnecting.value) return
    
    // Nonna deve essere spawnata per poter ascoltare
    if (!arStore.nonnaSpawned) {
      console.log('👵 Nonna non è ancora spawnata. Microfono inattivo.')
      return
    }
    
    isConnecting.value = true // LUCCHETTO CHIUSO! Nessun altro può entrare.

    currentLang.value = lang
    shouldContinueListening.value = true

    if (!arStore.isNearModel) {
      isListening.value = false
      isConnecting.value = false // Sblocca
      return
    }

    try {
      if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
        try {
          (navigator as any).audioSession.type = 'play-and-record'
        } catch (err) {
          console.warn('Errore configurazione AudioSession per microfono:', err)
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false 
        }
      })
      
      const { token } = await $fetch<{ token: string }>('/api/dg-token')

      if (!arStore.isNearModel || !shouldContinueListening.value || isMuted.value) {
        stream.getTracks().forEach((track) => track.stop())
        isConnecting.value = false // Sblocca
        return
      }

      socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&smart_format=true&endpointing=800&filler_words=true&vad_events=true`,
        ['token', token]
      )

      mediaRecorder = new MediaRecorder(stream)

      socket.onopen = () => {
        isConnecting.value = false // LUCCHETTO APERTO: Connessione riuscita!
        isListening.value = true
        console.log('👵 DEEPGRAM COLLEGATO: Sto ascoltando...')

        mediaRecorder?.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && socket?.readyState === 1) {
            socket.send(event.data)
          }
        })
        
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            mediaRecorder.start(250); 
          } else {
            console.warn("WebSocket aperto, ma il microfono è già attivo. Comando di start ignorato.");
          }
      }

      let stabilityTimer: ReturnType<typeof setTimeout> | null = null

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data)

        // FILTRO ASSOLUTO: Se non è un "Risultato", ignoralo!
        // Questo blocca in automatico i Metadata, gli SpeechStarted e gli UtteranceEnd
        if (data.type !== 'Results') return

        const alternative = data.channel?.alternatives?.[0]
        const transcript = alternative?.transcript
        const confidence = alternative?.confidence || 0

        if (transcript && transcript.trim().length > 0) {
          const cleanWord = transcript.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
          const isShortWhitelist = ['sì', 'si', 'no', 'ok', 'yes', 'okay'].includes(cleanWord)

          // Filtro antirumore: ignora trascrizioni a bassa confidenza (sotto il 50%)
          // A MENO CHE non si tratti di una parola chiave di consenso/risposta breve (es. "sì", "no", "ok")
          if (confidence < 0.50 && !isShortWhitelist) {
            console.log(`👵 [Antirumore] Ignorato: "${transcript}" (Confidenza insufficiente: ${confidence.toFixed(2)})`)
            return
          }

          // Se è nella whitelist, permettiamo di passare purché la confidenza sia almeno 0.35 (per evitare rumori estremi)
          if (isShortWhitelist && confidence < 0.35) {
            console.log(`👵 [Antirumore] Consenso/Negazione ignorato perché la confidenza è estremamente bassa (<35%): "${transcript}"`)
            return
          }

          // Filtro lettere singole ultracorte: se è una singola lettera (es. "a", "e", "o" prodotte da respiri o rumore),
          // deve avere una confidenza quasi assoluta (>= 0.90) per essere considerata valida.
          if (transcript.trim().length === 1 && confidence < 0.90) {
            console.log(`👵 [Antirumore] Ignorato: "${transcript}" (Lettera singola e confidenza sotto 90%)`)
            return
          }

          if (data.is_final) {
            if (stabilityTimer) clearTimeout(stabilityTimer)

            if (data.speech_final) {
              stopAll()
              isThinking.value = true // <--- NUOVO: La nonna inizia a pensare
              await processMessage(transcript)
              isThinking.value = false // <--- NUOVO: Ha finito di pensare (ora parlerà)
            } else {
              stabilityTimer = setTimeout(async () => {
                stopAll()
                isThinking.value = true // <--- NUOVO
                await processMessage(transcript)
                isThinking.value = false // <--- NUOVO
              }, 1500)
            }
          }
        }
      }

      socket.onerror = (err) => {
        console.error('❌ Errore Socket Deepgram:', err)
        isConnecting.value = false // Sblocca in caso di errore
        stopAll()
      }

      socket.onclose = () => {
        console.log('🔇 Connessione Deepgram chiusa')
        isConnecting.value = false // Sblocca alla chiusura
        isListening.value = false
      }
    } catch (err) {
      console.error('Inizializzazione fallita:', err)
      isConnecting.value = false // Sblocca se crasha il microfono o la chiamata API
      isListening.value = false
    }
  }

  // ─── CONTROLLO PERIODICO DI PROSSIMITÀ (OGNI TOT) ───
  if (typeof window !== 'undefined' && !proximityInterval) {
    proximityInterval = setInterval(() => {
      if (arStore.isActive) {
        const isNear = arStore.isNearModel && arStore.nonnaSpawned
        if (isNear) {
          // LUCCHETTO: Il Watchdog controlla anche !isConnecting.value prima di lanciare la funzione
          if (!isListening.value && !isSpeaking.value && !isChatMode.value && !isMuted.value && !isConnecting.value) {
            console.log('👵 [Interval Proximity] Utente vicino e Nonna spawnata, avvio ascolto.')
            startContinuousListening(currentLang.value)
          }
        } else {
          if (isListening.value || isSpeaking.value || shouldContinueListening.value || isConnecting.value) {
            console.log('👵 [Interval Proximity] Utente lontano, interrompo tutto.')
            chatHistory.value = []
            stopAll()
            isConnecting.value = false // Resetta il lucchetto per sicurezza quando ti allontani
          }
        }
      }
    }, 1000) 
  }

  onUnmounted(() => {
    if (proximityInterval) {
      clearInterval(proximityInterval)
      proximityInterval = null
    }
    stopAll()
    if (audioCtx) {
      try {
        audioCtx.close()
      } catch (e) {
        console.warn(e)
      }
      audioCtx = null
    }
  })

  return {
    startContinuousListening,
    processMessage,
    isListening,
    isSpeaking,
    isChatMode,
    toggleChatMode,
    chatHistory,
    isNearNonna,
    currentPoiLabel,
    currentLang,
    stopAll,
    resetNonnaState,
    isMuted,
    toggleMute,
    unlockAudio
  }
}
