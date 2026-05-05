import { ref, onUnmounted } from 'vue'
import { useArStore } from '~/stores/arState'

export const useAiNonna = () => {
  const arStore = useArStore()
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isChatMode = ref(false)
  const chatHistory = ref<{ role: string; content: string }[]>([])
  const isNearNonna = ref(false)

  const currentSystemPrompt = ref<string>('')
  const currentLang = ref<string>('it')

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null

  // --- PULIZIA HARDWARE E CONNESSIONI ---
  const stopAll = () => {
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
        const cleanup = () => {
          isSpeaking.value = false
          URL.revokeObjectURL(audioUrl)
          if (!isChatMode.value) {
            // Piccolo delay per evitare che il mic senta l'eco della fine dell'audio
            setTimeout(
              () =>
                startContinuousListening(
                  currentSystemPrompt.value,
                  currentLang.value
                ),
              300
            )
          }
        }

        audio.onended = () => {
          cleanup()
          resolve(true)
        }

        audio.onerror = (e) => {
          console.error('Errore riproduzione audio:', e)
          cleanup()
          resolve(false)
        }

        audio.play().catch((err) => {
          console.warn('Autoplay bloccato o errore play:', err)
          cleanup()
          resolve(false)
        })
      })
    } catch (e) {
      console.error('Errore recupero TTS:', e)
      isSpeaking.value = false
      if (!isChatMode.value) {
        startContinuousListening(currentSystemPrompt.value, currentLang.value)
      }
    }
  }

  // --- LOGICA DI RISPOSTA (GROQ) ---
  const processMessage = async (text: string, systemPrompt?: string) => {
    if (systemPrompt) currentSystemPrompt.value = systemPrompt

    chatHistory.value.push({ role: 'user', content: text })
    const limitedHistory = chatHistory.value.slice(-10)

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
          messages: messagesToSend,
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

  // --- ASCOLTO CONTINUO DEEPGRAM ---
  const startContinuousListening = async (
    systemPrompt?: string,
    lang: string = 'it'
  ) => {
    if (systemPrompt) currentSystemPrompt.value = systemPrompt
    currentLang.value = lang

    if (isSpeaking.value || isChatMode.value || isListening.value) return

    try {
      const { token } = await $fetch<{ token: string }>('/api/dg-token')

      socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&smart_format=true&endpointing=300&filler_words=true`,
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
              await processMessage(transcript, currentSystemPrompt.value)
            } else {
              stabilityTimer = setTimeout(async () => {
                stopAll()
                await processMessage(transcript, currentSystemPrompt.value)
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
