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

  <div class="relative w-full h-screen overflow-hidden pointer-events-none">
    <div class="absolute inset-0 pointer-events-none">
      <div
        id="ar-ui-root"
        v-if="arStore.isActive"
        class="fixed inset-0 z-50 flex flex-col justify-between pointer-events-none"
      >
        <!-- EXIT BUTTON: Top-right corner (always visible in AR) -->
        <button
          @click="handleExit"
          class="ar-exit-top-btn pointer-events-auto"
          :title="$t('arExit')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- TOP: Status + AI Response -->
        <div
          v-show="arStore.nonnaSpawned"
          class="w-full px-4 flex flex-col items-center gap-3 pt-[calc(env(safe-area-inset-top,0px)+56px)] pointer-events-none"
        >

          <!-- USER FEEDBACK BUBBLE -->
          <Transition name="fade-slide">
            <div
              v-if="userFeedbackText && !isChatMode"
              class="w-full max-w-[360px] self-end flex justify-end"
            >
              <div class="bg-blue-600/90 border border-blue-400/30 backdrop-blur-xl rounded-2xl rounded-tr-sm p-3.5 shadow-lg pointer-events-auto">
                <p class="text-[14.5px] font-medium text-white leading-relaxed whitespace-pre-line">
                  {{ userFeedbackText }}
                </p>
              </div>
            </div>
          </Transition>

          <Transition name="fade-slide">
            <div
              v-if="isBubbleVisible"
              class="w-full max-w-[360px] flex items-start gap-3.5 bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl relative overflow-hidden pointer-events-auto transition-all duration-300"
            >
              <!-- Glowing background accents -->
              <div
                class="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl animate-pulse pointer-events-none"
              />
              <div
                class="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl animate-pulse pointer-events-none"
              />

              <!-- Elegant Grandma Avatar -->
              <div class="relative shrink-0 z-10">
                <div
                  class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_12px_rgba(32,113,193,0.25)] border border-white/20"
                >
                  <span class="text-2xl select-none">👵</span>
                </div>
                <!-- Mini Pulsing Status Indicator Dot -->
                <span class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span
                    v-if="agentStatus !== 'idle'"
                    class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    :class="{
                      'bg-blue-400': agentStatus === 'listening',
                      'bg-amber-400': agentStatus === 'processing',
                      'bg-emerald-400': agentStatus === 'speaking' || agentStatus === 'error'
                    }"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-black/85"
                    :class="{
                      'bg-blue-500': agentStatus === 'listening',
                      'bg-amber-500': agentStatus === 'processing',
                      'bg-emerald-500': agentStatus === 'speaking',
                      'bg-red-500': agentStatus === 'error',
                      'bg-gray-300': agentStatus === 'idle'
                    }"
                  ></span>
                </span>
              </div>

              <!-- Message Text and Details -->
              <div class="flex-1 min-w-0 flex flex-col gap-1 z-10">
                <!-- Title row with equalizer -->
                <div class="flex items-center gap-2">
                  <span class="text-[12px] font-extrabold tracking-wider uppercase text-emerald-400">
                    Sciura di Milano
                  </span>
                  <!-- Animated sound equalizer bars during speech -->
                  <div
                    v-if="agentStatus === 'speaking'"
                    class="flex items-end gap-[2px] h-3 shrink-0"
                  >
                    <span class="w-[2px] bg-emerald-400 rounded-full animate-bar-wave-1"></span>
                    <span class="w-[2px] bg-emerald-400 rounded-full animate-bar-wave-2"></span>
                    <span class="w-[2px] bg-emerald-400 rounded-full animate-bar-wave-3"></span>
                    <span class="w-[2px] bg-emerald-400 rounded-full animate-bar-wave-4"></span>
                  </div>
                </div>

                <!-- Text Area (scrollable for longer text) -->
                <div class="text-[14.5px] leading-relaxed text-white/95 break-words max-h-[25vh] overflow-y-auto pr-2 pb-6 custom-dialogue-scroll font-medium mt-1 relative z-10">
                  <!-- Case 1: Listening State -->
                  <template v-if="!isChatMode && agentStatus === 'listening'">
                    <span class="text-cyan-400 italic font-semibold">
                      {{ $t('arListeningBubble') }}
                    </span>
                  </template>

                  <!-- Case 2: Thinking State -->
                  <template v-else-if="agentStatus === 'processing'">
                    <div class="flex flex-col gap-1.5">
                      <span class="text-amber-400 italic font-semibold">
                        {{ $t('arProcessingBubble') }}
                      </span>
                      <!-- Dynamic jumping skeleton dots -->
                      <div class="flex items-center gap-1.5 py-1">
                        <span class="w-2 h-2 bg-amber-400/50 rounded-full animate-bounce-dot-1"></span>
                        <span class="w-2 h-2 bg-amber-400/75 rounded-full animate-bounce-dot-2"></span>
                        <span class="w-2 h-2 bg-amber-400 rounded-full animate-bounce-dot-3"></span>
                      </div>
                    </div>
                  </template>

                  <!-- Case 3: Display Nonna's response -->
                  <template v-else-if="lastNonnaResponse">
                    <p class="whitespace-pre-line">
                      {{ lastNonnaResponse }}
                    </p>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- BOTTOM: Floating Controls (iPhone Lock Screen layout) -->

        <!-- CTA: "Parla con la Sciura" — centered pill -->
        <Transition name="fade-slide">
          <div
            v-if="arStore.waterVisible && !arStore.nonnaSpawned"
            class="ar-cta-floating pointer-events-auto"
          >
            <button @click="spawnNonna" class="ar-pill-btn ar-pill-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{{ $t('arTalkToNonna') }}</span>
            </button>
          </div>
        </Transition>

        <!-- CTA: "Bring the Water Back!" — centered pill -->
        <Transition name="fade-slide">
          <div
            v-if="arStore.modelPlaced && !arStore.waterVisible && arStore.showFallbackButton && agentStatus !== 'speaking'"
            class="ar-cta-floating pointer-events-auto"
          >
            <button @click="triggerWater" class="ar-pill-btn ar-pill-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span>{{ $t('arBringWaterBack') }}</span>
            </button>
          </div>
        </Transition>

        <!-- STOP SPEAKING BUTTON -->
        <Transition name="fade-slide">
          <div
            v-if="agentStatus === 'speaking'"
            class="ar-cta-floating pointer-events-auto"
          >
            <button @click="interruptSpeech" class="ar-pill-btn bg-red-500/90 hover:bg-red-500 text-white border-red-400/50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
              </svg>
              <span>{{ $t('arStopTalking') || 'Stop' }}</span>
            </button>
          </div>
        </Transition>

        <!-- Chat Input — floating above bottom buttons -->
        <Transition name="fade-slide">
          <div
            v-if="isChatMode && arStore.nonnaSpawned"
            class="ar-chat-floating pointer-events-auto"
          >
            <div class="ar-chat-input-row">
              <input
                v-model="manualText"
                @keyup.enter="handleSendText"
                type="text"
                :placeholder="$t('arWrite')"
                class="ar-chat-input"
                autofocus
              />
              <button
                @click="handleSendText"
                :disabled="!manualText.trim()"
                class="ar-chat-send-btn"
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
          </div>
        </Transition>

        <!-- BOTTOM CORNERS: iPhone Lock Screen layout -->
        <div v-if="arStore.nonnaSpawned" class="ar-lockscreen-bottom pointer-events-auto">
          <!-- Bottom-Left: Keyboard/Voice toggle -->
          <button
            @click="toggleChatMode"
            class="ar-corner-btn"
            :class="isChatMode ? 'ar-corner-btn-active' : ''"
            :title="isChatMode ? $t('arSwitchVoice') : $t('arCantSpeak')"
          >
            <svg
              v-if="!isChatMode"
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <line x1="6" y1="8" x2="6" y2="8" />
              <line x1="10" y1="8" x2="10" y2="8" />
              <line x1="14" y1="8" x2="14" y2="8" />
              <line x1="18" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="18" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <svg
              v-else
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </button>

          <!-- Bottom-Right: Mic Mute toggle (voice mode only) -->
          <Transition name="fade-slide">
            <button
              v-if="!isChatMode"
              @click="toggleMute"
              class="ar-corner-btn"
              :class="isMuted ? 'ar-corner-btn-danger' : 'ar-corner-btn-listening'"
              :title="isMuted ? $t('arResumeListening') : $t('arStopListening')"
            >
              <svg
                v-if="!isMuted"
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <svg
                v-else
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 11a7 7 0 0 1-1.35 4.1" />
                <path d="M9.16 14.84A7 7 0 0 1 5 11v-1" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </Transition>
        </div>
      </div>

      <!-- Loading, Scanning & Error Overlays -->
      <Transition name="fade">
        <div
          v-if="arStore.isLoading"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none backdrop-blur-sm"
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
      </Transition>
      <Transition name="fade">
        <div
          v-if="arStore.isScanning"
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
      </Transition>
      <Transition name="fade">
        <div
          v-if="arStore.isError"
          class="absolute inset-0 pointer-events-none"
        >
          <div
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
              <p class="text-[13px] text-gray-600">
                {{ arStore.errorMessage }}
              </p>
            </div>
            <button
              @click="handleExit"
              class="self-center shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              {{ $t('arRetry') }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- Proximity Warning Overlay -->
      <Transition name="fade-slide">
        <div
          v-if="showProximityWarning"
          class="absolute top-[calc(env(safe-area-inset-top,0px)+110px)] left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <div class="bg-slate-900/95 backdrop-blur-3xl border border-white/20 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]" style="max-width: 90vw; width: max-content;">
            
            <!-- Pulsing Warning Icon -->
            <div class="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
              <div class="relative flex items-center justify-center h-8 w-8 bg-amber-500/20 rounded-full border border-amber-400/50">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>

            <!-- Text -->
            <span class="font-semibold text-[14.5px] leading-snug text-white/95">
              {{ $t('arGetCloser') }}
            </span>

            <!-- Close Button -->
            <button
              @click="dismissProximityWarning"
              class="ml-1 shrink-0 w-7 h-7 bg-white/10 hover:bg-white/25 border border-white/10 rounded-full flex items-center justify-center text-white/90 active:scale-90 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArStore } from '~/stores/arState'
import { useAiNonna } from '~/utils/aiNonna'
import { ref, computed, watch } from 'vue'

const arStore = useArStore()
const { locale } = useI18n()
const {
  startContinuousListening,
  processMessage,
  isListening,
  isSpeaking,
  isChatMode,
  toggleChatMode,
  chatHistory,
  isNearNonna,
  currentLang,
  isMuted,
  toggleMute,
  unlockAudio,
  stopAll,
  interruptSpeech,
  resetNonnaState,
  interimTranscript
} = useAiNonna()

const debugPois = [
  { id: 'via-senato', label: 'Via Senato', desc: 'Naviglio della Martesana' },
  {
    id: 'laghetto-san-marco',
    label: 'Laghetto San Marco',
    desc: 'Cuore commerciale'
  },
  {
    id: 'laghetto-stefano',
    label: 'Laghetto S. Stefano',
    desc: 'Il porto del marmo'
  }
]

const showDebugPanel = ref(false)
const manualText = ref('')

const showProximityWarning = ref(false)
const warningDismissed = ref(false)
let proximityWarningTimer: ReturnType<typeof setTimeout> | null = null

const dismissProximityWarning = () => {
  showProximityWarning.value = false
  warningDismissed.value = true
}

// ====================================================================================
// HOOK PROSSIMITÀ: attiva chat se vicino, mostra avviso se lontano
// ====================================================================================
const handleProximityCheck = () => {
  if (arStore.isNearModel) {
    if (proximityWarningTimer) {
      clearTimeout(proximityWarningTimer)
      proximityWarningTimer = null
    }
    showProximityWarning.value = false
    warningDismissed.value = false

    if (arStore.selectedPoi) {
      console.log('User is near the model — chat can be activated here')
    }
  } else if (arStore.nonnaSpawned && !warningDismissed.value) {
    if (proximityWarningTimer) clearTimeout(proximityWarningTimer)
    proximityWarningTimer = setTimeout(() => {
      if (!arStore.isNearModel && arStore.nonnaSpawned && !warningDismissed.value) {
        showProximityWarning.value = true
      }
    }, 5000)
  } else {
    // Se non è spawnata, pulisci e nascondi tutto
    showProximityWarning.value = false
    if (proximityWarningTimer) {
      clearTimeout(proximityWarningTimer)
      proximityWarningTimer = null
    }
  }
}

watch(() => arStore.isNearModel, handleProximityCheck)
watch(() => arStore.nonnaSpawned, handleProximityCheck)

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

const lastNonnaResponse = computed(() => {
  const assistantMsgs = chatHistory.value.filter((m) => m.role === 'assistant')
  return assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1]?.content : ''
})
const userFeedbackText = computed(() => {
  if (interimTranscript.value) return interimTranscript.value
  if (agentStatus.value === 'processing' || agentStatus.value === 'speaking') {
    const userMsgs = chatHistory.value.filter((m) => m.role === 'user')
    return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1]?.content : ''
  }
  return ''
})

const isBubbleVisible = computed(() => {
  return (
    !!lastNonnaResponse.value ||
    (!isChatMode.value &&
      (agentStatus.value === 'listening' ||
        agentStatus.value === 'processing' ||
        agentStatus.value === 'speaking'))
  )
})

const handleSendText = async () => {
  if (!manualText.value.trim()) return
  const text = manualText.value
  manualText.value = ''
  currentLang.value = locale.value
  await processMessage(text)
}

const handleExit = () => {
  resetNonnaState()
  arStore.resetSession()
}

const triggerWater = () => {
  arStore.waterVisible = true
}

const spawnNonna = () => {
  arStore.nonnaSpawned = true
  
  // Wait for spawn animation before listening
  setTimeout(() => {
    startContinuousListening(locale.value)
  }, 1500)
}

const testPoi = async (id: string) => {
  if (!debugPois.find((p) => p.id === id)) return
  arStore.selectedPoi = { id }
  arStore.nonnaSpawned = true
  isNearNonna.value = true
  showDebugPanel.value = false
  arStore.setLocalized()

  // Start listening immediately without forcing a greeting
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

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.45);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 28px rgba(6, 182, 212, 0.7);
  }
}

@keyframes listening-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(32, 113, 193, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 22px rgba(32, 113, 193, 0.75);
    transform: scale(1.06);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   EXIT BUTTON — Top-right corner
   ═══════════════════════════════════════════════════════════════════════ */

.ar-exit-top-btn {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 14px);
  right: 16px;
  z-index: 40;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: rgba(254, 202, 202, 0.9);
  cursor: pointer;
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-tap-highlight-color: transparent;
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15), 0 0 10px rgba(239, 68, 68, 0.1);
}
.ar-exit-top-btn:active {
  transform: scale(0.88);
  background: rgba(239, 68, 68, 0.45);
  color: white;
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING PILL CTA BUTTONS (Water / Spawn Nonna)
   ═══════════════════════════════════════════════════════════════════════ */

.ar-cta-floating {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 20;
}

.ar-pill-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
  animation: pill-glow 2.5s ease-in-out infinite;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}
.ar-pill-btn:active {
  transform: scale(0.95);
}

.ar-pill-blue {
  background: rgba(37, 99, 235, 0.85);
  border-color: rgba(96, 165, 250, 0.6);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2);
}
.ar-pill-blue:active {
  background: rgba(29, 78, 216, 0.95);
  color: white;
}

.ar-pill-cyan {
  background: rgba(6, 182, 212, 0.25);
  border-color: rgba(34, 211, 238, 0.4);
  color: rgba(207, 250, 254, 0.95);
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2), 0 0 12px rgba(6, 182, 212, 0.1);
}
.ar-pill-cyan:active {
  background: rgba(6, 182, 212, 0.45);
  color: white;
}

@keyframes pill-glow {
  0%, 100% {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), 0 0 12px rgba(255, 255, 255, 0.06);
  }
  50% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING CHAT INPUT
   ═══════════════════════════════════════════════════════════════════════ */

.ar-chat-floating {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 96px);
  left: 12px;
  right: 12px;
  z-index: 25;
}

.ar-chat-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(20, 20, 20, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  padding: 8px 8px 8px 24px;
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  backdrop-filter: blur(24px) saturate(1.5);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.ar-chat-input-row:focus-within {
  background: rgba(30, 30, 30, 0.85);
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(96, 165, 250, 0.25) inset;
}

.ar-chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  line-height: 24px;
  caret-color: #3b82f6;
}

.ar-chat-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.ar-chat-send-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.ar-chat-send-btn:disabled {
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: default;
}

.ar-chat-send-btn:active:not(:disabled) {
  transform: scale(0.9);
}

/* ═══════════════════════════════════════════════════════════════════════
   CORNER BUTTONS — iPhone Lock Screen Layout
   ═══════════════════════════════════════════════════════════════════════ */

.ar-lockscreen-bottom {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
  left: 24px;
  right: 24px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.ar-corner-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}
.ar-corner-btn:active {
  transform: scale(0.88);
}

/* Active state (e.g., chat mode on) */
.ar-corner-btn-active {
  background: rgba(32, 113, 193, 0.65);
  border-color: rgba(96, 165, 250, 0.4);
  color: white;
  box-shadow: 0 0 18px rgba(32, 113, 193, 0.4), 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* Listening state (mic active, pulsing) */
.ar-corner-btn-listening {
  background: rgba(32, 113, 193, 0.3);
  border-color: rgba(96, 165, 250, 0.5);
  color: white;
  box-shadow: 0 0 20px rgba(32, 113, 193, 0.4);
  animation: listening-pulse 1.8s infinite ease-in-out;
}

/* Danger/muted state */
.ar-corner-btn-danger {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(252, 165, 165, 0.3);
  color: rgba(252, 165, 165, 0.95);
}

/* ── Dialogue Bubble Premium Additions ── */

/* Custom scrollbar for glass dialogue card */
.custom-dialogue-scroll {
  /* Elegant fade at the bottom to hint at more content */
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.custom-dialogue-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-dialogue-scroll::-webkit-scrollbar-track {
  background: rgba(32, 113, 193, 0.08);
  border-radius: 10px;
  margin-bottom: 12px; /* keep scrollbar out of the extreme fade zone */
}
.custom-dialogue-scroll::-webkit-scrollbar-thumb {
  background: rgba(32, 113, 193, 0.45);
  border-radius: 10px;
}
.custom-dialogue-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(32, 113, 193, 0.65);
}

/* Sound equalizer visualizer bar animations */
.animate-bar-wave-1 {
  animation: bar-wave 0.8s ease-in-out infinite alternate;
  animation-delay: 0.1s;
  height: 4px;
}
.animate-bar-wave-2 {
  animation: bar-wave 0.8s ease-in-out infinite alternate;
  animation-delay: 0.3s;
  height: 10px;
}
.animate-bar-wave-3 {
  animation: bar-wave 0.8s ease-in-out infinite alternate;
  animation-delay: 0s;
  height: 7px;
}
.animate-bar-wave-4 {
  animation: bar-wave 0.8s ease-in-out infinite alternate;
  animation-delay: 0.2s;
  height: 5px;
}

@keyframes bar-wave {
  0% {
    height: 3px;
    transform: translateY(0);
  }
  100% {
    height: 12px;
    transform: translateY(-1px);
  }
}

/* Jumping skeleton dot animations for thinking phase */
.animate-bounce-dot-1 {
  animation: bounce-dot 1.2s infinite ease-in-out;
  animation-delay: 0s;
}
.animate-bounce-dot-2 {
  animation: bounce-dot 1.2s infinite ease-in-out;
  animation-delay: 0.2s;
}
.animate-bounce-dot-3 {
  animation: bounce-dot 1.2s infinite ease-in-out;
  animation-delay: 0.4s;
}

@keyframes bounce-dot {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-5px) scale(1.15);
    opacity: 1;
  }
}
</style>
