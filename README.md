# Persephonē

**Persephonē** is a mobile-first WebAR experience that brings Milan's vanished **Navigli** canals back to life. Walk to a real-world location, point your phone at the ground, and watch the water — long since paved over — flow again in augmented reality. Along the way, you can talk with **la Sciura**, an AI-voiced old Milanese lady who remembers the canals as they used to be.

No app store download required: it runs straight from the browser.

## ✨ Features

- **GPS-driven points of interest** — the app tracks your location and automatically detects when you're near a historical site (e.g. Via Senato, Laghetto di San Marco, Laghetto di Santo Stefano).
- **WebAR reconstructions** — 3D models of the historical canals are placed in the real world using 8th Wall + A-Frame, viewed straight from the phone's camera.
- **La Sciura, your AI guide** — a voice-driven conversational character, powered by:
  - **Deepgram** for real-time speech-to-text
  - **Groq** (Llama 3.1) for generating in-character, historically grounded answers
  - **ElevenLabs** for expressive text-to-speech
- **Interactive map** — a Mapbox-powered overview of nearby points of interest.
- **Before/after comparison** — an image slider showing each location then vs. now.
- **Mini photo game** and **history modal** for extra context and engagement.
- **Bilingual** — full Italian and English support via `@nuxtjs/i18n`.
- Manual POI selection as a fallback when GPS isn't precise enough (e.g. indoors).

## 🛠️ Tech stack

- [Nuxt 4](https://nuxt.com/) / Vue 3
- [Pinia](https://pinia.vuejs.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Mapbox GL](https://www.mapbox.com/) for maps
- [8th Wall](https://www.8thwall.com/) + [A-Frame](https://aframe.io/) for WebAR
- [Deepgram](https://deepgram.com/) (speech-to-text), [Groq](https://groq.com/) (LLM), [ElevenLabs](https://elevenlabs.io/) (text-to-speech)
- [nuxt-security](https://nuxt-security.vercel.app/) for CSP/security headers

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- npm (or your package manager of choice)
- API keys for Deepgram, Groq, ElevenLabs and Mapbox

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```bash
# Server-side keys
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Public keys (exposed to the client)
MAPBOX_KEY=your_mapbox_key
GOOGLE_GEOSPATIAL_KEY=your_google_geospatial_key
```

### Development server

Start the dev server on `http://localhost:3000`:

```bash
npm run dev
```

> AR features require camera, microphone, and geolocation permissions, and generally need to be tested on a physical mobile device (e.g. via a tunneling tool like ngrok, already whitelisted in `nuxt.config.ts`).

### Production

Build and preview the production output:

```bash
npm run build
npm run preview
```

## 📁 Project structure

```
app/
  components/     # UI, AR overlay, map, modals, mini-game
  composables/     # GPS tracking logic
  stores/          # Pinia stores (app + AR state)
  utils/           # AI companion logic (voice, chat, TTS)
i18n/locales/      # IT/EN translations
server/
  api/             # Chat (Groq), TTS (ElevenLabs), Deepgram token, POI data
  data/            # Historical context fed to the AI as source of truth
public/
  models/          # 3D assets (.glb) for the AR scenes
  ar-scene.html    # 8th Wall / A-Frame AR scene
```

## 📚 Project background & research

This started as an HCI/UX design project. The full writeup and slides live in [`Deliverables/`](./Deliverables):

- [`Persephone_Final.pdf`](./Deliverables/Persephone_Final.pdf) — final report: concept, architecture, sequence diagrams for all four core tasks, heuristic evaluation, and revisions.
- [`Persephone_presentation.pptx`](./Deliverables/Persephone_presentation.pptx) — presentation deck, including the user testing report.

**Rationale.** Milan's Navigli canals were progressively paved over during the 20th century, despite 94% of Milanese voting in favour of reopening them in a 2011 referendum. The project is named after Persephone, who moves between the surface and the underworld — framing the app not as a reconstruction, but as *revealing what's already there, just unseen*.

**Core tasks (persona-driven).** The design follows a single scenario — Narciso, a student, moving from remote discovery at home → on-site AR re-emergence → voice dialogue with the Sciura → gamified photo hunt:

1. **Remote Discovery** — map + past/present slider + directions (touch + GPS).
2. **Photo Game** — GPS "hot-and-cold" hunt with acoustic (Web Audio) Geiger-counter feedback, unlocking a historical photo gallery.
3. **AR Re-emergence** — 8th Wall SLAM anchors a 3D canal model to the pavement; the voice command *"Bring the water back!"* triggers the water shader.
4. **Conversational Sciura** — hands-free voice dialogue once the user is near the model (STT → LLM → TTS loop described above).

**Heuristic evaluation.** An expert pass against Nielsen's 10 heuristics (adapted for multimodal interaction) surfaced 14 findings across the four tasks — e.g. missing SLAM scanning feedback, no in-AR re-anchoring, follow-up questions being misread as implicit "yes". Eight of these were addressed in two revision rounds (in-AR re-anchor, speech echo of recognized transcripts, interruptible Sciura playback, localized GPS warning banner, etc.).

**User testing.** With 9 participants: **SUS score of 72.78/100** (above the 68 "average" benchmark) and **97% task completion**. Task 4 (Conversational Sciura) was the most appreciated (SEQ 6/7); Task 1 (Remote Discovery) was the main friction point (SEQ 5.44/7), mostly due to the lack of a search bar and unclear self-discovery flow. Recurring next steps identified: add POI search, improve voice-recognition tolerance/feedback, reduce redundant navigation to launch AR, and expand the POI set beyond the current three locations.

## 📄 License

No license has been specified for this project yet.
