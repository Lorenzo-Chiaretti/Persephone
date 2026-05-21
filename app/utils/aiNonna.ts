// aiNonna.ts

import { ref, onUnmounted } from 'vue'
import { useArStore } from '~/stores/arState'

// Singleton AudioContext — va creato/ripreso in risposta a un gesto utente
let audioCtx: AudioContext | null = null

export const useAiNonna = () => {
  const arStore = useArStore()
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isChatMode = ref(false)
  const chatHistory = ref<{ role: string; content: string }[]>([])
  const isNearNonna = ref(false)
  const shouldContinueListening = ref(false)

  const currentLang = ref<string>('it')
  const currentPoiLabel = ref<string>('')

  const getAudioContext = (): AudioContext => {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext
      audioCtx = new AudioCtxClass()
    }
    // Su iOS il contesto viene sospeso se non c'è interazione: lo riprendiamo
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  }

  /**
   * Sblocca l'audio su iOS/Safari. 
   * Va chiamata all'interno di un evento scatenato dall'utente (click, touch).
   */
  const warmupAudio = () => {
    try {
      const ctx = getAudioContext()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      // Eseguiamo un piccolissimo suono silenzioso per "svegliare" l'hardware
      const buffer = ctx.createBuffer(1, 1, 22050)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)
    } catch (e) {
      console.warn('Audio warmup failed:', e)
    }
  }

  const toggleChatMode = () => {
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

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null

  // ─── Pulizia hardware e connessioni ────────────────────────────────────────

  const stopAll = () => {
    shouldContinueListening.value = false
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
    console.log('🔇 Tutte le risorse sono state liberate.')
  }

  // ─── Voce (ElevenLabs) ─────────────────────────────────────────────────────

  const speak = async (text: string): Promise<boolean> => {
    // Se siamo in modalità chat (tastiera), non sprecare token e mostra solo il testo
    if (isChatMode.value) {
      chatHistory.value.push({ role: 'assistant', content: text })
      return true
    }

    // --- DEBUG: Scommenta la riga sotto per disabilitare l'audio e vedere solo il testo sempre ---
    // chatHistory.value.push({ role: 'assistant', content: text }); return true;

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

      await new Promise<void>((resolve, reject) => {
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)

        source.onended = () => resolve()
        try {
          source.start(0)
        } catch (e) {
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
      if (!isChatMode.value && shouldContinueListening.value) {
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

    if (isSpeaking.value || isChatMode.value || isListening.value) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const { token } = await $fetch<{ token: string }>('/api/dg-token')
      console.log('🔑 Token ricevuto dal server:', token)

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

  onUnmounted(() => {
    stopAll()
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
    warmupAudio
  }
}
