<template>
  <div class="fixed inset-0 z-50">

    <!-- "TAP TO PLACE MODEL" HINT -->
    <div
      v-if="arStore.sceneReady && !arStore.modelPlaced"
      class="absolute bottom-28 left-4 right-4 z-20 flex justify-center pointer-events-none animate-bounce"
    >
      <span class="bg-black/60 text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg border border-white/10 text-center">
        {{ $t('arPlaceHint') }}
      </span>
    </div>

    <!-- A-Frame Scene -->
    <iframe 
      ref="iframeRef"
      :src="iframeSrc" 
      allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone;"
      class="absolute top-0 left-0 w-full h-full border-none z-0"
    ></iframe>

  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
  import { useArStore } from '~/stores/arState'

  const arStore = useArStore()
  const iframeRef = ref<HTMLIFrameElement | null>(null)

  // Pass POI id as query string
  const iframeSrc = computed(() => {
    const poiId = arStore.selectedPoi?.id
    if (!poiId) return '/ar-scene.html'
    return `/ar-scene.html?poi=${poiId}`
  })

  // Watch for water trigger from overlay and forward it to A-Frame scene
  watch(
    () => arStore.waterVisible,
    (visible) => {
      if (visible) {
        iframeRef.value?.contentWindow?.postMessage({ type: 'TRIGGER_WATER' }, '*')
      }
    }
  )

  const handleIframeMessages = (event: MessageEvent) => {
    if (!event.data || !event.data.type) return

    switch (event.data.type) {
      case 'AR_READY':
        console.log('Vue (from iframe): Iframe AR caricato e pronto!')
        arStore.sceneReady = true
        arStore.setLocalized() // TODO: CAMBIA E AGGIUNGI LOGICA LOCALIZZAZIONE
        break
      
      case 'MODEL_PLACED':
        console.log('Vue (from iframe): Model Placed!')
        arStore.modelPlaced = true
        break
        
      case 'USER_NEAR_MODEL': // TODO (feature): inviare questo messaggio da ar-components.js
        console.log('Vue (from iframe): User is near the model!')
        arStore.isNearModel = true
        break

      case 'USER_LEFT_MODEL':
        console.log('Vue (from iframe): User left the model!')
        arStore.isNearModel = false
        break
    }
  }

  // ====================================================================================
  // MOUNTING AND UNMOUNTING
  // ====================================================================================

  onMounted(() => {
    window.addEventListener('message', handleIframeMessages)
  })

  onUnmounted(() => {
    // Forced iframe cleanup
    if (iframeRef.value) {
      iframeRef.value.src = 'about:blank'
    }
    arStore.resetSession()
    window.removeEventListener('message', handleIframeMessages)
  })
</script>