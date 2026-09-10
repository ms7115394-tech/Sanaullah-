import React from "react";
import { Sparkles, Bot, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { AIProviderStatus, AppTab } from "../types";

interface HeaderProps {
  currentTab: AppTab;
  providerStatus: AIProviderStatus | null;
  loadingStatus: boolean;
  onRefreshStatus: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  providerStatus,
  loadingStatus,
  onRefreshStatus,
  onOpenSettings,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case "home":
        return "Dashboard";
      case "tools":
        return "AI Content Tools";
      case "video":
        return "AI Video Generator";
      case "history":
        return "My History";
      case "settings":
        return "Settings & About";
      default:
        return "Sanaullah AI";
    }
  };

  const isConfigured = providerStatus?.configured;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Sanaullah AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Your AI Assistant for Content Creation
            </p>
          </div>
        </div>

        {/* Status pill & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all ${
              isConfigured
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40"
                : "bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40"
            }`}
            title={
              isConfigured
                ? "AI Provider Connected & Ready"
                : "AI Provider setup required"
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="hidden xs:inline">
              {isConfigured ? "AI Online" : "Provider Setup"}
            </span>
          </button>

          <button
            onClick={onRefreshStatus}
            disabled={loadingStatus}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Refresh Provider Status"
            aria-label="Refresh status"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingStatus ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
