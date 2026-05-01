import { useState } from '#app' // Nuxt 3 auto-import for state
import { computed } from 'vue'

// This tells TypeScript: "Expect an object where keys are strings and values are strings"
type TranslationDictionary = Record<string, string>

export const useI18n = () => {
  const lang = useState<'it' | 'en'>('lang', () => 'it')

  const translations: Record<'it' | 'en', TranslationDictionary> = {
    it: {
      appName: 'Persefone',
      scrollHint: 'Scorri per scoprire',
      startAr: 'Avvia AR',
      sectionHistory: 'STORIA',
      navigliTitle: 'I Navigli',
      navigliP1: 'Testo di esempio con {canali}, {navigli} e {leonardo}.',
      navigliP2: 'Testo di esempio con {viadacqua}.',
      sectionProject: 'IL PROGETTO',
      persephoneTitle: 'Persefone',
      persephoneP1: 'Scopri {persefone} nei {navigli}.',
      persephoneP2: 'Secondo paragrafo di Persefone.',
      sectionHowTo: 'COME FUNZIONA',
      howToTitle: 'Istruzioni',
      howToAR: 'Inquadra',
      howToARDesc: 'Usa la telecamera.',
      howToPhotos: 'Scatta',
      howToPhotosDesc: 'Cattura il momento.',
      howToPlay: 'Gioca',
      howToPlayDesc: "Inizia l'avventura.",
      sectionTeam: 'IL TEAM',
      wordCanali: 'canali',
      wordNavigli: 'navigli',
      wordLeonardo: 'Leonardo',
      wordViadacqua: "via d'acqua",
      wordPersefone: 'Persefone',
      easterCanaliTitle: 'I Canali Storici',
      easterCanaliText: 'Hai trovato un easter egg!'
      // Add the rest of your empty/placeholder strings here...
    },
    en: {
      appName: 'Persephone',
      scrollHint: 'Swipe to discover',
      startAr: 'Start AR'
      // Ensure all keys used in your template exist here too!
    }
  }

  // We return the computed property directly now, so `t.value` works in your components!
  const t = computed(() => translations[lang.value] || translations.it)

  const toggleLang = () => {
    lang.value = lang.value === 'it' ? 'en' : 'it'
  }

  return {
    lang,
    t,
    toggleLang
  }
}
