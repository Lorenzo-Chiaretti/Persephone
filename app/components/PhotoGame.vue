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

          <!-- RULES PHASE -->
          <Transition name="fade">
            <div
              v-if="phase === 'rules'"
              class="flex flex-col items-center px-6 pb-8 pt-8"
            >
              <div class="text-5xl mb-3">📸</div>
              <h2
                class="font-['Playfair_Display'] text-[26px] font-bold text-[#2071c1] mb-1"
              >
                {{ $t('gameTitle1') }}
              </h2>
              <p class="font-['Inter'] text-[13px] text-white/50 italic mb-6">
                {{ $t('gameSub1') }}
              </p>

              <p
                class="font-['Inter'] text-[11px] uppercase tracking-[0.12em] text-white/30 self-start mb-2"
              >
                {{ $t('gameHowTo') }}
              </p>
              <div class="w-full flex flex-col gap-2 mb-5">
                <div
                  v-for="rule in rules"
                  :key="rule.n"
                  class="flex items-start gap-3 bg-white/5 rounded-[12px] px-4 py-3"
                >
                  <span
                    class="flex-shrink-0 w-6 h-6 rounded-full bg-[#2071c1] text-white font-['Inter'] text-[11px] font-bold flex items-center justify-center mt-0.5"
                    >{{ rule.n }}</span
                  >
                  <p
                    class="font-['Inter'] text-[13px] text-white/70 leading-[1.55]"
                    v-html="rule.text"
                  />
                </div>
              </div>

              <p
                class="font-['Inter'] text-[11px] uppercase tracking-[0.12em] text-white/30 self-start mb-2"
              >
                {{ $t('gameSignals') }}
              </p>
              <div class="w-full flex flex-col gap-2 mb-7">
                <div
                  class="flex items-center gap-3 bg-white/5 rounded-[12px] px-4 py-3"
                >
                  <span class="text-xl flex-shrink-0">🔊</span>
                  <div>
                    <p
                      class="font-['Inter'] text-[13px] font-semibold text-white/90 leading-none mb-0.5"
                    >
                      {{ $t('gameSound') }}
                    </p>
                    <p
                      class="font-['Inter'] text-[12px] text-white/50 leading-[1.45]"
                    >
                      {{ $t('gameSoundDesc') }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 bg-white/5 rounded-[12px] px-4 py-3"
                >
                  <span class="text-xl flex-shrink-0">🖼️</span>
                  <div>
                    <p
                      class="font-['Inter'] text-[13px] font-semibold text-white/90 leading-none mb-0.5"
                    >
                      {{ $t('gameVis') }}
                    </p>
                    <p
                      class="font-['Inter'] text-[12px] text-white/50 leading-[1.45]"
                    >
                      {{ $t('gameVisDesc') }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 bg-white/5 rounded-[12px] px-4 py-3"
                >
                  <span class="text-xl flex-shrink-0">📊</span>
                  <div>
                    <p
                      class="font-['Inter'] text-[13px] font-semibold text-white/90 leading-none mb-0.5"
                    >
                      {{ $t('gameText') }}
                    </p>
                    <p
                      class="font-['Inter'] text-[12px] text-white/50 leading-[1.45]"
                    >
                      {{ $t('gameTextDesc') }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                class="w-full rounded-[10px] bg-[#2071c1] hover:bg-[#1a5b9c] transition-colors p-3 font-['Inter'] text-[14px] font-medium text-white cursor-pointer"
                @click="phase = 'game'"
              >
                {{ $t('gameStart') }}
              </button>
            </div>
          </Transition>

          <!-- GAME PHASE -->
          <Transition name="fade">
            <div v-if="phase === 'game'" class="flex flex-col px-6 pb-8 pt-6">
              <span
                class="font-['Inter'] text-[10px] uppercase tracking-[0.12em] text-[#2071c1] mb-1"
                >📍 {{ $t('gameLoc') }}</span
              >
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
                  :alt="`${$t('gamePicLabel')}: ${poi.title}`"
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

          <!-- RESULT PHASE -->
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

// 🛠️ FIX: Interfaccia allineata con lo Store
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

// 🛠️ FIX: Computed per il titolo bilingue anche nel gioco
const poiTitle = computed(() => {
  const key = `title_${locale.value}` as 'title_it' | 'title_en'
  return props.poi[key] || props.poi.title || ''
})

type Phase = 'rules' | 'game' | 'result'
const phase = ref<Phase>('rules')
const won = ref(false)
const distanceFound = ref(0)
const checking = ref(false)

const DELTA_METERS = 30
const MAX_DISTANCE = 300

// Regole tradotte
const rules = computed(() => [
  { n: 1, text: t('gameRule1') },
  { n: 2, text: t('gameRule2') },
  { n: 3, text: t('gameRule3') },
  { n: 4, text: t('gameRule4', { dist: DELTA_METERS }) }
])

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
  const width = Math.round(1 + p * 3)
  return {
    border: `${width}px solid ${proximityColor.value}`,
    boxShadow:
      p > 0.3 ? `0 0 ${Math.round(p * 24)}px ${proximityColor.value}44` : 'none'
  }
})

const audioEnabled = ref(true)
let audioCtx: AudioContext | null = null
let tickInterval: ReturnType<typeof setInterval> | null = null

function getOrCreateAudioCtx(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTick(proximity: number) {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = 220 + proximity * 660
    oscillator.type = 'sine'
    const volume = 0.05 + proximity * 0.2
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
  } catch (e) {}
}

function playSuccessSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch (e) {}
}

function playFailSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    const notes = [300, 220]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sawtooth'
      const t = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  } catch (e) {}
}

function startTicking() {
  stopTicking()
  const updateTick = () => {
    if (phase.value !== 'game') return
    const p = proximity.value
    playTick(p)
    const interval = Math.round(2000 - p * 1800)
    tickInterval = setTimeout(updateTick, interval)
  }
  tickInterval = setTimeout(updateTick, 1000)
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

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000,
    r = (d: number) => (d * Math.PI) / 180
  const dLat = r(lat2 - lat1),
    dLon = r(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function startGps() {
  if (!navigator.geolocation) {
    gpsError.value = 'GPS non supportato'
    return
  }
  watchId = navigator.geolocation.watchPosition(
    (p) => {
      userLat.value = p.coords.latitude
      userLng.value = p.coords.longitude
      userAccuracy.value = p.coords.accuracy
      gpsError.value = null
      distance.value = haversineMeters(
        p.coords.latitude,
        p.coords.longitude,
        props.poi.lat,
        props.poi.lng
      )
    },
    (e) => {
      gpsError.value = e.message
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

onMounted(() => {
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
