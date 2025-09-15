"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle, ChevronDown, Settings, Plus, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Loading animation component
const LoadingAnimation: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useLanguage();
  return (
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
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message || t('interface.generate.loading', 'Generating...')}</p>
      )}
    </div>
  );
};

export default function QuizClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProductId, setFinalProductId] = useState<number | null>(null);

  // Get parameters from URL
  const [currentPrompt, setCurrentPrompt] = useState(getPromptFromUrlOrStorage(searchParams?.get("prompt") || ""));
  const outlineId = searchParams?.get("outlineId");
  const lesson = searchParams?.get("lesson");
  const courseName = searchParams?.get("courseName"); // Add course name parameter
  const questionTypes = searchParams?.get("questionTypes") || "";
  const questionCount = Number(searchParams?.get("questionCount") || 10);
  const language = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const fromKnowledgeBase = searchParams?.get("fromKnowledgeBase") === "true";
  const fromConnectors = searchParams?.get("fromConnectors") === "true";
  const connectorIds = searchParams?.get("connectorIds")?.split(",").filter(Boolean) || [];
  const connectorSources = searchParams?.get("connectorSources")?.split(",").filter(Boolean) || [];
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");

  // Check for folder context from sessionStorage (when coming from inside a folder)
  const [folderContext, setFolderContext] = useState<{ folderId: string } | null>(null);
  useEffect(() => {
    try {
      const storedFolderContext = sessionStorage.getItem('folderContext');
      if (storedFolderContext) {
        const context = JSON.parse(storedFolderContext);
        // Check if data is recent (within 1 hour)
        if (context.timestamp && (Date.now() - context.timestamp < 3600000)) {
          setFolderContext(context);
        } else {
          // Clean up expired data
          sessionStorage.removeItem('folderContext');
        }
      }
    } catch (error) {
      console.error('Error retrieving folder context:', error);
    }
  }, []);

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
    outlineId ? true : (currentPrompt ? false : null)
  );

  // UI state
  const [selectedTheme, setSelectedTheme] = useState<string>("wine");
  const [streamDone, setStreamDone] = useState(false);
  const [textareaVisible, setTextareaVisible] = useState(false);
  const [firstLineRemoved, setFirstLineRemoved] = useState(false);

  // State for editing quiz question titles
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editedTitles, setEditedTitles] = useState<{ [key: number]: string }>({});
  const [editedTitleIds, setEditedTitleIds] = useState<Set<number>>(new Set());
  const [originalTitles, setOriginalTitles] = useState<{ [key: number]: string }>({});

  // NEW: Track user edits like in Course Outline
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [originalQuizData, setOriginalQuizData] = useState<string>("");

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const nextEditingIdRef = useRef<number | null>(null);

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

  // Parse quiz content into questions/sections
  const parseQuizIntoQuestions = (content: string) => {
    if (!content.trim()) return [];

    const questions: Array<{ title: string; content: string }> = [];

    // Check if content contains quiz questions (numbered questions pattern)
    const quizQuestions = content.match(/^\s*\d+\.\s*\*\*(.*?)\*\*/gm);

    if (quizQuestions && quizQuestions.length > 0) {
      // Parse quiz format
      const questionSections = content.split(/(?=^\s*\d+\.\s*\*\*)/m).filter(section => section.trim());

      questionSections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        if (lines.length === 0) return;

        // Extract question title
        const questionMatch = lines[0].match(/^\s*\d+\.\s*\*\*(.*?)\*\*/);
        if (!questionMatch) return;

        const questionTitle = questionMatch[1].trim();

        // Extract options and explanation
        let options = [];
        let correctAnswer = '';
        let explanation = '';

        // Common translations of "Explanation" in different languages
        const explanationPatterns = [
          /\*\*Explanation:\*\*/i,     // English
          /\*\*Explicación:\*\*/i,    // Spanish
          /\*\*Explication:\*\*/i,    // French
          /\*\*Erklärung:\*\*/i,      // German
          /\*\*Spiegazione:\*\*/i,    // Italian
          /\*\*Explicação:\*\*/i,     // Portuguese
          /\*\*Objaśnienie:\*\*/i,    // Polish
          /\*\*Объяснение:\*\*/i,     // Russian
          /\*\*Пояснення:\*\*/i,      // Ukrainian
          /\*\*説明:\*\*/i,            // Japanese
          /\*\*解释:\*\*/i,            // Chinese Simplified
          /\*\*解釋:\*\*/i,            // Chinese Traditional
          /\*\*설명:\*\*/i,            // Korean
          /\*\*توضیح:\*\*/i,          // Persian
          /\*\*شرح:\*\*/i,            // Arabic
          /\*\*הסבר:\*\*/i,           // Hebrew
          /\*\*Açıklama:\*\*/i,       // Turkish
          /\*\*Förklaring:\*\*/i,     // Swedish
          /\*\*Forklaring:\*\*/i,     // Norwegian/Danish
          /\*\*Uitleg:\*\*/i,         // Dutch
          /\*\*Vysvětlení:\*\*/i,     // Czech
          /\*\*Magyarázat:\*\*/i,     // Hungarian
          /\*\*Selitys:\*\*/i,        // Finnish
          /\*\*Forklaring:\*\*/i,     // Afrikaans
          /\*\*వివరణ:\*\*/i,         // Telugu
          /\*\*स्पष्टीकरण:\*\*/i,    // Hindi
          /\*\*ব্যাখ্যা:\*\*/i,       // Bengali
          /\*\*விளக்கம்:\*\*/i,      // Tamil
        ];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^\s*-\s*[A-D]\)/)) {
            // Option line
            options.push(line.replace(/^\s*-\s*/, '').trim());
          } else if (line.includes('**Correct Answer:**')) {
            correctAnswer = line.replace(/\*\*Correct Answer:\*\*\s*/, '').trim();
          } else {
            // Check for explanation patterns in any language
            let isExplanationLine = false;
            for (const pattern of explanationPatterns) {
              if (pattern.test(line)) {
                explanation = line.replace(pattern, '').trim();
                isExplanationLine = true;
                break;
              }
            }
          }
        }

        questions.push({
          title: questionTitle,
          // content: `Options:\n${options.join('\n')}\n\nCorrect Answer: ${correctAnswer}\n\nExplanation: ${explanation}`
          content: `Explanation: ${explanation}`

        });
      });

      return questions;
    }

    return [];
  };

  const questionList = parseQuizIntoQuestions(quizData);

  // Handle question title editing
  const handleTitleEdit = (questionIndex: number, newTitle: string) => {
    setEditedTitles(prev => ({
      ...prev,
      [questionIndex]: newTitle
    }));

    // Store original title if not already stored
    if (!originalTitles[questionIndex] && questionIndex < questionList.length) {
      setOriginalTitles(prev => ({
        ...prev,
        [questionIndex]: questionList[questionIndex].title
      }));
    }

    // Add to edited titles list if title is different from original
    const originalTitle = originalTitles[questionIndex] || (questionIndex < questionList.length ? questionList[questionIndex].title : '');
    console.log(`Title edit - Index: ${questionIndex}, Original: "${originalTitle}", New: "${newTitle}", Different: ${newTitle !== originalTitle}`);
    if (newTitle !== originalTitle) {
      setEditedTitleIds(prev => {
        const newSet = new Set([...prev, questionIndex]);
        console.log(`Added to edited list: ${questionIndex}, Current list:`, Array.from(newSet));
        return newSet;
      });

      // NEW: Mark that user has made edits
      setHasUserEdits(true);
    } else {
      setEditedTitleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        console.log(`Removed from edited list: ${questionIndex}, Current list:`, Array.from(newSet));
        return newSet;
      });
    }
  };

  const handleTitleSave = (questionIndex: number, finalTitle?: string) => {
    setEditingQuestionId(null);
    // Keep the item in edited titles list to maintain permanent blur
    // Only remove if the title is back to original
    const newTitle = (finalTitle ?? editedTitles[questionIndex]);
    if (!newTitle) {
      return;
    }
    const originalTitle = originalTitles[questionIndex] || questionList[questionIndex].title;
    if (newTitle === originalTitle) {
      setEditedTitleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
    }
    // Update the original content with new title
    updateContentWithNewTitle(questionIndex, newTitle);
  };

  const updateContentWithNewTitle = (questionIndex: number, newTitle: string) => {
    if (!newTitle) return;

    const questions = parseQuizIntoQuestions(quizData);
    if (questionIndex >= questions.length) return;

    const oldTitle = questions[questionIndex].title;

    // Find and replace the old title with new title in content
    const patterns = [
      new RegExp(`^(\\s*${questionIndex + 1}\\.\\s*\\*\\*)${escapeRegExp(oldTitle)}(\\*\\*)`, 'gm'),
    ];

    let updatedContent = quizData;
    for (const pattern of patterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, (match, prefix, suffix) => {
          return prefix + newTitle + suffix;
        });
        break;
      }
    }

    setQuizData(updatedContent);

    // NEW: Mark that user has made edits if content changed
    if (updatedContent !== quizData) {
      setHasUserEdits(true);
    }

    // Clear the edited title since it's now part of the main content
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[questionIndex];
      return newTitles;
    });

    // Update the questionList to reflect the new title
    // This ensures the original title comparison works correctly
    const updatedQuestions = parseQuizIntoQuestions(updatedContent);
    if (questionIndex < updatedQuestions.length) {
      // Force a re-render by updating the questionList
      // The questionList will be recalculated on next render
    }
  };

  // Helper function to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // NEW: Function to create clean questions without options and answers
  const createCleanQuestionsContent = (content: string) => {
    if (!content.trim()) return "";

    const questions: string[] = [];
    const lines = content.split('\n');
    let currentQuestion = "";
    let inQuestion = false;

    // Common translations of "Explanation" in different languages (same as in parseQuizIntoQuestions)
    const explanationPatterns = [
      /\*\*Explanation:\*\*/i,     // English
      /\*\*Explicación:\*\*/i,    // Spanish
      /\*\*Explication:\*\*/i,    // French
      /\*\*Erklärung:\*\*/i,      // German
      /\*\*Spiegazione:\*\*/i,    // Italian
      /\*\*Explicação:\*\*/i,     // Portuguese
      /\*\*Objaśnienie:\*\*/i,    // Polish
      /\*\*Объяснение:\*\*/i,     // Russian
      /\*\*Пояснення:\*\*/i,      // Ukrainian
      /\*\*説明:\*\*/i,            // Japanese
      /\*\*解释:\*\*/i,            // Chinese Simplified
      /\*\*解釋:\*\*/i,            // Chinese Traditional
      /\*\*설명:\*\*/i,            // Korean
      /\*\*توضیح:\*\*/i,          // Persian
      /\*\*شرح:\*\*/i,            // Arabic
      /\*\*הסבר:\*\*/i,           // Hebrew
      /\*\*Açıklama:\*\*/i,       // Turkish
      /\*\*Förklaring:\*\*/i,     // Swedish
      /\*\*Forklaring:\*\*/i,     // Norwegian/Danish
      /\*\*Uitleg:\*\*/i,         // Dutch
      /\*\*Vysvětlení:\*\*/i,     // Czech
      /\*\*Magyarázat:\*\*/i,     // Hungarian
      /\*\*Selitys:\*\*/i,        // Finnish
      /\*\*Forklaring:\*\*/i,     // Afrikaans
      /\*\*వివరణ:\*\*/i,         // Telugu
      /\*\*स्पष्टीकरण:\*\*/i,    // Hindi
      /\*\*ব্যাখ্যা:\*\*/i,       // Bengali
      /\*\*விளக்கம்:\*\*/i,      // Tamil
    ];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if this is a question start (numbered question with **title**)
      const questionMatch = trimmedLine.match(/^\s*\d+\.\s*\*\*(.*?)\*\*/);

      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion.trim()) {
          questions.push(currentQuestion.trim());
        }

        // Start new question
        currentQuestion = `${trimmedLine}`;
        inQuestion = true;
      } else if (inQuestion && trimmedLine) {
        // Check if we hit options (lines starting with - A), - B), etc.)
        if (trimmedLine.match(/^\s*-\s*[A-D]\)/)) {
          // Stop here - we've reached options
          inQuestion = false;
        } else if (trimmedLine.includes('**Correct Answer:**')) {
          // Stop here - we've reached answer
          inQuestion = false;
        } else {
          // Check for explanation patterns in any language
          let isExplanationLine = false;
          for (const pattern of explanationPatterns) {
            if (pattern.test(trimmedLine)) {
              isExplanationLine = true;
              break;
            }
          }
          
          if (isExplanationLine) {
            // Stop here - we've reached explanation
            inQuestion = false;
          } else {
            // Continue adding to current question
            currentQuestion += `\n${line}`;
          }
        }
      }
    }

    // Add the last question
    if (currentQuestion.trim()) {
      questions.push(currentQuestion.trim());
    }

    return questions.join('\n\n');
  };

  const handleTitleCancel = (questionIndex: number) => {
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[questionIndex];
      return newTitles;
    });
    setEditingQuestionId(null);
    // Remove from edited titles list since changes are canceled
    setEditedTitleIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionIndex);
      return newSet;
    });
  };

  const getTitleForQuestion = (question: any, index: number) => {
    return editedTitles[index] || question.title;
  };

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
      } catch (_) { }
    };
    fetchOutlines();
  }, [useExistingOutline]);

  const makeThoughts = () => {
    const list: string[] = [];
    list.push(`Analyzing quiz request for "${currentPrompt?.slice(0, 40) || "Untitled"}"...`);
    list.push(`Detected language: ${language.toUpperCase()}`);
    list.push(`Planning ${selectedQuestionCount} questions with ${selectedQuestionTypes.length} question type${selectedQuestionTypes.length > 1 ? "s" : ""}...`);
    // shuffle little filler line
    list.push("Consulting quiz knowledge base...");

    // Add a diverse set of informative yet playful status lines for quiz generation
    const extra = [
      "Crafting engaging questions...",
      "Balancing difficulty levels...",
      "Selecting relevant distractors...",
      "Integrating learning objectives...",
      "Cross-checking answer accuracy...",
      "Curating question variety...",
      "Weaving assessment flow...",
      "Injecting practical scenarios...",
      "Sequencing question logic...",
      "Optimizing cognitive engagement...",
      "Aligning with learning outcomes...",
      "Ensuring clear instructions...",
      "Connecting theory to practice...",
      "Drafting comprehensive explanations...",
      "Incorporating real-world examples...",
      "Adding contextual scenarios...",
      "Scanning content relevance...",
      "Validating question clarity...",
      "Polishing answer options...",
      "Finalizing quiz structure...",
    ];
    list.push(...extra);
    return list;
  };

  const [thoughts, setThoughts] = useState<string[]>(makeThoughts());
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const delayForThought = (text: string): number => {
    if (text.startsWith("Analyzing")) return rand(2500, 5000);
    if (text.startsWith("Detected language")) return rand(1200, 2000);
    if (text.startsWith("Planning")) return rand(4000, 7000);
    if (text.startsWith("Consulting")) return rand(3500, 6000);
    if (text.startsWith("Finalizing")) return rand(3000, 5000);
    return rand(2000, 4000);
  };

  useEffect(() => {
    if (loading) {
      setThoughts(makeThoughts());
      setThoughtIdx(0);

      const scheduleNext = (index: number) => {
        const txt = thoughts[index];
        const delay = delayForThought(txt);
        if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
        if (txt.startsWith("Finalizing quiz")) return; // keep until loading finishes
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
  }, [loading, selectedQuestionCount, selectedQuestionTypes, prompt, language]);

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
      } catch (_) { }
    };
    fetchLessons();
  }, [selectedOutlineId, useExistingOutline, selectedLesson]);

  // Effect to trigger streaming preview generation
  useEffect(() => {
    // Start preview when one of the following is true:
    //   • a lesson was chosen from the outline (old behaviour)
    //   • no lesson chosen, but the user provided a free-form prompt (new behaviour)
    const promptQuery = currentPrompt?.trim() || "";
    if (!selectedLesson && !promptQuery) {
      // Nothing to preview yet – wait for user input
      return;
    }

    // Don't start generation if there's no valid input
    const hasValidInput = (selectedOutlineId && selectedLesson) || promptQuery || fromFiles || fromText || fromKnowledgeBase;
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
        setTextareaVisible(true);
        // setLoading(false);
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
            fromKnowledgeBase: fromKnowledgeBase,
            questionCount: selectedQuestionCount,
            // Add connector context if creating from connectors
            ...(fromConnectors && {
              fromConnectors: true,
              connectorIds: connectorIds.join(','),
              connectorSources: connectorSources.join(','),
            }),
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
          // Always set loading to false when stream completes or is aborted
          setLoading(false);
          if (!abortController.signal.aborted && !gotFirstChunk && attempt >= 3) {
            setError("Failed to generate quiz – please try again later.");
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
  }, [prompt, selectedOutlineId, selectedLesson, selectedQuestionTypes, selectedLanguage, fromFiles, fromText, fromKnowledgeBase, memoizedFolderIds, memoizedFileIds, textMode, selectedQuestionCount, courseName, retryTrigger]);

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

        // NEW: Save original content for change detection
        setOriginalQuizData(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, quizData]);


  const handleCreateFinal = async () => {
    if (!quizData.trim()) return;

    setIsCreatingFinal(true);
    try {
      // NEW: Prepare content based on whether user made edits
      let contentToSend = quizData;
      let isCleanContent = false;

      if (hasUserEdits && editedTitleIds.size > 0) {
        // User edited question titles - send clean questions for regeneration
        contentToSend = createCleanQuestionsContent(quizData);
        isCleanContent = true;
        console.log("Sending clean questions for regeneration:", contentToSend);
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: contentToSend,
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
          folderId: folderContext?.folderId || undefined,
          // NEW: Send information about user edits
          hasUserEdits: hasUserEdits,
          originalContent: originalQuizData,
          // NEW: Indicate if content is clean (questions only)
          isCleanContent: isCleanContent,
          // Add connector context if creating from connectors
          ...(fromConnectors && {
            fromConnectors: true,
            connectorIds: connectorIds.join(','),
            connectorSources: connectorSources.join(','),
          }),
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
    setLoading(false);
  };

  const handleApplyQuizEdit = async () => {
    if (!editPrompt.trim() || loadingEdit) return;

    setLoadingEdit(true);
    setError(null);
    try {
      // NEW: Prepare content based on whether user made edits
      let contentToSend = quizData;
      let isCleanContent = false;

      if (hasUserEdits && editedTitleIds.size > 0) {
        // User edited question titles - send clean questions for regeneration
        contentToSend = createCleanQuestionsContent(quizData);
        isCleanContent = true;
        console.log("Sending clean questions for edit:", contentToSend);
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentContent: contentToSend,
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
          // NEW: Indicate if content is clean (questions only)
          isCleanContent: isCleanContent,
          // Add connector context if creating from connectors
          ...(fromConnectors && {
            fromConnectors: true,
            connectorIds: connectorIds.join(','),
            connectorSources: connectorSources.join(','),
          }),
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

      // NEW: Mark that user has made edits after AI editing
      setHasUserEdits(true);

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
        className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      >
        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={16} /> {t('interface.generate.back', 'Back')}
        </Link>

        <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">

          <h1 className="text-2xl font-semibold text-center bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mt-2">{t('interface.generate.title', 'Generate')}</h1>

          {/* Step-by-step process */}
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* Step 1: Choose source */}
            {useExistingOutline === null && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-lg font-medium text-gray-700">{t('interface.generate.quizQuestion', 'Do you want to create a quiz from an existing Course Outline?')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUseExistingOutline(true)}
                    className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                  >
                    {t('interface.generate.yesContentForQuiz', 'Yes, content for the quiz from the outline')}
                  </button>
                  <button
                    onClick={() => setUseExistingOutline(false)}
                    className="px-6 py-2 rounded-full border border-gray-100 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('interface.generate.noStandaloneQuiz', 'No, I want standalone quiz')}
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
                    <Select
                      value={selectedOutlineId?.toString() ?? ""}
                      onValueChange={(value: string) => {
                        const val = value ? Number(value) : null;
                        setSelectedOutlineId(val);
                        // clear module & lesson selections when outline changes
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
                        setSelectedLesson("");
                      }}
                      onOpenChange={() => setShowQuestionTypesDropdown(false)}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue placeholder={t('interface.generate.selectOutline', 'Select Outline')} />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300">
                        {outlines.map((o) => (
                          <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedOutlineId && (
                      <Select
                        value={selectedModuleIndex?.toString() ?? ""}
                        onValueChange={(value: string) => {
                          const idx = value ? Number(value) : null;
                          setSelectedModuleIndex(idx);
                          setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                          setSelectedLesson("");
                        }}
                        onOpenChange={() => setShowQuestionTypesDropdown(false)}
                        disabled={modulesForOutline.length === 0}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                          <SelectValue placeholder={t('interface.generate.selectModule', 'Select Module')} />
                        </SelectTrigger>
                        <SelectContent className="border-gray-300">
                          {modulesForOutline.map((m, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedModuleIndex !== null && (
                      <Select
                        value={selectedLesson}
                        onValueChange={setSelectedLesson}
                        onOpenChange={() => setShowQuestionTypesDropdown(false)}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                          <SelectValue placeholder={t('interface.generate.selectLesson', 'Select Lesson')} />
                        </SelectTrigger>
                        <SelectContent className="border-gray-300">
                          {lessonsForModule.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                          onOpenChange={() => setShowQuestionTypesDropdown(false)}
                        >
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-300">
                            <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <DropdownMenu open={showQuestionTypesDropdown} onOpenChange={setShowQuestionTypesDropdown}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="flex items-center justify-between px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9 gap-2"
                            >
                              <span className="text-black">
                                {selectedQuestionTypes.length === 0
                                  ? t('interface.generate.selectQuestionTypes', 'Select Question Types')
                                  : selectedQuestionTypes.length === 1
                                    ? selectedQuestionTypes[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : `${selectedQuestionTypes.length} ${t('interface.generate.typesSelected', 'types selected')}`}
                              </span>
                              <ChevronDown size={16} className="text-gray-500 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="w-48 p-2 border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto" 
                            align="start"
                            style={{ backgroundColor: 'white' }}
                          >
                            {[
                              { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                              { value: "multi-select", label: t('interface.generate.multiSelect', 'Multi-Select') },
                              { value: "matching", label: t('interface.generate.matching', 'Matching') },
                              { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                              { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                            ].map((type) => (
                              <label key={type.value} className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
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
                                  className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{type.label}</span>
                              </label>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Select
                          value={selectedQuestionCount.toString()}
                          onValueChange={(value: string) => setSelectedQuestionCount(Number(value))}
                          onOpenChange={() => setShowQuestionTypesDropdown(false)}
                        >
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-300 max-h-48 overflow-y-auto">
                            {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} {t('interface.generate.questions', 'questions')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}

                {/* Show standalone quiz dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                      onOpenChange={() => setShowQuestionTypesDropdown(false)}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300">
                        <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                        <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                        <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <DropdownMenu open={showQuestionTypesDropdown} onOpenChange={setShowQuestionTypesDropdown}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center justify-between px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9 gap-2"
                        >
                          <span className="text-black">
                            {selectedQuestionTypes.length === 0
                              ? t('interface.generate.selectQuestionTypes', 'Select Question Types')
                              : selectedQuestionTypes.length === 1
                                ? selectedQuestionTypes[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                : `${selectedQuestionTypes.length} ${t('interface.generate.typesSelected', 'types selected')}`}
                          </span>
                          <ChevronDown size={16} className="text-gray-500 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-48 p-2 border border-gray-300 rounded-lg shadow-lg" 
                        align="start"
                        style={{ backgroundColor: 'white' }}
                      >
                        {[
                          { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                          { value: "multi-select", label: t('interface.generate.multiSelect', 'Multi-Select') },
                          { value: "matching", label: t('interface.generate.matching', 'Matching') },
                          { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                          { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                        ].map((type) => (
                          <label key={type.value} className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
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
                              className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{type.label}</span>
                          </label>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Select
                      value={selectedQuestionCount.toString()}
                      onValueChange={(value: string) => setSelectedQuestionCount(Number(value))}
                      onOpenChange={() => setShowQuestionTypesDropdown(false)}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300 max-h-48 overflow-y-auto">
                        {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                          <SelectItem key={n} value={n.toString()}>{n} {t('interface.generate.questions', 'questions')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Prompt input for standalone quizzes */}
          {useExistingOutline === false && (
            <div className="relative group">
              <Textarea
                value={currentPrompt || ""}
                onChange={(e) => {
                  const newPrompt = e.target.value;
                  setCurrentPrompt(newPrompt);
                  
                  // Handle prompt storage for long prompts
                  const sp = new URLSearchParams(searchParams?.toString() || "");
                  if (newPrompt.length > 500) {
                    const promptId = generatePromptId();
                    sessionStorage.setItem(promptId, newPrompt);
                    sp.set("prompt", promptId);
                  } else {
                    sp.set("prompt", newPrompt);
                  }
                  router.replace(`?${sp.toString()}`, { scroll: false });
                }}
                placeholder={t('interface.generate.promptPlaceholder', 'Describe what you\'d like to make')}
                rows={1}
                className="w-full px-7 py-5 rounded-2xl bg-white text-lg text-black resize-none overflow-hidden min-h-[56px] border-none focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
              <Edit 
                size={16} 
                className="absolute top-[23px] right-7 text-gray-400 pointer-events-none flex items-center justify-center" 
              />
            </div>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.quiz', 'Quiz')} {t('interface.generate.content', 'Content')}</h2>
            {loading && (
              <LoadingAnimation message={thoughts[thoughtIdx]} />
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-3">
                  <XCircle className="h-5 w-5" />
                  {t('interface.error', 'Error')}
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
                  {t('interface.generate.retryGeneration', 'Retry Generation')}
                </button>
              </div>
            )}

            {/* Main content display - Cards or Textarea */}
            {textareaVisible && (
              <div
                className="bg-white rounded-xl p-6 flex flex-col gap-6 relative"
                style={{ animation: 'fadeInDown 0.25s ease-out both' }}
              >
                {loadingEdit && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                    <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                  </div>
                )}

                {/* Display content in card format if questions are available, otherwise show textarea */}
                {questionList.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {questionList.map((question, idx: number) => (
                      <div key={idx} className="flex bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start justify-center pt-5 w-16 bg-[#E5EEFF] text-gray-600 font-semibold text-base select-none flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="mb-2">
                            {editingQuestionId === idx ? (
                              <div className="relative group">
                                <input
                                  type="text"
                                  value={editedTitles[idx] || question.title}
                                  onChange={(e) => handleTitleEdit(idx, e.target.value)}
                                  className="text-[#20355D] text-base font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full pr-8 h-auto"
                                  autoFocus
                                  onBlur={(e) => handleTitleSave(idx, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSave(idx, (e.target as HTMLInputElement).value);
                                    if (e.key === 'Escape') handleTitleCancel(idx);
                                  }}
                                />
                                {(editedTitles[idx] || question.title) && (
                                  <Edit 
                                    size={14} 
                                    className="absolute top-1 right-0 text-gray-400 opacity-100 group-focus-within:opacity-0 transition-opacity duration-200 pointer-events-none"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="relative group">
                                <h4
                                  className="text-[#20355D] text-base font-semibold cursor-pointer pr-8"
                                  onMouseDown={() => {
                                    // Set the next editing ID before the blur event fires
                                    nextEditingIdRef.current = idx;
                                  }}
                                  onClick={() => {
                                    setEditingQuestionId(idx);
                                  }}
                                >
                                  {getTitleForQuestion(question, idx)}
                                </h4>
                                {getTitleForQuestion(question, idx) && (
                                  <Edit 
                                    size={14} 
                                    className="absolute top-1 right-0 text-gray-400 opacity-100 transition-opacity duration-200 pointer-events-none"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          {question.content && (
                            <div className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}`}>
                              {question.content.substring(0, 100)}
                              {question.content.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
                  //  : (
                  //   <textarea
                  //     ref={textareaRef}
                  //     value={quizData}
                  //     onChange={(e) => setQuizData(e.target.value)}
                  //     placeholder={t('interface.generate.quizContentPlaceholder', 'Quiz content will appear here...')}
                  //     className="w-full border border-gray-200 rounded-md p-4 resize-y bg-white/90 min-h-[70vh]"
                  //     disabled={loadingEdit}
                  //   />
                  // )
                }
              </div>
            )}
          </section>

          {/* Inline Advanced section & button */}
          {streamDone && quizData && (
            <>
              {showAdvanced && (
                <div className="w-full bg-white rounded-xl p-4 flex flex-col gap-3 mb-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={t('interface.generate.describeImprovements', 'Describe what you\'d like to improve...')}
                    className="w-full px-7 py-5 rounded-2xl bg-white text-lg text-black resize-none overflow-hidden min-h-[80px] border-gray-100 focus:border-blue-300 focus:outline-none focus:ring-0 transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.95)" }}
                  />

                  {/* Example prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    {quizExamples.map((ex) => (
                      <button
                        key={ex.short}
                        type="button"
                        onClick={() => toggleExample(ex)}
                        className={`relative text-left rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-all duration-200 ${selectedExamples.includes(ex.short) ? 'bg-[#B8D4F0]' : 'bg-[#D9ECFF] hover:shadow-lg'
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
                      {loadingEdit ? <LoadingAnimation message={t('interface.generate.applying', 'Applying...')} /> : (<>{t('interface.edit', 'Edit')} <Sparkles size={14} /></>)}
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
                  {t('interface.generate.advancedMode', 'Advanced Mode')}
                  <Settings size={14} className={`${showAdvanced ? 'rotate-180' : ''} transition-transform`} />
                </button>
              </div>
            </>
          )}

          {streamDone && quizData && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.setupContentBuilder', 'Set up your Contentbuilder')}</h2>
              <div className="bg-white rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-[#20355D]">{t('interface.generate.themes', 'Themes')}</h2>
                    <p className="mt-1 text-[#858587] font-medium text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-[#20355D] hover:opacity-80 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                    <span>{t('interface.generate.viewMore', 'View more')}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Themes grid */}
                  <div className="grid grid-cols-3 gap-5 justify-items-center">
                    {themeOptions.map((theme) => {
                      const isSelected = selectedTheme === theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`flex flex-col rounded-lg overflow-hidden border border-gray-100 transition-all p-2 gap-2 ${isSelected
                            ? 'bg-[#cee2fd]'
                            : 'hover:shadow-lg'
                            }`}
                        >
                          <div className="w-[214px] h-[116px] flex items-center justify-center">
                            {(() => {
                              const Svg = ThemeSvgs[theme.id as keyof typeof ThemeSvgs] || ThemeSvgs.default;
                              return <Svg />;
                            })()}
                          </div>
                          <div className="flex items-center gap-1 px-2">
                            <span className={`w-4 text-[#0540AB] ${isSelected ? '' : 'opacity-0'}`}>
                              ✔
                            </span>
                            <span className="text-sm text-[#20355D] font-medium select-none">
                              {theme.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {streamDone && quizData && (
            <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
                {/* Quiz creation costs 5 credits */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <span>5 {t('interface.credits', 'credits')}</span>

                {/* NEW: Show user edits indicator */}
                {hasUserEdits && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>{t('interface.generate.userEdits', 'User edits detected')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-[7.5rem]">
                <span className="text-lg text-gray-700 font-medium select-none">
                  {/* This can be word count or removed */}
                  {quizData.split(/\s+/).length} {t('interface.generate.words', 'words')}
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
                      {t('interface.generate.creatingQuiz', 'Creating Quiz...')}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span className="select-none font-semibold">{t('interface.generate.generate', 'Generate')}</span>
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
          <LoadingAnimation message={t('interface.generate.finalizingQuiz', 'Finalizing quiz...')} />
        </div>
      )}
    </>
  );
} 