"use client";
/* eslint-disable */
// @ts-nocheck – lives outside main app dir; turn off type-check noise for now.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

const lengthRangeForOption = (opt: string) => {
  switch (opt) {
    case "Short":
      return "100-200 words";
    case "Long":
      return "500+ words";
    default:
      return "300-400 words";
  }
};

export default function LessonPresentationAdvancedPage() {
  const router = useRouter();

  // Core state loaded from session storage
  const [content, setContent] = useState<string>("");
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [lengthOption, setLengthOption] = useState<string>("Medium");
  const [language, setLanguage] = useState<string>("en");
  const [chatId, setChatId] = useState<string | null>(null);

  // UI / network state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("advanced-mode-data-lesson");
      if (raw) {
        const parsed = JSON.parse(raw);
        setContent(parsed.content || "");
        setSelectedOutlineId(parsed.selectedOutlineId ?? null);
        setSelectedLesson(parsed.selectedLesson || "");
        setLengthOption(parsed.lengthOption || "Medium");
        setLanguage(parsed.language || "en");
        setChatId(parsed.chatId || null);
      }
    } catch (e) {
      console.error("Failed to parse advanced mode data", e);
    }
  }, []);

  const handleBack = () => {
    try {
      sessionStorage.setItem(
        "advanced-mode-data-lesson-return",
        JSON.stringify({
          selectedOutlineId,
          selectedLesson,
          lengthOption,
          language,
          chatId,
          content,
        })
      );
    } catch (_) {}
    router.push("/create/lesson-presentation");
  };

  const handleGenerateFinal = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: selectedOutlineId,
          lessonTitle: selectedLesson || "Untitled Lesson",
          lengthRange: lengthRangeForOption(lengthOption),
          aiResponse: content,
          chatSessionId: chatId || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/projects/view/${data.id}`);
    } catch (e: any) {
      setError(e.message);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <main
        className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
        }}
      >
        <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleBack();
            }}
            className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
          >
            <ArrowLeft size={14} /> Back
          </Link>

          <h1 className="text-2xl font-semibold text-center text-black mt-2">Advanced Lesson Editing</h1>

          {error && (
            <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[70vh] border border-gray-300 rounded-md p-4 bg-white/90 whitespace-pre-wrap"
          />

          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={handleGenerateFinal}
              className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isGenerating}
            >
              <Sparkles size={18} />
              <span className="select-none font-semibold">
                {isGenerating ? "Generating..." : "Generate"}
              </span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
} 