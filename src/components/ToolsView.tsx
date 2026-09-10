import React, { useState } from "react";
import {
  FileText,
  Lightbulb,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  Share2,
  Hash,
  Languages,
  Copy,
  Check,
  RotateCcw,
  Send,
  AlertCircle,
  Clock,
  ChevronDown,
  Layers,
  MessageSquare,
} from "lucide-react";
import { ToolId, AIProviderStatus } from "../types";
import {
  apiGenerateScript,
  apiGenerateVideoIdeas,
  apiGenerateThumbnailPrompt,
  apiImprovePrompt,
  apiGetEditingAdvice,
  apiGenerateCaptions,
  apiTranslate,
} from "../lib/api";
import { saveHistoryItem } from "../lib/storage";
import { ChatView } from "./ChatView";

interface ToolsViewProps {
  initialTool?: ToolId;
  providerStatus: AIProviderStatus | null;
  onNavigateToTab?: (tab: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  initialTool = "script",
  providerStatus,
  onNavigateToTab,
}) => {
  const [activeTool, setActiveTool] = useState<ToolId>(
    initialTool === "video" ? "script" : initialTool
  );
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Script State
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptPlatform, setScriptPlatform] = useState("YouTube Shorts");
  const [scriptDuration, setScriptDuration] = useState("60 seconds");
  const [scriptLanguage, setScriptLanguage] = useState("English");
  const [scriptTone, setScriptTone] = useState("Energetic & Engaging");
  const [scriptResult, setScriptResult] = useState<any | null>(null);

  // 2. Video Ideas State
  const [ideasTopic, setIdeasTopic] = useState("");
  const [ideasPlatform, setIdeasPlatform] = useState("YouTube & Shorts");
  const [ideasResult, setIdeasResult] = useState<any[] | null>(null);

  // 3. Thumbnail Prompt State
  const [thumbTitle, setThumbTitle] = useState("");
  const [thumbPlatform, setThumbPlatform] = useState("YouTube");
  const [thumbStyle, setThumbStyle] = useState("Hyper-realistic, 8k, vibrant lighting");
  const [thumbResult, setThumbResult] = useState<any | null>(null);

  // 4. Prompt Improver State
  const [rawPrompt, setRawPrompt] = useState("");
  const [improvedResult, setImprovedResult] = useState<any | null>(null);

  // 5. Editing Assistant State
  const [editSoftware, setEditSoftware] = useState<"CapCut" | "InShot" | "General">("CapCut");
  const [editTopic, setEditTopic] = useState("");
  const [editPacing, setEditPacing] = useState("Fast Paced & Hook Heavy");
  const [editResult, setEditResult] = useState<any | null>(null);

  // 6. Caption State
  const [captionTopic, setCaptionTopic] = useState("");
  const [captionPlatform, setCaptionPlatform] = useState<"YouTube" | "TikTok" | "Instagram">("TikTok");
  const [captionTone, setCaptionTone] = useState("Viral & Engaging");
  const [captionResult, setCaptionResult] = useState<any | null>(null);

  // 7. Hashtags State
  const [hashtagTopic, setHashtagTopic] = useState("");
  const [hashtagPlatform, setHashtagPlatform] = useState<"YouTube" | "TikTok" | "Instagram">("Instagram");
  const [hashtagResult, setHashtagResult] = useState<string[] | null>(null);

  // 8. Translator State
  const [transText, setTransText] = useState("");
  const [transFrom, setTransFrom] = useState<"English" | "Urdu" | "Roman Urdu">("English");
  const [transTo, setTransTo] = useState<"English" | "Urdu" | "Roman Urdu">("Roman Urdu");
  const [transResult, setTransResult] = useState<any | null>(null);

  const toolTabs = [
    { id: "chat" as ToolId, label: "AI Chat", icon: MessageSquare },
    { id: "script" as ToolId, label: "Script Generator", icon: FileText },
    { id: "ideas" as ToolId, label: "Video Ideas", icon: Lightbulb },
    { id: "thumbnail" as ToolId, label: "Thumbnail Prompt", icon: ImageIcon },
    { id: "prompt_improver" as ToolId, label: "Video Prompt", icon: Sparkles },
    { id: "editing" as ToolId, label: "Editing Assistant", icon: Scissors },
    { id: "caption" as ToolId, label: "Captions", icon: Share2 },
    { id: "hashtags" as ToolId, label: "Hashtags", icon: Hash },
    { id: "translate" as ToolId, label: "Translator", icon: Languages },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handlers for each tool
  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptTopic.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateScript({
        topic: scriptTopic.trim(),
        platform: scriptPlatform,
        duration: scriptDuration,
        language: scriptLanguage,
        tone: scriptTone,
      });
      setScriptResult(res);
      saveHistoryItem({
        type: "script",
        title: scriptTopic.slice(0, 40),
        subtitle: `${scriptPlatform} • ${scriptLanguage}`,
        content: res.fullText,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideasTopic.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateVideoIdeas({
        topic: ideasTopic.trim(),
        platform: ideasPlatform,
      });
      setIdeasResult(res.ideas);
      saveHistoryItem({
        type: "ideas",
        title: ideasTopic.slice(0, 40),
        subtitle: `${res.ideas.length} ideas generated`,
        content: res.ideas.map((i) => `• ${i.title}\nHook: ${i.hook}`).join("\n\n"),
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbTitle.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateThumbnailPrompt({
        title: thumbTitle.trim(),
        platform: thumbPlatform,
        style: thumbStyle,
      });
      setThumbResult(res);
      saveHistoryItem({
        type: "thumbnail",
        title: thumbTitle.slice(0, 40),
        subtitle: `${thumbPlatform} Thumbnail Prompt`,
        content: res.fullPrompt,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImprovePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPrompt.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiImprovePrompt({ prompt: rawPrompt.trim() });
      setImprovedResult(res);
      saveHistoryItem({
        type: "prompt_improver",
        title: rawPrompt.slice(0, 40),
        subtitle: "Cinematic Video Prompt",
        content: res.fullPrompt,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetEditing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTopic.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGetEditingAdvice({
        software: editSoftware,
        videoTopic: editTopic.trim(),
        pacing: editPacing,
      });
      setEditResult(res);
      saveHistoryItem({
        type: "editing",
        title: editTopic.slice(0, 40),
        subtitle: `${editSoftware} Editing Guide`,
        content: res.summary,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaptions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionTopic.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateCaptions({
        topic: captionTopic.trim(),
        platform: captionPlatform,
        tone: captionTone,
      });
      setCaptionResult(res);
      saveHistoryItem({
        type: "caption",
        title: captionTopic.slice(0, 40),
        subtitle: `${captionPlatform} Captions`,
        content: res.engagingCaption,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHashtags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashtagTopic.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateCaptions({
        topic: hashtagTopic.trim(),
        platform: hashtagPlatform,
      });
      setHashtagResult(res.hashtags);
      saveHistoryItem({
        type: "hashtags",
        title: hashtagTopic.slice(0, 40),
        subtitle: `${hashtagPlatform} Hashtags`,
        content: res.hashtags.join(" "),
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transText.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiTranslate({
        text: transText.trim(),
        from: transFrom,
        to: transTo,
      });
      setTransResult(res);
      saveHistoryItem({
        type: "translate",
        title: `${transFrom} → ${transTo}`,
        subtitle: transText.slice(0, 30),
        content: res.translatedText,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Generation failed. Please check your settings or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto">
      {/* Horizontal pill tabs for all tools */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {toolTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setErrorMessage(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                isActive
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40"
                  : "bg-[#111726] text-slate-400 hover:text-slate-200 hover:bg-[#161f33] border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* 0. Chat View */}
      {activeTool === "chat" && (
        <ChatView providerStatus={providerStatus} />
      )}

      {/* 1. Script Generator */}
      {activeTool === "script" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Script Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-retention video scripts for YouTube, Shorts, TikTok, and Reels.
              </p>
            </div>

            <form onSubmit={handleGenerateScript} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Topic or Video Title
                </label>
                <input
                  type="text"
                  value={scriptTopic}
                  onChange={(e) => setScriptTopic(e.target.value)}
                  placeholder="e.g. 5 Morning Habits that Changed My Life"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Platform
                  </label>
                  <select
                    value={scriptPlatform}
                    onChange={(e) => setScriptPlatform(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>YouTube Shorts</option>
                    <option>YouTube Long Form</option>
                    <option>TikTok</option>
                    <option>Instagram Reels</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Duration
                  </label>
                  <select
                    value={scriptDuration}
                    onChange={(e) => setScriptDuration(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>30 seconds</option>
                    <option>60 seconds</option>
                    <option>2-3 minutes</option>
                    <option>5+ minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Language
                  </label>
                  <select
                    value={scriptLanguage}
                    onChange={(e) => setScriptLanguage(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>English</option>
                    <option>Urdu (اردو)</option>
                    <option>Roman Urdu</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Tone
                  </label>
                  <select
                    value={scriptTone}
                    onChange={(e) => setScriptTone(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>Energetic & Engaging</option>
                    <option>Professional & Authoritative</option>
                    <option>Casual & Relatable</option>
                    <option>Storytelling / Dramatic</option>
                    <option>Humorous</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !scriptTopic.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Generating Script..." : "Generate Script"}</span>
              </button>
            </form>
          </div>

          {/* Script Result Display */}
          {scriptResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Generated Script
                </span>
                <button
                  onClick={() => handleCopy(scriptResult.fullText, "script_full")}
                  className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30"
                >
                  {copiedKey === "script_full" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Full Script</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hook Card */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-400 uppercase">
                  <span>⚡ 3-Second Opening Hook</span>
                  <button
                    onClick={() => handleCopy(scriptResult.hook, "hook")}
                    className="hover:text-amber-200"
                  >
                    {copiedKey === "hook" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {scriptResult.hook}
                </p>
              </div>

              {/* Main Script */}
              <div className="p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-cyan-400 uppercase">
                  <span>🎬 Main Script</span>
                  <button
                    onClick={() => handleCopy(scriptResult.mainScript, "main_script")}
                    className="hover:text-cyan-200"
                  >
                    {copiedKey === "main_script" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {scriptResult.mainScript}
                </div>
              </div>

              {/* Ending & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Ending / Punchline
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    {scriptResult.ending}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase">
                    Call To Action
                  </span>
                  <p className="text-xs text-slate-100 font-medium">
                    {scriptResult.callToAction}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Video Ideas */}
      {activeTool === "ideas" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Video Ideas Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Discover viral video concepts, hooks, and formats for your niche.
              </p>
            </div>

            <form onSubmit={handleGenerateIdeas} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Topic or Niche
                </label>
                <input
                  type="text"
                  value={ideasTopic}
                  onChange={(e) => setIdeasTopic(e.target.value)}
                  placeholder="e.g. AI tools for beginners, crypto, cooking hacks"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Target Platform
                </label>
                <select
                  value={ideasPlatform}
                  onChange={(e) => setIdeasPlatform(e.target.value)}
                  className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                >
                  <option>YouTube Shorts & TikTok</option>
                  <option>YouTube Long Form</option>
                  <option>Instagram Reels</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !ideasTopic.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{loading ? "Generating Ideas..." : "Generate 5 Viral Ideas"}</span>
              </button>
            </form>
          </div>

          {/* Ideas List */}
          {ideasResult && (
            <div className="space-y-3">
              {ideasResult.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2 shadow-sm relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100">
                        {idea.title}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Title: ${idea.title}\nHook: ${idea.hook}\nConcept: ${idea.concept}\nFormat: ${idea.suggestedFormat}`,
                          `idea_${idx}`
                        )
                      }
                      className="text-slate-400 hover:text-cyan-400 transition"
                    >
                      {copiedKey === `idea_${idx}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="font-bold">Opening Hook: </span>
                    {idea.hook}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-400">Concept: </span>
                    {idea.concept}
                  </p>

                  <div className="text-[11px] text-cyan-400 font-medium">
                    <span>Format: </span>
                    {idea.suggestedFormat}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Thumbnail Prompt Generator */}
      {activeTool === "thumbnail" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-rose-400" />
                <span>Thumbnail Prompt Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-CTR Midjourney & DALL-E prompts optimized for YouTube & mobile thumbnails.
              </p>
            </div>

            <form onSubmit={handleGenerateThumbnail} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Video Title or Concept
                </label>
                <input
                  type="text"
                  value={thumbTitle}
                  onChange={(e) => setThumbTitle(e.target.value)}
                  placeholder="e.g. I Survived 100 Days in Minecraft Hardcore"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Platform
                  </label>
                  <select
                    value={thumbPlatform}
                    onChange={(e) => setThumbPlatform(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>YouTube 16:9</option>
                    <option>Shorts / Reels 9:16</option>
                    <option>Instagram Square 1:1</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Art Style
                  </label>
                  <select
                    value={thumbStyle}
                    onChange={(e) => setThumbStyle(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>Hyper-realistic, 8k, vibrant lighting</option>
                    <option>3D Pixar Animation style</option>
                    <option>Cinematic dramatic moody portrait</option>
                    <option>MrBeast punchy saturated high-contrast</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !thumbTitle.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Crafting Prompt..." : "Generate Thumbnail Prompt"}</span>
              </button>
            </form>
          </div>

          {/* Thumbnail Result */}
          {thumbResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Ready-to-Copy Prompt
                </span>
                <button
                  onClick={() => handleCopy(thumbResult.fullPrompt, "thumb_full")}
                  className="flex items-center space-x-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30"
                >
                  {copiedKey === "thumb_full" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Prompt</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 text-xs sm:text-sm text-slate-100 font-mono leading-relaxed select-all">
                {thumbResult.fullPrompt}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-rose-400 font-semibold">Subject: </span>
                  {thumbResult.subject}
                </div>
                <div>
                  <span className="text-rose-400 font-semibold">Lighting: </span>
                  {thumbResult.lighting}
                </div>
                <div>
                  <span className="text-rose-400 font-semibold">Emotion: </span>
                  {thumbResult.emotion}
                </div>
                <div>
                  <span className="text-rose-400 font-semibold">Colors: </span>
                  {thumbResult.colors}
                </div>
                <div className="col-span-2">
                  <span className="text-rose-400 font-semibold">Text Placement: </span>
                  {thumbResult.textPlacement}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. AI Video Prompt (Prompt Improver) */}
      {activeTool === "prompt_improver" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>AI Video Prompt Improver</span>
              </h2>
              <p className="text-xs text-slate-400">
                Convert simple phrases (e.g. &quot;A boy walking in a city&quot;) into detailed cinematic prompts.
              </p>
            </div>

            <form onSubmit={handleImprovePrompt} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Basic Idea / Simple Phrase
                </label>
                <textarea
                  rows={2}
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  placeholder="e.g. A boy walking in a city"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !rawPrompt.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Enhancing Prompt..." : "Improve Prompt"}</span>
              </button>
            </form>
          </div>

          {/* Improved Result */}
          {improvedResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase">
                  Cinematic Expanded Prompt
                </span>
                <button
                  onClick={() => handleCopy(improvedResult.fullPrompt, "improved_full")}
                  className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30"
                >
                  {copiedKey === "improved_full" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <p className="p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                {improvedResult.fullPrompt}
              </p>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Subject:</span>
                  <span className="text-slate-300">{improvedResult.subject}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Environment:</span>
                  <span className="text-slate-300">{improvedResult.environment}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Camera Movement:</span>
                  <span className="text-slate-300">{improvedResult.cameraMovement}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Lighting:</span>
                  <span className="text-slate-300">{improvedResult.lighting}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Visual Style:</span>
                  <span className="text-slate-300">{improvedResult.visualStyle}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1422] border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-0.5">Motion & Composition:</span>
                  <span className="text-slate-300">{improvedResult.motion} • {improvedResult.composition}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Editing Assistant */}
      {activeTool === "editing" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Scissors className="w-5 h-5 text-sky-400" />
                <span>Video Editing Assistant</span>
              </h2>
              <p className="text-xs text-slate-400">
                Practical, beginner-friendly editing recipes for CapCut, InShot, and general software.
              </p>
            </div>

            <form onSubmit={handleGetEditing} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Video Topic & Concept
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="e.g. 30s TikTok fitness transformation, tech review"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Editing Software
                  </label>
                  <select
                    value={editSoftware}
                    onChange={(e) => setEditSoftware(e.target.value as any)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="CapCut">CapCut (Mobile & Desktop)</option>
                    <option value="InShot">InShot</option>
                    <option value="General">General Video Editing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Pacing / Style
                  </label>
                  <select
                    value={editPacing}
                    onChange={(e) => setEditPacing(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>Fast Paced & Hook Heavy</option>
                    <option>Cinematic & Atmospheric</option>
                    <option>Tutorial / Step-by-Step</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !editTopic.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Scissors className="w-4 h-4" />
                <span>{loading ? "Generating Guide..." : "Get Editing Recommendations"}</span>
              </button>
            </form>
          </div>

          {/* Editing Guide Result */}
          {editResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-sky-400 uppercase">
                  {editResult.software} Recommendations
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  {editResult.summary}
                </p>
              </div>

              {/* Breakdown Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Transitions */}
                <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400">✨ Transitions:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {editResult.transitions.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Text Animations */}
                <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400">🔤 Text Animations:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {editResult.textAnimations.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Sound Effects & Music */}
                <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400">🔊 SFX & Music Timing:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {editResult.soundEffects.concat(editResult.musicTiming).slice(0, 4).map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Zoom & Keyframes */}
                <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400">🔍 Zoom & Keyframes:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {editResult.zoomEffects.concat(editResult.keyframes).slice(0, 4).map((z: string, i: number) => (
                      <li key={i}>{z}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Beginner Tips */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 text-xs">
                <span className="font-bold text-cyan-300">💡 Step-by-Step Beginner Tips for {editResult.software}:</span>
                <ul className="list-decimal list-inside text-slate-200 space-y-1">
                  {editResult.beginnerTips.map((tip: string, i: number) => (
                    <li key={i} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Caption Generator */}
      {activeTool === "caption" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-lime-400" />
                <span>Caption Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-engagement social media captions with emojis and viral hooks.
              </p>
            </div>

            <form onSubmit={handleGenerateCaptions} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Video or Post Topic
                </label>
                <input
                  type="text"
                  value={captionTopic}
                  onChange={(e) => setCaptionTopic(e.target.value)}
                  placeholder="e.g. 3 tools that will save you 10 hours a week"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Platform
                  </label>
                  <select
                    value={captionPlatform}
                    onChange={(e) => setCaptionPlatform(e.target.value as any)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    Tone
                  </label>
                  <select
                    value={captionTone}
                    onChange={(e) => setCaptionTone(e.target.value)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option>Viral & Engaging</option>
                    <option>Humorous & Relatable</option>
                    <option>Informative & Value-Packed</option>
                    <option>Short & Minimalist</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !captionTopic.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Share2 className="w-4 h-4" />
                <span>{loading ? "Writing Captions..." : "Generate Captions"}</span>
              </button>
            </form>
          </div>

          {/* Caption Results */}
          {captionResult && (
            <div className="space-y-3">
              {/* Short */}
              <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-lime-400">
                  <span>⚡ Short & Punchy</span>
                  <button
                    onClick={() => handleCopy(captionResult.shortCaption, "cap_short")}
                    className="hover:text-lime-200"
                  >
                    {copiedKey === "cap_short" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap">
                  {captionResult.shortCaption}
                </p>
              </div>

              {/* Engaging */}
              <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span>🔥 Engaging with CTA</span>
                  <button
                    onClick={() => handleCopy(captionResult.engagingCaption, "cap_eng")}
                    className="hover:text-cyan-200"
                  >
                    {copiedKey === "cap_eng" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap">
                  {captionResult.engagingCaption}
                </p>
              </div>

              {/* Story */}
              <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                  <span>📖 Mini-Story Style</span>
                  <button
                    onClick={() => handleCopy(captionResult.storyCaption, "cap_story")}
                    className="hover:text-purple-200"
                  >
                    {copiedKey === "cap_story" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap">
                  {captionResult.storyCaption}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Hashtag Generator */}
      {activeTool === "hashtags" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Hash className="w-5 h-5 text-fuchsia-400" />
                <span>Hashtag Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate trending and niche hashtags optimized for algorithm reach.
              </p>
            </div>

            <form onSubmit={handleGenerateHashtags} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Topic or Video Niche
                </label>
                <input
                  type="text"
                  value={hashtagTopic}
                  onChange={(e) => setHashtagTopic(e.target.value)}
                  placeholder="e.g. AI content creator, video editing, Pakistani food"
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Platform
                </label>
                <select
                  value={hashtagPlatform}
                  onChange={(e) => setHashtagPlatform(e.target.value as any)}
                  className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !hashtagTopic.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Hash className="w-4 h-4" />
                <span>{loading ? "Finding Hashtags..." : "Generate Hashtags"}</span>
              </button>
            </form>
          </div>

          {/* Hashtag Results */}
          {hashtagResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-fuchsia-400 uppercase">
                  {hashtagResult.length} Targeted Hashtags
                </span>
                <button
                  onClick={() => handleCopy(hashtagResult.join(" "), "hash_all")}
                  className="flex items-center space-x-1 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/30"
                >
                  {copiedKey === "hash_all" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {hashtagResult.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `tag_${idx}`)}
                    className="text-xs bg-[#0e1422] hover:bg-[#161f33] text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg transition active:scale-95"
                  >
                    {tag}
                    {copiedKey === `tag_${idx}` && (
                      <span className="text-[10px] text-emerald-400 ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Translator */}
      {activeTool === "translate" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Languages className="w-5 h-5 text-cyan-400" />
                <span>Content Translator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Natural translations between English, standard Urdu, and conversational Roman Urdu.
              </p>
            </div>

            <form onSubmit={handleTranslate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    From
                  </label>
                  <select
                    value={transFrom}
                    onChange={(e) => setTransFrom(e.target.value as any)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Roman Urdu">Roman Urdu</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">
                    To
                  </label>
                  <select
                    value={transTo}
                    onChange={(e) => setTransTo(e.target.value as any)}
                    className="w-full mt-1 bg-[#0e1422] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="Roman Urdu">Roman Urdu</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Text to Translate
                </label>
                <textarea
                  rows={3}
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full mt-1 bg-[#0e1422] text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !transText.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition active:scale-[0.99]"
              >
                <Languages className="w-4 h-4" />
                <span>{loading ? "Translating..." : "Translate Content"}</span>
              </button>
            </form>
          </div>

          {/* Translation Result */}
          {transResult && (
            <div className="rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  {transFrom} → {transTo}
                </span>
                <button
                  onClick={() => handleCopy(transResult.translatedText, "trans_res")}
                  className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30"
                >
                  {copiedKey === "trans_res" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Translation</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className={`p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 text-xs sm:text-sm text-slate-100 leading-relaxed ${
                  transTo === "Urdu" ? "font-urdu text-right text-base" : ""
                }`}
              >
                {transResult.translatedText}
              </div>

              {transResult.notes && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: {transResult.notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
