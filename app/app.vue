<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'
import ArCanvas from './components/ArCanvas.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import BottomSheet from './components/BottomSheet.vue'
import { useArStore } from '~/stores/arState'

const arStore = useArStore()
const { locale, setLocale } = useI18n()

const errorMessage = ref('')
const arCanvasBridge = ref<any>(null)
const showOnboarding = ref(false)

const startArSessionButton = async () => {
  await arCanvasBridge.value?.startArSession()
}

const toggleLang = () => {
  setLocale(locale.value === 'it' ? 'en' : 'it')
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const isDebugMode = urlParams.has('debug')
  if (process.dev || isDebugMode) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/eruda'
    document.body.appendChild(script)
    script.onload = () => {
      ;(window as any).eruda.init()
    }
  }
  showOnboarding.value = true
})
</script>

<template>
  <main class="relative w-full h-full bg-[#0f0e1a] overflow-hidden">
    <!-- ── Mappa a tutto schermo ── -->
    <div class="absolute inset-0 z-0">
      <Mapbox v-if="!arStore.isScanning && !arStore.isActive" />
    </div>

    <!-- ── Header sovrapposto ── -->
    <div
      class="absolute top-0 left-0 right-0 z-10 pointer-events-none"
      style="padding-top: env(safe-area-inset-top)"
    >
      <div
        class="mx-4 mt-3 flex items-center justify-between pointer-events-auto"
      >
        <!-- Logo + nome -->
        <div
          class="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg"
        >
          <img src="/Persephone_Logo.png" alt="Persephone" class="h-7 w-auto" />
          <span
            class="font-['Playfair_Display'] text-[18px] font-bold text-[#424242] leading-none"
          >
            {{ $t('appName') }}
          </span>
        </div>

        <!-- Language toggle -->
        <button
          class="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
          @click="toggleLang"
        >
          <span class="text-[13px] font-['Inter'] font-semibold text-[#424242]">
            {{ locale === 'it' ? '🇮🇹 IT' : '🇬🇧 EN' }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── AR Canvas ── -->
    <ClientOnly>
      <ArCanvas :active="arStore.isActive" ref="arCanvasBridge" />
    </ClientOnly>

    <!-- ── Bottom Sheet ── -->
    <BottomSheet
      @start-ar="startArSessionButton"
      @open-onboarding="showOnboarding = true"
    />

    <!-- ── Errori ── -->
    <div
      v-if="errorMessage"
      class="absolute top-20 left-4 right-4 z-[100] bg-white p-3 rounded-lg shadow-lg border-l-4 border-red-500"
    >
      <p class="text-red-600 text-sm font-bold">{{ errorMessage }}</p>
    </div>

    <!-- ── Overlays ── -->
    <PoiDetail />
    <OnboardingModal v-if="showOnboarding" @close="showOnboarding = false" />
  </main>
</template>

<style>
html,
body,
#__nuxt {
  background: transparent !important;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
