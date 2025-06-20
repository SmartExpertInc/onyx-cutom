// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shuffle, Sparkles, Plus, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Lightweight placeholder SVG icons – replace with real paths later
const PlaceholderIcon: React.FC<{ label: string; size?: number }> = ({ label, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#E5E7EB" />
    <text
      x="32"
      y="34"
      textAnchor="middle"
      fontSize="14"
      fontFamily="sans-serif"
      fill="#6B7280"
    >{label}</text>
  </svg>
);
const CourseOutlineIcon = (p: any) => <PlaceholderIcon {...p} label="CO" />;
const LessonPresentationIcon = (p: any) => <PlaceholderIcon {...p} label="LP" />;
const VideoScriptIcon = (p: any) => <PlaceholderIcon {...p} label="VS" />;
const QuizIcon = (p: any) => <PlaceholderIcon {...p} label="QZ" />;

// Simple tab button
interface TabButtonProps {
  label: string;
  Icon?: React.ElementType;
  active?: boolean;
  onClick?: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer w-40 h-28 text-center ${
      active
        ? "bg-white shadow text-brand-primary border border-brand-primary"
        : "bg-white/70 text-gray-700 hover:bg-white"
    }`}
  >
    {Icon && <Icon size={64} />}
    <span className="text-sm font-medium leading-tight">{label}</span>
  </button>
);

export default function GenerateProductPickerClient() {
  // State & hooks identical to the original page component
  const [prompt, setPrompt] = useState("");
  const [modulesCount, setModulesCount] = useState(4);
  const [lessonsPerModule, setLessonsPerModule] = useState("3-4");
  const [language, setLanguage] = useState("en");

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    time: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const allExamples = [
    "Code Optimization Course",
    "Junior AI/ML Engineer Training",
    "New Employee Onboarding",
    "Step to analyze the market",
    "How to choose the right pricing strategy",
    "Course on AI tools for teachers of the high school",
    "Course 'How to start learning Spanish'",
    "Customer journey mapping",
    "A guide to investing in real estate",
  ];
  const getRandomExamples = () => [...allExamples].sort(() => 0.5 - Math.random()).slice(0, 6);
  const [examples, setExamples] = useState<string[]>(getRandomExamples());
  const shuffleExamples = () => setExamples(getRandomExamples());

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

  const router = useRouter();

  const handleCourseOutlineStart = async () => {
    if (!prompt.trim()) return;
    let chatId: string | undefined;
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/course-outline/init-chat`, { method: "POST" });
      if (res.ok) chatId = (await res.json()).chatSessionId;
    } catch (_) {}

    const params = new URLSearchParams({
      prompt,
      modules: String(modulesCount),
      lessons: lessonsPerModule,
      lang: language,
      knowledgeCheck: filters.knowledgeCheck ? "1" : "0",
      contentAvailability: filters.contentAvailability ? "1" : "0",
      informationSource: filters.informationSource ? "1" : "0",
      time: filters.time ? "1" : "0",
    });
    if (chatId) params.set("chatId", chatId);
    router.push(`/create/course-outline?${params.toString()}`);
  };

  // auto-resize textarea
  const promptRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // search params prefill
  const searchParams = useSearchParams();
  const initialProductParam = searchParams.get("product");
  const [activeProduct, setActiveProduct] = useState<"Course Outline" | "Lesson Presentation">(
    initialProductParam === "lessonPresentation" ? "Lesson Presentation" : "Course Outline"
  );
  const initialOutlineIdParam = searchParams.get("outlineId");
  const initialLessonParam = searchParams.get("lesson");

  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(initialOutlineIdParam ? Number(initialOutlineIdParam) : null);
  const [lessonsForOutline, setLessonsForOutline] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>(initialLessonParam || "");
  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">("Short");

  useEffect(() => {
    if (activeProduct !== "Lesson Presentation") return;
    (async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const outlinesOnly = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setOutlines(outlinesOnly.map((p: any) => ({ id: p.id, name: p.projectName })));
        if (initialOutlineIdParam && !selectedOutlineId) {
          const idNum = Number(initialOutlineIdParam);
          if (outlinesOnly.find((o: any) => o.id === idNum)) setSelectedOutlineId(idNum);
        }
      } catch (_) {}
    })();
  }, [activeProduct]);

  useEffect(() => {
    if (activeProduct !== "Lesson Presentation" || selectedOutlineId == null) return;
    (async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const lessons: string[] = [];
        sections.forEach((sec: any) => (sec.lessons || []).forEach((ls: any) => lessons.push(ls.title || "")));
        setLessonsForOutline(lessons);
        if (initialLessonParam && !selectedLesson && lessons.includes(initialLessonParam)) setSelectedLesson(initialLessonParam);
      } catch (_) {}
    })();
  }, [selectedOutlineId, activeProduct]);

  const lengthRangeForOption = (opt: string) => (opt === "Short" ? "100-200 words" : opt === "Medium" ? "300-400 words" : "500+ words");

  const handleLessonPresentationStart = () => {
    if (!selectedOutlineId || !selectedLesson) {
      if (!prompt.trim()) return;
    }
    const params = new URLSearchParams();
    if (selectedOutlineId) params.set("outlineId", String(selectedOutlineId));
    if (selectedLesson) params.set("lesson", selectedLesson);
    params.set("length", lengthRangeForOption(lengthOption));
    if (prompt.trim()) params.set("prompt", prompt.trim());
    params.set("lang", language);
    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  // ---- JSX ----
  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#CBDAFB 35%,#AEE5FA 70%,#FFFFFF 100%)" }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4 text-gray-900">
        <Link
          href="/create"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-5xl font-semibold text-center tracking-wide text-gray-700 mt-8">Generate</h1>
        <p className="text-center text-gray-600 text-lg -mt-1">What would you like to create today?</p>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-4">
          <TabButton label="Course Outline" Icon={CourseOutlineIcon} active={activeProduct === "Course Outline"} onClick={() => setActiveProduct("Course Outline")} />
          <TabButton label="Lesson Presentation" Icon={LessonPresentationIcon} active={activeProduct === "Lesson Presentation"} onClick={() => setActiveProduct("Lesson Presentation")} />
          <TabButton label="Video Lesson Script" Icon={VideoScriptIcon} />
          <TabButton label="Quiz" Icon={QuizIcon} />
        </div>

        {/* Rest of original UI (filters, textarea, generate button, etc.) */}
        {/* TODO: copy remaining JSX from original file if desired */}
        <div className="border rounded p-6 bg-white text-sm text-gray-600">TODO: Remaining UI</div>
      </div>
    </main>
  );
}