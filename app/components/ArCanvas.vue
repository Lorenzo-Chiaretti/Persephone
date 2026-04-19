<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">

    <canvas ref="canvasRef" class="block w-full h-full" />

    <div ref="overlayRef" class="absolute inset-0 pointer-events-none">
      
      <div v-if="arStore.isIdle" class="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button 
          @click="startArSession"
          class="bg-white text-black px-8 py-4 rounded-full font-bold shadow-lg"
        >
          Start AR Experience
        </button>
      </div>

      <div v-if="arStore.isLoading" class="absolute inset-0 flex items-center justify-center bg-black/80">
        <p class="text-white text-xl animate-pulse">Avvio fotocamera e sensori Google...</p>
      </div>

      <div v-if="arStore.isError" class="absolute top-10 left-4 right-4 bg-red-600 text-white p-4 rounded-xl pointer-events-auto shadow-lg">
        <p class="font-bold">Errore di avvio</p>
        <p class="text-sm opacity-90">{{ arStore.errorMessage }}</p>
        <button @click="arStore.resetSession()" class="mt-2 text-sm underline">Chiudi</button>
      </div>

      <div v-if="arStore.isActive" class="absolute top-10 right-4 pointer-events-auto">
         <button @click="arStore.resetSession()" class="bg-black/50 text-white p-3 rounded-full backdrop-blur">
           Esci
         </button>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
  import * as THREE from 'three'
  import { useArStore } from '~/stores/arState'
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { handleGeospatialTracking } from '~/utils/arTracking'

  const arStore = useArStore()


  // ==============================================================
  // EXPOSING GEOSPATIAL CONFIG
  // ==============================================================

  const props = defineProps<{ active: boolean }>()

  // TODO: da importare quando si fa:
  // navigator.xr.requestSession('immersive-ar', geospatialConfig)
  const geospatialConfig = {
    requiredFeatures: ['local-floor'],
    optionalFeatures: [
      'camera-access', 
      'anchors', 
      'geospatial-api', 
      'dom-overlay'
    ],
    domOverlay: { root: null as HTMLElement | null } // Verrà popolato da Marco all'avvio
  }

  // Esponi la config a Marco
  defineExpose({ geospatialConfig })


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
      arStore.triggerError("La realtà aumentata non è supportata su questo browser.")
      return
    }

    arStore.startLoading()

    try {
      // Connecting DOM overlay
      if (overlayRef.value) {
        geospatialConfig.domOverlay.root = overlayRef.value
      }

      // Request session
      const session = await navigator.xr.requestSession('immersive-ar', geospatialConfig)

      // Mount 3D engine
      await renderer.xr.setSession(session)

      arStore.setSessionActive(session)
      session.addEventListener('end', () => {
        arStore.resetSession()
      })

    } catch (error) {
      arStore.triggerError("Unable to start Camera or access was denied.")
      console.error(error)
    }
  }


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
    
    // Render Loop
    renderer.setAnimationLoop(render)
  }
  
  const render = (timestamp: number, frame?: any) => {
    
    // TODO: Per team api geospaziale, aggiungere i calcoli di posizionamento
    if (frame) {
      const isLocalized = handleGeospatialTracking(frame)
      console.log('isLocalized', isLocalized)
    }

    renderer.render(scene, camera)
  }

  // RESIZE HANDLING
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // MOUNTING
  onMounted(() => {
    initThree()
    window.addEventListener('resize', handleResize)
  })

  // UNMOUNTING
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    renderer.dispose()
  })


</script>

<style scoped>
  /* Assicuriamoci che il canvas sia perfettamente a tutto schermo */
  canvas {
    touch-action: none;
  }
</style>