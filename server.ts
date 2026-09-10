import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  isAIConfigured,
  getApiKey,
  chat,
  generateScript,
  generateVideoIdeas,
  generateThumbnailPrompt,
  improvePrompt,
  getEditingAdvice,
  generateCaptions,
  translateText,
  generateVideo,
  pollVideoJob,
  videoJobs,
} from "./src/server/aiProvider";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // Helper error wrapper
  const handleAIError = (err: any, res: express.Response) => {
    console.error("AI API Error:", err);
    let msg = err?.message || String(err || "");

    // Extract message if nested inside raw stringified JSON
    try {
      if (typeof msg === "string" && (msg.startsWith("{") || msg.includes('{"error"'))) {
        const jsonStart = msg.indexOf("{");
        const parsed = JSON.parse(msg.slice(jsonStart));
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      }
    } catch (_) {}

    if (msg.includes("AI provider is not configured yet") || !isAIConfigured()) {
      return res.status(503).json({
        error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        code: "PROVIDER_NOT_CONFIGURED",
      });
    }

    if (
      msg.includes("high demand") ||
      msg.includes("503") ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("spikes in demand")
    ) {
      return res.status(503).json({
        error: "The AI service is experiencing high demand. Automatic retry is active, please try again in a few moments.",
        code: "MODEL_HIGH_DEMAND",
      });
    }

    return res.status(500).json({
      error: msg,
      code: "AI_GENERATION_ERROR",
    });
  };

  // 1. Status route
  app.get("/api/status", (req, res) => {
    const configured = isAIConfigured();
    res.json({
      status: "ok",
      configured,
      provider: "Google Gemini & Veo",
      models: {
        text: "gemini-3.8-flash (with automatic fallback)",
        video: "veo-3.1-lite-generate-preview",
      },
      message: configured
        ? "AI provider active and ready."
        : "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
      social: {
        youtube: process.env.YOUTUBE_URL || "https://www.youtube.com/@SanaullahAI",
        tiktok: process.env.TIKTOK_URL || "https://www.tiktok.com/@sanaullahai",
        whatsapp: process.env.WHATSAPP_NUMBER || "03477263532",
        whatsappUrl: `https://wa.me/92${(process.env.WHATSAPP_NUMBER || "03477263532").replace(/^0/, "")}`,
      },
    });
  });

  // 2. Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { message, history, language } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required." });
      }
      const reply = await chat({ message, history, language });
      res.json({ reply });
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 3. Script generator
  app.post("/api/generate-script", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { topic, duration, platform, language, tone } = req.body;
      if (!topic) return res.status(400).json({ error: "Topic is required." });
      const script = await generateScript({
        topic,
        duration: duration || "60 seconds",
        platform: platform || "YouTube Shorts",
        language: language || "English",
        tone: tone || "Energetic & Engaging",
      });
      res.json(script);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 4. Video ideas
  app.post("/api/video-ideas", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { topic, platform, niche } = req.body;
      if (!topic) return res.status(400).json({ error: "Topic is required." });
      const ideas = await generateVideoIdeas({ topic, platform, niche });
      res.json({ ideas });
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 5. Thumbnail prompt generator
  app.post("/api/thumbnail-prompt", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { title, platform, style } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required." });
      const promptData = await generateThumbnailPrompt({ title, platform, style });
      res.json(promptData);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 6. Video Prompt Improver
  app.post("/api/improve-prompt", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required." });
      const improved = await improvePrompt(prompt);
      res.json(improved);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 7. Editing Assistant
  app.post("/api/editing-assistant", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { software, videoTopic, pacing } = req.body;
      if (!videoTopic) return res.status(400).json({ error: "Video topic is required." });
      const advice = await getEditingAdvice({
        software: software || "CapCut",
        videoTopic,
        pacing,
      });
      res.json(advice);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 8. Captions & Hashtags
  app.post("/api/captions", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { topic, platform, tone } = req.body;
      if (!topic) return res.status(400).json({ error: "Topic is required." });
      const result = await generateCaptions({
        topic,
        platform: platform || "TikTok",
        tone,
      });
      res.json(result);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 9. Translator
  app.post("/api/translate", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { text, from, to } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required." });
      const translation = await translateText({ text, from, to });
      res.json(translation);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 10. AI Video: Generate Video
  app.post("/api/video/generate", async (req, res) => {
    try {
      if (!isAIConfigured()) {
        return res.status(503).json({
          error: "AI provider is not configured yet. Please configure your API key in Settings > Secrets.",
        });
      }
      const { prompt, image, duration, aspectRatio } = req.body;
      if (!prompt && !image) {
        return res.status(400).json({ error: "Prompt or image is required for video generation." });
      }
      const result = await generateVideo({
        prompt: prompt || "",
        image,
        duration: Number(duration) || 5,
        aspectRatio: aspectRatio || "9:16",
      });
      res.json(result);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 11. AI Video: Poll Status
  app.post("/api/video/status", async (req, res) => {
    try {
      const { jobId } = req.body;
      if (!jobId) return res.status(400).json({ error: "jobId is required." });
      const job = await pollVideoJob(jobId);
      res.json(job);
    } catch (err) {
      handleAIError(err, res);
    }
  });

  // 12. AI Video: Stream or Download
  app.get("/api/video/stream/:jobId", async (req, res) => {
    try {
      const job = videoJobs.get(req.params.jobId);
      if (!job || !job.operationName) {
        return res.status(404).json({ error: "Video job not found or incomplete." });
      }

      const { getAIClient } = await import("./src/server/aiProvider");
      const { GenerateVideosOperation } = await import("@google/genai");
      const ai = getAIClient();
      const op = new GenerateVideosOperation();
      op.name = job.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Video stream not available from provider." });
      }

      const apiKey = getApiKey();
      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": apiKey || "" },
      });

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="sanaullah_ai_${job.id}.mp4"`);

      if (videoRes.body) {
        // @ts-ignore
        videoRes.body.pipeTo(
          new WritableStream({
            write(chunk) {
              res.write(chunk);
            },
            close() {
              res.end();
            },
          })
        );
      } else {
        const buffer = await videoRes.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (err) {
      console.error("Video stream error:", err);
      res.status(500).json({ error: "Failed to stream video from provider." });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sanaullah AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
