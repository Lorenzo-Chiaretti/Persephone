<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <!-- Backdrop -->
      <Transition name="fade" appear>
        <div
          class="absolute inset-0 bg-slate-900/40 cursor-pointer backdrop-blur-[6px]"
          @click="emit('close')"
        />
      </Transition>

      <!-- Sheet -->
      <Transition name="slide-up" appear>
        <div
          class="relative z-10 w-full max-w-[480px] bg-white rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.15)] border border-slate-100/50"
        >
          <!-- Drag handle (mobile only) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>

          <!-- Close button -->
          <button
            class="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 cursor-pointer transition-all hover:bg-slate-200 hover:text-slate-700 active:scale-95 focus:outline-none"
            @click="emit('close')"
            :aria-label="$t('close')"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1.5 1.5l9 9M10.5 1.5l-9 9"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="px-6 pt-5 pb-7">
            <!-- Header: location info banner -->
            <div class="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-100/70 mb-6">
              <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mt-0.5 text-amber-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0 pr-2">
                <h2 class="font-['Playfair_Display'] text-[21px] font-bold text-amber-950 leading-tight">
                  {{ $t('poiSelectTitle') }}
                </h2>
                <p class="text-[12.5px] text-amber-900/75 leading-relaxed mt-1.5 font-['Inter']">
                  {{ $t('poiSelectDesc') }}
                </p>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-slate-100 mb-5" />

            <!-- Section label -->
            <p class="text-[10px] font-bold text-[#2071c1] tracking-[0.14em] uppercase mb-3 font-['Inter']">
              {{ $t('poiSelectSectionLabel') }}
            </p>

            <!-- POI buttons -->
            <div class="flex flex-col gap-2.5 mb-6">
              <button
                v-for="(poi, index) in pois"
                :key="poi.id"
                class="poi-btn flex items-center justify-between rounded-2xl px-5 py-4 cursor-pointer text-left transition-all duration-300 border-2 w-full focus:outline-none"
                :class="
                  selectedPoiId === poi.id
                    ? 'bg-blue-50/50 border-[#2071c1] text-[#2071c1] font-semibold shadow-sm'
                    : 'bg-slate-50 border-slate-100/80 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                "
                :style="{ animationDelay: `${index * 50}ms` }"
                @click="selectedPoiId = poi.id"
              >
                <div class="flex items-center gap-3.5">
                  <!-- Pin icon badge -->
                  <div
                    class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    :class="
                      selectedPoiId === poi.id
                        ? 'bg-[#2071c1] text-white shadow-md shadow-[#2071c1]/20'
                        : 'bg-slate-200/60 text-[#2071c1]/80'
                    "
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>

                  <span
                    class="text-[14px] leading-tight font-medium font-['Inter'] transition-colors duration-200"
                    :class="selectedPoiId === poi.id ? 'text-[#1a5b9c] font-semibold' : 'text-slate-800'"
                  >
                    {{ poi.label }}
                  </span>
                </div>

                <!-- Selected check circle indicator -->
                <div class="flex items-center justify-center">
                  <Transition name="scale-in" mode="out-in">
                    <div
                      v-if="selectedPoiId === poi.id"
                      class="w-5 h-5 rounded-full bg-[#2071c1] flex items-center justify-center shadow-sm"
                    >
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6l2.5 2.5 4.5-4.5"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div v-else class="w-5 h-5 rounded-full border border-slate-200 bg-white" />
                  </Transition>
                </div>
              </button>
            </div>

            <!-- Indoor / Outdoor Segmented Selector -->
            <div class="mt-6 mb-6">
              <p class="text-[10px] font-bold text-[#2071c1] tracking-[0.14em] uppercase mb-3 font-['Inter']">
                {{ $t('poiSelectLocationQuery') }}
              </p>

              <div class="bg-slate-100/80 border border-slate-200/40 p-1 rounded-2xl flex w-full">
                <button
                  type="button"
                  class="flex-1 py-3 text-center rounded-xl font-['Inter'] text-[13px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                  :class="
                    !isIndoor
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
                      : 'text-slate-500 hover:text-slate-700'
                  "
                  @click="isIndoor = false"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                  {{ $t('poiSelectOutdoors') }}
                </button>

                <button
                  type="button"
                  class="flex-1 py-3 text-center rounded-xl font-['Inter'] text-[13px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                  :class="
                    isIndoor
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
                      : 'text-slate-500 hover:text-slate-700'
                  "
                  @click="isIndoor = true"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {{ $t('poiSelectIndoors') }}
                </button>
              </div>

              <!-- Indoor helper description card -->
              <Transition name="slide-fade">
                <div
                  v-if="isIndoor"
                  class="bg-blue-50/40 border border-blue-100/50 text-[#1a5b9c] rounded-2xl p-4 flex gap-3 mt-3 shadow-sm shadow-blue-50/10"
                >
                  <div class="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-100/50 flex items-center justify-center text-[#2071c1] mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <p class="text-[11.5px] leading-relaxed font-['Inter'] text-[#1a5b9c]/90">
                    {{ $t('poiSelectIndoorsDesc') }}
                  </p>
                </div>
              </Transition>
            </div>

            <!-- Confirm button -->
            <button
              class="w-full rounded-2xl border-none p-4 text-[14px] font-bold font-['Inter'] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none"
              :class="
                selectedPoiId
                  ? 'bg-[#2071c1] text-white hover:bg-[#1a5b9c] active:scale-[0.98] cursor-pointer shadow-lg shadow-[#2071c1]/20 hover:shadow-[#2071c1]/35'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/30'
              "
              :disabled="!selectedPoiId"
              @click="confirm"
            >
              <span>{{ $t('poiSelectConfirm') }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-0.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            <!-- Hint -->
            <Transition name="fade">
              <p
                v-if="!selectedPoiId"
                class="text-center text-[11px] text-slate-400/80 font-medium font-['Inter'] mt-3"
              >
                {{ $t('poiSelectHint') }}
              </p>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'select-poi', poiId: string, isIndoor: boolean): void
  (e: 'close'): void
}>()

const pois = computed(() => [
  {
    id: 'via-senato',
    label: t('poiViaSenato')
  },
  {
    id: 'laghetto-san-marco',
    label: t('poiLaghettoSanMarco')
  },
  {
    id: 'laghetto-stefano',
    label: t('poiLaghettoStefano')
  }
])

const selectedPoiId = ref<string | null>(null)
const isIndoor = ref(false)

function confirm() {
  if (!selectedPoiId.value) return
  emit('select-poi', selectedPoiId.value, isIndoor.value)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition:
    transform 0.38s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.25s ease;
}
.slide-up-leave-active {
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.scale-in-enter-active {
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.15s ease;
}
.scale-in-leave-active {
  transition:
    transform 0.1s ease,
    opacity 0.1s ease;
}
.scale-in-enter-from,
.scale-in-leave-to {
  transform: scale(0);
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

.poi-btn {
  animation: poi-enter 0.32s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes poi-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
