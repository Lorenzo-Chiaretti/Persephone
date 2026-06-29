// aiNonna.ts

import { ref, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
const interimTranscript = ref('')

// Cache dei blob audio per evitare chiamate ripetute a ElevenLabs per le stesse frasi
const ttsBlobCache = new Map<string, Blob>()

const currentLang = ref<string>('it')
const currentPoiLabel = ref<string>('')

let socket: WebSocket | null = null
let mediaRecorder: MediaRecorder | null = null

// Singleton AudioContext — va creato/ripreso in risposta a un gesto utente
let audioCtx: AudioContext | null = null
let audioSourceNode: MediaElementAudioSourceNode | null = null
let gainNode: GainNode | null = null
// Tracciamento del canale sorgente audio attivo per consentire interruzione immediata
let currentAudioSource: AudioBufferSourceNode | null = null
let currentAudioElement: HTMLAudioElement | null = null
let globalAudioElement: HTMLAudioElement | null = null

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
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close()
    }
    socket = null
  }

  // Interrompi immediatamente l'audio in riproduzione della Sciura
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
  interimTranscript.value = ''
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
  const { locale } = useI18n()

  // Sincronizza inizialmente la lingua della Sciura con quella impostata nell'app
  if (locale && locale.value) {
    currentLang.value = locale.value
  }

  // Tieni sincronizzata la lingua se l'utente la cambia a runtime
  watch(
    () => locale.value,
    (newLoc) => {
      if (!newLoc) return
      console.log(`👵 [aiNonna] Lingua cambiata in: ${newLoc}`)
      currentLang.value = newLoc

      // Se sta già ascoltando, riavvia la sessione con la nuova lingua per ri-configurare Deepgram
      if (isListening.value && !isSpeaking.value && !isChatMode.value) {
        globalStopNonnaAll()
        setTimeout(() => {
          if (arStore.isNearModel && !isMuted.value) {
            startContinuousListening(newLoc)
          }
        }, 100)
      }
    }
  )

  const unlockAudio = () => {
    // Configura la sessione audio per ignorare l'interruttore silenzioso di iOS
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try {
        ;(navigator as any).audioSession.type = 'playback'
      } catch (err) {
        console.warn('Errore configurazione AudioSession:', err)
      }
    }

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          // Riproduciamo un piccolissimo campione di silenzio per sbloccare l'audio hardware su iOS
          const buffer = ctx.createBuffer(1, 1, 22050)
          const source = ctx.createBufferSource()
          source.buffer = buffer
          source.connect(ctx.destination)
          source.start(0)
          console.log('🔊 AudioContext sbloccato con successo per iOS.')
        })
        .catch((err) => {
          console.error("Impossibile sbloccare l'AudioContext:", err)
        })
    }

    // Sblocca anche l'elemento audio HTML5 per iOS/Safari
    const audio = getAudioElement()
    if (audio && audio.paused && !isSpeaking.value) {
      audio
        .play()
        .then(() => {
          audio.pause()
          console.log('🔊 HTMLAudioElement sbloccato con successo per iOS.')
        })
        .catch((err) => {
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

  // getAudioContext spostato a livello di modulo per l'uso in getAudioElement

  // ─── Pulizia hardware e connessioni ────────────────────────────────────────

  const stopAll = () => {
    globalStopNonnaAll()
  }

  const interruptSpeech = () => {
    if (isSpeaking.value) {
      if (currentAudioSource) {
        try {
          currentAudioSource.stop()
        } catch (e) {}
      }
      if (currentAudioElement) {
        try {
          currentAudioElement.pause()
          currentAudioElement.currentTime = 0
        } catch (e) {}
        if (currentAudioElement.onended) {
          currentAudioElement.onended(new Event('ended') as any)
        } else {
          currentAudioElement.dispatchEvent(new Event('ended'))
        }
      }
    }
  }

  // ─── Voce (ElevenLabs) ─────────────────────────────────────────────────────

const speak = async (text: string): Promise<boolean> => {
    if (!text || !text.trim()) {
      console.log('👵 Sciura: Testo vuoto o non valido per la riproduzione audio.')
      return false
    }

    if (isChatMode.value) {
      chatHistory.value.push({ role: 'assistant', content: text })
      return true
    }

    if (!arStore.isNearModel) {
      console.log('👵 Sciura: Riproduzione audio annullata (lontano dal modello).')
      return false
    }

    isSpeaking.value = true

    try {
      let audioBlob: Blob
      const cacheKey = text.trim().toLowerCase()

      if (ttsBlobCache.has(cacheKey)) {
        console.log('👵 Sciura: Audio recuperato dalla cache per:', text)
        audioBlob = ttsBlobCache.get(cacheKey)!
      } else {
        console.log('👵 Sciura: Audio non in cache. Chiamata a ElevenLabs in corso per:', text)
        audioBlob = await $fetch<Blob>('/api/tts', {
          method: 'POST',
          body: { text }
        })
        ttsBlobCache.set(cacheKey, audioBlob)
      }

      // ─── RIPRODUZIONE VIA WEB AUDIO API PURA ───
      const ctx = getAudioContext()
      
      // Assicuriamoci che il contesto sia sveglio
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(e => console.warn("Impossibile riprendere AudioContext:", e))
      }

      // Convertiamo il Blob in ArrayBuffer e lo decodifichiamo
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      // Creiamo i nodi per riproduzione, velocità e volume
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = 1.12 // Velocità 1.25x

      const localGainNode = ctx.createGain()
      localGainNode.gain.value = 2.5 // Boost volume a 250%

      // Colleghiamo i nodi: Sorgente -> Volume -> Casse
      source.connect(localGainNode)
      localGainNode.connect(ctx.destination)

      currentAudioSource = source // Salviamo la reference per poterlo stoppare (globalStopNonnaAll)

      // Mostriamo il testo nel fumetto
      chatHistory.value.push({ role: 'assistant', content: text })

      if (!arStore.isNearModel) {
        isSpeaking.value = false
        return false
      }

      // Facciamo partire l'audio e aspettiamo che finisca
      await new Promise<void>((resolve) => {
        source.onended = () => {
          if (currentAudioSource === source) {
            currentAudioSource = null
          }
          resolve()
        }
        source.start(0)
      })

      return true
    } catch (e) {
      console.error('Errore TTS / riproduzione audio:', e)
      if (!chatHistory.value.some((m) => m.content === text)) {
        chatHistory.value.push({ role: 'assistant', content: text })
      }
      return false
    } finally {
      isSpeaking.value = false
      if (
        !isChatMode.value &&
        shouldContinueListening.value &&
        !isMuted.value &&
        arStore.isNearModel
      ) {
        setTimeout(() => startContinuousListening(currentLang.value), 300)
      }
    }
  }

  // ─── Risposta AI (Groq via server) ─────────────────────────────────────────

  const processMessage = async (text: string, isSilent: boolean = false) => {
    if (!isSilent) {
      chatHistory.value.push({ role: 'user', content: text })
    }

    let rawMessages = chatHistory.value.slice(-10)
    if (isSilent) {
      rawMessages = [...rawMessages, { role: 'user', content: text }].slice(-10)
    }

    const messagesToSend = rawMessages.map((m) => ({
      role: m.role,
      content: m.content
    }))

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
      console.log(
        `👵❌ [ERRORE GROQ / CHAT]: Chiamata fallita con codice ${statusCode}. Dettaglio:`,
        statusText
      )
      console.error('Dettaglio errore completo:', e)
      const errorMsg =
        currentLang.value === 'en'
          ? 'Forgive me, my dear, my old memory had a lapse... Could you repeat your question, please?'
          : 'Scusa tesoro, la mia vecchia memoria ha avuto un vuoto... Potresti ripetermi la domanda, per favore?'
      chatHistory.value.push({ role: 'assistant', content: errorMsg })
    }
  }

  // ─── Ascolto continuo (Deepgram) ───────────────────────────────────────────

  const startContinuousListening = async (lang: string = 'it') => {
    // LUCCHETTO: Se stiamo già connettendo, blocca subito qualsiasi altra richiesta
    if (
      isSpeaking.value ||
      isChatMode.value ||
      isListening.value ||
      isMuted.value ||
      isConnecting.value ||
      isThinking.value
    )
      return

    // La Sciura deve essere spawnata per poter ascoltare
    if (!arStore.nonnaSpawned) {
      console.log('👵 Sciura non è ancora spawnata. Microfono inattivo.')
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
          ;(navigator as any).audioSession.type = 'play-and-record'
        } catch (err) {
          console.warn('Errore configurazione AudioSession per microfono:', err)
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      const { token } = await $fetch<{ token: string }>('/api/dg-token')

      if (
        !arStore.isNearModel ||
        !shouldContinueListening.value ||
        isMuted.value
      ) {
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
          mediaRecorder.start(250)
        } else {
          console.warn(
            'WebSocket aperto, ma il microfono è già attivo. Comando di start ignorato.'
          )
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
          const cleanWord = transcript
            .trim()
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
          const isShortWhitelist = [
            'sì',
            'si',
            'no',
            'ok',
            'yes',
            'okay',
            'certo',
            'sure',
            'yeah',
            'yep',
            'nope',
            'nop',
            'va bene'
          ].includes(cleanWord)

          // Filtro antirumore: ignora trascrizioni a bassa confidenza (sotto il 25%)
          // A MENO CHE non si tratti di una parola chiave di consenso/risposta breve (es. "sì", "no", "ok")
          if (confidence < 0.25 && !isShortWhitelist) {
            console.log(
              `👵 [Antirumore] Ignorato: "${transcript}" (Confidenza insufficiente: ${confidence.toFixed(2)})`
            )
            return
          }

          // Se è nella whitelist, permettiamo di passare purché la confidenza sia almeno 0.25 (per evitare rumori estremi)
          if (isShortWhitelist && confidence < 0.25) {
            console.log(
              `👵 [Antirumore] Consenso/Negazione ignorato perché la confidenza è estremamente bassa (<25%): "${transcript}"`
            )
            return
          }

          // Filtro lettere singole ultracorte: se è una singola lettera (es. "a", "e", "o" prodotte da respiri o rumore),
          // deve avere una confidenza quasi assoluta (>= 0.90) per essere considerata valida.
          if (transcript.trim().length === 1 && confidence < 0.9) {
            console.log(
              `👵 [Antirumore] Ignorato: "${transcript}" (Lettera singola e confidenza sotto 90%)`
            )
            return
          }

          // Aggiorna sempre il feedback testuale
          interimTranscript.value = transcript

          if (data.is_final) {
            if (stabilityTimer) clearTimeout(stabilityTimer)

            if (data.speech_final) {
              stopAll()
              isThinking.value = true // <--- NUOVO: La nonna inizia a pensare
              await processMessage(transcript)
              interimTranscript.value = ''
              isThinking.value = false // <--- NUOVO: Ha finito di pensare (ora parlerà)
            } else {
              stabilityTimer = setTimeout(async () => {
                stopAll()
                isThinking.value = true // <--- NUOVO
                await processMessage(transcript)
                interimTranscript.value = ''
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
          // LUCCHETTO: Il Watchdog controlla anche !isConnecting.value e !isThinking.value prima di lanciare la funzione
          if (
            !isListening.value &&
            !isSpeaking.value &&
            !isChatMode.value &&
            !isMuted.value &&
            !isConnecting.value &&
            !isThinking.value
          ) {
            console.log(
              '👵 [Interval Proximity] Utente vicino e Sciura spawnata, avvio ascolto.'
            )
            startContinuousListening(currentLang.value)
          }
        } else {
          if (
            isListening.value ||
            isSpeaking.value ||
            shouldContinueListening.value ||
            isConnecting.value
          ) {
            console.log(
              '👵 [Interval Proximity] Utente lontano, interrompo microfono e audio.'
            )
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
    isThinking,
    isChatMode,
    toggleChatMode,
    chatHistory,
    isNearNonna,
    currentPoiLabel,
    currentLang,
    stopAll,
    interruptSpeech,
    resetNonnaState,
    isMuted,
    toggleMute,
    unlockAudio,
    interimTranscript
  }
}
