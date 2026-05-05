import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  // 1. Leggiamo 'messages' (la storia) invece di 'message'
  const { messages, poiId } = await readBody(event)

  let context = ''
  const dataDir = path.resolve(process.cwd(), 'server/data')

  try {
    if (!poiId) throw new Error('No POI ID')
    context = await fs.readFile(path.join(dataDir, `${poiId}.md`), 'utf-8')
  } catch (err) {
    try {
      context = await fs.readFile(
        path.join(dataDir, `navigli-generale.md`),
        'utf-8'
      )
    } catch {
      context =
        "I Navigli erano il cuore di Milano, canali d'acqua dove passavano i marmi per il Duomo."
    }
  }

  // 2. Costruiamo l'array di messaggi per Groq
  // Mettiamo il System Message in cima, poi "spalmiamo" tutta la storia della chat
  const groqMessages = [
    {
      role: 'system',
      content: `Sei la Nonna Rosa, un'anziana milanese esperta della storia dell'acqua a Milano.
      
      REGOLE DI COMPORTAMENTO:
      - Rispondi SOLO a domande su: Milano antica, i Navigli, e questo contesto: ${context}.
      - Se l'utente ti chiede cose fuori tema, rispondi con dolcezza che la tua memoria si ferma ai canali.
      - Sii brevissima (max 15-20 parole), usa "fiulin" o "tesoro" e un tono nostalgico.
      - Non uscire MAI dal personaggio.
      - Non inserire riferimenti a movimenti o gesti facciali (ad esempio non dire che la nonna sorride o che punta il dito)`
    },
    ...messages // Questo inserisce tutti i messaggi passati dal frontend ({role, content})
  ]

  return await $fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      model: 'llama-3.1-8b-instant',
      messages: groqMessages, // Inviamo la conversazione completa
      temperature: 0.5
    }
  })
})
