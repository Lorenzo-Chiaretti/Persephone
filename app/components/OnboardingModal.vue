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

          <!-- Language toggle inside modal -->
          <button
            class="absolute top-3 left-3 z-20 flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#d0d7dd]/85 cursor-pointer transition-colors hover:bg-[#b0b8c0]"
            @click="toggleLang"
          >
            <svg
              v-if="locale === 'it'"
              width="18"
              height="12"
              viewBox="0 0 20 14"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-sm"
            >
              <rect width="20" height="14" fill="#CE2B37" />
              <rect width="6.67" height="14" fill="#009246" />
              <rect x="6.67" width="6.67" height="14" fill="#FFFFFF" />
            </svg>
            <svg
              v-else
              width="18"
              height="12"
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
              class="text-[11px] font-['Inter'] font-semibold text-[#424242]"
              >{{ locale === 'it' ? 'IT' : 'EN' }}</span
            >
          </button>

          <div
            class="relative h-[180px] w-full overflow-hidden bg-white flex items-center justify-center"
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
                {{ $t('welcSub') }}
              </p>
              <h1
                class="font-['Playfair_Display'] text-[28px] font-bold text-[#2071c1] leading-none"
              >
                {{ $t('appName') }}
              </h1>
            </div>
          </div>

          <div class="px-6 pt-5 pb-7">
            <p
              class="font-['Inter'] text-[14px] leading-[1.7] text-[#424242]/80 mb-6"
            >
              {{ $t('welcP1') }}
            </p>

            <div class="flex flex-col gap-3 mb-7">
              <div
                class="flex items-start gap-4 bg-[#f7f9fc] rounded-[14px] px-4 py-4"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2071c1"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
                  >
                    {{ $t('welcCard1Title') }}
                  </p>
                  <p
                    class="font-['Inter'] text-[12px] text-[#424242]/60 leading-[1.55]"
                  >
                    {{ $t('welcCard1Desc') }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-4 bg-[#f7f9fc] rounded-[14px] px-4 py-4"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2071c1"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p
                    class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
                  >
                    {{ $t('welcCard2Title') }}
                  </p>
                  <p
                    class="font-['Inter'] text-[12px] text-[#424242]/60 leading-[1.55]"
                  >
                    {{ $t('welcCard2Desc') }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-4 bg-[#f7f9fc] rounded-[14px] px-4 py-4"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-[10px] bg-[#2071c1]/10 flex items-center justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2071c1"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
                <div>
                  <p
                    class="font-['Inter'] text-[13px] font-semibold text-[#424242] mb-0.5"
                  >
                    {{ $t('welcCard3Title') }}
                  </p>
                  <p
                    class="font-['Inter'] text-[12px] text-[#424242]/60 leading-[1.55]"
                  >
                    {{ $t('welcCard3Desc') }}
                  </p>
                </div>
              </div>
            </div>

            <button
              class="w-full cursor-pointer rounded-[10px] border-none bg-[#2071c1] hover:bg-[#1a5b9c] p-3 font-['Inter'] text-[14px] font-medium text-white transition-colors"
              @click="emit('close')"
            >
              {{ $t('welcBtn') }}
            </button>
            <p
              class="font-['Inter'] text-[11px] text-[#424242]/40 text-center mt-3"
            >
              {{ $t('welcHint') }}
            </p>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'close'): void }>()
const { locale, setLocale } = useI18n()
const toggleLang = () => setLocale(locale.value === 'it' ? 'en' : 'it')
</script>
