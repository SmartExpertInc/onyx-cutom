"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle, ChevronDown, Settings, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";

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

// Progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(progress, 100)}%` }}
    ></div>
  </div>
);

// Theme SVGs placeholder (replace with actual SVGs or import as needed)
const ThemeSvgs = {
  wine: () => <div className="w-full h-full bg-[#f5e6e6] rounded" />, // Placeholder
  default: () => <div className="w-full h-full bg-gray-200 rounded" />,
};
const themeOptions = [
  { id: "wine", label: "Wine" },
  { id: "cherry", label: "Cherry" },
  { id: "lunaria", label: "Lunaria" },
  { id: "vanilla", label: "Vanilla" },
  { id: "terracotta", label: "Terracotta" },
  { id: "zephyr", label: "Zephyr" },
];

export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for dropdowns
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [modulesForOutline, setModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [lessonsForModule, setLessonsForModule] = useState<string[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(searchParams?.get("outlineId") ? Number(searchParams.get("outlineId")) : null);
  const [selectedLesson, setSelectedLesson] = useState<string>(searchParams?.get("lesson") || "");
  const [language, setLanguage] = useState<string>(searchParams?.get("lang") || "en");
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    searchParams?.get("outlineId") ? true : (searchParams?.get("prompt") ? false : null)
  );
  const [prompt, setPrompt] = useState(searchParams?.get("prompt") || "");

  // Original logic state
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProductId, setFinalProductId] = useState<number | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [textareaVisible, setTextareaVisible] = useState(false);
  const [firstLineRemoved, setFirstLineRemoved] = useState(false);

  // Get parameters from URL
  const questionTypes = searchParams?.get("questionTypes") || "";
  const questionCount = Number(searchParams?.get("questionCount") || 10);
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");
  const courseName = searchParams?.get("courseName");

  // File context for creation from documents
  const isFromFiles = searchParams?.get("fromFiles") === "true";
  
  // Text context for creation from user text
  const isFromText = searchParams?.get("fromText") === "true";
  const [userText, setUserText] = useState('');
  
  // Retrieve user text from sessionStorage
  useEffect(() => {
    if (isFromText) {
      try {
        const storedData = sessionStorage.getItem('pastedTextData');
        if (storedData) {
          const textData = JSON.parse(storedData);
          // Check if data is recent (within 1 hour) and matches the current mode
          if (textData.timestamp && (Date.now() - textData.timestamp < 3600000) && textData.mode === textMode) {
            setUserText(textData.text || '');
          }
        }
      } catch (error) {
        console.error('Error retrieving pasted text data:', error);
      }
    }
  }, [isFromText, textMode]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef(false);
  const requestIdRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const maxRetries = 3;
  const previewAbortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Advanced mode state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("wine");
  const [textDensity, setTextDensity] = useState("medium");
  const [imageSource, setImageSource] = useState("ai");
  const [aiModel, setAiModel] = useState("flux-fast");
  // Footer/finalize
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Example prompts for advanced mode
  const quizExamples = [
    {
      short: "Adapt to U.S. industry specifics",
      detailed:
        "Update the quiz structure based on U.S. industry and cultural specifics: adjust questions, replace topics, examples, and wording that don't align with the American context.",
    },
    {
      short: "Adopt trends and latest practices",
      detailed:
        "Update the quiz structure by adding questions that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content.",
    },
    {
      short: "Incorporate top industry examples",
      detailed:
        "Analyze the best quizzes on the market in this topic and restructure our questions accordingly: change or add content which others present more effectively. Focus on question clarity and difficulty progression.",
    },
    {
      short: "Simplify and restructure the content",
      detailed:
        "Rewrite the quiz structure to make it more logical and user-friendly. Remove redundant questions, merge overlapping content, and rephrase questions for clarity and simplicity.",
    },
    {
      short: "Increase value and depth of content",
      detailed:
        "Strengthen the quiz by adding questions that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being tested.",
    },
    {
      short: "Add case studies and applications",
      detailed:
        "Revise the quiz structure to include applied questions — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact.",
    },
  ];

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

  // Apply advanced edit
  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) return;
    setLoadingEdit(true);
    try {
      const payload: any = {
        content: quizData,
        editPrompt,
      };
      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setQuizData(data.content || "");
      setEditPrompt("");
      setSelectedExamples([]);
    } catch (error: any) {
      setError(error.message || "Failed to apply edit");
    } finally {
      setLoadingEdit(false);
    }
  };

  // Memoize arrays to prevent unnecessary re-renders
  const memoizedFolderIds = useMemo(() => folderIds, [folderIds.join(',')]);
  const memoizedFileIds = useMemo(() => fileIds, [fileIds.join(',')]);

  // Fetch outlines and lessons for dropdowns
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/outlines`);
        if (response.ok) {
          const data = await response.json();
          setOutlines(data);
        }
      } catch (error) {
        console.error("Failed to fetch outlines:", error);
      }
    };

    const fetchLessons = async () => {
      if (!selectedOutlineId) return;
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/outlines/${selectedOutlineId}/modules`);
        if (response.ok) {
          const data = await response.json();
          setModulesForOutline(data);
        }
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      }
    };

    fetchOutlines();
    if (selectedOutlineId) {
      fetchLessons();
    }
  }, [selectedOutlineId]);

  // Update lessons when module changes
  useEffect(() => {
    if (selectedModuleIndex !== null && modulesForOutline[selectedModuleIndex]) {
      setLessonsForModule(modulesForOutline[selectedModuleIndex].lessons);
    }
  }, [selectedModuleIndex, modulesForOutline]);

  // Streaming preview effect
  useEffect(() => {
    // Only trigger if we have a lesson or a prompt
    const hasValidInput = (selectedOutlineId && selectedLesson) || prompt.trim() || fromFiles || fromText;
    if (!hasValidInput) {
      return;
    }

    const startPreview = (attempt: number = 0) => {
      if (previewAbortRef.current) {
        previewAbortRef.current.abort();
      }
      previewAbortRef.current = new AbortController();

      const fetchPreview = async () => {
        try {
          setLoading(true);
          setError(null);
          setContent("");
          setStreamDone(false);
          setFirstLineRemoved(false);

          const params = new URLSearchParams();
          
          if (selectedOutlineId && selectedLesson) {
            params.set("outlineId", selectedOutlineId.toString());
            params.set("lesson", selectedLesson);
          } else if (prompt) {
            params.set("prompt", prompt);
          }
          
          params.set("questionTypes", questionTypes);
          params.set("lang", language);
          params.set("questionCount", questionCount.toString());

          // Add file context if coming from files
          if (fromFiles) {
            params.set("fromFiles", "true");
            if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
            if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
          }
          
          // Add text context if coming from text
          if (fromText) {
            params.set("fromText", "true");
            params.set("textMode", textMode || 'context');
            // userText stays in sessionStorage - don't pass via URL
          }

          const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              outlineId: selectedOutlineId,
              lesson: selectedLesson,
              courseName: courseName,
              prompt: prompt,
              language: language,
              questionTypes: questionTypes,
              fromFiles: fromFiles,
              folderIds: memoizedFolderIds.join(','),
              fileIds: memoizedFileIds.join(','),
              fromText: fromText,
              textMode: textMode,
              userText: fromText ? sessionStorage.getItem('userText') : undefined,
              questionCount: questionCount,
            }),
            signal: previewAbortRef.current?.signal,
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
          let gotFirstChunk = false;

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                try {
                  const pkt = JSON.parse(buffer.trim());
                  gotFirstChunk = true;
                  if (pkt.type === "delta") {
                    setContent(prev => prev + pkt.text);
                  }
                } catch (e) {
                  // If not JSON, treat as plain text
                  setContent(prev => prev + buffer);
                }
              }
              setStreamDone(true);
              setLoading(false);
              return;
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
                  setContent(prev => prev + pkt.text);
                } else if (pkt.type === "done") {
                  setStreamDone(true);
                  setLoading(false);
                  return;
                } else if (pkt.type === "error") {
                  throw new Error(pkt.text || "Unknown error");
                }
              } catch (e) {
                // If not JSON, treat as plain text
                setContent(prev => prev + line);
              }
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Preview cancelled');
            return;
          }
          
          // Check if this is a network error that should be retried
          const isNetworkError = error.message?.includes('network') || 
                                error.message?.includes('fetch') ||
                                error.message?.includes('Failed to fetch') ||
                                error.message?.includes('NetworkError') ||
                                !navigator.onLine;
          
          if (isNetworkError && attempt < maxRetries) {
            console.warn(`Preview attempt ${attempt + 1} failed:`, error.message);
            setRetryCount(attempt + 1);
            // Retry after a delay
            setTimeout(() => startPreview(attempt + 1), 2000 * (attempt + 1));
            return;
          }
          
          console.error('Preview error:', error);
          setError(error.message || 'An error occurred during preview generation');
          setLoading(false);
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
  }, [selectedOutlineId, selectedLesson, prompt, questionTypes, language, fromFiles, fromText, memoizedFolderIds, memoizedFileIds, textMode, questionCount, courseName, retryTrigger]);

  const handleFinalize = async () => {
    if (!content.trim()) return;

    setIsFinalizing(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: content,
          prompt: prompt,
          outlineId: selectedOutlineId,
          lesson: selectedLesson,
          courseName: courseName,
          questionTypes: questionTypes,
          language: language,
          fromFiles: fromFiles,
          fromText: fromText,
          folderIds: memoizedFolderIds.join(','),
          fileIds: memoizedFileIds.join(','),
          textMode: textMode,
          questionCount: questionCount,
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
      setIsFinalizing(false);
    }
  };

  const handleCancel = () => {
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }
  };

  // Calculate word count
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-4xl flex flex-col gap-4 text-gray-900">
        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-5xl font-semibold text-center tracking-wide text-gray-700 mt-8">
          Quiz Generation
        </h1>
        <p className="text-center text-gray-600 text-lg -mt-1">
          {selectedOutlineId && selectedLesson 
            ? `Creating quiz for lesson: ${selectedLesson}`
            : prompt 
            ? `Creating quiz: ${prompt}`
            : "Creating quiz from your content"
          }
        </p>

        {/* Dropdowns Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Outline Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outline
              </label>
              <select
                value={selectedOutlineId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedOutlineId(value ? Number(value) : null);
                  setSelectedModuleIndex(null);
                  setSelectedLesson("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an outline</option>
                {outlines.map((outline) => (
                  <option key={outline.id} value={outline.id}>
                    {outline.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module
              </label>
              <select
                value={selectedModuleIndex !== null ? selectedModuleIndex : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedModuleIndex(value ? Number(value) : null);
                  setSelectedLesson("");
                }}
                disabled={!selectedOutlineId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select a module</option>
                {modulesForOutline.map((module, index) => (
                  <option key={index} value={index}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lesson Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={selectedModuleIndex === null}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select a lesson</option>
                {lessonsForModule.map((lesson, index) => (
                  <option key={index} value={lesson}>
                    {lesson}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Prompt (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a custom prompt for quiz generation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Generation status */}
        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-800 font-semibold mb-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              Generating Quiz...
            </div>
            <div className="text-sm text-blue-700 mb-4">
              <p>Creating interactive quiz questions based on your content. This may take a few moments.</p>
              {retryCount > 0 && (
                <p className="text-orange-600 font-medium mt-2">
                  Retry attempt {retryCount} of {maxRetries}...
                </p>
              )}
            </div>
            <ProgressBar progress={content.length > 0 ? Math.min((content.length / 1000) * 100, 90) : 10} />
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 text-sm font-medium transition-colors"
            >
              Cancel Generation
            </button>
          </div>
        )}

        {/* Error display */}
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

        {/* Quiz data display */}
        {content && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Quiz Preview</h2>
              {streamDone && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Generation Complete</span>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-100">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {content}
              </pre>
            </div>

            {/* Advanced Mode Section */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                Advanced Mode
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Example Prompts
                      </label>
                      <div className="space-y-2">
                        {quizExamples.map((ex) => (
                          <button
                            key={ex.short}
                            onClick={() => toggleExample(ex)}
                            className={`block w-full text-left p-2 rounded text-xs ${
                              selectedExamples.includes(ex.short)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } border`}
                          >
                            {ex.short}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edit Prompt
                      </label>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Enter additional instructions..."
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <button
                        onClick={handleApplyEdit}
                        disabled={loadingEdit || !editPrompt.trim()}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loadingEdit ? 'Applying...' : 'Apply Edit'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Themes section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTheme === theme.id
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {content && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Credits: 1</span>
                <span>Words: {wordCount}</span>
              </div>
              
              {streamDone && !finalProductId && (
                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-white hover:bg-brand-primary-hover active:scale-95 transition-all duration-200 text-lg font-semibold shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0076FF' }}
                >
                  {isFinalizing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Create Final Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Finalization Loading Overlay */}
        {isFinalizing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Final Quiz</h3>
                <p className="text-gray-600 text-center">Please wait while we finalize your quiz...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 