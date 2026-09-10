import { GoogleGenAI, Type } from "@google/genai";

export interface VideoJob {
  id: string;
  operationName?: string;
  prompt: string;
  image?: string;
  duration: number;
  aspectRatio: string;
  status: "queued" | "starting" | "generating" | "completed" | "failed";
  progress: number;
  createdAt: number;
  videoUrl?: string;
  error?: string;
}

// In-memory video jobs store
export const videoJobs = new Map<string, VideoJob>();

export function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.VEO_API_KEY;
}

export function isAIConfigured(): boolean {
  const key = getApiKey();
  return Boolean(key && key.trim().length > 0 && !key.includes("MY_GEMINI_API_KEY"));
}

export function getAIClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
    throw new Error("AI provider is not configured yet. Please add the required API key in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Models for text tasks in priority order
const TEXT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

function isTransientError(err: any): boolean {
  const msg = (err?.message || String(err || "")).toLowerCase();
  const status = err?.status || err?.code;
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("high demand") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("spikes in demand") ||
    msg.includes("try again later")
  );
}

function cleanErrorMessage(err: any): string {
  let msg = err?.message || String(err || "");
  try {
    if (typeof msg === "string" && (msg.startsWith("{") || msg.includes('{"error"'))) {
      const jsonStart = msg.indexOf("{");
      const parsed = JSON.parse(msg.slice(jsonStart));
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    }
  } catch (_) {}
  return msg;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Robust execution with exponential backoff retry and automatic model fallback
 * for 503/UNAVAILABLE/high-demand errors.
 */
export async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getAIClient();
  let lastError: any = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Provider] Model ${model} (attempt ${attempt + 1}) encountered:`, cleanErrorMessage(err));

        if (isTransientError(err)) {
          if (attempt === 0) {
            // Wait with exponential backoff & jitter before retry
            const backoff = 800 + Math.random() * 500;
            await sleep(backoff);
            continue;
          }
          // After 2 failed attempts on this model, switch immediately to fallback model
          break;
        } else {
          // If non-transient, try next model candidate
          break;
        }
      }
    }
  }

  const cleaned = cleanErrorMessage(lastError);
  if (isTransientError(lastError)) {
    throw new Error(
      "The AI model is temporarily experiencing high demand. Please try again in a few moments."
    );
  }
  throw new Error(cleaned || "AI generation failed. Please try again.");
}

/**
 * Defensive JSON parser supporting raw JSON, markdown-wrapped JSON, and regex extractions
 */
export function parseJsonResponse<T>(text?: string, fallback: T = {} as T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch {}
      }
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch {}
      }
      return fallback;
    }
  }
}

/**
 * 1. AI Chat
 */
export async function chat(params: {
  message: string;
  history?: Array<{ role: "user" | "model"; content: string }>;
  language?: "english" | "urdu" | "roman_urdu";
}): Promise<string> {
  const langDirective =
    params.language === "urdu"
      ? "Always respond in standard Urdu script (اردو). Maintain a natural, friendly and professional tone."
      : params.language === "roman_urdu"
      ? "Always respond in conversational Roman Urdu (Urdu written in English alphabets, e.g., 'Aap kaise hain?'). Keep it natural, easy to read, and polite."
      : "Respond in clear, natural, and helpful English. If the user writes in Urdu or Roman Urdu, reply appropriately in their language.";

  const systemInstruction = `You are Sanaullah AI, an intelligent, friendly, and expert content creation AI assistant.
Tagline: "Your AI Assistant for Content Creation".
Your creator/brand is Sanaullah AI.
You assist video creators, YouTubers, TikTokers, and digital marketers with scripting, video prompts, thumbnail concepts, editing techniques, captions, translations, and creative ideation.
Language rule: ${langDirective}
Never sound robotic or generic. Provide high-value, actionable, well-formatted advice with markdown formatting where helpful.`;

  // Build conversational turns
  const contents: any[] = [];
  if (params.history && params.history.length > 0) {
    for (const h of params.history) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: params.message }],
  });

  const response = await generateContentWithRetryAndFallback({
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text || "No response generated.";
}

/**
 * 2. Script Generator
 */
export async function generateScript(params: {
  topic: string;
  duration: string;
  platform: string;
  language: string;
  tone: string;
}): Promise<{
  hook: string;
  mainScript: string;
  ending: string;
  callToAction: string;
  fullText: string;
}> {
  const systemInstruction = `You are an expert video scriptwriter for YouTube, TikTok, and Instagram Reels.
Generate high-retention video scripts that sound completely natural and easy to speak aloud.
Avoid clunky formal speak. Ensure the hook grabs viewers within the first 3 seconds.
Language: ${params.language}.
Platform: ${params.platform}.
Duration: ${params.duration}.
Tone: ${params.tone}.`;

  const prompt = `Create a viral, natural-sounding video script on:
Topic: "${params.topic}"
Platform: ${params.platform}
Target Duration: ${params.duration}
Tone: ${params.tone}
Language: ${params.language}

Return a valid JSON object matching this schema:
{
  "hook": "Strong 3-5 second opening hook",
  "mainScript": "Body of script with timing marks or visual cues [bracketed]",
  "ending": "Memorable conclusion punchline or takeaway",
  "callToAction": "Natural, compelling CTA for likes/follows/subscribes"
}`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          mainScript: { type: Type.STRING },
          ending: { type: Type.STRING },
          callToAction: { type: Type.STRING },
        },
        required: ["hook", "mainScript", "ending", "callToAction"],
      },
    },
  });

  const parsed = parseJsonResponse<any>(response.text, {});
  const fullText = `[HOOK]\n${parsed.hook || ""}\n\n[MAIN SCRIPT]\n${parsed.mainScript || ""}\n\n[ENDING]\n${parsed.ending || ""}\n\n[CALL TO ACTION]\n${parsed.callToAction || ""}`;

  return {
    hook: parsed.hook || "",
    mainScript: parsed.mainScript || "",
    ending: parsed.ending || "",
    callToAction: parsed.callToAction || "",
    fullText,
  };
}

/**
 * 3. Video Ideas
 */
export async function generateVideoIdeas(params: {
  topic: string;
  platform: string;
  niche?: string;
}): Promise<
  Array<{
    title: string;
    hook: string;
    concept: string;
    suggestedFormat: string;
  }>
> {
  const prompt = `Generate 5 creative, viral video ideas based on:
Topic: "${params.topic}"
Target Platform: ${params.platform || "YouTube / Shorts / TikTok"}
Niche: ${params.niche || "General Content Creation"}

Each idea must have high clickability and watch retention.`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Catchy title" },
            hook: { type: Type.STRING, description: "Attention-grabbing hook" },
            concept: { type: Type.STRING, description: "Core storyline or takeaway" },
            suggestedFormat: { type: Type.STRING, description: "e.g. Talking Head, POV, B-roll Story, Skit" },
          },
          required: ["title", "hook", "concept", "suggestedFormat"],
        },
      },
    },
  });

  return parseJsonResponse<any[]>(response.text, []);
}

/**
 * 4. Thumbnail Prompt Generator
 */
export async function generateThumbnailPrompt(params: {
  title: string;
  platform?: string;
  style?: string;
}): Promise<{
  subject: string;
  background: string;
  lighting: string;
  composition: string;
  cameraAngle: string;
  textPlacement: string;
  emotion: string;
  visualStyle: string;
  colors: string;
  fullPrompt: string;
}> {
  const prompt = `Generate an ultra-detailed AI image-generation prompt for a high-CTR video thumbnail optimized for YouTube and mobile feeds.
Video Title/Concept: "${params.title}"
Platform: ${params.platform || "YouTube"}
Desired Style: ${params.style || "Photorealistic, punchy, high contrast"}`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          background: { type: Type.STRING },
          lighting: { type: Type.STRING },
          composition: { type: Type.STRING },
          cameraAngle: { type: Type.STRING },
          textPlacement: { type: Type.STRING },
          emotion: { type: Type.STRING },
          visualStyle: { type: Type.STRING },
          colors: { type: Type.STRING },
          fullPrompt: { type: Type.STRING, description: "Ready to copy-paste Midjourney/Stable Diffusion/DALL-E prompt" },
        },
        required: [
          "subject",
          "background",
          "lighting",
          "composition",
          "cameraAngle",
          "textPlacement",
          "emotion",
          "visualStyle",
          "colors",
          "fullPrompt",
        ],
      },
    },
  });

  return parseJsonResponse<any>(response.text, {});
}

/**
 * 5. Video Prompt Improver
 */
export async function improvePrompt(basicPrompt: string): Promise<{
  subject: string;
  environment: string;
  action: string;
  cameraMovement: string;
  lighting: string;
  visualStyle: string;
  motion: string;
  composition: string;
  fullPrompt: string;
}> {
  const prompt = `Take this basic video concept:
"${basicPrompt}"

Transform it into a rich, cinema-grade, prompt for AI video generators (Veo, Sora, Runway Gen-3, Luma Dream Machine).
Provide specific breakdown of Subject, Environment, Action, Camera movement, Lighting, Visual style, Motion, and Composition, plus an integrated full prompt.`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          environment: { type: Type.STRING },
          action: { type: Type.STRING },
          cameraMovement: { type: Type.STRING },
          lighting: { type: Type.STRING },
          visualStyle: { type: Type.STRING },
          motion: { type: Type.STRING },
          composition: { type: Type.STRING },
          fullPrompt: { type: Type.STRING },
        },
        required: [
          "subject",
          "environment",
          "action",
          "cameraMovement",
          "lighting",
          "visualStyle",
          "motion",
          "composition",
          "fullPrompt",
        ],
      },
    },
  });

  return parseJsonResponse<any>(response.text, {});
}

/**
 * 6. Editing Assistant
 */
export async function getEditingAdvice(params: {
  software: "CapCut" | "InShot" | "General";
  videoTopic: string;
  pacing?: string;
}): Promise<{
  software: string;
  summary: string;
  transitions: string[];
  textAnimations: string[];
  soundEffects: string[];
  musicTiming: string[];
  overlays: string[];
  zoomEffects: string[];
  keyframes: string[];
  colorAdjustments: string[];
  beginnerTips: string[];
}> {
  const prompt = `Provide practical, beginner-friendly video editing recommendations for:
Software: ${params.software}
Video Topic: "${params.videoTopic}"
Pacing Style: ${params.pacing || "Fast & Engaging / Mobile-First"}

Include concrete, actionable suggestions for:
- Transitions (e.g. whip pan, zoom blur)
- Text animations (e.g. typewriter, bounce in)
- Sound effects (e.g. whoosh, ding, mouse click)
- Music timing & beat sync
- Overlays & stickers (B-roll, arrows, badges)
- Zoom effects (dynamic cut-ins, slow push)
- Keyframes (scale up, positioning)
- Color adjustments / filters (saturation, contrast, LUT)
- Beginner step-by-step tips for ${params.software}`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          software: { type: Type.STRING },
          summary: { type: Type.STRING },
          transitions: { type: Type.ARRAY, items: { type: Type.STRING } },
          textAnimations: { type: Type.ARRAY, items: { type: Type.STRING } },
          soundEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
          musicTiming: { type: Type.ARRAY, items: { type: Type.STRING } },
          overlays: { type: Type.ARRAY, items: { type: Type.STRING } },
          zoomEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyframes: { type: Type.ARRAY, items: { type: Type.STRING } },
          colorAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
          beginnerTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "software",
          "summary",
          "transitions",
          "textAnimations",
          "soundEffects",
          "musicTiming",
          "overlays",
          "zoomEffects",
          "keyframes",
          "colorAdjustments",
          "beginnerTips",
        ],
      },
    },
  });

  return parseJsonResponse<any>(response.text, {});
}

/**
 * 7. Caption & Hashtag Generator
 */
export async function generateCaptions(params: {
  topic: string;
  platform: "YouTube" | "TikTok" | "Instagram";
  tone?: string;
}): Promise<{
  shortCaption: string;
  engagingCaption: string;
  storyCaption: string;
  hashtags: string[];
}> {
  const prompt = `Generate social media captions and high-converting hashtags for:
Platform: ${params.platform}
Topic: "${params.topic}"
Tone: ${params.tone || "Natural, engaging, viral"}

Provide 3 variants:
1. Short & Punchy
2. Engaging with CTA and Question
3. Mini-Story style
Also provide 15-20 targeted, trending, and niche hashtags.`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shortCaption: { type: Type.STRING },
          engagingCaption: { type: Type.STRING },
          storyCaption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["shortCaption", "engagingCaption", "storyCaption", "hashtags"],
      },
    },
  });

  return parseJsonResponse<any>(response.text, {});
}

/**
 * 8. Translator (English, Urdu, Roman Urdu)
 */
export async function translateText(params: {
  text: string;
  from: "English" | "Urdu" | "Roman Urdu";
  to: "English" | "Urdu" | "Roman Urdu";
}): Promise<{
  translatedText: string;
  explanation?: string;
}> {
  const prompt = `Translate the following content naturally and conversationally from ${params.from} to ${params.to}.
Do NOT translate word-for-word if it sounds unnatural; preserve colloquial nuances, social media context, and genuine Pakistani / South Asian expressions when translating into Urdu or Roman Urdu.

Input text (${params.from}):
"${params.text}"

Return JSON with "translatedText" and optional brief "notes".`;

  const response = await generateContentWithRetryAndFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ["translatedText"],
      },
    },
  });

  return parseJsonResponse<any>(response.text, {});
}

/**
 * 9. AI Video Generator (Real Provider Architecture)
 */
export async function generateVideo(params: {
  prompt: string;
  image?: string; // base64 or data URL
  duration?: number;
  aspectRatio?: "9:16" | "16:9" | "1:1";
}): Promise<{
  jobId: string;
  status: "queued" | "starting" | "generating" | "completed" | "failed";
  operationName?: string;
  error?: string;
}> {
  // Ensure provider is configured
  if (!isAIConfigured()) {
    throw new Error("AI provider is not configured yet. Please configure the API key in Settings > Secrets.");
  }

  const ai = getAIClient();
  const jobId = "vid_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const duration = params.duration || 5;
  const aspectRatio = params.aspectRatio === "1:1" ? "16:9" : (params.aspectRatio || "9:16"); // Veo supports 16:9 or 9:16

  // Create initial job record
  const job: VideoJob = {
    id: jobId,
    prompt: params.prompt,
    image: params.image ? params.image.substring(0, 100) + "..." : undefined,
    duration,
    aspectRatio: params.aspectRatio || "9:16",
    status: "queued",
    progress: 10,
    createdAt: Date.now(),
  };
  videoJobs.set(jobId, job);

  // Trigger video generation asynchronously with real Veo model
  (async () => {
    try {
      job.status = "starting";
      job.progress = 25;

      let operation;
      if (params.image && params.image.includes(",")) {
        // Image-to-Video mode
        const commaIdx = params.image.indexOf(",");
        const meta = params.image.substring(0, commaIdx);
        const base64Data = params.image.substring(commaIdx + 1);
        let mimeType = "image/png";
        if (meta.includes("image/jpeg") || meta.includes("image/jpg")) mimeType = "image/jpeg";
        else if (meta.includes("image/webp")) mimeType = "image/webp";

        operation = await ai.models.generateVideos({
          model: "veo-3.1-lite-generate-preview",
          prompt: params.prompt || "High quality dynamic video",
          image: {
            imageBytes: base64Data,
            mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: "720p",
            aspectRatio: aspectRatio as "9:16" | "16:9",
          },
        });
      } else {
        // Text-to-Video mode
        operation = await ai.models.generateVideos({
          model: "veo-3.1-lite-generate-preview",
          prompt: params.prompt,
          config: {
            numberOfVideos: 1,
            resolution: "720p",
            aspectRatio: aspectRatio as "9:16" | "16:9",
          },
        });
      }

      job.operationName = operation.name;
      job.status = "generating";
      job.progress = 50;
    } catch (err: any) {
      console.error("Veo video generation error:", err);
      job.status = "failed";
      job.error = cleanErrorMessage(err) || "Failed to initialize video generation with provider.";
    }
  })();

  return {
    jobId,
    status: job.status,
  };
}

/**
 * Poll video job status
 */
export async function pollVideoJob(jobId: string): Promise<VideoJob> {
  const job = videoJobs.get(jobId);
  if (!job) {
    throw new Error("Video generation job not found.");
  }

  // If already finished or failed, return
  if (job.status === "completed" || job.status === "failed") {
    return job;
  }

  // If operationName exists, check with Gemini operations API
  if (job.operationName && isAIConfigured()) {
    try {
      const ai = getAIClient();
      const { GenerateVideosOperation } = await import("@google/genai");
      const op = new GenerateVideosOperation();
      op.name = job.operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      if (updated.done) {
        if (updated.error) {
          job.status = "failed";
          const errObj = updated.error as any;
          job.error = cleanErrorMessage(errObj) || "Video generation failed in provider.";
        } else {
          const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
          if (videoUri) {
            job.status = "completed";
            job.progress = 100;
            // Video streaming endpoint for this job
            job.videoUrl = `/api/video/stream/${job.id}`;
          } else {
            job.status = "failed";
            job.error = "Provider finished without returning a video stream.";
          }
        }
      } else {
        job.status = "generating";
        job.progress = Math.min(90, job.progress + 10);
      }
    } catch (err: any) {
      console.error("Error polling video operation:", err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("not found")) {
        job.status = "failed";
        job.error = cleanErrorMessage(err);
      }
    }
  }

  return job;
}

