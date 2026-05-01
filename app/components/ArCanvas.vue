<template>
  <div
    v-show="!arStore.isIdle"
    class="relative w-full h-screen overflow-hidden bg-black"
  >
    <canvas ref="canvasRef" class="block w-full h-full" />

    <div ref="overlayRef" class="absolute inset-0 pointer-events-none">
      <div
        id="ar-ui-root"
        v-if="arStore.isActive"
        class="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-transparent pointer-events-auto"
      >
        <div class="w-full flex flex-col items-center pointer-events-none">
          <div
            v-if="isListening && !isChatMode"
            class="bg-red-500 text-white px-4 py-2 rounded-full animate-pulse mb-2 shadow-lg"
          >
            {{ $t('arListening') }}
          </div>
          <div
            v-if="chatHistory.length > 0"
            class="mt-4 bg-white/95 text-gray-800 p-4 rounded-2xl shadow-xl max-w-[90%] w-full max-h-[40vh] overflow-y-auto border-l-4 border-blue-500 pointer-events-auto"
          >
            <p class="text-sm italic leading-relaxed break-words">
              {{ chatHistory[chatHistory.length - 1]?.content }}
            </p>
          </div>
        </div>

        <!-- Debug buttons -->
        <div
          class="absolute left-4 top-1/4 flex flex-col gap-2 pointer-events-auto"
        >
          <p
            class="text-[10px] text-white bg-black/40 p-1 rounded uppercase font-bold"
          >
            Debug Loc:
          </p>
          <button
            @click="testPoi('via-senato')"
            :class="
              arStore.selectedPoi?.id === 'via-senato'
                ? 'bg-green-600 scale-105'
                : 'bg-orange-500'
            "
            class="text-white p-2 text-xs rounded shadow-lg transition-all"
          >
            📍 Via Senato
          </button>
          <button
            @click="testPoi('laghetto-marco')"
            :class="
              arStore.selectedPoi?.id === 'laghetto-marco'
                ? 'bg-green-600 scale-105'
                : 'bg-orange-500'
            "
            class="text-white p-2 text-xs rounded shadow-lg transition-all"
          >
            📍 Laghetto
          </button>
        </div>

        <div class="w-full flex flex-col gap-4 pointer-events-auto">
          <div
            v-if="isChatMode"
            class="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex gap-2"
          >
            <input
              v-model="manualText"
              @keyup.enter="handleSendText"
              type="text"
              :placeholder="$t('arWrite')"
              class="flex-1 bg-white/20 border-none rounded-full px-4 py-2 text-white placeholder:text-white/50 outline-none"
            />
            <button
              @click="handleSendText"
              class="bg-blue-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ➤
            </button>
          </div>

          <div class="flex justify-between items-center">
            <button
              @click="isChatMode = !isChatMode"
              class="bg-white/20 backdrop-blur px-5 py-2.5 rounded-full text-white text-[13px] border border-white/30"
            >
              {{ isChatMode ? $t('arSwitchVoice') : $t('arCantSpeak') }}
            </button>
            <button
              @click="arStore.resetSession"
              class="bg-[#424242]/80 text-white px-5 py-2.5 rounded-full font-medium text-[13px] backdrop-blur-sm"
            >
              {{ $t('arExit') }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="arStore.isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto"
      >
        <div class="animate-spin text-3xl mb-4">⏳</div>
        <p class="text-white font-['Inter']">{{ $t('arLoading') }}</p>
      </div>

      <div
        v-if="arStore.isScanning"
        class="absolute inset-x-0 top-20 flex justify-center pointer-events-none"
      >
        <div
          class="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur flex items-center gap-2"
        >
          <span class="animate-pulse text-xl">🔍</span>
          <p class="text-[14px]">{{ $t('arScan') }}</p>
        </div>
      </div>

      <div
        v-if="arStore.isScanning"
        class="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none"
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line
            x1="20"
            y1="10"
            x2="20"
            y2="30"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
          />
          <line
            x1="10"
            y1="20"
            x2="30"
            y2="20"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <div
        v-if="arStore.isError"
        class="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto bg-white/90 text-red-600 px-6 py-4 rounded-[16px] backdrop-blur-md shadow-lg text-center min-w-[280px]"
      >
        <p class="font-bold">{{ $t('arOops') }}</p>
        <p class="text-[14px]">{{ arStore.errorMessage }}</p>
        <button @click="arStore.resetSession" class="mt-2 text-xs underline">
          {{ $t('arRetry') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { useArStore } from '~/stores/arState'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { handleGeospatialTracking } from '~/utils/arTracking'
import { useAiNonna } from '~/utils/aiNonna'

const arStore = useArStore()
const config = useRuntimeConfig()
const { locale } = useI18n()

const {
  startContinuousListening,
  processMessage,
  isListening,
  isSpeaking,
  isChatMode,
  chatHistory,
  isNearNonna
} = useAiNonna()

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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const manualText = ref('')

const handleSendText = async () => {
  if (!manualText.value.trim()) return
  const text = manualText.value
  manualText.value = ''
  await processMessage(text, getNonnaSystemPrompt())
}

const testPoi = (id: string) => {
  console.log('Simulazione POI:', id)
  arStore.selectedPoi = { id: id }
  isNearNonna.value = true
  startContinuousListening(getNonnaSystemPrompt())
}

useHead({
  meta: [
    {
      name: 'google-ar-core-geospatial-api-key',
      content: config.public.googleGeospatialKey
    }
  ]
})

const props = defineProps<{ active: boolean }>()
const geospatialConfig = {
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['anchors', 'geospatial-api', 'dom-overlay']
}

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

const startArSession = async () => {
  if (!navigator.xr) {
    console.warn('AR non supportata: attivo modalità simulazione PC')
    arStore.setLocalized()
    initThree()
    const animate = () => {
      if (arStore.isIdle) return
      render(performance.now())
      requestAnimationFrame(animate)
    }
    animate()
    return
  }

  if (!overlayRef.value) return
  arStore.startLoading()

  try {
    const sessionConfig = {
      ...geospatialConfig,
      domOverlay: { root: overlayRef.value }
    }
    const session = await navigator.xr.requestSession(
      'immersive-ar',
      sessionConfig
    )

    initThree()
    await renderer.xr.setSession(session)
    arStore.setCameraReady(session)

    session.addEventListener('end', () => {
      arStore.resetSession()
    })
  } catch (error) {
    console.error('AR Session failed:', error)
    arStore.setLocalized()
    initThree()
    const animateFallback = () => {
      if (arStore.isIdle) return
      render(performance.now())
      requestAnimationFrame(animateFallback)
    }
    animateFallback()
  }
}

defineExpose({ startArSession, geospatialConfig })

const initThree = () => {
  if (!canvasRef.value) return
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  )
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.xr.enabled = true
  renderer.setAnimationLoop(render)
}

const render = (timestamp: number, frame?: any) => {
  if (frame) handleGeospatialTracking(frame)
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer || renderer.xr.isPresenting) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => window.addEventListener('resize', handleResize))
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
canvas {
  touch-action: pan-y;
}
</style>
