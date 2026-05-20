<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Mapbox from '~/components/MapBox.vue'
import PoiDetail from './components/PoiDetail.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import BottomSheet from './components/BottomSheet.vue'
import ArExperience from './components/ArExperience.vue'
import NonnaAROverlay from './components/NonnaAROverlay.vue'
import { useArStore } from '~/stores/arState'
import { useLocationTracker } from '~/composables/useLocationTracker'
import { useAppStore } from '~/stores/appState'

const appStore = useAppStore()

const arStore = useArStore()
const { locale, setLocale } = useI18n()

const { currentPoi, locationError, startTracking } = useLocationTracker()

const errorMessage = ref('')
const arCanvasBridge = ref<any>(null)
const showOnboarding = ref(false)

// ====================================================================================
// START AR: risolve il POI tramite GPS, poi monta ArExperience + NonnaAROverlay
// ====================================================================================
const startAr = async () => {
  arStore.startLoading()

  try {
    if (locationError.value) {
      arStore.triggerError(`Errore GPS: ${locationError.value.message}`)
      return
    }

    if (currentPoi.value) {
      console.log("POI TROVATO: ", currentPoi.value.id)
      arStore.selectedPoi = { id: currentPoi.value.id }
    } else {
      // Nessun POI nelle vicinanze: l'esperienza parte comunque,
      // selectedPoi resterà null finché GPS non risolve (o in debug tramite debug panel)
      console.warn('Nessun POI rilevato nelle vicinanze')
    }

    // Lo stato LOADING è già settato: ArExperience e NonnaAROverlay si montano
    // perché !arStore.isIdle === true. ArExperience setterà SCANNING/ACTIVE
    // tramite i propri postMessage handler.

  } catch (e) {
    arStore.triggerError('Impossibile avviare la sessione AR')
  }
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
  
  <main v-if="arStore.isIdle" class="relative w-full h-full bg-[#0f0e1a] overflow-hidden">
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
          <!-- Logo + nome -->
          <div
            class="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg"
          >
            <img
              src="/Persephone_Logo.png"
              alt="Persephone"
              class="h-7 w-auto"
            />
            <span
              class="font-['Playfair_Display'] text-[18px] font-bold text-[#424242] leading-none"
            >
              {{ $t('appName') }}
            </span>
          </div>

          <!-- Language toggle + Onboarding button -->
          <div class="flex items-center gap-2">
            <button
              class="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
              @click="toggleLang"
            >
              <!-- IT flag SVG -->
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
              <!-- EN flag SVG -->
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

          <!-- Onboarding button -->
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
        <BottomSheet
          @start-ar="startAr"
          @open-onboarding="showOnboarding = true"
        />

      <!-- ── Errori ── -->
      <div
        v-if="errorMessage"
        class="absolute top-20 left-4 right-4 z-[100] bg-white p-3 rounded-lg shadow-lg border-l-4 border-red-500"
      >
        <p class="text-red-600 text-sm font-bold">{{ errorMessage }}</p>
      </div>

      <div
        v-if="locationError"
        class="absolute top-36 left-4 right-4 z-[100] bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border-l-4 border-yellow-500 pointer-events-auto"
      >
        <p class="text-yellow-700 text-sm font-bold">
          Attenzione: GPS disattivato. L'esperienza interattiva sarà limitata.
        </p>
      </div>

      <!-- ── Overlays ── -->
      <PoiDetail />
      <OnboardingModal v-if="showOnboarding" @close="handleOnboardingClose" />
    </main>
  </template>
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
