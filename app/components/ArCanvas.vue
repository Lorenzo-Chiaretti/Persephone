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
      ></div>

      <div class="w-full flex justify-end">
        <button
          @click="arStore.resetSession"
          class="pointer-events-auto bg-[#424242]/80 text-white px-5 py-2.5 rounded-full font-['Inter'] text-[14px] font-medium backdrop-blur-sm transition-transform active:scale-95"
        >
          Exit AR
        </button>
      </div>

      <div
        v-if="arStore.isLoading"
        class="absolute inset-0 flex items-center justify-center bg-black/80"
      >
        <p class="text-white">Avvio fotocamera...</p>
      </div>

      <div
        v-if="arStore.isScanning"
        class="absolute inset-x-0 top-20 flex justify-center pointer-events-none"
      >
        <div
          class="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur flex items-center gap-2"
        >
          <span class="animate-spin text-xl">⏳</span>
          <p>Inquadra i palazzi attorno a te...</p>
        </div>
      </div>

      <div class="relative flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          class="opacity-60 drop-shadow-md"
        >
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
        class="pointer-events-auto bg-white/90 text-[#424242] px-6 py-4 rounded-[16px] backdrop-blur-md text-center max-w-[320px] mb-8 shadow-lg font-['Inter'] text-[14px]"
      >
        <div
          v-if="arStore.isError"
          class="flex items-center gap-3 text-red-600 font-bold"
        >
          <span class="text-[18px]"></span>
          <p>{{ arStore.errorMessage }}</p>
        </div>

        <div
          v-else-if="arStore.isLoading"
          class="flex items-center gap-3 animate-pulse"
        >
          <span class="text-[18px]"></span>
          <p>Scanning surroundings... Point your camera at the buildings.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { useArStore } from '~/stores/arState'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { handleGeospatialTracking } from '~/utils/arTracking'

// TODO GAB: importare GLTFLoader

const arStore = useArStore()
const config = useRuntimeConfig()
useHead({
  meta: [
    {
      name: 'google-ar-core-geospatial-api-key',
      content: config.public.googleGeospatialKey
    }
  ]
})

// ==============================================================
// EXPOSING GEOSPATIAL CONFIG
// ==============================================================

const props = defineProps<{ active: boolean }>()

const geospatialConfig = {
  requiredFeatures: ['local-floor'],
  optionalFeatures: [
    'anchors',
    'geospatial-api',
    'dom-overlay'
  ]
}

// ==============================================================
// REFS AND VARIABLES
// ==============================================================

const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)

// Core variables of Three.js (non-reactive for better performance)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

// ==============================================================
// STARTING AR EXPERIENCE
// ==============================================================

const startArSession = async () => {
  // Checks if browser supports AR
  if (!navigator.xr) {
    arStore.triggerError('AR is not supported on this browser.')
    return
  }

  if (!overlayRef.value) {
    console.error('Error: overlayRef still not mounted on DOM.')
    return
  }

  arStore.startLoading()

  try {
    // Connecting DOM overlay
    const sessionConfig = {
      ...geospatialConfig,
      domOverlay: { root: overlayRef.value }
    }

    // Request session
    const session = await navigator.xr.requestSession(
      'immersive-ar',
      sessionConfig
    )

    //Initialize three.js
    initThree()

    // Mount 3D engine
    await renderer.xr.setSession(session)

    arStore.setCameraReady(session)
    session.addEventListener('end', () => {
      arStore.resetSession()
    })
  } catch (error) {
    arStore.triggerError('Unable to start Camera or access was denied.')
    console.error(error)
  }
}

//Expose session to app.vue
defineExpose({
  startArSession,
  geospatialConfig
})

// ==============================================================
// 3D SCENE INITIALIZATION
// ==============================================================

const initThree = () => {
  if (!canvasRef.value) return

  // Scene creation
  scene = new THREE.Scene()

  // Camera creation (FOV, Aspect Ratio, Near, Far)
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  )

  // Renderer creation
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Enable WebXR
  renderer.xr.enabled = true

  // TODO GAB: Aggiungi Luci e Loader del modello

  // Render Loop
  renderer.setAnimationLoop(render)
}

const render = (timestamp: number, frame?: any) => {
  // TODO: Per team api geospaziale, basta questo per il posizionamento?
  if (frame) {
    const isLocalized = handleGeospatialTracking(frame)
    //console.log('isLocalized', isLocalized)
  }

  renderer.render(scene, camera)
}

// RESIZE HANDLING
// const handleResize = () => {
//   camera.aspect = window.innerWidth / window.innerHeight
//   camera.updateProjectionMatrix()
//   renderer.setSize(window.innerWidth, window.innerHeight)
// }


const handleResize = () => {
  // 1. Se non abbiamo ancora premuto "Entra in AR", ignora il resize
  if (!camera || !renderer) return

  // 2. Se siamo in AR (WebXR sta presentando), NON forzare il resize, ci pensa lui
  if (renderer.xr.isPresenting) return

  // 3. Se siamo in una normale scena 3D sul web, aggiorna le proporzioni
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// MOUNTING
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// UNMOUNTING
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  renderer.dispose()
})
</script>

<style scoped>
canvas {
  touch-action: pan-y;
}
</style>
