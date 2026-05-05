// server/api/dg-token.get.ts

export default defineEventHandler(async (event): Promise<{ token: string }> => {
  const config = useRuntimeConfig()
  const apiKey = config.deepgramApiKey

  // Se la chiave non c'è nel .env, diamo errore
  if (!apiKey) {
    console.error('❌ Errore: DEEPGRAM_API_KEY non trovata nel file .env')
    throw createError({
      statusCode: 500,
      statusMessage: 'API Key mancante lato server'
    })
  }

  // Semplice e diretto: passiamo la chiave al frontend.
  // Questo evita il 403 Forbidden perché non stiamo creando nulla,
  // stiamo solo usando la chiave che hai già.
  return { token: apiKey }
})
