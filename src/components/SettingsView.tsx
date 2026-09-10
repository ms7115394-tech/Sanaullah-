import React, { useState } from "react";
import {
  Settings,
  Moon,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Youtube,
  MessageCircle,
  ExternalLink,
  Info,
  Check,
  Key,
  Share2,
  Sparkles,
} from "lucide-react";
import { AIProviderStatus } from "../types";
import { clearAllHistory, clearStoredChat } from "../lib/storage";

interface SettingsViewProps {
  providerStatus: AIProviderStatus | null;
  onRefreshHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  providerStatus,
  onRefreshHistory,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  // Social Links
  const socials = {
    youtube: "https://www.youtube.com/@SanaullahAI",
    tiktok: "https://www.tiktok.com/@sanaullahai",
    whatsapp: "https://wa.me/923477263532",
    whatsappNumber: "03477263532",
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearEverything = () => {
    clearAllHistory();
    clearStoredChat();
    onRefreshHistory();
    setShowClearConfirm(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Settings & Info</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage application preferences, social channels, and provider configuration.
        </p>
      </div>

      {/* AI Provider Status Card */}
      <section className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>AI Engine Configuration</span>
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c111c] border border-slate-800/90">
          <div className="flex items-center space-x-3">
            {providerStatus?.configured ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>{providerStatus?.provider || "Gemini AI & Veo"}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    providerStatus?.configured
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {providerStatus?.configured ? "Active" : "Not Configured"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {providerStatus?.configured
                  ? "Server-side proxy active. API key is securely protected."
                  : "Please configure your GEMINI_API_KEY in Settings > Secrets."}
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Security Architecture:</strong> API keys are strictly stored in server-side environment variables and never exposed to the client browser.
          </span>
        </div>
      </section>

      {/* Official Community & Socials */}
      <section className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Official Social Channels</span>
        </h2>

        <div className="space-y-2.5">
          {/* YouTube */}
          <a
            href={socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#0c111c] hover:bg-[#151f33] border border-slate-800/90 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                  YouTube Channel
                </h3>
                <p className="text-[11px] text-slate-400">@SanaullahAI</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
          </a>

          {/* TikTok */}
          <a
            href={socials.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#0c111c] hover:bg-[#151f33] border border-slate-800/90 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <span className="font-bold text-sm">TT</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-pink-400 transition-colors">
                  TikTok
                </h3>
                <p className="text-[11px] text-slate-400">@sanaullahai</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
          </a>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c111c] hover:bg-[#151f33] border border-slate-800/90 transition group">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  WhatsApp Support
                </h3>
                <p className="text-[11px] text-slate-400">{socials.whatsappNumber}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleCopyText(socials.whatsappNumber, "wa_num")}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
              >
                {copiedKey === "wa_num" ? "Copied" : "Copy"}
              </button>
              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1"
              >
                <span>Chat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Storage & Cache Management */}
      <section className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Storage & Cache</span>
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c111c] border border-slate-800/90">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100">
              Clear Local Data
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deletes cached chat messages and local history from this browser.
            </p>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition"
          >
            Clear Data
          </button>
        </div>

        {clearedNotice && (
          <div className="text-xs text-emerald-400 flex items-center space-x-1 font-semibold p-2">
            <Check className="w-4 h-4" />
            <span>Local data cleared successfully!</span>
          </div>
        )}

        {showClearConfirm && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
            <p className="text-xs text-rose-200 font-medium">
              Are you sure you want to clear all history and chat messages? This cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleClearEverything}
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* About App */}
      <section className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-cyan-500/20">
            S
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Sanaullah AI</h3>
            <p className="text-xs text-cyan-400 font-medium">
              Your AI Assistant for Content Creation
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
          <div className="flex justify-between py-1">
            <span>Version</span>
            <span className="font-mono text-slate-200">1.0.0 Production</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Interface</span>
            <span className="text-slate-200">Dark Modern Mobile-First</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Languages</span>
            <span className="text-slate-200">English, Urdu (اردو), Roman Urdu</span>
          </div>
        </div>
      </section>
    </div>
  );
};
