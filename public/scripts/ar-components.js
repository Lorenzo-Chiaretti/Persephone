let modelPlaced = false
let waterVisible = false

const _isIndoor = new URLSearchParams(window.location.search).get('mode') === 'indoor'
const NAVIGLIO_SCALE = _isIndoor ? '0.25 0.25 0.25' : '2 2 2'
const NAVIGLIO_Z_OFFSET = _isIndoor ? -5 : -50
const NONNA_SCALE = _isIndoor ? '1 1 1' : '6 6 6'

const _isViaSenato = _poiId === 'via-senato'
const WATER_LEVEL = _isViaSenato ? 5 : 0.8
const WATER_SPEED = _isViaSenato ? 0.002 : 0.0005

  // ====================================================================================
  // PLACE NAVIGLIO MODEL
  // ====================================================================================

AFRAME.registerComponent('tap-place', {
  init() {
  const ground = document.getElementById('ground')

  ground.addEventListener('click', (event) => {
    if (window.modelPlaced) return
    window.modelPlaced = true

    const touchPoint = event.detail.intersection.point

    // ==========================================
    // 1. SPAWN DEL NAVIGLIO
    // ==========================================
    const naviglioEl = document.createElement('a-entity')
    naviglioEl.setAttribute('position', {
      x: touchPoint.x,
      y: touchPoint.y, 
      z: touchPoint.z + NAVIGLIO_Z_OFFSET,
    })
    naviglioEl.setAttribute('rotation', '0 310 0')
    naviglioEl.setAttribute('scale', '0.0001 0.0001 0.0001')
    naviglioEl.setAttribute('visible', 'false')
    naviglioEl.setAttribute('gltf-model', '#poiModel')
    naviglioEl.setAttribute('shadow', { receive: false })
    naviglioEl.setAttribute('naviglio-water', '')

    this.el.sceneEl.appendChild(naviglioEl)

    naviglioEl.addEventListener('model-loaded', () => {
      const mesh = naviglioEl.getObject3D('mesh')
      
      // Add holdout effect
      mesh.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true
          node.receiveShadow = true
          if (node.material?.name === 'Mat_Holdout') {
            node.material.colorWrite = false
            node.material.depthWrite = true
            node.renderOrder = -1
          }
        }
      })

      naviglioEl.setAttribute('visible', 'true')
      naviglioEl.setAttribute('animation', {
        property: 'scale',
        to: NAVIGLIO_SCALE,
        easing: 'easeOutElastic',
        dur: 800,
      })

      window.parent.postMessage({ type: 'MODEL_PLACED' }, '*')
    })

    // Salvo reference per lo spawn della vecchietta in un secondo momento
    window.lastTouchPoint = touchPoint;
    window.arSceneEl = this.el.sceneEl;
  }) // End ground.addEventListener
  }, // End init
})

AFRAME.registerComponent('proximity-trigger',{
  schema: {
    distance: { type: 'number', default: 4.5 },
  },

  init: function () {
    const THREE = window.THREE;

    this.camera = document.getElementById('camera')
    this.isNear = false 

    this.cameraPos = new THREE.Vector3()
    this.avatarPos = new THREE.Vector3()
  },

  tick: function () {
    if (!this.camera) return

    // 1. Prendi la posizione reale della telecamera (il telefono)
    this.camera.object3D.getWorldPosition(this.cameraPos)
    
    // 2. Prendi la posizione reale dell'avatar (la vecchietta)
    this.el.object3D.getWorldPosition(this.avatarPos)

    // 3. Calcola la distanza SOLO sugli assi X e Z (ignoriamo l'altezza Y)
    const dx = this.cameraPos.x - this.avatarPos.x
    const dz = this.cameraPos.z - this.avatarPos.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    // 4. Controlla se abbiamo superato la soglia (es. 2 metri)
    if (dist < this.data.distance) {
      if (!this.isNear) {
        this.isNear = true
        window.parent.postMessage({ type: 'USER_NEAR_MODEL' }, '*')
      }
    } else if(dist > this.data.distance + 1){
      if (this.isNear) {
        this.isNear = false
        window.parent.postMessage({type : 'USER_FAR_FROM_MODEL'}, '*')
      }
    }
  }
})

  // ====================================================================================
  // RENDER AND ANIMATE WATER
  // ====================================================================================

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
          const { Water } = await import('/scripts/Water.js');

          // Search for mesh "Water"
          mesh.traverse((child) => {
            if (child.isMesh && (child.name === 'Acqua' || child.name === 'Water')) {
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
              this.currentY = this.targetY - WATER_LEVEL
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
            this.currentY += timeDelta * WATER_SPEED; // Change this value to adjust speed
            if (this.currentY >= this.targetY) {
              this.currentY = this.targetY; // Stop water when we reach the target height
            }
            this.water.position.y = this.currentY;
          }
        }
      }
    });

window.addEventListener('message', (event) => {
  // Ascoltiamo un comando specifico inviato da Vue
  if (event.data && event.data.type === 'TRIGGER_WATER') {

    console.log("Iframe (from VUE): triggering water")
    
    const naviglioEntity = document.querySelector('[naviglio-water]');
    if (naviglioEntity) {
      naviglioEntity.emit('toggle-water');
    }
    
  } else if (event.data && event.data.type === 'SPAWN_NONNA') {
    
    console.log("Iframe (from VUE): spawning nonna")
    
    if (!window.lastTouchPoint || !window.arSceneEl) return;
    
    const touchPoint = window.lastTouchPoint;
    const nonnaEl = document.createElement('a-entity');
    nonnaEl.setAttribute('gltf-model', '#nonna-model');
    
    nonnaEl.setAttribute('position', {
      x: touchPoint.x + 2,
      y: touchPoint.y, 
      z: touchPoint.z + 2,
    });
    
    nonnaEl.setAttribute('rotation', '0 -30 0');
    nonnaEl.setAttribute('scale', '0.0001 0.0001 0.0001');
    nonnaEl.setAttribute('visible', 'false');
    nonnaEl.setAttribute('shadow', { receive: true, cast: true });
    nonnaEl.setAttribute('animation-mixer', 'clip: *; loop: repeat; crossFadeDuration: 0.2');
    nonnaEl.setAttribute('proximity-trigger', 'distance: 30');

    window.arSceneEl.appendChild(nonnaEl);

    nonnaEl.addEventListener('model-loaded', () => {
      nonnaEl.setAttribute('visible', 'true');
      
      nonnaEl.setAttribute('animation', {
        property: 'scale',
        to: NONNA_SCALE, 
        easing: 'easeOutElastic',
        dur: 800,
        delay: 100 
      });
    });
  }
});

AFRAME.registerComponent('notify-ready', {
      init: function () {
        this.el.sceneEl.addEventListener('loaded', () => {
          window.parent.postMessage({ type: 'AR_READY' }, '*')
        })
      }
    })