import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const APP_CONTEXT = `Tu es l'assistant vocal de l'application Ismaani — une app d'accessibilité pour les personnes sourdes et malentendantes en Tunisie.

Tu parles uniquement en français, de manière courte, chaleureuse et naturelle. Maximum 2 phrases.

Fonctionnalités de l'app :
1. APPEL VIDÉO — Traduction en langue des signes tunisienne (LST) en temps réel via caméra avec un docteur
2. APPRENDRE — Modules d'apprentissage de la LST : Salutations de base, Urgences médicales, Famille et Amis, Administrations
3. SOS — Appel d'urgence rapide : Protection Civile (198), Police (197), SAMU (190), Aide (1899), et appel famille (+21658613572)
4. PAIEMENT — Abonnement premium Ismaani (45,000 TND)

Si l'utilisateur veut faire une action, inclus EXACTEMENT UNE action dans ta réponse au format [ACTION:xxx]. Actions possibles :
- [ACTION:navigate:/video-call] — Ouvrir l'appel vidéo
- [ACTION:navigate:/e-learning] — Ouvrir les leçons
- [ACTION:navigate:/e-learning/salutations] — Leçon salutations
- [ACTION:navigate:/e-learning/urgences-medicales] — Leçon urgences
- [ACTION:navigate:/e-learning/famille-amis] — Leçon famille
- [ACTION:navigate:/e-learning/administrations] — Leçon administrations
- [ACTION:navigate:/sos] — Ouvrir le SOS
- [ACTION:navigate:/payment] — Ouvrir le paiement
- [ACTION:call:198] — Appeler Protection Civile
- [ACTION:call:197] — Appeler Police
- [ACTION:call:190] — Appeler SAMU
- [ACTION:call:+21658613572] — Appeler la famille

Ne mets l'action que si l'utilisateur le demande explicitement. Sinon, réponds juste naturellement.`;

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const { message } = await request.json().catch(() => ({ message: "" }));

  if (!message) {
    return NextResponse.json({ error: "No message" }, { status: 400 });
  }

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 200,
        system: APP_CONTEXT,
        messages: [{ role: "user", content: message }],
      }),
    });

    const res = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(res.body));
    const rawText = result.content?.[0]?.text || "Désolé, je n'ai pas compris.";

    const actionMatch = rawText.match(/\[ACTION:(.*?)\]/);
    const action = actionMatch ? actionMatch[1] : null;
    const text = rawText.replace(/\[ACTION:.*?\]/g, "").trim();

    return NextResponse.json({ text, action });
  } catch (err) {
    console.error("Bedrock error:", err);
    return NextResponse.json(getMockResponse(message));
  }
}

function getMockResponse(message: string): { text: string; action: string | null } {
  const lower = message.toLowerCase();

  if (lower.includes("sos") || lower.includes("urgence") || lower.includes("aide")) {
    return { text: "Je vous redirige vers le SOS.", action: "navigate:/sos" };
  }
  if (lower.includes("appel") || lower.includes("vidéo") || lower.includes("docteur")) {
    return { text: "J'ouvre l'appel vidéo.", action: "navigate:/video-call" };
  }
  if (lower.includes("apprendre") || lower.includes("leçon") || lower.includes("cours")) {
    return { text: "Voici les modules d'apprentissage.", action: "navigate:/e-learning" };
  }
  if (lower.includes("famille") || lower.includes("appeler")) {
    return { text: "J'appelle votre famille.", action: "call:+21658613572" };
  }
  if (lower.includes("bonjour") || lower.includes("salut")) {
    return { text: "Bonjour ! Je suis Ismaani, votre assistant vocal. Comment puis-je vous aider ?", action: null };
  }

  return { text: "Dites-moi ce que vous souhaitez : appel vidéo, apprendre, SOS, ou paiement.", action: null };
}
