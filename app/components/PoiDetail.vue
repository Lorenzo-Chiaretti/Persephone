<template>
  <Transition name="slide-up">
    <div
      v-if="store.isModelOpen && store.selectedPoi"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      @click.self="close"
    >
      <div
        class="absolute inset-0 bg-[#424242]/45 cursor-pointer"
        @click="close"
      />

      <div
        class="relative z-10 w-full max-w-[480px] overflow-hidden bg-white rounded-t-[20px] sm:rounded-[20px]"
      >
        <button
          class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#d0d7dd]/85 cursor-pointer transition-colors hover:bg-[#b0b8c0]"
          aria-label="Close"
          @click="close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="#424242"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="relative h-[220px] w-full overflow-hidden">
          <img
            :src="
              showModern
                ? store.selectedPoi.modernImgUrl
                : store.selectedPoi.historicalImgUrl
            "
            :alt="poiTitle"
            class="h-full w-full object-cover transition-opacity duration-[400ms] ease-in-out"
          />

          <button
            class="absolute bottom-3 left-3 flex cursor-pointer items-center gap-1 rounded-full bg-[#424242]/70 px-2.5 py-[3px] font-['Inter'] text-[11px] text-white transition-colors hover:bg-[#424242]"
            @click="compareOpen = true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 4.5V1h3.5M7.5 1H11v3.5M11 7.5V11H7.5M4.5 11H1V7.5"
                stroke="white"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ $t('compare') }}
          </button>

          <button
            type="button"
            class="absolute bottom-3 right-3 flex cursor-pointer items-center rounded-full bg-[#424242]/60 p-1 outline-none"
            @click="showModern = !showModern"
          >
            <div class="relative flex items-center">
              <div
                class="absolute bottom-0 left-0 top-0 w-1/2 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="showModern ? 'translate-x-full' : 'translate-x-0'"
              ></div>
              <div
                class="relative z-10 w-[72px] py-1 text-center font-['Inter'] text-[11px] font-medium transition-colors duration-300"
                :class="!showModern ? 'text-[#424242]' : 'text-white'"
              >
                {{ $t('historical') }}
              </div>
              <div
                class="relative z-10 w-[72px] py-1 text-center font-['Inter'] text-[11px] font-medium transition-colors duration-300"
                :class="showModern ? 'text-[#424242]' : 'text-white'"
              >
                {{ $t('today') }}
              </div>
            </div>
          </button>
        </div>

        <div class="px-6 pb-7 pt-5">
          <p
            class="mb-1.5 font-['Inter'] text-[11px] uppercase tracking-[0.1em] text-[#2071c1]"
          >
            {{ poiYear }}
          </p>
          <h2
            class="mb-3 font-['Playfair_Display'] text-[22px] font-bold leading-[1.3] text-[#424242]"
          >
            {{ poiTitle }}
          </h2>
          <p
            class="mb-5 font-['Inter'] text-[14px] leading-[1.7] text-[#424242]/80"
          >
            {{ poiDescription }}
          </p>

          <div class="flex gap-3">
            <button
              class="flex-1 cursor-pointer rounded-[10px] border-none bg-[#2071c1] p-3 font-['Inter'] text-[14px] font-medium text-white transition-colors hover:bg-[#1a5b9c] flex items-center justify-center gap-2"
              @click="navigate"
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
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              {{ $t('takeMeThere') }}
            </button>
            <button
              class="flex-1 cursor-pointer rounded-[10px] border-none bg-[#424242] p-3 font-['Inter'] text-[14px] font-medium text-white transition-colors hover:bg-[#2a2a2a] flex items-center justify-center gap-2"
              @click="gameOpen = true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {{ $t('letsPlay') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <template v-if="store.selectedPoi">
    <ImageCompareSlider
      v-if="compareOpen"
      :open="compareOpen"
      :title="poiTitle"
      :historical-src="store.selectedPoi.historicalImgUrl"
      :modern-src="store.selectedPoi.modernImgUrl"
      @close="compareOpen = false"
    />
    <PhotoGame
      v-if="gameOpen"
      :poi="store.selectedPoi"
      @close="gameOpen = false"
    />

    <Transition name="fade">
      <div
        v-if="showMapAlert"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#424242]/45"
        @click.self="showMapAlert = false"
      >
        <div class="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl">
          <h3 class="mb-2 font-['Playfair_Display'] text-[20px] font-bold text-[#424242]">
            {{ $t('mapAlertTitle') }}
          </h3>
          <p class="mb-6 font-['Inter'] text-[14px] leading-relaxed text-[#424242]/80">
            {{ $t('mapAlertDesc') }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="rounded-[10px] bg-[#f0f0f0] px-5 py-2.5 font-['Inter'] text-[14px] font-medium text-[#424242] transition-colors hover:bg-[#e0e0e0] cursor-pointer"
              @click="showMapAlert = false"
            >
              {{ $t('mapAlertCancel') }}
            </button>
            <button
              class="rounded-[10px] bg-[#2071c1] px-5 py-2.5 font-['Inter'] text-[14px] font-medium text-white transition-colors hover:bg-[#1a5b9c] cursor-pointer"
              @click="confirmNavigate"
            >
              {{ $t('mapAlertOk') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '~/stores/appState'
import ImageCompareSlider from '~/components/ImageCompareSlider.vue'
import PhotoGame from '~/components/PhotoGame.vue'

const { locale } = useI18n()
const store = useAppStore()
const showModern = ref(false)
const compareOpen = ref(false)
const gameOpen = ref(false)
const showMapAlert = ref(false)

const poiTitle = computed(() => {
  if (!store.selectedPoi) return ''
  // 🛠️ FIX: Casting esplicito a string per evitare l'errore TS2322
  const val =
    store.selectedPoi[`title_${locale.value}` as keyof typeof store.selectedPoi]
  return String(val || store.selectedPoi.title || '')
})

const poiDescription = computed(() => {
  if (!store.selectedPoi) return ''
  const val =
    store.selectedPoi[
      `description_${locale.value}` as keyof typeof store.selectedPoi
    ]
  return String(val || store.selectedPoi.description || '')
})

const poiYear = computed(() => {
  if (!store.selectedPoi) return ''
  const val =
    store.selectedPoi[`year_${locale.value}` as keyof typeof store.selectedPoi]
  return String(val || store.selectedPoi.year || '')
})

function close() {
  store.isModelOpen = false
  showModern.value = false
  compareOpen.value = false
  gameOpen.value = false
  showMapAlert.value = false
}

function navigate() {
  if (!store.selectedPoi) return
  showMapAlert.value = true
}

function confirmNavigate() {
  if (!store.selectedPoi) return
  const { lat, lng } = store.selectedPoi
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  
  showMapAlert.value = false
  
  window.open(url, '_blank')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showMapAlert.value) showMapAlert.value = false
    else if (gameOpen.value) gameOpen.value = false
    else if (compareOpen.value) compareOpen.value = false
    else close()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
