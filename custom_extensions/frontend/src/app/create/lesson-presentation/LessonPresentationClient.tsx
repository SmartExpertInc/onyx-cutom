"use client";
// @ts-nocheck – same rationale as CourseOutlineClient
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, AlignLeft, AlignCenter, AlignRight, Plus, Settings } from "lucide-react";
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

// Helper to map ranges back to option labels
const optionForRange = (range?: string): "Short" | "Medium" | "Long" => {
  switch (range) {
    case "400-500 words":
      return "Short";
    case "800+ words":
      return "Long";
    default:
      return "Medium";
  }
};

const lengthRangeForOption = (opt: string) => {
  switch (opt) {
    case "Short":
      return "400-500 words";
    case "Long":
      return "800+ words";
    default:
      return "600-800 words";
  }
};

const themeOptions = [
  { id: "peach", label: "Peach" },
  { id: "mocha", label: "Mocha" },
  { id: "coal", label: "Coal" },
  { id: "stardust", label: "Stardust" },
  { id: "pistachio", label: "Pistachio" },
  { id: "nebulae", label: "Nebulae" },
];

const ThemePreviewSvg: React.FC = () => (
  <svg width="80" height="40" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="80" height="40" rx="6" fill="#D9ECFF" />
  </svg>
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

  // Dropdown data
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [lessonsForOutline, setLessonsForOutline] = useState<string[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(outlineId ? Number(outlineId) : null);
  const [selectedLesson, setSelectedLesson] = useState<string>(lessonTitleInitial || "");
  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">(
    optionForRange(lengthRange || "600-800 words")
  );

  // Inside component state declarations
  const [selectedTheme, setSelectedTheme] = useState<string>("peach");
  const [textDensity, setTextDensity] = useState<"brief" | "medium" | "detailed">("medium");
  const [imageSource, setImageSource] = useState<string>("ai");
  const [aiModel, setAiModel] = useState<string>("flux-fast");

  // Fetch outlines list once
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const onlyOutlines = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setOutlines(onlyOutlines.map((p: any) => ({ id: p.id, name: p.projectName })));
      } catch (_) {}
    };
    fetchOutlines();
  }, []);

  // Fetch lessons for current outline id
  useEffect(() => {
    if (selectedOutlineId == null) return;
    const fetchLessons = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const lessons: string[] = [];
        sections.forEach((sec: any) => {
          (sec.lessons || []).forEach((ls: any) => lessons.push(ls.title || ""));
        });
        setLessonsForOutline(lessons);
      } catch (_) {}
    };
    fetchLessons();
  }, [selectedOutlineId]);

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
          outlineProjectId: selectedOutlineId ?? undefined,
          lessonTitle: selectedLesson || undefined,
          lengthRange: lengthRangeForOption(lengthOption),
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
        setContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setContent((prev) => prev + decoder.decode()); // flush remaining
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
          outlineProjectId: selectedOutlineId ?? undefined,
          lessonTitle: selectedLesson || "Untitled Lesson",
          lengthRange: lengthRangeForOption(lengthOption),
          aiResponse: content,
          chatSessionId: chatId || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      router.push(`/projects/view/${data.id}`);
    } catch (e) {
      setError("Failed to save lesson. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      {/* Back */}
      <Link
        href="/create/generate"
        className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-black mt-2">Generate</h1>

        {/* Dropdowns */}
        <div className="flex flex-wrap justify-center gap-2">
          {/* Outline */}
          <div className="relative">
            <select
              value={selectedOutlineId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedOutlineId(val ? Number(val) : null);
                setSelectedLesson("");
              }}
              className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            >
              <option value="">Select Outline</option>
              {outlines.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>

          {/* Lesson */}
          {selectedOutlineId && (
            <div className="relative">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
              >
                <option value="">Select Lesson</option>
                {lessonsForOutline.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>
          )}

          {/* Length */}
          <div className="relative">
            <select
              value={lengthOption}
              onChange={(e) => setLengthOption(e.target.value as any)}
              className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            >
              {(["Short", "Medium", "Long"] as const).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
        </div>

        {/* Content area */}
        {loading && (
          <div className="mt-12 flex flex-col items-center gap-2">
            <LoadingDots />
            <span className="text-gray-600 text-sm">Generating lesson…</span>
          </div>
        )}

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        {!loading && !error && content.length > 0 && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 min-h-[400px] whitespace-pre-wrap bg-white"
          />
        )}

        {/* Designs / Contentbuilder setup section */}
        {!loading && !error && content.length > 0 && (
          <section className="flex flex-col gap-3 mt-6">
            <h2 className="text-sm font-medium text-[#20355D]">Set up your Contentbuilder</h2>
            <div className="bg-white border border-gray-300 rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-[#20355D]">Themes</h2>
                  <p className="mt-1 text-[#858587] font-medium text-sm">Use one of our popular themes below or browse others</p>
                </div>
                <button type="button" className="flex items-center gap-1 text-sm text-[#20355D] hover:opacity-80 transition-opacity"><span>View more</span></button>
              </div>

              {/* themes grid */}
              <div className="grid grid-cols-3 gap-5 justify-items-center">
                {themeOptions.map((t) => (
                  <button key={t.id} type="button" onClick={() => setSelectedTheme(t.id)} className={`flex flex-col rounded-lg overflow-hidden border border-transparent shadow-sm transition-all p-2 gap-2 ${selectedTheme === t.id ? 'bg-[#cee2fd]' : ''}`}> <div className="w-[214px] h-[116px] flex items-center justify-center"><ThemePreviewSvg /></div><div className="flex items-center gap-1 px-2"><span className={`w-4 text-[#0540AB] ${selectedTheme === t.id ? '' : 'opacity-0'}`}>✔</span><span className="text-sm text-[#20355D] font-medium select-none">{t.label}</span></div></button>
                ))}
              </div>

              {/* Content options */}
              <div className="border-t border-gray-200 pt-5 flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-[#20355D]">Content</h3>
                <p className="text-sm text-[#858587] font-medium">Adjust text and image styles for your gamma</p>

                {/* Text density */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800 select-none">Amount of text per card</label>
                  <div className="flex w-full border border-gray-300 rounded-full overflow-hidden text-sm font-medium text-[#20355D] select-none">
                    {[{ id: 'brief', label: 'Brief', icon: <AlignLeft size={14} /> }, { id: 'medium', label: 'Medium', icon: <AlignCenter size={14} /> }, { id: 'detailed', label: 'Detailed', icon: <AlignRight size={14} /> }].map((opt) => (<button key={opt.id} type="button" onClick={() => setTextDensity(opt.id as any)} className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${textDensity === opt.id ? 'bg-[#d6e6fd]' : 'bg-white'}`}>{opt.icon}{opt.label}</button>))}
                  </div>
                </div>

                {/* Image source */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800 select-none">Image source</label>
                  <div className="relative w-full">
                    <select value={imageSource} onChange={(e) => setImageSource(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                      <option value="ai">AI images</option>
                      <option value="stock">Stock images</option>
                      <option value="none">No images</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* AI model */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800 select-none">AI image model</label>
                  <div className="relative w-full">
                    <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                      <option value="flux-fast">Flux Kontext Fast</option>
                      <option value="flux-quality">Flux Kontext HQ</option>
                      <option value="stable">Stable Diffusion 2.1</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Advanced Mode link */}
        {!loading && !error && content.length > 0 && (
          <div className="w-full flex justify-center mt-0 mb-12">
            <button type="button" onClick={() => { sessionStorage.setItem('lesson-advanced-mode-data', JSON.stringify({ outlineId: selectedOutlineId, lesson: selectedLesson, lengthOption, chatId, content, selectedTheme, textDensity, imageSource, aiModel })); router.push('/create/lesson-presentation/advanced'); }} className="flex items-center gap-1 text-sm text-[#396EDF] hover:opacity-80 transition-opacity select-none">
              Advanced Mode <Settings size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer Generate bar */}
      {!loading && !error && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <LoadingDots /> : <Sparkles size={18} />} {isSaving ? "Saving…" : "Generate"}
          </button>
        </div>
      )}
    </main>
  );
} 