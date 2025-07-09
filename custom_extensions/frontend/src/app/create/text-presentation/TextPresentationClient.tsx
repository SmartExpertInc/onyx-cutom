"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

export default function TextPresentationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get parameters from URL
  const prompt = searchParams?.get("prompt") || "";
  const outlineId = searchParams?.get("outlineId");
  const lesson = searchParams?.get("lesson");
  const courseName = searchParams?.get("courseName");
  const lang = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const textMode = searchParams?.get("textMode") as 'context' | 'base' | null;
  const folderIds = searchParams?.get("folderIds")?.split(',').filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(',').filter(Boolean) || [];

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [generatedProjectId, setGeneratedProjectId] = useState<number | null>(null);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/init-chat`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setChatId(data.chatSessionId);
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    };
    initChat();
  }, []);

  const handleGenerate = async () => {
    if (!chatId) {
      setError("Chat session not initialized");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare the request payload
      const payload: any = {
        chatSessionId: chatId,
        language: lang,
      };

      if (outlineId && lesson) {
        // Using existing outline
        payload.outlineId = Number(outlineId);
        payload.lesson = lesson;
        if (courseName) {
          payload.courseName = courseName;
        }
      } else {
        // Standalone text presentation
        payload.prompt = prompt;
        
        if (fromFiles) {
          payload.fromFiles = true;
          if (folderIds.length > 0) payload.folderIds = folderIds;
          if (fileIds.length > 0) payload.fileIds = fileIds;
        } else if (fromText) {
          payload.fromText = true;
          payload.textMode = textMode || 'context';
          // userText is retrieved from sessionStorage in the backend
        }
      }

      const res = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setGeneratedProjectId(data.projectId);
      
      // Redirect to the generated project
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate text presentation");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4 text-gray-900">
        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-5xl font-semibold text-center tracking-wide text-gray-700 mt-8">
          Text Presentation
        </h1>
        <p className="text-center text-gray-600 text-lg -mt-1">
          Generate a comprehensive text presentation
        </p>

        {/* Context indicator */}
        {(fromFiles || fromText || outlineId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <FileText className="h-5 w-5" />
              {outlineId ? "Creating from Course Outline" : fromFiles ? "Creating from Files" : "Creating from Text"}
            </div>
            <div className="text-sm text-blue-700">
              {outlineId && courseName && (
                <p><strong>Course:</strong> {courseName}</p>
              )}
              {outlineId && lesson && (
                <p><strong>Lesson:</strong> {lesson}</p>
              )}
              {fromFiles && (
                <>
                  {folderIds.length > 0 && (
                    <p>{folderIds.length} folder{folderIds.length !== 1 ? 's' : ''} selected</p>
                  )}
                  {fileIds.length > 0 && (
                    <p>{fileIds.length} file{fileIds.length !== 1 ? 's' : ''} selected</p>
                  )}
                </>
              )}
              {fromText && textMode && (
                <p><strong>Mode:</strong> {textMode === 'context' ? 'Using as context' : 'Using as base structure'}</p>
              )}
              {prompt && (
                <p><strong>Prompt:</strong> {prompt}</p>
              )}
            </div>
          </div>
        )}

        {/* Language selection */}
        <div className="flex justify-center">
          <div className="bg-white/90 rounded-lg p-4 border border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                const params = new URLSearchParams(searchParams?.toString() || "");
                params.set("lang", newLang);
                router.push(`/create/text-presentation?${params.toString()}`);
              }}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black"
            >
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
              <option value="es">Spanish</option>
              <option value="ru">Russian</option>
            </select>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Generate button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !chatId}
            className="px-8 py-3 bg-brand-primary text-white rounded-full font-medium hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles size={20} />
            {isGenerating ? "Generating..." : "Generate Text Presentation"}
          </button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="text-center text-gray-600">
            <p>Creating your text presentation...</p>
            <p className="text-sm">This may take a few moments.</p>
          </div>
        )}
      </div>
    </main>
  );
} 