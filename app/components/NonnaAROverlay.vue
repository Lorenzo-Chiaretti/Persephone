<template>
  <div class="ar-interface">
    <div v-if="!isChatMode" class="voice-ui">
      <div v-if="isListening" class="listening-indicator">
        👵 La Nonna ti ascolta...
      </div>
      <div v-if="isSpeaking" class="speaking-subtitles">
        {{ lastNonnaMessage }}
      </div>

      <button @click="enableChatMode" class="btn-fallback">
        🔇 Non posso parlare/ascoltare
      </button>
    </div>

    <div v-else class="chat-ui">
      <div class="chat-window">
        <div v-for="msg in chatHistory" :class="msg.role">
          {{ msg.content }}
        </div>
      </div>
      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="sendText"
          placeholder="Scrivi alla nonna..."
        />
        <button @click="disableChatMode">Torna alla voce</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAiNonna } from '~/utils/aiNonna'

const {
  startContinuousListening,
  processMessage,
  isListening,
  isSpeaking,
  isChatMode,
  chatHistory,
  stopAll
} = useAiNonna()

const userInput = ref('')

onMounted(() => {
  // All'avvio in AR, la nonna è subito pronta ad ascoltare
  startContinuousListening()
})

const enableChatMode = () => {
  stopAll() // Spegne il microfono
}

const disableChatMode = () => {
  isChatMode.value = false
  startContinuousListening() // Riattiva il microfono
}

const sendText = async () => {
  if (!userInput.value) return
  const text = userInput.value
  userInput.value = ''
  await processMessage(text)
}
</script>
