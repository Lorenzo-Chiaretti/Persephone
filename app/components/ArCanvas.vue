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
            👵 La Nonna ti ascolta...
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
              placeholder="Scrivi alla nonna..."
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
              {{ isChatMode ? '🎤 Passa a Voce' : '⌨️ Non posso parlare' }}
            </button>

            <button
              @click="arStore.resetSession"
              class="bg-[#424242]/80 text-white px-5 py-2.5 rounded-full font-medium text-[13px] backdrop-blur-sm"
            >
              Exit AR
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="arStore.isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto"
      >
        <div class="animate-spin text-3xl mb-4">⏳</div>
        <p class="text-white font-['Inter']">Avvio fotocamera...</p>
      </div>

      <div
        v-if="arStore.isScanning"
        class="absolute inset-x-0 top-20 flex justify-center pointer-events-none"
      >
        <div
          class="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur flex items-center gap-2"
        >
          <span class="animate-pulse text-xl">🔍</span>
          <p class="text-[14px]">Inquadra i palazzi attorno a te...</p>
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
        <p class="font-bold">Oops!</p>
        <p class="text-[14px]">{{ arStore.errorMessage }}</p>
        <button @click="arStore.resetSession" class="mt-2 text-xs underline">
          Riprova
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

// --- 1. CONFIG & STORES ---
const arStore = useArStore()
const config = useRuntimeConfig()

// --- 2. LOGICA NONNA (Composable) ---
const {
  startContinuousListening,
  processMessage, // Aggiunto qui per usarlo in handleSendText
  isListening,
  isSpeaking,
  isChatMode,
  chatHistory,
  isNearNonna
} = useAiNonna()

// --- 3. REFS & CHAT HANDLERS ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const manualText = ref('') // Spostato fuori (globale nello script)

const handleSendText = async () => {
  if (!manualText.value.trim()) return
  const text = manualText.value
  manualText.value = ''
  await processMessage(text)
}

const testPoi = (id: string) => {
  console.log('Simulazione POI:', id)
  arStore.selectedPoi = { id: id }
  isNearNonna.value = true
  startContinuousListening()
}

// --- 4. CONFIGURAZIONE HEAD ---
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

// Core variables di Three.js
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

// --- 5. SESSIONE AR ---
const startArSession = async () => {
  // LOGICA SIMULAZIONE PC
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
    console.error('AR Session failed, falling back to simulation:', error)
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

// --- 6. THREE.JS ENGINE ---
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
  if (frame) {
    handleGeospatialTracking(frame)
  }
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer || renderer.xr.isPresenting) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
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
