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
          class="relative z-10 w-full max-w-[480px] bg-white rounded-t-[20px] sm:rounded-[20px] overflow-hidden max-h-[92dvh] overflow-y-auto"
        >
          <!-- Close -->
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

          <!-- Header -->
          <div
            class="relative h-[140px] w-full overflow-hidden bg-white flex items-center justify-center"
          >
            <img
              src="/Persephone_Logo.png"
              alt="Logo"
              class="max-h-[120px] max-w-[70%] w-auto h-auto object-contain"
            />
            <div class="absolute bottom-4 left-5">
              <p
                class="font-['Inter'] text-[10px] uppercase tracking-[0.15em] text-[#2071c1] mb-1"
              >
                Il progetto
              </p>
              <h2
                class="font-['Playfair_Display'] text-[26px] font-bold text-[#2071c1] leading-none"
              >
                Chi siamo
              </h2>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 pt-5 pb-8">
            <p
              class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/80 mb-5"
            >
              Persephone nasce dalla volontà di restituire a Milano la memoria
              dei suoi Navigli — un sistema idroviario che per secoli ha
              definito l'identità della città, interrato progressivamente tra il
              1929 e il 1930.
            </p>

            <p
              class="font-['Inter'] text-[14px] leading-[1.75] text-[#424242]/80 mb-6"
            >
              Attraverso realtà aumentata, intelligenza artificiale e fotografie
              storiche, vogliamo permettere a chiunque di vedere Milano come era
              — camminando esattamente dove camminava chi l'ha vissuta.
            </p>

            <!-- Divider -->
            <div class="w-full h-px bg-[#424242]/10 mb-6" />

            <!-- Team -->
            <p
              class="font-['Inter'] text-[11px] uppercase tracking-[0.12em] text-[#2071c1] mb-4"
            >
              Il team
            </p>

            <div class="flex flex-col gap-3 mb-7">
              <div
                v-for="member in team"
                :key="member.name"
                class="flex items-center gap-3"
              >
                <div
                  class="w-9 h-9 rounded-full bg-[#2071c1]/10 flex items-center justify-center flex-shrink-0"
                >
                  <span
                    class="font-['Playfair_Display'] text-[14px] font-bold text-[#2071c1]"
                  >
                    {{ member.initials }}
                  </span>
                </div>
                <div>
                  <p
                    class="font-['Inter'] text-[13px] font-semibold text-[#424242] leading-none mb-0.5"
                  >
                    {{ member.name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="w-full h-px bg-[#424242]/10 mb-6" />

            <!-- Tecnologie -->
            <p
              class="font-['Inter'] text-[11px] uppercase tracking-[0.12em] text-[#2071c1] mb-4"
            >
              Tecnologie
            </p>
            <div class="flex flex-wrap gap-2 mb-7">
              <span
                v-for="tech in techs"
                :key="tech"
                class="font-['Inter'] text-[12px] text-[#424242]/70 bg-[#f7f9fc] border border-[#424242]/10 rounded-full px-3 py-1"
              >
                {{ tech }}
              </span>
            </div>

            <button
              class="w-full cursor-pointer rounded-[10px] border border-[#2071c1] bg-transparent hover:bg-[#2071c1]/5 p-3 font-['Inter'] text-[14px] font-medium text-[#2071c1] transition-colors"
              @click="emit('close')"
            >
              Torna alla mappa
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'close'): void }>()

const team = [
  { name: 'Marco Abbadessa', initials: 'MA' },
  { name: 'Gabriele Busacca', initials: 'GB' },
  { name: 'Lorenzo Chiaretti', initials: 'LC' },
  { name: "Giuseppe D'Ambrosi",  initials: 'GD' }
]

const techs = [
  'Nuxt 3',
  'Vue 3',
  'Mapbox GL',
  'WebXR',
  'Anthropic AI',
  'TypeScript'
]
</script>
