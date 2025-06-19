"use client";
/* eslint-disable */
// @ts-nocheck – mirrors CourseOutlineAdvancedPage but for Lesson Presentations.
// Pixel-matched layout & styling reused from course outline advanced page.

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Filter, Lock, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

// Simple bouncing dots loading animation (copied)
type LoadingProps = { message?: string };
const LoadingAnimation: React.FC<LoadingProps> = ({ message }) => (
  <div className="flex flex-col items-center mt-4" aria-label="Loading">
    <div className="flex gap-1 mb-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-3 h-3 bg-[#0066FF] rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
    {message && (
      <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message}</p>
    )}
  </div>
);

// Helper to retry on 504 (copied)
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(input, init);
    if (res.status !== 504 || attempt >= retries) return res;
    attempt += 1;
  }
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Map option → length-range string (same helper as wizard)
const lengthRangeForOption = (opt: string) => {
  switch (opt) {
    case "Short":
      return "100-200 words";
    case "Medium":
      return "300-400 words";
    case "Long":
      return "500+ words";
    default:
      return "300-400 words";
  }
};

export default function LessonPresentationAdvancedPage() {
  const router = useRouter();

  // Core lesson data loaded from sessionStorage
  const [content, setContent] = useState<string>("");
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">("Medium");
  const [language, setLanguage] = useState<string>("en");
  const [chatId, setChatId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  // UI state
  const [textAmount, setTextAmount] = useState("detailed");
  const [imageSource, setImageSource] = useState("ai");
  const [imageModel, setImageModel] = useState("flux-fast");
  const [openSections, setOpenSections] = useState({ text: true, image: true });

  // Flow flags
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from wizard
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("advanced-mode-data-lesson") || sessionStorage.getItem("advanced-mode-data-lesson-return");
      if (!raw) return;
      const d = JSON.parse(raw);
      setSelectedOutlineId(d.selectedOutlineId ?? null);
      setSelectedLesson(d.selectedLesson ?? "");
      setLengthOption(d.lengthOption ?? "Medium");
      setLanguage(d.language ?? "en");
      setChatId(d.chatId ?? null);
      setContent(d.content ?? "");
      setPrompt(d.prompt ?? "");
    } catch (e) {
      console.error("Failed to parse advanced lesson data", e);
    }
  }, []);

  const charCount = useMemo(() => content.length, [content]);

  const toggleSection = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const handleBack = () => {
    try {
      sessionStorage.setItem("advanced-mode-data-lesson-return", JSON.stringify({
        selectedOutlineId,
        selectedLesson,
        lengthOption,
        language,
        chatId,
        content,
        prompt,
      }));
    } catch {}
    router.push("/create/lesson-presentation");
  };

  // ===== Edit lesson via prompt =====
  const handleEditLesson = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed) return;
    let combined = prompt.trim();
    if (combined && !/[.!?]$/.test(combined)) combined += ".";
    combined = combined ? `${combined} ${trimmed}` : trimmed;

    setLoadingPreview(true);
    setError(null);
    try {
      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/lesson-presentation/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineProjectId: selectedOutlineId,
          lessonTitle: selectedLesson,
          lengthRange: lengthRangeForOption(lengthOption),
          language,
          prompt: combined,
          chatSessionId: chatId || undefined,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`Bad response ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        acc += buf;
        buf = "";
        if (/\S/.test(acc)) setContent(acc);
      }
      // remove first metadata line like wizard
      const parts = acc.split("\n");
      if (parts.length > 1) {
        let trimmedContent = parts.slice(1).join("\n").replace(/^(\s*\n)+/, "");
        setContent(trimmedContent);
      }
      setPrompt(combined);
      setEditPrompt("");
    } catch (e: any) {
      setError(e.message || "Failed to edit lesson");
    } finally {
      setLoadingPreview(false);
    }
  };

  // ===== Finalize =====
  const handleGenerateFinal = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
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
      setError(e.message || "Failed to save lesson");
      setIsGenerating(false);
    }
  };

  return (
    <>
      <main className="min-h-screen w-full flex flex-col items-center bg-[linear-gradient(180deg,_#FFFFFF_0%,_#CBDAFB_35%,_#AEE5FA_70%,_#FFFFFF_100%)]">
        {/* Header */}
        <header className="w-full max-w-[1280px] flex items-center justify-between px-[24px] pt-[24px]">
          <button onClick={handleBack} className="text-[#396EDF] text-[14px] font-medium flex items-center gap-[4px] hover:opacity-80">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="text-[20px] leading-[24px] font-semibold text-[#20355D]">Advanced&nbsp;Mode</h1>
          <div className="w-[48px]" />
        </header>

        {/* Body */}
        <section className="w-full max-w-[1280px] flex flex-row gap-[24px] px-[24px] pt-[32px] pb-[88px]">
          {/* Sidebar */}
          <aside className="w-[300px] shrink-0 flex flex-col gap-[24px]">
            {/* Text Content card (accordion) */}
            <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-sm flex flex-col">
              <button onClick={() => toggleSection("text")} className="flex items-center justify-between px-[20px] py-[14px] select-none">
                <span className="text-[#20355D] text-[18px] font-medium">Text content</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSections.text ? '' : '-rotate-90'}`}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className={`${!openSections.text ? 'hidden' : ''} border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px]`}>
                {/* Length selector */}
                <div className="flex flex-col gap-[8px] mt-[12px]">
                  <span className="text-[13px] text-[#20355D]">Amount of text per card</span>
                  <div className="flex justify-center gap-[4px]">
                    {[{id:'short',label:'Short'},{id:'medium',label:'Medium'},{id:'detailed',label:'Detailed'}].map(o=> (
                      <button key={o.id} onClick={()=>setTextAmount(o.id)} className={`h-[36px] px-[14px] flex items-center justify-center gap-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${textAmount===o.id?'bg-[#2A4FFF] text-white':'bg-[#F3F6FF] text-[#20355D]'}`}>{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Prompt textarea */}
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] text-[#20355D]">Prompt</span>
                  <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="h-[80px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] text-[#20355D] resize-none" />
                </div>

                {/* Edit prompt */}
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] text-[#20355D]">Add instruction</span>
                  <textarea value={editPrompt} onChange={e=>setEditPrompt(e.target.value)} className="h-[60px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] text-[#20355D] resize-none" />
                  <button onClick={handleEditLesson} className="mt-[6px] h-[30px] flex items-center justify-center gap-[6px] rounded-[6px] bg-[#2A4FFF] text-white text-[12px] font-medium hover:opacity-90">
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Image settings card (collapsed) */}
            <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-sm flex flex-col">
              <button onClick={()=>toggleSection("image")} className="flex items-center justify-between px-[20px] py-[14px] select-none">
                <span className="text-[#20355D] text-[18px] font-medium">Images</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSections.image ? '' : '-rotate-90'}`}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className={`${!openSections.image ? 'hidden' : ''} border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[16px]`}>
                {/* Source dropdown */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D]">Image source</span>
                  <select value={imageSource} onChange={e=>setImageSource(e.target.value)} className="h-[36px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] text-[13px] text-[#20355D]">
                    <option value="ai">AI images</option>
                    <option value="stock">Stock images</option>
                    <option value="none">No images</option>
                  </select>
                </div>
                {/* Model dropdown */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D]">AI model</span>
                  <select value={imageModel} onChange={e=>setImageModel(e.target.value)} className="h-[36px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] text-[13px] text-[#20355D]">
                    <option value="flux-fast">Flux Kontext Fast</option>
                    <option value="flux-quality">Flux Kontext HQ</option>
                    <option value="stable">Stable Diffusion 2.1</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content column */}
          <div className="flex-1 flex flex-col gap-[24px]">
            <h2 className="text-sm font-medium text-[#20355D]">Lesson Content</h2>
            {loadingPreview && <LoadingAnimation message="Updating preview..." />}
            {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}
            <textarea value={content} onChange={e=>setContent(e.target.value)} className="flex-1 min-h-[60vh] bg-white border border-[#CED9FF] rounded-[12px] p-5 text-[15px] leading-[1.4]" />
          </div>
        </section>

        {/* Footer bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-[32px] flex items-center justify-between">
          <span className="text-base text-[#20355D] select-none">{charCount} characters</span>
          <button onClick={handleGenerateFinal} disabled={isGenerating} className="px-[48px] py-[12px] rounded-full bg-[#0540AB] text-white text-[16px] font-semibold hover:bg-[#043a99] active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-[6px]">
            <Sparkles size={18} /> Generate
          </button>
        </div>
      </main>
      {isGenerating && (
        <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50"><LoadingAnimation message="Saving lesson..." /></div>
      )}
    </>
  );
} 