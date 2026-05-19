let modelPlaced = false
let waterVisible = false

  // ====================================================================================
  // PLACE NAVIGLIO MODEL
  // ====================================================================================

    AFRAME.registerComponent('tap-place', {
  init() {
    const ground = document.getElementById('ground')

    ground.addEventListener('click', (event) => {
      // Usa this.modelPlaced o window.modelPlaced a seconda del tuo scope
      if (window.modelPlaced) return
      window.modelPlaced = true

      const touchPoint = event.detail.intersection.point

      // ==========================================
      // 1. SPAWN DEL NAVIGLIO
      // ==========================================
      const naviglioEl = document.createElement('a-entity')
      naviglioEl.setAttribute('position', {
        x: touchPoint.x,
        y: touchPoint.y - 2, // Sotto terra
        z: touchPoint.z,
      })
      naviglioEl.setAttribute('rotation', '0 60 0')
      naviglioEl.setAttribute('scale', '0.0001 0.0001 0.0001')
      naviglioEl.setAttribute('visible', 'false')
      naviglioEl.setAttribute('gltf-model', '#naviglioModel')
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
          to: '0.3 0.3 0.3',
          easing: 'easeOutElastic',
          dur: 800,
        })
      })

      // ==========================================
      // 2. SPAWN DELLA VECCHIETTA
      // ==========================================
      const nonnaEl = document.createElement('a-entity')
      // Assicurati di avere <a-asset-item id="nonna-model" ...> nell'HTML
      nonnaEl.setAttribute('gltf-model', '#nonna-model') 
      
      // La posizioniamo 1 metro a destra e 1 metro più vicina a noi rispetto al centro del naviglio
      nonnaEl.setAttribute('position', {
        x: touchPoint.x + 2,
        y: touchPoint.y, // Lei sta SUL terreno, niente offset negativo!
        z: touchPoint.z + 2,
      })
      
      // La facciamo guardare verso di noi (o incliniamo in base a come è esportato il modello)
      nonnaEl.setAttribute('rotation', '0 -30 0') 
      nonnaEl.setAttribute('scale', '0.0001 0.0001 0.0001')
      nonnaEl.setAttribute('visible', 'false')
      nonnaEl.setAttribute('shadow', { receive: true, cast: true }) 
      nonnaEl.setAttribute('animation-mixer', 'clip: *; loop: repeat; crossFadeDuration: 0.2')

      this.el.sceneEl.appendChild(nonnaEl)

      nonnaEl.addEventListener('model-loaded', () => {
        nonnaEl.setAttribute('visible', 'true')
        
        // Animazione di comparsa con leggero ritardo per effetto "Wow"
        nonnaEl.setAttribute('animation', {
          property: 'scale',
          to: '0.07 0.07 0.07', // Adatta questo valore in base a quanto è grande il tuo .glb!
          easing: 'easeOutElastic',
          dur: 800,
          delay: 300 // Appare 300ms dopo il naviglio
        })

        // Mandiamo la notifica a Vue quando TUTTA la scena è caricata
        window.parent.postMessage({ type: 'MODEL_PLACED' }, '*')
      })

    })
  },
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

window.addEventListener('message', (event) => {
  // Ascoltiamo un comando specifico inviato da Vue
  if (event.data && event.data.type === 'TRIGGER_WATER') {

    console.log("Iframe (from VUE): triggering water")
    
    const naviglioEntity = document.querySelector('[naviglio-water]');
    if (naviglioEntity) {
      naviglioEntity.emit('toggle-water');
    }
    
  }
});

AFRAME.registerComponent('notify-ready', {
      init: function () {
        this.el.sceneEl.addEventListener('loaded', () => {
          window.parent.postMessage({ type: 'AR_READY' }, '*')
        })
      }
    })



