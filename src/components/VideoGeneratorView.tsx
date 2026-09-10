import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Upload,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  FileImage,
  Layers,
  Wand2,
} from "lucide-react";
import { VideoGenerationJob, AIProviderStatus } from "../types";
import {
  apiGenerateVideo,
  apiPollVideoStatus,
  apiImprovePrompt,
} from "../lib/api";
import { saveHistoryItem } from "../lib/storage";

interface VideoGeneratorViewProps {
  providerStatus: AIProviderStatus | null;
  onViewHistory?: () => void;
}

export const VideoGeneratorView: React.FC<VideoGeneratorViewProps> = ({
  providerStatus,
  onViewHistory,
}) => {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");

  // Job state
  const [currentJob, setCurrentJob] = useState<VideoGenerationJob | null>(null);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [improvedPromptDetails, setImprovedPromptDetails] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll job status
  useEffect(() => {
    if (!currentJob || currentJob.status === "completed" || currentJob.status === "failed") {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const update = await apiPollVideoStatus(currentJob.id);
        setCurrentJob((prev) => {
          if (!prev) return null;
          const updatedJob: VideoGenerationJob = {
            ...prev,
            status: update.status,
            progress: update.progress || prev.progress,
            videoUrl: update.videoUrl || prev.videoUrl,
            error: update.error || prev.error,
          };

          // If freshly completed, save to history
          if (update.status === "completed" && prev.status !== "completed") {
            saveHistoryItem({
              type: "video",
              title: prev.prompt.slice(0, 40) || "AI Generated Video",
              subtitle: `${prev.aspectRatio} • ${prev.duration}s`,
              content: prev.prompt,
              metadata: {
                videoUrl: update.videoUrl,
                aspectRatio: prev.aspectRatio,
                duration: prev.duration,
              },
            });
          }

          return updatedJob;
        });

        if (update.status === "completed" || update.status === "failed") {
          clearInterval(pollIntervalRef.current);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [currentJob?.id, currentJob?.status]);

  // Handle file select (click or drop)
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setMode("image");
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Improve Prompt
  const handleImprovePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a basic prompt first to improve it.");
      return;
    }
    setErrorMsg(null);
    setIsImprovingPrompt(true);
    try {
      const res = await apiImprovePrompt({ prompt: prompt.trim() });
      setPrompt(res.fullPrompt);
      setImprovedPromptDetails(res);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Could not enhance prompt. Please try again in a moment."
      );
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  // Start Generation
  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !selectedImage) {
      setErrorMsg("Please enter a prompt or upload an image to generate a video.");
      return;
    }

    setErrorMsg(null);
    setImprovedPromptDetails(null);

    try {
      const initialJob: VideoGenerationJob = {
        id: "temp_" + Date.now(),
        prompt: prompt.trim() || "Dynamic video animation",
        image: selectedImage || undefined,
        duration,
        aspectRatio,
        status: "queued",
        progress: 15,
        createdAt: Date.now(),
      };
      setCurrentJob(initialJob);

      const res = await apiGenerateVideo({
        prompt: prompt.trim(),
        image: selectedImage || undefined,
        duration,
        aspectRatio,
      });

      setCurrentJob((prev) =>
        prev
          ? {
              ...prev,
              id: res.jobId,
              status: res.status,
              progress: 25,
            }
          : null
      );
    } catch (err: any) {
      console.error("Video generation failed:", err);
      const msg =
        err?.message ||
        "Video generation could not be completed. Please try again in a few moments.";
      setErrorMsg(msg);
      setCurrentJob((prev) => (prev ? { ...prev, status: "failed", error: msg } : null));
    }
  };

  const handleReset = () => {
    setCurrentJob(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header section */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
          <Video className="w-3.5 h-3.5 text-pink-400" />
          <span>Real AI Video Generator</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          AI Video Creation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transform text prompts or reference photos into high-definition videos with natural camera motion.
        </p>
      </div>

      {/* Mode Switcher: Text to Video vs Image to Video */}
      <div className="grid grid-cols-2 p-1 bg-[#111726] border border-slate-800 rounded-xl">
        <button
          onClick={() => setMode("text")}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            mode === "text"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Text to Video
        </button>
        <button
          onClick={() => setMode("image")}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            mode === "image"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Image to Video
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Active Generation State or Results Display */}
      {currentJob ? (
        <div className="rounded-2xl bg-[#111726] border border-slate-800 p-5 space-y-4 shadow-xl">
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentJob.status === "completed"
                    ? "bg-emerald-400"
                    : currentJob.status === "failed"
                    ? "bg-rose-400"
                    : "bg-cyan-400 animate-ping"
                }`}
              />
              <span className="font-bold text-sm text-slate-100 capitalize">
                Status: {currentJob.status}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {currentJob.aspectRatio} • {currentJob.duration}s
            </span>
          </div>

          {/* Queued / Starting / Generating Progress Card */}
          {(currentJob.status === "queued" ||
            currentJob.status === "starting" ||
            currentJob.status === "generating") && (
            <div className="py-8 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Video className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">
                  {currentJob.status === "queued" && "Queued in AI Pipeline..."}
                  {currentJob.status === "starting" && "Initializing Video Model..."}
                  {currentJob.status === "generating" && "Rendering High-Definition Frames..."}
                </h3>
                <p className="text-xs text-slate-400">
                  AI video generation processes cinematic lighting and camera physics. Please keep this screen open.
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto space-y-1.5">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                  <span>Starting</span>
                  <span>Rendering ({currentJob.progress}%)</span>
                  <span>Finalizing</span>
                </div>
              </div>
            </div>
          )}

          {/* Completed State */}
          {currentJob.status === "completed" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Video Generation Completed Successfully!</span>
              </div>

              {/* Video Player */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-700 flex items-center justify-center">
                {currentJob.videoUrl ? (
                  <video
                    src={currentJob.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Video rendered. Ready for download.
                  </div>
                )}
              </div>

              {/* Prompt replay */}
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 font-semibold">Prompt: </span>
                {currentJob.prompt}
              </p>

              {/* Action Buttons: Save/Download, Generate Again */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {currentJob.videoUrl && (
                  <a
                    href={currentJob.videoUrl}
                    download={`sanaullah_ai_${currentJob.id}.mp4`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video</span>
                  </a>
                )}

                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Generate Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {currentJob.status === "failed" && (
            <div className="space-y-3 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Generation Encountered an Error
              </h3>
              <p className="text-xs text-rose-300 bg-rose-950/30 p-3 rounded-lg border border-rose-900/40 max-w-md mx-auto">
                {currentJob.error ||
                  "The AI service is temporarily experiencing high demand or an issue. Please try again shortly."}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Form View */
        <div className="space-y-4 rounded-2xl bg-[#111726] border border-slate-800 p-4 sm:p-5 shadow-xl">
          {/* Optional Image Upload if mode === image */}
          {mode === "image" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Reference / Starting Image (Required for Image to Video)</span>
                {selectedImage && (
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center"
                  >
                    <X className="w-3 h-3 mr-0.5" /> Remove
                  </button>
                )}
              </label>

              {selectedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black max-h-56 flex items-center justify-center group">
                  <img
                    src={selectedImage}
                    alt="Upload preview"
                    className="max-h-56 w-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-slate-900/90 text-white font-semibold px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      Replace Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-[#0e1422] rounded-xl p-6 text-center cursor-pointer transition"
                >
                  <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-200">
                    Click to upload or drag & drop image
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, or WEBP (Max 15MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {/* Prompt input with "Improve Prompt" Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Video Prompt
              </label>

              {/* Improve Prompt Button */}
              <button
                type="button"
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt || !prompt.trim()}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Expand into cinematic prompt with camera, lighting and motion breakdown"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isImprovingPrompt ? "animate-spin text-cyan-300" : ""
                  }`}
                />
                <span>
                  {isImprovingPrompt ? "Improving..." : "Improve Prompt"}
                </span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A young creator filming an unboxing video in a neon-lit studio, cinematic lighting, slow zoom-in..."
              className="w-full bg-[#0e1422] text-slate-100 text-xs sm:text-sm placeholder-slate-500 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
            />

            {/* Prompt breakdown card if improved */}
            {improvedPromptDetails && (
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>✨ Enhanced Cinematic Breakdown:</span>
                  <button
                    onClick={() => setImprovedPromptDetails(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
                  <div>
                    <span className="text-cyan-400 font-semibold">Subject: </span>
                    {improvedPromptDetails.subject}
                  </div>
                  <div>
                    <span className="text-cyan-400 font-semibold">Camera: </span>
                    {improvedPromptDetails.cameraMovement}
                  </div>
                  <div>
                    <span className="text-cyan-400 font-semibold">Lighting: </span>
                    {improvedPromptDetails.lighting}
                  </div>
                  <div>
                    <span className="text-cyan-400 font-semibold">Style: </span>
                    {improvedPromptDetails.visualStyle}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Duration & Aspect Ratio Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["9:16", "16:9", "1:1"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      aspectRatio === ratio
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-[#0e1422] border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ratio}
                    <span className="block text-[9px] font-normal text-slate-500">
                      {ratio === "9:16" ? "Shorts" : ratio === "16:9" ? "YouTube" : "Post"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Duration (Default 5s)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[5, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      duration === d
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-[#0e1422] border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {d} Seconds
                    <span className="block text-[9px] font-normal text-slate-500">
                      {d === 5 ? "Fast Render" : "Extended"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={!prompt.trim() && !selectedImage}
            className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Generate Video</span>
          </button>
        </div>
      )}
    </div>
  );
};
