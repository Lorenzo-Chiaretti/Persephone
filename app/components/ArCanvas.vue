<template>
  <div v-show="active" class="fixed inset-0 z-50 bg-black">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>

    <div id="ar-ui-overlay" class="absolute inset-0 pointer-events-none">
       <slot /> </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ active: boolean }>()

// Marco (Dev 2) la importerà quando dovrà fare: 
// navigator.xr.requestSession('immersive-ar', geospatialConfig)
const geospatialConfig = {
  requiredFeatures: ['local-floor'],
  optionalFeatures: [
    'camera-access', 
    'anchors', 
    'geospatial-api', 
    'dom-overlay'
  ],
  domOverlay: { root: null } // Verrà popolato da Marco all'avvio
}

// Esponi la config a Marco
defineExpose({ geospatialConfig })
</script>