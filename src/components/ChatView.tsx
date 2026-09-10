import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Trash2,
  Copy,
  Check,
  Languages,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ChatMessage, AIProviderStatus } from "../types";
import { sendChatMessage } from "../lib/api";
import {
  getStoredChat,
  saveStoredChat,
  clearStoredChat,
  saveHistoryItem,
} from "../lib/storage";

interface ChatViewProps {
  providerStatus: AIProviderStatus | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ providerStatus }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState<"english" | "urdu" | "roman_urdu">("english");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat from localStorage
  useEffect(() => {
    const saved = getStoredChat();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      // Friendly initial greeting
      setMessages([
        {
          id: "welcome_msg",
          role: "model",
          content:
            "Assalam-o-Alaikum & Welcome to Sanaullah AI! 👋\n\nI am your dedicated assistant for content creation. Ask me for video ideas, YouTube scripts, viral hooks, Urdu/Roman Urdu content, or editing tips. How can I assist your content journey today?",
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveStoredChat(messages);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      content: cleanText,
      timestamp: Date.now(),
      language,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      // Prepare previous conversational context
      const apiHistory = newHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        message: cleanText,
        history: apiHistory.slice(0, -1),
        language,
      });

      const modelMsg: ChatMessage = {
        id: "ai_" + Date.now(),
        role: "model",
        content: res.reply,
        timestamp: Date.now(),
      };

      const finalMessages = [...newHistory, modelMsg];
      setMessages(finalMessages);

      // Save to My History
      saveHistoryItem({
        type: "chat",
        title: cleanText.length > 40 ? cleanText.substring(0, 40) + "..." : cleanText,
        subtitle: `Language: ${language}`,
        content: res.reply,
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsg =
        err?.message ||
        "The AI service encountered an issue. Please check your settings or try again in a moment.";
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      clearStoredChat();
      setMessages([
        {
          id: "welcome_cleared",
          role: "model",
          content:
            "Chat cleared. I'm ready for your next creative topic or question!",
          timestamp: Date.now(),
        },
      ]);
      setErrorMessage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Viral YouTube Shorts script for tech tips",
    "Best hook for a TikTok video about money",
    "Roman Urdu script for motivation reel",
    "Top 5 video ideas for 2026",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto pb-4">
      {/* Top chat controls: Language switcher & Clear button */}
      <div className="flex items-center justify-between py-2 px-3 bg-[#111726]/70 rounded-xl border border-slate-800 mb-3">
        {/* Language selector */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <Languages className="w-4 h-4 text-cyan-400 mr-1 hidden xs:block" />
          <button
            onClick={() => setLanguage("english")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
              language === "english"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("urdu")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition font-urdu ${
              language === "urdu"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            اردو
          </button>
          <button
            onClick={() => setLanguage("roman_urdu")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
              language === "roman_urdu"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Roman Urdu
          </button>
        </div>

        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition"
          title="Clear chat messages"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Clear</span>
        </button>
      </div>

      {/* Error banner if provider error */}
      {errorMessage && (
        <div className="mb-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2">
        {messages.map((msg) => {
          const isAI = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                isAI ? "justify-start" : "justify-end"
              }`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? "bg-[#141b2a] text-slate-200 border border-slate-800/90 rounded-tl-sm shadow-sm"
                    : "bg-cyan-600 text-white rounded-tr-sm shadow-md font-medium"
                } ${language === "urdu" && isAI ? "font-urdu text-right" : ""}`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>

                {/* Footer bar inside message: copy button for AI */}
                {isAI && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sanaullah AI</span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center space-x-1 hover:text-cyan-300 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#141b2a] border border-slate-800 p-3.5 rounded-2xl rounded-tl-sm text-xs flex items-center space-x-2">
              <span className="text-slate-400 font-medium">
                Sanaullah AI is thinking
              </span>
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick chips if few messages */}
      {messages.length <= 2 && !isLoading && (
        <div className="py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(q);
                inputRef.current?.focus();
              }}
              className="text-[11px] whitespace-nowrap bg-[#131a29] hover:bg-[#1a2336] text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-2 relative">
        <div className="relative flex items-center bg-[#111726] border border-slate-800 rounded-2xl shadow-lg focus-within:border-cyan-500/60 transition-all p-1.5 pl-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "urdu"
                ? "یہاں اپنا سوال یا ٹاپک لکھیں..."
                : language === "roman_urdu"
                ? "Apna topic ya sawal yahan likhein..."
                : "Ask for scripts, viral hooks, video ideas..."
            }
            className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none resize-none max-h-32 py-2 pr-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-md transition"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-1">
          Supports English, Urdu & Roman Urdu • Press Enter to send
        </p>
      </form>
    </div>
  );
};
