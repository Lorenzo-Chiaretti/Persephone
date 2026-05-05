// server/api/tts.post.ts
export default defineEventHandler(async (event) => {
  const { text } = await readBody(event)
  const apiKey = process.env.ELEVENLABS_API_KEY

  // ID VOCE CONSIGLIATO per una nonna:
  // Prova 'XB0fDUndgU76y8Z455XU' (Alice) o cercala nella Library
  const voiceId = 'JkwfwmvGT71qYVCwRCMo'

  try {
    const response = await $fetch<Blob>(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey || '',
          'Content-Type': 'application/json'
        },
        body: {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6, // Più è alto, più la voce è stabile (meno emotiva)
            similarity_boost: 0.75
          }
        },
        responseType: 'blob'
      }
    )

    return response
  } catch (error: any) {
  // Leggiamo il contenuto del Blob di errore
  const errorText = await error.data?.text()
  console.error('ERRORE REALE ELEVENLABS:', errorText)

  throw createError({
    statusCode: 500,
    statusMessage: `ElevenLabs Error: ${errorText}`
  })
}
})
