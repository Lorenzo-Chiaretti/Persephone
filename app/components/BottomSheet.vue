<template>
  <div class="absolute left-0 right-0 z-20 flex flex-col pointer-events-none" style="bottom: 0;">
    <div class="px-5 pb-[max(env(safe-area-inset-bottom,24px),24px)] pointer-events-auto">
      <button
        class="w-full flex items-center justify-center gap-2 bg-[#2071c1] hover:bg-[#1a5b9c] active:scale-95 text-white py-4 rounded-2xl shadow-lg font-['Inter'] font-bold text-[15px] transition-all cursor-pointer"
        @click="emit('start-ar')"
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
        {{ $t('startAr') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'start-ar'): void }>()
</script>