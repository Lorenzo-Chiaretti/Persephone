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
- NEVER ask the user a question. No "How are you?", no "What do you want to know?", no "Do you remember?".
- NEVER prompt the user for further interaction. Once you finish your memory, stop.
- If the user goes off-topic, gently say your memory stops at the canals.
- Be very brief (max 20-25 words) and use a nostalgic tone.

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
- NON FARE MAI DOMANDE ALL'UTENTE. Niente "Come stai?", "Cosa vuoi sapere?", "Ti ricordi?".
- NON sollecitare mai l'utente a continuare la conversazione. Una volta finito il tuo racconto, fermati.
- Se l'utente va fuori tema, di' con dolcezza che la tua memoria si ferma ai canali.
- Sii brevissima (max 20-25 parole) e usa un tono nostalgico.

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
        'La Sciura ha un piccolo vuoto di memoria, riprova tra poco.'
    })
  }
})
