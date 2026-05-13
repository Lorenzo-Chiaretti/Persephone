<template>
  <div
    class="absolute left-0 right-0 z-20 flex flex-col"
    :style="sheetStyle"
    style="bottom: 0; touch-action: none"
  >
    <div
      class="bg-white rounded-t-[28px] shadow-2xl flex flex-col flex-1 overflow-hidden"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend.passive="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div
        class="flex justify-center pt-3 pb-1 cursor-grab select-none shrink-0"
        @touchstart.passive="onHandleTouchStart"
        @mousedown.stop="onHandleMouseDown"
      >
        <div class="w-10 h-1 rounded-full bg-[#424242]/20" />
      </div>

      <!-- SNAP CHIUSO -->
      <div
        class="px-5 pb-5 shrink-0 transition-opacity duration-200"
        :class="
          snapIndex === 0
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none h-0 overflow-hidden'
        "
      >
        <p
          class="font-['Inter'] text-[11px] text-[#424242]/40 text-center mb-3 tracking-wide"
        >
          {{ $t('scrollHint') }}
        </p>
        <button
          class="w-full flex items-center justify-center gap-2 bg-[#2071c1] hover:bg-[#1a5b9c] active:scale-95 text-white py-4 rounded-2xl shadow-lg font-['Inter'] font-bold text-[15px] transition-all cursor-pointer"
          @click="emit('start-ar')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ $t('startAr') }}
        </button>
      </div>

      <!-- SNAP APERTO -->
      <div
        ref="scrollEl"
        class="flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200 px-5"
        :class="snapIndex > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        style="
          padding-bottom: max(env(safe-area-inset-bottom, 0px) + 80px, 80px);
        "
      >
        <button
          class="w-full flex items-center justify-center gap-2 bg-[#2071c1] hover:bg-[#1a5b9c] active:scale-95 text-white py-4 rounded-2xl shadow-lg font-['Inter'] font-bold text-[15px] transition-all cursor-pointer mb-7"
          @click="emit('start-ar')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ $t('startAr') }}
        </button>

        <!-- Storia -->
        <p
          class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-2"
        >
          {{ $t('sectionHistory') }}
        </p>
        <h2
          class="font-['Playfair_Display'] text-[22px] font-bold text-[#424242] leading-tight mb-3"
        >
          {{ $t('navigliTitle') }}
        </h2>
        <p
          class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-4"
          v-html="navigliP1"
        />
        <p
          class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-6"
          v-html="navigliP2"
        />

        <div class="w-full h-px bg-[#424242]/8 mb-6" />

        <!-- Progetto -->
        <p
          class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-2"
        >
          {{ $t('sectionProject') }}
        </p>
        <h2
          class="font-['Playfair_Display'] text-[22px] font-bold text-[#424242] leading-tight mb-3"
        >
          {{ $t('persephoneTitle') }}
        </h2>
        <p
          class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-4"
          v-html="persephoneP1"
        />
        <p
          class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-6"
        >
          {{ $t('persephoneP2') }}
        </p>

        <div class="w-full h-px bg-[#424242]/8 mb-6" />

        <!-- Come funziona -->
        <p
          class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-2"
        >
          {{ $t('sectionHowTo') }}
        </p>
        <h2
          class="font-['Playfair_Display'] text-[22px] font-bold text-[#424242] leading-tight mb-4"
        >
          {{ $t('howToTitle') }}
        </h2>

        <div class="flex flex-col gap-3 mb-6">
          <div
            class="flex items-start gap-4 bg-[#f7f9fc] rounded-[16px] px-4 py-4"
          >
            <div
              class="w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2071c1"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <p
                class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
              >
                {{ $t('howToAR') }}
              </p>
              <p
                class="font-['Inter'] text-[12px] text-[#424242]/55 leading-[1.5]"
              >
                {{ $t('howToARDesc') }}
              </p>
            </div>
          </div>
          <div
            class="flex items-start gap-4 bg-[#f7f9fc] rounded-[16px] px-4 py-4"
          >
            <div
              class="w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2071c1"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div>
              <p
                class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
              >
                {{ $t('howToPhotos') }}
              </p>
              <p
                class="font-['Inter'] text-[12px] text-[#424242]/55 leading-[1.5]"
              >
                {{ $t('howToPhotosDesc') }}
              </p>
            </div>
          </div>
          <div
            class="flex items-start gap-4 bg-[#f7f9fc] rounded-[16px] px-4 py-4"
          >
            <div
              class="w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="text-[#2071c1]"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <p
                class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
              >
                {{ $t('howToPlay') }}
              </p>
              <p
                class="font-['Inter'] text-[12px] text-[#424242]/55 leading-[1.5]"
              >
                {{ $t('howToPlayDesc') }}
              </p>
            </div>
          </div>
        </div>

        <div class="w-full h-px bg-[#424242]/8 mb-6" />
        <p
          class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-3"
        >
          {{ $t('sectionTeam') }}
        </p>
        <div class="flex flex-col gap-2 mb-2">
          <div
            v-for="member in team"
            :key="member.name"
            class="flex items-center gap-3"
          >
            <div
              class="w-8 h-8 rounded-full bg-[#2071c1]/10 flex items-center justify-center shrink-0"
            >
              <span
                class="font-['Playfair_Display'] text-[12px] font-bold text-[#2071c1]"
                >{{ member.initials }}</span
              >
            </div>
            <div>
              <p
                class="font-['Inter'] text-[16px] font-semibold text-[#424242] leading-none"
              >
                {{ member.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Transition name="exotic-pop">
    <div
      v-if="easterEggVisible"
      class="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
    >
      <div
        class="exotic-card bg-gradient-to-br from-[#00d2ff] via-[#3a7bd5] to-[#8e2de2] p-[2px] rounded-[30px] shadow-[0_0_50px_rgba(58,123,213,0.4)] mx-8"
      >
        <div
          class="bg-white/90 backdrop-blur-xl rounded-[28px] px-8 py-10 text-center relative overflow-hidden"
        >
          <div class="text-6xl mb-6 drop-shadow-sm animate-float">
            {{ easterEggEmoji }}
          </div>
          <h3
            class="font-['Playfair_Display'] text-[24px] italic font-bold text-[#2071c1] mb-3"
          >
            {{ easterEggTitle }}
          </h3>
          <p
            class="font-['Inter'] text-[15px] text-[#424242]/80 leading-relaxed"
          >
            {{ easterEggText }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'start-ar'): void
  (e: 'open-onboarding'): void
}>()

const { t } = useI18n()

// ─── Snap sheet ───────────────────────────────────────────────────────────────

type SnapConfig = { type: 'px' | 'vh'; value: number }

const SNAP_CONFIGS: SnapConfig[] = [
  { type: 'px', value: 120 },
  { type: 'vh', value: 0.92 }
]

const VELOCITY_THRESHOLD = 0.25
const DRAG_THRESHOLD = 10

const snapIndex = ref(0)
const dragging = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
const isMounted = ref(false)

// SSR-SAFE: inizializzato a null, valorizzato solo in onMounted
const windowH = ref<number | null>(null)

// currentY parte da 0 — verrà impostato correttamente in onMounted
const currentY = ref(0)

let startY = 0
let startTranslateY = 0
let isDraggingSheet = false
let dragFromHandle = false
let lastY = 0
let lastTime = 0

function snapHeightPx(idx: number): number {
  if (windowH.value === null) return 0
  const cfg = SNAP_CONFIGS[idx]
  if (!cfg) return 0
  return cfg.type === 'px' ? cfg.value : cfg.value * windowH.value
}

function translateForSnap(idx: number): number {
  if (windowH.value === null) return 0
  return windowH.value - snapHeightPx(idx)
}

function applySnap(idx: number) {
  snapIndex.value = idx
  currentY.value = translateForSnap(idx)
}

const sheetStyle = computed(() => {
  // SSR: niente height e niente transform rivelatori
  if (!isMounted.value || windowH.value === null) {
    return {
      transform: 'translateY(0px)',
      transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
      height: '0px'
    }
  }
  return {
    transform: `translateY(${currentY.value}px)`,
    transition: dragging.value
      ? 'none'
      : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
    height: `${windowH.value * 0.97}px`
  }
})

// ─── Touch handlers ───────────────────────────────────────────────────────────

function onHandleTouchStart(e: TouchEvent) {
  dragFromHandle = true
  onTouchStart(e)
}

function onHandleMouseDown(e: MouseEvent) {
  dragFromHandle = true
  onMouseDown(e)
}

function onTouchStart(e: TouchEvent) {
  if (!e.touches?.[0]) return
  startY = e.touches[0].clientY
  lastY = startY
  lastTime = Date.now()
  startTranslateY = currentY.value
  dragging.value = true
  isDraggingSheet = false
}

function onTouchMove(e: TouchEvent) {
  if (!dragging.value || !e.touches?.[0]) return
  const dy = e.touches[0].clientY - startY
  if (
    !dragFromHandle &&
    snapIndex.value > 0 &&
    scrollEl.value &&
    !isDraggingSheet
  ) {
    const atTop = scrollEl.value.scrollTop <= 0
    const atBottom =
      scrollEl.value.scrollTop + scrollEl.value.clientHeight >=
      scrollEl.value.scrollHeight - 1
    if ((!atTop && dy > 0) || (!atBottom && dy < 0)) return
  }
  e.preventDefault()
  isDraggingSheet = true
  lastY = e.touches[0].clientY
  lastTime = Date.now()
  currentY.value = Math.max(
    translateForSnap(1),
    Math.min(translateForSnap(0), startTranslateY + dy)
  )
}

function onTouchEnd() {
  lastTime = Date.now()
  dragging.value = false
  isDraggingSheet = false
  dragFromHandle = false
  snapFromGesture()
}

// ─── Mouse handlers ───────────────────────────────────────────────────────────

function onMouseDown(e: MouseEvent) {
  startY = e.clientY
  lastY = startY
  lastTime = Date.now()
  startTranslateY = currentY.value
  dragging.value = true
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  lastY = e.clientY
  lastTime = Date.now()
  currentY.value = Math.max(
    translateForSnap(1),
    Math.min(translateForSnap(0), startTranslateY + e.clientY - startY)
  )
}

function onMouseUp() {
  if (!dragging.value) return
  dragging.value = false
  dragFromHandle = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mouseleave', onMouseUp)
  snapFromGesture()
}

// ─── Snap gesture ─────────────────────────────────────────────────────────────

function snapFromGesture() {
  const elapsed = Date.now() - lastTime
  const velocity = elapsed > 0 ? (lastY - startY) / elapsed : 0
  const totalDrag = lastY - startY

  if (velocity > VELOCITY_THRESHOLD) {
    applySnap(0)
    return
  }
  if (velocity < -VELOCITY_THRESHOLD) {
    applySnap(1)
    return
  }
  if (Math.abs(totalDrag) >= DRAG_THRESHOLD) {
    applySnap(totalDrag > 0 ? 0 : 1)
    return
  }

  const distances = SNAP_CONFIGS.map((_, i) =>
    Math.abs(currentY.value - translateForSnap(i))
  )
  applySnap(distances.indexOf(Math.min(...distances)))
}

// ─── Easter eggs ──────────────────────────────────────────────────────────────

function eggSpan(key: string, label: string) {
  return `<span class="easter-word" data-egg="${key}">${label}</span>`
}

const navigliP1 = computed(() =>
  t('navigliP1', {
    canali: eggSpan('canali', t('wordCanali')),
    navigli: eggSpan('navigli', t('wordNavigli')),
    leonardo: eggSpan('leonardo', t('wordLeonardo'))
  })
)
const navigliP2 = computed(() =>
  t('navigliP2', { viadacqua: eggSpan('viadacqua', t('wordViadacqua')) })
)
const persephoneP1 = computed(() =>
  t('persephoneP1', {
    persefone: eggSpan('persefone', t('wordPersefone')),
    navigli: eggSpan('navigli', t('wordNavigli'))
  })
)

const easterEggVisible = ref(false)
const easterEggEmoji = ref('')
const easterEggTitle = ref('')
const easterEggText = ref('')
let easterTimeout: ReturnType<typeof setTimeout> | null = null

function getEgg(key: string) {
  const map: Record<
    string,
    { emoji: string; titleKey: string; textKey: string }
  > = {
    canali: {
      emoji: '🚣',
      titleKey: 'easterCanaliTitle',
      textKey: 'easterCanaliText'
    },
    navigli: {
      emoji: '💧',
      titleKey: 'easterNavigliTitle',
      textKey: 'easterNavigliText'
    },
    leonardo: {
      emoji: '🎨',
      titleKey: 'easterLeonardoTitle',
      textKey: 'easterLeonardoText'
    },
    viadacqua: {
      emoji: '⛵',
      titleKey: 'easterViadacquaTitle',
      textKey: 'easterViadacquaText'
    },
    persefone: {
      emoji: '🌒',
      titleKey: 'easterPersefoneTitle',
      textKey: 'easterPersefoneText'
    }
  }
  return map[key] ?? null
}

function playZenWaterSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.2)
    filter.type = 'lowpass'
    filter.frequency.value = 800
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.2)
    setTimeout(() => ctx.close(), 1500)
  } catch (_) {}
}

function triggerEgg(key: string) {
  const egg = getEgg(key)
  if (!egg) return
  playZenWaterSound()
  easterEggEmoji.value = egg.emoji
  easterEggTitle.value = t(egg.titleKey)
  easterEggText.value = t(egg.textKey)
  easterEggVisible.value = true
  if (easterTimeout) {
    clearTimeout(easterTimeout)
    easterTimeout = null
  }
  easterTimeout = setTimeout(() => {
    easterEggVisible.value = false
    easterTimeout = null
  }, 3500)
}

function onContentClick(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest(
    '[data-egg]'
  ) as HTMLElement | null
  if (el?.dataset.egg) triggerEgg(el.dataset.egg)
}

// ─── Team ─────────────────────────────────────────────────────────────────────

const team = [
  { name: 'Marco Abbadessa', initials: 'MA' },
  { name: 'Gabriele Busacca', initials: 'GB' },
  { name: 'Lorenzo Chiaretti', initials: 'LC' },
  { name: "Giuseppe D'Ambrosi", initials: 'GD' }
]

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function onResize() {
  windowH.value = window.innerHeight
  applySnap(snapIndex.value)
}

onMounted(() => {
  // Valorizzazione SSR-safe: solo qui siamo sicuri di avere window
  windowH.value = window.innerHeight
  isMounted.value = true
  // Ora applica lo snap iniziale con le dimensioni reali
  applySnap(0)
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onContentClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mouseleave', onMouseUp)
  document.removeEventListener('click', onContentClick)
  if (easterTimeout) {
    clearTimeout(easterTimeout)
    easterTimeout = null
  }
})
</script>

<style scoped>
.animate-float {
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.exotic-pop-enter-active {
  animation: exotic-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.exotic-pop-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.exotic-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
@keyframes exotic-in {
  0% {
    transform: scale(0.5) translateY(20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.exotic-card {
  max-width: 320px;
}

:deep(.easter-word) {
  color: #2071c1;
  font-weight: 700;
  background-color: rgba(32, 113, 193, 0.1);
  border: 1.5px dashed rgba(32, 113, 193, 0.6);
  border-radius: 6px;
  padding: 2px 6px;
  margin: 0 2px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(32, 113, 193, 0.05);
}
:deep(.easter-word:hover),
:deep(.easter-word:active) {
  background-color: #2071c1;
  color: #ffffff;
  border-style: solid;
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 4px 8px rgba(32, 113, 193, 0.2);
}
</style>
