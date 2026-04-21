<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '~/stores/appState'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'
import ArCanvas from './components/ArCanvas.vue'
import { useArStore } from '~/stores/arState'

const arStore = useArStore()
const errorMessage = ref('')
const arCanvasBridge = ref<any>(null)

const startArSessionButton = async () => {
  await arCanvasBridge.value?.startArSession()
}
</script>

<template>
  <main class="relative w-full h-full bg-gray-200">
    <div class="absolute inset-0 z-0">
      <Mapbox />
    </div>

    <ClientOnly>
      <ArCanvas :active="arStore.isActive" ref="arCanvasBridge" />
    </ClientOnly>

    <div
      v-if="!arStore.isActive"
      class="absolute bottom-12 left-0 right-0 z-10 flex justify-center px-6"
    >
      <button
        @click="startArSessionButton"
        class="w-full max-w-xs bg-blue-600 text-white py-4 rounded-2xl shadow-2xl font-bold text-lg active:scale-95 transition-transform"
      >
        🚀 Inizia Naviglio AR
      </button>
    </div>
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
