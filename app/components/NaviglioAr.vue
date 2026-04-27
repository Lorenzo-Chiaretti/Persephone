<template>
  <div class="ar-wrapper" ref="arWrapperRef">
    <div v-if="arStore.isLoading && !detectedLocation" class="ar-overlay">
      <p>📍 Rilevamento posizione in corso...</p>
    </div>

    <div v-if="arStore.isIdle && detectedLocation" class="ar-overlay">
      <p>🗺️ {{ detectedLocation.label }}</p>
      <button @click="enterAR" class="ar-btn">🏛️ Scopri in AR</button>
    </div>

    <div v-if="arStore.isLoading && detectedLocation" class="ar-overlay">
      <p>⏳ Avvio fotocamera in corso...</p>
    </div>

    <div v-if="arStore.isError" class="ar-overlay">
      <p>❌ {{ arStore.errorMessage }}</p>
      <button @click="findLocation" class="ar-btn-small">
        Riprova posizione
      </button>
    </div>

    <div
      v-if="arStore.isScanning || arStore.isActive"
      class="ar-overlay ar-overlay--minimal"
    >
      <p v-if="arStore.isScanning">🔍 Inquadra i palazzi...</p>
      <p v-if="arStore.isActive">✅ Naviglio Ancorato!</p>

      <p style="color: lime; font-size: 0.9em; margin-top: 5px">
        AI Confidence: {{ confidence }}%
      </p>

      <p style="color: yellow; font-size: 0.8em; margin-top: 5px">
        Debug: {{ debugMessage }}
      </p>

      <button
        v-if="arStore.isScanning || arStore.isActive"
        @click="stopAR"
        class="ar-btn-small"
        style="margin-top: 10px"
      >
        Chiudi AR
      </button>
    </div>

    <canvas ref="glCanvas" class="ar-canvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Import Store e Composable (Assicurati che i percorsi siano corretti!)
import { useArStore } from '~/stores/arState'
import { useMultisetVPS } from '~/composables/useMultisetVPS'

const debugMessage = ref('In attesa...') //TODO: just for debug

const arStore = useArStore()
const {
  detectNearbyLocation,
  queryLocalization,
  getCameraIntrinsics,
  captureFrameAsBase64 // ← ora senza parametri
} = useMultisetVPS()

// --- STATO REATTIVO ---
const detectedLocation = ref(null)
const glCanvas = ref(null)
const confidence = ref(0)
const arWrapperRef = ref(null)

// --- VARIABILI DI CONTROLLO VPS ---
let isLocalizationRunning = false
let isFetchingVPS = false

// --- RIFERIMENTI WEBXR / THREE.JS ---
let renderer = null
let scene = null
let camera = null
let naviglioModel = null
let referenceSpace = null
let glBinding = null
let xrSession = null

// Avvio automatico al montaggio
onMounted(() => {
  findLocation()
})

// 1. TROVA GPS
async function findLocation() {
  try {
    arStore.startLoading()
    const location = await detectNearbyLocation()
    if (!location) {
      arStore.triggerError(
        'Nessun naviglio nei paraggi. Avvicinati a una location valida.'
      )
      return
    }
    detectedLocation.value = location
    arStore.resetSession()
  } catch (err) {
    arStore.triggerError(err.message)
  }
}

// 2. CLICK SUL BOTTONE
async function enterAR() {
  try {
    arStore.startLoading()
    if (!navigator.xr) throw new Error('WebXR non supportato.')
    const supported = await navigator.xr.isSessionSupported('immersive-ar')
    if (!supported) throw new Error('AR non supportata.')

    await startARSession(detectedLocation.value)
  } catch (err) {
    arStore.triggerError(err.message)
  }
}

// 3. AVVIO MOTORE AR E INTELLIGENZA ARTIFICIALE
async function startARSession(location) {
  renderer = new THREE.WebGLRenderer({
    canvas: glCanvas.value,
    alpha: true,
    antialias: true,
    premultipliedAlpha: false
  })

  renderer.setClearColor(0x000000, 0)
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  )
  scene.add(new THREE.AmbientLight(0xffffff, 1.5))
  scene.add(new THREE.DirectionalLight(0xffffff, 1))

  // Accendi Fotocamera
  xrSession = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: [],
    optionalFeatures: ['local-floor', 'dom-overlay'],
    domOverlay: { root: arWrapperRef.value }
  })

  await renderer.xr.setSession(xrSession)

  async function requestBestReferenceSpace(session) {
    const types = ['local-floor', 'local', 'viewer']
    for (const type of types) {
      try {
        const space = await session.requestReferenceSpace(type)
        debugMessage.value = `Reference space: ${type}`
        return space
      } catch {
        continue
      }
    }
    throw new Error('Nessun reference space supportato su questo dispositivo')
  }

  referenceSpace = await requestBestReferenceSpace(xrSession)

  await loadNaviglioModel('/models/naviglio-senato.glb')
  if (naviglioModel) naviglioModel.visible = false

  arStore.setCameraReady(xrSession)

  // --- ACCENDI IL MOTORE DI RICERCA VPS ---
  isLocalizationRunning = true
  isFetchingVPS = false

  // LOOP DI RENDERING E INVIO FOTO
  renderer.setAnimationLoop((timestamp, xrFrame) => {
    if (!xrFrame) return

    const viewerPose = xrFrame.getViewerPose(referenceSpace)
    if (viewerPose) {
      const view = viewerPose.views[0]

      if (isLocalizationRunning && !isFetchingVPS) {
        isFetchingVPS = true
        debugMessage.value = '1. Estrazione foto...'

        // Esegui la cattura in un microtask separato per non bloccare il frame
        Promise.resolve().then(() => {
          try {
            const base64Image = captureFrameAsBase64(renderer)

            if (!base64Image) {
              debugMessage.value = 'ERR: Foto vuota'
              setTimeout(() => {
                isFetchingVPS = false
              }, 1000)
              return
            }

            debugMessage.value = '2. Invio al server...'
            const intrinsics = getCameraIntrinsics(view)

            queryLocalization(base64Image, intrinsics, detectedLocation.value)
              .then((result) => {
                confidence.value = Math.round((result.confidence || 0) * 100)
                if (result.poseFound && naviglioModel) {
                  naviglioModel.position.set(
                    result.position.x,
                    result.position.y,
                    result.position.z
                  )
                  naviglioModel.quaternion.set(
                    result.rotation.x,
                    result.rotation.y,
                    result.rotation.z,
                    result.rotation.w
                  )
                  naviglioModel.visible = true
                  arStore.setLocalized()
                  debugMessage.value = '✅ Trovato!'
                } else {
                  arStore.setLostTracking()
                  debugMessage.value = `Cercando... (${confidence.value}%)`
                }
              })
              .catch((err) => {
                debugMessage.value = 'ERR API: ' + err.message
              })
              .finally(() => {
                setTimeout(() => {
                  isFetchingVPS = false
                }, 3000)
              })
          } catch (err) {
            debugMessage.value = 'CRASH: ' + err.message
            setTimeout(() => {
              isFetchingVPS = false
            }, 1000)
          }
        })
      }
    }

    // Il render avviene sempre, indipendentemente dalla localizzazione
    renderer.render(scene, camera)
  })

  xrSession.addEventListener('end', stopAR)
}

// 4. CARICAMENTO MODELLO
async function loadNaviglioModel(modelPath) {
  return new Promise((resolve, reject) => {
    if (!modelPath) return reject(new Error('Modello 3D mancante'))

    const loader = new GLTFLoader()
    loader.load(
      modelPath,
      (gltf) => {
        naviglioModel = gltf.scene
        // IL MODELLO DEVE PARTIRE INVISIBILE, appare solo se l'AI lo posiziona!
        naviglioModel.visible = false
        naviglioModel.scale.set(0.1, 0.1, 0.1)
        scene.add(naviglioModel)
        resolve()
      },
      undefined,
      reject
    )
  })
}

// 5. PULIZIA
function stopAR() {
  isLocalizationRunning = false
  isFetchingVPS = false
  confidence.value = 0
  if (renderer) renderer.setAnimationLoop(null)
  arStore.resetSession()
}

onUnmounted(() => {
  stopAR()
})
</script>

<style scoped>
.ar-wrapper {
  position: fixed;
  inset: 0;
  background: transparent !important;
  pointer-events: none;
}
.ar-canvas {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
  pointer-events: none;
}
.ar-overlay {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  z-index: 10;
  pointer-events: auto;
}
.ar-overlay--minimal {
  padding: 1rem;
  min-width: 200px;
}
.ar-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}
.ar-btn-small {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
