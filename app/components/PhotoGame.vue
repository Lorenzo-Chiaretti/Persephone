<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        class="absolute inset-0 bg-[#424242]/45 cursor-pointer"
        @click="emit('close')"
      />

      <Transition name="slide-up" appear>
        <div
          class="relative z-10 w-full max-w-[480px] bg-[#0f0e1a] rounded-t-[20px] sm:rounded-[20px] overflow-hidden max-h-[92dvh] overflow-y-auto"
        >
          <button
            class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 cursor-pointer transition-colors hover:bg-white/20"
            @click="emit('close')"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- ═══ RULES PHASE — swipeable onboarding cards ═══ -->
          <Transition name="fade">
            <div v-if="phase === 'rules'" class="flex flex-col pb-6">
              <!-- Slider -->
              <div
                ref="sliderRef"
                class="relative overflow-hidden w-full select-none"
                style="touch-action: pan-y; height: 560px"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerCancel"
              >
                <div
                  class="flex w-full"
                  style="will-change: transform"
                  :style="{
                    transform: `translateX(calc(-${slideIndex * 100}% + ${dragOffset}px))`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 350ms cubic-bezier(0.4,0,0.2,1)'
                  }"
                >
                  <div
                    v-for="(slide, i) in onboardingSlides"
                    :key="i"
                    class="relative flex-shrink-0 flex flex-col justify-end pb-5"
                    style="width: 100%; min-width: 0; height: 560px"
                  >
                    <!-- Background e Grafiche -->
                    <div
                      class="absolute inset-0"
                      :style="{ background: slide.bgGradient }"
                    >
                      <!-- Step 1: schermo con scan line -->
                      <template v-if="i === 0">
                        <div
                          class="absolute inset-0 flex items-center justify-center gap-6"
                          style="padding-bottom: 200px"
                        >
                          <div class="phone-frame">
                            <div class="phone-screen">
                              <div class="phone-img">
                                <svg
                                  width="28"
                                  height="28"
                                  viewBox="0 0 28 28"
                                  fill="none"
                                >
                                  <circle
                                    cx="14"
                                    cy="11"
                                    r="5"
                                    stroke="rgba(32,113,193,0.8)"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10"
                                    stroke="rgba(32,113,193,0.6)"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                  />
                                </svg>
                              </div>
                              <div class="slide1-scanline" />
                            </div>
                          </div>
                          <div
                            style="
                              display: flex;
                              flex-direction: column;
                              gap: 7px;
                            "
                          >
                            <div
                              style="
                                width: 58px;
                                height: 7px;
                                background: rgba(255, 255, 255, 0.07);
                                border-radius: 4px;
                              "
                            />
                            <div
                              style="
                                width: 42px;
                                height: 7px;
                                background: rgba(255, 255, 255, 0.04);
                                border-radius: 4px;
                              "
                            />
                            <div
                              style="
                                width: 50px;
                                height: 7px;
                                background: rgba(32, 113, 193, 0.18);
                                border-radius: 4px;
                              "
                            />
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(32, 113, 193, 0.13),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 2: Navigli animated background -->
                      <template v-else-if="i === 1">
                        <div class="navigli-scene">
                          <!-- Stars -->
                          <div
                            class="nav-star"
                            style="top: 7%; left: 11%; animation-delay: 0s"
                          />
                          <div
                            class="nav-star"
                            style="top: 14%; left: 34%; animation-delay: 1.1s"
                          />
                          <div
                            class="nav-star nav-star-sm"
                            style="top: 5%; left: 54%; animation-delay: 0.4s"
                          />
                          <div
                            class="nav-star"
                            style="top: 19%; left: 71%; animation-delay: 2s"
                          />
                          <div
                            class="nav-star nav-star-sm"
                            style="top: 9%; left: 87%; animation-delay: 0.8s"
                          />
                          <div
                            class="nav-star nav-star-sm"
                            style="top: 22%; left: 19%; animation-delay: 1.7s"
                          />
                          <div
                            class="nav-star"
                            style="top: 4%; left: 77%; animation-delay: 2.5s"
                          />

                          <!-- Buildings left -->
                          <div
                            class="nav-bld"
                            style="
                              left: 0;
                              width: 17%;
                              height: 95px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 14px;
                                left: 10px;
                                animation-delay: 1.3s;
                              "
                            />
                            <div
                              class="nav-win"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 14px;
                                left: 24px;
                              "
                            />
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 30px;
                                left: 10px;
                              "
                            />
                            <div
                              class="nav-win"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 46px;
                                left: 24px;
                              "
                            />
                          </div>
                          <div
                            class="nav-bld"
                            style="
                              left: 17%;
                              width: 13%;
                              height: 75px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 9px;
                                height: 7px;
                                top: 12px;
                                left: 7px;
                                animation-delay: 0.7s;
                              "
                            />
                            <div
                              class="nav-win"
                              style="
                                width: 9px;
                                height: 7px;
                                top: 28px;
                                left: 7px;
                              "
                            />
                          </div>
                          <div
                            class="nav-bld"
                            style="
                              left: 30%;
                              width: 10%;
                              height: 55px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 8px;
                                height: 7px;
                                top: 10px;
                                left: 6px;
                                animation-delay: 0.3s;
                              "
                            />
                          </div>
                          <!-- Buildings right -->
                          <div
                            class="nav-bld"
                            style="
                              right: 0;
                              width: 18%;
                              height: 105px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 14px;
                                left: 10px;
                                animation-delay: 1.5s;
                              "
                            />
                            <div
                              class="nav-win"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 14px;
                                left: 26px;
                              "
                            />
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 30px;
                                left: 26px;
                                animation-delay: 0.6s;
                              "
                            />
                            <div
                              class="nav-win"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 46px;
                                left: 10px;
                              "
                            />
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 10px;
                                height: 8px;
                                top: 62px;
                                left: 26px;
                                animation-delay: 2.3s;
                              "
                            />
                          </div>
                          <div
                            class="nav-bld"
                            style="
                              right: 18%;
                              width: 13%;
                              height: 82px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win"
                              style="
                                width: 9px;
                                height: 7px;
                                top: 12px;
                                left: 7px;
                              "
                            />
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 9px;
                                height: 7px;
                                top: 12px;
                                left: 20px;
                                animation-delay: 1.1s;
                              "
                            />
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 9px;
                                height: 7px;
                                top: 28px;
                                left: 7px;
                                animation-delay: 3.1s;
                              "
                            />
                          </div>
                          <div
                            class="nav-bld"
                            style="
                              right: 31%;
                              width: 9%;
                              height: 62px;
                              bottom: 308px;
                            "
                          >
                            <div
                              class="nav-win nav-win-lit"
                              style="
                                width: 8px;
                                height: 7px;
                                top: 10px;
                                left: 5px;
                                animation-delay: 0.9s;
                              "
                            />
                          </div>

                          <!-- Canal -->
                          <div class="nav-canal">
                            <div class="nav-canal-shimmer" />
                          </div>

                          <!-- Bridges -->
                          <div class="nav-bridge" style="left: 18%">
                            <div class="nav-bridge-arch" />
                          </div>
                          <div class="nav-bridge" style="right: 16%">
                            <div class="nav-bridge-arch" />
                          </div>

                          <!-- Path -->
                          <div class="nav-path">
                            <div class="nav-path-dashes" />
                          </div>

                          <!-- Direction arrows (SVG chevrons, no emoji) -->
                          <div
                            class="nav-dir-arrow"
                            style="left: 22%; animation-delay: 0s"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.55)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M6 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.35)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                          <div
                            class="nav-dir-arrow"
                            style="left: 44%; animation-delay: 0.5s"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.55)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M6 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.35)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                          <div
                            class="nav-dir-arrow"
                            style="left: 64%; animation-delay: 1s"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.55)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M6 2l4 4-4 4"
                                stroke="rgba(34,197,94,0.35)"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>

                          <!-- Destination glow -->
                          <div class="nav-destination" />

                          <!-- Ground -->
                          <div class="nav-ground" />

                          <!-- Walking character L→R -->
                          <div class="nav-character">
                            <svg
                              width="22"
                              height="38"
                              viewBox="0 0 22 38"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="11"
                                cy="6"
                                r="5"
                                fill="rgba(34,197,94,0.85)"
                              />
                              <rect
                                x="7"
                                y="11"
                                width="8"
                                height="11"
                                rx="3"
                                fill="rgba(32,113,193,0.9)"
                              />
                              <rect
                                x="7"
                                y="22"
                                width="4"
                                height="9"
                                rx="2"
                                fill="rgba(34,197,94,0.75)"
                                style="
                                  transform-origin: 9px 22px;
                                  animation: nav-leg-l 0.5s ease-in-out infinite;
                                "
                              />
                              <rect
                                x="11"
                                y="22"
                                width="4"
                                height="9"
                                rx="2"
                                fill="rgba(34,197,94,0.75)"
                                style="
                                  transform-origin: 13px 22px;
                                  animation: nav-leg-r 0.5s ease-in-out infinite;
                                "
                              />
                              <rect
                                x="2"
                                y="13"
                                width="3"
                                height="8"
                                rx="1.5"
                                fill="rgba(32,113,193,0.7)"
                                style="
                                  transform-origin: 3.5px 13px;
                                  animation: nav-arm-l 0.5s ease-in-out infinite;
                                "
                              />
                              <rect
                                x="17"
                                y="13"
                                width="3"
                                height="8"
                                rx="1.5"
                                fill="rgba(32,113,193,0.7)"
                                style="
                                  transform-origin: 18.5px 13px;
                                  animation: nav-arm-r 0.5s ease-in-out infinite;
                                "
                              />
                            </svg>
                          </div>

                          <!-- Walking character R→L (mirrored, offset timing) -->
                          <div class="nav-character-rtl">
                            <svg
                              width="22"
                              height="38"
                              viewBox="0 0 22 38"
                              xmlns="http://www.w3.org/2000/svg"
                              style="transform: scaleX(-1)"
                            >
                              <circle
                                cx="11"
                                cy="6"
                                r="5"
                                fill="rgba(32,113,193,0.75)"
                              />
                              <rect
                                x="7"
                                y="11"
                                width="8"
                                height="11"
                                rx="3"
                                fill="rgba(34,197,94,0.7)"
                              />
                              <rect
                                x="7"
                                y="22"
                                width="4"
                                height="9"
                                rx="2"
                                fill="rgba(32,113,193,0.65)"
                                style="
                                  transform-origin: 9px 22px;
                                  animation: nav-leg-l 0.5s ease-in-out infinite;
                                  animation-delay: 0.25s;
                                "
                              />
                              <rect
                                x="11"
                                y="22"
                                width="4"
                                height="9"
                                rx="2"
                                fill="rgba(32,113,193,0.65)"
                                style="
                                  transform-origin: 13px 22px;
                                  animation: nav-leg-r 0.5s ease-in-out infinite;
                                  animation-delay: 0.25s;
                                "
                              />
                              <rect
                                x="2"
                                y="13"
                                width="3"
                                height="8"
                                rx="1.5"
                                fill="rgba(34,197,94,0.6)"
                                style="
                                  transform-origin: 3.5px 13px;
                                  animation: nav-arm-l 0.5s ease-in-out infinite;
                                  animation-delay: 0.25s;
                                "
                              />
                              <rect
                                x="17"
                                y="13"
                                width="3"
                                height="8"
                                rx="1.5"
                                fill="rgba(34,197,94,0.6)"
                                style="
                                  transform-origin: 18.5px 13px;
                                  animation: nav-arm-r 0.5s ease-in-out infinite;
                                  animation-delay: 0.25s;
                                "
                              />
                            </svg>
                          </div>

                          <!-- Phone UI card -->
                          <div class="nav-phone-ui">
                            <div class="nav-phone-label">
                              {{ $t('gameLoc') }}
                            </div>
                            <div class="nav-map-track">
                              <div class="nav-map-fill" />
                              <div class="nav-map-dot" />
                              <div class="nav-map-dest" />
                            </div>
                            <div class="nav-phone-hint">
                              <div class="nav-hint-icon">
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                >
                                  <path
                                    d="M1 1l4 4-4 4"
                                    stroke="rgba(34,197,94,0.9)"
                                    stroke-width="1.6"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                  <path
                                    d="M4 1l4 4-4 4"
                                    stroke="rgba(34,197,94,0.6)"
                                    stroke-width="1.6"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                              <span class="nav-hint-text">{{
                                $t('gameWalk')
                              }}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(34, 197, 94, 0.1),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 3: bottone con ripple tap -->
                      <template v-else-if="i === 2">
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-center gap-5"
                          style="padding-bottom: 200px"
                        >
                          <div
                            style="
                              position: relative;
                              width: 110px;
                              height: 90px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <div
                              class="slide3-ripple"
                              style="
                                position: absolute;
                                width: 90px;
                                height: 90px;
                                border-radius: 50%;
                                border: 2px solid rgba(32, 113, 193, 0.35);
                              "
                            />
                            <div
                              class="slide3-ripple slide3-ripple-delay"
                              style="
                                position: absolute;
                                width: 90px;
                                height: 90px;
                                border-radius: 50%;
                                border: 2px solid rgba(32, 113, 193, 0.2);
                              "
                            />
                            <div
                              class="slide3-tapbtn shadow-lg"
                              style="
                                width: 80px;
                                height: 36px;
                                border-radius: 9px;
                                background: #2071c1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-family: 'Inter', sans-serif;
                                font-size: 11px;
                                font-weight: 700;
                                position: relative;
                                z-index: 1;
                              "
                            >
                              {{ $t('gameImHere') }}
                            </div>
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(249, 115, 22, 0.07),
                              transparent 65%
                            );
                          "
                        />
                      </template>

                      <!-- Step 4: GPS ring + badge verde -->
                      <template v-else-if="i === 3">
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-center gap-4"
                          style="padding-bottom: 200px"
                        >
                          <div
                            class="slide4-gpsring"
                            style="
                              width: 64px;
                              height: 64px;
                              border-radius: 50%;
                              border: 2px solid rgba(34, 197, 94, 0.45);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <div
                              style="
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: #22c55e;
                              "
                            />
                          </div>
                          <div
                            class="shadow-md"
                            style="
                              display: flex;
                              align-items: center;
                              gap: 6px;
                              background: rgba(34, 197, 94, 0.15);
                              border: 1px solid rgba(34, 197, 94, 0.4);
                              border-radius: 8px;
                              padding: 5px 12px;
                            "
                          >
                            <div
                              class="slide4-dot"
                              style="
                                width: 7px;
                                height: 7px;
                                border-radius: 50%;
                                background: #22c55e;
                              "
                            />
                            <span
                              style="
                                font-size: 12px;
                                color: rgba(34, 197, 94, 1);
                                font-family: 'Inter', sans-serif;
                                font-weight: 600;
                              "
                            >
                              {{ $t('gameNear') }} ✓
                            </span>
                          </div>
                        </div>
                        <div
                          class="slide-radial-glow"
                          style="
                            background: radial-gradient(
                              circle at 50% 50%,
                              rgba(34, 197, 94, 0.1),
                              transparent 65%
                            );
                          "
                        />
                      </template>
                    </div>

                    <!-- Floating Card con testo -->
                    <div
                      class="relative mx-5 p-5 rounded-[16px] bg-[#0f0e1a]/70 backdrop-blur-md border border-white/10 shadow-xl"
                      style="pointer-events: none"
                    >
                      <p
                        class="font-['Inter'] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2071c1] mb-1.5"
                      >
                        {{ $t('gameStep') }} {{ i + 1 }}
                      </p>
                      <p
                        class="font-['Playfair_Display'] text-[22px] font-bold text-white mb-2 leading-tight"
                      >
                        {{ slide.title }}
                      </p>
                      <p
                        class="font-['Inter'] text-[15px] text-white/80 leading-[1.6]"
                      >
                        {{ slide.desc }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dots -->
              <div class="flex justify-center gap-1.5 py-4">
                <button
                  v-for="(_, i) in onboardingSlides"
                  :key="i"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  :class="
                    i === slideIndex ? 'w-4 bg-[#2071c1]' : 'w-1.5 bg-white/15'
                  "
                  @click="slideIndex = i"
                />
              </div>

              <!-- Bottom bar -->
              <div class="flex gap-2 items-center px-6">
                <button
                  v-if="slideIndex > 0"
                  class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/8 hover:bg-white/15 transition-colors cursor-pointer flex-shrink-0"
                  :aria-label="$t('gameBack')"
                  @click="slideIndex--"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M9 2L4 7l5 5"
                      stroke="white"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <button
                  v-if="slideIndex === 0"
                  class="font-['Inter'] text-[14px] text-white/40 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0 h-11 px-2 flex items-center"
                  @click="finishOnboarding"
                >
                  {{ $t('gameSkip') }}
                </button>

                <button
                  class="flex-1 rounded-[12px] bg-[#2071c1] hover:bg-[#1a5b9c] transition-colors p-3.5 font-['Inter'] text-[15px] font-semibold text-white cursor-pointer"
                  @click="nextSlide"
                >
                  {{
                    slideIndex < onboardingSlides.length - 1
                      ? $t('gameNext')
                      : $t('gameStart')
                  }}
                </button>
              </div>
            </div>
          </Transition>

          <!-- ═══ GAME PHASE ═══ -->
          <Transition name="fade">
            <div v-if="phase === 'game'" class="flex flex-col px-6 pb-8 pt-6">
              <span
                class="font-['Inter'] text-[10px] uppercase tracking-[0.12em] text-[#2071c1] mb-1"
              >
                📍 {{ $t('gameLoc') }}
              </span>
              <h2
                class="font-['Playfair_Display'] text-[20px] font-bold text-white mb-4"
              >
                {{ poiTitle }}
              </h2>

              <div
                class="relative rounded-[14px] overflow-hidden mb-4 transition-all duration-300"
                :style="photoFrameStyle"
              >
                <img
                  v-if="poi.historicalImgUrl"
                  :src="poi.historicalImgUrl"
                  :alt="`${$t('gamePicLabel')}: ${poiTitle}`"
                  class="w-full h-[210px] object-cover"
                  style="filter: sepia(35%) contrast(1.08)"
                />
                <div
                  v-else
                  class="h-[180px] flex flex-col items-center justify-center gap-2 text-white/30"
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect
                      x="3"
                      y="7"
                      width="30"
                      height="22"
                      rx="3"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M13 7l2-4h6l2 4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <p class="font-['Inter'] text-[13px]">
                    {{ $t('gameNoPic') }}
                  </p>
                </div>
                <span
                  class="absolute bottom-2 left-2 bg-black/70 font-['Inter'] text-[10px] uppercase tracking-[0.07em] px-2 py-0.5 rounded transition-colors duration-300"
                  :style="{ color: proximityColor }"
                  >{{ $t('gamePicLabel') }}</span
                >
                <div
                  v-if="proximity > 0.5"
                  class="absolute inset-0 pointer-events-none rounded-[14px] transition-opacity duration-300"
                  :style="{
                    boxShadow: `inset 0 0 ${Math.round(proximity * 40)}px ${proximityColor}55`,
                    opacity: proximity
                  }"
                />
              </div>

              <div v-if="gpsReady && distance !== null" class="mb-3">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-['Inter'] text-[11px] text-white/40">{{
                    $t('gameFar')
                  }}</span>
                  <span
                    class="font-['Inter'] text-[12px] font-semibold transition-colors duration-300"
                    :style="{ color: proximityColor }"
                    >{{ proximityLabel }}</span
                  >
                  <span class="font-['Inter'] text-[11px] text-white/40">{{
                    $t('gameNear')
                  }}</span>
                </div>
                <div
                  class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${proximity * 100}%`,
                      backgroundColor: proximityColor
                    }"
                  />
                </div>
              </div>

              <div
                class="flex items-center gap-2 rounded-[8px] px-3 py-2 mb-4 font-['Inter'] text-[12px]"
                :class="{
                  'bg-green-500/10 text-green-400': gpsReady,
                  'bg-red-500/10 text-red-400': !!gpsError,
                  'bg-white/5 text-white/40': !gpsReady && !gpsError
                }"
              >
                <span>{{ gpsReady ? '🛰️' : gpsError ? '⚠️' : '⏳' }}</span>
                <span>{{ gpsStatusText }}</span>
              </div>

              <div class="flex items-center justify-between mb-4">
                <span class="font-['Inter'] text-[12px] text-white/40 italic">{{
                  $t('gameWalk')
                }}</span>
                <button
                  class="flex items-center gap-1.5 font-['Inter'] text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  @click="toggleAudio"
                >
                  <span>{{ audioEnabled ? '🔊' : '🔇' }}</span>
                  <span>{{
                    audioEnabled ? $t('gameAudOn') : $t('gameAudOff')
                  }}</span>
                </button>
              </div>

              <button
                class="w-full rounded-[10px] p-3 font-['Inter'] text-[15px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                :class="
                  gpsReady && !checking
                    ? 'bg-[#2071c1] hover:bg-[#1a5b9c] text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                "
                :disabled="!gpsReady || checking"
                @click="checkLocation"
              >
                <span v-if="checking" class="animate-spin inline-block">⟳</span>
                <span v-else>{{ $t('gameImHere') }}</span>
              </button>
            </div>
          </Transition>

          <!-- ═══ RESULT PHASE ═══ -->
          <Transition name="fade">
            <div
              v-if="phase === 'result'"
              class="flex flex-col items-center px-6 pb-8 pt-6 text-center"
            >
              <template v-if="won">
                <div class="text-5xl mb-3">🎉</div>
                <h2
                  class="font-['Playfair_Display'] text-[24px] font-bold text-white mb-2"
                >
                  {{ $t('gameWon') }}
                </h2>
                <p class="font-['Inter'] text-[13px] text-white/60 mb-5">
                  {{ $t('gameDistance') }}
                  <strong class="text-[#2071c1]">{{ distanceFound }}m</strong>.
                </p>
                <div class="w-full flex items-center gap-2 mb-6">
                  <div class="flex-1 text-center">
                    <img
                      v-if="poi.historicalImgUrl"
                      :src="poi.historicalImgUrl"
                      class="w-full h-[100px] object-cover rounded-[10px]"
                      style="filter: sepia(35%)"
                      alt="Storica"
                    />
                    <p
                      class="font-['Inter'] text-[10px] uppercase tracking-[0.08em] text-white/40 mt-1.5"
                    >
                      {{ $t('gameThen') }}
                    </p>
                  </div>
                  <span class="text-[#2071c1] text-xl flex-shrink-0">↔</span>
                  <div class="flex-1 text-center">
                    <img
                      v-if="poi.modernImgUrl"
                      :src="poi.modernImgUrl"
                      class="w-full h-[100px] object-cover rounded-[10px]"
                      alt="Oggi"
                    />
                    <p
                      class="font-['Inter'] text-[10px] uppercase tracking-[0.08em] text-white/40 mt-1.5"
                    >
                      {{ $t('gameToday') }}
                    </p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-5xl mb-3">😕</div>
                <h2
                  class="font-['Playfair_Display'] text-[24px] font-bold text-white mb-2"
                >
                  {{ $t('gameLost') }}
                </h2>
                <p class="font-['Inter'] text-[13px] text-white/60 mb-6">
                  {{ $t('gameDistance') }}
                  <strong class="text-[#2071c1]">{{ distanceFound }}m</strong>.
                </p>
              </template>
              <div class="flex gap-3 w-full">
                <button
                  v-if="!won"
                  class="flex-1 cursor-pointer rounded-[10px] bg-[#2071c1] hover:bg-[#1a5b9c] transition-colors p-3 font-['Inter'] text-[14px] font-medium text-white"
                  @click="resetGame"
                >
                  {{ $t('gameRetry') }}
                </button>
                <button
                  class="flex-1 cursor-pointer rounded-[10px] bg-white/8 hover:bg-white/15 transition-colors p-3 font-['Inter'] text-[14px] font-medium text-white"
                  @click="emit('close')"
                >
                  {{ $t('gameClose') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

interface Poi {
  title_it?: string
  title_en?: string
  title?: string
  lat: number
  lng: number
  historicalImgUrl?: string
  modernImgUrl?: string
}

const props = defineProps<{ poi: Poi }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const TUTORIAL_STORAGE_KEY = 'photoGame_tutorialSeen'

const poiTitle = computed(
  () => props.poi[`title_${locale.value}` as keyof Poi] || props.poi.title || ''
)

type Phase = 'rules' | 'game' | 'result'
const phase = ref<Phase>('rules')
const won = ref(false)
const distanceFound = ref(0)
const checking = ref(false)

const DELTA_METERS = 30
const MAX_DISTANCE = 300

// ─── Onboarding swipe ────────────────────────────────────────────────────────

const slideIndex = ref(0)
const sliderRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragOffset = ref(0)

let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | null = null
let dragLocked = false

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  pointerStartX = e.clientX
  pointerStartY = e.clientY
  isDragging.value = true
  dragOffset.value = 0
  dragLocked = false
  pointerId = e.pointerId
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || e.pointerId !== pointerId) return
  const dx = e.clientX - pointerStartX
  const dy = e.clientY - pointerStartY
  if (!dragLocked) {
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
      dragLocked = true
      isDragging.value = false
      dragOffset.value = 0
      return
    }
    if (Math.abs(dx) > 6) dragLocked = true
  }
  if (dragLocked && Math.abs(dx) >= Math.abs(dy)) {
    e.preventDefault()
    const atStart = slideIndex.value === 0 && dx > 0
    const atEnd =
      slideIndex.value === onboardingSlides.value.length - 1 && dx < 0
    dragOffset.value = atStart || atEnd ? dx * 0.25 : dx
  }
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  const dx = dragOffset.value
  if (Math.abs(dx) > 50) {
    if (dx < 0 && slideIndex.value < onboardingSlides.value.length - 1)
      slideIndex.value++
    else if (dx > 0 && slideIndex.value > 0) slideIndex.value--
  }
  isDragging.value = false
  dragOffset.value = 0
  pointerId = null
  dragLocked = false
}

function onPointerCancel(_e: PointerEvent) {
  isDragging.value = false
  dragOffset.value = 0
  pointerId = null
  dragLocked = false
}

const onboardingSlides = computed(() => [
  {
    bgGradient:
      'linear-gradient(135deg, #0a0818 0%, #1a0d2e 50%, #0f1a2e 100%)',
    title: t('gameRule1Title'),
    desc: t('gameRule1Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #0a1a12 0%, #0f2a1a 50%, #081510 100%)',
    title: t('gameRule2Title'),
    desc: t('gameRule2Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #1a0d0a 0%, #2e1208 50%, #1a0d0a 100%)',
    title: t('gameRule3Title'),
    desc: t('gameRule3Desc')
  },
  {
    bgGradient:
      'linear-gradient(135deg, #0a1020 0%, #0f1a3a 50%, #0a1020 100%)',
    title: t('gameRule4Title'),
    desc: t('gameRule4Desc', { dist: DELTA_METERS })
  }
])

function nextSlide() {
  if (slideIndex.value < onboardingSlides.value.length - 1) {
    slideIndex.value++
  } else {
    finishOnboarding()
  }
}

function finishOnboarding() {
  try {
    sessionStorage.setItem(TUTORIAL_STORAGE_KEY, '1')
  } catch (_) {}
  phase.value = 'game'
}

// ─── GPS ─────────────────────────────────────────────────────────────────────


// ─── GPS (Gestito Globalmente) ───────────────────────────────────────────────
import { useLocationTracker } from '~/composables/useLocationTracker'
import { calculateDistance } from '~/utils/geo' // 1. IMPORTIAMO LA TUA MATEMATICA!

// 2. RINOMINIAMO locationError in gpsError per far felice l'HTML
const { currentCoords, locationError: gpsError } = useLocationTracker() 

const gpsReady = computed(() => currentCoords.value !== null && !gpsError.value)

const distance = computed(() => {
  if (!currentCoords.value) return null
  
  // 3. USIAMO LA TUA UTIL GLOBALE INVECE DELLA VECCHIA FUNZIONE
  return calculateDistance(
    { lat: currentCoords.value.lat, lng: currentCoords.value.lng },
    { lat: props.poi.lat, lng: props.poi.lng }
  )
})

const gpsStatusText = computed(() => {
  if (gpsError.value) return `${t('gpsNotAvail')}: ${gpsError.value.message || 'Errore'}`
  if (gpsReady.value)
    return `GPS (±${currentCoords.value?.accuracy ? Math.round(currentCoords.value.accuracy) + 'm' : '…'})`
  return t('gpsSearching')
})

const proximity = computed(() => {
  if (distance.value === null) return 0
  return Math.max(0, Math.min(1, 1 - distance.value / MAX_DISTANCE))
})

const proximityColor = computed(() => {
  const p = proximity.value
  const r = Math.round(0x20 + (0x22 - 0x20) * p)
  const g = Math.round(0x71 + (0xc5 - 0x71) * p)
  const b = Math.round(0xc1 + (0x5e - 0xc1) * p)
  return `rgb(${r},${g},${b})`
})

const proximityLabel = computed(() => {
  const p = proximity.value
  if (p < 0.2) return t('prox1')
  if (p < 0.5) return t('prox2')
  if (p < 0.8) return t('prox3')
  if (p < 1.0) return t('prox4')
  return t('prox5')
})

const photoFrameStyle = computed(() => {
  const p = proximity.value
  return {
    border: `${Math.round(1 + p * 3)}px solid ${proximityColor.value}`,
    boxShadow:
      p > 0.3 ? `0 0 ${Math.round(p * 24)}px ${proximityColor.value}44` : 'none'
  }
})

// ─── Audio ───────────────────────────────────────────────────────────────────

const audioEnabled = ref(true)
let audioCtx: AudioContext | null = null
let tickInterval: ReturnType<typeof setTimeout> | null = null

function getOrCreateAudioCtx(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTick(p: number) {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 220 + p * 660
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.05 + p * 0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch (_) {}
}

function playSuccessSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t0 = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.15, t0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
      osc.start(t0)
      osc.stop(t0 + 0.3)
    })
  } catch (_) {}
}

function playFailSound() {
  if (!audioEnabled.value) return
  try {
    const ctx = getOrCreateAudioCtx()
    ;[300, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sawtooth'
      const t0 = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0.1, t0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)
      osc.start(t0)
      osc.stop(t0 + 0.25)
    })
  } catch (_) {}
}

function startTicking() {
  stopTicking()
  const tick = () => {
    if (phase.value !== 'game') return
    playTick(proximity.value)
    tickInterval = setTimeout(tick, Math.round(2000 - proximity.value * 1800))
  }
  tickInterval = setTimeout(tick, 1000)
}

function stopTicking() {
  if (tickInterval !== null) {
    clearTimeout(tickInterval)
    tickInterval = null
  }
}

function toggleAudio() {
  audioEnabled.value = !audioEnabled.value
  if (!audioEnabled.value) stopTicking()
  else if (phase.value === 'game' && gpsReady.value) startTicking()
}

watch([() => phase.value, gpsReady], ([p, ready]) => {
  if (p === 'game' && ready) startTicking()
  else stopTicking()
})

// ─── Game logic ───────────────────────────────────────────────────────────────

async function checkLocation() {
  if (!gpsReady.value || distance.value === null) return
  checking.value = true
  stopTicking()
  await new Promise((r) => setTimeout(r, 400))
  distanceFound.value = Math.round(distance.value)
  won.value = distance.value <= DELTA_METERS
  checking.value = false
  phase.value = 'result'
  if (won.value) playSuccessSound()
  else playFailSound()
}

function resetGame() {
  phase.value = 'game'
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  try {
    if (sessionStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      phase.value = 'game'
    }
  } catch (_) {}
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  stopTicking()
  audioCtx?.close()
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* ── Slide 1: schermo con scan line ── */
.phone-frame {
  width: 72px;
  height: 126px;
  border: 2px solid rgba(32, 113, 193, 0.55);
  border-radius: 12px;
  background: rgba(32, 113, 193, 0.07);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.phone-screen {
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.phone-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    160deg,
    rgba(32, 113, 193, 0.25),
    rgba(100, 60, 200, 0.15)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide1-scanline {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(32, 113, 193, 0.85),
    transparent
  );
  animation: scanline 2s ease-in-out infinite;
  top: 0;
}
@keyframes scanline {
  0%,
  100% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  50% {
    top: calc(100% - 2px);
  }
}

/* ── Slide 2: Navigli scene ── */
.navigli-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.nav-star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(200, 240, 220, 0.4);
  animation: nav-twinkle 3s ease-in-out infinite;
}
.nav-star-sm {
  width: 1.5px;
  height: 1.5px;
}
@keyframes nav-twinkle {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.nav-bld {
  position: absolute;
  background: rgba(10, 30, 18, 0.92);
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  border-radius: 2px 2px 0 0;
}
.nav-win {
  position: absolute;
  background: rgba(250, 230, 120, 0.15);
  border-radius: 1px;
}
.nav-win-lit {
  background: rgba(250, 230, 120, 0.5);
  animation: nav-flicker 4s ease-in-out infinite;
}
@keyframes nav-flicker {
  0%,
  100% {
    opacity: 1;
  }
  45% {
    opacity: 0.6;
  }
  47% {
    opacity: 1;
  }
  70% {
    opacity: 0.8;
  }
}

.nav-canal {
  position: absolute;
  bottom: 250px;
  left: 0;
  right: 0;
  height: 58px;
  background: linear-gradient(
    180deg,
    rgba(20, 90, 60, 0.55) 0%,
    rgba(10, 60, 40, 0.75) 100%
  );
  border-top: 1.5px solid rgba(34, 197, 94, 0.18);
}
.nav-canal-shimmer {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 60px,
    rgba(34, 197, 94, 0.07) 60px,
    rgba(34, 197, 94, 0.07) 62px
  );
  animation: nav-shimmer 5s linear infinite;
}
@keyframes nav-shimmer {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 122px;
  }
}

.nav-bridge {
  position: absolute;
  bottom: 248px;
  width: 90px;
  height: 16px;
  border-radius: 8px 8px 0 0;
  background: rgba(15, 50, 28, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.18);
  border-bottom: none;
}
.nav-bridge-arch {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 12px;
  border-radius: 25px 25px 0 0;
  border: 1px solid rgba(34, 197, 94, 0.12);
  border-bottom: none;
}

.nav-path {
  position: absolute;
  bottom: 222px;
  left: 0;
  right: 0;
  height: 28px;
  background: rgba(16, 40, 22, 0.85);
  border-top: 1px solid rgba(34, 197, 94, 0.14);
}
.nav-path-dashes {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1.5px;
  background: repeating-linear-gradient(
    90deg,
    rgba(34, 197, 94, 0.25) 0px,
    rgba(34, 197, 94, 0.25) 14px,
    transparent 14px,
    transparent 28px
  );
  animation: nav-dash-scroll 2.5s linear infinite;
}
@keyframes nav-dash-scroll {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: -28px;
  }
}

.nav-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 222px;
  background: linear-gradient(
    180deg,
    rgba(12, 36, 18, 0.98) 0%,
    rgba(8, 20, 12, 1) 100%
  );
}

.nav-dir-arrow {
  position: absolute;
  bottom: 231px;
  display: flex;
  align-items: center;
  animation: nav-arrow-pulse 2s ease-in-out infinite;
}
@keyframes nav-arrow-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: translateX(0);
  }
  50% {
    opacity: 0.8;
    transform: translateX(4px);
  }
}

.nav-destination {
  position: absolute;
  bottom: 238px;
  right: 90px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.85);
  animation: nav-dest-pulse 1.8s ease-out infinite;
}
@keyframes nav-dest-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}

.nav-character {
  position: absolute;
  bottom: 222px;
  animation: nav-walk-x 14s linear infinite;
}
@keyframes nav-walk-x {
  0% {
    left: -30px;
    opacity: 1;
  }
  82% {
    left: calc(100% - 30px);
    opacity: 1;
  }
  85% {
    left: calc(100% - 30px);
    opacity: 0;
  }
  86% {
    left: -30px;
    opacity: 0;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: -30px;
    opacity: 1;
  }
}
.nav-character-rtl {
  position: absolute;
  bottom: 222px;
  animation: nav-walk-rtl 18s linear infinite;
  animation-delay: -6s;
}
@keyframes nav-walk-rtl {
  0% {
    right: -30px;
    opacity: 1;
  }
  82% {
    right: calc(100% - 30px);
    opacity: 1;
  }
  85% {
    right: calc(100% - 30px);
    opacity: 0;
  }
  86% {
    right: -30px;
    opacity: 0;
  }
  90% {
    opacity: 1;
  }
  100% {
    right: -30px;
    opacity: 1;
  }
}
@keyframes nav-leg-l {
  0%,
  100% {
    transform: rotate(-18deg);
  }
  50% {
    transform: rotate(18deg);
  }
}
@keyframes nav-leg-r {
  0%,
  100% {
    transform: rotate(18deg);
  }
  50% {
    transform: rotate(-18deg);
  }
}
@keyframes nav-arm-l {
  0%,
  100% {
    transform: rotate(20deg);
  }
  50% {
    transform: rotate(-20deg);
  }
}
@keyframes nav-arm-r {
  0%,
  100% {
    transform: rotate(-20deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

.nav-phone-ui {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 126px;
  background: rgba(10, 26, 16, 0.88);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 10px 12px;
}
.nav-phone-label {
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(34, 197, 94, 0.6);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.nav-map-track {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  margin-bottom: 10px;
  overflow: hidden;
}
.nav-map-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(34, 197, 94, 0.7);
  border-radius: 3px;
  animation: nav-track-fill 14s linear infinite;
}
@keyframes nav-track-fill {
  0% {
    width: 0%;
  }
  82% {
    width: 88%;
  }
  85% {
    width: 88%;
  }
  86% {
    width: 0%;
  }
  100% {
    width: 0%;
  }
}
.nav-map-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid rgba(10, 26, 16, 1);
  animation: nav-map-dot-x 14s linear infinite;
  box-shadow: 0 0 5px rgba(34, 197, 94, 0.7);
}
@keyframes nav-map-dot-x {
  0% {
    left: 0%;
  }
  82% {
    left: calc(88% - 5px);
  }
  85% {
    left: calc(88% - 5px);
  }
  86% {
    left: 0%;
  }
  100% {
    left: 0%;
  }
}
.nav-map-dest {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.4);
  border: 1px solid rgba(34, 197, 94, 0.7);
  animation: nav-dest-dot-pulse 1.8s ease-in-out infinite;
}
@keyframes nav-dest-dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
}
.nav-phone-hint {
  display: flex;
  align-items: center;
  gap: 5px;
}
.nav-hint-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: nav-hint-pulse 2s ease-in-out infinite;
}
@keyframes nav-hint-pulse {
  0%,
  100% {
    background: rgba(34, 197, 94, 0.12);
  }
  50% {
    background: rgba(34, 197, 94, 0.28);
  }
}
.nav-hint-text {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: rgba(34, 197, 94, 0.7);
}

/* ── Slide 3: ripple tap ── */
.slide3-ripple {
  animation: ripple-out 1.8s ease-out infinite;
}
.slide3-ripple-delay {
  animation-delay: 0.6s;
}
@keyframes ripple-out {
  0% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
.slide3-tapbtn {
  animation: tap-pulse 1.8s ease-in-out infinite;
}
@keyframes tap-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.92);
    opacity: 0.85;
  }
}

/* ── Slide 4: GPS ring ── */
.slide4-gpsring {
  animation: gps-ring-pulse 1.3s ease-in-out infinite;
}
@keyframes gps-ring-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(34, 197, 94, 0);
  }
}
.slide4-dot {
  animation: mapdot-pulse 1s ease-in-out infinite;
}
@keyframes mapdot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(32, 113, 193, 0.6);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(32, 113, 193, 0);
  }
}

/* ── Shared background glow ── */
.slide-radial-glow {
  position: absolute;
  inset: -40px;
  pointer-events: none;
}

/* ── Vue transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(40px);
  opacity: 0;
}
</style>
