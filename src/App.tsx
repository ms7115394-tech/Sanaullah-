/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppTab, ToolId, HistoryItem, AIProviderStatus } from "./types";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { ToolsView } from "./components/ToolsView";
import { VideoGeneratorView } from "./components/VideoGeneratorView";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { fetchProviderStatus } from "./lib/api";
import { getStoredHistory } from "./lib/storage";

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>("home");
  const [selectedTool, setSelectedTool] = useState<ToolId>("script");
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Refresh history from localStorage
  const refreshHistory = () => {
    setHistory(getStoredHistory());
  };

  useEffect(() => {
    refreshHistory();

    // Check backend provider status
    fetchProviderStatus()
      .then((status) => {
        setProviderStatus(status);
      })
      .catch((err) => {
        console.warn("Could not check AI provider status:", err);
      });
  }, []);

  const handleSelectTool = (toolId: ToolId) => {
    setSelectedTool(toolId);
    if (toolId === "video") {
      setCurrentTab("video");
    } else {
      setCurrentTab("tools");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Fixed top Header */}
      <Header
        onNavigateHome={() => setCurrentTab("home")}
        onOpenSettings={() => setCurrentTab("settings")}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md md:max-w-4xl mx-auto px-4 pt-3">
        {currentTab === "home" && (
          <HomeView
            onSelectTab={setCurrentTab}
            onSelectTool={handleSelectTool}
            recentHistory={history}
            providerStatus={providerStatus}
          />
        )}

        {currentTab === "tools" && (
          <ToolsView
            initialTool={selectedTool}
            providerStatus={providerStatus}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === "video" && (
          <VideoGeneratorView
            providerStatus={providerStatus}
            onViewHistory={() => setCurrentTab("history")}
          />
        )}

        {currentTab === "history" && (
          <HistoryView
            history={history}
            onRefreshHistory={refreshHistory}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === "settings" && (
          <SettingsView
            providerStatus={providerStatus}
            onRefreshHistory={refreshHistory}
          />
        )}
      </main>

      {/* Mobile-first bottom navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
}
