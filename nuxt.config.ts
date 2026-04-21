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
  modules :[
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    'nuxt-security'
  ],  

  security: {
    rateLimiter:{
      tokensPerInterval: 10, 
      interval: 'minute'
    }, 
    headers: {
      permissionsPolicy: {
        camera: ["'self'"],        // Sblocca la fotocamera per il tuo sito
        geolocation: ["'self'"]    // Sblocca il GPS per il tuo sito
      }
    }
  },  

  runtimeConfig: {
    //Public Keys
    public: {
      mapboxKey: '',
      googleGeospatialKey: '' 
    }
  }
})
