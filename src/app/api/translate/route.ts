import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const SYSTEM_PROMPT = `Tu es un interprète expert en Langue des Signes. On t'envoie une image d'un patient pendant un appel vidéo médical.

Analyse la position des mains et doigts. Traduis le geste en français.

Réponds UNIQUEMENT en JSON strict :
{"detected":true,"sign":"mot/phrase","description":"geste court","confidence":"high"}

Si aucune main ou geste pas clair :
{"detected":false,"sign":null,"description":"","confidence":"none"}

Sois très concis. JSON seulement.`;

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { frame } = body as { frame?: string };

  if (!frame) {
    return NextResponse.json({ detected: false, sign: null, description: "" });
  }

  try {
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-haiku-4-5-20251001-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Data,
                },
              },
              { type: "text", text: "Signe ?" },
            ],
          },
        ],
      }),
    });

    const res = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(res.body));
    const rawText = result.content?.[0]?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json({ detected: false, sign: null, description: "", confidence: "none" });
  } catch (err) {
    console.error("Translate error:", err);
    return NextResponse.json({ detected: false, sign: null, description: "", confidence: "none" });
  }
}
