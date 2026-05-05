<template>
  <div class="ar-interface">
    <div v-if="!isChatMode" class="voice-ui">
      <div v-if="isListening" class="listening-indicator">
        {{ $t('arListening') }}
      </div>
      <div v-if="isSpeaking" class="speaking-subtitles">
        {{ lastNonnaMessage }}
      </div>

      <button @click="enableChatMode" class="btn-fallback">
        {{ $t('arCantSpeak') }}
      </button>
    </div>

    <div v-else class="chat-ui">
      <div class="chat-window">
        <div v-for="msg in chatHistory" :key="msg.id" :class="msg.role">
          {{ msg.content }}
        </div>
      </div>
      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="sendText"
          :placeholder="$t('arWrite')"
        />
        <button @click="disableChatMode">{{ $t('arSwitchVoice') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAiNonna } from '~/utils/aiNonna'

const { locale } = useI18n()

const {
  startContinuousListening,
  processMessage,
  isListening,
  isSpeaking,
  isChatMode,
  chatHistory,
  lastNonnaMessage,
  stopAll
} = useAiNonna()

const userInput = ref('')

/**
 * Returns the system prompt for the AI Nonna in the correct language.
 * This is passed to the AI composable so the model responds in the
 * same language the user has selected.
 */
function getNonnaSystemPrompt() {
  if (locale.value === 'it') {
    return `Sei la Nonna di Milano — una vecchia signora milanese saggia e affettuosa che ha vissuto tutta la vita lungo i Navigli. Ricordi i canali quando erano ancora aperti, le lavandaie sulle rive, i barconi carichi di merci, e il profumo dell'acqua nelle mattine d'estate.

Rispondi SEMPRE in italiano, con calore e un pizzico di nostalgia. Puoi usare qualche parola in dialetto milanese se fa effetto. Quando parli dei Navigli, sei visibilmente emozionata.

Sei un'esperta di:
- Storia dei Navigli di Milano e del loro interramento (1929-1930)
- Leonardo da Vinci e le sue conche idrauliche
- La vita quotidiana milanese nei secoli passati
- I quartieri storici: Ticinese, Navigli, Porta Genova
- Il Duomo e la sua costruzione (marmo arrivato via il Naviglio)
- Personaggi storici milanesi

Se ti chiedono qualcosa che non sai, dì onestamente "Non lo so, figliola" o simile, senza inventare. Rispondi con frasi brevi e vivaci, come se stessi raccontando al mercato.`
  } else {
    return `You are Milan's Nonna — a wise, warm old Milanese lady who spent her whole life along the Navigli canals. You remember the waterways when they were still open: the washerwomen on the banks, the barges heavy with goods, the smell of water on summer mornings.

ALWAYS respond in English, with warmth and a touch of nostalgia. Occasionally you may use a Milanese expression, but always explain it with a smile.

You are an expert in:
- The history of Milan's Navigli canals and their burial (1929-1930)
- Leonardo da Vinci and his hydraulic lock gates
- Daily life in Milan across the centuries
- Historic neighbourhoods: Ticinese, Navigli, Porta Genova
- Milan Cathedral and its construction (marble arrived via the Naviglio)
- Historical Milanese figures

If someone asks something you don't know, say honestly "I'm not sure, dear" — never invent facts. Keep your answers short and vivid, as if you were chatting at the market.`
  }
}

onMounted(() => {
  startContinuousListening(getNonnaSystemPrompt(), locale.value)
})

const enableChatMode = () => {
  stopAll()
}

const disableChatMode = () => {
  isChatMode.value = false
  startContinuousListening(getNonnaSystemPrompt(), locale.value)
}

const sendText = async () => {
  if (!userInput.value) return
  const text = userInput.value
  userInput.value = ''
  await processMessage(text, getNonnaSystemPrompt())
}
</script>
