"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shuffle, Sparkles, Plus, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Placeholder SVG icon components
const CourseOutlineIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size * 0.97} viewBox="0 0 413 401" xmlns="http://www.w3.org/2000/svg">
    {/* SVG paths will be inserted here */}
    <rect width="100%" height="100%" fill="#FEE3B5" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fill="#333">Course</text>
  </svg>
);

const LessonPresentationIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size * 0.97} viewBox="0 0 413 401" xmlns="http://www.w3.org/2000/svg">
    {/* SVG paths will be inserted here */}
    <rect width="100%" height="100%" fill="#FED6E7" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fill="#333">Lesson</text>
  </svg>
);

const QuizIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size * 0.97} viewBox="0 0 413 401" xmlns="http://www.w3.org/2000/svg">
    {/* SVG paths will be inserted here */}
    <rect width="100%" height="100%" fill="#FEEDA9" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fill="#333">Quiz</text>
  </svg>
);

const VideoScriptIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 382 379" xmlns="http://www.w3.org/2000/svg">
    {/* SVG paths will be inserted here */}
    <rect width="100%" height="100%" fill="#E2F3FE" />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fill="#333">Video</text>
  </svg>
);

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
  const searchParams = useSearchParams();

  // For prompt input and filters we keep in state and navigate later
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [modulesCount, setModulesCount] = useState(4);
  const [lessonsPerModule, setLessonsPerModule] = useState("3-4");
  const [language, setLanguage] = useState(searchParams.get("lang") || "en");

  // Dropdown with additional boolean filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    time: true,
  });

  // Ref for detecting clicks outside of the Additional Info dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when a user clicks outside of it
  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
  const getRandomExamples = () => {
    const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };
  const [examples, setExamples] = useState<string[]>(getRandomExamples());

  const shuffleExamples = () => setExamples(getRandomExamples());

  const CUSTOM_BACKEND_URL =
    process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

  const handleCourseOutlineStart = async () => {
    if (!prompt.trim()) return;

    let chatId: string | undefined;
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/course-outline/init-chat`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        chatId = data.chatSessionId;
      }
    } catch (_) {
      /* ignore warm-up failure – preview will fallback to creating chat */
    }

    const params = new URLSearchParams({
      prompt,
      modules: String(modulesCount),
      lessons: lessonsPerModule,
      lang: language,
      knowledgeCheck: filters.knowledgeCheck ? '1' : '0',
      contentAvailability: filters.contentAvailability ? '1' : '0',
      informationSource: filters.informationSource ? '1' : '0',
      time: filters.time ? '1' : '0',
    });
    if (chatId) params.set("chatId", chatId);

    router.push(`/create/course-outline?${params.toString()}`);
  };

  const router = useRouter();

  // Ref for auto-resizing the prompt textarea
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = promptRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  // Read query params and set initial state for pre-selection
  const [activeProduct, setActiveProduct] = useState<"Course Outline" | "Lesson Presentation" | "Quiz" | "Video Lesson Script">(
    searchParams.get("product") === "lessonPresentation" ? "Lesson Presentation" : "Course Outline"
  );

  // For Lesson Presentation: fetch outlines and lessons
  const [outlines, setOutlines] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string>(searchParams.get("outlineId") || "");
  const [lessons, setLessons] = useState<Array<{ title: string }>>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>(searchParams.get("lesson") || "");

  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const response = await fetch('/api/custom-projects-backend/projects');
        if (response.ok) {
          const data = await response.json();
          const trainingPlans = data.filter((project: any) => 
            project.design_component_name === 'TrainingPlanTable'
          );
          setOutlines(trainingPlans.map((tp: any) => ({ 
            id: tp.project_id, 
            name: tp.project_name 
          })));
        }
      } catch (error) {
        console.error('Failed to fetch outlines:', error);
      }
    };

    const fetchLessons = async () => {
      if (!selectedOutlineId) return;
      try {
        const response = await fetch(`/api/custom-projects-backend/projects/view/${selectedOutlineId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.microproduct_content?.sections) {
            const allLessons = data.microproduct_content.sections.flatMap((section: any) => 
              section.lessons?.map((lesson: any) => ({ title: lesson.title })) || []
            );
            setLessons(allLessons);
          }
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      }
    };

    if (activeProduct === "Lesson Presentation") {
      fetchOutlines();
      if (selectedOutlineId) {
        fetchLessons();
      }
    }
  }, [activeProduct, selectedOutlineId]);

  const lengthRangeForOption = (opt: string) => {
    switch (opt) {
      case "2-3": return "2-3 lessons per module";
      case "3-4": return "3-4 lessons per module";
      case "4-5": return "4-5 lessons per module";
      case "5-6": return "5-6 lessons per module";
      default: return opt;
    }
  };

  const handleLessonPresentationStart = () => {
    if (!prompt.trim()) return;
    
    const params = new URLSearchParams({
      prompt,
      lang: language,
    });
    
    if (selectedOutlineId) {
      params.set("outlineId", selectedOutlineId);
    }
    if (selectedLesson) {
      params.set("lesson", selectedLesson);
    }

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  const isStartButtonDisabled = () => {
    if (!prompt.trim()) return true;
    if (activeProduct === "Lesson Presentation") {
      return !selectedOutlineId || !selectedLesson;
    }
    return false;
  };

  const handleStart = () => {
    if (activeProduct === "Course Outline") {
      handleCourseOutlineStart();
    } else if (activeProduct === "Lesson Presentation") {
      handleLessonPresentationStart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Product
            </h1>
            <p className="text-gray-600">
              Choose a product type and describe what you want to create
            </p>
          </div>

          {/* Product Type Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Product Type
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <TabButton
                label="Course Outline"
                Icon={CourseOutlineIcon}
                active={activeProduct === "Course Outline"}
                onClick={() => setActiveProduct("Course Outline")}
              />
              <TabButton
                label="Lesson Presentation"
                Icon={LessonPresentationIcon}
                active={activeProduct === "Lesson Presentation"}
                onClick={() => setActiveProduct("Lesson Presentation")}
              />
              <TabButton
                label="Quiz"
                Icon={QuizIcon}
                active={activeProduct === "Quiz"}
                onClick={() => setActiveProduct("Quiz")}
              />
              <TabButton
                label="Video Lesson Script"
                Icon={VideoScriptIcon}
                active={activeProduct === "Video Lesson Script"}
                onClick={() => setActiveProduct("Video Lesson Script")}
              />
            </div>
          </div>

          {/* Lesson Presentation specific options */}
          {activeProduct === "Lesson Presentation" && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Lesson Presentation Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Training Plan
                  </label>
                  <select
                    value={selectedOutlineId}
                    onChange={(e) => {
                      setSelectedOutlineId(e.target.value);
                      setSelectedLesson(""); // Reset lesson when outline changes
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a training plan...</option>
                    {outlines.map((outline) => (
                      <option key={outline.id} value={outline.id}>
                        {outline.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lesson
                  </label>
                  <select
                    value={selectedLesson}
                    onChange={(e) => setSelectedLesson(e.target.value)}
                    disabled={!selectedOutlineId}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Choose a lesson...</option>
                    {lessons.map((lesson, index) => (
                      <option key={index} value={lesson.title}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Describe your {activeProduct.toLowerCase()}
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want to create...`}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[120px]"
              rows={4}
            />
          </div>

          {/* Examples */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Need inspiration? Try these examples:
              </h3>
              <button
                onClick={shuffleExamples}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
              >
                <Shuffle size={16} />
                Shuffle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Course Outline specific options */}
          {activeProduct === "Course Outline" && (
            <>
              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Modules
                  </label>
                  <select
                    value={modulesCount}
                    onChange={(e) => setModulesCount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} modules
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lessons per Module
                  </label>
                  <select
                    value={lessonsPerModule}
                    onChange={(e) => setLessonsPerModule(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {["2-3", "3-4", "4-5", "5-6"].map((range) => (
                      <option key={range} value={range}>
                        {lengthRangeForOption(range)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="ru">Russian</option>
                    <option value="uk">Ukrainian</option>
                  </select>
                </div>
              </div>

              {/* Additional Information Dropdown */}
              <div className="mb-6" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Additional Information to Include
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showFilters && (
                  <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(filters).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {key === "knowledgeCheck" && "Knowledge Check"}
                            {key === "contentAvailability" && "Content Availability"}
                            {key === "informationSource" && "Information Source"}
                            {key === "time" && "Time Estimates"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStart}
              disabled={isStartButtonDisabled()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles size={20} />
              Start Creating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}