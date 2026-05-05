export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap'
        }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-security',
    '@nuxtjs/i18n'
  ],

  // --- CONFIGURAZIONE SICUREZZA ---
  security: {
    rateLimiter: {
      tokensPerInterval: 50,
      interval: 'minute'
    },
    headers: {
      contentSecurityPolicy: {
        'connect-src': [
          "'self'",
          'https://api.deepgram.com',
          'wss://api.deepgram.com',
          'https://api.groq.com',
          'https://api.elevenlabs.io',
          'https://*.mapbox.com', // Sblocca Mapbox
          'https://cdn.jsdelivr.net' // Sblocca Eruda e altri script
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'https://*.mapbox.com'], // Necessario per le mappe
        'worker-src': ["'self'", 'blob:'], // Necessario per Mapbox
        'upgrade-insecure-requests': true
      },
      permissionsPolicy: {
        camera: 'self',
        geolocation: 'self',
        microphone: 'self'
      },
      crossOriginEmbedderPolicy: 'unsafe-none'
    }
  },

  // --- VARIABILI D'AMBIENTE ---
  runtimeConfig: {
    // Chiave privata (lato server)
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,

    // Chiavi pubbliche (lato client)
    public: {
      mapboxKey: process.env.MAPBOX_KEY || '',
      googleGeospatialKey: process.env.GOOGLE_GEOSPATIAL_KEY || ''
    }
  },
  i18n: {
    locales: [
      { code: 'it', file: 'it.json', name: 'Italiano' },
      { code: 'en', file: 'en.json', name: 'English' }
    ],
    langDir: 'locales/', // <-- AGGIUNTO "app/" QUI
    defaultLocale: 'it',
    strategy: 'no_prefix'
  }
})
