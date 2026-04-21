<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '~/stores/appState'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'

const store = useStore()
const errorMessage = ref('')
const cameraFeed = ref<HTMLVideoElement | null>(null)

const testStartAr = async () => {
  errorMessage.value = ''
  try {
    // Richiesta permessi fotocamera
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } // Forza la fotocamera posteriore sui telefoni
    })
    
    // Passiamo il flusso video in diretta al nostro tag HTML
    if (cameraFeed.value) {
      cameraFeed.value.srcObject = stream
    }

    // Richiesta GPS
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true
      })
    })

    store.isArActive = true
  } catch (err: any) {
    errorMessage.value = "Permessi necessari per l'AR."
  }
}
</script>

<template>
  <main class="relative w-full h-screen bg-gray-200">
    
    <div class="absolute inset-0 z-0">
      <Mapbox />
    </div>

    <video 
      v-show="store.isArActive"
      ref="cameraFeed"
      autoplay 
      playsinline 
      muted 
      class="absolute inset-0 w-full h-full object-cover z-20"
    ></video>

    <div
      v-if="!store.isArActive"
      class="absolute bottom-12 left-0 right-0 z-10 flex justify-center px-6"
    >
      <button
        @click="testStartAr"
        class="w-full max-w-xs bg-blue-600 text-white py-4 rounded-2xl shadow-2xl font-bold text-lg active:scale-95 transition-transform"
      >
        🚀 Inizia Naviglio AR
      </button>
    </div>

    <ClientOnly>
      <ArOverlay v-if="store.isArActive" />
    </ClientOnly>

    <div
      v-if="errorMessage"
      class="absolute top-4 left-4 right-4 z-[100] bg-white p-3 rounded-lg shadow-lg border-l-4 border-red-500"
    >
      <p class="text-red-600 text-sm font-bold">{{ errorMessage }}</p>
    </div>

    <PoiDetail />
  </main>
</template>

<style>
/* Rimuove margini bianchi fastidiosi */
html,
body,
#__nuxt {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
