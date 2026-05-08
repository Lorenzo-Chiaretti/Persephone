<template>
  <div class="fixed inset-0 z-50">

    <button
      class="absolute top-4 right-4 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur"
      @click="exitAR"
    >
      Exit AR
    </button>

    <div
      v-if="sceneReady && !modelPlaced"
      class="absolute bottom-12 left-0 right-0 z-20 flex justify-center"
    >
      <span class="bg-black/50 text-white px-6 py-3 rounded-full text-sm backdrop-blur">
        Tap to place model
      </span>
    </div>


    <!-- A-Frame Scene -->

    <a-scene
      v-if="sceneReady"
      naviglio-water
      tap-place
      xrextras-loading
      xrextras-runtime-error
      renderer="colorManagement: true"
      xrweb="allowedDevices: any"
      xrconfig
    >
      <a-assets>
        <a-asset-item id="naviglioModel" src="/models/naviglio.glb" />
      </a-assets>

      <a-camera
        id="camera"
        position="0 8 8"
        raycaster="objects: .cantap"
        cursor="
          fuse: false; 
          rayOrigin: mouse;"/>

      <a-entity
        light="type: directional; intensity: 0.8; castShadow: true"
        position="1 4.3 2.5"
      />

      <a-light type="ambient" intensity="0.5" />

      <!-- uses cantap class to allow the ground to be clicked -->
      <a-box
        id="ground"
        class="cantap"
        scale="1000 2 1000"
        position="0 -0.99 0"
        material="shader: shadow; transparent: true; opacity: 0.4"
        shadow
      />

    </a-scene>

  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, nextTick, ref } from 'vue'

  const emit = defineEmits(['exit'])

  const modelPlaced = ref(false)
  const sceneReady = ref(false)

  if (import.meta.client) {
    if (!window.AFRAME) {
      useHead({
        script: [
          {
            src: '/external/scripts/8frame-1.5.0.min.js',
          },
          {
            src: 'https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js',
            crossorigin: 'anonymous',
          },
          {
            src: 'https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js',
            crossorigin: 'anonymous',
            'data-preload-chunks': 'slam',
          },
        ],
      })
    }
  }

  function registerTapPlaceComponent() {
    if (!window.AFRAME || AFRAME.components['tap-place']) return
    AFRAME.registerComponent('tap-place', {
      init() {
        const ground = document.getElementById('ground')

        ground.addEventListener('click', (event) => {

          if (modelPlaced.value) return
          modelPlaced.value = true

          // Create new entity for the new object
          const newElement = document.createElement('a-entity')

          // The raycaster gives a location of the touch in the scene
          const touchPoint = event.detail.intersection.point
          newElement.setAttribute('position', touchPoint)

          newElement.setAttribute('rotation', '0 60 0')
          newElement.setAttribute('scale', '0.0001 0.0001 0.0001')
          newElement.setAttribute('visible', 'false')
          newElement.setAttribute('gltf-model', '#naviglioModel')
          newElement.setAttribute('shadow', { receive: false })
          newElement.setAttribute('position', {
            x: touchPoint.x,
            y: touchPoint.y - 2, //2 meters under ground offset
            z: touchPoint.z,
          })

          //Adds water shader
          newElement.setAttribute('naviglio-water', '')

          this.el.sceneEl.appendChild(newElement)

          newElement.addEventListener('model-loaded', () => {
            const mesh = newElement.getObject3D('mesh')

            //Adds holdout effect
            mesh.traverse((node) => {
              const child = node as any
              if (child.isMesh) {
                console.log('mesh:', node.name, '| material:', node.material?.name)
                child.castShadow = true
                child.receiveShadow = true
                if (child.material?.name === 'Mat_Holdout') {
                  child.material.colorWrite = false
                  child.material.depthWrite = true
                  child.renderOrder = -1
                }
              }
            })

            newElement.setAttribute('visible', 'true')
            //popup animation
            newElement.setAttribute('animation', {
              property: 'scale',
              to: '1 1 1',
              easing: 'easeOutElastic',
              dur: 800,
            })

          })
        })
      },
    })
  }

  function exitAR() {
    if (typeof window.XR8 !== 'undefined') {
    window.XR8.stop()
    }
    emit('exit')
    window.location.reload()
  }

  function registerWaterAnimation() {
    if (!window.AFRAME || AFRAME.components['naviglio-water']) return

    AFRAME.registerComponent('naviglio-water', {
      schema: {
        // Permette di modificare i parametri direttamente dall'HTML
        normalMap: { type: 'string', default: '/textures/waternormals.jpg' },
        waterColor: { type: 'color', default: '#497785' },
        distortionScale: { type: 'number', default: 1.5 },
        alpha: { type: 'number', default: 0.9 }
      },

      init: function () {
        this.water = null; // Salveremo qui l'oggetto acqua per poterlo animare
        const el = this.el;
        const THREE = window.THREE;

        // Dobbiamo aspettare che il file GLB abbia finito di caricarsi
        el.addEventListener('model-loaded', async () => {
          const mesh = el.getObject3D('mesh');
          if (!mesh) return;
          const { Water } = await import('~/utils/Water.js');

          // Attraversiamo tutto il modello 3D alla ricerca della mesh "Acqua"
          mesh.traverse((child) => {
            if (child.isMesh && child.name === 'Acqua') {
              
              const waterGeometry = child.geometry;

              // Carichiamo la texture delle normali
              const textureLoader = new THREE.TextureLoader();
              const normalTexture = textureLoader.load(this.data.normalMap, function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              });

              // Ricreiamo l'oggetto Water del tuo collega
              this.water = new Water(
                waterGeometry,
                {
                  textureWidth: 512,
                  textureHeight: 512,
                  waterNormals: normalTexture,
                  // Creiamo una direzione del sole fittizia verso il basso
                  sunDirection: new THREE.Vector3(0, 1, 0).normalize(), 
                  sunColor: 0xffffff,
                  waterColor: new THREE.Color(this.data.waterColor),
                  distortionScale: this.data.distortionScale,
                  alpha: this.data.alpha
                }
              );

              // Copiamo posizione, rotazione e scala esatte del piano di Blender
              this.water.position.copy(child.position);
              this.water.rotation.copy(child.rotation);
              this.water.scale.copy(child.scale);
              
              // In A-Frame, è meglio aggiungere l'acqua al genitore del piano originale
              // invece che alla scena globale, così segue l'ancoraggio AR del naviglio.
              child.parent.add(this.water); 
              
              // Nascondiamo il piano "finto"
              child.visible = false; 
            }
          });
        });
      },

      // Il tick viene chiamato ad ogni frame. Serve per far muovere l'acqua!
      tick: function (time, timeDelta) {
        if (this.water && this.water.material.uniforms['time']) {
          // timeDelta è in millisecondi, lo convertiamo in secondi
          this.water.material.uniforms['time'].value += timeDelta / 1000.0; 
        }
      }
    });
  }

onMounted(() => {
  registerTapPlaceComponent()
  registerWaterAnimation()

  window.addEventListener('xrloaded', async () => {
    registerTapPlaceComponent()
    registerWaterAnimation()
    sceneReady.value = true
    await nextTick()
  }, { once: true })
})

  onUnmounted(() => {
    if (typeof window.XR8 !== 'undefined') {
      window.XR8.stop()
    }
    window.location.reload()
  })

</script>