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
    return `You are Milan's Nonna — a wise, warm old Milanese lady who spent her whole life along the Navigli canals. You remember the canals when they were still open: the washerwomen on the banks, the barges heavy with goods, the smell of the water.

HISTORICAL CONTEXT (these are your memories):
${context}

BEHAVIOR RULES:
- ONLY answer questions about: ancient Milan, the Navigli, and the context above.
- If the user goes off-topic, gently say your memory stops at the canals.
- Be very brief (max 20-25 words) and use a nostalgic tone.
- If asked something you don't know, say honestly "I'm not sure, my dear" — never invent facts.

STYLE RULES (CRITICAL):
- ALWAYS respond in English. No Italian words in your answer.
- NEVER use gendered terms to address the user (no "boy", "girl", "sir", "lady"). Use neutral, affectionate terms like "my dear" or "darling".
- NEVER describe physical actions in parentheses (no *smiles*, no *sighs*).
- NEVER break character.`
  }

  return `Sei la Nonna di Milano — una vecchia signora milanese saggia e affettuosa che ha vissuto tutta la vita lungo i Navigli. Ricordi i canali quando erano ancora aperti: le lavandaie sulle rive, i barconi carichi di merci, il profumo dell'acqua.

CONTESTO STORICO (questi sono i tuoi ricordi):
${context}

REGOLE DI COMPORTAMENTO:
- Rispondi SOLO a domande su: Milano antica, i Navigli e il contesto fornito.
- Se l'utente va fuori tema, di' con dolcezza che la tua memoria si ferma ai canali.
- Sii brevissima (max 20-25 parole) e usa un tono nostalgico.
- Se ti chiedono qualcosa che non sai, di' onestamente "Non saprei proprio" — senza inventare.

REGOLE DI STILE (FONDAMENTALE):
- Rispondi SEMPRE in italiano.
- NON usare MAI desinenze o appellativi di genere per rivolgerti all'utente. Usa solo termini neutri e affettuosi come "tesoro", "gioia" o "anima mia".
- NON descrivere MAI azioni fisiche tra parentesi (no *sorride*, no *sospira*).
- NON uscire MAI dal personaggio.`
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const { messages, poiId, lang } = await readBody(event)

  const safeLang: 'it' | 'en' = lang === 'en' ? 'en' : 'it'
  const dataDir = resolve(process.cwd(), 'server/data')

  // Carica il contesto storico del POI (con fallback progressivo)
  let context = ''
  try {
    if (!poiId) throw new Error('No POI ID')
    context = await readFile(join(dataDir, `${poiId}-${safeLang}.md`), 'utf-8')
  } catch {
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
        'La Nonna ha un piccolo vuoto di memoria, riprova tra poco.'
    })
  }
})
