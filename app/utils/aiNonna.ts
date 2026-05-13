// aiNonna.ts
// Il composable gestisce voce, ascolto e cronologia della chat.
// NON conosce il system prompt — è responsabilità esclusiva del server (chat.post.ts).

import { ref, onUnmounted } from 'vue'
import { useArStore } from '~/stores/arState'

export const useAiNonna = () => {
  const arStore = useArStore()
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isChatMode = ref(false)
  const chatHistory = ref<{ role: string; content: string }[]>([])
  const isNearNonna = ref(false)

  const currentLang = ref<string>('it')
  const currentPoiLabel = ref<string>('')

  let socket: WebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null

  // ─── Pulizia hardware e connessioni ────────────────────────────────────────

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

  // ─── Voce (ElevenLabs) ─────────────────────────────────────────────────────

  const speak = async (text: string) => {
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
            setTimeout(() => startContinuousListening(currentLang.value), 300)
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
        startContinuousListening(currentLang.value)
      }
    }
  }

  // ─── Risposta AI (Groq via server) ─────────────────────────────────────────
  // Il server assembla il system prompt completo a partire da `lang` e `poiId`.
  // Qui inviamo solo la cronologia + i parametri di contesto.

  const processMessage = async (text: string) => {
    chatHistory.value.push({ role: 'user', content: text })

    try {
      const response = await $fetch<any>('/api/chat', {
        method: 'POST',
        body: {
          messages: chatHistory.value.slice(-10),
          poiId: arStore.selectedPoi?.id || 'navigli-generale',
          lang: currentLang.value
        }
      })

      const answer = response.choices?.[0]?.message?.content
      chatHistory.value.push({ role: 'assistant', content: answer })
      await speak(answer)
    } catch (e) {
      console.error('Errore memoria Nonna:', e)
    }
  }

  // ─── Ascolto continuo (Deepgram) ───────────────────────────────────────────

  const startContinuousListening = async (lang: string = 'it') => {
    currentLang.value = lang

    if (isSpeaking.value || isChatMode.value || isListening.value) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const { token } = await $fetch<{ token: string }>('/api/dg-token')
      console.log('🔑 Token ricevuto dal server:', token)

      try {
        console.log('🕵️ Avvio test HTTP verso Deepgram...')
        const testRes = await fetch(
          'https://api.deepgram.com/v1/listen?model=nova-2',
          {
            method: 'POST',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'audio/wav'
            },
            body: new Blob([])
          }
        )
        const errorBody = await testRes.json()
        console.log('🚨 STATO RISPOSTA DEEPGRAM:', testRes.status)
        console.log('🚨 MOTIVO ESATTO DEL BLOCCO:', errorBody)
      } catch (e) {
        console.error('Errore nel test:', e)
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

  onUnmounted(() => stopAll())

  return {
    startContinuousListening,
    processMessage,
    isListening,
    isSpeaking,
    isChatMode,
    chatHistory,
    isNearNonna,
    currentPoiLabel,
    currentLang,
    stopAll
  }
}
