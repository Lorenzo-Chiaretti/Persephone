<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        class="absolute inset-0 bg-[#424242]/45 cursor-pointer"
        @click="emit('close')"
      />

      <Transition name="slide-up" appear>
        <div
          class="relative z-10 w-full max-w-[480px] bg-white rounded-t-[20px] sm:rounded-[20px] overflow-hidden"
        >
          <!-- Close button -->
          <button
            class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#d0d7dd]/85 cursor-pointer transition-colors hover:bg-[#b0b8c0]"
            @click="emit('close')"
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

          <div class="px-6 pt-8 pb-7">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-2">
              <div class="flex-shrink-0 w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2071c1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h2 class="font-['Playfair_Display'] text-[20px] font-bold text-[#2071c1] leading-tight">
                {{ $t('poiSelectTitle') }}
              </h2>
            </div>
            <p class="font-['Inter'] text-[13px] leading-[1.6] text-[#424242]/65 mb-6">
              {{ $t('poiSelectDesc') }}
            </p>

            <!-- POI buttons -->
            <div class="flex flex-col gap-2.5 mb-6">
              <button
                v-for="poi in pois"
                :key="poi.id"
                class="flex items-center gap-4 bg-[#f7f9fc] rounded-[14px] px-4 py-3.5 cursor-pointer transition-colors text-left"
                :class="selectedPoiId === poi.id
                  ? 'ring-2 ring-[#2071c1] bg-[#2071c1]/5'
                  : 'hover:bg-[#eef2f8]'"
                @click="selectedPoiId = poi.id"
              >
                <div
                  class="flex-shrink-0 w-9 h-9 rounded-[9px] flex items-center justify-center transition-colors"
                  :class="selectedPoiId === poi.id ? 'bg-[#2071c1]' : 'bg-[#2071c1]/10'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    :stroke="selectedPoiId === poi.id ? 'white' : '#2071c1'"
                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-['Inter'] text-[13px] font-semibold text-[#424242] leading-tight">
                    {{ poi.label }}
                  </p>
                </div>
                <div
                  v-if="selectedPoiId === poi.id"
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-[#2071c1] flex items-center justify-center"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>

            <!-- Indoor/Outdoor toggle -->
            <div class="flex items-center justify-between bg-[#f7f9fc] rounded-[14px] px-4 py-3.5 mb-6">
              <div>
                <p class="font-['Inter'] text-[13px] font-semibold text-[#424242]">
                  {{ $t('poiSelectIndoor') }}
                </p>
                <p class="font-['Inter'] text-[11px] text-[#424242]/50 mt-0.5">
                  {{ $t('poiSelectIndoorDesc') }}
                </p>
              </div>
              <button
                class="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer"
                :class="isIndoor ? 'bg-[#2071c1]' : 'bg-[#d0d7dd]'"
                @click="isIndoor = !isIndoor"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  :class="isIndoor ? 'translate-x-6' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Confirm button -->
            <button
              class="w-full cursor-pointer rounded-[10px] border-none p-3 font-['Inter'] text-[14px] font-medium text-white transition-colors"
              :class="selectedPoiId
                ? 'bg-[#2071c1] hover:bg-[#1a5b9c]'
                : 'bg-[#d0d7dd] cursor-not-allowed'"
              :disabled="!selectedPoiId"
              @click="confirm"
            >
              {{ $t('poiSelectConfirm') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'select-poi', poiId: string, isIndoor: boolean): void
  (e: 'close'): void
}>()

const pois = [
  { id: 'via-senato',        label: 'Via Senato',          description: 'Naviglio della Martesana' },
  { id: 'laghetto-san-marco', label: 'Laghetto di San Marco', description: 'Laghetto di San Marco'    },
  { id: 'laghetto-stefano',  label: 'Laghetto di Santo Stefano',  description: 'Laghetto di Stefano'       },
]

const selectedPoiId = ref<string | null>(null)
const isIndoor = ref(false)

function confirm() {
  if (!selectedPoiId.value) return
  emit('select-poi', selectedPoiId.value, isIndoor.value)
}
</script>