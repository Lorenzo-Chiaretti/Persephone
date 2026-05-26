// test-nonna.mjs
const PORT = 3000 // Cambia in 3001 se il tuo Nuxt gira lì

async function testIntegrazione() {
  console.log('🚀 Avvio test integrazione Sciura...')

  try {
    // STEP 1: Chiamata a Groq tramite la tua API Nuxt
    console.log('1. Interrogazione a Groq (tramite /api/chat)...')
    const chatResponse = await fetch(`http://localhost:${PORT}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message:
          'Quanto era grande?',
        poiId: 'laghetto-san-marco'
      })
    })

    const chatData = await chatResponse.json()

    if (!chatData.answer) {
      throw new Error(
        'Groq non ha risposto correttamente: ' + JSON.stringify(chatData)
      )
    }

    console.log('✅ Groq ha risposto:', chatData.answer)

    // STEP 2: Chiamata a ElevenLabs tramite la tua API Nuxt
    console.log('2. Conversione in audio (tramite /api/tts)...')
    const ttsResponse = await fetch(`http://localhost:${PORT}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chatData.answer })
    })

    if (!ttsResponse.ok) {
      const err = await ttsResponse.text()
      throw new Error('ElevenLabs ha dato errore: ' + err)
    }

    // STEP 3: Salvataggio del file MP3
    const arrayBuffer = await ttsResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Usiamo il modulo fs di Node per salvare il file
    const fs = await import('fs')
    fs.writeFileSync('risultato_sciura.mp3', buffer)

    console.log(
      "✅ SUCCESSOTESORO! Il file 'risultato_sciura.mp3' è stato creato."
    )
    console.log('Ascoltalo per sentire se la Sciura ha seguito le istruzioni.')
  } catch (error) {
    console.error('❌ TEST FALLITO:', error.message)
  }
}

testIntegrazione()
