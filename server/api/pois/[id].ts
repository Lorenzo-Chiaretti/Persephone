import { defineEventHandler, getRouterParam, createError } from 'h3'
// 1. IL TRUCCO MAGICO: Importi direttamente il JSON!
// Il simbolo "~" dice a Nuxt di partire dalla radice del progetto.
import allPois from '~~/public/data/pois.json'

export default defineEventHandler((event) => {
  // 2. Estrai l'ID dall'URL
  const id = getRouterParam(event, 'id')

  // 3. allPois è GIÀ un array JavaScript pronto all'uso! 
  // Non serve nessun try/catch, nessun fs.readFileSync e nessun JSON.parse
  const selectedPoi = allPois.find((poi: any) => poi.id === id)

  // 4. Se non lo trovi, restituisci l'errore 404
  if (!selectedPoi) {
    throw createError({
      statusCode: 404,
      statusMessage: `POI not found with ID: ${id}`
    })
  }

  // 5. Restituisci i dati
  return selectedPoi
})