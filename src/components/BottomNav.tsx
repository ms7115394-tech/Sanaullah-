import React from "react";
import {
  Home,
  Wand2,
  Video,
  Clock,
  Settings,
} from "lucide-react";
import { AppTab } from "../types";

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: "home" as AppTab, label: "Home", icon: Home },
    { id: "tools" as AppTab, label: "AI Tools", icon: Wand2 },
    { id: "video" as AppTab, label: "AI Video", icon: Video, badge: "NEW" },
    { id: "history" as AppTab, label: "History", icon: Clock },
    { id: "settings" as AppTab, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-lg border-t border-slate-800/80 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all select-none ${
                isActive
                  ? "text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
              style={{ minHeight: "54px" }}
            >
              {/* Badge if any */}
              {tab.badge && (
                <span className="absolute top-1 right-2 sm:right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-tight shadow-sm">
                  {tab.badge}
                </span>
              )}

              {/* Active glow pill */}
              {isActive && (
                <span className="absolute inset-0 bg-cyan-500/10 rounded-xl -z-10 border border-cyan-500/20" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110 text-cyan-400" : ""
                }`}
              />
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
