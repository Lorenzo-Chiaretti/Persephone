<template>
  <div
    class="absolute left-0 right-0 z-20 flex flex-col"
    :style="sheetStyle"
    style="bottom: 0; touch-action: none"
  >
    <div
      class="bg-white rounded-t-[28px] shadow-2xl flex flex-col flex-1 overflow-hidden"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend.passive="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div
        class="flex justify-center pt-3 pb-1 cursor-grab select-none shrink-0"
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
        class="flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200 px-5"
        :class="snapIndex > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        style="padding-bottom: max(env(safe-area-inset-bottom), 32px)"
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
            class="flex items-start gap-4 bg-[#f7f9fc] rounded-[16px] px-4 py-4 cursor-pointer active:bg-[#eef1f5] transition-colors"
            @click="emit('open-onboarding')"
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
                {{ $t('howToPlay') }} <span class="text-[#2071c1]">→</span>
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
                class="font-['Inter'] text-[13px] font-semibold text-[#424242] leading-none"
              >
                {{ member.name }}
              </p>
              <p class="font-['Inter'] text-[11px] text-[#424242]/45">
                {{ member.role }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Transition name="fade">
    <div
      v-if="easterEggVisible"
      class="fixed inset-0 z-[55] pointer-events-none flex items-center justify-center"
    >
      <div
        class="bg-[#0f0e1a]/90 backdrop-blur-sm rounded-2xl px-6 py-5 mx-8 text-center shadow-2xl"
      >
        <div class="text-3xl mb-2">{{ easterEggEmoji }}</div>
        <p
          class="font-['Playfair_Display'] text-[17px] font-bold text-white mb-1"
        >
          {{ easterEggTitle }}
        </p>
        <p class="font-['Inter'] text-[13px] text-white/60 leading-[1.5]">
          {{ easterEggText }}
        </p>
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

const snapIndex = ref(0)
const currentY = ref(0)
const dragging = ref(false)
let startY = 0
let startTranslateY = 0
let windowH = 0
const SNAP_CONFIGS = [120, 0.5, 0.92]

function snapHeightPx(idx: number) {
  const h = SNAP_CONFIGS[idx] ?? 0
  return h < 2 ? h * windowH : h
}
function translateForSnap(idx: number) {
  return windowH - snapHeightPx(idx)
}

function applySnap(idx: number) {
  snapIndex.value = idx
  currentY.value = translateForSnap(idx)
}

const sheetStyle = computed(() => ({
  transform: `translateY(${currentY.value}px)`,
  transition: dragging.value
    ? 'none'
    : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
  height: `${windowH * 0.97}px`
}))

function onTouchStart(e: TouchEvent) {
  if (!e.touches?.[0]) return
  startY = e.touches[0].clientY
  startTranslateY = currentY.value
  dragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!dragging.value || !e.touches?.[0]) return
  const next = Math.max(
    translateForSnap(2),
    Math.min(
      translateForSnap(0),
      startTranslateY + e.touches[0].clientY - startY
    )
  )
  currentY.value = next
}

function onTouchEnd() {
  dragging.value = false
  const distances = SNAP_CONFIGS.map((_, i) =>
    Math.abs(currentY.value - translateForSnap(i))
  )
  applySnap(distances.indexOf(Math.min(...distances)))
}

function onMouseDown(e: MouseEvent) {
  startY = e.clientY
  startTranslateY = currentY.value
  dragging.value = true
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  currentY.value = Math.max(
    translateForSnap(2),
    Math.min(translateForSnap(0), startTranslateY + e.clientY - startY)
  )
}

function onMouseUp() {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  const distances = SNAP_CONFIGS.map((_, i) =>
    Math.abs(currentY.value - translateForSnap(i))
  )
  applySnap(distances.indexOf(Math.min(...distances)))
}

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
  t('navigliP2', {
    viadacqua: eggSpan('viadacqua', t('wordViadacqua'))
  })
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
  return map[key]
}

function playWaterSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const bufferSize = ctx.sampleRate * 1.2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    source.stop(ctx.currentTime + 1.2)
    setTimeout(() => ctx.close(), 1500)
  } catch (_) {}
}

function triggerEgg(key: string) {
  const egg = getEgg(key)
  if (!egg) return
  playWaterSound()
  easterEggEmoji.value = egg.emoji
  easterEggTitle.value = t(egg.titleKey)
  easterEggText.value = t(egg.textKey)

  easterEggVisible.value = true
  if (easterTimeout) clearTimeout(easterTimeout)
  easterTimeout = setTimeout(() => {
    easterEggVisible.value = false
  }, 3500)
}

function onContentClick(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest(
    '[data-egg]'
  ) as HTMLElement | null
  if (el?.dataset.egg) triggerEgg(el.dataset.egg)
}

const team = [
  { name: 'Marco Abbadessa', role: 'Design & sviluppo', initials: 'MA' },
  { name: 'Gabriele Busacca', role: 'Sviluppo & AR', initials: 'GB' },
  { name: 'Lorenzo Chiaretti', role: 'Ricerca storica', initials: 'LC' },
  { name: "Giuseppe D'Ambrosi", role: 'AI & backend', initials: 'GD' }
]

onMounted(() => {
  windowH = window.innerHeight
  applySnap(0)
  window.addEventListener('resize', () => {
    windowH = window.innerHeight
    applySnap(snapIndex.value)
  })
  document.addEventListener('click', onContentClick)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('click', onContentClick)
  if (easterTimeout) clearTimeout(easterTimeout)
})
</script>

<style scoped>
.easter-word {
  border-bottom: 1.5px dotted #2071c1;
  color: #2071c1;
  cursor: pointer;
}
.easter-word:active {
  opacity: 0.6;
}
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
