export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      meta: [
        { name: 'apple-mobile-web-app-title', content: 'Persephonē' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png?v=v2', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=v2' },
        { rel: 'shortcut icon', href: '/favicon.ico?v=v2' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=v2' },
        { rel: 'manifest', href: '/site.webmanifest?v=v2' },
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
        'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https:'],
        'connect-src': [
          "'self'",
          'data:',
          'blob:',
          'https://api.deepgram.com',
          'wss://api.deepgram.com',
          'https://api.groq.com',
          'https://api.elevenlabs.io',
          'https://*.mapbox.com', // Sblocca Mapbox
          'https://cdn.jsdelivr.net' // Sblocca Eruda e altri script
        ],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://*.mapbox.com',
          'https://cdn.jsdelivr.net'
        ], // Necessario per le mappe
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
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('a-')
    }
  },
  vite: {
    server: {
      allowedHosts: true // <-- Accetta qualsiasi dominio (perfetto per ngrok)
    }
  }
})
