<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import PoiSelectModal from './components/PoiSelectModal.vue'
import BottomSheet from './components/BottomSheet.vue'
import ArExperience from './components/ArExperience.vue'
import NonnaAROverlay from './components/NonnaAROverlay.vue'
import { useArStore } from '~/stores/arState'
import { useLocationTracker } from '~/composables/useLocationTracker'
import { useAppStore } from '~/stores/appState'
import { useAiNonna } from '~/utils/aiNonna'

const appStore = useAppStore()
const arStore = useArStore()
const { unlockAudio } = useAiNonna()
const { locale, setLocale } = useI18n()

const { currentPoi, locationError, startTracking, stopTracking } = useLocationTracker()

const errorMessage = ref('')
const dismissedGpsWarning = ref(false)
const arCanvasBridge = ref<any>(null)
const showOnboarding = ref(false)
const showPoiSelect = ref(false)

const showHistory = ref(false)

const handleOpenHistory = () => {
  showHistory.value = true
}

// ====================================================================================
// START AR: risolve il POI tramite GPS, poi monta ArExperience + NonnaAROverlay
// Se l'utente è lontano da tutti i POI, mostra la modale di selezione manuale.
// ====================================================================================
const startAr = async () => {
  // Sblocca preventivamente l'audio su iOS
  unlockAudio()

    // Richiedi i permessi del microfono in anticipo per evitare interruzioni dell'esperienza in seguito
  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      console.log('🎙️ Permesso microfono acquisito preventivamente.')
    } catch (e) {
      console.warn("Permesso microfono negato o non disponibile:", e)
    }
  }

  try {
    if (locationError.value) {
      arStore.triggerError(`Errore GPS: ${locationError.value.message}`)
      return
    }
    
    if (currentPoi.value) {
      console.log('POI TROVATO: ', currentPoi.value.id)
      arStore.selectedPoi = { id: currentPoi.value.id }
      arStore.startLoading()
    } else {
      showPoiSelect.value = true
    }
  } catch (e) {
    arStore.triggerError('Impossibile avviare la sessione AR')
  }
}

// Chiamata quando l'utente seleziona un POI dalla modale.
// stopTracking evita che il GPS sovrascriva il POI scelto manualmente.
const handlePoiSelected = (poiId: string, isIndoor: boolean) => {
  showPoiSelect.value = false
  stopTracking()
  arStore.selectedPoi = { id: poiId, isIndoor }
  arStore.startLoading()
}

const toggleLang = () => {
  setLocale(locale.value === 'it' ? 'en' : 'it')
}

const handleOnboardingClose = () => {
  showOnboarding.value = false
  // L'utente ha (sperabilmente) accettato i permessi. Facciamo partire il GPS globale!
  startTracking()
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
  <!-- AR EXPERIENCE -->
  <ClientOnly>
    <template v-if="!arStore.isIdle">
      <ArExperience />
      <NonnaAROverlay />
    </template>
  </ClientOnly>

  <main
    v-if="arStore.isIdle"
    class="relative w-full h-full bg-[#0f0e1a] overflow-hidden"
  >
    <!-- ── Mappa a tutto schermo ── -->
    <div class="absolute inset-0 z-0">
      <Mapbox />
    </div>

    <!-- ── Header sovrapposto ── -->
    <div
      class="absolute top-0 left-0 right-0 z-10 pointer-events-none"
      style="padding-top: env(safe-area-inset-top)"
    >
      <div
        class="mx-4 mt-3 flex items-center justify-between pointer-events-auto"
      >
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

        <div class="flex items-center gap-2">
          
          <button
            class="bg-white/90 backdrop-blur-md rounded-2xl w-10 h-10 shadow-lg flex items-center justify-center cursor-pointer hover:bg-white text-[#2071c1] transition-colors"
            @click="handleOpenHistory"
            aria-label="Storia"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </button>

          <button
            class="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
            @click="toggleLang"
          >
            <svg
              v-if="locale === 'it'"
              width="20"
              height="14"
              viewBox="0 0 20 14"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-sm"
            >
              <rect width="20" height="14" fill="#CE2B37" />
              <rect width="6.67" height="14" fill="#009246" />
              <rect x="6.67" width="6.67" height="14" fill="#FFFFFF" />
            </svg>
            <svg
              v-else
              width="20"
              height="14"
              viewBox="0 0 20 14"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-sm"
            >
              <rect width="20" height="14" fill="#012169" />
              <path
                d="M0 0 L20 14 M20 0 L0 14"
                stroke="white"
                stroke-width="2.8"
              />
              <path
                d="M0 0 L20 14 M20 0 L0 14"
                stroke="#C8102E"
                stroke-width="1.6"
              />
              <path d="M10 0 V14 M0 7 H20" stroke="white" stroke-width="4" />
              <path
                d="M10 0 V14 M0 7 H20"
                stroke="#C8102E"
                stroke-width="2.4"
              />
            </svg>
            <span
              class="text-[13px] font-['Inter'] font-semibold text-[#424242]"
            >
              {{ locale === 'it' ? 'IT' : 'EN' }}
            </span>
          </button>

          <button
            class="bg-white/90 backdrop-blur-md rounded-2xl w-10 h-10 shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
            @click="showOnboarding = true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#424242"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="#424242" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Bottom Sheet ── -->
    <div v-if="!arStore.isActive">
      <BottomSheet
        @start-ar="startAr"
        @open-onboarding="showOnboarding = true"
      />
    </div>

    <!-- ── Errori ── -->
    <div
      v-if="errorMessage"
      class="absolute top-20 left-4 right-4 z-[100] bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-red-100 pointer-events-auto flex items-center gap-3"
    >
      <div class="flex-shrink-0 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p class="text-[#424242] text-[13px] font-['Inter'] font-semibold leading-snug flex-1">{{ errorMessage }}</p>
    </div>

    <div
      v-if="locationError && !dismissedGpsWarning"
      class="absolute top-36 left-4 right-4 z-[100] bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-amber-100 pointer-events-auto flex justify-between items-center gap-3"
    >
      <div class="flex items-center gap-3 flex-1">
        <div class="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p class="text-[#424242] text-[13px] font-['Inter'] font-semibold leading-snug">
          {{ $t('gpsWarning') }}
        </p>
      </div>
      <button
        @click="dismissedGpsWarning = true"
        class="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 cursor-pointer transition-all hover:bg-slate-200 hover:text-slate-700 active:scale-95"
        :aria-label="$t('close')"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- ── Overlays ── -->
    <PoiDetail />
    <OnboardingModal v-if="showOnboarding" @close="handleOnboardingClose" />
    <PoiSelectModal
      v-if="showPoiSelect"
      @select-poi="handlePoiSelected"
      @close="showPoiSelect = false"
    />
    <HistoryModal v-if="showHistory" @close="showHistory = false" />
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
