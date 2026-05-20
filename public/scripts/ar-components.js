let modelPlaced = false
let waterVisible = false

  // ====================================================================================
  // PLACE NAVIGLIO MODEL
  // ====================================================================================

    AFRAME.registerComponent('tap-place', {
      init() {
        const ground = document.getElementById('ground')

        ground.addEventListener('click', (event) => {

          if (modelPlaced) return
          modelPlaced = true

          // Create new entity for the new object
          const newElement = document.createElement('a-entity')

          // The raycaster gives a location of the touch in the scene
          const touchPoint = event.detail.intersection.point
          newElement.setAttribute('position', touchPoint)

          newElement.setAttribute('rotation', '0 60 0')
          newElement.setAttribute('scale', '0.0001 0.0001 0.0001')
          newElement.setAttribute('visible', 'false')
          newElement.setAttribute('gltf-model', '#poiModel')
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
              const child = node
              if (child.isMesh) {
                console.log("MESH NAME: ", child.material?.name)
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

            // Send notification to Vue
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

          // Search for mesh "Water"
          mesh.traverse((child) => {
            if (child.isMesh && child.name === 'Water') {
              
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



