<template>
  <Transition name="slide-up">
    <div
      v-if="mapStore.isModalOpen && mapStore.selectedPoi"
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;"
      @click.self="close"
    >
      <div
        style="position:absolute;inset:0;background:rgba(66,66,66,0.45);"
        @click="close"
      />

      <div style="
        position:relative;z-index:10;
        background:#ffffff;
        width:100%;max-width:480px;
        border-radius:20px 20px 0 0;
        overflow:hidden;
      ">

        <!-- Bottone X -->
        <button
          @click="close"
          aria-label="Close"
          style="
            position:absolute;top:12px;right:12px;z-index:20;
            width:32px;height:32px;border-radius:50%;
            background:rgba(208,215,221,0.85);
            border:none;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
          "
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="#424242" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Immagine con toggle storico/moderno -->
        <div style="position:relative;width:100%;height:220px;overflow:hidden;">
          <img
            :src="showModern ? poi.imageModernUrl : poi.imageUrl"
            :alt="poi.title"
            style="width:100%;height:100%;object-fit:cover;transition:opacity 0.4s ease;"
          />

          <!-- Badge anno -->
          <div style="
            position:absolute;bottom:12px;left:12px;
            background:rgba(66,66,66,0.7);color:#fff;
            font-family:'Inter',sans-serif;font-size:11px;
            padding:3px 10px;border-radius:20px;
          ">{{ showModern ? 'Today' : poi.year }}</div>

          <!-- Toggle -->
          <div style="
            position:absolute;bottom:12px;right:12px;
            background:rgba(66,66,66,0.6);
            border-radius:20px;padding:3px;
            display:flex;gap:2px;
          ">
            <button
              @click="showModern = false"
              :style="`
                font-family:'Inter',sans-serif;font-size:11px;
                padding:4px 12px;border-radius:20px;border:none;cursor:pointer;
                background:${!showModern ? '#ffffff' : 'transparent'};
                color:${!showModern ? '#424242' : '#ffffff'};
                transition:background 0.2s;
              `"
            >Historical</button>
            <button
              @click="showModern = true"
              :style="`
                font-family:'Inter',sans-serif;font-size:11px;
                padding:4px 12px;border-radius:20px;border:none;cursor:pointer;
                background:${showModern ? '#ffffff' : 'transparent'};
                color:${showModern ? '#424242' : '#ffffff'};
                transition:background 0.2s;
              `"
            >Today</button>
          </div>
        </div>

        <!-- Testo -->
        <div style="padding:20px 24px 28px;">
          <p style="
            font-family:'Inter',sans-serif;font-size:11px;
            color:#2071c1;text-transform:uppercase;
            letter-spacing:0.1em;margin:0 0 6px;
          ">{{ poi.year }}</p>

          <h2 style="
            font-family:'Playfair Display',serif;
            font-size:22px;font-weight:700;
            color:#424242;margin:0 0 12px;line-height:1.3;
          ">{{ poi.title }}</h2>

          <p style="
            font-family:'Inter',sans-serif;font-size:14px;
            color:#424242;line-height:1.7;margin:0 0 20px;
            opacity:0.8;
          ">{{ poi.description }}</p>

          <!-- Bottone navigazione con grounding fallback -->
          <button
            @click="navigate"
            style="
              width:100%;padding:12px;
              background:#2071c1;color:#ffffff;
              font-family:'Inter',sans-serif;font-size:14px;font-weight:500;
              border:none;border-radius:10px;cursor:pointer;
            "
          >Take me there</button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '~/stores/useMapStore'

const mapStore = useMapStore()
const showModern = ref(false)

const poi = computed(() => mapStore.selectedPoi!)

function close() {
  mapStore.isModalOpen = false
  showModern.value = false
}

function navigate() {
  const destination = encodeURIComponent(
    poi.value.address ?? poi.value.title + ', Milan'
  )
  const url = `https://maps.google.com/?q=${destination}`
  // Grounding challenge — handoff failure fallback
  if (!window.open(url, '_blank')) {
    alert(`Could not open Maps automatically.\nDestination: ${poi.value.address ?? poi.value.title + ', Milan'}`)
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>