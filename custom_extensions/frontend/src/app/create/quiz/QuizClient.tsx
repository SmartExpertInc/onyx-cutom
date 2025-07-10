"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle, ChevronDown, Settings, Plus } from "lucide-react";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Loading animation component
const LoadingAnimation: React.FC<{ message?: string }> = ({ message }) => (
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
      <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message || "Generating..."}</p>
    )}
  </div>
);

export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProductId, setFinalProductId] = useState<number | null>(null);

  // Get parameters from URL
  const prompt = searchParams?.get("prompt") || "";
  const outlineId = searchParams?.get("outlineId");
  const lesson = searchParams?.get("lesson");
  const courseName = searchParams?.get("courseName"); // Add course name parameter
  const questionTypes = searchParams?.get("questionTypes") || "";
  const questionCount = Number(searchParams?.get("questionCount") || 10);
  const language = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef(false);
  const requestIdRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const maxRetries = 3;

  // Memoize arrays to prevent unnecessary re-renders
  const memoizedFolderIds = useMemo(() => folderIds, [folderIds.join(',')]);
  const memoizedFileIds = useMemo(() => fileIds, [fileIds.join(',')]);

  // State for dropdowns (matching lesson presentation structure)
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [modulesForOutline, setModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [lessonsForModule, setLessonsForModule] = useState<string[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(outlineId ? Number(outlineId) : null);
  const [selectedLesson, setSelectedLesson] = useState<string>(lesson || "");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(
    questionTypes ? questionTypes.split(',').filter(Boolean) : ["multiple-choice", "multi-select", "matching", "sorting", "open-answer"]
  );
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(questionCount);
  const [showQuestionTypesDropdown, setShowQuestionTypesDropdown] = useState(false);
  
  // State for conditional dropdown logic
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    outlineId ? true : (prompt ? false : null)
  );
  
  // UI state
  const [selectedTheme, setSelectedTheme] = useState<string>("wine");
  const [streamDone, setStreamDone] = useState(false);
  const [textareaVisible, setTextareaVisible] = useState(false);
  const [firstLineRemoved, setFirstLineRemoved] = useState(false);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  // ---- Inline Advanced Mode ----
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const quizExamples: { short: string; detailed: string }[] = [
    {
      short: "Make questions more challenging",
      detailed: "Increase the difficulty level of the quiz questions by adding more complex scenarios, requiring deeper analysis, and including higher-order thinking skills.",
    },
    {
      short: "Add more practical examples",
      detailed: "Include more real-world examples and case studies in the questions to make them more applicable and engaging for learners.",
    },
    {
      short: "Improve question clarity",
      detailed: "Rewrite questions to be clearer and more concise, ensuring they are easy to understand and avoid ambiguity.",
    },
    {
      short: "Add variety to question types",
      detailed: "Incorporate different types of questions (multiple choice, true/false, short answer) to make the quiz more engaging and comprehensive.",
    },
    {
      short: "Focus on key learning objectives",
      detailed: "Restructure the quiz to better align with the main learning objectives and ensure questions test the most important concepts.",
    },
    {
      short: "Include feedback and explanations",
      detailed: "Add detailed explanations for correct and incorrect answers to help learners understand the reasoning behind each response.",
    },
  ];

  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);

  const toggleExample = (ex: typeof quizExamples[number]) => {
    setSelectedExamples((prev) => {
      if (prev.includes(ex.short)) {
        const updated = prev.filter((s) => s !== ex.short);
        setEditPrompt((p) => {
          return p
            .split("\n")
            .filter((line) => line.trim() !== ex.detailed)
            .join("\n")
            .replace(/^\n+|\n+$/g, "");
        });
        return updated;
      }
      setEditPrompt((p) => (p ? p + "\n" + ex.detailed : ex.detailed));
      return [...prev, ex.short];
    });
  };

  const themeOptions = [
    { id: "wine", label: "Wine" },
    { id: "cherry", label: "Default" },
    { id: "vanilla", label: "Engenuity" },
    { id: "terracotta", label: "Deloitte" },
    { id: "lunaria", label: "Lunaria" },
    { id: "zephyr", label: "Zephyr" },
  ];

  // Fetch all outlines when switching to existing outline mode
  useEffect(() => {
    if (useExistingOutline !== true) return;
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
  }, [useExistingOutline]);

  // Fetch lessons when a course outline is selected
  useEffect(() => {
    if (useExistingOutline !== true || selectedOutlineId == null) {
      setModulesForOutline([]);
      setSelectedModuleIndex(null);
      setLessonsForModule([]);
      setSelectedLesson("");
      return;
    };
    const fetchLessons = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const modules = sections.map((sec: any) => ({
          name: sec.title || "Unnamed module",
          lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
        }));
        setModulesForOutline(modules);

        // If a lesson was pre-selected via query params, attempt to locate its module
        if (selectedLesson) {
          const modIdx = modules.findIndex((m: { lessons: string[] }) => m.lessons.includes(selectedLesson));
          if (modIdx !== -1) {
            setSelectedModuleIndex(modIdx);
            setLessonsForModule(modules[modIdx].lessons);
          } else {
            // lesson not found in fetched data – clear it
            setSelectedModuleIndex(null);
            setLessonsForModule([]);
            setSelectedLesson("");
          }
        } else {
          // No lesson selected yet – clear downstream selections
          setSelectedModuleIndex(null);
          setLessonsForModule([]);
        }
      } catch (_) {}
    };
    fetchLessons();
  }, [selectedOutlineId, useExistingOutline, selectedLesson]);

  // Effect to trigger streaming preview generation
  useEffect(() => {
    // Start preview when one of the following is true:
    //   • a lesson was chosen from the outline (old behaviour)
    //   • no lesson chosen, but the user provided a free-form prompt (new behaviour)
    const promptQuery = searchParams?.get("prompt")?.trim() || "";
    if (!selectedLesson && !promptQuery) {
      // Nothing to preview yet – wait for user input
      return;
    }

    // Don't start generation if there's no valid input
    const hasValidInput = (selectedOutlineId && selectedLesson) || promptQuery || fromFiles || fromText;
    if (!hasValidInput) {
      return;
    }

    const startPreview = (attempt: number = 0) => {
      // Reset visibility states for a fresh preview run
      setTextareaVisible(false);
      setFirstLineRemoved(false);
      // Reset stream completion flag for new preview
      setStreamDone(false);
      const abortController = new AbortController();
      if (previewAbortRef.current) previewAbortRef.current.abort();
      previewAbortRef.current = abortController;

      const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        setQuizData(""); // Clear previous content
        let gotFirstChunk = false;

        try {
          const requestBody: any = {
            outlineId: selectedOutlineId,
            lesson: selectedLesson,
            courseName: courseName,
            prompt: promptQuery,
            language: selectedLanguage,
            questionTypes: selectedQuestionTypes.join(','),
            fromFiles: fromFiles,
            folderIds: memoizedFolderIds.join(','),
            fileIds: memoizedFileIds.join(','),
            fromText: fromText,
            textMode: textMode,
            userText: fromText ? sessionStorage.getItem('userText') : undefined,
            questionCount: selectedQuestionCount,
          };

          const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
          let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any remaining buffer
            if (buffer.trim()) {
              try {
                const pkt = JSON.parse(buffer.trim());
                if (pkt.type === "delta") {
                    accumulatedText += pkt.text;
                    setQuizData(accumulatedText);
                }
              } catch (e) {
                // If not JSON, treat as plain text
                  accumulatedText += buffer;
                  setQuizData(accumulatedText);
                }
              }
              setStreamDone(true);
              break;
          }

          buffer += decoder.decode(value, { stream: true });
          
          // Split by newlines and process complete chunks
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const pkt = JSON.parse(line);
              gotFirstChunk = true;
              
              if (pkt.type === "delta") {
                  accumulatedText += pkt.text;
                  setQuizData(accumulatedText);
              } else if (pkt.type === "done") {
                  setStreamDone(true);
                  break;
              } else if (pkt.type === "error") {
                throw new Error(pkt.text || "Unknown error");
              }
            } catch (e) {
              // If not JSON, treat as plain text
                accumulatedText += line;
                setQuizData(accumulatedText);
              }
            }

            // Determine if this buffer now contains some real (non-whitespace) text
            const hasMeaningfulText = /\S/.test(accumulatedText);

            if (hasMeaningfulText && !textareaVisible) {
              setTextareaVisible(true);
              setLoading(false); // Hide spinner & show textarea
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Generation cancelled');
          return;
        }
        
        // Check if this is a network error that should be retried
        const isNetworkError = error.message?.includes('network') || 
                              error.message?.includes('fetch') ||
                              error.message?.includes('Failed to fetch') ||
                              error.message?.includes('NetworkError') ||
                              !navigator.onLine;
        
        if (isNetworkError && attempt < maxRetries) {
          console.log(`Network error on attempt ${attempt}, retrying...`);
          setRetryCount(attempt);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return startPreview(attempt + 1);
          }
          
          throw error;
        } finally {
          if (!abortController.signal.aborted) {
            // If the stream ended but we never displayed content, remove spinner anyway
            if (loading) setLoading(false);
            if (!gotFirstChunk && attempt >= 3) {
              setError("Failed to generate quiz – please try again later.");
            }
          }
        }
      };

      fetchPreview();
    };

    startPreview();

    return () => {
      if (previewAbortRef.current) {
        previewAbortRef.current.abort();
      }
    };
  }, [prompt, selectedOutlineId, selectedLesson, selectedQuestionTypes, selectedLanguage, fromFiles, fromText, memoizedFolderIds, memoizedFileIds, textMode, selectedQuestionCount, courseName, retryTrigger]);

  // Auto-scroll textarea as new content streams in
  useEffect(() => {
    if (textareaVisible && textareaRef.current) {
      // Scroll to bottom to keep newest text in view
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [quizData, textareaVisible]);

  // Once streaming is done, strip the first line that contains metadata (project, product type, etc.)
  useEffect(() => {
    if (streamDone && !firstLineRemoved) {
      const parts = quizData.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setQuizData(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, quizData]);

  // Click outside handler for question types dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuestionTypesDropdown) {
        const target = event.target as Element;
        if (!target.closest('.question-types-dropdown')) {
          setShowQuestionTypesDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuestionTypesDropdown]);

  const handleCreateFinal = async () => {
    if (!quizData.trim()) return;

    setIsCreatingFinal(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: quizData,
          prompt: prompt,
          outlineId: selectedOutlineId,
          lesson: selectedLesson,
          courseName: courseName,
          questionTypes: selectedQuestionTypes.join(','),
          language: selectedLanguage,
          fromFiles: fromFiles,
          fromText: fromText,
          folderIds: memoizedFolderIds.join(','),
          fileIds: memoizedFileIds.join(','),
          textMode: textMode,
          questionCount: selectedQuestionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFinalProductId(result.id);
      
      // Redirect to the created quiz
      router.push(`/projects/view/${result.id}`);
    } catch (error: any) {
      console.error('Finalization error:', error);
      setError(error.message || 'An error occurred during finalization');
    } finally {
      setIsCreatingFinal(false);
    }
  };

  const handleCancel = () => {
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }
  };

  const handleApplyQuizEdit = async () => {
    if (!editPrompt.trim() || loadingEdit) return;

    setLoadingEdit(true);
    setError(null);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentContent: quizData,
          editPrompt: editPrompt,
          outlineId: selectedOutlineId,
          lesson: selectedLesson,
          courseName: courseName,
          questionTypes: selectedQuestionTypes.join(','),
          language: selectedLanguage,
          fromFiles: fromFiles,
          fromText: fromText,
          folderIds: memoizedFolderIds.join(','),
          fileIds: memoizedFileIds.join(','),
          textMode: textMode,
          questionCount: selectedQuestionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const pkt = JSON.parse(buffer.trim());
              if (pkt.type === "delta") {
                accumulatedText += pkt.text;
                setQuizData(accumulatedText);
              }
            } catch (e) {
              // If not JSON, treat as plain text
              accumulatedText += buffer;
              setQuizData(accumulatedText);
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines and process complete chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const pkt = JSON.parse(line);
            if (pkt.type === "delta") {
              accumulatedText += pkt.text;
              setQuizData(accumulatedText);
            } else if (pkt.type === "done") {
              break;
            } else if (pkt.type === "error") {
              throw new Error(pkt.text || "Unknown error");
            }
          } catch (e) {
            // If not JSON, treat as plain text
            accumulatedText += line;
            setQuizData(accumulatedText);
          }
        }
      }

      setEditPrompt("");
      setSelectedExamples([]);
    } catch (error: any) {
      console.error('Edit error:', error);
      setError(error.message || 'An error occurred during editing');
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <>
    <main
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        <Link
          href="/create/generate"
          className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-2xl font-semibold text-center text-black mt-2">Generate</h1>

        {/* Step-by-step process */}
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Step 1: Choose source */}
          {useExistingOutline === null && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-medium text-gray-700">Do you want to create a quiz from an existing Course Outline?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUseExistingOutline(true)}
                  className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                >
                  Yes, quiz for the lesson from the outline
                </button>
                <button
                  onClick={() => setUseExistingOutline(false)}
                  className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  No, I want standalone quiz
                </button>
              </div>
            </div>
          )}

          {/* Step 2+: Show dropdowns based on choice */}
          {useExistingOutline !== null && (
            <div className="flex flex-wrap justify-center gap-2">
              {/* Show outline flow if user chose existing outline */}
              {useExistingOutline === true && (
                <>
                  {/* Outline dropdown */}
                  <div className="relative">
                    <select
                      value={selectedOutlineId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedOutlineId(val ? Number(val) : null);
                        // clear module & lesson selections when outline changes
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
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

                  {/* Module dropdown – appears once outline is selected */}
                  {selectedOutlineId && (
                    <div className="relative">
                      <select
                        value={selectedModuleIndex ?? ""}
                        onChange={(e) => {
                          const idx = e.target.value ? Number(e.target.value) : null;
                          setSelectedModuleIndex(idx);
                          setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                          setSelectedLesson("");
                        }}
                        disabled={modulesForOutline.length === 0}
                        className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                      >
                        <option value="">Select Module</option>
                        {modulesForOutline.map((m, idx) => (
                          <option key={idx} value={idx}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  )}

                  {/* Lesson dropdown – appears when module chosen */}
                  {selectedModuleIndex !== null && (
                    <div className="relative">
                      <select
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                      >
                        <option value="">Select Lesson</option>
                        {lessonsForModule.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    </div>
                  )}

                  {/* Show final dropdowns when lesson is selected */}
                  {selectedLesson && (
                    <>
                      <div className="relative">
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                        >
                          <option value="en">English</option>
                          <option value="uk">Ukrainian</option>
                          <option value="es">Spanish</option>
                          <option value="ru">Russian</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowQuestionTypesDropdown(!showQuestionTypesDropdown)}
                          className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                        >
                          <span>
                            {selectedQuestionTypes.length === 0
                              ? "Select Question Types"
                              : selectedQuestionTypes.length === 1
                              ? selectedQuestionTypes[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                              : `${selectedQuestionTypes.length} types selected`}
                          </span>
                          <ChevronDown size={14} className={`transition-transform ${showQuestionTypesDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showQuestionTypesDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2 question-types-dropdown">
                            {[
                              { value: "multiple-choice", label: "Multiple Choice" },
                              { value: "multi-select", label: "Multi-Select" },
                              { value: "matching", label: "Matching" },
                              { value: "sorting", label: "Sorting" },
                              { value: "open-answer", label: "Open Answer" }
                            ].map((type) => (
                              <label key={type.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedQuestionTypes.includes(type.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedQuestionTypes(prev => [...prev, type.value]);
                                    } else {
                                      setSelectedQuestionTypes(prev => prev.filter(t => t !== type.value));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{type.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          value={selectedQuestionCount}
                          onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
                          className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                            <option key={n} value={n}>{n} questions</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Show standalone quiz dropdowns if user chose standalone */}
              {useExistingOutline === false && (
                <>
                  <div className="relative">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      <option value="en">English</option>
                      <option value="uk">Ukrainian</option>
                      <option value="es">Spanish</option>
                      <option value="ru">Russian</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowQuestionTypesDropdown(!showQuestionTypesDropdown)}
                      className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      <span>
                        {selectedQuestionTypes.length === 0
                          ? "Select Question Types"
                          : selectedQuestionTypes.length === 1
                          ? selectedQuestionTypes[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : `${selectedQuestionTypes.length} types selected`}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${showQuestionTypesDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showQuestionTypesDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2 question-types-dropdown">
                        {[
                          { value: "multiple-choice", label: "Multiple Choice" },
                          { value: "multi-select", label: "Multi-Select" },
                          { value: "matching", label: "Matching" },
                          { value: "sorting", label: "Sorting" },
                          { value: "open-answer", label: "Open Answer" }
                        ].map((type) => (
                          <label key={type.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedQuestionTypes.includes(type.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQuestionTypes(prev => [...prev, type.value]);
                                } else {
                                  setSelectedQuestionTypes(prev => prev.filter(t => t !== type.value));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedQuestionCount}
                      onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
                      className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                        <option key={n} value={n}>{n} questions</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>
                </>
              )}

              {/* Reset button */}
            <button
                onClick={() => {
                  setUseExistingOutline(null);
                  setSelectedOutlineId(null);
                  setSelectedModuleIndex(null);
                  setLessonsForModule([]);
                  setSelectedLesson("");
                }}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-gray-600 hover:bg-gray-100"
              >
                ← Back
            </button>
          </div>
          )}
        </div>

        {/* Prompt input for standalone quizzes */}
        {useExistingOutline === false && (
          <textarea
            value={searchParams?.get("prompt") || ""}
            onChange={(e) => {
              const sp = new URLSearchParams(searchParams?.toString() || "");
              sp.set("prompt", e.target.value);
              router.replace(`?${sp.toString()}`, { scroll: false });
            }}
            placeholder="Describe what you'd like to make"
            rows={1}
            className="w-full border border-gray-300 rounded-md p-3 resize-none overflow-hidden bg-white/90 placeholder-gray-500 min-h-[56px]"
          />
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#20355D]">Quiz Content</h2>
          {loading && (
            <LoadingAnimation message="Generating Quiz..." />
          )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-red-800 font-semibold mb-3">
              <XCircle className="h-5 w-5" />
              Error
            </div>
            <div className="text-sm text-red-700 mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
                setRetryTrigger(prev => prev + 1);
              }}
              className="px-4 py-2 rounded-full border border-red-300 bg-white text-red-700 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              Retry Generation
            </button>
          </div>
        )}

          {/* Main content display - Textarea instead of module list */}
          {textareaVisible && (
            <div
              className="bg-white rounded-xl p-6 flex flex-col gap-6 relative"
              style={{ animation: 'fadeInDown 0.25s ease-out both' }}
            >
              {loadingEdit && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <LoadingAnimation message="Applying edit..." />
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={quizData}
                onChange={(e) => setQuizData(e.target.value)}
                placeholder="Quiz content will appear here..."
                className="w-full border border-gray-200 rounded-md p-4 resize-y bg-white/90 min-h-[70vh]"
                disabled={loadingEdit}
              />
            </div>
          )}
        </section>

        {/* Inline Advanced section & button */}
        {streamDone && quizData && (
          <>
            {showAdvanced && (
              <div className="w-full bg-white border border-gray-300 rounded-xl p-4 flex flex-col gap-3 mb-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe what you'd like to improve..."
                  className="w-full border border-gray-300 rounded-md p-3 resize-none min-h-[80px] text-black"
                />

                {/* Example prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  {quizExamples.map((ex) => (
                    <button
                      key={ex.short}
                      type="button"
                      onClick={() => toggleExample(ex)}
                      className={`relative text-left border border-gray-200 rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-colors ${
                        selectedExamples.includes(ex.short) ? 'bg-white shadow' : 'bg-[#D9ECFF] hover:bg-white'
                      }`}
                    >
                      {ex.short}
                      <Plus size={14} className="absolute right-2 top-2 text-gray-600 opacity-60" />
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={loadingEdit || !editPrompt.trim()}
                    onClick={handleApplyQuizEdit}
                    className="px-6 py-2 rounded-full bg-[#0540AB] text-white text-sm font-medium hover:bg-[#043a99] disabled:opacity-50 flex items-center gap-1"
                  >
                    {loadingEdit ? <LoadingAnimation message="Applying..." /> : (<>Edit <Sparkles size={14} /></>)}
                  </button>
                </div>
              </div>
            )}
            <div className="w-full flex justify-center mt-2 mb-6">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-1 text-sm text-[#396EDF] hover:opacity-80 transition-opacity select-none"
              >
                Advanced Mode
                <Settings size={14} className={`${showAdvanced ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          </>
        )}

        {streamDone && quizData && (
          <section className="bg-white rounded-xl p-6 flex flex-col gap-5 shadow-sm" style={{ animation: 'fadeInDown 0.35s ease-out both' }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-[#20355D]">Themes</h2>
                <p className="mt-1 text-[#858587] font-medium text-sm">Use one of our popular themes below or browse others</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-[#0540AB]"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                <span>View more</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Themes grid */}
              <div className="grid grid-cols-3 gap-5 justify-items-center">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex flex-col rounded-lg overflow-hidden border border-transparent shadow-sm transition-all p-2 gap-2 ${selectedTheme === t.id ? 'bg-[#cee2fd]' : ''}`}
                  >
                    <div className="w-[214px] h-[116px] flex items-center justify-center">
                      {(() => {
                        const Svg = ThemeSvgs[t.id as keyof typeof ThemeSvgs] || ThemeSvgs.default;
                        return <Svg />;
                      })()}
                    </div>
                    <div className="flex items-center gap-1 px-2">
                      <span className={`w-4 text-[#0540AB] ${selectedTheme === t.id ? '' : 'opacity-0'}`}>✔</span>
                      <span className="text-sm text-[#20355D] font-medium select-none">{t.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {streamDone && quizData && (
          <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
              {/* Credits can be a placeholder or dynamic */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>10 credits</span>
            </div>
            <div className="flex items-center gap-[7.5rem]">
              <span className="text-lg text-gray-700 font-medium select-none">
                {/* This can be word count or removed */}
                {quizData.split(/\s+/).length} words
              </span>
                <button
                type="button"
                  onClick={handleCreateFinal}
                  disabled={isCreatingFinal}
                className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingFinal ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                    <Sparkles size={18} />
                    <span className="select-none font-semibold">Generate</span>
                    </>
                  )}
                </button>
              </div>
            <button type="button" disabled className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center opacity-60 cursor-not-allowed select-none font-bold" aria-label="Help (coming soon)">?</button>
          </div>
        )}
      </div>
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      button, select, input[type="checkbox"], label[role="button"], label[for] { cursor: pointer; }
    `}</style>
    {isCreatingFinal && (
      <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
        <LoadingAnimation message="Finalizing quiz..." />
      </div>
    )}
    </>
  );
} 