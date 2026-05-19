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
    <iframe 
      ref="iframeRef"
      src="/ar-scene.html" 
      allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone;"
      class="absolute top-0 left-0 w-full h-full border-none z-0"
    ></iframe>

  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, nextTick, ref } from 'vue'
  import { useArStore } from '~/stores/arState'

  const emit = defineEmits(['exit'])

  const arStore = useArStore()
  const modelPlaced = ref(false)
  const waterVisible = ref(false)
  const sceneReady = ref(false)
  const iframeRef = ref(null)

  const triggerWater = () => {
    waterVisible.value = true
    iframeRef.value.contentWindow.postMessage({ type: 'TRIGGER_WATER' }, '*');
  }

  const handleIframeMessages = (event) => {
    // Sicurezza base
    if (!event.data || !event.data.type) return

    switch (event.data.type) {
      case 'AR_READY':
        console.log('Vue (from iframe): Iframe AR caricato e pronto!')
        sceneReady.value = true
        arStore.setLocalized(); //TODO: CAMBIA E AGGIUNGI LOGICA LOCALIZZAZIONE
        break;
      
      case 'MODEL_PLACED':
        console.log('Vue (from iframe): Model Placed!')
        modelPlaced.value = true
        break;
    }
  }

  // ====================================================================================
  // HANDLE END OF AR EXPERIENCE
  // ====================================================================================

  function exitAR() {
    arStore.resetSession()
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
    window.addEventListener('message', handleIframeMessages)
  })

  onUnmounted(() => {
    arStore.resetSession()
    window.removeEventListener('message', handleIframeMessages)
  })

</script>