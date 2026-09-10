import { HistoryItem, ChatMessage } from "../types";

const HISTORY_KEY = "sanaullah_ai_history_v1";
const CHAT_KEY = "sanaullah_ai_chat_v1";
const THEME_KEY = "sanaullah_ai_theme_v1";
const LANG_KEY = "sanaullah_ai_lang_v1";

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read history", e);
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: "hist_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };

  try {
    const current = getStoredHistory();
    // Keep latest 100 items
    const updated = [newItem, ...current].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): void {
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete history item", e);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
}

export function getStoredChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredChat(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-50)));
  } catch (e) {
    console.error("Failed to save chat", e);
  }
}

export function clearStoredChat(): void {
  try {
    localStorage.removeItem(CHAT_KEY);
  } catch (e) {
    console.error("Failed to clear chat", e);
  }
}

export function getStoredTheme(): "dark" | "light" {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
}

export function saveStoredTheme(theme: "dark" | "light"): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme", e);
  }
}

export function getStoredLanguage(): "english" | "urdu" | "roman_urdu" {
  try {
    const l = localStorage.getItem(LANG_KEY);
    if (l === "urdu" || l === "roman_urdu") return l;
    return "english";
  } catch (e) {
    return "english";
  }
}

export function saveStoredLanguage(lang: "english" | "urdu" | "roman_urdu"): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.error("Failed to save language", e);
  }
}
