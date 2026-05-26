<template>
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div class="bg-white w-full sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col relative transform transition-transform">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#424242]/10 shrink-0">
          <span class="font-['Playfair_Display'] text-[18px] font-bold text-[#424242]">
            {{ $t('sectionHistory') || 'Storia e Progetto' }}
          </span>
          <button 
            @click="emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-[#424242]/5 text-[#424242] hover:bg-[#424242]/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
  
        <div class="p-6 overflow-y-auto overscroll-contain flex-1">
          <h2 class="font-['Playfair_Display'] text-[22px] font-bold text-[#424242] leading-tight mb-3">
            {{ $t('navigliTitle') }}
          </h2>
          <p class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-4" v-html="navigliP1" />
          <p class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-6" v-html="navigliP2" />
  
          <div class="w-full h-px bg-[#424242]/8 mb-6" />
  
          <p class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-2">{{ $t('sectionProject') }}</p>
          <h2 class="font-['Playfair_Display'] text-[22px] font-bold text-[#424242] leading-tight mb-3">
            {{ $t('persephoneTitle') }}
          </h2>
          <p class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-4" v-html="persephoneP1" />
          <p class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/75 mb-6">{{ $t('persephoneP2') }}</p>
  
          <div class="w-full h-px bg-[#424242]/8 mb-6" />
  
          <p class="font-['Inter'] text-[10px] uppercase tracking-[0.14em] text-[#2071c1] mb-3">{{ $t('sectionTeam') }}</p>
          <div class="flex flex-col gap-2 pb-6">
            <div v-for="member in team" :key="member.name" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#2071c1]/10 flex items-center justify-center shrink-0">
                <span class="font-['Playfair_Display'] text-[12px] font-bold text-[#2071c1]">{{ member.initials }}</span>
              </div>
              <div>
                <p class="font-['Inter'] text-[16px] font-semibold text-[#424242] leading-none">{{ member.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <Transition name="exotic-pop">
        <div v-if="easterEggVisible" class="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div class="exotic-card bg-gradient-to-br from-[#00d2ff] via-[#3a7bd5] to-[#8e2de2] p-[2px] rounded-[30px] shadow-[0_0_50px_rgba(58,123,213,0.4)] mx-8 pointer-events-auto">
            <div class="bg-white/90 backdrop-blur-xl rounded-[28px] px-8 py-10 text-center relative overflow-hidden">
              <button @click="closeEgg" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#2071c1]/10 text-[#2071c1] hover:bg-[#2071c1] hover:text-white transition-colors cursor-pointer z-10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div class="text-6xl mb-6 drop-shadow-sm animate-float">{{ easterEggEmoji }}</div>
              <h3 class="font-['Playfair_Display'] text-[24px] italic font-bold text-[#2071c1] mb-3">{{ easterEggTitle }}</h3>
              <p class="font-['Inter'] text-[15px] text-[#424242]/80 leading-relaxed">{{ easterEggText }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  
  const emit = defineEmits<{ (e: 'close'): void }>()
  const { t } = useI18n()
  
  // ─── Easter eggs & Testi ──────────────────────────────────────────────────
  function eggSpan(key: string, label: string) {
    return `<span class="easter-word" data-egg="${key}">${label}</span>`
  }
  
  const navigliP1 = computed(() => t('navigliP1', { canali: eggSpan('canali', t('wordCanali')), navigli: eggSpan('navigli', t('wordNavigli')), leonardo: eggSpan('leonardo', t('wordLeonardo')) }))
  const navigliP2 = computed(() => t('navigliP2', { viadacqua: eggSpan('viadacqua', t('wordViadacqua')) }))
  const persephoneP1 = computed(() => t('persephoneP1', { persefone: eggSpan('persefone', t('wordPersefone')), navigli: eggSpan('navigli', t('wordNavigli')) }))
  
  const easterEggVisible = ref(false)
  const easterEggEmoji = ref('')
  const easterEggTitle = ref('')
  const easterEggText = ref('')
  let easterTimeout: ReturnType<typeof setTimeout> | null = null
  
  function getEgg(key: string) {
    const map: Record<string, { emoji: string; titleKey: string; textKey: string }> = {
      canali: { emoji: '🚣', titleKey: 'easterCanaliTitle', textKey: 'easterCanaliText' },
      navigli: { emoji: '💧', titleKey: 'easterNavigliTitle', textKey: 'easterNavigliText' },
      leonardo: { emoji: '🎨', titleKey: 'easterLeonardoTitle', textKey: 'easterLeonardoText' },
      viadacqua: { emoji: '⛵', titleKey: 'easterViadacquaTitle', textKey: 'easterViadacquaText' },
      persefone: { emoji: '🌒', titleKey: 'easterPersefoneTitle', textKey: 'easterPersefoneText' }
    }
    return map[key] ?? null
  }
  
  let audioCtx: AudioContext | null = null

  function getOrCreateAudioCtx(): AudioContext {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  }

  function playEasterEggSound() {
    try {
      const ctx = getOrCreateAudioCtx()
      // A magical, starry arpeggio: C5, E5, G5, B5, C6 (major 7th)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.frequency.value = freq
        osc.type = 'sine'
        
        const t0 = ctx.currentTime + i * 0.07 // Fast, sparkling delay
        gain.gain.setValueAtTime(0.08, t0)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4)
        
        osc.start(t0)
        osc.stop(t0 + 0.4)
      })
    } catch (_) {}
  }

  function closeEgg() {
    easterEggVisible.value = false
    if (easterTimeout) { clearTimeout(easterTimeout); easterTimeout = null }
  }
  
  function triggerEgg(key: string) {
    const egg = getEgg(key)
    if (!egg) return
    easterEggEmoji.value = egg.emoji
    easterEggTitle.value = t(egg.titleKey)
    easterEggText.value = t(egg.textKey)
    easterEggVisible.value = true
    playEasterEggSound()
  }
  
  function onContentClick(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('[data-egg]') as HTMLElement | null
    if (el?.dataset.egg) triggerEgg(el.dataset.egg)
  }
  
  // ─── Team ──────────────────────────────────────────────────────────────────
  const team = [
    { name: 'Marco Abbadessa', initials: 'MA' },
    { name: 'Gabriele Busacca', initials: 'GB' },
    { name: 'Lorenzo Chiaretti', initials: 'LC' },
    { name: "Giuseppe D'Ambrosi", initials: 'GD' }
  ]
  
  onMounted(() => { document.addEventListener('click', onContentClick) })
  onUnmounted(() => {
    document.removeEventListener('click', onContentClick)
    if (easterTimeout) clearTimeout(easterTimeout)
    audioCtx?.close()
  })
  </script>
  
  <style scoped>
  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .exotic-pop-enter-active { animation: exotic-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .exotic-pop-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
  .exotic-pop-leave-to { opacity: 0; transform: scale(0.8); }
  @keyframes exotic-in { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
  .exotic-card { max-width: 320px; }
  :deep(.easter-word) { color: #2071c1; font-weight: 700; background-color: rgba(32, 113, 193, 0.1); border: 1.5px dashed rgba(32, 113, 193, 0.6); border-radius: 6px; padding: 2px 6px; margin: 0 2px; cursor: pointer; display: inline-block; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 2px 4px rgba(32, 113, 193, 0.05); }
  :deep(.easter-word:hover) { background-color: #2071c1; color: #ffffff; border-style: solid; transform: scale(1.05) translateY(-2px); box-shadow: 0 4px 8px rgba(32, 113, 193, 0.2); }
  </style>