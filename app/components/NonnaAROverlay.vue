//nonnaaroverlay.vue

<template>
  <div
    v-show="!arStore.isIdle"
    class="fixed inset-0 z-[60] pointer-events-none"
  >
    <!-- Debug Panel -->
    <Transition name="debug-panel">
      <div v-if="showDebugPanel" class="debug-panel pointer-events-auto">
        <div class="debug-panel__header">
          <div class="debug-panel__dot" />
          <span class="debug-panel__title">{{ $t('arDebugTitle') }}</span>
          <button @click="showDebugPanel = false" class="debug-panel__close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <p class="debug-panel__hint">{{ $t('arDebugHint') }}</p>
        <div class="debug-poi-list">
          <button
            v-for="poi in debugPois"
            :key="poi.id"
            @click="testPoi(poi.id)"
            class="debug-poi-btn"
            :class="{
              'debug-poi-btn--active': arStore.selectedPoi?.id === poi.id
            }"
          >
            <div class="debug-poi-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1C4.79 1 3 2.79 3 5c0 2.625 4 8 4 8s4-5.375 4-8c0-2.21-1.79-4-4-4z"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                />
                <circle
                  cx="7"
                  cy="5"
                  r="1.2"
                  stroke="currentColor"
                  stroke-width="1.2"
                />
              </svg>
            </div>
            <div class="debug-poi-info">
              <span class="debug-poi-name">{{ poi.label }}</span>
              <span class="debug-poi-desc">{{ poi.desc }}</span>
            </div>
            <div
              v-if="arStore.selectedPoi?.id === poi.id"
              class="debug-poi-check"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>

  <!-- ══════════════════════════════════════════
       2. AR LAYER — nascosto quando IDLE
  ══════════════════════════════════════════ -->
  <div
    v-show="!arStore.isIdle"
    class="relative w-full h-screen overflow-hidden bg-black"
  >
    <canvas ref="canvasRef" class="block w-full h-full" />

    <div ref="overlayRef" class="absolute inset-0 pointer-events-none">
      <div
        id="ar-ui-root"
        v-if="arStore.isActive"
        class="fixed inset-0 z-50 flex flex-col items-center justify-between pointer-events-auto"
      >
        <!-- ══════════════════════════
             TOP: Status + Risposta AI
        ══════════════════════════════ -->
        <div
          class="w-full px-4 flex flex-col items-center gap-3 pointer-events-none ar-top"
        >
          <!-- Agent Status Pill -->
          <Transition name="status-fade">
            <div
              v-if="agentStatus !== 'idle'"
              :key="agentStatus"
              class="agent-status-pill pointer-events-none"
              :class="agentStatusClass"
            >
              <template v-if="agentStatus === 'listening'">
                <div class="listening-waves"><span /><span /><span /></div>
                <span class="status-label">{{ $t('arListening') }}</span>
              </template>
              <template v-else-if="agentStatus === 'processing'">
                <div class="processing-dots"><span /><span /><span /></div>
                <span class="status-label">{{ $t('arProcessing') }}</span>
              </template>
              <template v-else-if="agentStatus === 'speaking'">
                <div class="speaking-bars">
                  <span /><span /><span /><span />
                </div>
                <span class="status-label">{{ $t('arSpeaking') }}</span>
              </template>
              <template v-else-if="agentStatus === 'error'">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M8 5v3.5M8 11h.01"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="status-label">{{ $t('arRetry') }}</span>
              </template>
            </div>
          </Transition>

          <!-- AI Response Box -->
          <Transition name="bubble-in">
            <div
              v-if="chatHistory.length > 0"
              class="ai-response-box pointer-events-auto"
            >
              <div class="nonna-avatar">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="8"
                    r="3.5"
                    stroke="white"
                    stroke-width="1.5"
                  />
                  <path
                    d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="response-content">
                <p class="response-label">Nonna di Milano</p>
                <p class="response-text">
                  {{ chatHistory[chatHistory.length - 1]?.content }}
                </p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ══════════════════════════
             BOTTOM: Controls
        ══════════════════════════════ -->
        <div
          class="w-full px-4 flex flex-col gap-2 pointer-events-auto ar-bottom"
        >
          <!-- Chat Input -->
          <Transition name="slide-up">
            <div v-if="isChatMode" class="chat-input-row">
              <input
                v-model="manualText"
                @keyup.enter="handleSendText"
                type="text"
                :placeholder="$t('arWrite')"
                class="chat-input"
                autofocus
              />
              <button
                @click="handleSendText"
                class="chat-send-btn"
                :disabled="!manualText.trim()"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 9h14M9 2l7 7-7 7"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </Transition>

          <div class="action-row">
            <button
              @click="isChatMode = !isChatMode"
              class="toggle-btn"
              :class="{ 'toggle-btn--active': isChatMode }"
            >
              <template v-if="!isChatMode">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="5"
                    y="1"
                    width="6"
                    height="9"
                    rx="3"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M2 8.5c0 3.314 2.686 5.5 6 5.5s6-2.186 6-5.5M8 14v2"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ $t('arCantSpeak') }}</span>
              </template>
              <template v-else>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="4"
                    width="14"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M4 8h1M7.5 8h1M11 8h1M5.5 10.5h5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ $t('arSwitchVoice') }}</span>
              </template>
            </button>

            <div class="flex-1" />

            <button
              @click="showDebugPanel = !showDebugPanel"
              class="debug-floating-btn"
              :class="{ 'debug-floating-btn--active': showDebugPanel }"
              :title="$t('arDebugTitle')"
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2C6.24 2 4 4.24 4 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </button>

            <button @click="arStore.resetSession" class="exit-btn">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 2H14V14H10M7 11L10 8M10 8L7 5M10 8H2"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ $t('arExit') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <Transition name="fade">
        <div
          v-if="arStore.isLoading"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm"
        >
          <div class="loading-ring" />
          <p
            class="text-white font-['Playfair_Display'] text-lg mt-5 tracking-wide"
          >
            {{ $t('arLoading') }}
          </p>
        </div>
      </Transition>

      <!-- Scanning -->
      <Transition name="fade">
        <div v-if="arStore.isScanning" class="scan-overlay pointer-events-none">
          <div class="scan-crosshair">
            <div class="scan-corner scan-corner--tl" />
            <div class="scan-corner scan-corner--tr" />
            <div class="scan-corner scan-corner--bl" />
            <div class="scan-corner scan-corner--br" />
            <div class="scan-pulse" />
          </div>
          <div class="scan-hint">
            <span class="scan-hint__dot" />
            <span>{{ $t('arScan') }}</span>
          </div>
        </div>
      </Transition>

      <!-- Error Toast -->
      <Transition name="toast-in">
        <div v-if="arStore.isError" class="error-toast pointer-events-auto">
          <svg
            class="shrink-0"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle
              cx="10"
              cy="10"
              r="8.5"
              stroke="#ef4444"
              stroke-width="1.5"
            />
            <path
              d="M10 6.5V10.5M10 13.5h.01"
              stroke="#ef4444"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <div class="flex-1">
            <p class="error-toast__title">{{ $t('arOops') }}</p>
            <p class="error-toast__msg">{{ arStore.errorMessage }}</p>
          </div>
          <button @click="arStore.resetSession" class="error-toast__retry">
            {{ $t('arRetry') }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArStore } from '~/stores/arState'
import { useAiNonna } from '~/utils/aiNonna'
import { ref, computed, onMounted } from 'vue'

const arStore = useArStore()
const { locale } = useI18n()

const {
  startContinuousListening,
  processMessage,
  isListening,
  isSpeaking,
  isChatMode,
  chatHistory,
  isNearNonna,
  currentLang,
  stopAll
} = useAiNonna()

const debugPois = [
  { id: 'via-senato', label: 'Via Senato', desc: 'Naviglio della Martesana' },
  { id: 'laghetto-marco', label: 'Laghetto', desc: 'Laghetto di S. Marco' },
  { id: 'conca-fallata', label: 'Conca Fallata', desc: 'Conca leonardesca' }
]

const showDebugPanel = ref(false)
const manualText = ref('')

const isDebugMode = ref(false)

onMounted(() => {
  // Controlla se c'è ?debug nell'URL quando il componente viene montato
  if (typeof window !== 'undefined') {
    isDebugMode.value = new URLSearchParams(window.location.search).has('debug')
  }
})

// ─── Agent status ────────────────────────────────────────────────────────────

const agentStatus = computed<
  'idle' | 'listening' | 'processing' | 'speaking' | 'error'
>(() => {
  if (arStore.isError) return 'error'
  if (isSpeaking.value) return 'speaking'
  if (isListening.value) return 'listening'
  const last = chatHistory.value?.[chatHistory.value.length - 1]
  if (last?.role === 'user') return 'processing'
  return 'idle'
})

const agentStatusClass = computed(() => ({
  'agent-status-pill--listening': agentStatus.value === 'listening',
  'agent-status-pill--processing': agentStatus.value === 'processing',
  'agent-status-pill--speaking': agentStatus.value === 'speaking',
  'agent-status-pill--error': agentStatus.value === 'error'
}))

// ─── Chat testuale ────────────────────────────────────────────────────────────
// Il system prompt è gestito esclusivamente dal server (chat.post.ts).
// Il client passa solo `lang` e `poiId` tramite lo store.

const handleSendText = async () => {
  if (!manualText.value.trim()) return
  const text = manualText.value
  manualText.value = ''
  currentLang.value = locale.value
  await processMessage(text)
}

// ─── Debug POI ────────────────────────────────────────────────────────────────
// Il bottone è nel debug-layer (sempre nel DOM) → il click arriva sempre.
// 1. Imposta il POI e chiude il panel
// 2. Porta lo store in ACTIVE → mostra l'AR layer
// 3. Avvia l'ascolto → getUserMedia chiede il permesso microfono qui,
//    dentro un gesto utente diretto, come richiesto dalla policy del browser.

const testPoi = async (id: string) => {
  const poi = debugPois.find((p) => p.id === id)
  if (!poi) return
  arStore.selectedPoi = { id }
  isNearNonna.value = true
  showDebugPanel.value = false
  arStore.setLocalized()
  await startContinuousListening(locale.value)
}

const startArSession = async () => {
  arStore.setLocalized()
}

defineExpose({ startArSession })
</script>

<style scoped>
/* ═══════════════════════════════════
   SAFE-AREA
═══════════════════════════════════ */
.ar-top {
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
}
.ar-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
}

canvas {
  touch-action: pan-y;
}

/* ═══════════════════════════════════
   DEBUG FLOATING BUTTON
═══════════════════════════════════ */
.debug-floating-btn {
  /* Rimosso position: fixed, bottom e right */
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.15s;
  flex-shrink: 0;
}

/* ═══════════════════════
   DEBUG PANEL
═══════════════════════ */
.debug-panel {
  position: fixed;
  /* Ora il pannello "galleggia" appena sopra la barra dei bottoni */
  bottom: calc(env(safe-area-inset-bottom, 0px) + 75px);
  right: 16px;
  z-index: 9998;
  width: 240px;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.26),
    0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.debug-floating-btn--active {
  background: rgba(251, 191, 36, 0.22);
  border-color: rgba(251, 191, 36, 0.5);
  color: #fbbf24;
}

.debug-floating-btn:active {
  transform: scale(0.92);
}

.agent-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 12px;
  border-radius: 9999px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  transition:
    background 0.3s,
    color 0.3s;
}
.status-label {
  line-height: 1;
}
.agent-status-pill--listening {
  background: rgba(32, 113, 193, 0.88);
  color: #fff;
  box-shadow:
    0 0 0 4px rgba(32, 113, 193, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.2);
}
.agent-status-pill--processing {
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.agent-status-pill--speaking {
  background: rgba(16, 185, 129, 0.88);
  color: #fff;
  box-shadow:
    0 0 0 4px rgba(16, 185, 129, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.2);
}
.agent-status-pill--error {
  background: rgba(239, 68, 68, 0.88);
  color: #fff;
}

.listening-waves,
.speaking-bars {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 16px;
}
.processing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.listening-waves span {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
  animation: wave 1s ease-in-out infinite;
}
.listening-waves span:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}
.listening-waves span:nth-child(2) {
  height: 14px;
  animation-delay: 0.15s;
}
.listening-waves span:nth-child(3) {
  height: 8px;
  animation-delay: 0.3s;
}
@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.6);
    opacity: 0.7;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.processing-dots span {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: bounce-dot 1.2s ease-in-out infinite;
}
.processing-dots span:nth-child(1) {
  animation-delay: 0s;
}
.processing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.processing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes bounce-dot {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.speaking-bars span {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
  animation: bar 0.8s ease-in-out infinite alternate;
}
.speaking-bars span:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}
.speaking-bars span:nth-child(2) {
  height: 14px;
  animation-delay: 0.1s;
}
.speaking-bars span:nth-child(3) {
  height: 10px;
  animation-delay: 0.2s;
}
.speaking-bars span:nth-child(4) {
  height: 6px;
  animation-delay: 0.3s;
}
@keyframes bar {
  from {
    transform: scaleY(0.6);
  }
  to {
    transform: scaleY(1.1);
  }
}

/* ═══════════════════════
   AI RESPONSE BOX
═══════════════════════ */
.ai-response-box {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.26),
    0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(32, 113, 193, 0.1);
  max-height: 40vh;
  overflow-y: auto;
}
.nonna-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2071c1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(32, 113, 193, 0.3);
}
.response-content {
  flex: 1;
  min-width: 0;
}
.response-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2071c1;
  margin-bottom: 5px;
}
.response-text {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: #424242;
  word-break: break-word;
}

/* ═══════════════════════
   BOTTOM CONTROLS
═══════════════════════ */
.chat-input-row {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 18px;
  padding: 8px 8px 8px 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  caret-color: #2071c1;
}
.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}
.chat-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #2071c1;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
  flex-shrink: 0;
}
.chat-send-btn:disabled {
  opacity: 0.35;
}
.chat-send-btn:not(:disabled):active {
  transform: scale(0.93);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  white-space: nowrap;
}
.toggle-btn--active {
  background: rgba(32, 113, 193, 0.7);
  border-color: rgba(32, 113, 193, 0.5);
}
.toggle-btn:active {
  transform: scale(0.96);
}

.exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 9999px;
  background: rgba(66, 66, 66, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.88);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  white-space: nowrap;
  flex-shrink: 0;
}
.exit-btn:active {
  transform: scale(0.95);
  background: rgba(66, 66, 66, 0.98);
}

.debug-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(66, 66, 66, 0.08);
}
.debug-panel__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fbbf24;
}
.debug-panel__title {
  flex: 1;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #424242;
  letter-spacing: 0.03em;
}
.debug-panel__close {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(66, 66, 66, 0.08);
  border: none;
  color: #424242;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.debug-panel__close:hover {
  background: rgba(66, 66, 66, 0.16);
}
.debug-panel__hint {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: rgba(66, 66, 66, 0.5);
  padding: 8px 14px 4px;
}
.debug-poi-list {
  padding: 4px 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.debug-poi-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.debug-poi-btn:hover {
  background: rgba(32, 113, 193, 0.08);
}
.debug-poi-btn--active {
  background: rgba(32, 113, 193, 0.1);
  border-color: rgba(32, 113, 193, 0.25);
}
.debug-poi-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(32, 113, 193, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2071c1;
  flex-shrink: 0;
}
.debug-poi-btn--active .debug-poi-icon {
  background: #2071c1;
  color: #fff;
}
.debug-poi-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.debug-poi-name {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #424242;
}
.debug-poi-desc {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: rgba(66, 66, 66, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.debug-poi-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2071c1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

/* ═══════════════════════
   SCANNING
═══════════════════════ */
.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.scan-crosshair {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scan-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: rgba(255, 255, 255, 0.8);
  border-style: solid;
}
.scan-corner--tl {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
  border-radius: 4px 0 0 0;
}
.scan-corner--tr {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
  border-radius: 0 4px 0 0;
}
.scan-corner--bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 2px 2px;
  border-radius: 0 0 0 4px;
}
.scan-corner--br {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 4px 0;
}
.scan-pulse {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  animation: scan-pulse 2s ease-in-out infinite;
}
@keyframes scan-pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}
.scan-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
}
.scan-hint__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fbbf24;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ═══════════════════════
   LOADING
═══════════════════════ */
.loading-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #2071c1;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══════════════════════
   ERROR TOAST
═══════════════════════ */
.error-toast {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 90px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: calc(100vw - 32px);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.15);
}
.error-toast__title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #b91c1c;
  margin-bottom: 2px;
}
.error-toast__msg {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(66, 66, 66, 0.7);
}
.error-toast__retry {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #dc2626;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  align-self: center;
}
.error-toast__retry:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* ═══════════════════════
   TRANSITIONS
═══════════════════════ */
.status-fade-enter-active,
.status-fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.status-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.92);
}
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

.bubble-in-enter-active {
  transition:
    opacity 0.3s,
    transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.bubble-in-leave-active {
  transition: opacity 0.2s;
}
.bubble-in-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}
.bubble-in-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition:
    opacity 0.25s,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.debug-panel-enter-active {
  transition:
    opacity 0.2s,
    transform 0.25s cubic-bezier(0.34, 1.5, 0.64, 1);
}
.debug-panel-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s ease-in;
}
.debug-panel-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
  transform-origin: bottom right;
}
.debug-panel-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(4px);
  transform-origin: bottom right;
}

.toast-in-enter-active {
  transition:
    opacity 0.25s,
    transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.toast-in-leave-active {
  transition: opacity 0.2s;
}
.toast-in-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
.toast-in-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
