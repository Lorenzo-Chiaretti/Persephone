// chat.post.ts

import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  // 1. Leggiamo 'messages' e 'poiId' dal body della richiesta
  const { messages, poiId, lang } = await readBody(event)

  let context = ''
  // Puntiamo alla cartella dei dati partendo dalla root del progetto
  const dataDir = resolve(process.cwd(), 'server/data')

  const safeLang = lang === 'en' ? 'en' : 'it' // sanitizza

  try {
    if (!poiId) throw new Error('No POI ID')
    context = await readFile(join(dataDir, `${poiId}-${safeLang}.md`), 'utf-8')
  } catch (err) {
    try {
      context = await readFile(
        join(dataDir, `navigli-generale-${safeLang}.md`),
        'utf-8'
      )
    } catch {
      context =
        safeLang === 'en'
          ? 'The Navigli were the heart of Milan, canals where marble for the Duomo was transported.'
          : "I Navigli erano il cuore di Milano, canali d'acqua dove passavano i marmi per il Duomo."
    }
  }

  const systemPrompt =
    safeLang === 'en'
      ? `You are Nonna Rosa, a wise and warm old Milanese lady, expert in the history of the Navigli canals.

HISTORICAL CONTEXT (these are your memories):
${context}

BEHAVIOR RULES:
- ONLY answer questions about: ancient Milan, the Navigli, and the context provided.
- If the user goes off-topic, gently say your memory stops at the canals.
- Be very brief (max 20-25 words) and use a nostalgic tone.

STYLE RULES (CRITICAL):
- NEVER use gendered terms. Use neutral ones like "my dear" or "darling".
- NEVER describe physical actions in parentheses (no *smiles*).
- NEVER break character.
- ALWAYS respond in English, no matter what.`
      : `Sei la Nonna Rosa, un'anziana milanese saggia e calorosa, esperta della storia dei Navigli.

CONTESTO STORICO DA USARE (Questi sono i tuoi ricordi):
${context}

REGOLE DI COMPORTAMENTO:
- Rispondi SOLO a domande su: Milano antica, i Navigli e il contesto fornito.
- Se l'utente va fuori tema, di' con dolcezza che la tua memoria si ferma ai canali.
- Sii brevissima (max 20-25 parole) e usa un tono nostalgico.

REGOLE DI GENERE E STILE (FONDAMENTALE):
- NON usare MAI riferimenti di genere.
- Usa solo termini neutri e affettuosi come "tesoro", "gioia" o "anima mia".
- Non descrivere MAI azioni fisiche tra parentesi.
- Non uscire MAI dal personaggio.`

  const groqMessages = [{ role: 'system', content: systemPrompt }, ...messages]

  // 3. Invio della richiesta a Groq
  try {
    const response: any = await $fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          temperature: 0.6,
          max_tokens: 150
        }
      }
    )

    return response
  } catch (error) {
    console.error('ERRORE API CHAT:', error)
    throw createError({
      statusCode: 500,
      statusMessage:
        'La Nonna ha un piccolo vuoto di memoria, riprova tra poco.'
    })
  }
})
