import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Video,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  Share2,
  Hash,
  Languages,
  ChevronRight,
  Zap,
  Play,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { AppTab, ToolId, HistoryItem, AIProviderStatus } from "../types";

interface HomeViewProps {
  onSelectTab: (tab: AppTab) => void;
  onSelectTool: (toolId: ToolId) => void;
  recentHistory: HistoryItem[];
  providerStatus: AIProviderStatus | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onSelectTool,
  recentHistory,
  providerStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const tools = useMemo(
    () => [
      {
        id: "chat" as ToolId,
        name: "AI Chat",
        desc: "Conversational assistant in English, Urdu & Roman Urdu",
        icon: MessageSquare,
        color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
        category: "Chat & Advice",
        keywords: ["chat", "talk", "urdu", "roman urdu", "conversation", "ask", "assistant"],
        tab: "tools" as AppTab,
      },
      {
        id: "video" as ToolId,
        name: "AI Video",
        desc: "Generate real 9:16 & 16:9 videos from text prompts or photos",
        icon: Video,
        color: "from-purple-500/20 to-pink-500/20 text-pink-400 border-pink-500/30",
        category: "Production",
        keywords: ["video", "veo", "generate", "cinematic", "shorts", "reels", "image to video", "render"],
        badge: "FEATURED",
        tab: "video" as AppTab,
      },
      {
        id: "script" as ToolId,
        name: "Script Generator",
        desc: "Viral Hooks, Main Script & CTAs for YouTube, Shorts & TikTok",
        icon: FileText,
        color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
        category: "Writing",
        keywords: ["script", "hook", "story", "youtube", "tiktok", "reels", "writer", "voiceover"],
        tab: "tools" as AppTab,
      },
      {
        id: "ideas" as ToolId,
        name: "Video Ideas",
        desc: "High-retention concepts, trending hooks & format formulas",
        icon: Lightbulb,
        color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
        category: "Ideation",
        keywords: ["ideas", "brainstorm", "concept", "viral", "trending", "topics", "content plan"],
        tab: "tools" as AppTab,
      },
      {
        id: "thumbnail" as ToolId,
        name: "Thumbnail Prompt",
        desc: "Detailed Midjourney & DALL-E prompts engineered for high CTR",
        icon: ImageIcon,
        color: "from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30",
        category: "Graphics",
        keywords: ["thumbnail", "image", "midjourney", "dalle", "cover", "photo", "ctr", "art"],
        tab: "tools" as AppTab,
      },
      {
        id: "prompt_improver" as ToolId,
        name: "AI Video Prompt",
        desc: "Expand simple phrases into cinematic lighting, camera & motion prompts",
        icon: Sparkles,
        color: "from-violet-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30",
        category: "Enhancer",
        keywords: ["prompt", "improve", "cinematic", "camera", "lighting", "director", "motion"],
        tab: "tools" as AppTab,
      },
      {
        id: "editing" as ToolId,
        name: "Editing Assistant",
        desc: "Practical CapCut, InShot, keyframes, transitions & music timing",
        icon: Scissors,
        color: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
        category: "Post-Production",
        keywords: ["editing", "capcut", "inshot", "transitions", "keyframes", "cuts", "sfx", "sound"],
        tab: "tools" as AppTab,
      },
      {
        id: "caption" as ToolId,
        name: "Caption Generator",
        desc: "Engaging captions with emojis and hooks for YouTube, IG & TikTok",
        icon: Share2,
        color: "from-lime-500/20 to-emerald-500/20 text-lime-400 border-lime-500/30",
        category: "Social",
        keywords: ["caption", "description", "instagram", "tiktok", "post", "emojis", "copy"],
        tab: "tools" as AppTab,
      },
      {
        id: "hashtags" as ToolId,
        name: "Hashtag Generator",
        desc: "Trending, niche, and high-reach tag groupings for maximum views",
        icon: Hash,
        color: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30",
        category: "Growth",
        keywords: ["hashtag", "tags", "reach", "algorithm", "trending", "seo"],
        tab: "tools" as AppTab,
      },
      {
        id: "translate" as ToolId,
        name: "Translator",
        desc: "Natural translation between English, authentic Urdu & Roman Urdu",
        icon: Languages,
        color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
        category: "Localization",
        keywords: ["translate", "translator", "urdu", "english", "roman urdu", "tarjuma", "language"],
        tab: "tools" as AppTab,
      },
    ],
    []
  );

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Filter tools based on search
  const filteredTools = useMemo(() => {
    if (!cleanQuery) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(cleanQuery) ||
        t.desc.toLowerCase().includes(cleanQuery) ||
        t.category.toLowerCase().includes(cleanQuery) ||
        t.keywords.some((k) => k.includes(cleanQuery))
    );
  }, [tools, cleanQuery]);

  // Filter recent history based on search
  const filteredHistory = useMemo(() => {
    if (!cleanQuery) return recentHistory;
    return recentHistory.filter(
      (item) =>
        item.title.toLowerCase().includes(cleanQuery) ||
        item.content.toLowerCase().includes(cleanQuery) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(cleanQuery)) ||
        item.type.toLowerCase().includes(cleanQuery)
    );
  }, [recentHistory, cleanQuery]);

  const quickPillSearches = ["Video", "Script", "Urdu", "Thumbnail", "Editing", "Captions"];

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Hero Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f1724] border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Assistant for Content Creation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to Sanaullah AI 👋
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Create, chat, write and generate content with AI. Designed specially for
            modern creators across YouTube, TikTok, Reels, and social media.
          </p>

          {/* Quick CTA row */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onSelectTab("video")}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Create AI Video</span>
            </button>

            <button
              onClick={() => onSelectTool("chat")}
              className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-700 active:scale-95 transition"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Chat Assistant</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Provider Status Alert if not configured */}
      {providerStatus && !providerStatus.configured && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-4 flex items-start space-x-3 text-amber-200 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-amber-300">
              AI Provider Setup Required
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              AI provider is not configured yet. Please configure the API key in Settings &gt; Secrets or environment variables to enable all AI tools.
            </p>
            <button
              onClick={() => onSelectTab("settings")}
              className="inline-flex items-center text-xs font-bold text-amber-300 underline hover:text-amber-100 pt-1"
            >
              View Settings & Provider Status <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Search Bar Section */}
      <section className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools or recent history (e.g. script, video, urdu)..."
            className="w-full bg-[#111726] hover:bg-[#141c2e] focus:bg-[#111726] text-slate-100 text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl border border-slate-800 focus:border-cyan-500/60 focus:outline-none transition-all shadow-md placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center shrink-0">
            <SlidersHorizontal className="w-3 h-3 mr-1 text-slate-500" />
            Filters:
          </span>
          {quickPillSearches.map((tag) => {
            const isSelected = cleanQuery === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSearchQuery(isSelected ? "" : tag)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-cyan-500 text-white border-cyan-400 shadow-sm"
                    : "bg-[#111726] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Search Results Summary when active */}
        {cleanQuery && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span>
              Found <strong className="text-cyan-400">{filteredTools.length}</strong> tool{filteredTools.length === 1 ? "" : "s"} &amp;{" "}
              <strong className="text-cyan-400">{filteredHistory.length}</strong> history item{filteredHistory.length === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Reset search
            </button>
          </div>
        )}
      </section>

      {/* Tool Cards Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Creation Tools</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {filteredTools.length} of {tools.length}
            </span>
          </h2>
          {!cleanQuery && <span className="text-xs text-slate-400">Tap to open</span>}
        </div>

        {filteredTools.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#111726]/50 border border-slate-800 space-y-2">
            <p className="text-xs sm:text-sm text-slate-400">
              No creation tools matched &ldquo;<span className="text-slate-200">{searchQuery}</span>&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-block"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTools.map((t, idx) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === "video") {
                      onSelectTab("video");
                    } else {
                      onSelectTool(t.id);
                    }
                  }}
                  className="group relative flex items-start space-x-3.5 p-4 rounded-xl bg-[#111726]/80 hover:bg-[#151e30] border border-slate-800/90 hover:border-slate-700 text-left transition-all duration-150 active:scale-[0.99] shadow-sm"
                >
                  {/* Icon square */}
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} border flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-medium">
                        {idx + 1}.
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                        {t.name}
                      </h3>
                      {t.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>

                  {/* Right Arrow */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400 group-hover:text-cyan-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent History / Filtered History Section */}
      {recentHistory.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{cleanQuery ? "Matching History" : "Recent Creations"}</span>
              {cleanQuery && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {filteredHistory.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => onSelectTab("history")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {filteredHistory.length === 0 && cleanQuery ? (
            <div className="p-4 text-center rounded-xl bg-[#111726]/40 border border-slate-800 text-xs text-slate-400">
              No recent history items matched your search.
            </div>
          ) : (
            <div className="space-y-2">
              {(cleanQuery ? filteredHistory : filteredHistory.slice(0, 3)).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectTab("history")}
                  className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-[#111726]/60 hover:bg-[#151e30] border border-slate-800/80 transition"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.content}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
