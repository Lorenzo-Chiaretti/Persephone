<template>
  <div class="fixed inset-0 z-50">

    <button
      class="absolute top-4 right-4 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur"
      @click="exitAR"
    >
      Exit AR
    </button>

    <!-- "BRING THE WATER BACK!" -->
    <div v-if="modelPlaced && !waterVisible">
      <button 
        class="absolute top-4 left-4 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur"
        @click="triggerWater"
      >
        Bring the Water Back!
      </button>
    </div>

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
  const waterVisible = ref(false)
  const sceneReady = ref(false)

  // ====================================================================================
  // IMPORT AR LIBRARIES
  // ====================================================================================

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


  // ====================================================================================
  // PLACE NAVIGLIO MODEL
  // ====================================================================================

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
            y: touchPoint.y - 2, // under ground offset
            z: touchPoint.z,
          })

          // Add water shader
          newElement.setAttribute('naviglio-water', '')

          this.el.sceneEl.appendChild(newElement)

          newElement.addEventListener('model-loaded', () => {
            const mesh = newElement.getObject3D('mesh')

            // Add holdout effect
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


  // ====================================================================================
  // RENDER AND ANIMATE WATER
  // ====================================================================================

  function registerWaterAnimation() {
    if (!window.AFRAME || AFRAME.components['naviglio-water']) return

    AFRAME.registerComponent('naviglio-water', {
      schema: {
        // Allows to modify params directly from HTML
        normalMap: { type: 'string', default: '/textures/waternormals.jpg' },
        waterColor: { type: 'color', default: '#109fe6' },
        distortionScale: { type: 'number', default: 1.5 },
        alpha: { type: 'number', default: 0.9 }
      },

      init: function () {
        this.water = null; // Water object

        // Variables for water animation
        this.targetY = null; // Final water height
        this.currentY = null; // Initial water height
        this.isFilling = false; // Animation state

        const el = this.el;
        const THREE = window.THREE;

        // Wait until the model is loaded
        el.addEventListener('model-loaded', async () => {
          const mesh = el.getObject3D('mesh');
          if (!mesh) return;
          const { Water } = await import('~/utils/Water.js');

          // Search for mesh "Acqua"
          mesh.traverse((child) => {
            if (child.isMesh && child.name === 'Acqua') {
              
              const waterGeometry = child.geometry;

              // Load normals texture
              const textureLoader = new THREE.TextureLoader();
              const normalTexture = textureLoader.load(this.data.normalMap, function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              });

              // Create water object
              this.water = new Water(
                waterGeometry,
                {
                  textureWidth: 512,
                  textureHeight: 512,
                  waterNormals: normalTexture,
                  // Create a sun direction downwards
                  sunDirection: new THREE.Vector3(0, 1, 0).normalize(), 
                  sunColor: 0xffffff,
                  waterColor: new THREE.Color(this.data.waterColor),
                  distortionScale: this.data.distortionScale,
                  alpha: this.data.alpha
                }
              );

              // Copy position, rotation and scale from blender plane
              this.water.position.copy(child.position);
              this.water.rotation.copy(child.rotation);
              this.water.scale.copy(child.scale);

              // ----------- Filling animation setup -----------
              this.targetY = child.position.y
              this.currentY = this.targetY - 5
              this.water.position.y = this.currentY
              this.water.visible = false
              // -----------------------------------------------
              
              // Add water to the model
              child.parent.add(this.water); 
              
              // Hide original water mesh (a blue plane)
              child.visible = false; 

              // ----------- Filling animation -----------
              el.addEventListener('toggle-water', () => {
                console.log("Starting Water animation")
                if(!this.water) return;
                this.isFilling = !this.isFilling;
                
                if(this.isFilling) {
                    this.water.visible = true; // Show water (now it's underneath)
                }
              });
              // -----------------------------------------

            }
          });
        });
      },

      // tick is called for each frame
      tick: function (time, timeDelta) {
        if(this.water) {
          // 1. Waves animation
          if (this.water.material.uniforms['time']) {
            // timeDelta is in milliseconds, convert it to seconds
            this.water.material.uniforms['time'].value += timeDelta * 0.3 / 1000.0; 
          }

          // 2. Filling animation
          if (this.isFilling && this.currentY < this.targetY) {
            this.currentY += timeDelta * 0.002; // Change this value to adjust speed
            if (this.currentY >= this.targetY) {
              this.currentY = this.targetY; // Stop water when we reach the target height
            }
            this.water.position.y = this.currentY;
          }
        }
      }
    });
  }

  const triggerWater = () => {
    const naviglioEntity = document.querySelector('[naviglio-water]');
    if (naviglioEntity) {
      // Inviamo l'evento custom che il componente sta ascoltando
      naviglioEntity.emit('toggle-water');
    }
  }


  // ====================================================================================
  // HANDLE END OF AR EXPERIENCE
  // ====================================================================================

  function exitAR() {
    if (typeof window.XR8 !== 'undefined') {
    window.XR8.stop()
    }
    emit('exit')
    window.location.reload()
  }


  // ====================================================================================
  // MOUNTING AND UNMOUNTING
  // ====================================================================================

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