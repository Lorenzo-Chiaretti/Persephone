<template>
  <ClientOnly>
    <div v-if="xrReady">
      <a-scene xrconfig xrweb>
        <a-camera position="0 0 0" look-controls="enabled: false" />
        <a-box position="0 0 -2" color="#4CC3D9" />
      </a-scene>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'

  const xrReady = ref(false)

  if (import.meta.client) {
    if (!window.AFRAME) {
      useHead({
        script: [
          {
            src: './external/scripts/8frame-1.5.0.min.js',
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
// Accesso a XR8 dopo che l'engine è pronto
onMounted(() => {
  console.log('component mounted')

  window.addEventListener('xrloaded', () => {
    console.log('xrloaded fired!')
    xrReady.value = true
  })

  // Verifica se XR8 esiste già su window dopo un po'
  setTimeout(() => {
    // @ts-ignore
    console.log('XR8 on window:', window.XR8)
    // @ts-ignore
    console.log('xr.js loaded?', typeof window.XR8 !== 'undefined')
  }, 3000)
})

onUnmounted(() => {
  // Se navighi via dalla pagina AR, stoppa l'engine
  // per liberare la fotocamera
  if (typeof XR8 !== 'undefined') {
    XR8.stop()
  }
})

</script>