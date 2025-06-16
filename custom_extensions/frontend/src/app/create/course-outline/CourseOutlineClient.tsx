"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// Base URL so frontend can reach custom backend through nginx proxy
const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

interface ModulePreview {
  id: string;
  title: string;
  lessons: string[];
}

// Simple bouncing dots loading animation (optionally with a status line)
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

// Helper to retry fetch up to 2 times on 504 Gateway Timeout
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(input, init);
    if (res.status !== 504 || attempt >= retries) return res;
    attempt += 1;
  }
}

export default function CourseOutlineClient() {
  const params = useSearchParams();
  const [prompt, setPrompt] = useState(params.get("prompt") || "");
  const [modules, setModules] = useState<number>(Number(params.get("modules") || 4));
  const [lessonsPerModule, setLessonsPerModule] = useState<string>(params.get("lessons") || "3-4");
  const [language, setLanguage] = useState<string>(params.get("lang") || "en");

  // Optional pre-created chat session id (speeds up backend)
  const chatId = params.get("chatId");

  const [preview, setPreview] = useState<ModulePreview[]>([]);
  const [rawOutline, setRawOutline] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Track which lesson rows are expanded: key format `${modIdx}-${lessonIdx}` -> boolean
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // Keep a reference to the current in-flight preview request so we can cancel it
  const previewAbortRef = useRef<AbortController | null>(null);

  // Build dynamic fake-thought list based on current params
  const makeThoughts = () => {
    const list: string[] = [];
    list.push(`Analyzing request for "${prompt.slice(0, 40) || "Untitled"}"...`);
    list.push(`Detected language: ${language.toUpperCase()}`);
    list.push(`Planning ${modules} module${modules > 1 ? "s" : ""} with ${lessonsPerModule} lessons each...`);
    // shuffle little filler line
    list.push("Consulting training knowledge base...");
    for (let i = 0; i < modules; i++) {
      list.push(`Building Module ${i + 1}...`);
    }
    list.push("Finalizing outline...");
    return list;
  };

  const [thoughts, setThoughts] = useState<string[]>(makeThoughts());
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const delayForThought = (text: string): number => {
    if (text.startsWith("Analyzing")) return rand(3000, 8000);
    if (text.startsWith("Detected language")) return rand(1500, 2500);
    if (text.startsWith("Planning")) return rand(6000, 10000);
    if (text.startsWith("Consulting")) return rand(5000, 8000);
    if (text.startsWith("Building Module")) return rand(2000, 3000);
    // Finalizing outline – stay until done
    return 99999;
  };

  // Cycle through thoughts whenever loading=true
  useEffect(() => {
    if (loading) {
      setThoughts(makeThoughts());
      setThoughtIdx(0);

      const scheduleNext = (index: number) => {
        const txt = thoughts[index];
        const delay = delayForThought(txt);
        if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
        if (txt.startsWith("Finalizing outline")) return; // keep until loading finishes
        thoughtTimerRef.current = setTimeout(() => {
          setThoughtIdx((prev) => {
            const next = prev + 1;
            if (next < thoughts.length) {
              scheduleNext(next);
              return next;
            }
            // reached end, stay on last (finalizing)
            return prev;
          });
        }, delay);
      };

      scheduleNext(0);
    } else {
      if (thoughtTimerRef.current) {
        clearTimeout(thoughtTimerRef.current);
        thoughtTimerRef.current = null;
      }
    }
    return () => {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, modules, lessonsPerModule, prompt, language]);

  useEffect(() => {
    // Skip preview fetching while the user is finalizing the outline
    if (isGenerating) return;

    // Abort any previously queued/in-flight request – we only want the very latest parameters
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }

    const abortController = new AbortController();
    previewAbortRef.current = abortController;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      setPreview([]);
      setRawOutline("");

      try {
        const res = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/course-outline/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, modules, lessonsPerModule, language, chatSessionId: chatId || undefined }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`Bad response ${res.status}`);
        }

        const data = await res.json();
        // Backend returns {{modules, raw}}
        setPreview(Array.isArray(data.modules) ? data.modules : []);
        setRawOutline(typeof data.raw === "string" ? data.raw : "");
      } catch (e: any) {
        if (e.name === "AbortError") return; // request was cancelled – ignore
        setError(e.message);
      } finally {
        // Only clear loading if THIS request wasn't aborted; another newer request may be in-flight.
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPreview();

    // Cleanup: abort the request if the component unmounts or deps change before completion
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, modules, lessonsPerModule, language, isGenerating, chatId]);

  const handleModuleChange = (index: number, value: string) => {
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      copy[index].title = value;
      return copy;
    });
  };

  const handleLessonChange = (modIdx: number, lessonIdx: number, value: string) => {
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      copy[modIdx].lessons[lessonIdx] = value;
      return copy;
    });
  };

  const handleLessonsTextareaChange = (modIdx: number, value: string) => {
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      // Keep raw lines as-is during editing to prevent cursor jumps;
      // Final cleanup happens just before we send to backend.
      copy[modIdx].lessons = value.split(/\r?\n/);
      return copy;
    });
  };

  const handleGenerateFinal = async () => {
    if (isGenerating) return; // guard against double-click / duplicate requests
    // Stop any ongoing preview fetch so it doesn't flash / restart while finalizing
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }

    setIsGenerating(true);
    // Ensure the preview spinner / fake-thoughts are not shown while we're in finalize mode
    setLoading(false);
    setError(null);
    try {
      const outlineForBackend = {
        mainTitle: prompt,
        sections: preview.map((m: ModulePreview, idx: number) => ({
          id: `№${idx + 1}`,
          title: m.title,
          totalHours: 0,
          lessons: m.lessons.map((les: string) => ({
            title: les,
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
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Navigate to the newly-created product view. Using router.push ensures Next.js automatically
      // prefixes the configured `basePath` (e.g. "/custom-projects-ui") so we don't accidentally
      // leave the custom frontend and hit the main app's /projects route.
      router.push(`/projects/view/${data.id}`);
    } catch (e: any) {
      setError(e.message);
      // allow UI interaction again
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const toggleExpanded = (modIdx: number, lessonIdx: number) => {
    const key = `${modIdx}-${lessonIdx}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLessonTitleChange = (modIdx: number, lessonIdx: number, newTitle: string) => {
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      const lines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
      lines[0] = newTitle;
      copy[modIdx].lessons[lessonIdx] = lines.join("\n");
      return copy;
    });
  };

  const handleLessonDetailsChange = (modIdx: number, lessonIdx: number, detailIdx: number, newVal: string) => {
    setPreview((prev: ModulePreview[]) => {
      const copy = [...prev];
      const lines = copy[modIdx].lessons[lessonIdx].split(/\r?\n/);
      // detail lines start from index 1
      const original = lines[detailIdx + 1] || "";
      const match = original.match(/^\s*-?\s*\*\*(.+?)\*\*:\s*(.*)$/);
      if (match) {
        const label = match[1];
        lines[detailIdx + 1] = `- **${label}**: ${newVal}`;
      } else {
        // fallback keep original prefix until colon
        const parts = original.split(":");
        if (parts.length > 1) {
          parts[1] = ` ${newVal}`;
          lines[detailIdx + 1] = parts.join(":");
        } else {
          lines[detailIdx + 1] = newVal;
        }
      }
      copy[modIdx].lessons[lessonIdx] = lines.join("\n");
      return copy;
    });
  };

  return (
    <>
    <main
      /* Shared pastel gradient (identical to generate page) */
      className="min-h-screen py-12 px-4 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        {/* Back button */}
        <Link
          href="/create/generate"
          className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Page title */}
        <h1 className="text-3xl font-semibold text-center text-black mt-10">Generate</h1>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2">
          <select
            value={modules}
            onChange={(e) => setModules(Number(e.target.value))}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} Modules</option>
            ))}
          </select>
          <select
            value={lessonsPerModule}
            onChange={(e) => setLessonsPerModule(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
          >
            {["1-2", "3-4", "5-7", "8-10"].map((rng) => (
              <option key={rng} value={rng}>{rng} per module</option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
          >
            <option value="en">English</option>
            <option value="uk">Ukrainian</option>
            <option value="es">Spanish</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        {/* Prompt textarea */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 h-14 resize-none bg-white/90 placeholder-gray-500"
          placeholder="Describe what you'd like to make"
        />

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Outline</h2>
          {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && preview.length > 0 && (
            <div
              className="bg-white rounded-xl p-6 flex flex-col gap-6"
              style={{ animation: 'fadeInDown 0.25s ease-out both' }}
            >
              {preview.map((mod: ModulePreview, modIdx: number) => (
                <div key={mod.id} className="flex rounded-xl shadow-sm overflow-hidden">
                  {/* Left colored bar with index */}
                  <div className="w-[60px] bg-[#E5EEFF] flex items-start justify-center pt-3">
                    <span className="text-gray-600 font-semibold text-base select-none">{modIdx + 1}</span>
                  </div>

                  {/* Main card */}
                  <div className="flex-1 bg-white border border-gray-300 rounded-r-xl p-5">
                    {/* Module title */}
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => handleModuleChange(modIdx, e.target.value)}
                      className="w-full font-medium text-lg border-none focus:ring-0 text-gray-900 mb-3"
                      placeholder={`Module ${modIdx + 1} title`}
                    />

                    {/* Lessons list */}
                    <ul className="flex flex-col gap-1 text-gray-900">
                      {mod.lessons.map((les: string, lessonIdx: number) => {
                         const lines = les.split(/\r?\n/);
                         // Preserve user-typed spacing by avoiding automatic trim.
                         let first = lines[0] || "";
                         let titleLine: string;
                         if (first.trim() === "*" || first.trim() === "-" || first.trim() === "") {
                           titleLine = (lines[1] || "").trim();
                         } else {
                           // Remove only the leading bullet + space if present, keep trailing spaces intact.
                           titleLine = first.replace(/^\s*[\*\-]\s*/, "");
                         }
                         return (
                           <li key={lessonIdx} className="flex items-start gap-2 py-0.5">
                             <span className="text-lg leading-none select-none">•</span>
                             <input
                               type="text"
                               value={titleLine}
                               onChange={(e) => handleLessonTitleChange(modIdx, lessonIdx, e.target.value)}
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
              {/* Add-module button – pill style, full-width */}
              <button
                type="button"
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-full border border-[#D5DDF8] text-[#1E3A8A] py-3 font-medium hover:bg-[#F0F4FF] active:scale-95 transition"
              >
                <Plus size={18} />
                <span>Add Module</span>
              </button>
            </div>
          )}

          {!loading && preview.length === 1 && preview[0].lessons.length === 0 && rawOutline && (
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 border rounded">
              {rawOutline}
            </pre>
          )}
        </section>

        {!loading && preview.length > 0 && (
          <section className="bg-white border border-gray-300 rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Designs</h2>
              <button type="button" className="flex items-center gap-1 text-brand-primary hover:text-brand-primary-hover text-sm font-medium">
                <ArrowLeft className="rotate-180" size={14} />
                See more
              </button>
            </div>
            <div className="flex gap-4">
              <button
                className="px-1 py-0.5 rounded-md focus:outline-none bg-transparent hover:opacity-80 transition-opacity"
                title="Default design"
              >
                <svg width="416" height="222" viewBox="0 0 416 222" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[214px] h-[116px]">
                <path d="M0 8.99999C0 4.02943 4.02944 0 9 0H407C411.971 0 416 4.02944 416 9V213C416 217.971 411.971 222 407 222H9.00001C4.02945 222 0 217.971 0 213V8.99999Z" fill="#FF1313"/>
                <path d="M407 218V222H9V218H407ZM412 213V9C412 6.23859 409.761 4.00001 407 4H9C6.32472 4 4.14053 6.10111 4.00684 8.74316L4 9V213C4 215.761 6.23857 218 9 218V222L8.53711 221.988C3.93498 221.755 0.244876 218.065 0.0117188 213.463L0 213V9C0 4.18468 3.78166 0.252643 8.53711 0.0117188L9 0H407L407.463 0.0117188C412.218 0.252648 416 4.18469 416 9V213L415.988 213.463C415.755 218.065 412.065 221.755 407.463 221.988L407 222V218C409.761 218 412 215.761 412 213Z" fill="white"/>
                <path d="M32 32H384V192H32V32Z" fill="#FFFCF5"/>
                <path d="M384 32V192H32V32H384ZM34 190H382V34H34V190Z" fill="white"/>
                <path d="M200.195 169.598L200.174 165.813H200.714L207.06 159.073H210.772L203.534 166.746H203.047L200.195 169.598ZM197.344 175V153.764H200.444V175H197.344ZM207.402 175L201.699 167.43L203.835 165.263L211.207 175H207.402Z" fill="#586367"/>
                <path d="M182.992 165.543V175H179.892V159.073H182.868V161.665H183.065C183.431 160.822 184.005 160.144 184.786 159.633C185.574 159.121 186.566 158.865 187.762 158.865C188.848 158.865 189.798 159.093 190.614 159.55C191.43 159.999 192.062 160.67 192.512 161.561C192.961 162.453 193.186 163.556 193.186 164.869V175H190.085V165.242C190.085 164.088 189.784 163.186 189.183 162.536C188.582 161.879 187.755 161.551 186.705 161.551C185.986 161.551 185.346 161.707 184.786 162.018C184.233 162.329 183.794 162.785 183.469 163.386C183.151 163.981 182.992 164.7 182.992 165.543Z" fill="#586367"/>
                <path d="M172.621 175V159.073H175.721V175H172.621ZM174.186 156.615C173.647 156.615 173.184 156.435 172.797 156.076C172.417 155.71 172.227 155.274 172.227 154.769C172.227 154.258 172.417 153.822 172.797 153.463C173.184 153.097 173.647 152.913 174.186 152.913C174.726 152.913 175.185 153.097 175.565 153.463C175.953 153.822 176.146 154.258 176.146 154.769C176.146 155.274 175.953 155.71 175.565 156.076C175.185 156.435 174.726 156.615 174.186 156.615Z" fill="#586367"/>
                <path d="M168.45 153.764V175H165.349V153.764H168.45Z" fill="#586367"/>
                <path d="M152.509 175.301C151.085 175.301 149.858 175.041 148.828 174.523C147.805 174.005 147.017 173.299 146.464 172.408C145.911 171.509 145.634 170.493 145.634 169.359C145.634 168.495 145.814 167.728 146.174 167.057C146.533 166.38 147.034 165.754 147.677 165.18C148.32 164.606 149.063 164.029 149.907 163.449L153.328 161.033C153.909 160.652 154.362 160.251 154.687 159.83C155.012 159.401 155.174 158.872 155.174 158.243C155.174 157.745 154.96 157.268 154.531 156.812C154.103 156.356 153.529 156.128 152.81 156.128C152.312 156.128 151.873 156.249 151.493 156.491C151.12 156.733 150.826 157.044 150.612 157.424C150.404 157.797 150.301 158.191 150.301 158.606C150.301 159.09 150.432 159.577 150.695 160.068C150.964 160.559 151.31 161.067 151.732 161.592C152.153 162.111 152.596 162.65 153.059 163.21L162.92 175H159.415L151.255 165.408C150.57 164.6 149.934 163.839 149.347 163.127C148.759 162.408 148.282 161.682 147.916 160.95C147.556 160.21 147.376 159.411 147.376 158.554C147.376 157.58 147.598 156.715 148.04 155.962C148.489 155.202 149.115 154.607 149.917 154.178C150.719 153.75 151.659 153.536 152.737 153.536C153.83 153.536 154.766 153.75 155.547 154.178C156.336 154.6 156.94 155.164 157.362 155.869C157.791 156.567 158.005 157.331 158.005 158.16C158.005 159.17 157.753 160.061 157.248 160.836C156.75 161.603 156.062 162.308 155.185 162.951L150.923 166.093C150.093 166.701 149.516 167.303 149.191 167.897C148.873 168.485 148.714 168.944 148.714 169.276C148.714 169.884 148.87 170.448 149.181 170.966C149.499 171.485 149.941 171.9 150.508 172.211C151.082 172.522 151.752 172.677 152.52 172.677C153.308 172.677 154.075 172.508 154.822 172.169C155.575 171.824 156.256 171.329 156.864 170.686C157.48 170.043 157.967 169.273 158.326 168.374C158.686 167.475 158.866 166.47 158.866 165.357H161.665C161.665 166.725 161.51 167.883 161.199 168.83C160.888 169.77 160.511 170.538 160.068 171.132C159.633 171.72 159.222 172.18 158.835 172.511C158.71 172.622 158.593 172.733 158.482 172.843C158.371 172.954 158.254 173.064 158.129 173.175C157.41 173.901 156.539 174.437 155.516 174.782C154.5 175.128 153.498 175.301 152.509 175.301Z" fill="#586367"/>
                <path d="M124.022 180.973C123.559 180.973 123.137 180.935 122.757 180.859C122.377 180.79 122.093 180.713 121.907 180.631L122.653 178.09C123.22 178.242 123.725 178.308 124.167 178.287C124.61 178.266 125 178.1 125.339 177.789C125.685 177.478 125.989 176.97 126.252 176.265L126.635 175.207L120.808 159.073H124.126L128.16 171.433H128.325L132.359 159.073H135.688L129.124 177.126C128.82 177.955 128.433 178.657 127.963 179.231C127.492 179.811 126.932 180.247 126.283 180.537C125.633 180.828 124.879 180.973 124.022 180.973Z" fill="#586367"/>
                <path d="M109.746 175.311C108.46 175.311 107.313 174.983 106.304 174.326C105.301 173.662 104.513 172.719 103.939 171.495C103.373 170.265 103.089 168.789 103.089 167.067C103.089 165.346 103.376 163.874 103.95 162.65C104.53 161.427 105.325 160.49 106.335 159.84C107.344 159.19 108.488 158.865 109.767 158.865C110.755 158.865 111.55 159.031 112.152 159.363C112.76 159.688 113.23 160.068 113.562 160.504C113.901 160.939 114.164 161.323 114.35 161.655H114.537V153.764H117.637V175H114.609V172.522H114.35C114.164 172.86 113.894 173.248 113.541 173.683C113.196 174.119 112.719 174.499 112.11 174.824C111.502 175.149 110.714 175.311 109.746 175.311ZM110.431 172.667C111.322 172.667 112.076 172.432 112.691 171.962C113.313 171.485 113.783 170.825 114.101 169.981C114.426 169.138 114.589 168.156 114.589 167.036C114.589 165.93 114.43 164.963 114.112 164.133C113.794 163.303 113.327 162.657 112.712 162.194C112.097 161.731 111.336 161.499 110.431 161.499C109.497 161.499 108.72 161.741 108.097 162.225C107.475 162.709 107.005 163.369 106.687 164.206C106.376 165.042 106.221 165.986 106.221 167.036C106.221 168.101 106.38 169.058 106.698 169.909C107.016 170.759 107.486 171.433 108.108 171.931C108.737 172.422 109.511 172.667 110.431 172.667Z" fill="#586367"/>
                <path d="M92.8986 175.321C91.4055 175.321 90.1024 174.979 88.9894 174.295C87.8764 173.611 87.0123 172.653 86.3971 171.423C85.7818 170.192 85.4742 168.754 85.4742 167.109C85.4742 165.457 85.7818 164.012 86.3971 162.775C87.0123 161.537 87.8764 160.576 88.9894 159.892C90.1024 159.208 91.4055 158.865 92.8986 158.865C94.3918 158.865 95.6949 159.208 96.8079 159.892C97.9209 160.576 98.785 161.537 99.4002 162.775C100.015 164.012 100.323 165.457 100.323 167.109C100.323 168.754 100.015 170.192 99.4002 171.423C98.785 172.653 97.9209 173.611 96.8079 174.295C95.6949 174.979 94.3918 175.321 92.8986 175.321ZM92.909 172.719C93.8768 172.719 94.6787 172.463 95.3147 171.951C95.9507 171.44 96.4208 170.759 96.7249 169.909C97.036 169.058 97.1915 168.122 97.1915 167.099C97.1915 166.082 97.036 165.149 96.7249 164.299C96.4208 163.442 95.9507 162.754 95.3147 162.235C94.6787 161.717 93.8768 161.458 92.909 161.458C91.9343 161.458 91.1255 161.717 90.4826 162.235C89.8466 162.754 89.3731 163.442 89.062 164.299C88.7578 165.149 88.6057 166.082 88.6057 167.099C88.6057 168.122 88.7578 169.058 89.062 169.909C89.3731 170.759 89.8466 171.44 90.4826 171.951C91.1255 172.463 91.9343 172.719 92.909 172.719Z" fill="#586367"/>
                <path d="M67.3331 175V153.764H75.1101C76.6171 153.764 77.8649 154.013 78.8534 154.51C79.842 155.001 80.5816 155.668 81.0724 156.512C81.5633 157.348 81.8087 158.292 81.8087 159.342C81.8087 160.227 81.6462 160.974 81.3213 161.582C80.9964 162.184 80.5609 162.667 80.0148 163.034C79.4756 163.393 78.8811 163.656 78.2313 163.822V164.029C78.9364 164.064 79.6242 164.292 80.2947 164.714C80.9722 165.128 81.5322 165.719 81.9746 166.487C82.417 167.254 82.6382 168.187 82.6382 169.287C82.6382 170.372 82.3824 171.347 81.8709 172.211C81.3662 173.068 80.5851 173.749 79.5274 174.253C78.4697 174.751 77.1183 175 75.473 175H67.3331ZM70.5372 172.252H75.1619C76.6966 172.252 77.7957 171.955 78.4594 171.36C79.123 170.766 79.4548 170.023 79.4548 169.131C79.4548 168.46 79.2855 167.845 78.9467 167.285C78.608 166.725 78.1241 166.279 77.495 165.948C76.8729 165.616 76.1332 165.45 75.276 165.45H70.5372V172.252ZM70.5372 162.951H74.8301C75.5491 162.951 76.1954 162.813 76.7692 162.536C77.3499 162.26 77.8096 161.872 78.1483 161.375C78.4939 160.87 78.6668 160.276 78.6668 159.591C78.6668 158.713 78.3591 157.977 77.7439 157.383C77.1287 156.788 76.185 156.491 74.9131 156.491H70.5372V162.951Z" fill="#586367"/>
                <path d="M151.08 115.493C148.548 115.493 146.361 114.967 144.519 113.915C142.689 112.852 141.28 111.35 140.294 109.41C139.307 107.459 138.814 105.162 138.814 102.521C138.814 99.9229 139.307 97.643 140.294 95.6809C141.291 93.7079 142.683 92.1734 144.47 91.0772C146.257 89.9702 148.356 89.4166 150.767 89.4166C152.324 89.4166 153.793 89.6687 155.174 90.1729C156.566 90.6662 157.793 91.4335 158.857 92.4748C159.931 93.5161 160.775 94.8424 161.389 96.4537C162.002 98.054 162.309 99.9613 162.309 102.175V104H141.609V99.9887H156.604C156.593 98.8487 156.347 97.8348 155.864 96.947C155.382 96.0481 154.708 95.3411 153.842 94.826C152.987 94.3108 151.989 94.0532 150.849 94.0532C149.633 94.0532 148.564 94.3492 147.643 94.9411C146.723 95.522 146.005 96.2893 145.489 97.2429C144.985 98.1856 144.728 99.2214 144.717 100.35V103.852C144.717 105.321 144.985 106.582 145.522 107.634C146.059 108.675 146.81 109.476 147.775 110.035C148.739 110.583 149.868 110.857 151.162 110.857C152.028 110.857 152.812 110.736 153.513 110.495C154.215 110.243 154.823 109.876 155.338 109.393C155.853 108.911 156.242 108.314 156.505 107.601L162.063 108.226C161.712 109.695 161.043 110.977 160.057 112.073C159.081 113.159 157.832 114.003 156.308 114.605C154.785 115.197 153.042 115.493 151.08 115.493Z" fill="#295873"/>
                <path d="M133.779 81.3273V115H127.827V81.3273H133.779Z" fill="#295873"/>
                <path d="M122.307 89.7455V94.3491H107.789V89.7455H122.307ZM111.373 83.6949H117.325V107.404C117.325 108.204 117.445 108.818 117.686 109.245C117.939 109.662 118.267 109.947 118.673 110.1C119.079 110.254 119.528 110.331 120.021 110.331C120.394 110.331 120.734 110.303 121.041 110.248C121.358 110.194 121.6 110.144 121.764 110.1L122.767 114.753C122.449 114.863 121.994 114.984 121.402 115.115C120.821 115.247 120.109 115.323 119.265 115.345C117.774 115.389 116.431 115.164 115.237 114.671C114.042 114.167 113.094 113.389 112.392 112.336C111.702 111.284 111.362 109.969 111.373 108.39V83.6949Z" fill="#295873"/>
                <path d="M97.6234 115V89.7454H103.575V115H97.6234ZM100.616 86.1611C99.6731 86.1611 98.862 85.8487 98.1824 85.224C97.5028 84.5882 97.163 83.8264 97.163 82.9386C97.163 82.0397 97.5028 81.2779 98.1824 80.6531C98.862 80.0174 99.6731 79.6995 100.616 79.6995C101.569 79.6995 102.381 80.0174 103.049 80.6531C103.729 81.2779 104.069 82.0397 104.069 82.9386C104.069 83.8264 103.729 84.5882 103.049 85.224C102.381 85.8487 101.569 86.1611 100.616 86.1611Z" fill="#295873"/>
                <path d="M65.8415 86.4407V81.3273H92.7073V86.4407H82.2997V115H76.2491V86.4407H65.8415Z" fill="#295873"/>
                </svg>
              </button>
              <button
                className="px-1 py-0.5 rounded-md focus:outline-none bg-transparent hover:opacity-80 transition-opacity"
                title="Blue design"
              >
                <svg width="416" height="222" viewBox="0 0 416 222" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[214px] h-[116px]">
                <path d="M0 8.99999C0 4.02943 4.02944 0 9 0H407C411.971 0 416 4.02944 416 9V213C416 217.971 411.971 222 407 222H9.00001C4.02945 222 0 217.971 0 213V8.99999Z" fill="#528FCD"/>
                <path d="M407 218V222H9V218H407ZM412 213V9C412 6.23859 409.761 4.00001 407 4H9C6.32472 4 4.14053 6.10111 4.00684 8.74316L4 9V213C4 215.761 6.23857 218 9 218V222L8.53711 221.988C3.93498 221.755 0.244876 218.065 0.0117188 213.463L0 213V9C0 4.18468 3.78166 0.252643 8.53711 0.0117188L9 0H407L407.463 0.0117188C412.218 0.252648 416 4.18469 416 9V213L415.988 213.463C415.755 218.065 412.065 221.755 407.463 221.988L407 222V218C409.761 218 412 215.761 412 213Z" fill="white"/>
                <path d="M32 32H384V192H32V32Z" fill="#FFFCF5"/>
                <path d="M384 32V192H32V32H384ZM34 190H382V34H34V190Z" fill="white"/>
                <path d="M200.195 169.598L200.174 165.813H200.714L207.06 159.073H210.772L203.534 166.746H203.047L200.195 169.598ZM197.344 175V153.764H200.444V175H197.344ZM207.402 175L201.699 167.43L203.835 165.263L211.207 175H207.402Z" fill="#586367"/>
                <path d="M182.992 165.543V175H179.892V159.073H182.868V161.665H183.065C183.431 160.822 184.005 160.144 184.786 159.633C185.574 159.121 186.566 158.865 187.762 158.865C188.848 158.865 189.798 159.093 190.614 159.55C191.43 159.999 192.062 160.67 192.512 161.561C192.961 162.453 193.186 163.556 193.186 164.869V175H190.085V165.242C190.085 164.088 189.784 163.186 189.183 162.536C188.582 161.879 187.755 161.551 186.705 161.551C185.986 161.551 185.346 161.707 184.786 162.018C184.233 162.329 183.794 162.785 183.469 163.386C183.151 163.981 182.992 164.7 182.992 165.543Z" fill="#586367"/>
                <path d="M172.621 175V159.073H175.721V175H172.621ZM174.186 156.615C173.647 156.615 173.184 156.435 172.797 156.076C172.417 155.71 172.227 155.274 172.227 154.769C172.227 154.258 172.417 153.822 172.797 153.463C173.184 153.097 173.647 152.913 174.186 152.913C174.726 152.913 175.185 153.097 175.565 153.463C175.953 153.822 176.146 154.258 176.146 154.769C176.146 155.274 175.953 155.71 175.565 156.076C175.185 156.435 174.726 156.615 174.186 156.615Z" fill="#586367"/>
                <path d="M168.45 153.764V175H165.349V153.764H168.45Z" fill="#586367"/>
                <path d="M148.875 174.765C147.451 174.765 146.224 174.506 145.194 173.988C144.171 173.469 143.383 172.764 142.83 171.872C142.277 170.973 142 169.957 142 168.824C142 167.959 142.18 167.192 142.539 166.522C142.899 165.844 143.4 165.219 144.043 164.645C144.686 164.071 145.429 163.494 146.272 162.913L149.694 160.497C150.275 160.117 150.728 159.716 151.052 159.294C151.377 158.866 151.54 158.337 151.54 157.708C151.54 157.21 151.325 156.733 150.897 156.277C150.468 155.82 149.895 155.592 149.176 155.592C148.678 155.592 148.239 155.713 147.859 155.955C147.485 156.197 147.192 156.508 146.977 156.888C146.77 157.262 146.666 157.656 146.666 158.071C146.666 158.554 146.798 159.042 147.06 159.533C147.33 160.023 147.675 160.532 148.097 161.057C148.519 161.575 148.961 162.115 149.424 162.675L159.286 174.464H155.781L147.62 164.873C146.936 164.064 146.3 163.304 145.712 162.592C145.125 161.873 144.648 161.147 144.281 160.414C143.922 159.674 143.742 158.876 143.742 158.019C143.742 157.044 143.963 156.18 144.406 155.426C144.855 154.666 145.481 154.071 146.283 153.643C147.084 153.214 148.025 153 149.103 153C150.195 153 151.132 153.214 151.913 153.643C152.701 154.065 153.306 154.628 153.728 155.333C154.156 156.031 154.371 156.795 154.371 157.625C154.371 158.634 154.118 159.526 153.614 160.3C153.116 161.067 152.428 161.772 151.55 162.415L147.288 165.557C146.459 166.166 145.882 166.767 145.557 167.362C145.239 167.949 145.08 168.409 145.08 168.741C145.08 169.349 145.235 169.912 145.546 170.431C145.864 170.949 146.307 171.364 146.874 171.675C147.447 171.986 148.118 172.142 148.885 172.142C149.673 172.142 150.441 171.972 151.187 171.634C151.941 171.288 152.622 170.794 153.23 170.151C153.845 169.508 154.333 168.737 154.692 167.838C155.052 166.94 155.231 165.934 155.231 164.821H158.031C158.031 166.19 157.875 167.348 157.564 168.295C157.253 169.235 156.877 170.002 156.434 170.597C155.999 171.184 155.587 171.644 155.2 171.976C155.076 172.086 154.958 172.197 154.848 172.308C154.737 172.418 154.619 172.529 154.495 172.639C153.776 173.365 152.905 173.901 151.882 174.247C150.866 174.592 149.863 174.765 148.875 174.765Z" fill="#586367"/>
                <path d="M124.022 180.973C123.559 180.973 123.137 180.935 122.757 180.859C122.377 180.79 122.093 180.713 121.907 180.631L122.653 178.09C123.22 178.242 123.725 178.308 124.167 178.287C124.61 178.266 125 178.1 125.339 177.789C125.685 177.478 125.989 176.97 126.252 176.265L126.635 175.207L120.808 159.073H124.126L128.16 171.433H128.325L132.359 159.073H135.688L129.124 177.126C128.82 177.955 128.433 178.657 127.963 179.231C127.492 179.811 126.932 180.247 126.283 180.537C125.633 180.828 124.879 180.973 124.022 180.973Z" fill="#586367"/>
                <path d="M109.746 175.311C108.46 175.311 107.313 174.983 106.304 174.326C105.301 173.662 104.513 172.719 103.939 171.495C103.373 170.265 103.089 168.789 103.089 167.067C103.089 165.346 103.376 163.874 103.95 162.65C104.53 161.427 105.325 160.49 106.335 159.84C107.344 159.19 108.488 158.865 109.767 158.865C110.755 158.865 111.55 159.031 112.152 159.363C112.76 159.688 113.23 160.068 113.562 160.504C113.901 160.939 114.164 161.323 114.35 161.655H114.537V153.764H117.637V175H114.609V172.522H114.35C114.164 172.86 113.894 173.248 113.541 173.683C113.196 174.119 112.719 174.499 112.11 174.824C111.502 175.149 110.714 175.311 109.746 175.311ZM110.431 172.667C111.322 172.667 112.076 172.432 112.691 171.962C113.313 171.485 113.783 170.825 114.101 169.981C114.426 169.138 114.589 168.156 114.589 167.036C114.589 165.93 114.43 164.963 114.112 164.133C113.794 163.303 113.327 162.657 112.712 162.194C112.097 161.731 111.336 161.499 110.431 161.499C109.497 161.499 108.72 161.741 108.097 162.225C107.475 162.709 107.005 163.369 106.687 164.206C106.376 165.042 106.221 165.986 106.221 167.036C106.221 168.101 106.38 169.058 106.698 169.909C107.016 170.759 107.486 171.433 108.108 171.931C108.737 172.422 109.511 172.667 110.431 172.667Z" fill="#586367"/>
                <path d="M92.8986 175.321C91.4055 175.321 90.1024 174.979 88.9894 174.295C87.8764 173.611 87.0123 172.653 86.3971 171.423C85.7818 170.192 85.4742 168.754 85.4742 167.109C85.4742 165.457 85.7818 164.012 86.3971 162.775C87.0123 161.537 87.8764 160.576 88.9894 159.892C90.1024 159.208 91.4055 158.865 92.8986 158.865C94.3918 158.865 95.6949 159.208 96.8079 159.892C97.9209 160.576 98.785 161.537 99.4002 162.775C100.015 164.012 100.323 165.457 100.323 167.109C100.323 168.754 100.015 170.192 99.4002 171.423C98.785 172.653 97.9209 173.611 96.8079 174.295C95.6949 174.979 94.3918 175.321 92.8986 175.321ZM92.909 172.719C93.8768 172.719 94.6787 172.463 95.3147 171.951C95.9507 171.44 96.4208 170.759 96.7249 169.909C97.036 169.058 97.1915 168.122 97.1915 167.099C97.1915 166.082 97.036 165.149 96.7249 164.299C96.4208 163.442 95.9507 162.754 95.3147 162.235C94.6787 161.717 93.8768 161.458 92.909 161.458C91.9343 161.458 91.1255 161.717 90.4826 162.235C89.8466 162.754 89.3731 163.442 89.062 164.299C88.7578 165.149 88.6057 166.082 88.6057 167.099C88.6057 168.122 88.7578 169.058 89.062 169.909C89.3731 170.759 89.8466 171.44 90.4826 171.951C91.1255 172.463 91.9343 172.719 92.909 172.719Z" fill="#586367"/>
                <path d="M67.3331 175V153.764H75.1101C76.6171 153.764 77.8649 154.013 78.8534 154.51C79.842 155.001 80.5816 155.668 81.0724 156.512C81.5633 157.348 81.8087 158.292 81.8087 159.342C81.8087 160.227 81.6462 160.974 81.3213 161.582C80.9964 162.184 80.5609 162.667 80.0148 163.034C79.4756 163.393 78.8811 163.656 78.2313 163.822V164.029C78.9364 164.064 79.6242 164.292 80.2947 164.714C80.9722 165.128 81.5322 165.719 81.9746 166.487C82.417 167.254 82.6382 168.187 82.6382 169.287C82.6382 170.372 82.3824 171.347 81.8709 172.211C81.3662 173.068 80.5851 173.749 79.5274 174.253C78.4697 174.751 77.1183 175 75.473 175H67.3331ZM70.5372 172.252H75.1619C76.6966 172.252 77.7957 171.955 78.4594 171.36C79.123 170.766 79.4548 170.023 79.4548 169.131C79.4548 168.46 79.2855 167.845 78.9467 167.285C78.608 166.725 78.1241 166.279 77.495 165.948C76.8729 165.616 76.1332 165.45 75.276 165.45H70.5372V172.252ZM70.5372 162.951H74.8301C75.5491 162.951 76.1954 162.813 76.7692 162.536C77.3499 162.26 77.8096 161.872 78.1483 161.375C78.4939 160.87 78.6668 160.276 78.6668 159.591C78.6668 158.713 78.3591 157.977 77.7439 157.383C77.1287 156.788 76.185 156.491 74.9131 156.491H70.5372V162.951Z" fill="#586367"/>
                <path d="M151.08 115.493C148.548 115.493 146.361 114.967 144.519 113.915C142.689 112.852 141.28 111.35 140.294 109.41C139.307 107.459 138.814 105.162 138.814 102.521C138.814 99.9229 139.307 97.643 140.294 95.6809C141.291 93.7079 142.683 92.1734 144.47 91.0772C146.257 89.9702 148.356 89.4166 150.767 89.4166C152.324 89.4166 153.793 89.6687 155.174 90.1729C156.566 90.6662 157.793 91.4335 158.857 92.4748C159.931 93.5161 160.775 94.8424 161.389 96.4537C162.002 98.054 162.309 99.9613 162.309 102.175V104H141.609V99.9887H156.604C156.593 98.8487 156.347 97.8348 155.864 96.947C155.382 96.0481 154.708 95.3411 153.842 94.826C152.987 94.3108 151.989 94.0532 150.849 94.0532C149.633 94.0532 148.564 94.3492 147.643 94.9411C146.723 95.522 146.005 96.2893 145.489 97.2429C144.985 98.1856 144.728 99.2214 144.717 100.35V103.852C144.717 105.321 144.985 106.582 145.522 107.634C146.059 108.675 146.81 109.476 147.775 110.035C148.739 110.583 149.868 110.857 151.162 110.857C152.028 110.857 152.812 110.736 153.513 110.495C154.215 110.243 154.823 109.876 155.338 109.393C155.853 108.911 156.242 108.314 156.505 107.601L162.063 108.226C161.712 109.695 161.043 110.977 160.057 112.073C159.081 113.159 157.832 114.003 156.308 114.605C154.785 115.197 153.042 115.493 151.08 115.493Z" fill="#295873"/>
                <path d="M133.779 81.3273V115H127.827V81.3273H133.779Z" fill="#295873"/>
                <path d="M122.307 89.7455V94.3491H107.789V89.7455H122.307ZM111.373 83.6949H117.325V107.404C117.325 108.204 117.445 108.818 117.686 109.245C117.939 109.662 118.267 109.947 118.673 110.1C119.079 110.254 119.528 110.331 120.021 110.331C120.394 110.331 120.734 110.303 121.041 110.248C121.358 110.194 121.6 110.144 121.764 110.1L122.767 114.753C122.449 114.863 121.994 114.984 121.402 115.115C120.821 115.247 120.109 115.323 119.265 115.345C117.774 115.389 116.431 115.164 115.237 114.671C114.042 114.167 113.094 113.389 112.392 112.336C111.702 111.284 111.362 109.969 111.373 108.39V83.6949Z" fill="#295873"/>
                <path d="M97.6234 115V89.7454H103.575V115H97.6234ZM100.616 86.1611C99.6731 86.1611 98.862 85.8487 98.1824 85.224C97.5028 84.5882 97.163 83.8264 97.163 82.9386C97.163 82.0397 97.5028 81.2779 98.1824 80.6531C98.862 80.0174 99.6731 79.6995 100.616 79.6995C101.569 79.6995 102.381 80.0174 103.049 80.6531C103.729 81.2779 104.069 82.0397 104.069 82.9386C104.069 83.8264 103.729 84.5882 103.049 85.224C102.381 85.8487 101.569 86.1611 100.616 86.1611Z" fill="#295873"/>
                <path d="M65.8415 86.4407V81.3273H92.7073V86.4407H82.2997V115H76.2491V86.4407H65.8415Z" fill="#295873"/>
                </svg>
              </button>
              <button
                className="px-1 py-0.5 rounded-md focus:outline-none bg-transparent hover:opacity-80 transition-opacity"
                title="Green design"
              >
                <svg width="416" height="222" viewBox="0 0 416 222" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[214px] h-[116px]">
                <path d="M0 8.99999C0 4.02943 4.02944 0 9 0H407C411.971 0 416 4.02944 416 9V213C416 217.971 411.971 222 407 222H9.00001C4.02945 222 0 217.971 0 213V8.99999Z" fill="#238D4A"/>
                <path d="M407 218V222H9V218H407ZM412 213V9C412 6.23859 409.761 4.00001 407 4H9C6.32472 4 4.14053 6.10111 4.00684 8.74316L4 9V213C4 215.761 6.23857 218 9 218V222L8.53711 221.988C3.93498 221.755 0.244876 218.065 0.0117188 213.463L0 213V9C0 4.18468 3.78166 0.252643 8.53711 0.0117188L9 0H407L407.463 0.0117188C412.218 0.252648 416 4.18469 416 9V213L415.988 213.463C415.755 218.065 412.065 221.755 407.463 221.988L407 222V218C409.761 218 412 215.761 412 213Z" fill="white"/>
                <path d="M32 32H384V192H32V32Z" fill="#FFFCF5"/>
                <path d="M384 32V192H32V32H384ZM34 190H382V34H34V190Z" fill="white"/>
                <path d="M200.195 169.598L200.174 165.813H200.714L207.06 159.073H210.772L203.534 166.746H203.047L200.195 169.598ZM197.344 175V153.764H200.444V175H197.344ZM207.402 175L201.699 167.43L203.835 165.263L211.207 175H207.402Z" fill="#586367"/>
                <path d="M182.992 165.543V175H179.892V159.073H182.868V161.665H183.065C183.431 160.822 184.005 160.144 184.786 159.633C185.574 159.121 186.566 158.865 187.762 158.865C188.848 158.865 189.798 159.093 190.614 159.55C191.43 159.999 192.062 160.67 192.512 161.561C192.961 162.453 193.186 163.556 193.186 164.869V175H190.085V165.242C190.085 164.088 189.784 163.186 189.183 162.536C188.582 161.879 187.755 161.551 186.705 161.551C185.986 161.551 185.346 161.707 184.786 162.018C184.233 162.329 183.794 162.785 183.469 163.386C183.151 163.981 182.992 164.7 182.992 165.543Z" fill="#586367"/>
                <path d="M172.621 175V159.073H175.721V175H172.621ZM174.186 156.615C173.647 156.615 173.184 156.435 172.797 156.076C172.417 155.71 172.227 155.274 172.227 154.769C172.227 154.258 172.417 153.822 172.797 153.463C173.184 153.097 173.647 152.913 174.186 152.913C174.726 152.913 175.185 153.097 175.565 153.463C175.953 153.822 176.146 154.258 176.146 154.769C176.146 155.274 175.953 155.71 175.565 156.076C175.185 156.435 174.726 156.615 174.186 156.615Z" fill="#586367"/>
                <path d="M168.45 153.764V175H165.349V153.764H168.45Z" fill="#586367"/>
                <path d="M148.875 174.765C147.451 174.765 146.224 174.506 145.194 173.988C144.171 173.469 143.383 172.764 142.83 171.872C142.277 170.973 142 169.957 142 168.824C142 167.959 142.18 167.192 142.539 166.522C142.899 165.844 143.4 165.219 144.043 164.645C144.686 164.071 145.429 163.494 146.272 162.913L149.694 160.497C150.275 160.117 150.728 159.716 151.052 159.294C151.377 158.866 151.54 158.337 151.54 157.708C151.54 157.21 151.325 156.733 150.897 156.277C150.468 155.82 149.895 155.592 149.176 155.592C148.678 155.592 148.239 155.713 147.859 155.955C147.485 156.197 147.192 156.508 146.977 156.888C146.77 157.262 146.666 157.656 146.666 158.071C146.666 158.554 146.798 159.042 147.06 159.533C147.33 160.023 147.675 160.532 148.097 161.057C148.519 161.575 148.961 162.115 149.424 162.675L159.286 174.464H155.781L147.62 164.873C146.936 164.064 146.3 163.304 145.712 162.592C145.125 161.873 144.648 161.147 144.281 160.414C143.922 159.674 143.742 158.876 143.742 158.019C143.742 157.044 143.963 156.18 144.406 155.426C144.855 154.666 145.481 154.071 146.283 153.643C147.084 153.214 148.025 153 149.103 153C150.195 153 151.132 153.214 151.913 153.643C152.701 154.065 153.306 154.628 153.728 155.333C154.156 156.031 154.371 156.795 154.371 157.625C154.371 158.634 154.118 159.526 153.614 160.3C153.116 161.067 152.428 161.772 151.55 162.415L147.288 165.557C146.459 166.166 145.882 166.767 145.557 167.362C145.239 167.949 145.08 168.409 145.08 168.741C145.08 169.349 145.235 169.912 145.546 170.431C145.864 170.949 146.307 171.364 146.874 171.675C147.447 171.986 148.118 172.142 148.885 172.142C149.673 172.142 150.441 171.972 151.187 171.634C151.941 171.288 152.622 170.794 153.23 170.151C153.845 169.508 154.333 168.737 154.692 167.838C155.052 166.94 155.231 165.934 155.231 164.821H158.031C158.031 166.19 157.875 167.348 157.564 168.295C157.253 169.235 156.877 170.002 156.434 170.597C155.999 171.184 155.587 171.644 155.2 171.976C155.076 172.086 154.958 172.197 154.848 172.308C154.737 172.418 154.619 172.529 154.495 172.639C153.776 173.365 152.905 173.901 151.882 174.247C150.866 174.592 149.863 174.765 148.875 174.765Z" fill="#586367"/>
                <path d="M124.022 180.973C123.559 180.973 123.137 180.935 122.757 180.859C122.377 180.79 122.093 180.713 121.907 180.631L122.653 178.09C123.22 178.242 123.725 178.308 124.167 178.287C124.61 178.266 125 178.1 125.339 177.789C125.685 177.478 125.989 176.97 126.252 176.265L126.635 175.207L120.808 159.073H124.126L128.16 171.433H128.325L132.359 159.073H135.688L129.124 177.126C128.82 177.955 128.433 178.657 127.963 179.231C127.492 179.811 126.932 180.247 126.283 180.537C125.633 180.828 124.879 180.973 124.022 180.973Z" fill="#586367"/>
                <path d="M109.746 175.311C108.46 175.311 107.313 174.983 106.304 174.326C105.301 173.662 104.513 172.719 103.939 171.495C103.373 170.265 103.089 168.789 103.089 167.067C103.089 165.346 103.376 163.874 103.95 162.65C104.53 161.427 105.325 160.49 106.335 159.84C107.344 159.19 108.488 158.865 109.767 158.865C110.755 158.865 111.55 159.031 112.152 159.363C112.76 159.688 113.23 160.068 113.562 160.504C113.901 160.939 114.164 161.323 114.35 161.655H114.537V153.764H117.637V175H114.609V172.522H114.35C114.164 172.86 113.894 173.248 113.541 173.683C113.196 174.119 112.719 174.499 112.11 174.824C111.502 175.149 110.714 175.311 109.746 175.311ZM110.431 172.667C111.322 172.667 112.076 172.432 112.691 171.962C113.313 171.485 113.783 170.825 114.101 169.981C114.426 169.138 114.589 168.156 114.589 167.036C114.589 165.93 114.43 164.963 114.112 164.133C113.794 163.303 113.327 162.657 112.712 162.194C112.097 161.731 111.336 161.499 110.431 161.499C109.497 161.499 108.72 161.741 108.097 162.225C107.475 162.709 107.005 163.369 106.687 164.206C106.376 165.042 106.221 165.986 106.221 167.036C106.221 168.101 106.38 169.058 106.698 169.909C107.016 170.759 107.486 171.433 108.108 171.931C108.737 172.422 109.511 172.667 110.431 172.667Z" fill="#586367"/>
                <path d="M92.8986 175.321C91.4055 175.321 90.1024 174.979 88.9894 174.295C87.8764 173.611 87.0123 172.653 86.3971 171.423C85.7818 170.192 85.4742 168.754 85.4742 167.109C85.4742 165.457 85.7818 164.012 86.3971 162.775C87.0123 161.537 87.8764 160.576 88.9894 159.892C90.1024 159.208 91.4055 158.865 92.8986 158.865C94.3918 158.865 95.6949 159.208 96.8079 159.892C97.9209 160.576 98.785 161.537 99.4002 162.775C100.015 164.012 100.323 165.457 100.323 167.109C100.323 168.754 100.015 170.192 99.4002 171.423C98.785 172.653 97.9209 173.611 96.8079 174.295C95.6949 174.979 94.3918 175.321 92.8986 175.321ZM92.909 172.719C93.8768 172.719 94.6787 172.463 95.3147 171.951C95.9507 171.44 96.4208 170.759 96.7249 169.909C97.036 169.058 97.1915 168.122 97.1915 167.099C97.1915 166.082 97.036 165.149 96.7249 164.299C96.4208 163.442 95.9507 162.754 95.3147 162.235C94.6787 161.717 93.8768 161.458 92.909 161.458C91.9343 161.458 91.1255 161.717 90.4826 162.235C89.8466 162.754 89.3731 163.442 89.062 164.299C88.7578 165.149 88.6057 166.082 88.6057 167.099C88.6057 168.122 88.7578 169.058 89.062 169.909C89.3731 170.759 89.8466 171.44 90.4826 171.951C91.1255 172.463 91.9343 172.719 92.909 172.719Z" fill="#586367"/>
                <path d="M67.3331 175V153.764H75.1101C76.6171 153.764 77.8649 154.013 78.8534 154.51C79.842 155.001 80.5816 155.668 81.0724 156.512C81.5633 157.348 81.8087 158.292 81.8087 159.342C81.8087 160.227 81.6462 160.974 81.3213 161.582C80.9964 162.184 80.5609 162.667 80.0148 163.034C79.4756 163.393 78.8811 163.656 78.2313 163.822V164.029C78.9364 164.064 79.6242 164.292 80.2947 164.714C80.9722 165.128 81.5322 165.719 81.9746 166.487C82.417 167.254 82.6382 168.187 82.6382 169.287C82.6382 170.372 82.3824 171.347 81.8709 172.211C81.3662 173.068 80.5851 173.749 79.5274 174.253C78.4697 174.751 77.1183 175 75.473 175H67.3331ZM70.5372 172.252H75.1619C76.6966 172.252 77.7957 171.955 78.4594 171.36C79.123 170.766 79.4548 170.023 79.4548 169.131C79.4548 168.46 79.2855 167.845 78.9467 167.285C78.608 166.725 78.1241 166.279 77.495 165.948C76.8729 165.616 76.1332 165.45 75.276 165.45H70.5372V172.252ZM70.5372 162.951H74.8301C75.5491 162.951 76.1954 162.813 76.7692 162.536C77.3499 162.26 77.8096 161.872 78.1483 161.375C78.4939 160.87 78.6668 160.276 78.6668 159.591C78.6668 158.713 78.3591 157.977 77.7439 157.383C77.1287 156.788 76.185 156.491 74.9131 156.491H70.5372V162.951Z" fill="#586367"/>
                <path d="M151.08 115.493C148.548 115.493 146.361 114.967 144.519 113.915C142.689 112.852 141.28 111.35 140.294 109.41C139.307 107.459 138.814 105.162 138.814 102.521C138.814 99.9229 139.307 97.643 140.294 95.6809C141.291 93.7079 142.683 92.1734 144.47 91.0772C146.257 89.9702 148.356 89.4166 150.767 89.4166C152.324 89.4166 153.793 89.6687 155.174 90.1729C156.566 90.6662 157.793 91.4335 158.857 92.4748C159.931 93.5161 160.775 94.8424 161.389 96.4537C162.002 98.054 162.309 99.9613 162.309 102.175V104H141.609V99.9887H156.604C156.593 98.8487 156.347 97.8348 155.864 96.947C155.382 96.0481 154.708 95.3411 153.842 94.826C152.987 94.3108 151.989 94.0532 150.849 94.0532C149.633 94.0532 148.564 94.3492 147.643 94.9411C146.723 95.522 146.005 96.2893 145.489 97.2429C144.985 98.1856 144.728 99.2214 144.717 100.35V103.852C144.717 105.321 144.985 106.582 145.522 107.634C146.059 108.675 146.81 109.476 147.775 110.035C148.739 110.583 149.868 110.857 151.162 110.857C152.028 110.857 152.812 110.736 153.513 110.495C154.215 110.243 154.823 109.876 155.338 109.393C155.853 108.911 156.242 108.314 156.505 107.601L162.063 108.226C161.712 109.695 161.043 110.977 160.057 112.073C159.081 113.159 157.832 114.003 156.308 114.605C154.785 115.197 153.042 115.493 151.08 115.493Z" fill="#295873"/>
                <path d="M133.779 81.3273V115H127.827V81.3273H133.779Z" fill="#295873"/>
                <path d="M122.307 89.7455V94.3491H107.789V89.7455H122.307ZM111.373 83.6949H117.325V107.404C117.325 108.204 117.445 108.818 117.686 109.245C117.939 109.662 118.267 109.947 118.673 110.1C119.079 110.254 119.528 110.331 120.021 110.331C120.394 110.331 120.734 110.303 121.041 110.248C121.358 110.194 121.6 110.144 121.764 110.1L122.767 114.753C122.449 114.863 121.994 114.984 121.402 115.115C120.821 115.247 120.109 115.323 119.265 115.345C117.774 115.389 116.431 115.164 115.237 114.671C114.042 114.167 113.094 113.389 112.392 112.336C111.702 111.284 111.362 109.969 111.373 108.39V83.6949Z" fill="#295873"/>
                <path d="M97.6234 115V89.7454H103.575V115H97.6234ZM100.616 86.1611C99.6731 86.1611 98.862 85.8487 98.1824 85.224C97.5028 84.5882 97.163 83.8264 97.163 82.9386C97.163 82.0397 97.5028 81.2779 98.1824 80.6531C98.862 80.0174 99.6731 79.6995 100.616 79.6995C101.569 79.6995 102.381 80.0174 103.049 80.6531C103.729 81.2779 104.069 82.0397 104.069 82.9386C104.069 83.8264 103.729 84.5882 103.049 85.224C102.381 85.8487 101.569 86.1611 100.616 86.1611Z" fill="#295873"/>
                <path d="M65.8415 86.4407V81.3273H92.7073V86.4407H82.2997V115H76.2491V86.4407H65.8415Z" fill="#295873"/>
                </svg>
              </button>
            </div>
          </section>
        )}

        {!loading && (
          <div className="w-full flex items-center justify-center gap-12 mt-10">
            {/* Total lessons */}
            <span className="text-2xl text-gray-700 font-semibold select-none">
              {preview.reduce((sum, m) => sum + m.lessons.length, 0)} lessons total
            </span>
            <button
              type="button"
              onClick={handleGenerateFinal}
              className="px-20 py-7 rounded-full bg-[#0066FF] text-white text-2xl hover:bg-[#0054d6] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center gap-4"
              disabled={loading || isGenerating}
            >
              <span className="select-none">Generate</span>
            </button>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/75 flex flex-col items-center justify-center z-50">
          <LoadingAnimation />
          <p className="mt-4 text-gray-800 font-medium">Creating your product...</p>
        </div>
      )}
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    </>
  );
} 