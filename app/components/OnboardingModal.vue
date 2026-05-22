<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        class="absolute inset-0 bg-[#424242]/45 cursor-pointer"
        @click="emit('close')"
      />

      <Transition name="slide-up" appear>
        <div
          class="relative z-10 w-full max-w-[480px] bg-[#0f0e1a] rounded-t-[20px] sm:rounded-[20px] overflow-hidden max-h-[95dvh]"
        >
          <!-- Close button inside modal -->
          <button
            class="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer transition-colors"
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

          <!-- Language toggle inside modal -->
          <button
            class="absolute top-3 left-3 z-30 flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer transition-colors"
            @click="toggleLang"
          >
            <svg
              v-if="locale === 'it'"
              width="18"
              height="12"
              viewBox="0 0 20 14"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-sm"
            >
              <rect width="20" height="14" fill="#CE2B37" />
              <rect width="6.67" height="14" fill="#009246" />
              <rect x="6.67" width="6.67" height="14" fill="#FFFFFF" />
            </svg>
            <svg
              v-else
              width="18"
              height="12"
              viewBox="0 0 20 14"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-sm"
            >
              <rect width="20" height="14" fill="#012169" />
              <path
                d="M0 0 L20 14 M20 0 L0 14"
                stroke="white"
                stroke-width="2.8"
              />
              <path
                d="M0 0 L20 14 M20 0 L0 14"
                stroke="#C8102E"
                stroke-width="1.6"
              />
              <path d="M10 0 V14 M0 7 H20" stroke="white" stroke-width="4" />
              <path
                d="M10 0 V14 M0 7 H20"
                stroke="#C8102E"
                stroke-width="2.4"
              />
            </svg>
            <span
              class="text-[11px] font-['Inter'] font-semibold text-white"
              >{{ locale === 'it' ? 'IT' : 'EN' }}</span
            >
          </button>

          <!-- Main Carousel Box -->
          <div class="relative w-full h-[580px]">
            <!-- Slider Swiper -->
            <div
              ref="sliderRef"
              class="relative overflow-hidden w-full h-full select-none"
              style="touch-action: pan-y"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerCancel"
            >
              <div
                class="flex w-full h-full"
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
                  class="relative flex-shrink-0 flex flex-col justify-end pb-36 px-6 h-full"
                  style="width: 100%; min-width: 0"
                >
                  <!-- Background e Grafiche (Expanded to 100% height) -->
                  <div
                    class="absolute inset-0"
                    :style="{ background: slide.bgGradient }"
                  >
                    <!-- Step 1: Welcome Intro (First slide) -->
                    <template v-if="i === 0">
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        style="padding-bottom: 230px"
                      >
                        <div class="relative w-72 h-72 flex items-center justify-center">
                          <div class="absolute w-64 h-64 rounded-full bg-[#2071c1]/15 filter blur-3xl animate-pulse" />
                          <div class="absolute w-56 h-56 rounded-full border border-[#2071c1]/25 animate-ping duration-[3000ms]" />
                          <div class="absolute w-60 h-60 rounded-full border border-white/10" />
                          <img
                            src="/logo_light.png"
                            alt="Persephone Logo"
                            class="relative max-h-[165px] max-w-[90%] w-auto h-auto object-contain animate-float"
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

                    <!-- Step 2: Myth & Rebirth (Second slide) -->
                    <template v-else-if="i === 1">
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        style="padding-bottom: 230px"
                      >
                        <div class="relative w-40 h-40 flex items-center justify-center">
                          <div class="absolute w-28 h-28 rounded-full bg-[#ec4899]/10 filter blur-xl animate-pulse" />
                          <div class="absolute bottom-4 w-32 h-1 bg-[#d946ef]/20 rounded-full" />
                          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-t from-[#d946ef] to-[#f472b6]" />
                          
                          <!-- Growing flower/bud -->
                          <div class="absolute bottom-[72px] w-8 h-8 flex items-center justify-center">
                            <div class="absolute w-6 h-6 bg-[#f472b6]/35 rounded-full filter blur-xs animate-ping" />
                            <div class="absolute w-5 h-8 bg-gradient-to-t from-[#ec4899] to-[#f472b6] rounded-full rotate-0 origin-bottom scale-75 animate-petal-0" />
                            <div class="absolute w-5 h-8 bg-gradient-to-t from-[#ec4899] to-[#f472b6] rounded-full rotate-[40deg] origin-bottom scale-75 animate-petal-r" />
                            <div class="absolute w-5 h-8 bg-gradient-to-t from-[#ec4899] to-[#f472b6] rounded-full rotate-[-40deg] origin-bottom scale-75 animate-petal-l" />
                            <div class="absolute w-3.5 h-3.5 rounded-full bg-[#fdf2f8] shadow-lg shadow-pink-500/50" />
                          </div>
                          
                          <!-- Sparkles -->
                          <div class="absolute bottom-20 left-12 w-1.5 h-1.5 rounded-full bg-white/40 animate-sparkle-1" />
                          <div class="absolute bottom-28 right-10 w-2 h-2 rounded-full bg-white/30 animate-sparkle-2" />
                          <div class="absolute bottom-24 left-16 w-1 h-1 rounded-full bg-white/50 animate-sparkle-3" />
                        </div>
                      </div>
                      <div
                        class="slide-radial-glow"
                        style="
                          background: radial-gradient(
                            circle at 50% 50%,
                            rgba(236, 72, 153, 0.12),
                            transparent 65%
                          );
                        "
                      />
                    </template>

                    <!-- Step 3: Sciura AI -->
                    <template v-else-if="i === 2">
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        style="padding-bottom: 230px"
                      >
                        <div class="relative w-40 h-40 flex items-center justify-center">
                          <div class="absolute w-28 h-28 rounded-full bg-[#a855f7]/10 filter blur-lg animate-pulse" />
                          <div class="absolute w-24 h-24 rounded-full border-2 border-[#a855f7]/30 scale-up-out-1" />
                          <div class="absolute w-24 h-24 rounded-full border border-[#a855f7]/20 scale-up-out-2" />
                          
                          <!-- Central Sciura Speech bubble avatar -->
                          <div class="z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-[#9333ea] to-[#c084fc] flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/20">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>

                          <!-- Voice lines -->
                          <div class="absolute left-2 flex items-end gap-1 h-12">
                            <div class="w-1 bg-[#c084fc]/70 rounded-full wave-bar wave-1" />
                            <div class="w-1 bg-[#c084fc]/80 rounded-full wave-bar wave-2" />
                            <div class="w-1 bg-[#c084fc]/60 rounded-full wave-bar wave-3" />
                          </div>
                          <div class="absolute right-2 flex items-end gap-1 h-12">
                            <div class="w-1 bg-[#c084fc]/60 rounded-full wave-bar wave-3" />
                            <div class="w-1 bg-[#c084fc]/80 rounded-full wave-bar wave-2" />
                            <div class="w-1 bg-[#c084fc]/70 rounded-full wave-bar wave-1" />
                          </div>
                        </div>
                      </div>
                      <div
                        class="slide-radial-glow"
                        style="
                          background: radial-gradient(
                            circle at 50% 50%,
                            rgba(168, 85, 247, 0.12),
                            transparent 65%
                          );
                        "
                      />
                    </template>

                    <!-- Step 4: 3D Naviglio -->
                    <template v-else-if="i === 3">
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        style="padding-bottom: 230px"
                      >
                        <div class="relative w-44 h-44 flex items-center justify-center">
                          <div class="absolute inset-2 border border-[#10b981]/25 rounded-[12px] overflow-hidden bg-emerald-950/20">
                            <div class="absolute inset-0 iso-grid" />
                            
                            <!-- Animated Naviglio River flowing -->
                            <div class="absolute bottom-0 left-0 right-0 top-1/2 bg-gradient-to-b from-[#10b981]/30 to-[#047857]/50 border-t border-[#10b981]/60 flex flex-col justify-center overflow-hidden">
                              <div class="water-waves" />
                            </div>
                          </div>
                          
                          <!-- Viewfinder corners -->
                          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#10b981] rounded-tl-sm animate-pulse" />
                          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#10b981] rounded-tr-sm animate-pulse" />
                          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#10b981] rounded-bl-sm animate-pulse" />
                          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#10b981] rounded-br-sm animate-pulse" />

                          <!-- Scan laser line -->
                          <div class="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent laser-scan" />
                        </div>
                      </div>
                      <div
                        class="slide-radial-glow"
                        style="
                          background: radial-gradient(
                            circle at 50% 50%,
                            rgba(16, 185, 129, 0.12),
                            transparent 65%
                          );
                        "
                      />
                    </template>

                    <!-- Step 5: Photo Spot Challenge -->
                    <template v-else-if="i === 4">
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        style="padding-bottom: 230px"
                      >
                        <div class="relative w-40 h-40 flex items-center justify-center">
                          <div class="absolute w-36 h-36 border border-white/10 rounded-full flex items-center justify-center">
                            <div class="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#f97316]/60 animate-ping" />
                          </div>
                          
                          <!-- Vintage photo frame -->
                          <div class="absolute w-28 h-20 border border-white/20 bg-white/5 rounded-[6px] flex items-center justify-center overflow-hidden rotate-[-4deg] shadow-lg shadow-orange-950/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="opacity-30">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <div class="absolute bottom-1 left-2 right-2 h-1 bg-white/10 rounded" />
                          </div>

                          <!-- Radar GPS pulsing locator -->
                          <div class="absolute w-12 h-12 rounded-full border border-[#f97316]/50 flex items-center justify-center radar-pulse">
                            <div class="w-4 h-4 rounded-full bg-[#f97316]/80 flex items-center justify-center scale-75 animate-bounce">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="slide-radial-glow"
                        style="
                          background: radial-gradient(
                            circle at 50% 50%,
                            rgba(249, 115, 22, 0.12),
                            transparent 65%
                          );
                        "
                      />
                    </template>
                  </div>

                  <!-- Text details -->
                  <div class="relative z-10 w-full select-text text-center px-2">
                    <span
                      class="inline-block px-2.5 py-0.5 mb-2.5 text-[9px] font-['Inter'] font-semibold tracking-wider uppercase text-white/50 bg-white/8 rounded-full border border-white/5 backdrop-blur-sm"
                    >
                      {{ slide.badge }}
                    </span>
                    <h2
                      class="font-['Playfair_Display'] text-[24px] font-bold text-white mb-2 leading-tight"
                    >
                      {{ slide.title }}
                    </h2>
                    <p
                      class="font-['Inter'] text-[13.5px] text-white/70 leading-[1.6] max-w-[340px] mx-auto"
                    >
                      {{ slide.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stationary Bottom Controls (Positioned absolutely over the full-height swiper background) -->
            <div class="absolute bottom-0 left-0 right-0 z-20 flex flex-col pb-6 pt-2 bg-gradient-to-t from-black/25 to-transparent">
              <!-- Dots -->
              <div class="flex justify-center gap-1.5 py-3">
                <button
                  v-for="(_, i) in onboardingSlides"
                  :key="i"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  :class="i === slideIndex ? 'w-4' : 'w-1.5 bg-white/15'"
                  :style="i === slideIndex ? { backgroundColor: onboardingSlides[slideIndex]?.color || '#2071c1' } : {}"
                  @click="slideIndex = i"
                />
              </div>

              <!-- Bottom bar controls -->
              <div class="flex gap-2 items-center px-6">
                <button
                  v-if="slideIndex > 0"
                  class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/8 hover:bg-white/15 border border-white/5 transition-colors cursor-pointer flex-shrink-0"
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

                <button
                  v-if="slideIndex === 0"
                  class="font-['Inter'] text-[14px] text-white/40 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0 h-11 px-2 flex items-center"
                  @click="emit('close')"
                >
                  {{ $t('gameSkip') }}
                </button>

                <button
                  class="flex-1 rounded-[12px] transition-all duration-300 p-3.5 font-['Inter'] text-[15px] font-semibold text-white cursor-pointer hover:brightness-110 active:scale-[0.98]"
                  :style="{ backgroundColor: onboardingSlides[slideIndex]?.color || '#2071c1' }"
                  @click="nextSlide"
                >
                  {{
                    slideIndex < onboardingSlides.length - 1
                      ? $t('gameNext')
                      : $t('welcBtn')
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ (e: 'close'): void }>()
const { locale, setLocale, t } = useI18n()
const toggleLang = () => setLocale(locale.value === 'it' ? 'en' : 'it')

// ─── Carousel gestures ────────────────────────────────────────────────────────
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
    bgGradient: 'linear-gradient(135deg, #090e1f 0%, #0d1b3e 60%, #070913 100%)',
    title: t('appName'),
    desc: t('welcP1'),
    badge: t('welcSub'),
    color: '#2071c1'
  },
  {
    bgGradient: 'linear-gradient(135deg, #0e051a 0%, #1c0b33 60%, #080310 100%)',
    title: t('easterPersefoneTitle'),
    desc: t('easterPersefoneText'),
    badge: t('wordPersefone'),
    color: '#ec4899'
  },
  {
    bgGradient: 'linear-gradient(135deg, #180924 0%, #290f3c 60%, #0e0416 100%)',
    title: t('welcCard1Title'),
    desc: t('welcCard1Desc'),
    badge: 'Sciura AI',
    color: '#a855f7'
  },
  {
    bgGradient: 'linear-gradient(135deg, #051a14 0%, #0b2e23 60%, #020b08 100%)',
    title: t('welcCard2Title'),
    desc: t('welcCard2Desc'),
    badge: 'AR 3D',
    color: '#10b981'
  },
  {
    bgGradient: 'linear-gradient(135deg, #1f0b09 0%, #3e1610 60%, #130403 100%)',
    title: t('welcCard3Title'),
    desc: t('welcCard3Desc'),
    badge: 'GPS CHALLENGE',
    color: '#f97316'
  }
])

function nextSlide() {
  if (slideIndex.value < onboardingSlides.value.length - 1) {
    slideIndex.value++
  } else {
    emit('close')
  }
}
</script>

<style scoped>
/* ── Slide 0: Myth Flower ── */
.animate-petal-0 {
  animation: petal-sway-c 4s ease-in-out infinite;
}
.animate-petal-r {
  animation: petal-sway-r 4s ease-in-out infinite;
}
.animate-petal-l {
  animation: petal-sway-l 4s ease-in-out infinite;
}

@keyframes petal-sway-c {
  0%, 100% { transform: rotate(0deg) scale(0.75); }
  50% { transform: rotate(3deg) scale(0.85); }
}
@keyframes petal-sway-r {
  0%, 100% { transform: rotate(40deg) scale(0.7); }
  50% { transform: rotate(45deg) scale(0.8); }
}
@keyframes petal-sway-l {
  0%, 100% { transform: rotate(-40deg) scale(0.7); }
  50% { transform: rotate(-45deg) scale(0.8); }
}

@keyframes sparkle {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-36px) scale(1.2); opacity: 0; }
}
.animate-sparkle-1 { animation: sparkle 2.5s infinite ease-out; }
.animate-sparkle-2 { animation: sparkle 3.2s infinite ease-out; animation-delay: 0.8s; }
.animate-sparkle-3 { animation: sparkle 1.8s infinite ease-out; animation-delay: 0.4s; }

/* ── Slide 1: Welcome Intro ── */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* ── Slide 2: Sciura AI voice ── */
.wave-bar {
  width: 3.5px;
  border-radius: 4px;
  background-color: rgba(192, 132, 252, 0.85);
}
.wave-1 { height: 16px; animation: voice-wave 1.2s ease-in-out infinite alternate; }
.wave-2 { height: 28px; animation: voice-wave 0.8s ease-in-out infinite alternate-reverse; }
.wave-3 { height: 20px; animation: voice-wave 1.5s ease-in-out infinite alternate; }

@keyframes voice-wave {
  0% { height: 8px; }
  100% { height: 38px; }
}

.scale-up-out-1 {
  animation: scale-up-out 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
.scale-up-out-2 {
  animation: scale-up-out 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  animation-delay: 1s;
}
@keyframes scale-up-out {
  0% {
    transform: scale(0.6);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ── Slide 3: 3D Naviglio grid & water ── */
.iso-grid {
  background-image: 
    linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
  background-size: 14px 14px;
  transform: perspective(200px) rotateX(50deg);
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  animation: grid-scroll 8s linear infinite;
}
@keyframes grid-scroll {
  0% { transform: perspective(200px) rotateX(50deg) translateY(0); }
  100% { transform: perspective(200px) rotateX(50deg) translateY(28px); }
}

.water-waves {
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 12px,
    rgba(255, 255, 255, 0.08) 12px,
    rgba(255, 255, 255, 0.08) 24px
  );
  animation: wave-flow 4s linear infinite;
}
@keyframes wave-flow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-40px); }
}

.laser-scan {
  top: 10%;
  animation: laser-move 2.5s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
}
@keyframes laser-move {
  0%, 100% { top: 8%; opacity: 0.3; }
  50% { top: 92%; opacity: 1; }
}

/* ── Slide 4: Photo Challenge Radar ── */
.radar-pulse {
  animation: radar-ping 1.6s ease-out infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@keyframes radar-ping {
  0% {
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 0 24px rgba(249, 115, 22, 0);
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

/* ── Shared background glow ── */
.slide-radial-glow {
  position: absolute;
  inset: -40px;
  pointer-events: none;
}

/* ── Vue transitions ── */
.slide-up-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(40px);
  opacity: 0;
}
</style>
