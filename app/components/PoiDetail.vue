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
            :src="showModern ? poi.modernImgUrl : poi.historicalImgUrl"
            :alt="poi.title"
            class="h-full w-full object-cover transition-opacity duration-[400ms] ease-in-out"
          />

          <div
            class="absolute bottom-3 left-3 rounded-full bg-[#424242]/70 px-2.5 py-[3px] font-['Inter'] text-[11px] text-white"
          >
            {{ showModern ? 'Today' : poi.year }}
          </div>

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
                Historical
              </div>
              <div
                class="relative z-10 w-[72px] py-1 text-center font-['Inter'] text-[11px] font-medium transition-colors duration-300"
                :class="showModern ? 'text-[#424242]' : 'text-white'"
              >
                Today
              </div>
            </div>
          </button>
        </div>

        <div class="px-6 pb-7 pt-5">
          <p
            class="mb-1.5 font-['Inter'] text-[11px] uppercase tracking-[0.1em] text-[#2071c1]"
          >
            {{ poi.year }}
          </p>

          <h2
            class="mb-3 font-['Playfair_Display'] text-[22px] font-bold leading-[1.3] text-[#424242]"
          >
            {{ poi.title }}
          </h2>

          <p
            class="mb-5 font-['Inter'] text-[14px] leading-[1.7] text-[#424242]/80"
          >
            {{ poi.description }}
          </p>

          <button
            class="w-full cursor-pointer rounded-[10px] border-none bg-[#2071c1] p-3 font-['Inter'] text-[14px] font-medium text-white transition-colors hover:bg-[#1a5b9c]"
            @click="navigate"
          >
            Take me there
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '~/stores/appState'

const store = useAppStore()
const showModern = ref(false)
const poi = computed(() => store.selectedPoi!)

function close() {
  store.isModelOpen = false
  showModern.value = false
}

function navigate() {
  const lat = poi.value.lat
  const lng = poi.value.lng
  // Standard Google Maps URL for exact coordinates
  const url = `https://www.google.com/maps?q=${lat},${lng}`

  if (!window.open(url, '_blank')) {
    alert(
      `Could not open Maps automatically.\nDestination: ${poi.value.title} (${lat}, ${lng})`
    )
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>