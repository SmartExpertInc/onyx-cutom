"use client";
/* eslint-disable */
// @ts-nocheck – lives outside main app dir, disable type-check for now until shared tsconfig is wired.
// This page is a static, pixel-perfect replica of the Figma frame "FULL_ADNVACED_PAGE".
// Functionality wires will be added later – for now we only mirror layout & visual styling.

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Filter, Lock, ListOrdered, Presentation, Video, ClipboardCheck, Plus } from "lucide-react";

interface ModulePreview {
  id: string;
  title: string;
  lessons: string[];
}

// Compact radial progress ring (16×16) used for char-count indicator
const RadialProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 16;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E5EEFF" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#0540AB" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
};

// Simple bouncing dots loading animation (optionally with a status line)
type LoadingProps = { message?: string };
const LoadingAnimation: React.FC<LoadingProps> = ({ message }) => (
  <div className="flex flex-col items-center mt-4" aria-label="Loading">
    <div className="flex gap-1 mb-2">
      {[0, 1, 2].map((i) => (<span key={i} className="inline-block w-3 h-3 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />))}
    </div>
    {message && (<p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message}</p>)}
  </div>
);

// Helper to retry fetch up to 2 times on 504 Gateway Timeout
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(input, init);
    if (res.status !== 504 || attempt >= retries) return res;
    attempt += 1;
  }
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// ----------- Local markdown parser (see wizard page for comments) ------------
function parseOutlineMarkdown(md: string): ModulePreview[] {
  const modules: ModulePreview[] = [];
  let current: ModulePreview | null = null;
  let lessonBuf: string[] = [];

  const flushLesson = () => {
    if (lessonBuf.length && current) {
      current.lessons.push(lessonBuf.join("\n"));
      lessonBuf = [];
    }
  };

  const listItemRegex = /^(?:- |\* |\d+\.)/;

  md.split(/\r?\n/).forEach((raw) => {
    if (!raw.trim()) return;
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const line = raw.trim();

    if (line.startsWith("## ")) {
      flushLesson();
      const title = line.replace(/^##\s*/, "").split(":").pop()?.trim() || "Module";
      current = { id: `mod${modules.length + 1}`, title, lessons: [] };
      modules.push(current);
      return;
    }

    if (!current && (indent === 0 && listItemRegex.test(line))) {
      current = { id: `mod${modules.length + 1}`, title: "Module", lessons: [] };
      modules.push(current);
    }

    if (indent === 0 && listItemRegex.test(line)) {
      flushLesson();
      let titleLine = line.replace(listItemRegex, "").trim();
      if (titleLine.startsWith("**") && titleLine.includes("**", 2)) {
        titleLine = titleLine.split("**")[1].trim();
      }
      lessonBuf.push(titleLine);
    } else if (indent > 0) {
      lessonBuf.push(line);
    }
  });

  flushLesson();
  return modules.filter((m) => m.title.toLowerCase() !== "outline");
}
// ---------------------------------------------------------------------------

export default function CourseOutlineAdvancedPage() {
  const router = useRouter();

  // Left sidebar state
  const [textAction, setTextAction] = useState('generate');
  const [textAmount, setTextAmount] = useState('detailed');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [imageSource, setImageSource] = useState('ai');
  const [imageModel, setImageModel] = useState('flux-fast');
  const [openSections, setOpenSections] = useState({ text: true, image: true, format: true });
  const [format, setFormat] = useState('course-outline');

  // Main outline content state
  const [preview, setPreview] = useState<ModulePreview[]>([]);
  const [prompt, setPrompt] = useState("");
  const [modules, setModules] = useState<number>(4);
  const [lessonsPerModule, setLessonsPerModule] = useState<string>("3-4");
  const [language, setLanguage] = useState<string>("en");
  const [chatId, setChatId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ knowledgeCheck: true, contentAvailability: true, informationSource: true, time: true });
  const [rawOutline, setRawOutline] = useState<string>("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== New state for incremental 'edit' prompt =====
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('advanced-mode-data');
      if (data) {
        const parsed = JSON.parse(data);
        setPreview(parsed.preview || []);
        setPrompt(parsed.prompt || "");
        setModules(parsed.modules || 4);
        setLessonsPerModule(parsed.lessonsPerModule || "3-4");
        setLanguage(parsed.language || "en");
        setChatId(parsed.chatId || null);
        setFilters(parsed.filters || { knowledgeCheck: true, contentAvailability: true, informationSource: true, time: true });
        setRawOutline(parsed.rawOutline || "");
      }
    } catch (e) {
      console.error("Failed to load advanced mode data from session storage", e);
    }
  }, []);

  const handleBack = () => {
    try {
      sessionStorage.setItem('advanced-mode-data-return', JSON.stringify({
        preview, prompt, modules, lessonsPerModule, language, chatId, filters, rawOutline
      }));
    } catch (e) {
      console.error("Failed to save advanced mode data to session storage", e);
    }
    router.push('/create/course-outline');
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleModuleChange = (index: number, value: string) => {
    setPreview((prev) => {
      const copy = [...prev];
      copy[index].title = value;
      return copy;
    });
  };

  const handleLessonTitleChange = (modIdx: number, lessonIdx: number, newTitle: string) => {
    setPreview((prev) => {
      const copy = [...prev];
      const lines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
      lines[0] = newTitle;
      copy[modIdx].lessons[lessonIdx] = lines.join("\n");
      return copy;
    });
  };

  const handleLessonTitleKeyDown = (modIdx: number, lessonIdx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = e.currentTarget;
      const val = input.value;
      const caret = input.selectionStart ?? val.length;
      const before = val.slice(0, caret).trimEnd();
      const after = val.slice(caret).trimStart();
      setPreview((prev) => {
        const copy = [...prev];
        const lessonLines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
        const details = lessonLines.slice(1);
        copy[modIdx].lessons[lessonIdx] = [before || '', ...details].join("\n");
        copy[modIdx].lessons.splice(lessonIdx + 1, 0, after || "");
        return copy;
      });
      requestAnimationFrame(() => {
        const selector = `input[data-mod='${modIdx}'][data-les='${lessonIdx + 1}']`;
        document.querySelector<HTMLInputElement>(selector)?.focus();
      });
    }
  };
  
  const handleAddModule = () => {
    setPreview((prev) => {
      const nextIdx = prev.length + 1;
      return [...prev, { id: `mod${nextIdx}`, title: `Module ${nextIdx}`, lessons: [""] }];
    });
    setModules(c => c + 1);
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>(`input[data-modtitle='${modules}']`)?.focus();
    });
  };

  const handleGenerateFinal = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const outlineForBackend = {
        mainTitle: prompt,
        sections: preview.map((m, idx) => ({
          id: `№${idx + 1}`,
          title: m.title,
          totalHours: 0,
          lessons: m.lessons.map((les) => ({
            title: les.split(/\\r?\\n/)[0],
            check: { type: "no", text: "" },
            contentAvailable: { type: "no", text: "" },
            source: "",
            hours: 0,
          })),
        })),
        detectedLanguage: language,
      };

      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          modules,
          lessonsPerModule,
          language,
          chatSessionId: chatId || undefined,
          editedOutline: outlineForBackend,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Finalize error:", errorText);
        throw new Error(errorText || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      
      // Validate response has required id field
      if (!data || !data.id) {
        throw new Error("Invalid response from server: missing project ID");
      }
      
      const qp = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => qp.set(key, val ? "1" : "0"));

      router.push(`/projects/view/${data.id}?${qp.toString()}`);
    } catch (e: any) {
      setError(e.message || "Failed to generate course");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const charCount = useMemo(() => {
    return preview.reduce((sum, mod) => {
      const lessonChars = mod.lessons.reduce((ls, l) => ls + l.length, 0);
      return sum + mod.title.length + lessonChars;
    }, 0);
  }, [preview]);

  const lessonsTotal = useMemo(() => preview.reduce((sum, m) => sum + m.lessons.length, 0), [preview]);
  const creditsRequired = 5; // Fixed cost for course outline finalization

  // Helper: lazily create chat session if we don't have one yet (copied from wizard page)
  const ensureChatSession = async () => {
    if (chatId) return chatId;
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/course-outline/init-chat`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to init chat session");
      const data = await res.json();
      if (data.chatSessionId) {
        setChatId(data.chatSessionId);
        return data.chatSessionId as string;
      }
    } catch {
      /* swallow */
    }
    return null;
  };

  // ===== Submit incremental edit =====
  const handleEditOutline = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed) return;

    // Combine previous prompt with the newly entered edit instruction.
    let combined = prompt.trim();
    if (combined && !/[.!?]$/.test(combined)) combined += "."; // ensure sentence break
    combined = combined ? `${combined} ${trimmed}` : trimmed;

    setLoadingPreview(true);
    setError(null);
    try {
      const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: combined,
          modules,
          lessonsPerModule,
          language,
          chatSessionId: chatId,
          originalOutline: rawOutline,
        }),
      });
      if (!res.ok) throw new Error(`Bad response ${res.status}`);

      const decoder = new TextDecoder();
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");

      let buf = "";
      let accRaw = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const ln of lines) {
          if (!ln.trim()) continue;
          const pkt = JSON.parse(ln);
          if (pkt.type === "delta") {
            accRaw += pkt.text;
            const parsed = parseOutlineMarkdown(accRaw);
            setPreview(parsed);
            setRawOutline(accRaw);
            // As soon as we have at least one module heading, hide the overlay
            if (loadingPreview && parsed.length > 0) {
              setLoadingPreview(false);
            }
          } else if (pkt.type === "done") {
            const finalModsRaw = Array.isArray(pkt.modules) ? pkt.modules : parseOutlineMarkdown(pkt.raw || accRaw);
            const finalMods = finalModsRaw.filter((m: any) => (m.title || "").toLowerCase() !== "outline");
            setPreview(finalMods);
            setRawOutline(typeof pkt.raw === "string" ? pkt.raw : accRaw);
            setPrompt(combined);
            setEditPrompt("");
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch outline");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <>
    <main
      className="min-h-screen w-full flex flex-col items-center bg-[linear-gradient(180deg,_#FFFFFF_0%,_#CBDAFB_35%,_#AEE5FA_70%,_#FFFFFF_100%)]"
    >
      {/* Fixed header */}
      <header className="w-full max-w-[1280px] flex items-center justify-between px-[24px] pt-[24px]">
        <button
          onClick={handleBack}
          className="text-[#396EDF] text-[14px] font-medium flex items-center gap-[4px] hover:opacity-80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h1 className="text-[20px] leading-[24px] font-semibold text-[#20355D]">Advanced&nbsp;Mode</h1>
        {/* placeholder for right-aligned actions */}
        <div className="w-[48px]" />
      </header>

      {/* Content wrapper */}
      <section className="w-full max-w-[1280px] flex flex-row gap-[24px] px-[24px] pt-[32px] pb-[88px]">
        {/* LEFT SIDEBAR – controls */}
        <aside className="w-[300px] shrink-0 flex flex-col gap-[24px]">
          {/* Text content card – pixel-match */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button 
              onClick={() => toggleSection('text')}
              className="flex items-center justify-between px-[20px] py-[14px] select-none"
            >
              <span className="text-[#20355D] text-[18px] font-medium">Text content</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSections.text ? '' : '-rotate-90'}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <div className={`collapsible-content ${!openSections.text ? 'collapsed' : ''}`}>
              <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px]">
                {/* Text actions */}
                <div className="flex justify-center gap-[4px] mt-[12px]">
                  {[
                    { id: 'generate', label: 'Generate', color: 'bg-[#2A4FFF]', icon: <Sparkles size={12} /> },
                    { id: 'condense', label: 'Condense', color: 'bg-[#F3F6FF]', icon: <Filter size={12} /> },
                    { id: 'reserve', label: 'Reserve', color: 'bg-[#F3F6FF]', icon: <Lock size={12} /> },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setTextAction(b.id)}
                      className={`h-[30px] px-[12px] flex items-center justify-center gap-[5px] rounded-[6px] text-[12px] font-medium transition-colors ${textAction === b.id && b.id === 'generate' ? 'bg-[#2A4FFF] text-white' : 'bg-[#F3F6FF] text-[#20355D]'}`}
                    >
                      {b.icon}
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Text length */}
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] text-[#20355D]">Amount of text per card</span>
                  <div className="flex justify-center gap-[4px]">
                    {[
                      { id: 'short', label: 'Short' },
                      { id: 'medium', label: 'Medium' },
                      { id: 'detailed', label: 'Detailed' },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setTextAmount(o.id)}
                        className={`h-[36px] px-[14px] flex items-center justify-center gap-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${textAmount === o.id ?'bg-[#2A4FFF] text-white':'bg-[#F3F6FF] text-[#20355D]'}`}
                      >
                        <span className="w-3 h-3 inline-block bg-current opacity-70 rounded-sm" />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt textarea */}
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] text-[#20355D]">Write for…</span>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-[80px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] text-[#20355D] resize-none"
                  />
                </div>

                {/* Audience chips */}
                <div className="flex flex-wrap gap-[6px]">
                  {['Business','High school students','College students','Creatives','Tech enthusiasts'].map(t=>(
                    <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                  ))}
                </div>

                {/* Tone*/}
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] text-[#20355D]">Tone</span>
                  <textarea className="h-[60px] rounded-[6px] border border-[#CED9FF] bg-white px-[10px] py-[8px] text-[13px] text-[#20355D] resize-none" />
                </div>

                {/* Tone chips */}
                <div className="flex flex-wrap gap-[6px]">
                  {['Professional','Conversational','Technical','Academic','Inspirational','Humorous'].map(t=>(
                    <span key={t} className="px-[10px] py-[4px] bg-[#E5D9FF] text-[#7039FF] text-[11px] rounded-full select-none whitespace-nowrap">{t}</span>
                  ))}
                </div>

                {/* Output language */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D]">Output language</span>
                  <select 
                    value={outputLanguage}
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className="h-[36px] rounded-[6px] border border-[#CED9FF] px-[10px] bg-white text-[13px] text-[#20355D]"
                  >
                    <option value="en">English</option>
                    <option value="uk">Ukrainian</option>
                    <option value="es">Spanish</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button 
              onClick={() => toggleSection('image')}
              className="flex items-center justify-between w-full px-[20px] py-[14px] select-none"
            >
              <div className="flex items-center gap-[8px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3ZM3 19V5H21V19H3Z" fill="#20355D"/><path d="M8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9Z" fill="#20355D"/><path d="M11 16L7 12L4 15V18H20V12L16 8L11 16Z" fill="#20355D"/></svg>
                <span className="text-[#20355D] text-[18px] font-medium">Image</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSections.image ? '' : '-rotate-90'}`}><path d="M6 9L12 15L18 9"/></svg>
            </button>
            <div className={`collapsible-content ${!openSections.image ? 'collapsed' : ''}`}>
              <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[20px] pt-[12px]">
                {/* Image source */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D] font-medium">Image source</span>
                  <div className="relative">
                    <select 
                      value={imageSource}
                      onChange={(e) => setImageSource(e.target.value)}
                      className="h-[36px] w-full appearance-none rounded-[6px] border border-[#CED9FF] px-[12px] bg-white text-[13px] text-[#20355D]"
                    >
                      <option value="ai">AI images</option>
                      <option value="stock">Stock images</option>
                      <option value="none">No images</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9"/></svg>
                    </div>
                  </div>
                </div>
                {/* Image style */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D] font-medium">Image style</span>
                  <textarea placeholder="Optional: describe colors, style, or mood to use" className="h-[80px] w-full rounded-[6px] border border-[#CED9FF] bg-white px-[12px] py-[8px] text-[13px] text-[#20355D] resize-none placeholder:text-[#818E9F]" />
                </div>
                {/* AI image model */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[13px] text-[#20355D] font-medium">AI Image Model</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-[12px] pointer-events-none">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L1 21H23L12 2Z" fill="#20355D"/></svg>
                    </div>
                    <select 
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="h-[36px] w-full appearance-none rounded-[6px] border border-[#CED9FF] pl-[36px] pr-[36px] bg-white text-[13px] text-[#20355D]"
                    >
                        <option value="flux-fast">Flux Kontext Fast</option>
                        <option value="flux-quality">Flux Kontext HQ</option>
                        <option value="stable">Stable Diffusion 2.1</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format Section */}
          <div className="bg-white rounded-[12px] border border-[#CED9FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Accordion header */}
            <button 
              onClick={() => toggleSection('format')}
              className="flex items-center justify-between w-full px-[20px] py-[14px] select-none"
            >
              <div className="flex items-center gap-[8px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#20355D"><path d="M10 4H4v6h6V4zm-2 4H6V6h2v2zm8-4h-6v6h6V4zm-2 4h-2V6h2v2zM8 12H4v6h6v-6zm-2 4H6v-2h2v2zm8-4h-6v6h6v-6zm-2 4h-2v-2h2v2z"/></svg>
                <span className="text-[#20355D] text-[18px] font-medium">Format</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSections.format ? '' : '-rotate-90'}`}><path d="M6 9L12 15L18 9"/></svg>
            </button>
            <div className={`collapsible-content ${!openSections.format ? 'collapsed' : ''}`}>
              <div className="border-t border-[#E7ECFF] px-[20px] pb-[24px] flex flex-col gap-[12px] pt-[12px]">
                {/* Grid */}
                <div className="grid grid-cols-2 gap-[8px]">
                  {[
                    { id: 'course-outline', label: 'Course Outline', icon: <ListOrdered size={32} /> },
                    { id: 'lesson-presentation', label: 'Lesson Presentation', icon: <Presentation size={32} /> },
                    { id: 'video-script', label: 'Video Lesson Script', icon: <Video size={32} /> },
                    { id: 'quiz', label: 'Quiz', icon: <ClipboardCheck size={32} /> },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setFormat(item.id)}
                      className={`relative rounded-[6px] border p-[12px] flex flex-col items-center justify-center gap-[8px] h-[90px] text-center transition-colors ${format === item.id ? 'border-2 border-[#2A4FFF] bg-[#F0F4FF]' : 'border border-[#D9E1FF] bg-white'}`}
                    >
                      <div className="absolute top-[8px] left-[8px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" fill={format === item.id ? '#2A4FFF' : 'white'} stroke={format === item.id ? 'white' : '#D9E1FF'} strokeWidth="1"/><path d="m5 8 2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: format === item.id ? 'block' : 'none' }}/></svg>
                      </div>
                      <div className={format === item.id ? 'text-[#2A4FFF]' : 'text-[#A5B4FF]'}>
                        {item.icon}
                      </div>
                      <span className="text-[13px] font-medium text-[#20355D]">{item.label}</span>
                    </button>
                  ))}
                </div>
                {/* Default settings dropdown */}
                <select className="h-[36px] rounded-[6px] border border-[#CED9FF] px-[12px] bg-white text-[13px] text-[#20355D]">
                    <option>Default</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER – editable document */}
        <div className="flex-1 bg-white rounded-[12px] border border-[#D9E1FF] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-[40px] overflow-auto min-h-[640px]">
          {preview.length > 0 ? (
            <div className="bg-white flex flex-col gap-6">
              {preview.map((mod: ModulePreview, modIdx: number) => (
                <div key={mod.id} className="flex rounded-xl shadow-sm overflow-hidden">
                  <div className="w-[60px] bg-[#E5EEFF] flex items-start justify-center pt-5">
                    <span className="text-gray-600 font-semibold text-base select-none">{modIdx + 1}</span>
                  </div>
                  <div className="flex-1 bg-white border border-gray-300 rounded-r-xl p-5">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => handleModuleChange(modIdx, e.target.value)}
                      data-modtitle={modIdx}
                      className="w-full font-medium text-lg border-none focus:ring-0 text-gray-900 mb-3"
                      placeholder={`Module ${modIdx + 1} title`}
                    />
                    <ul className="flex flex-col gap-1 text-gray-900">
                      {mod.lessons.map((les: string, lessonIdx: number) => {
                         const lines = les.split(/\r?\n/);
                         let first = lines[0] || "";
                         let titleLine = first.replace(/^\s*[\*\-]\s*/, "");
                         if (titleLine.startsWith("**") && titleLine.includes("**", 2)) {
                           titleLine = titleLine.split("**")[1].trim();
                         }
                         return (
                           <li key={lessonIdx} className="flex items-start gap-2 py-0.5">
                             <span className="text-lg leading-none select-none">•</span>
                             <input
                               type="text"
                               value={titleLine}
                               onChange={(e) => handleLessonTitleChange(modIdx, lessonIdx, e.target.value)}
                               onKeyDown={(e) => handleLessonTitleKeyDown(modIdx, lessonIdx, e)}
                               data-mod={modIdx}
                               data-les={lessonIdx}
                               className="flex-grow bg-transparent border-none p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                               placeholder={`Lesson ${lessonIdx + 1}`}
                             />
                           </li>
                         );
                       })}
                    </ul>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddModule}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-full border border-[#D5DDF8] text-[#20355D] py-3 font-medium hover:bg-[#F0F4FF] active:scale-95 transition"
              >
                <Plus size={18} />
                <span>Add Module</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {loadingPreview ? (
                <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
                  <LoadingAnimation message="Updating…" />
                </div>
              ) : <p>Loading outline preview...</p>}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR – instructions & tips */}
        <aside className="w-[260px] shrink-0 flex flex-col gap-[24px]">
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow flex flex-col gap-3">
            <h3 className="text-[14px] font-medium text-[#20355D]">Additional&nbsp;instructions</h3>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g. Adapt this course for the US market"
              className="w-full h-[120px] rounded-[6px] border border-[#CED9FF] bg-[#F9FAFF] px-[10px] py-[8px] text-[13px] text-[#20355D] resize-none placeholder:text-[#818E9F]"
            />
            <button
              type="button"
              onClick={handleEditOutline}
              disabled={loadingPreview || !editPrompt.trim()}
              className="self-end px-6 py-2 rounded-full bg-[#2A4FFF] text-white text-sm font-medium hover:bg-[#2040d0] disabled:opacity-50"
            >
              {loadingPreview ? "Editing…" : "Edit"}
            </button>
          </div>
          <div className="bg-white rounded-[12px] border border-[#D9E1FF] p-[16px] shadow">
            <h3 className="text-[14px] font-medium text-[#20355D] mb-[8px]">Tips</h3>
            <div className="h-[120px] bg-[#F9FAFF] rounded-[6px]" />
          </div>
        </aside>
      </section>
      </main>
      
      {/* Full-width generate footer bar */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{creditsRequired} credits</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{charCount} / 50000 characters</span>
          <span className="text-lg text-gray-700 font-medium select-none">{lessonsTotal} lessons total</span>
          <button
            type="button"
            onClick={handleGenerateFinal}
            className="px-12 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isGenerating}
          >
            <Sparkles size={18} />
            <span className="select-none font-semibold">Generate</span>
          </button>
        </div>

        <button
          type="button"
          disabled
          className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center opacity-60 cursor-not-allowed select-none font-bold"
          aria-label="Help (coming soon)"
        >
          ?
        </button>
      </footer>
      <style jsx global>{`
        .collapsible-content {
          overflow: hidden;
          transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
          max-height: 1000px; /* enough for any content */
          opacity: 1;
        }
        .collapsible-content.collapsed {
          max-height: 0;
          opacity: 0;
          padding-top: 0;
          padding-bottom: 0;
          margin-top:0;
          margin-bottom:0;
          border-top: none;
        }
    `}</style>
    {/* Global overlays */}
    {loadingPreview && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50 pointer-events-none">
        <LoadingAnimation message="Updating…" />
      </div>
    )}
    {isGenerating && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
        <LoadingAnimation message="Generating product…" />
      </div>
    )}
    </>
  );
} 