<script setup lang="ts">
import { useAppStore } from '~/stores/appState'

const store = useStore()

const exitAR = () => {
  store.isArActive = false
}
</script>

<template>
  <div
    id="ar-ui-root"
    v-if="store.isArActive"
    class="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-transparent pointer-events-auto"
  >
    <div class="w-full flex justify-end">
      <button
        @click="exitAR"
        class="pointer-events-auto bg-[#424242]/80 text-white px-5 py-2.5 rounded-full font-['Inter'] text-[14px] font-medium backdrop-blur-sm transition-transform active:scale-95"
      >
        Exit AR
      </button>
    </div>

    <div class="relative flex items-center justify-center">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        class="opacity-60 drop-shadow-md"
      >
        <line
          x1="20"
          y1="10"
          x2="20"
          y2="30"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
        />
        <line
          x1="10"
          y1="20"
          x2="30"
          y2="20"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <div
      class="pointer-events-auto bg-white/90 text-[#424242] px-6 py-4 rounded-[16px] backdrop-blur-md text-center max-w-[320px] mb-8 shadow-lg font-['Inter'] text-[14px]"
    >
      <div
        v-if="store.arError"
        class="flex items-center gap-3 text-red-600 font-bold"
      >
        <span class="text-[18px]">❌</span>
        <p>{{ store.arError }}</p>
      </div>

      <div
        v-else-if="store.arState === 'locating'"
        class="flex items-center gap-3 animate-pulse"
      >
        <span class="text-[18px]">📍</span>
        <p>Scanning surroundings... Point your camera at the buildings.</p>
      </div>

      <div
        v-else-if="store.arState === 'ready'"
        class="flex items-center gap-3 text-[#2071c1] font-bold"
      >
        <span class="text-[18px]">✅</span>
        <p>Location found! Naviglio anchored.</p>
      </div>

      <div v-else class="flex items-center gap-3">
        <span class="text-[18px]">📱</span>
        <p>Move your phone slowly to track the area.</p>
      </div>
    </div>


    //TODO:-Scuro, only for testing, remove later
    <div
      class="pointer-events-auto fixed bottom-32 left-4 flex flex-col gap-2 bg-black/80 p-4 rounded-xl z-[100]"
    >
      <p class="text-white text-xs font-bold mb-1">DEV MODE</p>
      <button
        @click="((store.arState = 'locating'), (store.arError = ''))"
        class="bg-yellow-500 text-white text-xs px-3 py-1 rounded hover:bg-yellow-400"
      >
        Set: Locating
      </button>
      <button
        @click="((store.arState = 'ready'), (store.arError = ''))"
        class="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-400"
      >
        Set: Ready
      </button>
      <button
        @click="store.arError = 'GPS Signal Lost!'"
        class="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-400"
      >
        Set: Error
      </button>
    </div>
  </div>
</template>
