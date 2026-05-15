<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        class="absolute inset-0 bg-[#424242]/45 cursor-pointer"
        @click="emit('close')"
      />

      <Transition name="slide-up" appear>
        <div
          class="relative z-10 w-full max-w-[480px] bg-[#0f0e1a] rounded-t-[20px] sm:rounded-[20px] overflow-hidden max-h-[92dvh] overflow-y-auto"
        >
          <button
            class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 cursor-pointer transition-colors hover:bg-white/20"
            @click="emit('close')"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- ═══ RULES PHASE — swipeable onboarding cards ═══ -->
          <Transition name="fade">
            <div v-if="phase === 'rules'" class="flex flex-col pb-6">
              <!-- Slider -->
              <div
                ref="sliderRef"
                class="relative overflow-hidden w-full select-none"
                style="touch-action: pan-y; height: 560px"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerCancel"
              >
                <div
                  class="flex w-full"
                  style="will-change: transform"
                  :style="{
                    transform: `translateX(calc(-${slideIndex * 100}% + ${dragOffset}px))`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 350ms cubic-bezier(0.4,0,0.2,1)'
                  }"
                >
                  <div
                    v-for="(slide, i) in onboardingSlides"
                    :key="i"
                    class="relative flex-shrink-0 flex flex-col justify-end pb-5"
                    style="width: 100%; min-width: 0; height: 560px"
                  >
                    <!-- Background e Grafiche -->
                    <div
                      class="absolute inset-0"
                      :style="{ background: slide.bgGradient }"
                    >
                      <!-- Step 1: schermo con scan line -->
                      <template v-if="i === 0">
                        <div
                          class="absolute inset-0 flex items-center justify-center gap-6"
                          style="padding-bottom: 200px"
                        >
                          <div class="phone-frame">
                            <div class="phone-screen">
                              <div class="phone-img">📷</div>
                              <div class="slide1-scanline" />
                            </div>
                          </div>
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              gap: 7px;
                            "
                          >
                            <div
                              style="
                                width: 58px;
                                height: 7px;
                                background: rgba(255, 255, 255, 0.07);
                                border-radius: 4px;
                              "
                            />
                            <div
                              style="
                                width: 42px;
                                height: 7px;
                                background: rgba(255, 255, 255, 0.04);
                                border-radius: 4px;
                              "
                            />
                            <div
                              style="
                                width: 50px;
                                height: 7px;
                                background: rgba(32, 113, 193, 0.18);
                                border-radius: 4px;
                              "
                            />
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(32, 113, 193, 0.13),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 2: VIDEO DI SFONDO -->
                      <!-- omino (slide2-walker) e puntini mappa commentati —
                           il video occupa tutto lo sfondo da solo              -->
                      <template v-else-if="i === 1">
                        <video
                          autoplay
                          muted
                          loop
                          playsinline
                          class="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                        >
                          <source src="/images/rule_vid.mp4" type="video/mp4" />
                        </video>

                        <!--
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-center gap-4 pb-[120px]"
                        >
                          <div
                            style="
                              position: relative;
                              width: 130px;
                              height: 80px;
                            "
                          >
                            <div
                              style="
                                position: absolute;
                                left: 8px;
                                top: 14px;
                                width: 5px;
                                height: 5px;
                                border-radius: 50%;
                                background: rgba(32, 113, 193, 0.65);
                              "
                            />
                            <div
                              style="
                                position: absolute;
                                left: 50px;
                                top: 22px;
                                width: 5px;
                                height: 5px;
                                border-radius: 50%;
                                background: rgba(32, 113, 193, 0.65);
                              "
                            />
                            <div
                              style="
                                position: absolute;
                                right: 18px;
                                top: 8px;
                                width: 5px;
                                height: 5px;
                                border-radius: 50%;
                                background: rgba(32, 113, 193, 0.65);
                              "
                            />
                            <div
                              style="
                                position: absolute;
                                left: 18px;
                                bottom: 4px;
                                width: 5px;
                                height: 5px;
                                border-radius: 50%;
                                background: rgba(32, 113, 193, 0.65);
                              "
                            />
                            <div
                              class="slide2-mapdot"
                              style="
                                position: absolute;
                                right: 28px;
                                bottom: 12px;
                                width: 10px;
                                height: 10px;
                                border-radius: 50%;
                                background: #2071c1;
                              "
                            />
                          </div>
                          <div
                            class="slide2-walker drop-shadow-md"
                            style="font-size: 38px; line-height: 1"
                          >
                            🚶
                          </div>
                        </div>
                        -->

                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(34, 197, 94, 0.1),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 3: bottone con ripple tap -->
                      <template v-else-if="i === 2">
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-center gap-5"
                          style="padding-bottom: 200px"
                        >
                          <div
                            style="
                              position: relative;
                              width: 110px;
                              height: 90px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <div
                              class="slide3-ripple"
                              style="
                                position: absolute;
                                width: 90px;
                                height: 90px;
                                border-radius: 50%;
                                border: 2px solid rgba(32, 113, 193, 0.35);
                              "
                            />
                            <div
                              class="slide3-ripple slide3-ripple-delay"
                              style="
                                position: absolute;
                                width: 90px;
                                height: 90px;
                                border-radius: 50%;
                                border: 2px solid rgba(32, 113, 193, 0.2);
                              "
                            />
                            <div
                              class="slide3-tapbtn shadow-lg"
                              style="
                                width: 80px;
                                height: 36px;
                                border-radius: 9px;
                                background: #2071c1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-family: 'Inter', sans-serif;
                                font-size: 11px;
                                font-weight: 700;
                                position: relative;
                                z-index: 1;
                              "
                            >
                              {{ $t('gameImHere') }}
                            </div>
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(249, 115, 22, 0.07),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 4: GPS ring + badge verde -->
                      <template v-else-if="i === 3">
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-center gap-4"
                          style="padding-bottom: 200px"
                        >
                          <div
                            class="slide4-gpsring"
                            style="
                              width: 64px;
                              height: 64px;
                              border-radius: 50%;
                              border: 2px solid rgba(34, 197, 94, 0.45);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <div
                              style="
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: #22c55e;
                              "
                            />
                          </div>
                          <div
                            class="shadow-md"
                            style="
                              display: flex;
                              align-items: center;
                              gap: 6px;
                              background: rgba(34, 197, 94, 0.15);
                              border: 1px solid rgba(34, 197, 94, 0.4);
                              border-radius: 8px;
                              padding: 5px 12px;
                            "
                          >
                            <div
                              class="slide4-dot"
                              style="
                                width: 7px;
                                height: 7px;
                                border-radius: 50%;
                                background: #22c55e;
                              "
                            />
                            <span
                              style="
                                font-size: 12px;
                                color: rgba(34, 197, 94, 1);
                                font-family: 'Inter', sans-serif;
                                font-weight: 600;
                              "
                            >
                              {{ $t('gameNear') }} ✓
                            </span>
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(34, 197, 94, 0.1),
                              transparent 65%
                            );
                          "
                        />
                      </template>
                    </div>

                    <!-- Floating Card con testo -->
                    <div
                      class="relative mx-5 p-5 rounded-[16px] bg-[#0f0e1a]/70 backdrop-blur-md border border-white/10 shadow-xl"
                      style="pointer-events: none"
                    >
                      <p
                        class="font-['Inter'] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2071c1] mb-1.5"
                      >
                        {{ $t('gameStep') }} {{ i + 1 }}
                      </p>
                      <p
                        class="font-['Playfair_Display'] text-[22px] font-bold text-white mb-2 leading-tight"
                      >
                        {{ slide.title }}
                      </p>
                      <p
                        class="font-['Inter'] text-[15px] text-white/80 leading-[1.6]"
                      >
                        {{ slide.desc }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dots -->
              <div class="flex justify-center gap-1.5 py-4">
                <button
                  v-for="(_, i) in onboardingSlides"
                  :key="i"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  :class="
                    i === slideIndex ? 'w-4 bg-[#2071c1]' : 'w-1.5 bg-white/15'
                  "
                  @click="slideIndex = i"
                />
              </div>

              <!-- Bottom bar -->
              <div class="flex gap-2 items-center px-6">
                <!-- Indietro: dalla slide 2 in poi -->
                <button
                  v-if="slideIndex > 0"
                  class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/8 hover:bg-white/15 transition-colors cursor-pointer flex-shrink-0"
                  :aria-label="$t('gameBack')"
                  @click="slideIndex--"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M9 2L4 7l5 5"
                      stroke="white"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <!-- Salta: solo alla prima slide -->
                <button
                  v-if="slideIndex === 0"
                  class="font-['Inter'] text-[14px] text-white/40 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0 h-11 px-2 flex items-center"
                  @click="finishOnboarding"
                >
                  {{ $t('gameSkip') }}
                </button>

                <button
                  class="flex-1 rounded-[12px] bg-[#2071c1] hover:bg-[#1a5b9c] transition-colors p-3.5 font-['Inter'] text-[15px] font-semibold text-white cursor-pointer"
                  @click="nextSlide"
                >
                  {{
                    slideIndex < onboardingSlides.length - 1
                      ? $t('gameNext')
                      : $t('gameStart')
                  }}
                </button>
              </div>
            </div>
          </Transition>

          <!-- ═══ GAME PHASE ═══ -->
          <Transition name="fade">
            <div v-if="phase === 'game'" class="flex flex-col px-6 pb-8 pt-6">
              <span
                class="font-['Inter'] text-[10px] uppercase tracking-[0.12em] text-[#2071c1] mb-1"
              >
                📍 {{ $t('gameLoc') }}
              </span>
              <h2
                class="font-['Playfair_Display'] text-[20px] font-bold text-white mb-4"
              >
                {{ poiTitle }}
              </h2>

              <div
                class="relative rounded-[14px] overflow-hidden mb-4 transition-all duration-300"
                :style="photoFrameStyle"
              >
                <img
                  v-if="poi.historicalImgUrl"
                  :src="poi.historicalImgUrl"
                  :alt="`${$t('gamePicLabel')}: ${poiTitle}`"
                  class="w-full h-[210px] object-cover"
                  style="filter: sepia(35%) contrast(1.08)"
                />
                <div
                  v-else
                  class="h-[180px] flex flex-col items-center justify-center gap-2 text-white/30"
                >
                  <span class="text-4xl">📷</span>
                  <p class="font-['Inter'] text-[13px]">
                    {{ $t('gameNoPic') }}
                  </p>
                </div>
                <span
                  class="absolute bottom-2 left-2 bg-black/70 font-['Inter'] text-[10px] uppercase tracking-[0.07em] px-2 py-0.5 rounded transition-colors duration-300"
                  :style="{ color: proximityColor }"
                  >{{ $t('gamePicLabel') }}</span
                >
                <div
                  v-if="proximity > 0.5"
                  class="absolute inset-0 pointer-events-none rounded-[14px] transition-opacity duration-300"
                  :style="{
                    boxShadow: `inset 0 0 ${Math.round(proximity * 40)}px ${proximityColor}55`,
                    opacity: proximity
                  }"
                />
              </div>

              <div v-if="gpsReady && distance !== null" class="mb-3">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-['Inter'] text-[11px] text-white/40">{{
                    $t('gameFar')
                  }}</span>
                  <span
                    class="font-['Inter'] text-[12px] font-semibold transition-colors duration-300"
                    :style="{ color: proximityColor }"
                    >{{ proximityLabel }}</span
                  >
                  <span class="font-['Inter'] text-[11px] text-white/40">{{
                    $t('gameNear')
                  }}</span>
                </div>
                <div
                  class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${proximity * 100}%`,
                      backgroundColor: proximityColor
                    }"
                  />
                </div>
              </div>

              <div
                class="flex items-center gap-2 rounded-[8px] px-3 py-2 mb-4 font-['Inter'] text-[12px]"
                :class="{
                  'bg-green-500/10 text-green-400': gpsReady,
                  'bg-red-500/10 text-red-400': !!gpsError,
                  'bg-white/5 text-white/40': !gpsReady && !gpsError
                }"
              >
                <span>{{ gpsReady ? '🛰️' : gpsError ? '⚠️' : '⏳' }}</span>
                <span>{{ gpsStatusText }}</span>
              </div>

              <div class="flex items-center justify-between mb-4">
                <span class="font-['Inter'] text-[12px] text-white/40 italic">{{
                  $t('gameWalk')
                }}</span>
                <button
                  class="flex items-center gap-1.5 font-['Inter'] text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  @click="toggleAudio"
                >
                  <span>{{ audioEnabled ? '🔊' : '🔇' }}</span>
                  <span>{{
                    audioEnabled ? $t('gameAudOn') : $t('gameAudOff')
                  }}</span>
                </button>
              </div>

              <button
                class="w-full rounded-[10px] p-3 font-['Inter'] text-[15px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                :class="
                  gpsReady && !checking
                    ? 'bg-[#2071c1] hover:bg-[#1a5b9c] text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                "
                :disabled="!gpsReady || checking"
                @click="checkLocation"
              >
                <span v-if="checking" class="animate-spin inline-block">⟳</span>
                <span v-else>{{ $t('gameImHere') }}</span>
              </button>
            </div>
          </Transition>

          <!-- ═══ RESULT PHASE ═══ -->
          <Transition name="fade">
            <div
              v-if="phase === 'result'"
              class="flex flex-col items-center px-6 pb-8 pt-6 text-center"
            >
              <template v-if="won">
                <div class="text-5xl mb-3">🎉</div>
                <h2
                  class="font-['Playfair_Display'] text-[24px] font-bold text-white mb-2"
                >
                  {{ $t('gameWon') }}
                </h2>
                <p class="font-['Inter'] text-[13px] text-white/60 mb-5">
                  {{ $t('gameDistance') }}
                  <strong class="text-[#2071c1]">{{ distanceFound }}m</strong>.
                </p>
                <div class="w-full flex items-center gap-2 mb-6">
                  <div class="flex-1 text-center">
                    <img
                      v-if="poi.historicalImgUrl"
                      :src="poi.historicalImgUrl"
                      class="w-full h-[100px] object-cover rounded-[10px]"
                      style="filter: sepia(35%)"
                      alt="Storica"
                    />
                    <p
                      class="font-['Inter'] text-[10px] uppercase tracking-[0.08em] text-white/40 mt-1.5"
                    >
                      {{ $t('gameThen') }}
                    </p>
                  </div>
                  <span class="text-[#2071c1] text-xl flex-shrink-0">↔</span>
                  <div class="flex-1 text-center">
                    <img
                      v-if="poi.modernImgUrl"
                      :src="poi.modernImgUrl"
                      class="w-full h-[100px] object-cover rounded-[10px]"
                      alt="Oggi"
                    />
                    <p
                      class="font-['Inter'] text-[10px] uppercase tracking-[0.08em] text-white/40 mt-1.5"
                    >
                      {{ $t('gameToday') }}
                    </p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-5xl mb-3">😕</div>
                <h2
                  class="font-['Playfair_Display'] text-[24px] font-bold text-white mb-2"
                >
                  {{ $t('gameLost') }}
                </h2>
                <p class="font-['Inter'] text-[13px] text-white/60 mb-6">
                  {{ $t('gameDistance') }}
                  <strong class="text-[#2071c1]">{{ distanceFound }}m</strong>.
                </p>
              </template>
              <div class="flex gap-3 w-full">
                <button
                  v-if="!won"
                  class="flex-1 cursor-pointer rounded-[10px] bg-[#2071c1] hover:bg-[#1a5b9c] transition-colors p-3 font-['Inter'] text-[14px] font-medium text-white"
                  @click="resetGame"
                >
                  {{ $t('gameRetry') }}
                </button>
                <button
                  class="flex-1 cursor-pointer rounded-[10px] bg-white/8 hover:bg-white/15 transition-colors p-3 font-['Inter'] text-[14px] font-medium text-white"
                  @click="emit('close')"
                >
                  {{ $t('gameClose') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const { t, locale } = useI18n()

interface Poi {
  title_it?: string
  title_en?: string
  title?: string
  lat: number
  lng: number
  historicalImgUrl?: string
  modernImgUrl?: string
}

const props = defineProps<{ poi: Poi }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const TUTORIAL_STORAGE_KEY = 'photoGame_tutorialSeen'

const poiTitle = computed(
  () => props.poi[`title_${locale.value}` as keyof Poi] || props.poi.title || ''
)

type Phase = 'rules' | 'game' | 'result'
const phase = ref<Phase>('rules')
const won = ref(false)
const distanceFound = ref(0)
const checking = ref(false)

const DELTA_METERS = 30
const MAX_DISTANCE = 300

// ─── Onboarding swipe ────────────────────────────────────────────────────────

const slideIndex = ref(0)
const sliderRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragOffset = ref(0)

let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | null = null
let dragLocked = false

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  pointerStartX = e.clientX
  pointerStartY = e.clientY
  isDragging.value = true
  dragOffset.value = 0
  dragLocked = false
  pointerId = e.pointerId
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || e.pointerId !== pointerId) return
  const dx = e.clientX - pointerStartX
  const dy = e.clientY - pointerStartY
  if (!dragLocked) {
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
      dragLocked = true
      isDragging.value = false
      dragOffset.value = 0
      return
    }
    if (Math.abs(dx) > 6) dragLocked = true
  }
  if (dragLocked && Math.abs(dx) >= Math.abs(dy)) {
    e.preventDefault()
    const atStart = slideIndex.value === 0 && dx > 0
    const atEnd =
      slideIndex.value === onboardingSlides.value.length - 1 && dx < 0
    dragOffset.value = atStart || atEnd ? dx * 0.25 : dx
  }
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  const dx = dragOffset.value
  if (Math.abs(dx) > 50) {
    if (dx < 0 && slideIndex.value < onboardingSlides.value.length - 1)
      slideIndex.value++
    else if (dx > 0 && slideIndex.value > 0) slideIndex.value--
  }
  isDragging.value = false
  dragOffset.value = 0
  pointerId = null
  dragLocked = false
}

function onPointerCancel(_e: PointerEvent) {
  isDragging.value = false
  dragOffset.value = 0
  pointerId = null
  dragLocked = false
}

const onboardingSlides = computed(() => [
  {
    bgGradient:
      'linear-gradient(135deg, #0a0818 0%, #1a0d2e 50%, #0f1a2e 100%)',
    title: t('gameRule1Title'),
    desc: t('gameRule1Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #0a1a12 0%, #0f2a1a 50%, #081510 100%)',
    title: t('gameRule2Title'),
    desc: t('gameRule2Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #1a0d0a 0%, #2e1208 50%, #1a0d0a 100%)',
    title: t('gameRule3Title'),
    desc: t('gameRule3Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #0a1020 0%, #0f1a3a 50%, #0a1020 100%)',
    title: t('gameRule4Title'),
    desc: t('gameRule4Desc', { dist: DELTA_METERS })
  }
])

function nextSlide() {
  if (slideIndex.value < onboardingSlides.value.length - 1) {
    slideIndex.value++
  } else {
    finishOnboarding()
  }
}

function finishOnboarding() {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1')
  } catch (_) {
    // Safari privato: ignora silenziosamente
  }
  phase.value = 'game'
}

// ─── GPS ─────────────────────────────────────────────────────────────────────

const userLat = ref<number | null>(null)
const userLng = ref<number | null>(null)
const userAccuracy = ref<number | null>(null)
const gpsError = ref<string | null>(null)
const distance = ref<number | null>(null)
let watchId: number | null = null

const gpsReady = computed(() => userLat.value !== null && !gpsError.value)
const gpsStatusText = computed(() => {
  if (gpsError.value) return `${t('gpsNotAvail')}: ${gpsError.value}`
  if (gpsReady.value)
    return `GPS (±${userAccuracy.value ? Math.round(userAccuracy.value) + 'm' : '…'})`
  return t('gpsSearching')
})

const proximity = computed(() => {
  if (distance.value === null) return 0
  return Math.max(0, Math.min(1, 1 - distance.value / MAX_DISTANCE))
})

const proximityColor = computed(() => {
  const p = proximity.value
  const r = Math.round(0x20 + (0x22 - 0x20) * p)
  const g = Math.round(0x71 + (0xc5 - 0x71) * p)
  const b = Math.round(0xc1 + (0x5e - 0xc1) * p)
  return `rgb(${r},${g},${b})`
})

const proximityLabel = computed(() => {
  const p = proximity.value
  if (p < 0.2) return t('prox1')
  if (p < 0.5) return t('prox2')
  if (p < 0.8) return t('prox3')
  if (p < 1.0) return t('prox4')
  return t('prox5')
})

const photoFrameStyle = computed(() => {
  const p = proximity.value
  return {
    border: `${Math.round(1 + p * 3)}px solid ${proximityColor.value}`,
    boxShadow:
      p > 0.3 ? `0 0 ${Math.round(p * 24)}px ${proximityColor.value}44` : 'none'
  }
})

// ─── Audio ───────────────────────────────────────────────────────────────────

const audioEnabled = ref(true)
let audioCtx: AudioContext | null = null
let tickInterval: ReturnType<typeof setTimeout> | null = null

function getOrCreateAudioCtx(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTick(p: number) {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 220 + p * 660
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.05 + p * 0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch (_) {}
}

function playSuccessSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t0 = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.15, t0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
      osc.start(t0)
      osc.stop(t0 + 0.3)
    })
  } catch (_) {}
}

function playFailSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    ;[300, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sawtooth'
      const t0 = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0.1, t0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)
      osc.start(t0)
      osc.stop(t0 + 0.25)
    })
  } catch (_) {}
}

function startTicking() {
  stopTicking()
  const tick = () => {
    if (phase.value !== 'game') return
    playTick(proximity.value)
    tickInterval = setTimeout(tick, Math.round(2000 - proximity.value * 1800))
  }
  tickInterval = setTimeout(tick, 1000)
}

function stopTicking() {
  if (tickInterval !== null) {
    clearTimeout(tickInterval)
    tickInterval = null
  }
}

function toggleAudio() {
  audioEnabled.value = !audioEnabled.value
  if (!audioEnabled.value) stopTicking()
  else if (phase.value === 'game' && gpsReady.value) startTicking()
}

// ─── Geo helpers ─────────────────────────────────────────────────────────────

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function startGps() {
  if (!navigator.geolocation) {
    gpsError.value = 'GPS non supportato'
    return
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      userLat.value = pos.coords.latitude
      userLng.value = pos.coords.longitude
      userAccuracy.value = pos.coords.accuracy
      gpsError.value = null
      distance.value = haversineMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        props.poi.lat,
        props.poi.lng
      )
    },
    (err) => {
      gpsError.value = err.message
    },
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
  )
}

function stopGps() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
}

watch([() => phase.value, gpsReady], ([p, ready]) => {
  if (p === 'game' && ready) startTicking()
  else stopTicking()
})

// ─── Game logic ───────────────────────────────────────────────────────────────

async function checkLocation() {
  if (!gpsReady.value || distance.value === null) return
  checking.value = true
  stopTicking()
  await new Promise((r) => setTimeout(r, 400))
  distanceFound.value = Math.round(distance.value)
  won.value = distance.value <= DELTA_METERS
  checking.value = false
  phase.value = 'result'
  if (won.value) playSuccessSound()
  else playFailSound()
}

function resetGame() {
  phase.value = 'game'
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  try {
    if (localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      phase.value = 'game'
    }
  } catch (_) {
    // localStorage non disponibile: mostra il tutorial ogni volta
  }
  startGps()
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  stopGps()
  stopTicking()
  audioCtx?.close()
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* ── Slide 1: schermo con scan line ── */
.phone-frame {
  width: 72px;
  height: 126px;
  border: 2px solid rgba(32, 113, 193, 0.55);
  border-radius: 12px;
  background: rgba(32, 113, 193, 0.07);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.phone-screen {
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.phone-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    160deg,
    rgba(32, 113, 193, 0.25),
    rgba(100, 60, 200, 0.15)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.slide1-scanline {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(32, 113, 193, 0.85),
    transparent
  );
  animation: scanline 2s ease-in-out infinite;
  top: 0;
}
@keyframes scanline {
  0%,
  100% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  50% {
    top: calc(100% - 2px);
  }
}

/* ── Slide 2: animazioni commentate insieme agli elementi ── */
/* .slide2-mapdot { ... } */
/* .slide2-walker { ... } */

/* ── Slide 3: ripple tap ── */
.slide3-ripple {
  animation: ripple-out 1.8s ease-out infinite;
}
.slide3-ripple-delay {
  animation-delay: 0.6s;
}
@keyframes ripple-out {
  0% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
.slide3-tapbtn {
  animation: tap-pulse 1.8s ease-in-out infinite;
}
@keyframes tap-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.92);
    opacity: 0.85;
  }
}

/* ── Slide 4: GPS ring ── */
.slide4-gpsring {
  animation: gps-ring-pulse 1.3s ease-in-out infinite;
}
@keyframes gps-ring-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(34, 197, 94, 0);
  }
}
.slide4-dot {
  animation: mapdot-pulse 1s ease-in-out infinite;
}
@keyframes mapdot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(32, 113, 193, 0.6);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(32, 113, 193, 0);
  }
}

/* ── Glow di sfondo condiviso ── */
.slide-radial-glow {
  position: absolute;
  inset: -40px;
  pointer-events: none;
}
</style>
