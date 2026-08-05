import { DefaultAzureCredential } from "@azure/identity";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const usage = globalThis as typeof globalThis & { avatarGenerationUsage?: { date: string; count: number } };

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json() as { prompt?: string };
    const endpoint = process.env.AZURE_FOUNDRY_IMAGE_ENDPOINT;
    const deployment = process.env.AZURE_FOUNDRY_IMAGE_DEPLOYMENT || "gpt-image-2";
    if (!endpoint) return NextResponse.json({ error: "Azure avatar generation is not configured." }, { status: 503 });

    const today = new Date().toISOString().slice(0, 10);
    const current = usage.avatarGenerationUsage?.date === today ? usage.avatarGenerationUsage : { date: today, count: 0 };
    if (current.count >= 6) return NextResponse.json({ error: "Today’s six-avatar generation limit has been reached." }, { status: 429 });

    const token = await new DefaultAzureCredential().getToken("https://cognitiveservices.azure.com/.default");
    const avatarPrompt = `Create one premium Discord-style profile avatar for a student project folder. ${prompt?.trim() || "A confident futuristic academy builder with a friendly expression"}. Centered head-and-shoulders composition, distinctive silhouette, expressive face, polished 3D digital illustration, modern gaming-community avatar quality, crisp edges, no text, no logo, no frame. Place the subject on a perfectly flat solid chroma green (#00FF00) background with no shadows, gradients, green clothing, green accessories, or green reflected light.`;
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/openai/v1/images/generations?api-version=preview`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: deployment, prompt: avatarPrompt, size: "1024x1024", quality: "high", n: 1, output_format: "png" }),
    });
    const result = await response.json();
    if (!response.ok || !result.data?.[0]?.b64_json) return NextResponse.json({ error: result.error?.message || "Azure could not generate the avatar." }, { status: response.status || 502 });

    const source = Buffer.from(result.data[0].b64_json, "base64");
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const greenDominance = green - Math.max(red, blue);
      if (green > 150 && greenDominance > 18) data[index + 3] = Math.max(0, Math.min(255, Math.round(255 - (greenDominance - 18) * 4.6)));
    }
    const transparentPng = await sharp(data, { raw: info }).png().toBuffer();
    usage.avatarGenerationUsage = { date: today, count: current.count + 1 };
    return NextResponse.json({ image: `data:image/png;base64,${transparentPng.toString("base64")}`, remaining: 5 - current.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Avatar generation failed." }, { status: 500 });
  }
}
