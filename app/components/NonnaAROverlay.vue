<template>
  <!-- AR Layer & Overlay Wrappers -->
  <div
    v-show="!arStore.isIdle"
    class="fixed inset-0 z-[60] pointer-events-none"
  >
    <!-- Debug Panel -->
    <Transition name="fade-slide">
      <div
        v-if="showDebugPanel"
        class="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+75px)] right-4 z-[9998] w60 bg-white/95 rounded-2xl shadow-xl backdrop-blur-xl border border-black/5 overflow-hidden pointer-events-auto"
      >
        <div class="flex items-center gap-2 p-3 border-b border-gray-200/50">
          <div class="w-2 h-2 rounded-full bg-amber-400" />
          <span
            class="flex-1 text-xs font-semibold text-gray-700 tracking-wide"
            >{{ $t('arDebugTitle') }}</span
          >
          <button
            @click="showDebugPanel = false"
            class="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700"
          >
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
        <p class="text-[11px] text-gray-500 px-3.5 pt-2 pb-1">
          {{ $t('arDebugHint') }}
        </p>
        <div class="p-2 flex flex-col gap-1">
          <button
            v-for="poi in debugPois"
            :key="poi.id"
            @click="testPoi(poi.id)"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border-1.5 border-transparent hover:bg-blue-600/10 transition-colors text-left w-full"
            :class="{
              'bg-blue-600/10 border-blue-600/25':
                arStore.selectedPoi?.id === poi.id
            }"
          >
            <div
              class="w-7 h-7 rounded-lg bg-blue-600/10 text-[#2071c1] flex items-center justify-center shrink-0"
              :class="{
                'bg-[#2071c1] text-white': arStore.selectedPoi?.id === poi.id
              }"
            >
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
            <div class="flex-1 min-w-0 flex flex-col">
              <span class="text-sm font-semibold text-gray-800">{{
                poi.label
              }}</span>
              <span class="text-[11px] text-gray-500 truncate">{{
                poi.desc
              }}</span>
            </div>
            <div
              v-if="arStore.selectedPoi?.id === poi.id"
              class="w-5 h-5 rounded-full bg-[#2071c1] text-white flex items-center justify-center shrink-0"
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

  <div
    class="relative w-full h-screen overflow-hidden pointer-events-none"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div
        id="ar-ui-root"
        v-if="arStore.isActive"
        class="fixed inset-0 z-50 flex flex-col justify-between pointer-events-auto"
      >
        <!-- TOP: Status + AI Response -->
        <div
          class="w-full px-4 flex flex-col items-center gap-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] pointer-events-none"
        >
          <Transition name="fade-slide">
            <div
              v-if="agentStatus !== 'idle'"
              :key="agentStatus"
              class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-medium text-white shadow-lg transition-colors"
              :class="agentStatusClass"
            >
              <template v-if="agentStatus === 'listening'">
                <div class="anim-waves"><span /><span /><span /></div>
                <span>{{ $t('arListening') }}</span>
              </template>
              <template v-else-if="agentStatus === 'processing'">
                <div class="anim-dots"><span /><span /><span /></div>
                <span>{{ $t('arProcessing') }}</span>
              </template>
              <template v-else-if="agentStatus === 'speaking'">
                <div class="anim-bars"><span /><span /><span /><span /></div>
                <span>{{ $t('arSpeaking') }}</span>
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
                <span>{{ $t('arRetry') }}</span>
              </template>
            </div>
          </Transition>

          <Transition name="fade-slide">
            <div
              v-if="chatHistory.length > 0"
              class="w-full max-w-[420px] flex items-start gap-3 bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-xl border border-blue-600/10 max-h-[40vh] overflow-y-auto pointer-events-auto"
            >
              <div
                class="shrink-0 w-9 h-9 rounded-full bg-[#2071c1] flex items-center justify-center shadow-md"
              >
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
              <div class="flex-1 min-w-0">
                <p
                  class="text-[11px] font-semibold tracking-wider uppercase text-[#2071c1] mb-1"
                >
                  Nonna di Milano
                </p>
                <p
                  class="text-[15px] leading-relaxed text-gray-800 break-words"
                >
                  {{ chatHistory[chatHistory.length - 1]?.content }}
                </p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- BOTTOM: Controls -->
        <div
          class="w-full px-4 flex flex-col gap-2 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pointer-events-auto"
        >
          <Transition name="fade-slide">
            <div
              v-if="isChatMode"
              class="flex gap-2.5 bg-white/10 border border-white/20 rounded-2xl p-2 pl-4 backdrop-blur-xl"
            >
              <input
                v-model="manualText"
                @keyup.enter="handleSendText"
                type="text"
                :placeholder="$t('arWrite')"
                class="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-white/45 caret-[#2071c1]"
                autofocus
              />
              <button
                @click="handleSendText"
                :disabled="!manualText.trim()"
                class="shrink-0 w-9 h-9 rounded-xl bg-[#2071c1] text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
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

          <div class="flex items-center gap-2">
            <button
              @click="isChatMode = !isChatMode"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-[13px] font-medium backdrop-blur-md border transition-all active:scale-95 whitespace-nowrap"
              :class="
                isChatMode
                  ? 'bg-[#2071c1]/70 border-[#2071c1]/50'
                  : 'bg-white/10 border-white/20'
              "
            >
              <svg
                v-if="!isChatMode"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
              >
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
              <svg
                v-else
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
              >
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
              <span>{{
                isChatMode ? $t('arSwitchVoice') : $t('arCantSpeak')
              }}</span>
            </button>
            <div class="flex-1" />
            <button
              @click="showDebugPanel = !showDebugPanel"
              class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90"
              :class="
                showDebugPanel
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-400'
                  : 'bg-black/55 border-white/20 text-white/75'
              "
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
            <button
              @click="arStore.resetSession"
              class="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gray-800/80 border border-white/10 text-white/90 text-[13px] font-medium backdrop-blur-md transition-all active:scale-95 active:bg-gray-800"
            >
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

      <!-- Loading, Scanning & Error Overlays -->
      <Transition name="fade">
        <div
          v-if="arStore.isLoading"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm"
        >
          <div
            class="w-11 h-11 rounded-full border-4 border-white/15 border-t-[#2071c1] animate-spin"
          />
          <p
            class="text-white font-['Playfair_Display'] text-lg mt-5 tracking-wide"
          >
            {{ $t('arLoading') }}
          </p>
        </div>

        <div
          v-else-if="arStore.isScanning"
          class="absolute inset-0 flex flex-col items-center justify-center gap-8 pointer-events-none"
        >
          <div class="relative w-36 h-36 flex items-center justify-center">
            <div
              class="absolute inset-0 border-white/80 border-2 rounded-lg"
              style="
                clip-path: polygon(
                  0 0,
                  20% 0,
                  20% 100%,
                  0 100%,
                  0 0,
                  100% 0,
                  100% 20%,
                  0 20%,
                  100% 100%,
                  80% 100%,
                  80% 0,
                  100% 0,
                  0 100%,
                  0 80%,
                  100% 80%,
                  100% 100%
                );
              "
            ></div>
            <div
              class="w-12 h-12 rounded-full border-[1.5px] border-white/50 animate-ping opacity-30"
            />
          </div>
          <div
            class="flex items-center gap-2 bg-black/55 text-white/90 text-[13px] px-4 py-2 rounded-full backdrop-blur-md"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{{ $t('arScan') }}</span>
          </div>
        </div>

        <div
          v-else-if="arStore.isError"
          class="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+90px)] left-1/2 -translate-x-1/2 min-w-[280px] w-max max-w-[calc(100vw-32px)] flex items-start gap-3 bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-red-500/15 pointer-events-auto"
        >
          <svg
            class="shrink-0 text-red-500"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle
              cx="10"
              cy="10"
              r="8.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M10 6.5V10.5M10 13.5h.01"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-semibold text-red-700 mb-0.5">
              {{ $t('arOops') }}
            </p>
            <p class="text-[13px] text-gray-600">{{ arStore.errorMessage }}</p>
          </div>
          <button
            @click="arStore.resetSession"
            class="self-center shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
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
import { ref, computed, onMounted, watch } from 'vue'

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
  currentLang
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
  if (typeof window !== 'undefined') {
    isDebugMode.value = new URLSearchParams(window.location.search).has('debug')
  }
})

// ====================================================================================
// HOOK PER FEATURE FUTURA: attivazione chat alla prossimità del modello
// Quando arStore.isNearModel diventa true (segnale USER_NEAR_MODEL dall'iframe),
// qui si potrà avviare automaticamente startContinuousListening.
// ====================================================================================
watch(
  () => arStore.isNearModel,
  (isNear) => {
    if (isNear && arStore.selectedPoi) {
      // TODO: attivare la chat automaticamente quando l'utente si avvicina al modello
      // await startContinuousListening(locale.value)
      console.log('User is near the model — chat can be activated here')
    }
  }
)

const agentStatus = computed<
  'idle' | 'listening' | 'processing' | 'speaking' | 'error'
>(() => {
  if (arStore.isError) return 'error'
  if (isSpeaking.value) return 'speaking'
  if (isListening.value) return 'listening'
  if (chatHistory.value?.[chatHistory.value.length - 1]?.role === 'user')
    return 'processing'
  return 'idle'
})

const agentStatusClass = computed(() => {
  const s = agentStatus.value
  if (s === 'listening') return 'bg-[#2071c1]/90 ring-4 ring-[#2071c1]/20'
  if (s === 'processing') return 'bg-black/75 border border-white/15'
  if (s === 'speaking') return 'bg-emerald-500/90 ring-4 ring-emerald-500/20'
  if (s === 'error') return 'bg-red-500/90'
  return ''
})

const handleSendText = async () => {
  if (!manualText.value.trim()) return
  const text = manualText.value
  manualText.value = ''
  currentLang.value = locale.value
  await processMessage(text)
}

const testPoi = async (id: string) => {
  if (!debugPois.find((p) => p.id === id)) return
  arStore.selectedPoi = { id }
  isNearNonna.value = true
  showDebugPanel.value = false
  arStore.setLocalized()
  await startContinuousListening(locale.value)
}
</script>

<style scoped>
/* Transizioni Unificate (Riducono drasticamente la ripetitività) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.25s,
    transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animazioni pillole di stato (Micro-dettagli complessi non adatti a Tailwind puro) */
.anim-waves,
.anim-bars,
.anim-dots {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 16px;
}
.anim-dots {
  gap: 4px;
}
.anim-waves span,
.anim-bars span {
  width: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
}
.anim-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: dot 1.2s ease-in-out infinite;
}

.anim-waves span {
  animation: wave 1s ease-in-out infinite;
}
.anim-waves span:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}
.anim-waves span:nth-child(2) {
  height: 14px;
  animation-delay: 0.15s;
}
.anim-waves span:nth-child(3) {
  height: 8px;
  animation-delay: 0.3s;
}

.anim-bars span {
  animation: bar 0.8s ease-in-out infinite alternate;
}
.anim-bars span:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}
.anim-bars span:nth-child(2) {
  height: 14px;
  animation-delay: 0.1s;
}
.anim-bars span:nth-child(3) {
  height: 10px;
  animation-delay: 0.2s;
}
.anim-bars span:nth-child(4) {
  height: 6px;
  animation-delay: 0.3s;
}

.anim-dots span:nth-child(1) {
  animation-delay: 0s;
}
.anim-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.anim-dots span:nth-child(3) {
  animation-delay: 0.4s;
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
@keyframes bar {
  from {
    transform: scaleY(0.6);
  }
  to {
    transform: scaleY(1.1);
  }
}
@keyframes dot {
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
</style>