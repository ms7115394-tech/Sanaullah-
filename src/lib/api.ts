import { AIProviderStatus } from "../types";

function extractErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  let msg = typeof data === "string" ? data : (data.error || data.message || fallback);
  if (typeof msg === "string") {
    if (msg.includes('{"error"') || (msg.trim().startsWith("{") && msg.trim().endsWith("}"))) {
      try {
        const jsonStart = msg.indexOf("{");
        const parsed = JSON.parse(msg.slice(jsonStart));
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      } catch {}
    }
  }
  return msg || fallback;
}

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let errData: any = null;
    try {
      errData = await res.json();
    } catch {
      try {
        errData = await res.text();
      } catch {}
    }
    throw new Error(extractErrorMessage(errData, fallbackError));
  }
  return res.json();
}

export async function fetchProviderStatus(): Promise<AIProviderStatus> {
  const res = await fetch("/api/status");
  return handleResponse<AIProviderStatus>(res, "Failed to check AI provider status.");
}

export async function sendChatMessage(payload: {
  message: string;
  history?: Array<{ role: "user" | "model"; content: string }>;
  language?: "english" | "urdu" | "roman_urdu";
}): Promise<{ reply: string }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ reply: string }>(res, "Failed to get AI response.");
}

export async function apiGenerateScript(payload: {
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
  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to generate script.");
}

export async function apiGenerateVideoIdeas(payload: {
  topic: string;
  platform?: string;
  niche?: string;
}): Promise<{
  ideas: Array<{
    title: string;
    hook: string;
    concept: string;
    suggestedFormat: string;
  }>;
}> {
  const res = await fetch("/api/video-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to generate video ideas.");
}

export async function apiGenerateThumbnailPrompt(payload: {
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
  const res = await fetch("/api/thumbnail-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to generate thumbnail prompt.");
}

export async function apiImprovePrompt(payload: {
  prompt: string;
}): Promise<{
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
  const res = await fetch("/api/improve-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to improve prompt.");
}

export async function apiGetEditingAdvice(payload: {
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
  const res = await fetch("/api/editing-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to get editing recommendations.");
}

export async function apiGenerateCaptions(payload: {
  topic: string;
  platform: "YouTube" | "TikTok" | "Instagram";
  tone?: string;
}): Promise<{
  shortCaption: string;
  engagingCaption: string;
  storyCaption: string;
  hashtags: string[];
}> {
  const res = await fetch("/api/captions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to generate captions.");
}

export async function apiTranslate(payload: {
  text: string;
  from: "English" | "Urdu" | "Roman Urdu";
  to: "English" | "Urdu" | "Roman Urdu";
}): Promise<{
  translatedText: string;
  notes?: string;
}> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to translate text.");
}

export async function apiGenerateVideo(payload: {
  prompt: string;
  image?: string;
  duration?: number;
  aspectRatio?: "9:16" | "16:9" | "1:1";
}): Promise<{
  jobId: string;
  status: "queued" | "starting" | "generating" | "completed" | "failed";
}> {
  const res = await fetch("/api/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Failed to start video generation.");
}

export async function apiPollVideoStatus(jobId: string): Promise<{
  id: string;
  status: "queued" | "starting" | "generating" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  error?: string;
}> {
  const res = await fetch("/api/video/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId }),
  });
  return handleResponse(res, "Failed to poll video generation.");
}

