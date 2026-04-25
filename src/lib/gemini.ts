const API_KEY = process.env.GEMINI_API_KEY!;

// Primary model + fallbacks if primary is overloaded
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export interface BriefInput {
  industry: string;
  audience: string;
  tone: string;
  goal: string;
  platform: string;
  brandName: string;
  additionalContext?: string;
}

export interface ContentOutput {
  caption: string;
  videoScript: string;
  storyboard: string;
  posterConcept: string;
  hashtags: string;
}

function buildUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
}

export function buildPrompt(brief: BriefInput): string {

  const platformVideoGuide: Record<string, string> = {
    "TikTok":       "15–60 seconds total. Fast cuts, hook in first 2s, trending audio cues, captions on screen, vertical format (9:16).",
    "Instagram":    "30–90 seconds total for Reels. Hook in first 3s, aesthetic visuals, text overlays, vertical format (9:16).",
    "YouTube":      "3–10 minutes total. Strong intro (0–30s), clear chapters/segments, detailed storytelling, horizontal (16:9).",
    "LinkedIn":     "1–3 minutes total. Professional tone, data-driven, subtitles required, square or horizontal format.",
    "Twitter / X":  "30–60 seconds total. Punchy, bold text overlays, no sound dependency, horizontal format.",
    "Facebook":     "1–3 minutes total. Story-driven, emotional hook, subtitles, square or horizontal format.",
    "Multi-Platform":"60–90 seconds total. Adaptable for both vertical (9:16) and horizontal (16:9), universal hook in first 3s.",
  };

  const videoGuide = platformVideoGuide[brief.platform]
    ?? "60–90 seconds total. Clear scenes with beginning, middle, and end.";

  return `
You are a senior creative strategist at a multimedia agency. Generate campaign content based on this client brief:

BRAND: ${brief.brandName}
INDUSTRY: ${brief.industry}
TARGET AUDIENCE: ${brief.audience}
BRAND TONE: ${brief.tone}
CAMPAIGN GOAL: ${brief.goal}
PLATFORM: ${brief.platform}
ADDITIONAL CONTEXT: ${brief.additionalContext || "None"}

VIDEO SCRIPT GUIDE FOR ${brief.platform.toUpperCase()}:
${videoGuide}

Generate a complete content package in this EXACT JSON format (no markdown, no backticks, pure JSON only):

{
  "caption": "A compelling social media caption (2-3 sentences, includes CTA, matches the brand tone)",
  "videoScript": "A full video script tailored to ${brief.platform} duration guidelines. Break into 4-6 scenes with realistic durations that ADD UP to the total platform duration. Format each scene as: [SCENE 1 - Xs] Visual description. VO: Voiceover text. TEXT OVERLAY: On-screen text. Separate each scene with a line break.",
  "storyboard": "A text-based storyboard with 4-5 frames matching the video script scenes. Format: FRAME 1: Visual description | Text overlay | Camera angle. FRAME 2: ... and so on.",
  "posterConcept": "Poster design direction including: headline, subheadline, visual concept, color palette suggestion, layout direction",
  "hashtags": "10 relevant hashtags separated by spaces"
}

Rules:
- Match the tone exactly: ${brief.tone}
- VIDEO SCRIPT must follow the ${brief.platform} duration guide: ${videoGuide}
- Scene durations must be realistic and add up to the total video length
- Focus on ${brief.goal} as the primary objective
- Be creative, specific, and professional
- Return ONLY the JSON object, nothing else
  `.trim();
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const response = await fetch(buildUrl(model), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error?.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function generateContent(
  brief: BriefInput
): Promise<ContentOutput> {
  const prompt = buildPrompt(brief);
  const delays = [1000, 2000, 3000];

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];

    try {
      console.log(`[Gemini] Trying model: ${model}`);
      const rawText = await callGemini(prompt, model);

      // Strip markdown fences if model adds them
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      try {
        const parsed = JSON.parse(cleaned);

        // Gemini sometimes returns nested objects for posterConcept etc.
        const safeOutput: ContentOutput = {
          caption: typeof parsed.caption === "string"
            ? parsed.caption
            : JSON.stringify(parsed.caption),
          videoScript: typeof parsed.videoScript === "string"
            ? parsed.videoScript
            : JSON.stringify(parsed.videoScript),
          storyboard: typeof parsed.storyboard === "string"
            ? parsed.storyboard
            : JSON.stringify(parsed.storyboard),
          posterConcept: typeof parsed.posterConcept === "string"
            ? parsed.posterConcept
            : Object.entries(parsed.posterConcept)
                .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                .join("\n"),
          hashtags: typeof parsed.hashtags === "string"
            ? parsed.hashtags
            : Array.isArray(parsed.hashtags)
            ? parsed.hashtags.join(" ")
            : JSON.stringify(parsed.hashtags),
        };

        return safeOutput;

      } catch {
        throw new Error("Failed to parse AI response. Please try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      const isOverloaded =
        message.includes("high demand") ||
        message.includes("503") ||
        message.includes("overloaded") ||
        message.includes("quota") ||
        message.includes("429");

      console.warn(`[Gemini] Model ${model} failed: ${message}`);

      if (isOverloaded && i < MODELS.length - 1) {
        console.log(
          `[Gemini] Waiting ${delays[i]}ms before trying fallback model...`
        );
        await new Promise((res) => setTimeout(res, delays[i]));
        continue;
      }

      throw new Error(
        isOverloaded
          ? "Gemini API is temporarily busy. Please wait a moment and try again."
          : message
      );
    }
  }

  throw new Error("All models failed. Please try again later.");
}