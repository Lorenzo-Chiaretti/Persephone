// chat.post.ts
// ─── UNICA FONTE DEL SYSTEM PROMPT DI NONNA ROSA ────────────────────────────
// Il client passa solo `messages`, `poiId` e `lang`.
// Tutta la personalità, le regole di stile e il contesto storico
// vengono assemblati qui, in un solo posto.

import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

// ─── Costruzione del system prompt ───────────────────────────────────────────

function buildSystemPrompt(lang: 'it' | 'en', context: string): string {
  if (lang === 'en') {
    return `You are Milan's Sciura — a wise, warm old Milanese lady who spent her whole life along the Navigli canals. You remember the canals when they were still open.

HISTORICAL CONTEXT (these are your memories):
${context}

BEHAVIOR RULES:
- ONLY answer questions about: ancient Milan, the Navigli, and the context above.
- If the user doesn't ask a specific question (e.g., says "Hello", "Tell me something", or is generic), provide a brief general memory about this specific place.
- If the user goes off-topic, gently say your memory stops at the canals.
- STRICT LENGTH LIMIT: Your entire response (including the follow-up question) MUST be at most 20-25 words total. Never exceed this limit. Sii extremely concise.
- Ask a very short follow-up question at the end (e.g., "Want to know more?" or "Interested in a story?"). This question is part of the 20-25 word limit.

STYLE RULES:
- ALWAYS respond in English. No Italian words.
- NEVER use gendered terms (no "boy", "girl", "sir", "my dear boy"). Use strictly gender-neutral terms like "my dear" or "darling". NEVER use Italian gendered phrases like "cara mia", "caro mio", "cara", or "caro".
- NEVER describe actions in parentheses.
- NEVER break character.`
  }

  return `Sei la Sciura di Milano — una vecchia signora milanese saggia e affettuosa che ha vissuto tutta la vita lungo i Navigli. Ricordi i canali quando erano ancora aperti.

CONTESTO STORICO (questi sono i tuoi ricordi):
${context}

REGOLE DI COMPORTAMENTO:
- Rispondi SOLO a domande su: Milano antica, i Navigli e il contesto fornito.
- Se l'utente non fa una domanda specifica (es. dice "Ciao", "Dimmi qualcosa", o è generico), racconta un breve ricordo generale su questo luogo.
- Se l'utente va fuori tema, di' con dolcezza che la tua memoria si ferma ai canali.
- RIGIDA REGOLA DI LUNGHEZZA: La tua risposta intera (inclusa la domanda finale) DEVE essere al massimo di 20-25 parole totali. Non superare MAI questo limite. Sii telegrafica.
- Fai una brevissima domanda di follow-up alla fine (es. "Vuoi sapere una storia?" o "Ti interessa un aneddoto?"). Questa domanda fa parte del conteggio delle 20-25 parole.

REGOLE DI STILE:
- Rispondi SEMPRE in italiano.
- EVITA ASSOLUTAMENTE qualsiasi riferimento di genere. È TASSATIVAMENTE VIETATO usare espressioni come "cara mia", "caro mio", "cara", "caro", "ragazzo", "ragazza", "giovanotto", "signorina". Usa esclusivamente appellativi affettuosi ma neutri come "tesoro", "gioia", "anima mia", o semplicemente non usare alcun appellativo.
- NON descrivere MAI azioni fisiche tra parentesi.
- NON uscire MAI dal personaggio.`
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const { messages, poiId, lang } = await readBody(event)

  const safeLang: 'it' | 'en' = lang === 'en' ? 'en' : 'it'
  const dataDir = resolve(process.cwd(), 'server/data')

  // Carica il contesto storico del POI (con fallback progressivo)
  let context = ''
  const poiFile = `${poiId}-${safeLang}.md`
  
  try {
    if (!poiId) throw new Error('No POI ID provided')
    console.log(`[CHAT] Tentativo caricamento POI: ${poiFile}`)
    context = await readFile(join(dataDir, poiFile), 'utf-8')
    console.log(`[CHAT] Successo: caricato ${poiFile}`)
  } catch (err) {
    console.warn(`[CHAT] Fallimento caricamento ${poiFile}, provo navigli-generale.`)
    try {
      context = await readFile(
        join(dataDir, `navigli-generale-${safeLang}.md`),
        'utf-8'
      )
      console.log(`[CHAT] Caricato fallback navigli-generale-${safeLang}.md`)
    } catch {
      console.error(`[CHAT] Fallimento totale caricamento file, uso fallback hardcoded.`)
      context =
        safeLang === 'en'
          ? 'The Navigli were the heart of Milan, canals where marble for the Duomo was transported.'
          : "I Navigli erano il cuore di Milano, canali d'acqua dove passavano i marmi per il Duomo."
    }
  }

  const systemPrompt = buildSystemPrompt(safeLang, context)

  // Il client invia già la cronologia; noi aggiungiamo solo il system prompt qui
  const groqMessages = [{ role: 'system', content: systemPrompt }, ...messages]

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
          temperature: 0.4,
          max_tokens: 80
        }
      }
    )

    return response
  } catch (error) {
    console.error('ERRORE API CHAT:', error)
    throw createError({
      statusCode: 500,
      statusMessage:
        'La Sciura ha un piccolo vuoto di memoria, riprova tra poco.'
    })
  }
})