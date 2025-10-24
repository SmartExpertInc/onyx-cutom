"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle, ChevronDown, Settings, Plus, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";
import { trackCreateProduct } from "../../../lib/mixpanelClient"
import { AiAgent } from "@/components/ui/ai-agent";

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
  const { t, language: currentLanguage } = useLanguage();
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
  const selectedFiles = searchParams?.get("selectedFiles")?.split(",").filter(Boolean).map(file => decodeURIComponent(file)) || [];
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");
  const [userText, setUserText] = useState('');
   
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

  // Retrieve user text from sessionStorage
  useEffect(() => {
    if (fromText) {
      try {
        const storedData = sessionStorage.getItem('pastedTextData');
        if (storedData) {
          const textData = JSON.parse(storedData);
          // Check freshness and mode match (within 1 hour)
          if (textData.timestamp && (Date.now() - textData.timestamp < 3600000) && (!textMode || textData.mode === textMode)) {
            setUserText(textData.text || '');
          }
        }
      } catch (error) {
        console.error('Error retrieving pasted text data:', error);
      }
    }
  }, [fromText, textMode]);

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
  const [advancedModeState, setAdvancedModeState] = useState<string | undefined>(undefined);
  const [advancedModeClicked, setAdvancedModeClicked] = useState(false);
  const handleAdvancedModeClick = () => {
    if (advancedModeClicked == false) {
      setAdvancedModeState("Clicked");
      setAdvancedModeClicked(true);
    }
  };
  const advancedSectionRef = useRef<HTMLDivElement>(null);
  const [aiAgentChatStarted, setAiAgentChatStarted] = useState(false);
  const [aiAgentLastMessage, setAiAgentLastMessage] = useState("");
  
  // Auto-scroll to AI Agent section when it's shown
  useEffect(() => {
    if (showAdvanced && advancedSectionRef.current) {
      advancedSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [showAdvanced]);

  const quizExamples: { short: string; detailed: string }[] = [
    {
      short: t('interface.generate.quizExamples.moreChallenging.short', 'Make questions more challenging'),
      detailed: t('interface.generate.quizExamples.moreChallenging.detailed', 'Increase the difficulty level of the quiz questions by adding more complex scenarios, requiring deeper analysis, and including higher-order thinking skills.'),
    },
    {
      short: t('interface.generate.quizExamples.morePractical.short', 'Add more practical examples'),
      detailed: t('interface.generate.quizExamples.morePractical.detailed', 'Include more real-world examples and case studies in the questions to make them more applicable and engaging for learners.'),
    },
    {
      short: t('interface.generate.quizExamples.improveClarity.short', 'Improve question clarity'),
      detailed: t('interface.generate.quizExamples.improveClarity.detailed', 'Rewrite questions to be clearer and more concise, ensuring they are easy to understand and avoid ambiguity.'),
    },
    {
      short: t('interface.generate.quizExamples.addVariety.short', 'Add variety to question types'),
      detailed: t('interface.generate.quizExamples.addVariety.detailed', 'Incorporate different types of questions (multiple choice, true/false, short answer) to make the quiz more engaging and comprehensive.'),
    },
    {
      short: t('interface.generate.quizExamples.focusObjectives.short', 'Focus on key learning objectives'),
      detailed: t('interface.generate.quizExamples.focusObjectives.detailed', 'Restructure the quiz to better align with the main learning objectives and ensure questions test the most important concepts.'),
    },
    {
      short: t('interface.generate.quizExamples.includeFeedback.short', 'Include feedback and explanations'),
      detailed: t('interface.generate.quizExamples.includeFeedback.detailed', 'Add detailed explanations for correct and incorrect answers to help learners understand the reasoning behind each response.'),
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

  // Function to get the correct plural form for questions
  const getQuestionPluralForm = (count: number) => {
    if (currentLanguage === 'ru') {
      // Russian pluralization rules
      const lastDigit = count % 10;
      const lastTwoDigits = count % 100;
      
      // Special case for 11-14 (always use "many" form)
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return t('interface.generate.questionMany', 'вопросов');
      }
      
      // Regular rules based on last digit
      if (lastDigit === 1) return t('interface.generate.questionSingular', 'вопрос');
      if (lastDigit >= 2 && lastDigit <= 4) return t('interface.generate.questionFew', 'вопроса');
      return t('interface.generate.questionMany', 'вопросов');
    } else if (currentLanguage === 'uk') {
      // Ukrainian pluralization rules
      const lastDigit = count % 10;
      const lastTwoDigits = count % 100;
      
      // Special case for 11-14 (always use "many" form)
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return t('interface.generate.questionMany', 'питань');
      }
      
      // Regular rules based on last digit
      if (lastDigit === 1) return t('interface.generate.questionSingular', 'питання');
      if (lastDigit >= 2 && lastDigit <= 4) return t('interface.generate.questionFew', 'питання');
      return t('interface.generate.questionMany', 'питань');
    } else {
      // English and Spanish use simple pluralization
      return count === 1 ? t('interface.generate.questionSingular', 'question') : t('interface.generate.questions', 'Questions');
    }
  };

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
     
  }, [loading, selectedQuestionCount, selectedQuestionTypes, currentPrompt, language]);

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
    if (!selectedLesson && !promptQuery && !fromText) {
      // Nothing to preview yet – wait for user input
      return;
    }

    // If generating from text, ensure pasted text is loaded before starting
    if (fromText && !(userText && userText.trim())) {
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
            userText: fromText ? userText : undefined,
            fromKnowledgeBase: fromKnowledgeBase,
            questionCount: selectedQuestionCount,
            // Add connector context if creating from connectors
            ...(fromConnectors && {
              fromConnectors: true,
              connectorIds: connectorIds.join(','),
              connectorSources: connectorSources.join(','),
              ...(selectedFiles.length > 0 && {
                selectedFiles: selectedFiles.join(','),
              }),
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
  }, [currentPrompt, selectedOutlineId, selectedLesson, selectedQuestionTypes, selectedLanguage, fromFiles, fromText, fromKnowledgeBase, memoizedFolderIds, memoizedFileIds, textMode, selectedQuestionCount, courseName, retryTrigger, userText]);

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
    const activeProductType = sessionStorage.getItem('activeProductType');
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
          prompt: currentPrompt,
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
            ...(selectedFiles.length > 0 && {
              selectedFiles: selectedFiles.join(','),
            }),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFinalProductId(result.id);

      await trackCreateProduct(
        "Completed",
        sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
        fromFiles,
        fromText,
        fromKnowledgeBase,
        fromConnectors,
        language, 
        activeProductType ?? undefined, 
        undefined,
        advancedModeState
      );
      
      // Clear the failed state since we successfully completed
      try {
        if (sessionStorage.getItem('createProductFailed')) {
          sessionStorage.removeItem('createProductFailed');
        }
      } catch (error) {
        console.error('Error clearing failed state:', error);
      }

      // Redirect to the created quiz
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('last_created_product_id', String(result.id)); } catch (_) {}
      }
      router.push(`/projects/view/${result.id}?from=create`);
    } catch (error: any) {
      try {
        // Mark that a "Failed" event has been tracked to prevent subsequent "Clicked" events
        if (!sessionStorage.getItem('createProductFailed')) {
          await trackCreateProduct(
            "Failed",
            sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
            fromFiles,
            fromText,
            fromKnowledgeBase,
            fromConnectors,
            language, 
            activeProductType ?? undefined,
            undefined,
            advancedModeState
          );
          sessionStorage.setItem('createProductFailed', 'true');
        }
      } catch (error) {
        console.error('Error setting failed state:', error);
      }
      
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
            ...(selectedFiles.length > 0 && {
              selectedFiles: selectedFiles.join(','),
            }),
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
      <main className="min-h-screen py-24 pb-24 px-4 flex flex-col items-center bg-white relative overflow-hidden">
        {/* Decorative gradient backgrounds */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: '800px',
            height: '900px',
            top: '-500px',
            left: '-350px',
            borderRadius: '450px',
            background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.9) 0%, rgba(56, 23, 255, 0.9) 100%)',
            transform: 'rotate(-300deg)',
            filter: 'blur(200px)',
            opacity: '30%',
          }}
        />
        <div 
          className="absolute pointer-events-none"
          style={{
            width: '1060px',
            height: '1400px',
            top: '658px',
            left: '433px',
            borderRadius: '450px',
            background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.9) 0%, rgba(216, 23, 255, 0.9) 100%)',
            transform: 'rotate(-120deg)',
            filter: 'blur(200px)',
            opacity: '30%',
          }}
        />

        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer z-10"
          style={{ 
            color: '#000000',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))'
          }}
        >
          <span>&lt;</span>
          <span>{t('interface.generate.back', 'Back')}</span>
        </Link>

        <div className="w-full max-w-4xl flex flex-col gap-6 text-gray-900 relative z-10">

          <h1 className="text-center text-[58px] sora-font-semibold leading-none text-[#4B4B51] mb-2">{t('interface.generate.title', 'Generate')}</h1>

          {/* Step-by-step process */}
          <div className="flex flex-col gap-4">
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
              <div className="w-full">
                {/* Show outline flow if user chose existing outline */}
                {useExistingOutline === true && (
                  <>
                    {/* Course Structure dropdowns - Outline, Module, Lesson */}
                    {(selectedOutlineId || selectedModuleIndex !== null || selectedLesson) && (
                      <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200 mb-4">
                        <div className="flex items-center">
                          {/* Outline dropdown */}
                          <div className="flex-1 flex items-center justify-center">
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
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.outline', 'Outline')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{outlines.find(o => o.id === selectedOutlineId)?.name || ''}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-white" sideOffset={15}>
                                {outlines.map((o) => (
                                  <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>

                          {/* Module dropdown */}
                          <div className="flex-1 flex items-center justify-center">
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
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.module', 'Module')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{selectedModuleIndex !== null ? modulesForOutline[selectedModuleIndex]?.name || '' : ''}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-white" sideOffset={15}>
                                {modulesForOutline.map((m, idx) => (
                                  <SelectItem key={idx} value={idx.toString()}>{m.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>

                          {/* Lesson dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                              value={selectedLesson}
                              onValueChange={setSelectedLesson}
                              onOpenChange={() => setShowQuestionTypesDropdown(false)}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H16C16.5523 3 17 3.44772 17 4V14C17 14.5523 16.5523 15 16 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 7H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10H12" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.lesson', 'Lesson')}:</span>
                                  <span className="text-[#09090B] truncate max-w-[100px]">{selectedLesson}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-white" sideOffset={15}>
                                {lessonsForModule.map((l) => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Initial Outline dropdown - shows when no outline is selected yet */}
                    {!selectedOutlineId && (
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
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                          {/* Language dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                              value={selectedLanguage}
                              onValueChange={setSelectedLanguage}
                              onOpenChange={() => setShowQuestionTypesDropdown(false)}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 9C2 13.1421 5.35786 16.5 9.5 16.5C13.6421 16.5 17 13.1421 17 9C17 4.85786 13.6421 1.5 9.5 1.5C5.35786 1.5 2 4.85786 2 9Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10.25 1.53711C10.25 1.53711 12.5 4.50007 12.5 9.00004C12.5 13.5 10.25 16.4631 10.25 16.4631" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8.75 16.4631C8.75 16.4631 6.5 13.5 6.5 9.00004C6.5 4.50007 8.75 1.53711 8.75 1.53711" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2.47229 11.625H16.5279" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2.47229 6.375H16.5279" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.language', 'Language')}:</span>
                                  <span className="text-[#09090B]">{selectedLanguage === 'en' ? `${t('interface.english', 'English')}` : selectedLanguage === 'uk' ? `${t('interface.ukrainian', 'Ukrainian')}` : selectedLanguage === 'es' ? `${t('interface.spanish', 'Spanish')}` : `${t('interface.russian', 'Russian')}`}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-white" sideOffset={15}>
                                <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                                <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                                <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                                <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                          
                          {/* Question Types dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <DropdownMenu open={showQuestionTypesDropdown} onOpenChange={setShowQuestionTypesDropdown}>
                              <DropdownMenuTrigger asChild>
                                <button className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                  <div className="flex items-center gap-2">
                                    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" clipRule="evenodd" d="M13.3483 1.00069C13.3461 1.00099 13.3439 1.00131 13.3418 1.00164H7.02321C6.18813 1.00164 5.5 1.68603 5.5 2.52111V15.7169C5.5 16.552 6.18813 17.2401 7.02321 17.2401H15.9777C16.8128 17.2401 17.5 16.552 17.5 15.7169V5.12632C17.4992 5.11946 17.4982 5.11261 17.4971 5.10578C17.496 5.0788 17.4925 5.05197 17.4869 5.02557C17.4843 5.01269 17.4812 4.99993 17.4775 4.98732C17.4678 4.95493 17.4547 4.92366 17.4384 4.89404C17.436 4.88997 17.4335 4.88594 17.4309 4.88194C17.4109 4.84801 17.3868 4.81669 17.3591 4.78868L13.7139 1.13966C13.6869 1.11319 13.6568 1.09002 13.6243 1.07064C13.6182 1.06707 13.612 1.06364 13.6057 1.06035C13.5272 1.01663 13.438 0.995976 13.3483 1.00069ZM7.02322 1.9577H12.8996V4.07974C12.8996 4.91481 13.5878 5.60294 14.4228 5.60294H16.5449V15.7169C16.5449 16.0393 16.3002 16.2849 15.9777 16.2849H7.02322C6.70078 16.2849 6.45516 16.0393 6.45516 15.7169V2.52109C6.45516 2.19865 6.70078 1.9577 7.02322 1.9577ZM13.8548 2.63395L15.8677 4.64686H14.4228C14.1004 4.64686 13.8548 4.40218 13.8548 4.07974V2.63395ZM8.30297 7.48898C8.17679 7.48923 8.05584 7.5394 7.96653 7.62853C7.87722 7.71767 7.82682 7.83852 7.82633 7.9647C7.82608 8.02749 7.83822 8.08972 7.86206 8.14781C7.88589 8.20591 7.92094 8.25873 7.96522 8.30327C8.00949 8.3478 8.06211 8.38316 8.12006 8.40733C8.17802 8.43151 8.24017 8.44401 8.30297 8.44413H14.698C14.761 8.44438 14.8235 8.43215 14.8818 8.40814C14.94 8.38414 14.993 8.34883 15.0376 8.30426C15.0821 8.25969 15.1174 8.20674 15.1414 8.14846C15.1654 8.09018 15.1777 8.02773 15.1774 7.9647C15.1772 7.90198 15.1646 7.83993 15.1404 7.78208C15.1161 7.72423 15.0808 7.67172 15.0362 7.62754C14.9917 7.58337 14.9389 7.5484 14.8809 7.52462C14.8229 7.50085 14.7607 7.48874 14.698 7.48898H8.30297ZM8.30297 10.1996C8.24017 10.1997 8.17802 10.2122 8.12006 10.2364C8.06211 10.2606 8.00949 10.2959 7.96521 10.3405C7.92094 10.385 7.88589 10.4378 7.86206 10.4959C7.83822 10.554 7.82608 10.6162 7.82633 10.679C7.82682 10.8052 7.87723 10.9261 7.96653 11.0152C8.05584 11.1043 8.17679 11.1545 8.30297 11.1547H14.698C14.7607 11.155 14.8229 11.1429 14.8809 11.1191C14.9389 11.0953 14.9917 11.0604 15.0362 11.0162C15.0808 10.972 15.1161 10.9195 15.1404 10.8617C15.1646 10.8038 15.1772 10.7418 15.1774 10.679C15.1777 10.616 15.1654 10.5535 15.1414 10.4953C15.1174 10.437 15.0821 10.384 15.0376 10.3395C14.993 10.2949 14.94 10.2596 14.8818 10.2356C14.8235 10.2116 14.761 10.1993 14.698 10.1996H8.30297ZM8.30297 12.9111C8.24017 12.9113 8.17802 12.9238 8.12006 12.9479C8.06211 12.9721 8.00949 13.0075 7.96521 13.052C7.92094 13.0965 7.88589 13.1494 7.86206 13.2075C7.83822 13.2656 7.82608 13.3278 7.82633 13.3906C7.82682 13.5168 7.87723 13.6376 7.96653 13.7267C8.05584 13.8159 8.17679 13.866 8.30297 13.8663H14.698C14.7607 13.8665 14.8229 13.8544 14.8809 13.8307C14.9389 13.8069 14.9917 13.7719 15.0362 13.7277C15.0808 13.6836 15.1161 13.631 15.1404 13.5732C15.1646 13.5154 15.1772 13.4533 15.1774 13.3906C15.1777 13.3275 15.1654 13.2651 15.1414 13.2068C15.1174 13.1485 15.0821 13.0956 15.0376 13.051C14.993 13.0064 14.94 12.9711 14.8818 12.9471C14.8235 12.9231 14.761 12.9109 14.698 12.9111H8.30297Z" fill="black"/>
                                    </svg>
                                    <span className="text-[#09090B] opacity-50 text-sm">{t('interface.generate.questionTypesSelected', 'Types selected')}:</span>
                                    <span className="text-[#09090B]">
                                      {selectedQuestionTypes.length === 0
                                        ? '0'
                                        : selectedQuestionTypes.length > 9
                                          ? '9'
                                          : selectedQuestionTypes.length.toString()}
                                    </span>
                                    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M9.5 1L5.5 5L1.5 1" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                className="w-60 p-2 rounded-lg max-h-60 overflow-y-auto border-white" 
                                align="center"
                                sideOffset={25}
                                style={{ backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                              >
                                {[
                                  { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                                  { value: "multi-select", label: t('interface.generate.multiSelect', 'Multi-Select') },
                                  { value: "matching", label: t('interface.generate.matching', 'Matching') },
                                  { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                                  { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                                ].map((type) => (
                                  <label key={type.value} className="flex items-center py-1.5 pr-2 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <div className="flex items-center gap-2 flex-1">
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
                                      <span className="text-sm text-[#09090B]">{type.label}</span>
                                    </div>
                                  </label>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                          
                          {/* Question Count dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                            <Select
                              value={selectedQuestionCount.toString()}
                              onValueChange={(value: string) => setSelectedQuestionCount(Number(value))}
                              onOpenChange={() => setShowQuestionTypesDropdown(false)}
                            >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.questions', 'Questions')}:</span>
                                  <span className="text-[#09090B]">{selectedQuestionCount}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent className="border-white max-h-[200px]" sideOffset={15} align="center">
                                {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                                  <SelectItem key={n} value={n.toString()} className="px-2">{n}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Show standalone quiz dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center">
                      {/* Language dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                          onOpenChange={() => setShowQuestionTypesDropdown(false)}
                        >
                          <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                            <div className="flex items-center gap-2">
                              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 9C2 13.1421 5.35786 16.5 9.5 16.5C13.6421 16.5 17 13.1421 17 9C17 4.85786 13.6421 1.5 9.5 1.5C5.35786 1.5 2 4.85786 2 9Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10.25 1.53711C10.25 1.53711 12.5 4.50007 12.5 9.00004C12.5 13.5 10.25 16.4631 10.25 16.4631" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8.75 16.4631C8.75 16.4631 6.5 13.5 6.5 9.00004C6.5 4.50007 8.75 1.53711 8.75 1.53711" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2.47229 11.625H16.5279" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2.47229 6.375H16.5279" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-[#09090B] opacity-50">{t('interface.language', 'Language')}:</span>
                              <span className="text-[#09090B]">{selectedLanguage === 'en' ? 'English' : selectedLanguage === 'uk' ? 'Ukrainian' : selectedLanguage === 'es' ? 'Spanish' : 'Russian'}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="border-white" sideOffset={15}>
                            <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                      
                      {/* Question Types dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                        <DropdownMenu open={showQuestionTypesDropdown} onOpenChange={setShowQuestionTypesDropdown}>
                          <DropdownMenuTrigger asChild>
                            <button className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                              <div className="flex items-center gap-2">
                                <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M13.3483 1.00069C13.3461 1.00099 13.3439 1.00131 13.3418 1.00164H7.02321C6.18813 1.00164 5.5 1.68603 5.5 2.52111V15.7169C5.5 16.552 6.18813 17.2401 7.02321 17.2401H15.9777C16.8128 17.2401 17.5 16.552 17.5 15.7169V5.12632C17.4992 5.11946 17.4982 5.11261 17.4971 5.10578C17.496 5.0788 17.4925 5.05197 17.4869 5.02557C17.4843 5.01269 17.4812 4.99993 17.4775 4.98732C17.4678 4.95493 17.4547 4.92366 17.4384 4.89404C17.436 4.88997 17.4335 4.88594 17.4309 4.88194C17.4109 4.84801 17.3868 4.81669 17.3591 4.78868L13.7139 1.13966C13.6869 1.11319 13.6568 1.09002 13.6243 1.07064C13.6182 1.06707 13.612 1.06364 13.6057 1.06035C13.5272 1.01663 13.438 0.995976 13.3483 1.00069ZM7.02322 1.9577H12.8996V4.07974C12.8996 4.91481 13.5878 5.60294 14.4228 5.60294H16.5449V15.7169C16.5449 16.0393 16.3002 16.2849 15.9777 16.2849H7.02322C6.70078 16.2849 6.45516 16.0393 6.45516 15.7169V2.52109C6.45516 2.19865 6.70078 1.9577 7.02322 1.9577ZM13.8548 2.63395L15.8677 4.64686H14.4228C14.1004 4.64686 13.8548 4.40218 13.8548 4.07974V2.63395ZM8.30297 7.48898C8.17679 7.48923 8.05584 7.5394 7.96653 7.62853C7.87722 7.71767 7.82682 7.83852 7.82633 7.9647C7.82608 8.02749 7.83822 8.08972 7.86206 8.14781C7.88589 8.20591 7.92094 8.25873 7.96522 8.30327C8.00949 8.3478 8.06211 8.38316 8.12006 8.40733C8.17802 8.43151 8.24017 8.44401 8.30297 8.44413H14.698C14.761 8.44438 14.8235 8.43215 14.8818 8.40814C14.94 8.38414 14.993 8.34883 15.0376 8.30426C15.0821 8.25969 15.1174 8.20674 15.1414 8.14846C15.1654 8.09018 15.1777 8.02773 15.1774 7.9647C15.1772 7.90198 15.1646 7.83993 15.1404 7.78208C15.1161 7.72423 15.0808 7.67172 15.0362 7.62754C14.9917 7.58337 14.9389 7.5484 14.8809 7.52462C14.8229 7.50085 14.7607 7.48874 14.698 7.48898H8.30297ZM8.30297 10.1996C8.24017 10.1997 8.17802 10.2122 8.12006 10.2364C8.06211 10.2606 8.00949 10.2959 7.96521 10.3405C7.92094 10.385 7.88589 10.4378 7.86206 10.4959C7.83822 10.554 7.82608 10.6162 7.82633 10.679C7.82682 10.8052 7.87723 10.9261 7.96653 11.0152C8.05584 11.1043 8.17679 11.1545 8.30297 11.1547H14.698C14.7607 11.155 14.8229 11.1429 14.8809 11.1191C14.9389 11.0953 14.9917 11.0604 15.0362 11.0162C15.0808 10.972 15.1161 10.9195 15.1404 10.8617C15.1646 10.8038 15.1772 10.7418 15.1774 10.679C15.1777 10.616 15.1654 10.5535 15.1414 10.4953C15.1174 10.437 15.0821 10.384 15.0376 10.3395C14.993 10.2949 14.94 10.2596 14.8818 10.2356C14.8235 10.2116 14.761 10.1993 14.698 10.1996H8.30297ZM8.30297 12.9111C8.24017 12.9113 8.17802 12.9238 8.12006 12.9479C8.06211 12.9721 8.00949 13.0075 7.96521 13.052C7.92094 13.0965 7.88589 13.1494 7.86206 13.2075C7.83822 13.2656 7.82608 13.3278 7.82633 13.3906C7.82682 13.5168 7.87723 13.6376 7.96653 13.7267C8.05584 13.8159 8.17679 13.866 8.30297 13.8663H14.698C14.7607 13.8665 14.8229 13.8544 14.8809 13.8307C14.9389 13.8069 14.9917 13.7719 15.0362 13.7277C15.0808 13.6836 15.1161 13.631 15.1404 13.5732C15.1646 13.5154 15.1772 13.4533 15.1774 13.3906C15.1777 13.3275 15.1654 13.2651 15.1414 13.2068C15.1174 13.1485 15.0821 13.0956 15.0376 13.051C14.993 13.0064 14.94 12.9711 14.8818 12.9471C14.8235 12.9231 14.761 12.9109 14.698 12.9111H8.30297Z" fill="black"/>
                                </svg>
                                <span className="text-[#09090B] opacity-50 text-sm">{t('interface.generate.questionTypesSelected', 'Types selected')}:</span>
                                <span className="text-[#09090B]">
                                  {selectedQuestionTypes.length === 0
                                    ? '0'
                                    : selectedQuestionTypes.length > 9
                                      ? '9'
                                      : selectedQuestionTypes.length.toString()}
                                </span>
                                <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.5 1L5.5 5L1.5 1" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="w-60 p-2 border border-white rounded-lg max-h-60 overflow-y-auto" 
                            align="center"
                            sideOffset={25}
                            style={{ backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                          >
                            {[
                              { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                              { value: "multi-select", label: t('interface.generate.multiSelect', 'Multi-Select') },
                              { value: "matching", label: t('interface.generate.matching', 'Matching') },
                              { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                              { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                            ].map((type) => (
                              <label key={type.value} className="flex justify-between flex-1 items-center py-1.5 pr-2 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                                <div className="flex items-center gap-[10px]">
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
                                  <span className="text-sm text-[#09090B]">{type.label}</span>
                                </div>
                              </label>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                      
                      {/* Question Count dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                        <Select
                          value={selectedQuestionCount.toString()}
                          onValueChange={(value: string) => setSelectedQuestionCount(Number(value))}
                          onOpenChange={() => setShowQuestionTypesDropdown(false)}
                        >
                          <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                            <div className="flex items-center gap-2">
                              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                              </svg>
                              <span className="text-[#09090B] opacity-50">{t('interface.generate.questions', 'Questions')}:</span>
                              <span className="text-[#09090B]">{selectedQuestionCount}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="border-white max-h-[200px]" sideOffset={15} align="center">
                            {Array.from({ length: 20 }, (_, i) => i + 5).map((n) => (
                              <SelectItem key={n} value={n.toString()} className="px-2">{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Prompt input for standalone quizzes */}
          {useExistingOutline === false && (
            <div className="flex gap-2 items-start">
              <div className="relative group flex-1">
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
                  className="w-full px-7 py-5 rounded-lg bg-white text-lg text-black resize-none overflow-hidden min-h-[56px] focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 cursor-pointer shadow-lg"
                  style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #E0E0E0" }}
                />
              </div>
            </div>
          )}

          <section className="flex flex-col gap-3">
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
            {(textareaVisible || loading) && (
              <div
                className="rounded-[8px] flex flex-col relative"
                style={{ 
                  animation: 'fadeInDown 0.25s ease-out both',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.5) 100%)',
                  border: '1px solid #E0E0E0'
                }}
              >
                {/* Header with quiz title */}
                <div 
                  className="px-10 py-4 rounded-t-[8px] text-white text-lg font-medium"
                  style={{ backgroundColor: '#0F58F999' }}
                >
                  {t('interface.generate.quiz', 'Quiz')}
                </div>
                
                {/* Questions container */}
                <div className="px-10 py-5 flex flex-col gap-[15px] shadow-lg">
                  {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
                  
                  {loadingEdit && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                      <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                    </div>
                  )}

                  {/* Display content in card format if questions are available */}
                  {questionList.length > 0 && questionList.map((question, idx: number) => (
                    <div key={idx} className="bg-[#FFFFFF] rounded-lg overflow-hidden transition-shadow duration-200" style={{ border: '1px solid #CCCCCC' }}>
                      {/* Question header with number and title */}
                      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#CCCCCC] rounded-t-lg">
                        {/* <span className="text-[#0D001B] font-semibold text-lg">{idx + 1}.</span> */}
                        <div className="flex-1">
                          {editingQuestionId === idx ? (
                            <div className="relative group">
                              <Input
                                type="text"
                                value={editedTitles[idx] || question.title}
                                onChange={(e) => handleTitleEdit(idx, e.target.value)}
                                className="text-[#0D001B] font-bold text-sm leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                                autoFocus
                                onBlur={(e) => handleTitleSave(idx, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleTitleSave(idx, (e.target as HTMLInputElement).value);
                                  if (e.key === 'Escape') handleTitleCancel(idx);
                                }}
                                disabled={!streamDone || loadingEdit}
                              />
                            </div>
                          ) : (
                            <div className="relative group">
                              <Input
                                type="text"
                                value={getTitleForQuestion(question, idx)}
                                onMouseDown={() => {
                                  nextEditingIdRef.current = idx;
                                }}
                                onClick={() => {
                                  if (streamDone) setEditingQuestionId(idx);
                                }}
                                readOnly
                                className="text-[#0D001B] font-bold text-sm leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                                disabled={!streamDone}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content preview */}
                      {question.content && (
                        <div className="px-5 pb-4">
                          <div className={`text-sm font-normal leading-[140%] text-[#171718] whitespace-pre-wrap ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}`}>
                            {question.content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* AI Agent section */}
          {streamDone && quizData && showAdvanced && (
            <div className="rounded-lg pt-8 border border-[#CCCCCC] py-5" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.5) 100%)' }}>
              <AiAgent
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                examples={quizExamples}
                selectedExamples={selectedExamples}
                toggleExample={toggleExample}
                loadingEdit={loadingEdit}
                onApplyEdit={() => {
                  handleApplyQuizEdit();
                  setAdvancedModeState("Used");
                }}
                advancedSectionRef={advancedSectionRef}
                placeholder={t('interface.generate.describeImprovements', "Describe what you'd like to improve...")}
                buttonText={t('interface.edit', 'Edit')}
                hasStartedChat={aiAgentChatStarted}
                setHasStartedChat={setAiAgentChatStarted}
                lastUserMessage={aiAgentLastMessage}
                setLastUserMessage={setAiAgentLastMessage}
              />
            </div>
          )}
        </div> {/* end inner wrapper */}

      {/* Full-width generate footer bar */}
      {!loading && streamDone && quizData && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-3 px-6 flex items-center justify-center">
          {/* Credits required */}
          <div className="absolute left-6 flex items-center gap-2 text-base font-medium text-[#A5A5A5] select-none">
            {/* custom credits svg */}
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_476_6531)">
                <path d="M12.0597 6.91301C12.6899 7.14796 13.2507 7.53803 13.6902 8.04714C14.1297 8.55625 14.4337 9.16797 14.5742 9.82572C14.7146 10.4835 14.6869 11.166 14.4937 11.8102C14.3005 12.4545 13.9479 13.0396 13.4686 13.5114C12.9893 13.9833 12.3988 14.3267 11.7517 14.5098C11.1045 14.693 10.4216 14.71 9.76613 14.5593C9.11065 14.4086 8.50375 14.0951 8.00156 13.6477C7.49937 13.2003 7.1181 12.6335 6.89301 11.9997M4.66634 3.99967H5.33301V6.66634M11.1397 9.25301L11.6063 9.72634L9.72634 11.6063M9.33301 5.33301C9.33301 7.54215 7.54215 9.33301 5.33301 9.33301C3.12387 9.33301 1.33301 7.54215 1.33301 5.33301C1.33301 3.12387 3.12387 1.33301 5.33301 1.33301C7.54215 1.33301 9.33301 3.12387 9.33301 5.33301Z" stroke="#A5A5A5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_476_6531">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <span>5 {t('interface.generate.credits', 'credits')}</span>
          </div>

          {/* AI Agent + generate */}
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => {
                setShowAdvanced(!showAdvanced);
                handleAdvancedModeClick();
              }}
              className="px-6 py-2 rounded-md border border-[#0F58F9] bg-white text-[#0F58F9] text-xs font-medium hover:bg-blue-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.1986 4.31106L9.99843 6.11078M2.79912 3.71115V6.11078M11.1983 8.51041V10.91M5.79883 1.31152V2.51134M3.99901 4.91097H1.59924M12.3982 9.71022H9.99843M6.39877 1.91143H5.19889M12.7822 2.29537L12.0142 1.52749C11.9467 1.45929 11.8664 1.40515 11.7778 1.3682C11.6893 1.33125 11.5942 1.31223 11.4983 1.31223C11.4023 1.31223 11.3073 1.33125 11.2188 1.3682C11.1302 1.40515 11.0498 1.45929 10.9823 1.52749L1.21527 11.294C1.14707 11.3615 1.09293 11.4418 1.05598 11.5304C1.01903 11.6189 1 11.7139 1 11.8099C1 11.9059 1.01903 12.0009 1.05598 12.0894C1.09293 12.178 1.14707 12.2583 1.21527 12.3258L1.9832 13.0937C2.05029 13.1626 2.13051 13.2174 2.21912 13.2548C2.30774 13.2922 2.40296 13.3115 2.49915 13.3115C2.59534 13.3115 2.69056 13.2922 2.77918 13.2548C2.86779 13.2174 2.94801 13.1626 3.0151 13.0937L12.7822 3.32721C12.8511 3.26013 12.9059 3.17991 12.9433 3.0913C12.9807 3.00269 13 2.90748 13 2.81129C13 2.7151 12.9807 2.61989 12.9433 2.53128C12.9059 2.44267 12.8511 2.36245 12.7822 2.29537Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>AI Improve</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreateFinal}
                className="px-6 py-2 rounded-md bg-[#0F58F9] text-white text-sm font-bold hover:bg-[#0D4AD1] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading || isCreatingFinal}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5423 12.1718C11.1071 12.3383 10.8704 12.5762 10.702 13.0106C10.5353 12.5762 10.297 12.3399 9.86183 12.1718C10.297 12.0053 10.5337 11.769 10.702 11.3329C10.8688 11.7674 11.1071 12.0037 11.5423 12.1718ZM10.7628 5.37068C11.1399 3.9685 11.6552 3.45294 13.0612 3.07596C11.6568 2.6995 11.1404 2.18501 10.7628 0.78125C10.3858 2.18343 9.87044 2.69899 8.46442 3.07596C9.86886 3.45243 10.3852 3.96692 10.7628 5.37068ZM11.1732 8.26481C11.1732 8.1327 11.1044 7.9732 10.9118 7.9195C9.33637 7.47967 8.34932 6.97753 7.61233 6.24235C6.8754 5.50661 6.37139 4.52108 5.93249 2.94815C5.8787 2.75589 5.71894 2.68715 5.58662 2.68715C5.4543 2.68715 5.29454 2.75589 5.24076 2.94815C4.80022 4.52108 4.29727 5.50655 3.56092 6.24235C2.82291 6.97918 1.83688 7.4813 0.261415 7.9195C0.0688515 7.9732 0 8.13271 0 8.26481C0 8.39692 0.0688515 8.55643 0.261415 8.61013C1.83688 9.04996 2.82393 9.5521 3.56092 10.2873C4.29892 11.0241 4.80186 12.0085 5.24076 13.5815C5.29455 13.7737 5.45431 13.8425 5.58662 13.8425C5.71895 13.8425 5.87871 13.7737 5.93249 13.5815C6.37303 12.0085 6.87598 11.0231 7.61233 10.2873C8.35034 9.55045 9.33637 9.04832 10.9118 8.61013C11.1044 8.55642 11.1732 8.39692 11.1732 8.26481Z" fill="white"/>
                </svg>
                <span className="select-none font-semibold">{t('interface.generate.generateQuiz', 'Generate Quiz')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    <style jsx global>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    {/* Make cursor a pointer (hand) over all obvious clickable elements */}
    <style jsx global>{`
      button,
      select,
      input[type="checkbox"],
      label[role="button"],
      label[for] {
        cursor: pointer;
      }
    `}</style>
      {isCreatingFinal && (
        <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
          <LoadingAnimation message={t('interface.generate.finalizingQuiz', 'Finalizing quiz...')} />
        </div>
      )}
    </>
  );
} 