export type AppTab = "home" | "tools" | "video" | "history" | "settings";

export type ToolId =
  | "chat"
  | "video"
  | "script"
  | "ideas"
  | "thumbnail"
  | "prompt_improver"
  | "editing"
  | "caption"
  | "hashtags"
  | "translate";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
  language?: "english" | "urdu" | "roman_urdu";
}

export interface VideoGenerationJob {
  id: string;
  prompt: string;
  image?: string;
  duration: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
  status: "queued" | "starting" | "generating" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  error?: string;
  createdAt: number;
}

export type HistoryType =
  | "chat"
  | "video"
  | "script"
  | "ideas"
  | "thumbnail"
  | "prompt_improver"
  | "editing"
  | "caption"
  | "hashtags"
  | "translate";

export interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  subtitle?: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AIProviderStatus {
  status: string;
  configured: boolean;
  provider: string;
  models: {
    text: string;
    video: string;
  };
  message: string;
  social: {
    youtube: string;
    tiktok: string;
    whatsapp: string;
    whatsappUrl: string;
  };
}
