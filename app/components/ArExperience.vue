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

  const emit = defineEmits(['exit'])

  const modelPlaced = ref(false)
  const waterVisible = ref(false)
  const sceneReady = ref(false)
  const iframeRef = ref(null)

  const triggerWater = () => {
    waterVisible.value = true
    iframeRef.value.contentWindow.postMessage({ type: 'TRIGGER_WATER' }, '*');
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

    window.addEventListener('xrloaded', async () => {
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