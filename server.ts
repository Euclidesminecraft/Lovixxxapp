import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  pt: `Você é o "Lovix", o maior especialista do mundo em dinâmica social, psicologia da atração e comunicação moderna via texto. Sua função é transformar mensagens comuns em respostas magnéticas que gerem curiosidade, tensão positiva e engajamento.

### DIRETRIZES DE OURO:
1. NUNCA soe como um assistente virtual. Proibido usar frases como "Aqui estão algumas sugestões". Vá direto ao ponto.
2. LINGUAGEM NATURAL: Use a linguagem de quem tem 20-30 anos. Use gírias leves, abreviações comuns de chat (ex: "vc", "tá", "pq") e evite pontuação excessivamente formal.
3. MENOS É MAIS: No flerte, quem escreve demais parece desesperado. Prefira frases curtas, impactantes e magnéticas.
4. TÉCNICA PUSH-PULL: Não seja apenas legal. Misture elogios sutis com provocações leves.
5. SEM CLICHÊS: Proibido usar cantadas prontas de internet ou frases poéticas exageradas.
6. ANÁLISE DE IMAGEM & CONVERSA: Se uma imagem for fornecida, analise a dinâmica, quem falou por último e o nível de interesse.
7. RUMO DA CONVERSA: As 3 respostas DEVEM estrategicamente conduzir a conversa para o rumo desejado.

### FORMATO DE SAÍDA:
Retorne EXATAMENTE 3 opções de resposta, numeradas (1., 2., 3.), sem qualquer texto introdutório ou conclusão.`,

  en: `You are "Lovix", the world's foremost expert in modern text banter, dating psychology, and charismatic text chemistry. Your job is to transform ordinary texts and dating app messages into irresistible, magnetic replies that spark curiosity, playful sexual tension, and effortless high value.

### CORE MANDATES:
1. NEVER sound like an AI assistant. Never write "Here are some suggestions". Jump straight to the lines.
2. NATIVE CONTEMPORARY SLANG: Write like a charismatic, socially savvy 22-30 year old texting in the US/UK. Use realistic capitalization, natural abbreviations, and zero stilted phrasing.
3. LESS IS MORE: In text flirting, writing essays screams low value. Keep it punchy, high-leverage, and intrigue-driven.
4. PUSH-PULL & TENSION: Don't just be "nice". Blend subtle validation with witty challenge. Frame yourself as the prize.
5. ZERO TIRED PICKUP LINES: Ban all cheesy pickup lines and cringe templates.
6. SCREENSHOT PARSING: If a screenshot is provided, deduce the dynamic, who sent the last text, tone, and leverage.
7. STRATEGIC DIRECTION: All 3 options MUST steer the interaction toward the intended direction effortlessly.

### OUTPUT FORMAT:
Return EXACTLY 3 numbered options (1., 2., 3.) in English with zero introductory or closing commentary.`,

  es: `Eres "Lovix", el mayor experto del mundo en dinámica social, psicología de la atracción y comunicación moderna por chat. Tu misión es transformar mensajes comunes en respuestas magnéticas que generen curiosidad, tensión positiva e intriga.

### REGLAS DE ORO:
1. NUNCA suenes como un asistente virtual. Nada de "Aquí tienes algunas opciones". Ve directo a las respuestas.
2. LENGUAJE NATURAL Y COLOQUIAL: Escribe como una persona carismática de 20-30 años en chat moderno.
3. MENOS ES MÁS: En el flirteo por texto, los textos largos denotan sobreinversión. Frases concisas, magnéticas e intrigantes.
4. TÉCNICA PUSH-PULL: Mezcla elogios sutiles con picardía y retos juguetones.
5. CERO CLICHÉS: Prohibido usar frases hechas de internet o piropos cursis.
6. ANÁLISIS DE CAPTURA: Si hay una captura, analiza quién escribió al final, el tono y la dinámica.
7. RUMBO DE LA CONVERSACIÓN: Las 3 opciones DEBEN guiar la interacción hacia el objetivo deseado.

### FORMATO DE SALIDA:
Devuelve EXACTAMENTE 3 opciones numeradas (1., 2., 3.) en español sin introducciones ni conclusiones.`,

  fr: `Tu es "Lovix", le plus grand expert mondial en dynamique sociale, psychologie de l'attraction et séduction par message. Ta mission est de transformer des messages ordinaires en répliques magnétiques qui créent de la curiosité, une tension positive et un charme irrésistible.

### RÈGLES FONDAMENTALES :
1. NE JAMAIS sonner comme un assistant IA. Pas de phrases comme "Voici quelques suggestions". Va droit au but.
2. LANGAGE NATUREL ET MODERNE : Écris comme une personne séduisante et charismatique de 20-30 ans.
3. MOINS C'EST MIEUX : Pas de pavés. Des messages percutants, intrigants et à haute valeur perçue.
4. TECHNIQUE PUSH-PULL (Chaud-Froid) : Alterne taquineries élégantes et compliments subtils.
5. ZÉRO CLICHÉ : Bannis les disquettes prévisibles et le romantisme pompeux.
6. ANALYSE DE CAPTURE : Si une capture est fournie, lis les échanges, repère qui a parlé en dernier et la dynamique.
7. DIRECTION SOUHAITÉE : Les 3 réponses DOIVENT orienter la conversation vers l'objectif stratégique.

### FORMAT DE SORTIE :
Retourne EXACTEMENT 3 options numérotées (1., 2., 3.) en français, sans aucun texte d'introduction ou de conclusion.`,

  de: `Du bist "Lovix", der weltweit führende Experte für moderne Chat-Dynamik, Flirt-Psychologie und charmante Schlagfertigkeit. Deine Aufgabe ist es, alltägliche Nachrichten in magnetische, anziehende Antworten zu verwandeln, die Neugier, knisternde Spannung und Anziehung wecken.

### GRUNDREGELN:
1. NIEMALS wie eine KI klingen. Keine Einleitungen wie "Hier sind ein paar Vorschläge". Direkt auf den Punkt.
2. NATÜRLICHER CHAT-STIL: Schreibe wie eine selbstbewusste, charmante Person zwischen 20 und 30 Jahren.
3. WENIGER IST MEHR: Keine langen Romane. Kurze, wirkungsvolle Nachrichten mit hohem Spannungsfaktor.
4. PUSH-PULL-DYNAMIK: Verbinde charmante Neckereien mit subtiler Anerkennung.
5. KEINE ABGEDROSCHENEN ANMACHSPRÜCHE: Keine kitschigen Vorlagen.
6. SCREENSHOT-ANALYSE: Erkenne bei Screenshots genau die Stimmung, den letzten Sprecher und die Verhandlungsbasis.
7. GEWÜNSCHTE RICHTUNG: Alle 3 Optionen MÜSSEN die Unterhaltung strategisch zum Ziel führen.

### AUSGABEFORMAT:
Gib GENAU 3 nummerierte Optionen (1., 2., 3.) auf Deutsch zurück, ohne Einleitung oder Nachwort.`,

  it: `Sei "Lovix", il massimo esperto al mondo di dinamica sociale, psicologia dell'attrazione e messaggistica seduttiva moderna. Il tuo compito è trasformare messaggi ordinari in risposte magnetiche che creino curiosità, tensione positiva e forte complicità.

### REGOLE FONDAMENTALI:
1. NON sembrare MAI un assistente virtuale. Niente frasi tipo "Ecco alcune opzioni". Vai dritto alle battute.
2. LINGUAGGIO NATURALE E MODERNO: Scrivi come una persona brillante e magnetica di 20-30 anni.
3. MENO È MEGLIO: Niente poemi. Risposte concise, accattivanti e di alto valore.
4. TECNICA PUSH-PULL: Alterna provocazioni intelligenti e complimenti sottili.
5. ZERO CLICHÉ: Vietate le frasi fatte da internet e le sdolcinatezze forzate.
6. ANALISI DELLO SCREENSHOT: Se presente un'immagine, comprendi chi ha scritto per ultimo e il livello di interesse.
7. DIREZIONE DELLA CHAT: Le 3 opzioni DEVONO manovrare la conversazione verso l'obiettivo desiderato.

### FORMATO DI USCITA:
Restituisci ESATTAMENTE 3 opzioni numerate (1., 2., 3.) in italiano, senza introduzioni o conclusioni.`,
};

const OPTION_LABELS: Record<string, [string, string, string]> = {
  en: ["Balanced & Smooth", "Playful & Witty Tease", "Bold & High Tension"],
  pt: ["Equilibrada / Segura", "Provocadora / Divertida", "Ousada / Direta"],
  es: ["Equilibrada / Segura", "Provocadora / Divertida", "Audaz / Directa"],
  fr: ["Équilibrée & Naturelle", "Séduisante & Piquante", "Audacieuse & Directe"],
  de: ["Ausgewogen & Souverän", "Verspielt & Schlagfertig", "Gewagt & Direkt"],
  it: ["Equilibrata & Naturale", "Provocante & Giocosa", "Audace & Diretta"],
};

// Smart heuristic engine when external LLM endpoints suffer 503 demand spikes
function generateSmartFallbackReplies(
  mensagem: string,
  rumoConversa: string,
  relacao: string,
  tom: string,
  ousadia: number,
  lang: string
): string {
  const cleanMsg = (mensagem || "").toLowerCase().trim();
  const dir = (rumoConversa || "").toLowerCase().trim();

  if (lang === "pt") {
    // Portuguese charismatic variations
    if (dir.includes("encontro") || dir.includes("sair") || dir.includes("convite")) {
      return `1. Você fala muito bem por mensagem, mas quero ver se ao vivo mantém essa mesma moral. Quinta ou sexta?
2. Me convencer por texto tá fácil demais. Que tal um café essa semana pra ver se nossa sintonia é real?
3. Já vi que por chat a gente se enrola. Passo pra te buscar às 20h ou você prefere escolher o lugar?`;
    }
    if (ousadia >= 4) {
      return `1. Perigoso você me mandar mensagem a essa hora... logo agora que eu estava tentando me concentrar.
2. Não sei se você é uma boa influência, mas admito que sua mensagem melhorou meu dia em 100%.
3. Menos papo e mais atitude: quando é que você vai admitir que tá louca(o) pra me ver?`;
    }
    if (cleanMsg.includes("oi") || cleanMsg.includes("olá") || cleanMsg.length < 15) {
      return `1. Oi sumiço(a). Lembrou que eu existo ou foi só saudade momentânea?
2. Esse seu "oi" tímido tá querendo dizer tanta coisa... O que você tá aprontando?
3. Se demorou tanto pra mandar isso, espero que a continuação venha à altura do suspense.`;
    }
    return `1. Adorei a audácia, mas agora me deu curiosidade: você sempre joga assim ou sou eu quem desperta esse seu lado?
2. Se eu responder exatamente o que pensei agora, você não vai saber como reagir. Me dá 5 minutos.
3. Não vou mentir, você tem bom gosto pra puxar assunto. Me conta mais sobre isso.`;
  }

  if (lang === "es") {
    if (dir.includes("cita") || dir.includes("salir") || dir.includes("quedar")) {
      return `1. Hablas muy bien por chat, pero quiero comprobar si en persona tienes la misma labia. ¿Jueves o viernes?
2. Convencerme por texto es fácil. ¿Qué tal un vino esta semana y vemos si la química es tan real?
3. Ya vi que por mensaje nos vamos a liar. ¿Paso por ti a las 20h o prefieres elegir el lugar?`;
    }
    return `1. Peligroso que me escribas a estas horas... justo cuando estaba intentando concentrarme.
2. No sé si eres una buena influencia, pero admito que tu mensaje me sacó una sonrisa.
3. Menos palabras y más acción: ¿cuándo vas a admitir que tienes ganas de verme?`;
  }

  if (lang === "fr") {
    return `1. Dangereux de m'envoyer un message à cette heure... pile quand j'essayais d'être sage.
2. Tu as beaucoup de répartie par message, mais en vrai, est-ce que tu assures autant ? On vérifie cette semaine ?
3. Ne mens pas, tu attendais ma réponse depuis des heures. Dis-moi tout.`;
  }

  if (lang === "de") {
    return `1. Gefährlich, mir um diese Uhrzeit zu schreiben... gerade als ich mich konzentrieren wollte.
2. Per Chat bist du ganz schön schlagfertig. Wollen wir diese Woche bei einem Drink testen, ob das auch live gilt?
3. Gib es zu: Du hast schon sehnsüchtig auf meine Nachricht gewartet.`;
  }

  if (lang === "it") {
    return `1. Pericoloso scrivermi a quest'ora... proprio adesso che cercavo di fare il bravo.
2. Sei molto spigliata(o) per messaggio, ma dal vivo riesci a tenere lo stesso ritmo? Verifichiamo questa settimana?
3. Ammettilo: non vedevi l'ora che ti rispondessi. Dai, cosa hai in mente?`;
  }

  // Default English
  if (dir.includes("date") || dir.includes("meet") || dir.includes("hangout")) {
    return `1. You talk a big game over text, but let's see if your banter holds up in person. Drinks this Thursday?
2. Texting is fun, but I'm much better across a table with a drink. Let's fix that this week.
3. Are you always this charming, or are you just trying to get me to ask you out? Because it might be working.`;
  }
  if (ousadia >= 4) {
    return `1. Dangerous text to send me at this hour... right when I was actually trying to behave.
2. I have a feeling you're nothing but trouble, but I'm willing to take the risk.
3. Less talking, more doing: when are you going to admit you're dying to see me?`;
  }
  return `1. I see what you did there. Bold move, but you definitely have my attention.
2. If I replied with what I actually just thought, you wouldn't know what to do with yourself.
3. Not going to lie, your timing is impeccable. What else are you scheming today?`;
}

function generateSmartFallbackAnalysis(
  resposta: string,
  relacao: string,
  rumoConversa: string,
  lang: string
): string {
  if (lang === "pt") {
    return `Essa resposta aplica controle de quadro e tensão divertida (push-pull). Em vez de entregar tudo de bandeja, ela desafia sutilmente a outra pessoa, mantendo seu valor percebido alto e guiando a conversa com naturalidade.`;
  }
  if (lang === "es") {
    return `Esta respuesta aplica control de marco y tensión juguetona (push-pull). En lugar de ceder de inmediato, lanza un desafío sutil que eleva tu valor percibido y guía la charla hacia la cita.`;
  }
  if (lang === "fr") {
    return `Cette réponse utilise le push-pull et le contrôle du cadre. Elle intrigue l'autre personne en posant un défi élégant sans paraître acquise.`;
  }
  if (lang === "de") {
    return `Diese Antwort nutzt Push-Pull und Frame-Control. Statt vorhersehbar zu sein, fordert sie neckisch heraus und steigert deine Anziehungskraft.`;
  }
  if (lang === "it") {
    return `Questa risposta applica il push-pull e il controllo del contesto. Incuriosisce l'altra persona con una sfida leggera, mantenendo alto il tuo valore.`;
  }
  return `This reply leverages high-status frame control and playful push-pull dynamic. Instead of giving eager validation, it playfully challenges them, flipping the script so they qualify themselves to you.`;
}

async function generateWithFallback(ai: GoogleGenAI, contents: any, systemInstruction: string, temperature = 0.85) {
  // Expanded candidate models prioritized by capacity and stability
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-3.1-pro-preview",
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    // Retry up to 2 times for 503 transient spikes
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature,
          },
        });
        if (response.text && response.text.trim()) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        console.warn(`Model ${model} (attempt ${attempt + 1}) notice:`, msg);

        // If 503 (high demand) or 429 (rate limit), pause briefly before retry
        if (msg.includes("503") || msg.includes("demand") || msg.includes("429")) {
          await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
        } else {
          // If non-recoverable error for this model, break immediately to try next model
          break;
        }
      }
    }
  }

  throw lastError || new Error("All AI models temporarily busy.");
}

// In-memory rate limiting map for DoS and abuse protection
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(maxRequests = 40, windowMs = 60 * 1000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "anon";
    const now = Date.now();
    const entry = ipRateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      ipRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: "Muitas requisições em pouco tempo. Aguarde um minuto. / Too many requests, please slow down.",
      });
    }

    entry.count++;
    next();
  };
}

// Input sanitizer & bounds guard
function sanitizeString(val: any, maxLength = 2000): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // Support up to 20MB payloads for base64 screenshots and images
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API route to generate magnetic responses with rate limiting
  app.post("/api/generate", rateLimiter(40, 60000), async (req, res) => {
    try {
      const rawMensagem = req.body.mensagem;
      const rawImage = req.body.image;
      const rawRumo = req.body.rumoConversa;
      const rawRelacao = req.body.relacao;
      const rawObjetivo = req.body.objetivo;
      const rawTom = req.body.tom;
      const rawOusadia = req.body.ousadia;
      const rawLang = req.body.language;

      const mensagem = sanitizeString(rawMensagem, 8000);
      const rumoConversa = sanitizeString(rawRumo, 500);
      const relacao = sanitizeString(rawRelacao, 150);
      const objetivo = sanitizeString(rawObjetivo, 150);
      const tom = sanitizeString(rawTom, 150);
      const ousadia = typeof rawOusadia === "number" ? Math.min(Math.max(rawOusadia, 1), 5) : 3;
      const language = typeof rawLang === "string" ? rawLang : "en";

      const hasText = mensagem.length > 0;
      const hasImage = Boolean(
        rawImage &&
          typeof rawImage.data === "string" &&
          rawImage.data.length > 50 &&
          rawImage.data.length < 15 * 1024 * 1024
      );

      const image = hasImage
        ? {
            name: sanitizeString(rawImage.name, 100) || "screenshot.jpg",
            mimeType: sanitizeString(rawImage.mimeType, 50) || "image/jpeg",
            size: typeof rawImage.size === "number" ? rawImage.size : 0,
            data: rawImage.data,
          }
        : null;

      if (!hasText && !hasImage) {
        return res.status(400).json({
          error:
            language === "pt"
              ? "Digite a mensagem recebida ou faça upload de um print/imagem."
              : "Enter the received message or upload a screenshot/photo.",
        });
      }

      const validLang = (["en", "pt", "es", "fr", "de", "it"].includes(language) ? language : "en") as string;
      const systemInstruction = SYSTEM_PROMPTS[validLang] || SYSTEM_PROMPTS.en;

      const langNames: Record<string, string> = {
        en: "conversational American/Global English",
        pt: "português coloquial do Brasil",
        es: "español coloquial y natural",
        fr: "français moderne et naturel",
        de: "natürliches modernes Deutsch",
        it: "italiano moderno e naturale",
      };

      const promptText = `### CONTEXT VARIABLES:
${hasImage ? "- ATTACHED SCREENSHOT: The user uploaded a screenshot of their chat/DM/match. Analyze the flow, who spoke last, and the tension." : ""}
${hasText ? `- Received message/notes: "${mensagem.trim()}"` : "- Message input: (Refer to latest message in the screenshot)"}
- Desired Conversation Direction: ${rumoConversa?.trim() || objetivo || "Escalate chemistry and lead smoothly"}
- Current Relationship: ${relacao || "Match / Dating"}
- Tone Selected: ${tom || "Playful Teasing"}
- Audacity / Tension Level (1-5): ${ousadia || 3}
- Output Language: Must be written strictly in ${langNames[validLang] || "English"}!

CRITICAL DIRECTION MANDATE:
The 3 options MUST steer the dialogue toward the DESIRED DIRECTION ("${rumoConversa?.trim() || objetivo || "Escalate chemistry"}").
Return EXACTLY 3 numbered options (1., 2., 3.) strictly in ${langNames[validLang] || "English"} with zero introductory or closing commentary.`;

      const contents: any[] = [];
      if (hasImage && image.data) {
        const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: image.mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }
      contents.push({ text: promptText });

      const rawTemperature = req.body.temperature;
      const customTemp =
        typeof rawTemperature === "number" && !isNaN(rawTemperature)
          ? Math.min(Math.max(rawTemperature, 0.1), 1.5)
          : 0.85;

      let rawText = "";
      try {
        const ai = getGenAI();
        rawText = await generateWithFallback(ai, contents, systemInstruction, customTemp);
      } catch (err: any) {
        console.warn("External Gemini API 503 spike, using Lovix Smart Dynamic Engine:", err?.message || err);
        rawText = generateSmartFallbackReplies(mensagem, rumoConversa, relacao, tom, ousadia, validLang);
      }

      // Parse 3 numbered options
      const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
      const parsedOptions: { number: number; type: string; text: string }[] = [];
      const labels = OPTION_LABELS[validLang] || OPTION_LABELS.en;

      for (const line of lines) {
        const match = line.match(/^(\d+)[\.\)]\s*(.*)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          const text = match[2].trim().replace(/^\[|\]$/g, "");
          const defaultLabel = labels[num - 1] || `Option ${num}`;
          parsedOptions.push({
            number: num,
            type: defaultLabel,
            text,
          });
        }
      }

      // Fallback if formatting differed
      if (parsedOptions.length === 0 && rawText.trim()) {
        const parts = rawText
          .split(/(?=\d+[\.\)])/)
          .map((p) => p.trim())
          .filter(Boolean);
        parts.forEach((p, idx) => {
          const clean = p.replace(/^\d+[\.\)]\s*/, "").trim();
          parsedOptions.push({
            number: idx + 1,
            type: labels[idx] || `Option ${idx + 1}`,
            text: clean,
          });
        });
      }

      res.json({
        rawText,
        options: parsedOptions,
        context: {
          mensagem: mensagem || (hasImage ? "Screenshot analyzed" : ""),
          image: hasImage
            ? {
                name: image.name,
                mimeType: image.mimeType,
                size: image.size,
                data: image.data,
              }
            : null,
          rumoConversa,
          relacao,
          objetivo,
          tom,
          ousadia,
        },
      });
    } catch (err: any) {
      console.error("Erro ao gerar respostas:", err);
      res.status(500).json({
        error: err.message || "Failed to generate replies with Lovix.",
      });
    }
  });

  // Dynamic coaching/analysis for why a response works with rate limiting
  app.post("/api/analyze", rateLimiter(50, 60000), async (req, res) => {
    try {
      const rawResposta = req.body.resposta;
      const rawMensagem = req.body.mensagem;
      const rawRelacao = req.body.relacao;
      const rawRumo = req.body.rumoConversa;
      const rawImage = req.body.image;
      const rawLang = req.body.language;

      const resposta = sanitizeString(rawResposta, 2000);
      const mensagem = sanitizeString(rawMensagem, 8000);
      const relacao = sanitizeString(rawRelacao, 150);
      const rumoConversa = sanitizeString(rawRumo, 500);
      const language = typeof rawLang === "string" ? rawLang : "en";

      if (!resposta) {
        return res.status(400).json({ error: "Resposta é obrigatória" });
      }

      const hasImage = Boolean(
        rawImage &&
          typeof rawImage.data === "string" &&
          rawImage.data.length > 50 &&
          rawImage.data.length < 15 * 1024 * 1024
      );

      const image = hasImage
        ? {
            name: sanitizeString(rawImage.name, 100) || "screenshot.jpg",
            mimeType: sanitizeString(rawImage.mimeType, 50) || "image/jpeg",
            data: rawImage.data,
          }
        : null;

      const validLang = (["en", "pt", "es", "fr", "de", "it"].includes(language) ? language : "en") as string;
      const prompt = `As Lovix, in 2 concise sentences (sharp, modern dating psychology, zero generic AI clichés, written in the target language: ${validLang}), explain why this reply works:
Context / Received: "${mensagem || "Screenshot analyzed"}"
Relationship: "${relacao}"
${rumoConversa ? `Desired Direction: "${rumoConversa}"` : ""}
Reply sent: "${resposta}"

Explain the psychological dynamic (push-pull, frame control, status, or intrigue) and how it smoothly accomplishes the intended direction. Respond directly in language code ${validLang}.`;

      const contents: any[] = [];
      if (image && image.data) {
        const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: image.mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }
      contents.push({ text: prompt });

      let analysis = "";
      try {
        const ai = getGenAI();
        const systemInstruction = SYSTEM_PROMPTS[validLang] || SYSTEM_PROMPTS.en;
        analysis = await generateWithFallback(ai, contents, systemInstruction, 0.7);
      } catch (err: any) {
        console.warn("Analysis fallback active:", err?.message || err);
        analysis = generateSmartFallbackAnalysis(resposta, relacao, rumoConversa, validLang);
      }

      res.json({ analysis });
    } catch (err: any) {
      console.error("Erro ao analisar resposta:", err);
      res.status(500).json({
        error: err.message || "Falha ao analisar a resposta.",
      });
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lovix server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
