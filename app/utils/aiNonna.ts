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

const currentLang = ref<string>('it')
const currentPoiLabel = ref<string>('')

let socket: WebSocket | null = null
let mediaRecorder: MediaRecorder | null = null

// Singleton AudioContext — va creato/ripreso in risposta a un gesto utente
let audioCtx: AudioContext | null = null
// Tracciamento del canale sorgente audio attivo per consentire interruzione immediata
let currentAudioSource: AudioBufferSourceNode | null = null
// Controllo intervallo periodico di prossimità ("ogni tot")
let proximityInterval: ReturnType<typeof setInterval> | null = null

export const useAiNonna = () => {
  const arStore = useArStore()

  const unlockAudio = () => {
    // Configura la sessione audio per ignorare l'interruttore silenzioso di iOS
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback'
        console.log('📱 AudioSession impostata su playback per bypassare il silenzioso.')
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
      stopAll()
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
      if (socket.readyState === WebSocket.OPEN) {
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

    isListening.value = false
    isSpeaking.value = false
    console.log('🔇 Tutte le risorse sono state liberate.')
  }

  // ─── Voce (ElevenLabs) ─────────────────────────────────────────────────────

  const speak = async (text: string): Promise<boolean> => {
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
      const audioBlob = await $fetch<Blob>('/api/tts', {
        method: 'POST',
        body: { text }
      })

      const arrayBuffer = await audioBlob.arrayBuffer()
      const ctx = getAudioContext()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      // Mostriamo il testo nel fumetto SOLO ora che l'audio è pronto per partire
      chatHistory.value.push({ role: 'assistant', content: text })

      // Se nel frattempo l'utente si è allontanato, non riprodurre nulla
      if (!arStore.isNearModel) {
        isSpeaking.value = false
        return false
      }

      await new Promise<void>((resolve, reject) => {
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)
        currentAudioSource = source

        source.onended = () => {
          if (currentAudioSource === source) {
            currentAudioSource = null
          }
          resolve()
        }

        try {
          source.start(0)
        } catch (e) {
          if (currentAudioSource === source) {
            currentAudioSource = null
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
    } catch (e) {
      console.error('Errore memoria Nonna:', e)
    }
  }

  // ─── Ascolto continuo (Deepgram) ───────────────────────────────────────────

  const startContinuousListening = async (lang: string = 'it') => {
    currentLang.value = lang
    shouldContinueListening.value = true

    // L'esperienza vocale deve funzionare se e solo se sono vicino alla nonna
    if (!arStore.isNearModel) {
      console.log('👵 Nonna: Non posso ascoltare perché non sei vicino al modello.')
      isListening.value = false
      return
    }

    if (isSpeaking.value || isChatMode.value || isListening.value || isMuted.value) return

    try {
      // Imposta la sessione in modalità di registrazione e riproduzione su iOS
      if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
        try {
          (navigator as any).audioSession.type = 'play-and-record'
          console.log('📱 AudioSession impostata su play-and-record per il microfono.')
        } catch (err) {
          console.warn('Errore configurazione AudioSession per microfono:', err)
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false // Disattiva il guadagno automatico per ridurre i rumori in sottofondo
        }
      })
      const { token } = await $fetch<{ token: string }>('/api/dg-token')
      console.log('🔑 Token ricevuto dal server:', token)

      // Double check in case proximity changed during token fetch
      if (!arStore.isNearModel) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&smart_format=true&endpointing=300&filler_words=true`,
        ['token', token]
      )

      mediaRecorder = new MediaRecorder(stream)

      socket.onopen = () => {
        isListening.value = true
        console.log('👵 DEEPGRAM COLLEGATO: Sto ascoltando...')

        mediaRecorder?.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && socket?.readyState === 1) {
            socket.send(event.data)
          }
        })
        mediaRecorder?.start(250)
      }

      let stabilityTimer: ReturnType<typeof setTimeout> | null = null

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data)
        if (data.type === 'Metadata') return

        const transcript = data.channel?.alternatives[0]?.transcript

        if (transcript && transcript.trim().length > 0) {
          if (data.is_final) {
            if (stabilityTimer) clearTimeout(stabilityTimer)

            if (data.speech_final) {
              stopAll()
              await processMessage(transcript)
            } else {
              stabilityTimer = setTimeout(async () => {
                stopAll()
                await processMessage(transcript)
              }, 800)
            }
          }
        }
      }

      socket.onerror = (err) => {
        console.error('❌ Errore Socket Deepgram:', err)
        stopAll()
      }

      socket.onclose = () => {
        console.log('🔇 Connessione Deepgram chiusa')
        isListening.value = false
      }
    } catch (err) {
      console.error('Inizializzazione fallita:', err)
      isListening.value = false
    }
  }

  // ─── CONTROLLO PERIODICO DI PROSSIMITÀ (OGNI TOT) ───
  if (typeof window !== 'undefined' && !proximityInterval) {
    console.log('👵 Avvio intervallo di prossimità per la Nonna')
    proximityInterval = setInterval(() => {
      // Controlliamo lo store solo se l'esperienza AR è attiva
      if (arStore.isActive) {
        const isNear = arStore.isNearModel
        if (isNear) {
          // Se siamo vicini e non stiamo facendo nulla, attiviamo l'ascolto
          if (!isListening.value && !isSpeaking.value && !isChatMode.value && !isMuted.value) {
            console.log('👵 [Interval Proximity] Utente vicino, avvio ascolto.')
            startContinuousListening(currentLang.value)
          }
        } else {
          // Se l'utente si allontana, la Nonna smette di ascoltare/parlare
          if (isListening.value || isSpeaking.value || shouldContinueListening.value) {
            console.log('👵 [Interval Proximity] Utente lontano, interrompo tutto.')
            stopAll()
          }
          // Svuota anche la chat per far sparire immediatamente eventuali vecchi fumetti rimasti!
          if (chatHistory.value.length > 0) {
            console.log('👵 [Interval Proximity] Utente lontano, ripulisco la cronologia dei messaggi.')
            chatHistory.value = []
          }
        }
      }
    }, 1000) // Controllo a cadenza di 1 secondo ("ogni tot")
  }

  onUnmounted(() => {
    // Quando il component principale si smonta, ripuliamo l'intervallo ed eseguiamo stop
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
    isMuted,
    toggleMute,
    unlockAudio
  }
}
