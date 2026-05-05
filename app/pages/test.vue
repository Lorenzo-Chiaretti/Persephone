<template>
  <div class="webxr-container" ref="containerRef">
    <!-- Questo div viene proiettato in AR grazie al DOM Overlay -->
    <div id="ar-overlay" v-show="isArActive">
      <div class="ar-instructions">
        {{ instructionText }}
      </div>
      <button class="exit-btn" @click="exitAR">Esci dall'AR</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // Scommenta per il tuo modello

const containerRef = ref(null)
const isArActive = ref(false)
const instructionText = ref('Muovi il telefono per inquadrare il pavimento...')

// Tutte le variabili globali (ora modelContainer è qui!)
let scene, camera, renderer
let reticle, naviglioModel
let modelContainer
let hitTestSource = null
let hitTestSourceRequested = false
let controller

onMounted(() => {
  initWebXR()
})

function initWebXR() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  )

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
  light.position.set(0.5, 1, 0.25)
  scene.add(light)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
  dirLight.position.set(0, 5, 0)
  scene.add(dirLight)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' // Diciamo a Chrome di usare la scheda video al massimo!
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true
  containerRef.value.appendChild(renderer.domElement)

  // LA CORREZIONE: Chiediamo a WebXR di usare il nostro #ar-overlay come interfaccia utente
  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.getElementById('ar-overlay') }
  })
  arButton.addEventListener('click', () => {
    isArActive.value = true
  })
  document.body.appendChild(arButton)

  // Mirino
  const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  )
  const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  reticle = new THREE.Mesh(reticleGeometry, reticleMaterial)
  reticle.matrixAutoUpdate = false
  reticle.visible = false
  scene.add(reticle)

  // Creazione del Contenitore Modello
  modelContainer = new THREE.Group()
  scene.add(modelContainer)

  // CUBO DI TEST (Commentalo quando usi il GLTFLoader)
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const material = new THREE.MeshStandardMaterial({ color: 0x0055ff })
  naviglioModel = new THREE.Mesh(geometry, material)
  naviglioModel.position.set(0, 0.25, 0)
  modelContainer.add(naviglioModel)
  modelContainer.visible = false

  /* -- IL TUO MODELLO GLTF (Scommenta questo e commenta il cubo sopra) --
  const loader = new GLTFLoader()
  loader.load('/models/naviglio-senato.glb', (gltf) => {
    naviglioModel = gltf.scene
    naviglioModel.scale.set(1, 1, 1) 
    modelContainer.add(naviglioModel)
  })
  */

  // --- IL TRUCCO DELL'OMBRA ---
  const shadowGeometry = new THREE.PlaneGeometry(0.7, 0.7) // Leggermente più grande del modello
  shadowGeometry.rotateX(-Math.PI / 2) // La sdraiamo piatta sul pavimento

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3, // Grigio scuro semi-trasparente
    depthWrite: false // Evita il glitch visivo (z-fighting) col pavimento
  })

  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial)
  shadowMesh.position.y = 0.005 // La alziamo di MEZZO MILLIMETRO per non fonderla col pavimento AR

  // Aggiungiamo l'ombra al contenitore principale, sotto al modello
  modelContainer.add(shadowMesh)

  controller = renderer.xr.getController(0)
  controller = renderer.xr.getController(0)
  controller.addEventListener('select', () => {
    if (reticle.visible) {
      // 1. Estraiamo le vere coordinate 3D del mirino in questo momento
      const reticlePos = new THREE.Vector3().setFromMatrixPosition(
        reticle.matrix
      )

      // 2. Calcoliamo la distanza
      const distance = camera.position.distanceTo(reticlePos)

      // 3. Controllo distanza
      if (distance < 1.5) {
        instructionText.value = `Troppo vicino (${distance.toFixed(1)}m)! Punta più lontano.`
        return // Blocchiamo lo spawn
      }

      // 4. Se la distanza è ok, posizioniamo il modello
      modelContainer.position.copy(reticlePos)

      const lookPos = new THREE.Vector3(
        camera.position.x,
        modelContainer.position.y,
        camera.position.z
      )
      modelContainer.lookAt(lookPos)

      modelContainer.visible = true
      instructionText.value = 'Modello piazzato! Puoi camminarci intorno.'
    }
  })
  scene.add(controller)
  scene.add(controller)

  renderer.setAnimationLoop(render)
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace()
    const session = renderer.xr.getSession()

    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace('viewer').then((viewerSpace) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source) => {
          hitTestSource = source
        })
      })
      session.addEventListener('end', () => {
        hitTestSourceRequested = false
        hitTestSource = null
        isArActive.value = false
        if (modelContainer) modelContainer.visible = false
      })
      hitTestSourceRequested = true
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource)

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0]
        const pose = hit.getPose(referenceSpace)

        reticle.visible = true
        reticle.matrix.fromArray(pose.transform.matrix)

        if (!modelContainer.visible) {
          instructionText.value = 'Tocca lo schermo per posizionare.'
        }
      } else {
        reticle.visible = false
      }
    }
  }

  renderer.render(scene, camera)
}

function exitAR() {
  const session = renderer.xr.getSession()
  if (session) {
    session.end() // Questo spegne la fotocamera e chiude la modalità AR
  }
}

onUnmounted(() => {
  renderer.setAnimationLoop(null)
  const arButton = document.getElementById('ARButton')
  if (arButton) arButton.remove()
})
</script>

<style scoped>
.webxr-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #111;
}
#ar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px;
  box-sizing: border-box;
  z-index: 10;
}
.ar-instructions {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-family: sans-serif;
  font-weight: bold;
  margin-bottom: 80px;
} /* Margine per non coprire il tasto X di sistema */
:deep(#ARButton) {
  bottom: 40px !important;
  background-color: #10b981 !important;
  border-radius: 10px !important;
  font-weight: bold !important;
}
.exit-btn {
  pointer-events: auto; /* Fondamentale: permette al dito di cliccare! */
  align-self: center;
  background: #8e8989;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 20px; /* Lo tiene staccato dal fondo */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
