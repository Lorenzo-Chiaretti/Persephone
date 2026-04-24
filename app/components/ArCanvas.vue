<template>
  <div class="relative w-full h-screen overflow-hidden bg-gradient-to-r from-red-500 to-blue-500">

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
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { useArStore } from '~/stores/arState'
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { handleGeospatialTracking } from '~/utils/arTracking'
  import { Water } from 'three/examples/jsm/objects/Water.js'

  const arStore = useArStore()


  // ==============================================================
  // EXPOSING GEOSPATIAL CONFIG
  // ==============================================================

  const props = defineProps<{ active: boolean }>()

  const geospatialConfig = {
    requiredFeatures: ['local-floor'],
    optionalFeatures: [
      'camera-access', 
      'anchors', 
      'geospatial-api', 
      'dom-overlay'
    ],
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
  let controls: any
  let water: any


  // ==============================================================
  // STARTING AR EXPERIENCE
  // ==============================================================

  const startArSession = async () => {

    // Checks if browser supports AR
    if (!navigator.xr) {
      arStore.triggerError("AR is not supported on this browser.")
      return
    }

    if (!overlayRef.value) {
      console.error("Error: overlayRef still not mounted on DOM.")
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
      const session = await navigator.xr.requestSession('immersive-ar', sessionConfig)

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
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 2000)
    camera.position.set(0, 30, 40)

    // Renderer creation
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // optimize performance
    
    // Enable WebXR
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.xr.enabled = true

    // --- SETUP LIGHT ---
    
    // Luce Ambientale (Luce di base, debole per non appiattire tutto)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) 
    scene.add(ambientLight)

    // Luce Direzionale (Il Sole)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
    directionalLight.position.set(5, 10, 5) // Posizionato in alto a destra
    directionalLight.castShadow = true // per proiettare ombre
    // Miglioriamo la qualità delle ombre
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)


    // --- CARICAMENTO DEL MODELLO GLB ---
    
    const loader = new GLTFLoader()
    
    loader.load(
      '/models/Via_senato_v2.glb', 
      (gltf) => {
        const model = gltf.scene

        // 3. APPLICAZIONE DELLA MAGIA HOLDOUT
        // Scorriamo tutti gli oggetti dentro il modello
        model.traverse((node) => {

          const child = node as THREE.Mesh

          if (child.isMesh) {
            // Fagli ricevere e proiettare ombre
            child.castShadow = true
            child.receiveShadow = true

            const material = child.material as THREE.Material

            if (material && material.name === 'Mat_Holdout') {
              // Rende l'oggetto invisibile, ma fa bucare lo sfondo
              material.colorWrite = false
              material.depthWrite = true
              child.renderOrder = -1 // Assicuriamoci che venga renderizzato prima delle altre cose
            }

            // water texture
            if (child.name === 'Acqua') {
              
              const waterGeometry = child.geometry

              water = new Water(
                waterGeometry,
                {
                  textureWidth: 512,
                  textureHeight: 512,

                  waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function ( texture ) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                  }),
                  // Impostazioni estetiche
                  sunDirection: directionalLight.position.clone().normalize(),
                  sunColor: 0xffffff,
                  waterColor: 0x497785, // Verde scuro 
                  distortionScale: 1.5, // Grandezza delle onde
                  alpha: 0.9 // Leggermente trasparente
                }
              )

              // Mettiamo l'acqua esattaamente dove si trovava il piano di Blender
              water.position.copy(child.position)
              water.rotation.copy(child.rotation)
              water.scale.copy(child.scale)
              
              // Aggiungiamo l'acqua vera alla scena e nascondiamo il piano "finto"
              scene.add(water)
              child.visible = false 
            }
          }
        })

        // Aggiungiamo il modello finalmente pronto alla scena
        scene.add(model)
        console.log("Naviglio caricato e Holdout applicato con successo!")
      },
      (xhr) => {
        // Feedback sul progresso (opzionale)
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      },
      (error) => {
        console.error('Si è verificato un errore durante il caricamento del GLB:', error)
      }
    )

    // Aggiungiamo i controlli per ruotare col mouse su PC!
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true // Aggiunge inerzia fisica al movimento
    controls.dampingFactor = 0.05
    
    // Render Loop
    renderer.setAnimationLoop(render)
  }
  
  const render = (timestamp: number, frame?: any) => {
    
    // TODO: Per team api geospaziale, basta questo per il posizionamento?
    if (frame) {
      const isLocalized = handleGeospatialTracking(frame)
      console.log('isLocalized', isLocalized)
    }
    if (controls) controls.update()

    if (water) {
      water.material.uniforms['time'].value += 0.20 / 60.0;
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
  canvas {
    touch-action: pan-y;
  }
</style>