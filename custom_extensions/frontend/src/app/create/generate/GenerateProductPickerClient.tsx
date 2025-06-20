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

// Product tab component with proper styling
interface ProductTabProps {
  label: string;
  Icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}

const ProductTab: React.FC<ProductTabProps> = ({ label, Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 min-w-[140px] h-[120px] ${
      active
        ? "bg-white shadow-lg border-2 border-blue-500 text-blue-600"
        : "bg-gray-50 hover:bg-white hover:shadow-md border-2 border-transparent text-gray-700"
    }`}
  >
    <Icon size={48} />
    <span className="text-sm font-medium mt-2 text-center leading-tight">{label}</span>
    {active && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
    )}
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
    <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </Link>
          <div className="text-sm text-gray-500">
            Choose a product type to get started
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white text-center">
            <h1 className="text-4xl font-bold mb-3">
              Create New Product
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Generate high-quality educational content using AI. Choose your product type and describe what you want to create.
            </p>
          </div>

          {/* Product Type Selection */}
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Product Type
              </h2>
              <p className="text-gray-600">
                Select the type of educational content you want to create
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
              <ProductTab
                label="Course Outline"
                Icon={CourseOutlineIcon}
                active={activeProduct === "Course Outline"}
                onClick={() => setActiveProduct("Course Outline")}
              />
              <ProductTab
                label="Lesson Presentation"
                Icon={LessonPresentationIcon}
                active={activeProduct === "Lesson Presentation"}
                onClick={() => setActiveProduct("Lesson Presentation")}
              />
              <ProductTab
                label="Quiz"
                Icon={QuizIcon}
                active={activeProduct === "Quiz"}
                onClick={() => setActiveProduct("Quiz")}
              />
              <ProductTab
                label="Video Lesson Script"
                Icon={VideoScriptIcon}
                active={activeProduct === "Video Lesson Script"}
                onClick={() => setActiveProduct("Video Lesson Script")}
              />
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto">
              {/* Lesson Presentation specific options */}
              {activeProduct === "Lesson Presentation" && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LessonPresentationIcon size={24} />
                    Lesson Presentation Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Training Plan
                      </label>
                      <select
                        value={selectedOutlineId}
                        onChange={(e) => {
                          setSelectedOutlineId(e.target.value);
                          setSelectedLesson(""); // Reset lesson when outline changes
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Lesson
                      </label>
                      <select
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        disabled={!selectedOutlineId}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:border-gray-200 transition-all duration-200"
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
              <div className="mb-8">
                <label className="block text-xl font-bold text-gray-900 mb-4">
                  Describe your {activeProduct.toLowerCase()}
                </label>
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe what you want to create in detail...`}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[140px] text-gray-800 placeholder-gray-400 transition-all duration-200"
                  rows={5}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Be as specific as possible for better results</span>
                  <span>{prompt.length} characters</span>
                </div>
              </div>

              {/* Examples */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    💡 Need inspiration? Try these examples:
                  </h3>
                  <button
                    onClick={shuffleExamples}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <Shuffle size={16} />
                    Shuffle
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-800 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="font-medium">{example}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Outline specific options */}
              {activeProduct === "Course Outline" && (
                <>
                  {/* Configuration Options */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CourseOutlineIcon size={24} />
                      Course Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Number of Modules
                        </label>
                        <select
                          value={modulesCount}
                          onChange={(e) => setModulesCount(Number(e.target.value))}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <option key={num} value={num}>
                              {num} modules
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Lessons per Module
                        </label>
                        <select
                          value={lessonsPerModule}
                          onChange={(e) => setLessonsPerModule(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          {["2-3", "3-4", "4-5", "5-6"].map((range) => (
                            <option key={range} value={range}>
                              {lengthRangeForOption(range)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="en">English</option>
                          <option value="ru">Russian</option>
                          <option value="uk">Ukrainian</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Dropdown */}
                  <div className="mb-8" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl text-left transition-all duration-200 border border-gray-200"
                    >
                      <span className="text-lg font-semibold text-gray-800">
                        ⚙️ Additional Information to Include
                      </span>
                      <ChevronDown
                        size={24}
                        className={`text-gray-600 transition-transform duration-200 ${
                          showFilters ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showFilters && (
                      <div className="mt-3 p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(filters).map(([key, value]) => (
                            <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {key === "knowledgeCheck" && "Knowledge Check Questions"}
                                {key === "contentAvailability" && "Content Availability Notes"}
                                {key === "informationSource" && "Information Source References"}
                                {key === "time" && "Time Duration Estimates"}
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
              <div className="text-center mt-10">
                <button
                  onClick={handleStart}
                  disabled={isStartButtonDisabled()}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  <Sparkles size={24} />
                  Start Creating
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  Your content will be generated using advanced AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}