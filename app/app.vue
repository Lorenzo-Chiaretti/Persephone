<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAppStore } from '~/stores/appState'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'
import ArCanvas from './components/ArCanvas.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import ChiSiamo from './components/ChiSiamo.vue'
import { useArStore } from '~/stores/arState'

const arStore = useArStore()
const errorMessage = ref('')
const arCanvasBridge = ref<any>(null)
const showOnboarding = ref(false)
const showChiSiamo = ref(false)
const bannerRef = ref<HTMLElement | null>(null)
const bannerHeight = ref(0)

const startArSessionButton = async () => {
  await arCanvasBridge.value?.startArSession()
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const isDebugMode = urlParams.has('debug')

  if (process.dev || isDebugMode) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/eruda'
    document.body.appendChild(script)
    script.onload = () => {
      // @ts-ignore
      eruda.init()
    }
  }

  await nextTick()
  if (bannerRef.value) {
    bannerHeight.value = bannerRef.value.offsetHeight
  }

  showOnboarding.value = true
})

function closeOnboarding() {
  showOnboarding.value = false
}
</script>

<template>
  <main class="relative w-full h-full bg-[#f7f9fc]">
    <!-- ── Mappa ── -->
    <div
      class="absolute inset-0 z-0 px-3 sm:px-4 pb-3 sm:pb-4"
      :style="{ paddingTop: `${bannerHeight + 12}px` }"
    >
      <div class="w-full h-full rounded-[24px] overflow-hidden shadow-2xl">
        <Mapbox />
      </div>
    </div>

    <!-- ── Banner header ── -->
    <div
      ref="bannerRef"
      class="absolute top-0 left-0 right-0 z-10 bg-white shadow-md px-5 pt-safe-top pb-4"
      style="padding-top: max(env(safe-area-inset-top), 16px)"
    >
      <!-- Logo + titolo centrati -->
      <div class="flex flex-col items-center mb-3">
        <div class="flex items-center gap-3">
          <img
            src="/Persephone_Logo.png"
            alt="Persephone"
            class="h-10 w-auto"
          />
          <h1
            class="font-['Playfair_Display'] text-[28px] font-bold text-[#424242] leading-none"
          >
            Persephone
          </h1>
        </div>
      </div>

      <!-- Bottoni affiancati sotto -->
      <div class="flex gap-2">
        <button
          class="flex-1 flex items-center justify-center gap-1.5 bg-[#f7f9fc] hover:bg-[#eef1f5] active:bg-[#e5eaf0] rounded-xl px-3 py-2.5 font-['Inter'] text-[13px] font-medium text-[#424242]/70 transition-colors cursor-pointer border border-[#424242]/8"
          @click="showOnboarding = true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          Come funziona
        </button>

        <button
          class="flex-1 flex items-center justify-center gap-1.5 bg-[#f7f9fc] hover:bg-[#eef1f5] active:bg-[#e5eaf0] rounded-xl px-3 py-2.5 font-['Inter'] text-[13px] font-medium text-[#424242]/70 transition-colors cursor-pointer border border-[#424242]/8"
          @click="showChiSiamo = true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Chi siamo
        </button>
      </div>
    </div>

    <!-- ── AR Canvas ── -->
    <ClientOnly>
      <ArCanvas :active="arStore.isActive" ref="arCanvasBridge" />
    </ClientOnly>

    <!-- ── Bottone AR ── -->
    <div
      v-if="!arStore.isActive"
      class="absolute bottom-0 left-0 right-0 z-10 flex justify-center px-5 pb-safe-bottom"
      style="padding-bottom: max(env(safe-area-inset-bottom), 24px)"
    >
      <button
        @click="startArSessionButton"
        class="flex items-center justify-center gap-2 w-full bg-[#2071c1] hover:bg-[#1a5b9c] text-white py-4 rounded-2xl shadow-2xl font-['Inter'] font-bold text-[15px] active:scale-95 transition-all cursor-pointer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Inizia Naviglio AR
      </button>
    </div>

    <!-- ── Errori ── -->
    <div
      v-if="errorMessage"
      class="absolute top-4 left-4 right-4 z-[100] bg-white p-3 rounded-lg shadow-lg border-l-4 border-red-500"
    >
      <p class="text-red-600 text-sm font-bold">{{ errorMessage }}</p>
    </div>

    <!-- ── Componenti overlay ── -->
    <PoiDetail />
    <OnboardingModal v-if="showOnboarding" @close="closeOnboarding" />
    <ChiSiamo v-if="showChiSiamo" @close="showChiSiamo = false" />
  </main>
</template>

<style>
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
