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
import { trackCreateProduct, trackAIAgentUsed } from "../../../lib/mixpanelClient"
import { AiAgent } from "@/components/ui/ai-agent";
import InsufficientCreditsModal from "../../../components/InsufficientCreditsModal";
import ManageAddonsModal from "../../../components/AddOnsModal";

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

  // Total lessons & credit cost (stored in sessionStorage)
  const storedCreditsData = sessionStorage.getItem('creditsReference');
  const creditsRequired = storedCreditsData ? JSON.parse(storedCreditsData).credits_reference.find(
    (item: any) => item.content_type === "quiz"
  )?.credits_amount : 7;
  
  // Modal states for insufficient credits
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [isHandlingInsufficientCredits, setIsHandlingInsufficientCredits] = useState(false);

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
  
  // State for editing question content
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [editedContents, setEditedContents] = useState<{ [key: number]: string }>({});
  const [originalContents, setOriginalContents] = useState<{ [key: number]: string }>({});
  const nextEditingContentIdRef = useRef<number | null>(null);

  // State for additional questions
  const [additionalQuestions, setAdditionalQuestions] = useState<{ id: string; title: string; content: string }[]>([]);

  // NEW: Track user edits like in Course Outline
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [originalQuizData, setOriginalQuizData] = useState<string>("");
  const [originalJsonResponse, setOriginalJsonResponse] = useState<string>("");

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

  // Helper function to convert quiz JSON to display format
  // IMPORTANT: Must match the format expected by parseQuizIntoQuestions()
  const convertQuizJsonToDisplay = (parsed: any): string => {
    let displayText = `# ${parsed.quizTitle}\n\n`;
    
    parsed.questions.forEach((q: any, index: number) => {
      // Use the format expected by parseQuizIntoQuestions: "1. **Question text**"
      displayText += `${index + 1}. **${q.question_text}**\n\n`;
      
      if (q.question_type === 'multiple-choice' && q.options) {
        q.options.forEach((opt: any) => {
          displayText += `${opt.id}) ${opt.text}\n`;
        });
        displayText += `\n**Correct:** ${q.correct_option_id}\n`;
      } else if (q.question_type === 'multi-select' && q.options) {
        q.options.forEach((opt: any) => {
          displayText += `${opt.id}) ${opt.text}\n`;
        });
        displayText += `\n**Correct:** ${q.correct_option_ids?.join(', ') || 'N/A'}\n`;
      } else if (q.question_type === 'matching' && q.prompts && q.options) {
        displayText += `**Match the following:**\n`;
        q.prompts.forEach((p: any) => {
          displayText += `${p.id}) ${p.text}\n`;
        });
        displayText += `\n**With:**\n`;
        q.options.forEach((opt: any) => {
          displayText += `${opt.id}) ${opt.text}\n`;
        });
        displayText += `\n**Correct matches:** ${JSON.stringify(q.correct_matches)}\n`;
      } else if (q.question_type === 'sorting' && q.items_to_sort) {
        displayText += `**Arrange in order:**\n`;
        q.items_to_sort.forEach((item: any) => {
          displayText += `- ${item.text}\n`;
        });
        displayText += `\n**Correct order:** ${q.correct_order?.join(' → ') || 'N/A'}\n`;
      } else if (q.question_type === 'open-answer' && q.acceptable_answers) {
        displayText += `**Acceptable answers:**\n`;
        q.acceptable_answers.forEach((ans: string) => {
          displayText += `- ${ans}\n`;
        });
      }
      
      if (q.explanation) {
        displayText += `\n**Explanation:** ${q.explanation}\n`;
      }
      displayText += '\n---\n\n';
    });
    
    return displayText;
  };

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
          content: `Explanation:\n${explanation}`

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

  // Handle question content editing
  const handleContentEdit = (questionIndex: number, newContent: string) => {
    setEditedContents(prev => ({
      ...prev,
      [questionIndex]: newContent
    }));

    // Store original content if not already stored
    if (!originalContents[questionIndex] && questionIndex < questionList.length) {
      setOriginalContents(prev => ({
        ...prev,
        [questionIndex]: questionList[questionIndex].content
      }));
    }

    setHasUserEdits(true);
  };

  const handleContentSave = (questionIndex: number, finalContent?: string) => {
    setEditingContentId(null);

    // If we're switching to another content, don't save
    if (nextEditingContentIdRef.current !== null) {
      nextEditingContentIdRef.current = null;
      return;
    }

    const newContent = (finalContent ?? editedContents[questionIndex]);
    if (!newContent) {
      return;
    }

    // Update the content in the main quiz data string
    updateQuizContentWithNewContent(questionIndex, newContent);
  };

  const updateQuizContentWithNewContent = (questionIndex: number, newContent: string) => {
    if (!newContent && newContent !== '') return;

    const questions = parseQuizIntoQuestions(quizData);
    if (questionIndex >= questions.length) return;

    const oldContent = questions[questionIndex].content;

    // Find and replace the old content with new content
    const escapedOldContent = escapeRegExp(oldContent);
    const pattern = new RegExp(escapedOldContent, 'g');

    let updatedQuizData = quizData;
    if (pattern.test(updatedQuizData)) {
      updatedQuizData = updatedQuizData.replace(pattern, newContent);
    }

    setQuizData(updatedQuizData);

    // Clear the edited content since it's now part of the main quiz data
    setEditedContents(prev => {
      const newContents = { ...prev };
      delete newContents[questionIndex];
      return newContents;
    });

    // Mark that content has been updated
    if (updatedQuizData !== quizData) {
      setHasUserEdits(true);
    }
  };

  const handleContentCancel = (questionIndex: number) => {
    setEditedContents(prev => {
      const newContents = { ...prev };
      delete newContents[questionIndex];
      return newContents;
    });
    setEditingContentId(null);
  };

  const getContentForQuestion = (question: any, index: number) => {
    return editedContents[index] !== undefined ? editedContents[index] : question.content;
  };

  // Handle adding new question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      title: "New Question",
      content: "Explanation:\nAdd your explanation here..."
    };
    setAdditionalQuestions(prev => [...prev, newQuestion]);
    setHasUserEdits(true);
  };

  // Handle editing additional question title
  const handleAdditionalQuestionTitleEdit = (questionId: string, newTitle: string) => {
    setAdditionalQuestions(prev => prev.map(question => 
      question.id === questionId ? { ...question, title: newTitle } : question
    ));
    setHasUserEdits(true);
  };

  // Handle editing additional question content
  const handleAdditionalQuestionContentEdit = (questionId: string, newContent: string) => {
    setAdditionalQuestions(prev => prev.map(question => 
      question.id === questionId ? { ...question, content: newContent } : question
    ));
    setHasUserEdits(true);
  };

  // Handle deleting additional question
  const handleDeleteAdditionalQuestion = (questionId: string) => {
    setAdditionalQuestions(prev => prev.filter(question => question.id !== questionId));
    setHasUserEdits(true);
  };

  // Function to render question content with proper formatting
  const renderQuestionContent = (content: string) => {
    if (!content) return content;

    // Split content into lines and process each line
    const lines = content.split('\n');
    const processedLines = lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check if this is an "Explanation:" label line
      if (trimmedLine === 'Explanation:' || trimmedLine === 'Explicación:' || 
          trimmedLine === 'Explication:' || trimmedLine === 'Erklärung:' ||
          trimmedLine === 'Spiegazione:' || trimmedLine === 'Explicação:' ||
          trimmedLine === 'Пояснення:' || trimmedLine === 'Пояснение:') {
        return (
          <div key={lineIndex} className="mb-2">
            <span className="text-xs font-medium leading-[140%] -ml-2 text-[#4D4D4D]">{trimmedLine}</span>
          </div>
        );
      }
      
      // For regular lines, return as is
      if (trimmedLine) {
        return (
          <div key={lineIndex} className="mb-2">
            <span className="text-sm font-normal leading-[140%] text-[#171718]">{line}</span>
          </div>
        );
      }
      
      // For empty lines, return a line break
      return <br key={lineIndex} />;
    });

    return processedLines;
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

        let lastDataTime = Date.now();
        let heartbeatInterval: NodeJS.Timeout | null = null;
        let heartbeatStarted = false;
        
        // Timeout settings
        const STREAM_TIMEOUT = 30000; // 30 seconds without data
        const HEARTBEAT_INTERVAL = 5000; // Check every 5 seconds

        // Cleanup function
        const cleanup = () => {
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
        };

        // Setup heartbeat to check for stream timeout
        const setupHeartbeat = () => {
          heartbeatInterval = setInterval(() => {
            const timeSinceLastData = Date.now() - lastDataTime;
            if (timeSinceLastData > STREAM_TIMEOUT) {
              console.warn('Stream timeout: No data received for', timeSinceLastData, 'ms');
              cleanup();
              abortController.abort();
              
              // Retry the request if we haven't exceeded max attempts
              if (attempt < maxRetries) {
                console.log(`Retrying due to stream timeout (attempt ${attempt + 1}/3)`);
                setTimeout(() => startPreview(attempt + 1), 1500 * (attempt + 1));
                return;
              }
              
              setError("Failed to generate quiz – please try again later.");
              setLoading(false);
            }
          }, HEARTBEAT_INTERVAL);
        };

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
          let accumulatedJsonText = "";

          while (true) {
            const { done, value } = await reader.read();

            // Update last data time and reset timeout on any data received
            lastDataTime = Date.now();

            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                try {
                  const pkt = JSON.parse(buffer.trim());
                  if (pkt.type === "delta") {
                    // Start heartbeat only after receiving first delta package
                    if (!heartbeatStarted) {
                      heartbeatStarted = true;
                      setupHeartbeat();
                    }
                    accumulatedText += pkt.text;
                    accumulatedJsonText += pkt.text;
                  }
                } catch (e) {
                  // If not JSON, treat as plain text
                  accumulatedText += buffer;
                  accumulatedJsonText += buffer;
                }
              }
              
              console.log('[QUIZ_STREAM_COMPLETE] ========== STREAMING FINISHED ==========');
              console.log('[QUIZ_STREAM_COMPLETE] Total accumulated JSON length:', accumulatedJsonText.length);
              console.log('[QUIZ_STREAM_COMPLETE] Full accumulated JSON:');
              console.log(accumulatedJsonText);
              console.log('[QUIZ_STREAM_COMPLETE] ========================================');
              
              // Try final parse
              try {
                const finalParsed = JSON.parse(accumulatedJsonText);
                console.log('[QUIZ_STREAM_COMPLETE] ✅ Final JSON parse successful');
                console.log('[QUIZ_STREAM_COMPLETE] Has quizTitle:', !!finalParsed.quizTitle, 'Has questions:', !!finalParsed.questions);
                console.log('[QUIZ_STREAM_COMPLETE] Question count:', finalParsed.questions?.length);
              } catch (e) {
                console.log('[QUIZ_STREAM_COMPLETE] ❌ Final JSON parse FAILED:', e instanceof Error ? e.message : String(e));
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
                  // Start heartbeat only after receiving first delta package
                  if (!heartbeatStarted) {
                    heartbeatStarted = true;
                    setupHeartbeat();
                  }
                  accumulatedText += pkt.text;
                  accumulatedJsonText += pkt.text;
                } else if (pkt.type === "done") {
                  setStreamDone(true);
                  break;
                } else if (pkt.type === "error") {
                  throw new Error(pkt.text || "Unknown error");
                }
              } catch (e) {
                // If not JSON, treat as plain text
                accumulatedText += line;
                accumulatedJsonText += line;
              }
            }

            // LIVE PREVIEW: Show content immediately during streaming (like presentations do)
            if (accumulatedText) {
              console.log('[QUIZ_PREVIEW] 📺 Showing accumulated text during streaming, length:', accumulatedText.length);
              
              // Try to parse as complete JSON first
              let displayText = "";
              try {
                const parsed = JSON.parse(accumulatedText);
                if (parsed && typeof parsed === 'object' && parsed.quizTitle && parsed.questions) {
                  console.log('[QUIZ_JSON_STREAM] ✅ Complete JSON parsed, questions:', parsed.questions.length);
                  displayText = convertQuizJsonToDisplay(parsed);
                  setOriginalJsonResponse(accumulatedText);
                  setOriginalQuizData(displayText);
                } else {
                  throw new Error("Missing required fields");
                }
              } catch (e) {
                // JSON incomplete or invalid - create simple readable preview from raw text
                console.log('[QUIZ_PREVIEW] 📝 Creating readable preview from raw text');
                
                // Extract quiz title if available
                const titleMatch = accumulatedText.match(/"quizTitle"\s*:\s*"([^"]+)"/);
                const title = titleMatch ? titleMatch[1] : "Generating Quiz...";
                
                // Extract all question_text fields
                const questionMatches = accumulatedText.match(/"question_text"\s*:\s*"([^"]+)"/g);
                const questionCount = questionMatches ? questionMatches.length : 0;
                
                // Extract all explanation fields
                const explanationMatches = accumulatedText.match(/"explanation"\s*:\s*"([^"]+)"/g);
                
                // Create simple markdown preview
                displayText = `# ${title}\n\n`;
                if (questionCount > 0) {
                  displayText += `**Generating ${questionCount} question${questionCount > 1 ? 's' : ''}...**\n\n`;
                  
                  // Show partial questions with explanations if available
                  questionMatches?.forEach((match, index) => {
                    const questionText = match.match(/"question_text"\s*:\s*"([^"]+)"/)?.[1];
                    if (questionText) {
                      displayText += `${index + 1}. **${questionText}**\n\n`;
                      
                      // Add explanation if available for this question
                      if (explanationMatches && explanationMatches[index]) {
                        const explanation = explanationMatches[index].match(/"explanation"\s*:\s*"([^"]+)"/)?.[1];
                        if (explanation) {
                          displayText += `**Explanation:** ${explanation}\n\n`;
                        }
                      }
                      
                      displayText += '---\n\n';
                    }
                  });
                } else {
                  displayText += "**Generating questions...**\n\n";
                }
              }
              
              setQuizData(displayText);
              
              // Make textarea visible as soon as we have content
              const hasMeaningfulText = /\S/.test(accumulatedText);
            if (hasMeaningfulText && !textareaVisible) {
                console.log('[QUIZ_PREVIEW] ✅ Making textarea visible');
              setTextareaVisible(true);
              }
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
          // Always cleanup timeouts
          cleanup();

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

  // Fallback: Process plain text content after streaming is done (only if JSON wasn't already parsed)
  useEffect(() => {
    if (streamDone && !firstLineRemoved && !originalJsonResponse) {
      console.log('[QUIZ_FALLBACK] Processing plain text content, length:', quizData.length);
      
      // Original logic for plain text (only runs if JSON wasn't parsed during streaming)
      const parts = quizData.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setQuizData(trimmed);

        // Save original content for change detection
        setOriginalQuizData(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, quizData, originalJsonResponse]);


  const handleCreateFinal = async () => {
    if (!quizData.trim()) return;

    // Lightweight credits pre-check to avoid starting finalization when balance is 0
    try {
      const creditsRes = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, { cache: 'no-store', credentials: 'same-origin' });
      if (creditsRes.ok) {
        const credits = await creditsRes.json();
        if (!credits || typeof credits.credits_balance !== 'number' || credits.credits_balance <= 0) {
          setShowInsufficientCreditsModal(true);
          setIsCreatingFinal(false);
          setIsHandlingInsufficientCredits(true);
          return;
        }
      }
    } catch (_) {
      // On pre-check failure, proceed to server-side validation (will still 402 if insufficient)
    }

    setIsCreatingFinal(true);
    const activeProductType = sessionStorage.getItem('activeProductType');
    try {
      // Like presentations: send original JSON as aiResponse if available, otherwise send display text
      let contentToSend = originalJsonResponse || quizData;
      let isCleanContent = false;

      console.log('[QUIZ_FINALIZE] originalJsonResponse available:', !!originalJsonResponse, 'length:', originalJsonResponse?.length || 0);
      console.log('[QUIZ_FINALIZE] Sending as aiResponse:', originalJsonResponse ? 'JSON' : 'display text');

      if (hasUserEdits && editedTitleIds.size > 0) {
        // User edited question titles - send clean questions for regeneration
        contentToSend = createCleanQuestionsContent(quizData);
        isCleanContent = true;
        console.log("Sending clean questions for regeneration:", contentToSend);
      }

      // Add additional questions to content
      if (additionalQuestions.length > 0) {
        const additionalContent = additionalQuestions.map((q, idx) => {
          const questionNumber = questionList.length + idx + 1;
          return `\n\n${questionNumber}. **${q.title}**\n\n${q.content}`;
        }).join('');
        contentToSend += additionalContent;
      }

      const payloadToSend = {
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
          // NEW: Send indices of edited questions for selective regeneration
          editedQuestionIndices: isCleanContent ? Array.from(editedTitleIds).join(',') : undefined,
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

      console.log('[QUIZ_FINALIZE] Payload being sent:', {
        aiResponseIsJSON: originalJsonResponse ? true : false,
        aiResponseLength: payloadToSend.aiResponse?.length || 0
      });

      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadToSend),
      });

      if (!response.ok) {
        // Check for insufficient credits (402)
        if (response.status === 402) {
          setIsCreatingFinal(false); // Stop the finalization animation
          setIsHandlingInsufficientCredits(true); // Prevent regeneration
          setShowInsufficientCreditsModal(true);
          return;
        }
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
    
    // Heartbeat variables for edit function
    let lastDataTime = Date.now();
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let heartbeatStarted = false;
    
    // Timeout settings
    const STREAM_TIMEOUT = 30000; // 30 seconds without data
    const HEARTBEAT_INTERVAL = 5000; // Check every 5 seconds

    // Cleanup function
    const cleanup = () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    };

    // Setup heartbeat to check for stream timeout
    const setupHeartbeat = () => {
      heartbeatInterval = setInterval(() => {
        const timeSinceLastData = Date.now() - lastDataTime;
        if (timeSinceLastData > STREAM_TIMEOUT) {
          console.warn('Stream timeout: No data received for', timeSinceLastData, 'ms');
          cleanup();
          setError("Failed to generate quiz – please try again later.");
          setLoadingEdit(false);
        }
      }, HEARTBEAT_INTERVAL);
    };
    
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

      // Add additional questions to content
      if (additionalQuestions.length > 0) {
        const additionalContent = additionalQuestions.map((q, idx) => {
          const questionNumber = questionList.length + idx + 1;
          return `\n\n${questionNumber}. **${q.title}**\n\n${q.content}`;
        }).join('');
        contentToSend += additionalContent;
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
                // Start heartbeat only after receiving first delta package
                if (!heartbeatStarted) {
                  heartbeatStarted = true;
                  setupHeartbeat();
                }
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
        
        // Update last data time on any data received
        lastDataTime = Date.now();

        // Split by newlines and process complete chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const pkt = JSON.parse(line);
            if (pkt.type === "delta") {
              // Start heartbeat only after receiving first delta package
              if (!heartbeatStarted) {
                heartbeatStarted = true;
                setupHeartbeat();
              }
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

      trackAIAgentUsed("Completed");
      // NEW: Mark that user has made edits after AI editing
      setHasUserEdits(true);

      setEditPrompt("");
      setSelectedExamples([]);
    } catch (error: any) {
      trackAIAgentUsed("Failed");
      console.error('Edit error:', error);
      setError(error.message || 'An error occurred during editing');
    } finally {
      // Always cleanup timeouts
      cleanup();
      setLoadingEdit(false);
    }
  };

  return (
    <>
    <div className="flex w-full min-h-screen relative">
      <main className="flex-1 py-24 pb-24 px-4 flex flex-col items-center bg-white relative overflow-hidden transition-all duration-300 ease-in-out" style={{
        marginRight: showAdvanced ? '400px' : '0'
      }}>
        {/* Decorative gradient backgrounds */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: '1000px',
            height: '900px',
            top: '-500px',
            left: '-150px',
            borderRadius: '450px',
            background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.9) 0%, rgba(56, 23, 255, 0.9) 100%)',
            transform: 'rotate(-300deg)',
            filter: 'blur(200px)',
            opacity: '40%',
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
            background: '#FFFFFF'
          }}
        >
          <span>&lt;</span>
          <span>{t('interface.generate.back', 'Back')}</span>
        </Link>

        <div className="w-full max-w-4xl flex flex-col gap-6 text-gray-900 relative z-10">

          <h1 className="text-center text-2xl sora-font-semibold leading-none text-[#4B4B51] mb-2">{t('interface.generate.quizOutlinePreview', 'Quiz outline preview')}</h1>

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
                  className="rounded-t-[8px] text-white text-lg font-medium"
                  style={{ backgroundColor: '#0F58F999' }}
                >
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
                          className="w-full px-7 !border-none py-5 rounded-lg text-lg text-white text-xl resize-none overflow-hidden min-h-[56px] focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 cursor-pointer !shadow-none"
                          style={{ background: "#6E9BFB"}}
                        />
                      </div>
                    </div>
                  )}
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
                      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#CCCCCC] rounded-t-lg">
                        <span className="text-[#0D001B] font-bold text-base">{idx + 1}.</span>
                        <div className="flex-1">
                          {editingQuestionId === idx ? (
                            <div className="relative group">
                              <Input
                                type="text"
                                value={editedTitles[idx] || question.title}
                                onChange={(e) => handleTitleEdit(idx, e.target.value)}
                                className="text-[#0D001B] font-bold text-base leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
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
                                className="text-[#0D001B] font-bold text-base leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                                disabled={!streamDone}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content preview */}
                      {question.content && (
                        <div 
                          className={`rounded !text-sm p-2 pl-6 pt-4 -m-2 ${!streamDone && 'opacity-50'}`} // ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}
                        >
                          {renderQuestionContent(getContentForQuestion(question, idx))}
                        </div>
                      )}
                     </div>
                   ))}

                   {/* Additional questions */}
                   {additionalQuestions.map((question, idx: number) => (
                     <div key={question.id} className="bg-[#FFFFFF] rounded-lg overflow-hidden transition-shadow duration-200" style={{ border: '1px solid #CCCCCC' }}>
                       {/* Question header with title */}
                       <div className="flex items-center gap-1 px-4 py-2 border-b border-[#CCCCCC] rounded-t-lg">
                         <span className="text-[#0D001B] font-semibold text-base">{questionList.length + idx + 1}.</span>
                         <div className="flex-1">
                           <Input
                             type="text"
                             value={question.title}
                             onChange={(e) => handleAdditionalQuestionTitleEdit(question.id, e.target.value)}
                             className="text-[#0D001B] font-bold !text-base leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                             placeholder={t('interface.generate.questionTitlePlaceholder', 'Question title...')}
                           />
                  </div>
                  <button
                    type="button"
                           onClick={() => handleDeleteAdditionalQuestion(question.id)}
                           className="text-red-500 hover:text-red-700 text-sm"
                  >
                           {t('actions.delete', 'Delete')}
                  </button>
                </div>

                       {/* Question content */}
                       <div className="px-5 pb-4 pt-4">
                         <Textarea
                           value={question.content}
                           onChange={(e) => handleAdditionalQuestionContentEdit(question.id, e.target.value)}
                           className="w-full !text-sm font-light leading-[140%] text-[#171718] resize-none min-h-[100px] border-transparent focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 bg-[#FFFFFF] cursor-pointer"
                           placeholder={t('interface.generate.addContentPlaceholder', 'Add your content here...')}
                         />
                       </div>
                     </div>
                   ))}

                  {/* Add Question Button */}
                  {streamDone && (
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full px-4 py-1 border border-gray-300 rounded-lg text-xs bg-[#FFFFFF] text-[#719AF5] font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">+</span>
                      <span>{t('interface.generate.addQuestion', 'Add Question')}</span>
                    </button>
                  )}
                   
                  <div className="flex items-center justify-between text-xs text-[#A5A5A5] py-2 rounded-b-[8px]">
                   <span className="select-none">{questionList.length + additionalQuestions.length} {t('interface.generate.questionTotal', 'question total')}</span>
                   <span className="flex items-center gap-1">
                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <circle cx="8" cy="8" r="7" stroke="#E0E0E0" strokeWidth="2" fill="none"/>
                       <circle cx="8" cy="8" r="7" stroke="#0F58F9" strokeWidth="2" fill="none"
                         strokeDasharray={`${2 * Math.PI * 7}`}
                         strokeDashoffset={`${2 * Math.PI * 7 * (1 - Math.min(quizData.length / 50000, 1))}`}
                         transform="rotate(-90 8 8)"
                         strokeLinecap="round"
                       />
                     </svg>
                     {quizData.length}/50000
                   </span>
                 </div>
                 </div>

                 {/* Question count and character count footer */}
                 
              </div>
            )}
          </section>

        </div> {/* end inner wrapper */}

      {/* Full-width generate footer bar */}
      {!loading && streamDone && quizData && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-3 px-6 flex items-center justify-center">
          {/* Credits required */}
          <div className="absolute left-6 flex items-center gap-2 text-sm font-semibold text-[#A5A5A5] select-none">
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
            {!showAdvanced && (
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
            )}
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

    {/* AI Agent Side Panel - slides from right */}
    <div 
      className="fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 flex flex-col"
      style={{
        width: '400px',
        backgroundColor: '#F9F9F9',
        transform: showAdvanced ? 'translateX(0)' : 'translateX(100%)',
        borderLeft: '1px solid #CCCCCC'
      }}
    >
      {streamDone && quizData && (
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
          onClose={() => setShowAdvanced(false)}
          advancedSectionRef={advancedSectionRef}
          placeholder={t('interface.generate.describeImprovements', "Describe what you'd like to improve...")}
          buttonText={t('interface.edit', 'Edit')}
          hasStartedChat={aiAgentChatStarted}
          setHasStartedChat={setAiAgentChatStarted}
          lastUserMessage={aiAgentLastMessage}
          setLastUserMessage={setAiAgentLastMessage}
        />
      )}
    </div>
    </div>
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
      
      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => {
          setShowInsufficientCreditsModal(false);
          setIsHandlingInsufficientCredits(false); // Reset flag when modal is closed
        }}
        onBuyMore={() => {
          setShowInsufficientCreditsModal(false);
          setIsHandlingInsufficientCredits(false); // Reset flag when modal is closed
          setShowAddonsModal(true);
        }}
      />
      
      {/* Add-ons Modal */}
      <ManageAddonsModal 
        isOpen={showAddonsModal} 
        onClose={() => setShowAddonsModal(false)} 
      />
    </>
  );
} 