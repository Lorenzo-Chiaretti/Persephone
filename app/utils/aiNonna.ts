import { ref, onUnmounted } from 'vue'
import { useArStore } from '~/stores/arState'

export const useAiNonna = () => {
  const arStore = useArStore()
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isChatMode = ref(false)
  const chatHistory = ref<{ role: string; content: string }[]>([])
  const isNearNonna = ref(false)

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null

  // --- FUNZIONE VOCE (ELEVENLABS) ---
  const speak = async (text: string) => {
    if (isChatMode.value) return

    try {
      isSpeaking.value = true

      const audioBlob = await $fetch<Blob>('/api/tts', {
        method: 'POST',
        body: { text }
      })

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      return new Promise((resolve) => {
        // Gestione fine audio naturale
        audio.onended = () => {
          cleanup()
          resolve(true)
        }

        // Gestione errori (es. file corrotto o interruzione)
        audio.onerror = (e) => {
          console.error('Errore riproduzione audio:', e)
          cleanup()
          resolve(false)
        }

        const cleanup = () => {
          isSpeaking.value = false
          URL.revokeObjectURL(audioUrl)
          if (!isChatMode.value) {
            // Un piccolo delay evita che il mic senta l'eco della fine dell'audio
            setTimeout(() => startContinuousListening(), 300)
          }
        }

        // Tenta di riprodurre
        audio.play().catch((err) => {
          console.warn('Autoplay bloccato o errore play:', err)
          cleanup()
          resolve(false)
        })
      })
    } catch (e) {
      console.error('Errore recupero TTS:', e)
      isSpeaking.value = false
      if (!isChatMode.value) startContinuousListening()
    }
  }
  // --- LOGICA DI RISPOSTA (GROQ) ---
  const processMessage = async (text: string) => {
    // Aggiungiamo il messaggio dell'utente alla storia locale
    chatHistory.value.push({ role: 'user', content: text })

    // Teniamo solo gli ultimi 10 messaggi per non appesantire la richiesta
    const limitedHistory = chatHistory.value.slice(-10)

    try {
      const response = await $fetch<any>('/api/chat', {
        method: 'POST',
        body: {
          // Passiamo tutta la storia invece di un singolo messaggio
          messages: limitedHistory,
          poiId: arStore.selectedPoi?.id || 'navigli-generale'
        }
      })

      const answer = response.choices?.[0]?.message?.content

      // Aggiungiamo la risposta della Nonna alla storia locale
      chatHistory.value.push({ role: 'assistant', content: answer })

      await speak(answer)
    } catch (e) {
      console.error('Errore memoria Nonna:', e)
    }
  }
  // --- PULIZIA HARDWARE E CONNESSIONI ---
  const stopAll = () => {
    // 1. Ferma il MediaRecorder e le tracce del microfono
    if (mediaRecorder) {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      mediaRecorder = null
    }

    // 2. Chiudi il WebSocket di Deepgram
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
      socket = null
    }

    isListening.value = false
    console.log('🔇 Tutte le risorse sono state liberate.')
  }

  // --- ASCOLTO CONTINUO DEEPGRAM ---
  const startContinuousListening = async () => {
    if (isSpeaking.value || isChatMode.value || isListening.value) return

    try {
      const { token } = await $fetch<{ token: string }>('/api/dg-token')

      // utils/aiNonna.ts -> startContinuousListening

      socket = new WebSocket(
        // Abbiamo abbassato endpointing a 300 e aggiunto vad_turn_delay
        'wss://api.deepgram.com/v1/listen?model=nova-2&language=it&smart_format=true&endpointing=300&filler_words=true',
        ['token', token]
      )

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Fallback per iOS/Safari che preferiscono audio/mp4 o audio/aac
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : { mimeType: 'audio/mp4' }

      mediaRecorder = new MediaRecorder(stream, options)

      socket.onopen = () => {
        isListening.value = true
        console.log('👵 DEEPGRAM COLLEGATO: Sto ascoltando...')

        mediaRecorder?.addEventListener('dataavailable', (event) => {
          // Se il socket è aperto, spariamo i dati
          if (event.data.size > 0 && socket?.readyState === 1) {
            socket.send(event.data)
          }
        })
        // Intervallo di 250ms per mandare pacchetti audio frequenti
        mediaRecorder?.start(250)
      }

      let stabilityTimer: NodeJS.Timeout | null = null

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data)
        if (data.type === 'Metadata') return

        const transcript = data.channel?.alternatives[0]?.transcript

        if (transcript && transcript.trim().length > 0) {
          console.log('👂 Sentito:', transcript, '(Final:', data.is_final, ')')

          if (data.is_final) {
            // Puliamo eventuali timer precedenti
            if (stabilityTimer) clearTimeout(stabilityTimer)

            // Se Deepgram manda il segnale di silenzio, partiamo subito
            if (data.speech_final) {
              console.log('🎯 Fine discorso rilevata da Deepgram')
              stopAll()
              await processMessage(transcript)
            }
            // Altrimenti, se la frase è Final ma il silenzio non arriva,
            // aspettiamo 800ms e poi forziamo la risposta (Timer di sicurezza)
            else {
              stabilityTimer = setTimeout(async () => {
                console.log(
                  '⏰ Timeout sicurezza: Forzo risposta anche senza speech_final'
                )
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
  onUnmounted(() => stopAll())

  return {
    startContinuousListening,
    processMessage,
    isListening,
    isSpeaking,
    isChatMode,
    chatHistory,
    isNearNonna,
    stopAll
  }
}
