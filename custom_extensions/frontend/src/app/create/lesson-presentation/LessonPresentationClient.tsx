"use client";
// @ts-nocheck – same rationale as CourseOutlineClient
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

const LoadingDots: React.FC = () => (
  <div className="flex gap-1" aria-label="Loading">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="inline-block w-3 h-3 bg-brand-primary rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

export default function LessonPresentationClient() {
  const params = useSearchParams();
  const router = useRouter();

  const outlineId = params.get("outlineId");
  const lessonTitleInitial = params.get("lesson");
  const lengthRange = params.get("length");
  const promptInitial = params.get("prompt") || "";
  const chatIdInitial = params.get("chatId");

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(chatIdInitial);
  const [isSaving, setIsSaving] = useState(false);

  // For editing
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const startPreview = async () => {
      setLoading(true);
      setError(null);
      setContent("");

      let currentChatId = chatId;
      // If we don't have a chat pre-created, backend will create one and return via header
      const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: outlineId ? Number(outlineId) : undefined,
          lessonTitle: lessonTitleInitial || undefined,
          lengthRange,
          prompt: promptInitial || undefined,
          language: params.get("lang") || "en",
          chatSessionId: chatIdInitial || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        setError(`Failed to generate lesson (status ${res.status})`);
        setLoading(false);
        return;
      }

      // Stream plain text
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContent((prev) => prev + decoder.decode(value));
      }
      setLoading(false);
    };

    startPreview().catch((e) => {
      if (e.name !== "AbortError") {
        setError("Unexpected error while generating lesson.");
        setLoading(false);
      }
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: outlineId ? Number(outlineId) : undefined,
          lessonTitle: lessonTitleInitial || "Untitled Lesson",
          lengthRange,
          aiResponse: content,
          chatSessionId: chatId || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      router.push(`/projects/${data.id}`); // hypothetical route
    } catch (e) {
      setError("Failed to save lesson. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-[#F5F8FF]">
      <Link
        href="/create/generate"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-center mt-4">Lesson Presentation</h1>

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <LoadingDots />
            <span className="text-gray-600 text-sm">Generating lesson…</span>
          </div>
        )}

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        {!loading && !error && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 min-h-[400px] whitespace-pre-wrap"
          />
        )}

        {!loading && !error && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-white hover:bg-brand-primary-hover transition-all duration-200 text-lg font-semibold shadow-lg"
              style={{ backgroundColor: "#0076FF", opacity: isSaving ? 0.6 : 1 }}
            >
              {isSaving ? <LoadingDots /> : <Sparkles size={18} />} {isSaving ? "Saving…" : "Generate"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 