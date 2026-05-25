// server/api/tts.post.ts
export default defineEventHandler(async (event) => {
  const { text } = await readBody(event)
  const apiKey = process.env.ELEVENLABS_API_KEY
  //JkwfwmvGT71qYVCwRCMo id nonna prima che lo cambiassi
  //voce seconda YBrIkf7z6YBcR3bKJphj
  //voce terza marco Z4wnRNjyeMpeZ17tQku2
  const voiceId = 'Z4wnRNjyeMpeZ17tQku2'

  try {
    const response = await $fetch<Blob>(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey || '',
          'Content-Type': 'application/json'
        },
        body: {
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
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
