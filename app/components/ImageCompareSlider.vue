<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[60] flex flex-col bg-black">
      <div
        class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
      >
        <p class="font-['Inter'] text-[13px] text-white/70">{{ title }}</p>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/25"
          @click="$emit('close')"
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        ref="sliderEl"
        class="relative flex-1 overflow-hidden select-none touch-none cursor-col-resize"
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
      >
        <img
          :src="modernSrc"
          :alt="title + ' oggi'"
          class="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />
        <div
          class="absolute inset-0 overflow-hidden"
          :style="{ width: position + '%' }"
        >
          <img
            :src="historicalSrc"
            :alt="title + ' storica'"
            class="absolute inset-0 h-full w-[100vw] max-w-none object-cover"
            draggable="false"
          />
        </div>
        <div
          class="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
          :style="{ left: position + '%' }"
        />
        <div
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-2xl pointer-events-none"
          :style="{ left: position + '%' }"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path
              d="M5 1L1 7l4 6M13 1l4 6-4 6"
              stroke="#424242"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div
          class="absolute bottom-5 left-4 rounded-full bg-black/55 px-3 py-1 font-['Inter'] text-[11px] text-white pointer-events-none"
        >
          {{ $t('historical') }}
        </div>
        <div
          class="absolute bottom-5 right-4 rounded-full bg-black/55 px-3 py-1 font-['Inter'] text-[11px] text-white pointer-events-none"
        >
          {{ $t('today') }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  historicalSrc: string
  modernSrc: string
}>()

defineEmits<{ close: [] }>()

const sliderEl = ref<HTMLElement | null>(null)
const position = ref(50)
let dragging = false

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) position.value = 50
  }
)

function getClientX(e: MouseEvent | TouchEvent): number {
  if (e instanceof TouchEvent) {
    // Il punto interrogativo (?.) ferma tutto se l'elemento [0] non esiste,
    // mentre i punti interrogativi doppi (??) forniscono il piano B.
    return e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0
  }
  return e.clientX
}

function move(e: MouseEvent | TouchEvent) {
  if (!dragging || !sliderEl.value) return
  const rect = sliderEl.value.getBoundingClientRect()
  const x = getClientX(e) - rect.left
  const percent = (x / rect.width) * 100
  position.value = Math.max(0, Math.min(percent, 100))
}

function startDrag(e: MouseEvent | TouchEvent) {
  dragging = true
  move(e)
}
function stopDrag() {
  dragging = false
}

onMounted(() => {
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', move, { passive: false })
  window.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', move)
  window.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
