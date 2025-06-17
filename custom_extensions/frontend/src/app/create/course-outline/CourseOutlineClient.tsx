"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, ChevronDown, Settings } from "lucide-react";
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

// Compact radial progress ring (16×16) used for char-count indicator
const RadialProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 16;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5EEFF"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0540AB"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

// Static SVG preview used for each theme tile
const ThemePreviewSvg: React.FC = () => (
  <svg
    width="214"
    height="116"
    viewBox="0 0 416 253"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <path d="M0 250.141C0 251.72 4.02944 253 9 253H409C412.866 253 416 252.004 416 250.776V192H0V250.141Z" fill="#431423"/>
    <path d="M2 9C2 4.02944 6.01006 0 10.9567 0H409.034C412.881 0 416 3.13401 416 7V192H2V9Z" fill="#431423"/>
    <path d="M414 7C414 4.23858 411.761 2 409 2H9C5.13401 2 2 5.13401 2 9V190H414V7ZM416 192H0V9C0 4.02944 4.02944 1.28851e-07 9 0H409L409.36 0.00878906C413.059 0.19633 416 3.25486 416 7V192Z" fill="#3F1C27"/>
    <path d="M31 32H383V192H31V32Z" fill="#5B2439"/>
    <path d="M205.476 169.69L205.455 165.97H205.985L212.223 159.346H215.871L208.757 166.887H208.278L205.476 169.69ZM202.673 175V154.127H205.72V175H202.673ZM212.559 175L206.953 167.56L209.053 165.43L216.299 175H212.559Z" fill="#CE9998"/>
    <path d="M188.567 165.705V175H185.52V159.345H188.445V161.893H188.639C188.999 161.064 189.563 160.399 190.331 159.896C191.105 159.393 192.08 159.142 193.256 159.142C194.322 159.142 195.257 159.366 196.058 159.814C196.86 160.256 197.482 160.915 197.924 161.791C198.365 162.668 198.586 163.752 198.586 165.043V175H195.539V165.41C195.539 164.275 195.243 163.388 194.652 162.749C194.061 162.104 193.249 161.781 192.216 161.781C191.509 161.781 190.881 161.934 190.331 162.24C189.787 162.546 189.356 162.994 189.036 163.585C188.724 164.17 188.567 164.876 188.567 165.705Z" fill="#CE9998"/>
    <path d="M178.373 175V159.345H181.42V175H178.373ZM179.912 156.93C179.382 156.93 178.927 156.753 178.546 156.4C178.173 156.04 177.986 155.612 177.986 155.116C177.986 154.613 178.173 154.185 178.546 153.832C178.927 153.472 179.382 153.292 179.912 153.292C180.442 153.292 180.894 153.472 181.268 153.832C181.648 154.185 181.838 154.613 181.838 155.116C181.838 155.612 181.648 156.04 181.268 156.4C180.894 156.753 180.442 156.93 179.912 156.93Z" fill="#CE9998"/>
    <path d="M174.274 154.127V175H171.226V154.127H174.274Z" fill="#CE9998"/>
    <path d="M151.011 175.296C149.611 175.296 148.405 175.041 147.393 174.531C146.387 174.022 145.613 173.329 145.069 172.452C144.525 171.569 144.254 170.57 144.254 169.456C144.254 168.606 144.43 167.852 144.784 167.193C145.137 166.527 145.63 165.912 146.261 165.348C146.893 164.784 147.624 164.217 148.453 163.646L151.816 161.272C152.387 160.898 152.832 160.504 153.151 160.089C153.47 159.668 153.63 159.148 153.63 158.53C153.63 158.041 153.419 157.572 152.998 157.124C152.577 156.675 152.013 156.451 151.306 156.451C150.817 156.451 150.386 156.57 150.012 156.808C149.645 157.046 149.356 157.351 149.146 157.725C148.942 158.092 148.84 158.479 148.84 158.887C148.84 159.362 148.969 159.841 149.227 160.324C149.492 160.806 149.832 161.306 150.246 161.822C150.661 162.332 151.096 162.862 151.551 163.412L161.243 175H157.799L149.778 165.573C149.105 164.778 148.48 164.03 147.902 163.33C147.325 162.624 146.856 161.91 146.496 161.19C146.143 160.463 145.966 159.678 145.966 158.836C145.966 157.878 146.183 157.029 146.618 156.288C147.06 155.541 147.675 154.956 148.463 154.535C149.251 154.114 150.175 153.903 151.235 153.903C152.309 153.903 153.229 154.114 153.997 154.535C154.772 154.949 155.366 155.503 155.781 156.196C156.202 156.882 156.412 157.633 156.412 158.449C156.412 159.441 156.164 160.317 155.668 161.078C155.179 161.832 154.503 162.525 153.64 163.157L149.451 166.245C148.636 166.843 148.069 167.434 147.749 168.019C147.437 168.596 147.281 169.048 147.281 169.374C147.281 169.972 147.433 170.526 147.739 171.035C148.052 171.545 148.487 171.953 149.044 172.258C149.608 172.564 150.267 172.717 151.021 172.717C151.796 172.717 152.55 172.551 153.284 172.218C154.024 171.878 154.693 171.392 155.291 170.76C155.896 170.128 156.375 169.371 156.728 168.487C157.082 167.604 157.258 166.616 157.258 165.522H160.01C160.01 166.867 159.857 168.005 159.551 168.936C159.246 169.86 158.875 170.614 158.441 171.198C158.013 171.776 157.608 172.228 157.228 172.554C157.105 172.663 156.99 172.771 156.881 172.88C156.773 172.989 156.657 173.098 156.535 173.206C155.828 173.92 154.972 174.446 153.966 174.786C152.968 175.126 151.982 175.296 151.011 175.296Z" fill="#CE9998"/>
    <path d="M123.011 180.87C122.556 180.87 122.142 180.833 121.768 180.758C121.394 180.69 121.116 180.616 120.932 180.534L121.666 178.037C122.223 178.187 122.719 178.251 123.154 178.231C123.589 178.21 123.973 178.047 124.306 177.742C124.646 177.436 124.945 176.936 125.203 176.243L125.58 175.204L119.852 159.345H123.113L127.078 171.494H127.241L131.206 159.345H134.477L128.026 177.089C127.727 177.905 127.346 178.594 126.884 179.158C126.422 179.729 125.872 180.157 125.233 180.442C124.595 180.728 123.854 180.87 123.011 180.87Z" fill="#CE9998"/>
    <path d="M108.98 175.306C107.716 175.306 106.588 174.983 105.596 174.338C104.611 173.685 103.837 172.758 103.273 171.555C102.715 170.346 102.437 168.895 102.437 167.203C102.437 165.512 102.719 164.064 103.283 162.862C103.854 161.659 104.635 160.738 105.627 160.1C106.619 159.461 107.743 159.142 109 159.142C109.972 159.142 110.753 159.305 111.344 159.631C111.942 159.95 112.404 160.324 112.731 160.752C113.063 161.18 113.322 161.557 113.505 161.883H113.689V154.127H116.736V175H113.76V172.564H113.505C113.322 172.897 113.057 173.278 112.71 173.706C112.37 174.134 111.902 174.507 111.304 174.827C110.706 175.146 109.931 175.306 108.98 175.306ZM109.653 172.707C110.529 172.707 111.27 172.476 111.874 172.014C112.486 171.545 112.948 170.896 113.261 170.067C113.58 169.238 113.74 168.273 113.74 167.173C113.74 166.086 113.583 165.134 113.271 164.319C112.958 163.504 112.5 162.868 111.895 162.413C111.29 161.958 110.543 161.73 109.653 161.73C108.735 161.73 107.971 161.968 107.36 162.444C106.748 162.919 106.286 163.568 105.973 164.39C105.668 165.213 105.515 166.14 105.515 167.173C105.515 168.219 105.671 169.16 105.984 169.996C106.296 170.832 106.758 171.494 107.37 171.983C107.988 172.466 108.749 172.707 109.653 172.707Z" fill="#CE9998"/>
    <path d="M92.421 175.316C90.9533 175.316 89.6726 174.98 88.5787 174.307C87.4847 173.634 86.6354 172.693 86.0307 171.484C85.426 170.274 85.1237 168.861 85.1237 167.244C85.1237 165.62 85.426 164.2 86.0307 162.984C86.6354 161.768 87.4847 160.823 88.5787 160.151C89.6726 159.478 90.9533 159.142 92.421 159.142C93.8886 159.142 95.1693 159.478 96.2633 160.151C97.3572 160.823 98.2065 161.768 98.8112 162.984C99.4159 164.2 99.7183 165.62 99.7183 167.244C99.7183 168.861 99.4159 170.274 98.8112 171.484C98.2065 172.693 97.3572 173.634 96.2633 174.307C95.1693 174.98 93.8886 175.316 92.421 175.316ZM92.4312 172.758C93.3824 172.758 94.1705 172.506 94.7956 172.004C95.4207 171.501 95.8828 170.832 96.1817 169.996C96.4875 169.16 96.6403 168.239 96.6403 167.234C96.6403 166.235 96.4875 165.318 96.1817 164.482C95.8828 163.64 95.4207 162.964 94.7956 162.454C94.1705 161.944 93.3824 161.69 92.4312 161.69C91.4731 161.69 90.6782 161.944 90.0463 162.454C89.4212 162.964 88.9558 163.64 88.65 164.482C88.351 165.318 88.2016 166.235 88.2016 167.234C88.2016 168.239 88.351 169.16 88.65 169.996C88.9558 170.832 89.4212 171.501 90.0463 172.004C90.6782 172.506 91.4731 172.758 92.4312 172.758Z" fill="#CE9998"/>
    <path d="M67.2932 175V154.127H74.937C76.4182 154.127 77.6446 154.372 78.6162 154.861C79.5878 155.344 80.3148 155.999 80.7972 156.828C81.2796 157.65 81.5209 158.578 81.5209 159.61C81.5209 160.48 81.3612 161.214 81.0418 161.812C80.7225 162.403 80.2944 162.879 79.7577 163.239C79.2277 163.592 78.6434 163.85 78.0047 164.013V164.217C78.6977 164.251 79.3738 164.475 80.0329 164.89C80.6987 165.297 81.2491 165.878 81.6839 166.633C82.1188 167.387 82.3362 168.304 82.3362 169.384C82.3362 170.451 82.0848 171.409 81.582 172.258C81.086 173.101 80.3182 173.77 79.2787 174.266C78.2391 174.755 76.9108 175 75.2937 175H67.2932ZM70.4424 172.299H74.9879C76.4963 172.299 77.5766 172.007 78.2289 171.423C78.8812 170.838 79.2073 170.108 79.2073 169.232C79.2073 168.572 79.0409 167.968 78.7079 167.417C78.375 166.867 77.8994 166.429 77.2811 166.103C76.6696 165.777 75.9426 165.613 75.1 165.613H70.4424V172.299ZM70.4424 163.157H74.6618C75.3684 163.157 76.0037 163.021 76.5677 162.75C77.1384 162.478 77.5902 162.097 77.9232 161.608C78.2629 161.112 78.4327 160.528 78.4327 159.855C78.4327 158.992 78.1304 158.269 77.5257 157.684C76.921 157.1 75.9935 156.808 74.7433 156.808H70.4424V163.157Z" fill="#CE9998"/>
    <path d="M152.901 115.509C150.287 115.509 148.029 114.966 146.128 113.88C144.238 112.782 142.784 111.232 141.766 109.229C140.747 107.214 140.238 104.844 140.238 102.116C140.238 99.4344 140.747 97.0806 141.766 95.055C142.795 93.0181 144.233 91.4338 146.077 90.3022C147.922 89.1592 150.089 88.5878 152.578 88.5878C154.185 88.5878 155.702 88.848 157.127 89.3686C158.565 89.8778 159.832 90.67 160.93 91.745C162.039 92.8201 162.91 94.1893 163.544 95.8528C164.178 97.505 164.494 99.474 164.494 101.76V103.644H143.124V99.5023H158.604C158.593 98.3254 158.338 97.2787 157.84 96.3621C157.342 95.4341 156.647 94.7042 155.753 94.1724C154.87 93.6405 153.84 93.3746 152.663 93.3746C151.407 93.3746 150.304 93.6801 149.353 94.2912C148.403 94.8909 147.661 95.6831 147.13 96.6676C146.609 97.6408 146.343 98.7102 146.332 99.8758V103.491C146.332 105.008 146.609 106.309 147.163 107.395C147.718 108.47 148.493 109.297 149.489 109.874C150.485 110.44 151.65 110.722 152.986 110.722C153.88 110.722 154.689 110.598 155.413 110.349C156.137 110.089 156.765 109.71 157.297 109.212C157.829 108.714 158.231 108.097 158.502 107.361L164.24 108.007C163.878 109.523 163.187 110.847 162.169 111.979C161.162 113.099 159.872 113.97 158.299 114.593C156.726 115.204 154.926 115.509 152.901 115.509Z" fill="#E6A18E"/>
    <path d="M135.04 80.2363V115H128.895V80.2363H135.04Z" fill="#E6A18E"/>
    <path d="M123.196 88.9273V93.6801H108.207V88.9273H123.196ZM111.908 82.6807H118.052V107.158C118.052 107.984 118.177 108.618 118.426 109.059C118.686 109.489 119.026 109.783 119.444 109.942C119.863 110.1 120.327 110.179 120.836 110.179C121.221 110.179 121.572 110.151 121.889 110.094C122.217 110.038 122.466 109.987 122.635 109.942L123.671 114.745C123.343 114.859 122.873 114.983 122.262 115.119C121.662 115.255 120.927 115.334 120.055 115.356C118.516 115.402 117.13 115.17 115.897 114.66C114.663 114.14 113.684 113.336 112.96 112.25C112.247 111.164 111.896 109.806 111.908 108.176V82.6807Z" fill="#E6A18E"/>
    <path d="M97.7127 115V88.9273H103.857V115H97.7127ZM100.802 85.2269C99.8289 85.2269 98.9915 84.9043 98.2898 84.2593C97.5882 83.603 97.2374 82.8165 97.2374 81.8999C97.2374 80.9719 97.5882 80.1855 98.2898 79.5404C98.9915 78.8841 99.8289 78.5559 100.802 78.5559C101.787 78.5559 102.624 78.8841 103.314 79.5404C104.016 80.1855 104.367 80.9719 104.367 81.8999C104.367 82.8165 104.016 83.603 103.314 84.2593C102.624 84.9043 101.787 85.2269 100.802 85.2269Z" fill="#E6A18E"/>
    <path d="M64.9011 85.5154V80.2363H92.6373V85.5154H81.8925V115H75.6459V85.5154H64.9011Z" fill="#E6A18E"/>
    <path d="M31 189H383V221H31V189Z" fill="#5B2439"/>
  </svg>
);

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

  // Currently chosen theme (UI only)
  const [selectedTheme, setSelectedTheme] = useState<string>("peach");

  // Track which lesson rows are expanded: key format `${modIdx}-${lessonIdx}` -> boolean
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // Keep a reference to the current in-flight preview request so we can cancel it
  const previewAbortRef = useRef<AbortController | null>(null);

  // Ref for auto-resizing the prompt textarea
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Resize the textarea based on its content
  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

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

  // Extra boolean filters (all true by default)
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    time: true,
  });

  // Ref for closing the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showFilters) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilters]);

  // Total characters in editable outline preview (titles + lessons)
  const charCount = useMemo(() => {
    return preview.reduce((sum: number, mod: ModulePreview) => {
      const lessonChars = mod.lessons.reduce((ls, l) => ls + l.length, 0);
      return sum + mod.title.length + lessonChars;
    }, 0);
  }, [preview]);

  // Total lessons & credit cost (2 credits per lesson)
  const lessonsTotal = useMemo(() => preview.reduce((sum, m) => sum + m.lessons.length, 0), [preview]);
  const creditsRequired = lessonsTotal * 2;

  // Predefined theme preview data to match provided mockup
  const themeOptions = [
    {
      id: "peach",
      label: "Peach",
      previewClass: "bg-[conic-gradient(at_top_left,_#FFF3C4,_#FFD3E2)]", // soft yellow→pink swirl
      titleColor: "#20355D",
      bodyColor: "#20355D",
      linkColor: "#0066FF",
    },
    {
      id: "mocha",
      label: "Mocha",
      previewClass: "bg-[#3F3B3B]",
      titleColor: "#E7C0A4",
      bodyColor: "#C8B3A6",
      linkColor: "#C8A08A",
    },
    {
      id: "coal",
      label: "Coal",
      previewClass: "bg-[#000000]",
      titleColor: "#F5F5F5",
      bodyColor: "#D1D1D1",
      linkColor: "#D1D1D1",
    },
    {
      id: "stardust",
      label: "Stardust",
      previewClass: "bg-[url('/stars-bg.png')] bg-cover bg-center",
      titleColor: "#FFFFFF",
      bodyColor: "#FFFFFF",
      linkColor: "#FF9E3D",
    },
    {
      id: "pistachio",
      label: "Pistachio",
      previewClass: "bg-[#E4F3E7]",
      titleColor: "#20355D",
      bodyColor: "#20355D",
      linkColor: "#0066FF",
    },
    {
      id: "nebulae",
      label: "Nebulae",
      previewClass: "bg-gradient-to-r from-[#1A003D] via-[#120A45] to-[#000000]",
      titleColor: "#5CC9FF",
      bodyColor: "#FFFFFF",
      linkColor: "#5CC9FF",
    },
  ];

  return (
    <>
    <main
      /* Shared pastel gradient (identical to generate page) */
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
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
        <h1 className="text-2xl font-semibold text-center text-black mt-2">Generate</h1>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2">
          <div className="relative">
            <select
              value={modules}
              onChange={(e) => setModules(Number(e.target.value))}
              className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} Modules</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={lessonsPerModule}
              onChange={(e) => setLessonsPerModule(e.target.value)}
              className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            >
              {["1-2", "3-4", "5-7", "8-10"].map((rng) => (
                <option key={rng} value={rng}>{rng} per module</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
            >
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
              <option value="es">Spanish</option>
              <option value="ru">Russian</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>

          {/* Additional Info dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black flex items-center gap-1"
            >
              Additional Info <ChevronDown size={14} />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg p-3 z-20">
                {[
                  { key: "knowledgeCheck", label: "Knowledge Check" },
                  { key: "contentAvailability", label: "Content Availability" },
                  { key: "informationSource", label: "Information Source" },
                  { key: "time", label: "Time" },
                ].map(({ key, label }) => (
                  // @ts-ignore dynamic key
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-brand-primary"
                      // @ts-ignore dynamic key
                      checked={filters[key]}
                      onChange={() =>
                        // @ts-ignore dynamic key
                        setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prompt textarea */}
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you'd like to make"
          rows={1}
          className="w-full border border-gray-300 rounded-md p-3 resize-none overflow-hidden bg-white/90 placeholder-gray-500 min-h-[56px]"
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#20355D]">Modules & Lessons</h2>
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
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-full border border-[#D5DDF8] text-[#20355D] py-3 font-medium hover:bg-[#F0F4FF] active:scale-95 transition"
              >
                <Plus size={18} />
                <span>Add Module</span>
              </button>
              {/* Status row – identical style mock */}
              <div className="mt-3 flex items-center justify-between text-sm text-[#858587]">
                <span className="select-none">{preview.reduce((sum, m) => sum + m.lessons.length, 0)} lessons total</span>
                <div className="flex-1 flex justify-center">
                  <span className="flex items-center gap-1 select-none">
                    Press <span className="border px-2 py-0.5 rounded bg-gray-100 text-xs font-mono">⏎</span> to split lessons
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <RadialProgress progress={charCount / 50000} />
                  {charCount}/50000
                </span>
              </div>
            </div>
          )}

          {!loading && preview.length === 1 && preview[0].lessons.length === 0 && rawOutline && (
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 border rounded">
              {rawOutline}
            </pre>
          )}
        </section>

        {!loading && preview.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[#20355D]">Set up your Contentbuilder</h2>
            <div className="bg-white border border-gray-300 rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-[#20355D]">Themes</h2>
                  <p className="mt-1 text-[#858587] font-medium text-sm">Use one of our popular themes below or browse others</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-[#20355D] hover:opacity-80 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-palette-icon lucide-palette w-4 h-4"
                  >
                    <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  </svg>
                  <span>View more</span>
                </button>
              </div>
              {/* New themes grid */}
              <div className="grid grid-cols-3 gap-5">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex flex-col rounded-lg overflow-hidden border shadow-sm transition-all p-2 gap-2 ${selectedTheme === t.id ? 'border-[#63A2FF] bg-[#EAF3FF]' : 'border-transparent'}`}
                  >
                    {/* Preview */}
                    <div className="w-[214px] h-[116px] flex items-center justify-center">
                      <ThemePreviewSvg />
                    </div>
                    {/* Label with optional checkmark */}
                    <div className="flex items-center gap-1 px-1">
                      {selectedTheme === t.id && <span className="text-[#0540AB]">✔</span>}
                      <span className="text-sm text-[#20355D] font-medium select-none">{t.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* old placeholder hidden */}
              <div className="flex gap-4 hidden">
                <button
                  className="px-1 py-0.5 rounded-md focus:outline-none bg-transparent hover:opacity-80 transition-opacity"
                  title="Default design"
                >
                  <svg width="416" height="253" viewBox="0 0 416 253" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 250.141C0 251.72 4.02944 253 9 253H409C412.866 253 416 252.004 416 250.776V192H0V250.141Z" fill="#431423"/>
                  <path d="M2 9C2 4.02944 6.01006 0 10.9567 0H409.034C412.881 0 416 3.13401 416 7V192H2V9Z" fill="#431423"/>
                  <path d="M414 7C414 4.23858 411.761 2 409 2H9C5.13401 2 2 5.13401 2 9V190H414V7ZM416 192H0V9C0 4.02944 4.02944 1.28851e-07 9 0H409L409.36 0.00878906C413.059 0.19633 416 3.25486 416 7V192Z" fill="#3F1C27"/>
                  <path d="M31 32H383V192H31V32Z" fill="#5B2439"/>
                  <path d="M205.476 169.69L205.455 165.97H205.985L212.223 159.346H215.871L208.757 166.887H208.278L205.476 169.69ZM202.673 175V154.127H205.72V175H202.673ZM212.559 175L206.953 167.56L209.053 165.43L216.299 175H212.559Z" fill="#CE9998"/>
                  <path d="M188.567 165.705V175H185.52V159.345H188.445V161.893H188.639C188.999 161.064 189.563 160.399 190.331 159.896C191.105 159.393 192.08 159.142 193.256 159.142C194.322 159.142 195.257 159.366 196.058 159.814C196.86 160.256 197.482 160.915 197.924 161.791C198.365 162.668 198.586 163.752 198.586 165.043V175H195.539V165.41C195.539 164.275 195.243 163.388 194.652 162.749C194.061 162.104 193.249 161.781 192.216 161.781C191.509 161.781 190.881 161.934 190.331 162.24C189.787 162.546 189.356 162.994 189.036 163.585C188.724 164.17 188.567 164.876 188.567 165.705Z" fill="#CE9998"/>
                  <path d="M178.373 175V159.345H181.42V175H178.373ZM179.912 156.93C179.382 156.93 178.927 156.753 178.546 156.4C178.173 156.04 177.986 155.612 177.986 155.116C177.986 154.613 178.173 154.185 178.546 153.832C178.927 153.472 179.382 153.292 179.912 153.292C180.442 153.292 180.894 153.472 181.268 153.832C181.648 154.185 181.838 154.613 181.838 155.116C181.838 155.612 181.648 156.04 181.268 156.4C180.894 156.753 180.442 156.93 179.912 156.93Z" fill="#CE9998"/>
                  <path d="M174.274 154.127V175H171.226V154.127H174.274Z" fill="#CE9998"/>
                  <path d="M151.011 175.296C149.611 175.296 148.405 175.041 147.393 174.531C146.387 174.022 145.613 173.329 145.069 172.452C144.525 171.569 144.254 170.57 144.254 169.456C144.254 168.606 144.43 167.852 144.784 167.193C145.137 166.527 145.63 165.912 146.261 165.348C146.893 164.784 147.624 164.217 148.453 163.646L151.816 161.272C152.387 160.898 152.832 160.504 153.151 160.089C153.47 159.668 153.63 159.148 153.63 158.53C153.63 158.041 153.419 157.572 152.998 157.124C152.577 156.675 152.013 156.451 151.306 156.451C150.817 156.451 150.386 156.57 150.012 156.808C149.645 157.046 149.356 157.351 149.146 157.725C148.942 158.092 148.84 158.479 148.84 158.887C148.84 159.362 148.969 159.841 149.227 160.324C149.492 160.806 149.832 161.306 150.246 161.822C150.661 162.332 151.096 162.862 151.551 163.412L161.243 175H157.799L149.778 165.573C149.105 164.778 148.48 164.03 147.902 163.33C147.325 162.624 146.856 161.91 146.496 161.19C146.143 160.463 145.966 159.678 145.966 158.836C145.966 157.878 146.183 157.029 146.618 156.288C147.06 155.541 147.675 154.956 148.463 154.535C149.251 154.114 150.175 153.903 151.235 153.903C152.309 153.903 153.229 154.114 153.997 154.535C154.772 154.949 155.366 155.503 155.781 156.196C156.202 156.882 156.412 157.633 156.412 158.449C156.412 159.441 156.164 160.317 155.668 161.078C155.179 161.832 154.503 162.525 153.64 163.157L149.451 166.245C148.636 166.843 148.069 167.434 147.749 168.019C147.437 168.596 147.281 169.048 147.281 169.374C147.281 169.972 147.433 170.526 147.739 171.035C148.052 171.545 148.487 171.953 149.044 172.258C149.608 172.564 150.267 172.717 151.021 172.717C151.796 172.717 152.55 172.551 153.284 172.218C154.024 171.878 154.693 171.392 155.291 170.76C155.896 170.128 156.375 169.371 156.728 168.487C157.082 167.604 157.258 166.616 157.258 165.522H160.01C160.01 166.867 159.857 168.005 159.551 168.936C159.246 169.86 158.875 170.614 158.441 171.198C158.013 171.776 157.608 172.228 157.228 172.554C157.105 172.663 156.99 172.771 156.881 172.88C156.773 172.989 156.657 173.098 156.535 173.206C155.828 173.92 154.972 174.446 153.966 174.786C152.968 175.126 151.982 175.296 151.011 175.296Z" fill="#CE9998"/>
                  <path d="M123.011 180.87C122.556 180.87 122.142 180.833 121.768 180.758C121.394 180.69 121.116 180.616 120.932 180.534L121.666 178.037C122.223 178.187 122.719 178.251 123.154 178.231C123.589 178.21 123.973 178.047 124.306 177.742C124.646 177.436 124.945 176.936 125.203 176.243L125.58 175.204L119.852 159.345H123.113L127.078 171.494H127.241L131.206 159.345H134.477L128.026 177.089C127.727 177.905 127.346 178.594 126.884 179.158C126.422 179.729 125.872 180.157 125.233 180.442C124.595 180.728 123.854 180.87 123.011 180.87Z" fill="#CE9998"/>
                  <path d="M108.98 175.306C107.716 175.306 106.588 174.983 105.596 174.338C104.611 173.685 103.837 172.758 103.273 171.555C102.715 170.346 102.437 168.895 102.437 167.203C102.437 165.512 102.719 164.064 103.283 162.862C103.854 161.659 104.635 160.738 105.627 160.1C106.619 159.461 107.743 159.142 109 159.142C109.972 159.142 110.753 159.305 111.344 159.631C111.942 159.95 112.404 160.324 112.731 160.752C113.063 161.18 113.322 161.557 113.505 161.883H113.689V154.127H116.736V175H113.76V172.564H113.505C113.322 172.897 113.057 173.278 112.71 173.706C112.37 174.134 111.902 174.507 111.304 174.827C110.706 175.146 109.931 175.306 108.98 175.306ZM109.653 172.707C110.529 172.707 111.27 172.476 111.874 172.014C112.486 171.545 112.948 170.896 113.261 170.067C113.58 169.238 113.74 168.273 113.74 167.173C113.74 166.086 113.583 165.134 113.271 164.319C112.958 163.504 112.5 162.868 111.895 162.413C111.29 161.958 110.543 161.73 109.653 161.73C108.735 161.73 107.971 161.968 107.36 162.444C106.748 162.919 106.286 163.568 105.973 164.39C105.668 165.213 105.515 166.14 105.515 167.173C105.515 168.219 105.671 169.16 105.984 169.996C106.296 170.832 106.758 171.494 107.37 171.983C107.988 172.466 108.749 172.707 109.653 172.707Z" fill="#CE9998"/>
                  <path d="M92.421 175.316C90.9533 175.316 89.6726 174.98 88.5787 174.307C87.4847 173.634 86.6354 172.693 86.0307 171.484C85.426 170.274 85.1237 168.861 85.1237 167.244C85.1237 165.62 85.426 164.2 86.0307 162.984C86.6354 161.768 87.4847 160.823 88.5787 160.151C89.6726 159.478 90.9533 159.142 92.421 159.142C93.8886 159.142 95.1693 159.478 96.2633 160.151C97.3572 160.823 98.2065 161.768 98.8112 162.984C99.4159 164.2 99.7183 165.62 99.7183 167.244C99.7183 168.861 99.4159 170.274 98.8112 171.484C98.2065 172.693 97.3572 173.634 96.2633 174.307C95.1693 174.98 93.8886 175.316 92.421 175.316ZM92.4312 172.758C93.3824 172.758 94.1705 172.506 94.7956 172.004C95.4207 171.501 95.8828 170.832 96.1817 169.996C96.4875 169.16 96.6403 168.239 96.6403 167.234C96.6403 166.235 96.4875 165.318 96.1817 164.482C95.8828 163.64 95.4207 162.964 94.7956 162.454C94.1705 161.944 93.3824 161.69 92.4312 161.69C91.4731 161.69 90.6782 161.944 90.0463 162.454C89.4212 162.964 88.9558 163.64 88.65 164.482C88.351 165.318 88.2016 166.235 88.2016 167.234C88.2016 168.239 88.351 169.16 88.65 169.996C88.9558 170.832 89.4212 171.501 90.0463 172.004C90.6782 172.506 91.4731 172.758 92.4312 172.758Z" fill="#CE9998"/>
                  <path d="M67.2932 175V154.127H74.937C76.4182 154.127 77.6446 154.372 78.6162 154.861C79.5878 155.344 80.3148 155.999 80.7972 156.828C81.2796 157.65 81.5209 158.578 81.5209 159.61C81.5209 160.48 81.3612 161.214 81.0418 161.812C80.7225 162.403 80.2944 162.879 79.7577 163.239C79.2277 163.592 78.6434 163.85 78.0047 164.013V164.217C78.6977 164.251 79.3738 164.475 80.0329 164.89C80.6987 165.297 81.2491 165.878 81.6839 166.633C82.1188 167.387 82.3362 168.304 82.3362 169.384C82.3362 170.451 82.0848 171.409 81.582 172.258C81.086 173.101 80.3182 173.77 79.2787 174.266C78.2391 174.755 76.9108 175 75.2937 175H67.2932ZM70.4424 172.299H74.9879C76.4963 172.299 77.5766 172.007 78.2289 171.423C78.8812 170.838 79.2073 170.108 79.2073 169.232C79.2073 168.572 79.0409 167.968 78.7079 167.417C78.375 166.867 77.8994 166.429 77.2811 166.103C76.6696 165.777 75.9426 165.613 75.1 165.613H70.4424V172.299ZM70.4424 163.157H74.6618C75.3684 163.157 76.0037 163.021 76.5677 162.75C77.1384 162.478 77.5902 162.097 77.9232 161.608C78.2629 161.112 78.4327 160.528 78.4327 159.855C78.4327 158.992 78.1304 158.269 77.5257 157.684C76.921 157.1 75.9935 156.808 74.7433 156.808H70.4424V163.157Z" fill="#CE9998"/>
                  <path d="M152.901 115.509C150.287 115.509 148.029 114.966 146.128 113.88C144.238 112.782 142.784 111.232 141.766 109.229C140.747 107.214 140.238 104.844 140.238 102.116C140.238 99.4344 140.747 97.0806 141.766 95.055C142.795 93.0181 144.233 91.4338 146.077 90.3022C147.922 89.1592 150.089 88.5878 152.578 88.5878C154.185 88.5878 155.702 88.848 157.127 89.3686C158.565 89.8778 159.832 90.67 160.93 91.745C162.039 92.8201 162.91 94.1893 163.544 95.8528C164.178 97.505 164.494 99.474 164.494 101.76V103.644H143.124V99.5023H158.604C158.593 98.3254 158.338 97.2787 157.84 96.3621C157.342 95.4341 156.647 94.7042 155.753 94.1724C154.87 93.6405 153.84 93.3746 152.663 93.3746C151.407 93.3746 150.304 93.6801 149.353 94.2912C148.403 94.8909 147.661 95.6831 147.13 96.6676C146.609 97.6408 146.343 98.7102 146.332 99.8758V103.491C146.332 105.008 146.609 106.309 147.163 107.395C147.718 108.47 148.493 109.297 149.489 109.874C150.485 110.44 151.65 110.722 152.986 110.722C153.88 110.722 154.689 110.598 155.413 110.349C156.137 110.089 156.765 109.71 157.297 109.212C157.829 108.714 158.231 108.097 158.502 107.361L164.24 108.007C163.878 109.523 163.187 110.847 162.169 111.979C161.162 113.099 159.872 113.97 158.299 114.593C156.726 115.204 154.926 115.509 152.901 115.509Z" fill="#E6A18E"/>
                  <path d="M135.04 80.2363V115H128.895V80.2363H135.04Z" fill="#E6A18E"/>
                  <path d="M123.196 88.9273V93.6801H108.207V88.9273H123.196ZM111.908 82.6807H118.052V107.158C118.052 107.984 118.177 108.618 118.426 109.059C118.686 109.489 119.026 109.783 119.444 109.942C119.863 110.1 120.327 110.179 120.836 110.179C121.221 110.179 121.572 110.151 121.889 110.094C122.217 110.038 122.466 109.987 122.635 109.942L123.671 114.745C123.343 114.859 122.873 114.983 122.262 115.119C121.662 115.255 120.927 115.334 120.055 115.356C118.516 115.402 117.13 115.17 115.897 114.66C114.663 114.14 113.684 113.336 112.96 112.25C112.247 111.164 111.896 109.806 111.908 108.176V82.6807Z" fill="#E6A18E"/>
                  <path d="M97.7127 115V88.9273H103.857V115H97.7127ZM100.802 85.2269C99.8289 85.2269 98.9915 84.9043 98.2898 84.2593C97.5882 83.603 97.2374 82.8165 97.2374 81.8999C97.2374 80.9719 97.5882 80.1855 98.2898 79.5404C98.9915 78.8841 99.8289 78.5559 100.802 78.5559C101.787 78.5559 102.624 78.8841 103.314 79.5404C104.016 80.1855 104.367 80.9719 104.367 81.8999C104.367 82.8165 104.016 83.603 103.314 84.2593C102.624 84.9043 101.787 85.2269 100.802 85.2269Z" fill="#E6A18E"/>
                  <path d="M64.9011 85.5154V80.2363H92.6373V85.5154H81.8925V115H75.6459V85.5154H64.9011Z" fill="#E6A18E"/>
                  <path d="M31 189H383V221H31V189Z" fill="#5B2439"/>
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
                  <path d="M31 189H383V221H31V189Z" fill="#5B2439"/>
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
            </div>
          </section>
        )}

        {/* Advanced Mode link placed after Designs section */}
        {!loading && preview.length > 0 && (
          <div className="w-full flex justify-center mt-0 mb-12">
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-[#396EDF] hover:opacity-80 transition-opacity select-none"
            >
              Advanced Mode
              <Settings size={14} />
            </button>
          </div>
        )}
      </div> {/* end inner wrapper */}

      {/* Full-width generate footer bar */}
      {!loading && preview.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
          {/* Credits required */}
          <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
            {/* custom stacked-coins svg */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{creditsRequired} credits</span>
          </div>

          {/* Lessons total + generate */}
          <div className="flex items-center gap-[7.5rem]">
            <span className="text-lg text-gray-700 font-medium select-none">
              {lessonsTotal} lessons total
            </span>
            <button
              type="button"
              onClick={handleGenerateFinal}
              className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || isGenerating}
            >
              <Sparkles size={18} />
              <span className="select-none font-semibold">Generate</span>
            </button>
          </div>

          {/* Help button (disabled) */}
          <button
            type="button"
            disabled
            className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center opacity-60 cursor-not-allowed select-none font-bold"
            aria-label="Help (coming soon)"
          >
            ?
          </button>
        </div>
      )}
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    {isGenerating && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
        <LoadingAnimation message="Finalizing product..." />
      </div>
    )}
    </>
  );
} 