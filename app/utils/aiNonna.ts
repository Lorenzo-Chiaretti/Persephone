import { ref, onUnmounted } from 'vue'
import { useArStore } from '~/stores/arState'

export const useAiNonna = () => {
  const arStore = useArStore()
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isChatMode = ref(false)
  const chatHistory = ref<{ role: string; content: string }[]>([])
  const isNearNonna = ref(false)

  // NUOVO: Salviamo il prompt di sistema corrente
  const currentSystemPrompt = ref<string>('')

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null

  // --- FUNZIONE VOCE (ELEVENLABS) ---
  const speak = async (text: string) => {
    // ... il tuo codice esistente per speak rimane invariato ...
  }

  // --- LOGICA DI RISPOSTA (GROQ) ---
  // NUOVO: Accettiamo il systemPrompt come secondo parametro opzionale
  const processMessage = async (text: string, systemPrompt?: string) => {
    // Aggiorniamo il prompt salvato se ne viene passato uno nuovo
    if (systemPrompt) currentSystemPrompt.value = systemPrompt

    chatHistory.value.push({ role: 'user', content: text })
    const limitedHistory = chatHistory.value.slice(-10)

    // NUOVO: Creiamo l'array di messaggi includendo il System Prompt all'inizio
    const messagesToSend = [
      {
        role: 'system',
        content: currentSystemPrompt.value || 'Sei un assistente utile.'
      },
      ...limitedHistory
    ]

    try {
      const response = await $fetch<any>('/api/chat', {
        method: 'POST',
        body: {
          messages: messagesToSend, // Invia i messaggi col system prompt
          poiId: arStore.selectedPoi?.id || 'navigli-generale'
        }
      })

      const answer = response.choices?.[0]?.message?.content
      chatHistory.value.push({ role: 'assistant', content: answer })
      await speak(answer)
    } catch (e) {
      console.error('Errore memoria Nonna:', e)
    }
  }

  const stopAll = () => {
    // ... il tuo codice esistente per stopAll ...
  }

  // --- ASCOLTO CONTINUO DEEPGRAM ---
  // NUOVO: Accettiamo il systemPrompt in modo che quando Deepgram ascolta, sa quale prompt usare
  // --- ASCOLTO CONTINUO DEEPGRAM ---
  const startContinuousListening = async (systemPrompt?: string) => {
    if (systemPrompt) currentSystemPrompt.value = systemPrompt

    if (isSpeaking.value || isChatMode.value || isListening.value) return

    try {
      const { token } = await $fetch<{ token: string }>('/api/dg-token')

      socket = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&language=it&smart_format=true&endpointing=300&filler_words=true',
        ['token', token]
      )

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : { mimeType: 'audio/mp4' }

      mediaRecorder = new MediaRecorder(stream, options)

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

      // ECCO LA RIGA MANCANTE: Dichiariamo il timer qui!
      let stabilityTimer: ReturnType<typeof setTimeout> | null = null

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data)
        if (data.type === 'Metadata') return

        const transcript = data.channel?.alternatives[0]?.transcript

        if (transcript && transcript.trim().length > 0) {
          if (data.is_final) {
            // Ora TypeScript riconosce la variabile
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
