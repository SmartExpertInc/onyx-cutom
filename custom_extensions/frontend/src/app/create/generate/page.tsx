"use client";
// @ts-nocheck

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Shuffle, Sparkles, Plus, FileText, ChevronDown, Search, FolderIcon, Globe, FileQuestion, MessageCircleQuestion, PanelsLeftBottom, Paintbrush, ClipboardList, Network, RulerDimensionLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { generatePromptId } from "../../../utils/promptUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateCard } from "@/components/ui/generate-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, CustomPillSelector, CustomMultiSelector } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HeadTextCustom } from "@/components/ui/head-text-custom";
import useFeaturePermission from "../../../hooks/useFeaturePermission";

// Inline SVG icon components
const CourseOutlineIcon: React.FC<{ size?: number }> = ({ size = 35 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <path d="M12.37 8.87988H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.38 8.87988L7.13 9.62988L9.38 7.37988" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.37 15.8799H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.38 15.8799L7.13 16.6299L9.38 14.3799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const LessonPresentationIcon: React.FC<{ size?: number }> = ({ size = 35 }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3H12H17C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7V10V13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17H12H7C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13V10V7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path> <path d="M9 21L11.625 17.5V17.5C11.8125 17.25 12.1875 17.25 12.375 17.5V17.5L15 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 7L12 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16 8L16 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 9L8 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const QuizIcon: React.FC<{ size?: number }> = ({ size = 35 }) => (
<svg width={size} height={size} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
<g id="SVGRepo_iconCarrier"> 
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"></circle>
  <path d="M10.125 8.875C10.125 7.83947 10.9645 7 12 7C13.0355 7 13.875 7.83947 13.875 8.875C13.875 9.56245 13.505 10.1635 12.9534 10.4899C12.478 10.7711 12 11.1977 12 11.75V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
  <circle cx="12" cy="16" r="1" fill="currentColor"></circle> 
</g>
</svg>
);

const VideoScriptIcon: React.FC<{ size?: number }> = ({ size = 35 }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const TextPresentationIcon: React.FC<{ size?: number }> = ({ size = 35 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14V7C20 5.34315 18.6569 4 17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H13.5M20 14L13.5 20M20 14H15.5C14.3954 14 13.5 14.8954 13.5 16V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8 12H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);



function GenerateProductPicker() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromFiles = searchParams?.get('fromFiles') === 'true';
  const isFromKnowledgeBase = searchParams?.get('fromKnowledgeBase') === 'true';
  const folderIds = searchParams?.get('folderIds')?.split(',').filter(Boolean) || [];
  const fileIds = searchParams?.get('fileIds')?.split(',').filter(Boolean) || [];
  const isFromText = searchParams?.get('fromText') === 'true';
  const textMode = searchParams?.get('textMode') as 'context' | 'base' | null;
  // const { isEnabled: videoLessonEnabled } = useFeaturePermission('video_lesson');
  const videoLessonEnabled = true; // Enabled for development
  
  // NEW: Connector context from URL parameters and sessionStorage
  const isFromConnectors = searchParams?.get('fromConnectors') === 'true';
  const connectorIds = searchParams?.get('connectorIds')?.split(',').filter(Boolean) || [];
  const connectorSources = searchParams?.get('connectorSources')?.split(',').filter(Boolean) || [];
  const [connectorContext, setConnectorContext] = useState<{
    fromConnectors: boolean;
    connectorIds: string[];
    connectorSources: string[];
  } | null>(null);

  // Also carry over any pre-selected files coming from Smart Drive
  const selectedFiles = searchParams?.get('selectedFiles')
    ?.split(',')
    .filter(Boolean)
    .map(file => decodeURIComponent(file)) || [];

  // Load connector context from sessionStorage
  useEffect(() => {
    if (isFromConnectors) {
      try {
        const storedConnectorContext = sessionStorage.getItem('connectorContext');
        if (storedConnectorContext) {
          const context = JSON.parse(storedConnectorContext);
          // Check if data is recent (within 1 hour)
          if (context.timestamp && (Date.now() - context.timestamp < 3600000)) {
            setConnectorContext(context);
          } else {
            sessionStorage.removeItem('connectorContext');
          }
        } else {
          // Use URL parameters if sessionStorage is not available
          setConnectorContext({
            fromConnectors: true,
            connectorIds,
            connectorSources
          });
        }
      } catch (error) {
        console.error('Error retrieving connector context:', error);
        // Fallback to URL parameters
        setConnectorContext({
          fromConnectors: true,
          connectorIds,
          connectorSources
        });
      }
    }
  }, [isFromConnectors, connectorIds.join(','), connectorSources.join(',')]);
  
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
          sessionStorage.removeItem('folderContext');
        }
      }
    } catch (error) {
      console.error('Error retrieving folder context:', error);
    }
  }, []);
  
  // Retrieve user text from sessionStorage
  const [userText, setUserText] = useState('');
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
  
  // For prompt input and filters we keep in state and navigate later
  const [prompt, setPrompt] = useState("");
  const [modulesCount, setModulesCount] = useState(4);
  const [lessonsPerModule, setLessonsPerModule] = useState(`3-4 ${t('interface.generate.perModule', 'per module')}`);
  const [language, setLanguage] = useState(t('interface.english', 'English'));

  // All filters are always true (removed dropdown functionality)
  const filters = {
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    time: true,
  };

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

  const stylePurposes = {
    headlines: t('interface.generate.headlinesPurpose', 'Section titles and headings'),
    paragraphs: t('interface.generate.paragraphsPurpose', 'Regular text blocks'),
    bullet_lists: t('interface.generate.bulletListsPurpose', 'Unordered lists with bullet points'),
    numbered_lists: t('interface.generate.numberedListsPurpose', 'Ordered lists with numbers'),
    alerts: t('interface.generate.alertsPurpose', 'Important warnings or tips'),
    recommendations: t('interface.generate.recommendationsPurpose', 'Actionable advice'),
    section_breaks: t('interface.generate.sectionBreaksPurpose', 'Visual separators between sections'),
    icons: t('interface.generate.iconsPurpose', 'Emojis and visual elements'),
    important_sections: t('interface.generate.importantSectionsPurpose', 'Highlighted critical content')
  };

  const getRandomExamples = () => {
    const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };
  const [examples, setExamples] = useState<string[]>(getRandomExamples());

  const shuffleExamples = () => setExamples(getRandomExamples());

  const CUSTOM_BACKEND_URL =
    process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

  const handleCourseOutlineStart = async () => {
    if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;

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

    let finalPrompt = prompt.trim();
    if (isFromFiles && !finalPrompt) {
      finalPrompt = "Create educational content from the provided files";
    } else if (isFromText && !finalPrompt) {
      finalPrompt = textMode === 'context' 
        ? "Create educational content using the provided text as context"
        : "Create educational content based on the provided text structure";
    } else if (isFromKnowledgeBase && !finalPrompt) {
      finalPrompt = "Create educational content by searching the Knowledge Base";
    }

          // Store prompt in sessionStorage if it's long (over 500 characters)
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }

    const params = new URLSearchParams({
      prompt: promptReference,
      modules: String(modulesCount),
      lessons: lessonsPerModule,
      lang: language,
      knowledgeCheck: filters.knowledgeCheck ? '1' : '0',
      contentAvailability: filters.contentAvailability ? '1' : '0',
      informationSource: filters.informationSource ? '1' : '0',
      time: filters.time ? '1' : '0',
    });
    if (chatId) params.set("chatId", chatId);
    
    // Add file context if coming from files
    if (isFromFiles) {
      params.set("fromFiles", "true");
      if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
      if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
    }
    
    // Add Knowledge Base context if coming from Knowledge Base
    if (isFromKnowledgeBase) {
      params.set("fromKnowledgeBase", "true");
    }
    
    // Add text context if coming from text
    if (isFromText) {
      params.set("fromText", "true");
      params.set("textMode", textMode || 'context');
      // userText stays in sessionStorage - don't pass via URL
    }

    // Add connector context if coming from connectors
    const effectiveFromConnectors = (connectorContext?.fromConnectors) || isFromConnectors || (selectedFiles.length > 0);
    const effectiveConnectorIds = (connectorContext?.connectorIds?.length ? connectorContext.connectorIds : connectorIds);
    const effectiveConnectorSources = (connectorContext?.connectorSources?.length ? connectorContext.connectorSources : connectorSources);

    if (effectiveFromConnectors) {
      params.set("fromConnectors", "true");
      if (effectiveConnectorIds.length > 0) params.set("connectorIds", effectiveConnectorIds.join(','));
      if (effectiveConnectorSources.length > 0) params.set("connectorSources", effectiveConnectorSources.join(','));
    }

    // Forward selected files chosen in Smart Drive
    if (selectedFiles.length > 0) {
      params.set("selectedFiles", selectedFiles.join(','));
    }

    // Pass ISO language code to preview page
    params.set("lang", mapLanguageToCode(language));

    router.push(`/create/course-outline?${params.toString()}`);
  };

  // Ref for auto-resizing the prompt textarea
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Adjust the textarea height as the prompt changes
  useEffect(() => {
    if (promptRef.current) {
      // Reset height to shrink when deleting text
      promptRef.current.style.height = "auto";
      // Set height based on scroll height
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const [activeProduct, setActiveProduct] = useState<"Course" | "Video Lesson" | "Presentation" | "Quiz" | "One-Pager">("Course");

  // Handle URL parameters and sessionStorage for pre-selecting product
  useEffect(() => {
    const product = searchParams?.get('product');
    const lessonType = searchParams?.get('lessonType');
    const lessonTitle = searchParams?.get('lessonTitle');
    const moduleName = searchParams?.get('moduleName');
    const lessonNumber = searchParams?.get('lessonNumber');

    // Check both URL parameters and sessionStorage for lesson/quiz context
    let lessonContext = null;
    
    if (product === 'lesson' && lessonType && lessonTitle && moduleName && lessonNumber) {
      lessonContext = { product, lessonType, lessonTitle, moduleName, lessonNumber };
    } else if (product === 'quiz' && lessonType && lessonTitle && moduleName && lessonNumber) {
      lessonContext = { product, lessonType, lessonTitle, moduleName, lessonNumber };
    } else if (product === 'text-presentation' && lessonType && lessonTitle && moduleName && lessonNumber) {
      lessonContext = { product, lessonType, lessonTitle, moduleName, lessonNumber };
    } else {
      // Try to get from sessionStorage
      try {
        const lessonContextData = sessionStorage.getItem('lessonContext');
        if (lessonContextData) {
          const storedContext = JSON.parse(lessonContextData);
          // Check if data is recent (within 1 hour)
          if (storedContext.timestamp && (Date.now() - storedContext.timestamp < 3600000)) {
            lessonContext = storedContext;
          }
        }
      } catch (error) {
        console.error('Error retrieving lesson context:', error);
      }
    }

    if (lessonContext) {
      if (lessonContext.product === 'quiz') {
        setActiveProduct("Quiz");
        
        // Since we have quiz context from the modal, automatically set useExistingQuizOutline to true
        // This bypasses the "Do you want to create a quiz from an existing Course Outline?" question
        setUseExistingQuizOutline(true);
        
        // Store quiz context for pre-selecting dropdowns after outlines are loaded
        sessionStorage.setItem('lessonContextForDropdowns', JSON.stringify(lessonContext));
      } else if (lessonContext.product === 'text-presentation') {
        setActiveProduct("One-Pager");
        setUseExistingTextOutline(true);
        sessionStorage.setItem('lessonContextForDropdowns', JSON.stringify(lessonContext));
      } else {
        setActiveProduct("Presentation");
        
        // Since we have lesson context from the modal, automatically set useExistingOutline to true
        // This bypasses the "Do you want to create a lesson from an existing Course Outline?" question
        setUseExistingOutline(true);
        
        // Store lesson context for pre-selecting dropdowns after outlines are loaded
        sessionStorage.setItem('lessonContextForDropdowns', JSON.stringify(lessonContext));
      }
    }
  }, [searchParams]);

  // Clear context when switching between products, but not during initial setup
  useEffect(() => {
    // Add a small delay to ensure the first useEffect runs first
    const timer = setTimeout(() => {
      // Skip if we're in the middle of setting up context from modal
      try {
        const lessonContextData = sessionStorage.getItem('lessonContext');
        if (lessonContextData) {
          const storedContext = JSON.parse(lessonContextData);
          // If we have recent context, don't clear it
          if (storedContext.timestamp && (Date.now() - storedContext.timestamp < 3600000)) {
            return;
          }
        }
      } catch (error) {
        // Continue with clearing if there's an error
      }

          // Clear lesson context when switching away from Presentation
    if (activeProduct !== "Presentation") {
        setUseExistingOutline(false);  // Default to standalone mode instead of null
        setSelectedOutlineId(null);
        setSelectedModuleIndex(null);
        setLessonsForModule([]);
        setSelectedLesson("");
      }
      
      // Clear quiz context when switching away from Quiz
      if (activeProduct !== "Quiz") {
        setUseExistingQuizOutline(false);  // Default to standalone mode instead of null
        setSelectedQuizOutlineId(null);
        setSelectedQuizModuleIndex(null);
        setQuizLessonsForModule([]);
        setSelectedQuizLesson("");
      }
      
      // Clear text presentation context when switching away from One-Pager
      if (activeProduct !== "One-Pager") {
        setUseExistingTextOutline(false);  // Default to standalone mode instead of null
        setSelectedTextOutlineId(null);
        setSelectedTextModuleIndex(null);
        setTextLessonsForModule([]);
        setSelectedTextLesson("");
      }
      
      // Clear video lesson context when switching away from Video Lesson
      if (activeProduct !== "Video Lesson") {
        // Video Lesson uses the same state as Presentation, so no additional cleanup needed
      }
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, [activeProduct]);

  // --- Lesson Presentation specific state ---
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(null);
  const [modulesForOutline, setModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [lessonsForModule, setLessonsForModule] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [lengthOption, setLengthOption] = useState<"Short" | "Medium" | "Long">("Short");
  const [slidesCount, setSlidesCount] = useState<number>(5);
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(false);

  // --- Quiz specific state ---
  const [quizOutlines, setQuizOutlines] = useState<{ id: number; name: string }[]>([]);
  const [selectedQuizOutlineId, setSelectedQuizOutlineId] = useState<number | null>(null);
  const [quizModulesForOutline, setQuizModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedQuizModuleIndex, setSelectedQuizModuleIndex] = useState<number | null>(null);
  const [quizLessonsForModule, setQuizLessonsForModule] = useState<string[]>([]);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState<string>("");
  const [quizQuestionCount, setQuizQuestionCount] = useState(10);
  const [quizLanguage, setQuizLanguage] = useState(t('interface.english', 'English'));
  const [useExistingQuizOutline, setUseExistingQuizOutline] = useState<boolean | null>(false);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([
    "multiple-choice",
    "multi-select", 
    "matching",
    "sorting",
    "open-answer"
  ]);
  const [showQuestionTypesDropdown, setShowQuestionTypesDropdown] = useState(false);

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

  // Fetch outlines when switching to Presentation tab and user chooses to use existing outline
  useEffect(() => {
    if (activeProduct !== "Presentation" || useExistingOutline !== true) return;
    const fetchOutlines = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const onlyOutlines = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setOutlines(onlyOutlines.map((p: any) => ({ id: p.id, name: p.projectName })));
        
        // Check if we have lesson context to pre-select outline
        try {
          const lessonContextData = sessionStorage.getItem('lessonContextForDropdowns');
          if (lessonContextData) {
            const lessonContext = JSON.parse(lessonContextData);
            // Find the outline that contains the specific module and lesson
            // We'll need to fetch each outline to check its modules and lessons
            for (const outline of onlyOutlines) {
              const outlineRes = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${outline.id}`);
              if (outlineRes.ok) {
                const outlineData = await outlineRes.json();
                const sections = outlineData?.details?.sections || [];
                const modules = sections.map((sec: any) => ({
                  name: sec.title || "Unnamed module",
                  lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
                }));
                
                // Check if this outline contains the target module and lesson
                const targetModuleIndex = modules.findIndex((m: any) => 
                  m.name.toLowerCase().includes(lessonContext.moduleName.toLowerCase()) ||
                  lessonContext.moduleName.toLowerCase().includes(m.name.toLowerCase())
                );
                
                if (targetModuleIndex !== -1) {
                  const targetModule = modules[targetModuleIndex];
                  const targetLessonIndex = targetModule.lessons.findIndex((l: string) => 
                    l.toLowerCase().includes(lessonContext.lessonTitle.toLowerCase()) ||
                    lessonContext.lessonTitle.toLowerCase().includes(l.toLowerCase())
                  );
                  
                  if (targetLessonIndex !== -1) {
                    // Found the matching outline, module, and lesson
                    setSelectedOutlineId(outline.id);
                    setModulesForOutline(modules);
                    setSelectedModuleIndex(targetModuleIndex);
                    setLessonsForModule(targetModule.lessons);
                    setSelectedLesson(targetModule.lessons[targetLessonIndex]);
                    
                    // Clear the stored context
                    sessionStorage.removeItem('lessonContextForDropdowns');
                    break;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error pre-selecting outline:', error);
        }
      } catch (_) {}
    };
    fetchOutlines();
  }, [activeProduct, useExistingOutline]);

  // Fetch lessons when outline changes
  useEffect(() => {
    if (activeProduct !== "Presentation" || selectedOutlineId == null || useExistingOutline !== true) return;
    
    // Skip if we already have modules loaded (from pre-selection)
    if (modulesForOutline.length > 0) return;
    
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
        // reset downstream selections
        setSelectedModuleIndex(null);
        setLessonsForModule([]);
        setSelectedLesson("");
      } catch (_) {}
    };
    fetchLessons();
  }, [selectedOutlineId, activeProduct, useExistingOutline, modulesForOutline.length]);

  // Fetch outlines when switching to Quiz tab and user chooses to use existing outline
  useEffect(() => {
    if (activeProduct !== "Quiz" || useExistingQuizOutline !== true) return;
    const fetchQuizOutlines = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const onlyOutlines = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setQuizOutlines(onlyOutlines.map((p: any) => ({ id: p.id, name: p.projectName })));
        
        // Check if we have quiz context to pre-select outline
        try {
          const lessonContextData = sessionStorage.getItem('lessonContextForDropdowns');
          if (lessonContextData) {
            const lessonContext = JSON.parse(lessonContextData);
            // Find the outline that contains the specific module and lesson
            // We'll need to fetch each outline to check its modules and lessons
            for (const outline of onlyOutlines) {
              const outlineRes = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${outline.id}`);
              if (outlineRes.ok) {
                const outlineData = await outlineRes.json();
                const sections = outlineData?.details?.sections || [];
                const modules = sections.map((sec: any) => ({
                  name: sec.title || "Unnamed module",
                  lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
                }));
                
                // Check if this outline contains the target module and lesson
                const targetModuleIndex = modules.findIndex((m: any) => 
                  m.name.toLowerCase().includes(lessonContext.moduleName.toLowerCase()) ||
                  lessonContext.moduleName.toLowerCase().includes(m.name.toLowerCase())
                );
                
                if (targetModuleIndex !== -1) {
                  const targetModule = modules[targetModuleIndex];
                  const targetLessonIndex = targetModule.lessons.findIndex((l: string) => 
                    l.toLowerCase().includes(lessonContext.lessonTitle.toLowerCase()) ||
                    lessonContext.lessonTitle.toLowerCase().includes(l.toLowerCase())
                  );
                  
                  if (targetLessonIndex !== -1) {
                    // Found the matching outline, module, and lesson
                    setSelectedQuizOutlineId(outline.id);
                    setQuizModulesForOutline(modules);
                    setSelectedQuizModuleIndex(targetModuleIndex);
                    setQuizLessonsForModule(targetModule.lessons);
                    setSelectedQuizLesson(targetModule.lessons[targetLessonIndex]);
                    
                    // Clear the stored context
                    sessionStorage.removeItem('lessonContextForDropdowns');
                    break;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error pre-selecting quiz outline:', error);
        }
      } catch (_) {}
    };
    fetchQuizOutlines();
  }, [activeProduct, useExistingQuizOutline]);

  // Fetch lessons when quiz outline changes
  useEffect(() => {
    if (activeProduct !== "Quiz" || selectedQuizOutlineId == null || useExistingQuizOutline !== true) return;
    
    // Skip if we already have modules loaded (from pre-selection)
    if (quizModulesForOutline.length > 0) return;
    
    const fetchQuizLessons = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedQuizOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const modules = sections.map((sec: any) => ({
          name: sec.title || "Unnamed module",
          lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
        }));
        setQuizModulesForOutline(modules);
        // reset downstream selections
        setSelectedQuizModuleIndex(null);
        setQuizLessonsForModule([]);
        setSelectedQuizLesson("");
      } catch (_) {}
    };
    fetchQuizLessons();
  }, [selectedQuizOutlineId, activeProduct, useExistingQuizOutline, quizModulesForOutline.length]);

  // Helper to map length option to words
  const lengthRangeForOption = (opt: string) => {
    switch (opt) {
      case "Short":
        return "300-400 words";
      case "Medium":
        return "600-800 words";
      case "Long":
        return "1000-1500 words";
      default:
        return "300-400 words";
    }
  };

  const handleSlideDeckStart = () => {
    // If using existing outline, check if outline and lesson selected
    if (useExistingOutline === true) {
      if (!selectedOutlineId || !selectedLesson) return;
    } else {
      // If standalone lesson, check if prompt entered or coming from files/text/knowledge base
      if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;
    }

    const params = new URLSearchParams();
    if (useExistingOutline === true && selectedOutlineId) {
      params.set("outlineId", String(selectedOutlineId));
    }
    if (useExistingOutline === true && selectedLesson) {
      params.set("lesson", selectedLesson);
    }
    params.set("length", lengthRangeForOption(lengthOption));
    params.set("slidesCount", String(slidesCount));
    
    // Handle different prompt sources
    if (isFromFiles) {
      const finalPrompt = prompt.trim() || "Create lesson content from the provided files";
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromFiles", "true");
      if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
      if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
    } else if (isFromText) {
      const finalPrompt = prompt.trim() || (textMode === 'context' 
        ? "Create lesson content using the provided text as context"
        : "Create lesson content based on the provided text structure");
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromText", "true");
      params.set("textMode", textMode || 'context');
      // userText stays in sessionStorage - don't pass via URL
    } else if (isFromKnowledgeBase) {
      params.set("prompt", prompt.trim() || "Create lesson content from the Knowledge Base");
      params.set("fromKnowledgeBase", "true");
    } else if (prompt.trim()) {
      const finalPrompt = prompt.trim();
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
    }
    
    params.set("lang", mapLanguageToCode(language));

    // Add connector context if coming from connectors
    const effectiveFromConnectors = (connectorContext?.fromConnectors) || isFromConnectors || (selectedFiles.length > 0);
    const effectiveConnectorIds = (connectorContext?.connectorIds?.length ? connectorContext.connectorIds : connectorIds);
    const effectiveConnectorSources = (connectorContext?.connectorSources?.length ? connectorContext.connectorSources : connectorSources);

    if (effectiveFromConnectors) {
      params.set("fromConnectors", "true");
      if (effectiveConnectorIds.length > 0) params.set("connectorIds", effectiveConnectorIds.join(','));
      if (effectiveConnectorSources.length > 0) params.set("connectorSources", effectiveConnectorSources.join(','));
    }

    // Forward selected files chosen in Smart Drive
    if (selectedFiles.length > 0) {
      params.set("selectedFiles", selectedFiles.join(','));
    }

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  const handleQuizStart = () => {
    // If using existing outline, check if outline and lesson selected
    if (useExistingQuizOutline === true) {
      if (!selectedQuizOutlineId || !selectedQuizLesson) return;
    } else {
      // If standalone quiz, check if prompt entered or coming from files/text/knowledge base
      if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;
    }

    const params = new URLSearchParams();
    if (useExistingQuizOutline === true && selectedQuizOutlineId) {
      params.set("outlineId", String(selectedQuizOutlineId));
    }
    if (useExistingQuizOutline === true && selectedQuizLesson) {
      params.set("lesson", selectedQuizLesson);
      // Add course name (outline name) for proper course context
      if (selectedQuizOutlineId && quizOutlines.find(o => o.id === selectedQuizOutlineId)) {
        const outline = quizOutlines.find(o => o.id === selectedQuizOutlineId);
        if (outline) {
          params.set("courseName", outline.name);
        }
      }
    }
    params.set("questionTypes", selectedQuestionTypes.join(','));
    params.set("questionCount", String(quizQuestionCount));
    params.set("lang", mapLanguageToCode(quizLanguage));
    
    // Handle different prompt sources
    if (isFromFiles) {
      const finalPrompt = prompt.trim() || "Create quiz content from the provided files";
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromFiles", "true");
      if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
      if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
    } else if (isFromText) {
      const finalPrompt = prompt.trim() || (textMode === 'context' 
        ? "Create quiz content using the provided text as context"
        : "Create quiz content based on the provided text structure");
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromText", "true");
      params.set("textMode", textMode || 'context');
      // userText stays in sessionStorage - don't pass via URL
    } else if (isFromKnowledgeBase) {
      params.set("prompt", prompt.trim() || "Create quiz content from the Knowledge Base");
      params.set("fromKnowledgeBase", "true");
    } else if (prompt.trim()) {
      const finalPrompt = prompt.trim();
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
    }

    // Add connector context if coming from connectors
    const effectiveFromConnectors = (connectorContext?.fromConnectors) || isFromConnectors || (selectedFiles.length > 0);
    const effectiveConnectorIds = (connectorContext?.connectorIds?.length ? connectorContext.connectorIds : connectorIds);
    const effectiveConnectorSources = (connectorContext?.connectorSources?.length ? connectorContext.connectorSources : connectorSources);

    if (effectiveFromConnectors) {
      params.set("fromConnectors", "true");
      if (effectiveConnectorIds.length > 0) params.set("connectorIds", effectiveConnectorIds.join(','));
      if (effectiveConnectorSources.length > 0) params.set("connectorSources", effectiveConnectorSources.join(','));
    }

    // Forward selected files chosen in Smart Drive
    if (selectedFiles.length > 0) {
      params.set("selectedFiles", selectedFiles.join(','));
    }

    router.push(`/create/quiz?${params.toString()}`);
  };

  // Text Presentation state (mimicking quiz pattern)
  const [useExistingTextOutline, setUseExistingTextOutline] = useState<boolean | null>(false);
  const [textOutlines, setTextOutlines] = useState<{ id: number; name: string }[]>([]);
  const [textModulesForOutline, setTextModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedTextModuleIndex, setSelectedTextModuleIndex] = useState<number | null>(null);
  const [textLessonsForModule, setTextLessonsForModule] = useState<string[]>([]);
  const [selectedTextOutlineId, setSelectedTextOutlineId] = useState<number | null>(null);
  const [selectedTextLesson, setSelectedTextLesson] = useState<string>("");
  const [textLanguage, setTextLanguage] = useState<string>(t('interface.english', 'English'));
  const [textLength, setTextLength] = useState<string>(t('interface.generate.medium', 'medium'));
  const [textStyles, setTextStyles] = useState<string[]>(["headlines", "paragraphs", "bullet_lists", "numbered_lists", "alerts", "recommendations", "section_breaks", "icons", "important_sections"]);
  const [showTextStylesDropdown, setShowTextStylesDropdown] = useState(false);

  // Track usage of styles feature
  const [stylesState, setStylesState] = useState<string | undefined>(undefined);
  const handleStylesClick = () => {
    if (stylesState === undefined) {
      setStylesState("Clicked");
    }
  };

  // Fetch one-pager outlines when product is selected
  useEffect(() => {
    if (activeProduct !== "One-Pager" || useExistingTextOutline !== true) return;
    
    const fetchTextOutlines = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`);
        if (!res.ok) return;
        const data = await res.json();
        const onlyOutlines = data.filter((p: any) => (p?.design_microproduct_type || p?.product_type) === "Training Plan");
        setTextOutlines(onlyOutlines.map((p: any) => ({ id: p.id, name: p.projectName })));
        
        // Check if we have text context to pre-select outline
        try {
          const lessonContextData = sessionStorage.getItem('lessonContextForDropdowns');
          if (lessonContextData) {
            const lessonContext = JSON.parse(lessonContextData);
            // Find the outline that contains the specific module and lesson
            // We'll need to fetch each outline to check its modules and lessons
            for (const outline of onlyOutlines) {
              const outlineRes = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${outline.id}`);
              if (outlineRes.ok) {
                const outlineData = await outlineRes.json();
                const sections = outlineData?.details?.sections || [];
                const modules = sections.map((sec: any) => ({
                  name: sec.title || "Unnamed module",
                  lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
                }));
                
                // Check if this outline contains the target module and lesson
                const targetModuleIndex = modules.findIndex((m: any) => 
                  m.name.toLowerCase().includes(lessonContext.moduleName.toLowerCase()) ||
                  lessonContext.moduleName.toLowerCase().includes(m.name.toLowerCase())
                );
                
                if (targetModuleIndex !== -1) {
                  const targetModule = modules[targetModuleIndex];
                  const targetLessonIndex = targetModule.lessons.findIndex((l: string) => 
                    l.toLowerCase().includes(lessonContext.lessonTitle.toLowerCase()) ||
                    lessonContext.lessonTitle.toLowerCase().includes(l.toLowerCase())
                  );
                  
                  if (targetLessonIndex !== -1) {
                    // Found the matching outline, module, and lesson
                    setSelectedTextOutlineId(outline.id);
                    setTextModulesForOutline(modules);
                    setSelectedTextModuleIndex(targetModuleIndex);
                    setTextLessonsForModule(targetModule.lessons);
                    setSelectedTextLesson(targetModule.lessons[targetLessonIndex]);
                    
                    // Clear the stored context
                    sessionStorage.removeItem('lessonContextForDropdowns');
                    break;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error pre-selecting text outline:', error);
        }
      } catch (_) {}
    };
    fetchTextOutlines();
  }, [activeProduct, useExistingTextOutline]);

  // Fetch lessons when text outline changes
  useEffect(() => {
    if (activeProduct !== "One-Pager" || selectedTextOutlineId == null || useExistingTextOutline !== true) return;
    
    // Skip if we already have modules loaded (from pre-selection)
    if (textModulesForOutline.length > 0) return;
    
    const fetchTextLessons = async () => {
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${selectedTextOutlineId}`);
        if (!res.ok) return;
        const data = await res.json();
        const sections = data?.details?.sections || [];
        const modules = sections.map((sec: any) => ({
          name: sec.title || "Unnamed module",
          lessons: (sec.lessons || []).map((ls: any) => ls.title || ""),
        }));
        setTextModulesForOutline(modules);
        // reset downstream selections
        setSelectedTextModuleIndex(null);
        setTextLessonsForModule([]);
        setSelectedTextLesson("");
      } catch (_) {}
    };
    fetchTextLessons();
  }, [selectedTextOutlineId, activeProduct, useExistingTextOutline, textModulesForOutline.length]);

  // Click outside handler for text styles dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.text-styles-dropdown')) {
        setShowTextStylesDropdown(false);
      }
    };

    if (showTextStylesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTextStylesDropdown]);

  const handleTextPresentationStart = () => {
    // If using existing outline, check if outline and lesson selected
    if (useExistingTextOutline === true) {
      if (!selectedTextOutlineId || !selectedTextLesson) return;
    } else {
      // If standalone text presentation, check if prompt entered or coming from files/text/knowledge base
      if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;
    }

    const params = new URLSearchParams();
    if (useExistingTextOutline === true && selectedTextOutlineId) {
      params.set("outlineId", String(selectedTextOutlineId));
    }
    if (useExistingTextOutline === true && selectedTextLesson) {
      params.set("lesson", selectedTextLesson);
      // Add course name (outline name) for proper course context
      if (selectedTextOutlineId && textOutlines.find(o => o.id === selectedTextOutlineId)) {
        const outline = textOutlines.find(o => o.id === selectedTextOutlineId);
        if (outline) {
          params.set("courseName", outline.name);
        }
      }
    }
    params.set("lang", mapLanguageToCode(textLanguage));
    params.set("length", textLength);
    params.set("styles", textStyles.join(','));
    
    // Handle different prompt sources
    if (isFromFiles) {
      const finalPrompt = prompt.trim() || "Create text presentation content from the provided files";
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromFiles", "true");
      if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
      if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
    } else if (isFromText) {
      const finalPrompt = prompt.trim() || (textMode === 'context' 
        ? "Create text presentation content using the provided text as context"
        : "Create text presentation content based on the provided text structure");
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromText", "true");
      params.set("textMode", textMode || 'context');
      // userText stays in sessionStorage - don't pass via URL
    } else if (isFromKnowledgeBase) {
      params.set("prompt", prompt.trim() || "Create text presentation content from the Knowledge Base");
      params.set("fromKnowledgeBase", "true");
    } else if (prompt.trim()) {
      const finalPrompt = prompt.trim(); 
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
    }

    // Add connector context if coming from connectors
    const effectiveFromConnectors = (connectorContext?.fromConnectors) || isFromConnectors || (selectedFiles.length > 0);
    const effectiveConnectorIds = (connectorContext?.connectorIds?.length ? connectorContext.connectorIds : connectorIds);
    const effectiveConnectorSources = (connectorContext?.connectorSources?.length ? connectorContext.connectorSources : connectorSources);

    if (effectiveFromConnectors) {
      params.set("fromConnectors", "true");
      if (effectiveConnectorIds.length > 0) params.set("connectorIds", effectiveConnectorIds.join(','));
      if (effectiveConnectorSources.length > 0) params.set("connectorSources", effectiveConnectorSources.join(','));
    }

    // Forward selected files chosen in Smart Drive
    if (selectedFiles.length > 0) {
      params.set("selectedFiles", selectedFiles.join(','));
    }

    sessionStorage.setItem('stylesState', stylesState ?? ""); 

    // Pass ISO language code to preview page
    params.set("lang", mapLanguageToCode(language));

    router.push(`/create/text-presentation?${params.toString()}`);
  };

  const handleVideoLessonStart = () => {
    // Check if prompt entered or coming from files/text/knowledge base
    if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;

    const params = new URLSearchParams();
    params.set("productType", "video_lesson_presentation"); // Flag to indicate video lesson with voiceover
    params.set("length", lengthRangeForOption(lengthOption));
    params.set("slidesCount", String(slidesCount));
    params.set("lang", mapLanguageToCode(language));
    
    // Handle different prompt sources
    if (isFromFiles) {
      const finalPrompt = prompt.trim() || "Create video lesson content from the provided files";
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromFiles", "true");
      if (folderIds.length > 0) params.set("folderIds", folderIds.join(','));
      if (fileIds.length > 0) params.set("fileIds", fileIds.join(','));
    } else if (isFromText) {
      const finalPrompt = prompt.trim() || (textMode === 'context' 
        ? "Create video lesson content using the provided text as context"
        : "Create video lesson content based on the provided text structure");
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
      params.set("fromText", "true");
      params.set("textMode", textMode || 'context');
      // userText stays in sessionStorage - don't pass via URL
    } else if (isFromKnowledgeBase) {
      params.set("prompt", prompt.trim() || "Create video lesson content from the Knowledge Base");
      params.set("fromKnowledgeBase", "true");
    } else if (prompt.trim()) {
      const finalPrompt = prompt.trim();
      // Store prompt in sessionStorage if it's long
      let promptReference = finalPrompt;
      if (finalPrompt.length > 500) {
        const promptId = generatePromptId();
        sessionStorage.setItem(promptId, finalPrompt);
        promptReference = promptId;
      }
      params.set("prompt", promptReference);
    }

    // Add connector context if coming from connectors
    const effectiveFromConnectors = (connectorContext?.fromConnectors) || isFromConnectors || (selectedFiles.length > 0);
    const effectiveConnectorIds = (connectorContext?.connectorIds?.length ? connectorContext.connectorIds : connectorIds);
    const effectiveConnectorSources = (connectorContext?.connectorSources?.length ? connectorContext.connectorSources : connectorSources);

    if (effectiveFromConnectors) {
      params.set("fromConnectors", "true");
      if (effectiveConnectorIds.length > 0) params.set("connectorIds", effectiveConnectorIds.join(','));
      if (effectiveConnectorSources.length > 0) params.set("connectorSources", effectiveConnectorSources.join(','));
    }

    // Forward selected files chosen in Smart Drive
    if (selectedFiles.length > 0) {
      params.set("selectedFiles", selectedFiles.join(','));
    }

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  // Map UI language selection to ISO code for preview pages
  const mapLanguageToCode = (label: string): string => {
    const l = (label || '').toLowerCase();
    if (l.startsWith('en')) return 'en';
    if (l.startsWith('uk')) return 'uk';
    if (l.startsWith('es') || l.startsWith('sp')) return 'es';
    if (l.startsWith('ru')) return 'ru';
    return 'en';
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center py-8 px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1100px',
          height: '2100px',
          left: '50%',
          top: '50%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, #90EDE5 10%, #5D72F4 70%, #D817FF 100%)',
          transform: 'translate(-50%, -50%) rotate(120deg)',
          filter: 'blur(100px)',
        }}
      />

      {/* Top-left back button */}
      <Link
        href="/create"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer z-10"
        style={{ 
          color: '#000000',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))'
        }}
      >
        <span>&lt;</span>
        <span>Back</span>
      </Link>

      <div className="w-full max-w-5xl flex flex-col gap-3 items-center relative z-10">

        <h1 className="sora-font-semibold text-5xl text-center tracking-wide text-[#FFFFFF] mt-8">{t('interface.generate.title', 'Generate')}</h1>
        <p className="text-center text-[#FAFAFA] text-lg -mt-1">
          {isFromFiles ? t('interface.generate.subtitleFromFiles', 'Create content from your selected files') : 
           isFromText ? t('interface.generate.subtitleFromText', 'Create content from your text') : 
           isFromKnowledgeBase ? t('interface.generate.subtitleFromKnowledgeBase', 'Create content by searching your Knowledge Base') :
           isFromConnectors ? t('interface.generate.subtitleFromConnectors', 'Create content from your selected connectors') :
           t('interface.generate.subtitle', 'What would you like to create today?')}
        </p>

        {/* File context indicator */}
        {isFromFiles && (
          <Alert 
            className="backdrop-blur-sm shadow-sm"
            style={{
              backgroundColor: `rgb(var(--generate-alert-bg))`,
              borderColor: `rgb(var(--generate-alert-border))`,
              borderWidth: '1px'
            }}
          >
            <div 
              className="flex items-center gap-2 font-medium mb-2"
              style={{ color: `rgb(var(--generate-alert-text))` }}
            >
              <FileText className="h-5 w-5" />
              {t('interface.generate.creatingFromFiles', 'Creating from files')}
            </div>
            <AlertDescription style={{ color: `rgb(var(--generate-alert-text))` }}>
              {folderIds.length > 0 && (
                <p>{folderIds.length} {folderIds.length !== 1 ? t('interface.generate.foldersSelectedPlural', 'folders selected') : t('interface.generate.foldersSelected', 'folder selected')}</p>
              )}
              {fileIds.length > 0 && (
                <p>{fileIds.length} {fileIds.length !== 1 ? t('interface.generate.filesSelectedPlural', 'files selected') : t('interface.generate.filesSelected', 'file selected')}</p>
              )}
              <p className="mt-1 text-blue-600">
                {t('interface.generate.aiWillUseDocuments', 'The AI will use your selected documents as source material to create educational content.')}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Text context indicator */}
        {isFromText && (
          <Alert className="w-full max-w-3xl bg-gradient-to-l from-[#00BBFF66]/40 to-[#00BBFF66]/10 backdrop-blur-sm border border-gray-100/50 shadow-md">
            <AlertDescription className="text-blue-600">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <FileText className="h-6 w-6" />
                <span className="text-lg font-semibold">{t('interface.generate.creatingFromText', 'Creating from text')}</span>
              </div>
              <p className="font-medium text-gray-600">
                {textMode === 'context' ? t('interface.generate.modeUsingAsContext', 'Mode: Using as context') : t('interface.generate.modeUsingAsBaseStructure', 'Mode: Using as base structure')}
              </p>
              <p className="mt-1 text-gray-500">
                {textMode === 'context' 
                  ? t('interface.generate.aiWillUseTextAsContext', 'The AI will use your text as reference material and context to create new educational content.')
                  : t('interface.generate.aiWillBuildUponText', 'The AI will build upon your existing content structure, enhancing and formatting it into a comprehensive educational product.')}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Knowledge Base context indicator */}
        {isFromKnowledgeBase && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {t('interface.generate.creatingFromKnowledgeBase', 'Creating from Knowledge Base')}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {t('interface.generate.aiWillSearchKnowledgeBase', 'The AI will search your entire Knowledge Base to find relevant information and create educational content.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connector context indicator */}
        {isFromConnectors && connectorContext && (
          <div className="w-full max-w-3xl bg-gradient-to-l from-[#00BBFF66]/40 to-[#00BBFF66]/10 border-2 border-[#CCF1FF] rounded-xl p-6 mb-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
                <Network className="h-10 w-10 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-600">
                  {t('interface.generate.creatingFromConnectors', 'Creating from Selected Connectors')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('interface.generate.aiWillUseConnectorData', 'The AI will use data from your selected connectors to create educational content.')}
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Tab selector */}
        <div 
          className="w-fit rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow duration-200"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.5))'
          }}
        >
          <div className="flex flex-wrap justify-center gap-4">
          <GenerateCard
            label={t('interface.generate.courseOutline', 'Course')}
            pillLabel="Popular"
            svg={
              <svg width="35" height="35" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Course" ? "1" : "0.5"} d="M37.2307 9.11511H35.0879V4.97055C35.0879 4.28592 34.817 3.62934 34.3347 3.14523C33.8525 2.66113 33.1984 2.38916 32.5165 2.38916H30.0307C30.0906 2.12521 30.0748 1.84965 29.9852 1.59432C29.8956 1.339 29.7359 1.11435 29.5244 0.94634C29.313 0.778333 29.0585 0.673833 28.7904 0.644922C28.5223 0.616011 28.2515 0.66387 28.0093 0.782965L20.0879 4.4471L12.1665 0.782965C11.9243 0.66387 11.6535 0.616011 11.3854 0.644922C11.1173 0.673833 10.8628 0.778333 10.6513 0.94634C10.4399 1.11435 10.2802 1.339 10.1906 1.59432C10.101 1.84965 10.0852 2.12521 10.145 2.38916H7.65932C6.97733 2.38916 6.32328 2.66113 5.84104 3.14523C5.35881 3.62934 5.08789 4.28592 5.08789 4.97055V9.11511H2.94503C2.18727 9.11511 1.46055 9.41729 0.924728 9.95519C0.38891 10.4931 0.0878906 11.2226 0.0878906 11.9833V32.5699C0.0878906 33.3306 0.38891 34.0601 0.924728 34.598C1.46055 35.1359 2.18727 35.4381 2.94503 35.4381H11.7165L10.3522 37.1447C10.1006 37.4615 9.94328 37.8431 9.89829 38.2458C9.85331 38.6484 9.92249 39.0556 10.0979 39.4204C10.2733 39.7853 10.5477 40.0931 10.8897 40.3082C11.2316 40.5234 11.6272 40.6373 12.0307 40.6367H28.145C28.5486 40.6373 28.9441 40.5234 29.2861 40.3082C29.628 40.0931 29.9025 39.7853 30.0779 39.4204C30.2533 39.0556 30.3225 38.6484 30.2775 38.2458C30.2325 37.8431 30.0752 37.4615 29.8236 37.1447L28.4593 35.4166H37.2307C37.9885 35.4166 38.7152 35.1144 39.2511 34.5765C39.7869 34.0386 40.0879 33.3091 40.0879 32.5484V11.9833C40.0879 11.2226 39.7869 10.4931 39.2511 9.95519C38.7152 9.41729 37.9885 9.11511 37.2307 9.11511ZM28.6022 2.088V18.91C28.6025 19.0223 28.5711 19.1324 28.5117 19.2276C28.4523 19.3228 28.3673 19.3991 28.2665 19.4478L20.8022 22.8968V5.6876L28.6022 2.088ZM11.5736 2.088L19.3736 5.67326V22.8825L11.9093 19.4478C11.8085 19.3991 11.7235 19.3228 11.6641 19.2276C11.6047 19.1324 11.5733 19.0223 11.5736 18.91V2.088ZM2.94503 10.5492H5.08789V22.1511C5.08789 22.8357 5.35881 23.4923 5.84104 23.9764C6.32328 24.4605 6.97733 24.7325 7.65932 24.7325H32.5165C33.1984 24.7325 33.8525 24.4605 34.3347 23.9764C34.817 23.4923 35.0879 22.8357 35.0879 22.1511V10.5492H37.2307C37.6096 10.5492 37.973 10.7003 38.2409 10.9693C38.5088 11.2382 38.6593 11.603 38.6593 11.9833V28.6333H1.51646V11.9833C1.51646 11.603 1.66697 11.2382 1.93488 10.9693C2.20279 10.7003 2.56615 10.5492 2.94503 10.5492ZM22.2307 32.7778H17.945C17.7556 32.7778 17.5739 32.7023 17.44 32.5678C17.306 32.4333 17.2307 32.2509 17.2307 32.0608C17.2307 31.8706 17.306 31.6882 17.44 31.5537C17.5739 31.4193 17.7556 31.3437 17.945 31.3437H22.2307C22.3922 31.3766 22.5374 31.4646 22.6417 31.5926C22.7459 31.7207 22.8029 31.881 22.8029 32.0464C22.8029 32.2118 22.7459 32.3722 22.6417 32.5002C22.5374 32.6283 22.3922 32.7162 22.2307 32.7491V32.7778ZM28.7022 38.084C28.7852 38.1895 28.837 38.3163 28.8517 38.4499C28.8664 38.5835 28.8434 38.7185 28.7853 38.8397C28.7272 38.9608 28.6364 39.0631 28.5232 39.1348C28.41 39.2066 28.2789 39.245 28.145 39.2456H12.0307C11.8968 39.245 11.7658 39.2066 11.6526 39.1348C11.5394 39.0631 11.4485 38.9608 11.3905 38.8397C11.3324 38.7185 11.3094 38.5835 11.3241 38.4499C11.3388 38.3163 11.3906 38.1895 11.4736 38.084L13.545 35.4668H26.6307L28.7022 38.084Z" fill="#0F58F9"/>
              </svg>
            }
            active={activeProduct === "Course"}
            onClick={() => setActiveProduct("Course")}
          />
          {videoLessonEnabled && (
          <GenerateCard 
            label={t('interface.generate.videoLesson', 'Video Lesson')} 
            svg={
              <svg width="35" height="31" viewBox="0 0 41 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Video Lesson" ? "1" : "0.5"} d="M35.3302 19.4095C33.3514 20.85 30.9621 21.6215 28.5118 21.611C24.1105 21.5492 18.829 17.8982 18.7918 14.8427L0.102192 14.9068L0.159369 32.6897C0.164554 33.7399 0.5873 34.7451 1.33491 35.485C2.08251 36.2249 3.09395 36.6391 4.14744 36.6367L32.8358 36.5441C33.8904 36.5404 34.9004 36.1197 35.6442 35.3743C36.3879 34.629 36.8044 33.6199 36.8024 32.5686L36.7524 18.3052C36.2991 18.6992 35.8243 19.0678 35.3302 19.4095ZM12.8669 19.0604C13.1911 18.8687 13.561 18.7669 13.938 18.7656C14.315 18.7644 14.6855 18.8637 15.011 19.0533L22.1724 23.1428C22.4991 23.3294 22.7708 23.5985 22.9602 23.9229C23.1497 24.2473 23.2502 24.6157 23.2516 24.9911C23.2531 25.3664 23.1554 25.7356 22.9685 26.0614C22.7816 26.3873 22.5119 26.6584 22.1867 26.8476L15.0467 30.9869C14.7207 31.1738 14.3512 31.2721 13.9751 31.2722C13.599 31.2722 13.2295 31.174 12.9033 30.9873C12.5772 30.8006 12.3059 30.5319 12.1164 30.2081C11.9269 29.8843 11.8259 29.5166 11.8234 29.1417L11.7948 20.9128C11.7926 20.537 11.8908 20.1674 12.0792 19.8419C12.2676 19.5164 12.5394 19.2466 12.8669 19.0604ZM38.9466 9.19289L29.7697 13.8096C29.4705 13.9582 29.1401 14.0337 28.8059 14.03C28.4716 14.0263 28.143 13.9434 27.8472 13.7882L18.6847 9.00765C18.3447 8.82393 18.0616 8.55087 17.8663 8.21812C17.671 7.88537 17.5708 7.50564 17.5767 7.12016C17.5826 6.73467 17.6943 6.35816 17.8997 6.03149C18.1051 5.70482 18.3963 5.44047 18.7418 5.26715C19.141 5.16513 28.5622 0.279696 28.7692 0.657554C29.0087 0.285652 38.5108 5.32372 38.9395 5.44533C39.2847 5.62223 39.5745 5.89043 39.7771 6.22054C39.9796 6.55066 40.0872 6.92998 40.0879 7.31695C40.0886 7.70393 39.9825 8.08364 39.7812 8.41452C39.5799 8.7454 39.2912 9.01468 38.9466 9.19289ZM37.4957 11.5155L37.5029 14.4579C37.5027 14.8369 37.4261 15.212 37.2775 15.5608C37.1289 15.9096 36.9115 16.2251 36.6381 16.4884C34.1008 18.9322 31.4493 20.179 28.762 20.1861C25.1524 20.2367 22.2168 17.8589 20.9574 16.4884C20.4712 15.9799 20.2021 15.3029 20.2069 14.6004L20.1926 11.4015C20.9039 11.7765 27.1825 15.0564 27.1825 15.0564C27.692 15.3214 28.2588 15.4584 28.8335 15.4554C29.3825 15.4556 29.9238 15.3262 30.413 15.0778L37.4957 11.5155ZM18.7704 13.4178L18.7632 10.6534L18.0199 10.2687C17.4402 9.96808 16.9564 9.51192 16.623 8.9517C16.2896 8.39148 16.1199 7.74952 16.1331 7.09827C16.1329 6.98867 16.14 6.87918 16.1545 6.77054L4.05453 6.81328C2.99993 6.81695 1.98989 7.23766 1.24618 7.98303C0.502478 8.7284 0.0858937 9.73751 0.0878978 10.7888L0.0950449 13.4819L18.7704 13.4178ZM14.6179 10.8315L3.52564 10.8672C3.33781 10.8655 3.15819 10.7901 3.02563 10.6575C2.89307 10.5248 2.81824 10.3454 2.8173 10.1582C2.81637 9.97095 2.88941 9.79086 3.02064 9.65688C3.15187 9.5229 3.33073 9.4458 3.51854 9.44225L14.6179 9.40663C14.8051 9.41026 14.9833 9.48692 15.1144 9.62014C15.2454 9.75335 15.3188 9.9325 15.3188 10.1191C15.3188 10.3057 15.2454 10.4848 15.1144 10.618C14.9833 10.7512 14.8051 10.8279 14.6179 10.8315ZM13.2528 29.1345L13.2242 20.9057C13.2217 20.8108 13.2387 20.7165 13.2742 20.6284C13.3097 20.5404 13.3629 20.4605 13.4305 20.3937C13.4981 20.327 13.5788 20.2747 13.6675 20.2402C13.7561 20.2058 13.851 20.1898 13.9461 20.1932C14.0689 20.1936 14.1895 20.2255 14.2963 20.2858L21.4577 24.3825C21.5684 24.4422 21.6607 24.5307 21.7249 24.6386C21.7891 24.7465 21.8227 24.8697 21.8222 24.9952C21.8232 25.1208 21.7906 25.2444 21.7278 25.3534C21.665 25.4623 21.5742 25.5526 21.4648 25.615L14.3249 29.7544C14.216 29.817 14.0925 29.85 13.9668 29.8498C13.8411 29.8497 13.7177 29.8165 13.6089 29.7537C13.5002 29.6908 13.41 29.6005 13.3475 29.4918C13.285 29.3831 13.2523 29.2598 13.2528 29.1345Z" fill="#D817FF"/>
              </svg>
            }
            active={activeProduct === "Video Lesson"}
            onClick={() => setActiveProduct("Video Lesson")}
          />
          )}
          <GenerateCard 
            label={t('interface.generate.quiz', 'Quiz')} 
            svg={
              <svg width="35" height="32" viewBox="0 0 41 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Quiz" ? "1" : "0.5"} d="M27.3382 4.83176H11.3023C10.3552 4.8321 9.44699 5.20505 8.77728 5.86863C8.10758 6.53222 7.73119 7.43214 7.73085 8.37059V34.0979C7.7324 35.036 8.10918 35.9352 8.77863 36.5985C9.44807 37.2618 10.3556 37.6352 11.3023 37.6367H27.3382C28.285 37.6352 29.1925 37.2618 29.8619 36.5985C30.5314 35.9352 30.9082 35.036 30.9097 34.0979V8.37059C30.9094 7.43214 30.533 6.53223 29.8633 5.86864C29.1936 5.20506 28.2853 4.83211 27.3382 4.83176ZM13.0238 7.69113H17.581C17.8625 7.69076 18.1413 7.74543 18.4015 7.852C18.6616 7.95858 18.898 8.11496 19.0971 8.3122C19.2961 8.50944 19.4539 8.74366 19.5615 9.00144C19.6691 9.25922 19.7242 9.53549 19.7239 9.81443V9.99845L20.5096 9.41808C20.6613 9.30957 20.8501 9.26458 21.035 9.29285C21.2199 9.32112 21.3862 9.42037 21.4979 9.56916C21.6096 9.71794 21.6577 9.90429 21.6318 10.0879C21.6059 10.2716 21.5081 10.4377 21.3596 10.5505L19.7239 11.7608V14.33C19.7242 14.6089 19.6691 14.8852 19.5615 15.143C19.454 15.4008 19.2961 15.635 19.0971 15.8322C18.898 16.0295 18.6616 16.1859 18.4015 16.2924C18.1413 16.399 17.8625 16.4537 17.581 16.4533H13.0238C12.7423 16.4536 12.4634 16.399 12.2033 16.2924C11.9431 16.1858 11.7067 16.0295 11.5077 15.8322C11.3086 15.635 11.1508 15.4008 11.0432 15.143C10.9357 14.8852 10.8805 14.6089 10.8809 14.33V9.81443C10.8805 9.53549 10.9357 9.25922 11.0432 9.00144C11.1508 8.74366 11.3086 8.50944 11.5077 8.3122C11.7067 8.11496 11.9431 7.95858 12.2033 7.852C12.4634 7.74543 12.7423 7.69076 13.0238 7.69113ZM10.8809 28.1385C10.8805 27.8596 10.9357 27.5833 11.0432 27.3255C11.1508 27.0677 11.3086 26.8335 11.5077 26.6363C11.7067 26.439 11.9431 26.2826 12.2033 26.1761C12.4634 26.0695 12.7423 26.0148 13.0238 26.0152H17.581C17.878 26.0163 18.1717 26.0782 18.4435 26.197C18.7153 26.3158 18.9595 26.4889 19.1606 26.7055C19.3618 26.9221 19.5156 27.1775 19.6126 27.4557C19.7095 27.734 19.7474 28.0291 19.7239 28.3225L20.5096 27.7421C20.6613 27.6335 20.8501 27.5884 21.0352 27.6166C21.2202 27.6448 21.3866 27.7441 21.4983 27.8929C21.6101 28.0418 21.6581 28.2283 21.6322 28.412C21.6062 28.5957 21.5083 28.7619 21.3596 28.8746L19.7239 30.0849V32.654C19.7242 32.933 19.6691 33.2093 19.5615 33.467C19.454 33.7248 19.2961 33.959 19.0971 34.1563C18.898 34.3535 18.6616 34.5099 18.4015 34.6165C18.1413 34.7231 17.8625 34.7777 17.581 34.7773H13.0238C12.7423 34.7777 12.4634 34.7231 12.2033 34.6165C11.9431 34.5099 11.7067 34.3535 11.5077 34.1563C11.3086 33.959 11.1508 33.7248 11.0432 33.467C10.9357 33.2093 10.8805 32.933 10.8809 32.654V28.1385ZM13.5238 25.0951C13.3362 25.0923 13.1572 25.0166 13.0255 24.8841C12.8938 24.7517 12.82 24.5732 12.82 24.3873C12.82 24.2014 12.8938 24.023 13.0255 23.8905C13.1572 23.7581 13.3362 23.6823 13.5238 23.6796H27.0454C27.2325 23.683 27.4109 23.7591 27.542 23.8914C27.6731 24.0238 27.7466 24.2019 27.7466 24.3874C27.7466 24.5728 27.6731 24.7509 27.542 24.8833C27.4108 25.0156 27.2325 25.0917 27.0453 25.0951H13.5238ZM12.8095 21.2307C12.81 21.0432 12.8855 20.8635 13.0193 20.7309C13.1532 20.5982 13.3345 20.5235 13.5238 20.5229H21.3453C21.5347 20.5229 21.7164 20.5975 21.8504 20.7302C21.9843 20.863 22.0596 21.043 22.0596 21.2307C22.0596 21.4184 21.9843 21.5984 21.8504 21.7312C21.7164 21.8639 21.5347 21.9385 21.3453 21.9385H13.5238C13.4299 21.9388 13.3369 21.9207 13.25 21.8853C13.1632 21.8498 13.0844 21.7977 13.018 21.7319C12.9516 21.6661 12.899 21.5879 12.8632 21.5019C12.8274 21.4159 12.8092 21.3237 12.8095 21.2307ZM27.0454 18.7889H13.5238C13.3362 18.7861 13.1572 18.7104 13.0255 18.5779C12.8938 18.4455 12.82 18.267 12.82 18.0811C12.82 17.8952 12.8938 17.7168 13.0255 17.5843C13.1572 17.4519 13.3362 17.3761 13.5238 17.3734H27.0454C27.2326 17.3767 27.411 17.4527 27.5423 17.5851C27.6735 17.7175 27.747 17.8956 27.747 18.0811C27.747 18.2667 27.6735 18.4448 27.5423 18.5772C27.411 18.7096 27.2326 18.7856 27.0454 18.7889ZM40.0455 7.0046L35.5312 33.3618C35.3947 34.1529 34.9476 34.8584 34.2878 35.3239C33.6279 35.7894 32.8089 35.9771 32.0097 35.8461C32.2238 35.2875 32.3351 34.6954 32.3383 34.0979V8.37059C32.3369 7.05705 31.8096 5.79773 30.8722 4.86892C29.9348 3.94011 28.6639 3.41767 27.3382 3.41623H17.1453L17.1881 3.16851C17.325 2.37568 17.7729 1.66871 18.434 1.20194C19.0951 0.735175 19.9157 0.546523 20.7167 0.677172L37.5384 3.50824C38.3383 3.64338 39.0515 4.08737 39.5215 4.74282C39.9915 5.39826 40.18 6.21166 40.0455 7.0046ZM6.00225 9.8569V11.0176C5.07454 11.0206 0.0878906 11.0176 0.0878906 11.0176V9.8569C0.0879285 9.22808 0.340048 8.62502 0.788793 8.18038C1.23754 7.73573 1.84616 7.48592 2.48078 7.48588H3.60936C4.24399 7.48592 4.8526 7.73574 5.30135 8.18038C5.75009 8.62502 6.00221 9.22808 6.00225 9.8569ZM0.0878906 30.7148V12.4331C0.601419 12.4464 1.83046 12.4148 2.33078 12.4331V30.7148C1.82606 30.7322 0.606119 30.6905 0.0878906 30.7148ZM6.00225 12.4332V30.7148C5.48872 30.7015 4.25968 30.7332 3.75937 30.7148V12.4332C4.2641 12.4157 5.48405 12.4574 6.00225 12.4332ZM5.77368 32.1303L4.31652 35.9098C4.21727 36.164 4.04271 36.3825 3.81578 36.5367C3.58885 36.6908 3.32018 36.7732 3.04507 36.7732C2.76996 36.7732 2.50129 36.6908 2.27436 36.5367C2.04744 36.3825 1.87288 36.164 1.77363 35.9098L0.316465 32.1303C0.316465 32.1303 4.86752 32.1275 5.77368 32.1303ZM12.3095 14.33V9.81443C12.3092 9.7214 12.3274 9.62922 12.3632 9.5432C12.399 9.45718 12.4516 9.37903 12.518 9.31324C12.5844 9.24746 12.6632 9.19534 12.75 9.15988C12.8368 9.12443 12.9299 9.10634 13.0238 9.10667H17.581C17.6749 9.10634 17.7679 9.12443 17.8547 9.15988C17.9415 9.19534 18.0204 9.24746 18.0868 9.31324C18.1532 9.37903 18.2058 9.45718 18.2416 9.5432C18.2773 9.62922 18.2956 9.7214 18.2953 9.81443V11.0459L16.2524 12.5535L15.0238 10.2391C14.9343 10.0738 14.7823 9.95043 14.6012 9.8959C14.4201 9.84136 14.2246 9.86014 14.0574 9.94811C13.8902 10.0361 13.765 10.1861 13.7092 10.3653C13.6534 10.5445 13.6714 10.7384 13.7595 10.9044L15.3809 13.9478C15.4299 14.0372 15.4976 14.1152 15.5795 14.1765C15.6614 14.2378 15.7556 14.281 15.8558 14.3031C15.956 14.3253 16.0599 14.3258 16.1603 14.3048C16.2608 14.2838 16.3555 14.2417 16.4381 14.1813L18.2953 12.8083V14.33C18.2947 14.5175 18.2193 14.6972 18.0855 14.8298C17.9516 14.9625 17.7702 15.0372 17.581 15.0377H13.0238C12.8345 15.0372 12.6531 14.9625 12.5193 14.8298C12.3855 14.6972 12.31 14.5175 12.3095 14.33ZM12.3095 32.654V28.1385C12.3092 28.0455 12.3274 27.9533 12.3632 27.8673C12.399 27.7812 12.4516 27.7031 12.518 27.6373C12.5844 27.5715 12.6632 27.5194 12.75 27.4839C12.8368 27.4485 12.9299 27.4304 13.0238 27.4307H17.581C17.6749 27.4304 17.7679 27.4485 17.8547 27.4839C17.9415 27.5194 18.0204 27.5715 18.0868 27.6373C18.1532 27.7031 18.2058 27.7812 18.2416 27.8673C18.2773 27.9533 18.2956 28.0455 18.2953 28.1385V29.37L16.2524 30.8776L15.0238 28.5632C14.9322 28.4018 14.7805 28.2823 14.6011 28.2302C14.4218 28.1781 14.229 28.1975 14.0639 28.2844C13.8988 28.3712 13.7746 28.5186 13.7177 28.695C13.6608 28.8715 13.6758 29.0629 13.7595 29.2285L15.3809 32.2719C15.4296 32.3616 15.4972 32.4398 15.5791 32.5013C15.661 32.5628 15.7553 32.6061 15.8556 32.6283C15.9559 32.6504 16.0598 32.6509 16.1604 32.6297C16.2609 32.6086 16.3556 32.5662 16.4381 32.5055L18.2953 31.1324V32.654C18.2947 32.8416 18.2193 33.0213 18.0854 33.1539C17.9516 33.2865 17.7702 33.3612 17.581 33.3618H13.0238C12.8345 33.3612 12.6531 33.2865 12.5193 33.1539C12.3855 33.0213 12.31 32.8416 12.3095 32.654Z" fill="#90EDE5"/>
              </svg>
            }
            active={activeProduct === "Quiz"}
            onClick={() => setActiveProduct("Quiz")}
          />
          <GenerateCard
            label={t('interface.generate.presentation', 'Presentation')}
            svg={
              <svg width="35" height="35" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "Presentation" ? "1" : "0.5"} d="M40.0879 2.07132V4.02954C40.0868 4.40968 39.9359 4.77393 39.6683 5.04272C39.4006 5.31152 39.0379 5.46302 38.6593 5.46414H1.51646C1.13792 5.46302 0.775201 5.31152 0.507532 5.04272C0.239862 4.77393 0.0889968 4.40968 0.0878907 4.02954V2.07132C0.08784 1.88291 0.124756 1.69634 0.196531 1.52226C0.268305 1.34818 0.373531 1.19001 0.506196 1.05679C0.638862 0.923564 0.796366 0.817895 0.969711 0.745818C1.14306 0.67374 1.32885 0.636668 1.51646 0.636719H38.6593C38.8469 0.636668 39.0327 0.67374 39.2061 0.745818C39.3794 0.817895 39.5369 0.923564 39.6696 1.05679C39.8022 1.19001 39.9075 1.34818 39.9793 1.52226C40.051 1.69634 40.0879 1.88291 40.0879 2.07132ZM38.6593 25.6346H1.51646C1.32885 25.6345 1.14306 25.6716 0.969713 25.7437C0.796368 25.8157 0.638864 25.9214 0.506199 26.0546C0.373534 26.1879 0.268308 26.346 0.196533 26.5201C0.124758 26.6942 0.0878409 26.8807 0.0878907 27.0692V29.0274C0.0890043 29.4075 0.239872 29.7718 0.50754 30.0406C0.775208 30.3094 1.13792 30.4609 1.51646 30.462H32.3396C32.3379 30.4623 32.3427 34.9475 32.3379 34.9451C31.6587 35.1197 31.0663 35.5372 30.6719 36.1193C30.2775 36.7013 30.1081 37.408 30.1956 38.1065C30.2831 38.8051 30.6214 39.4475 31.1471 39.9134C31.6728 40.3792 32.3497 40.6364 33.0508 40.6367C33.7519 40.637 34.429 40.3803 34.955 39.9149C35.4811 39.4495 35.8199 38.8073 35.908 38.1088C35.996 37.4103 35.8272 36.7036 35.4332 36.1212C35.0393 35.5388 34.4472 35.1208 33.7681 34.9457V30.462H38.6593C39.0379 30.4609 39.4006 30.3094 39.6682 30.0406C39.9359 29.7718 40.0868 29.4075 40.0879 29.0274V27.0692C40.0879 26.8807 40.051 26.6942 39.9792 26.5201C39.9075 26.346 39.8022 26.1879 39.6696 26.0546C39.5369 25.9214 39.3794 25.8157 39.2061 25.7437C39.0327 25.6716 38.8469 25.6345 38.6593 25.6346ZM2.74503 24.2V6.89873C3.98661 6.89695 36.1903 6.90119 37.4308 6.89873V24.2H2.74503ZM16.9093 11.719C17.0988 11.719 17.2804 11.6434 17.4144 11.5089C17.5484 11.3744 17.6236 11.1919 17.6236 11.0017C17.6236 10.8114 17.5484 10.629 17.4144 10.4945C17.2804 10.36 17.0988 10.2844 16.9093 10.2844H7.90936C7.72176 10.2872 7.54278 10.364 7.41109 10.4982C7.27941 10.6324 7.20559 10.8133 7.20559 11.0017C7.20559 11.1901 7.27941 11.3709 7.41109 11.5052C7.54278 11.6394 7.72176 11.7162 7.90936 11.719H16.9093ZM15.1807 13.9569C15.1835 14.113 15.2472 14.2618 15.358 14.3712C15.4689 14.4806 15.6181 14.5419 15.7736 14.5419C15.929 14.5419 16.0783 14.4806 16.1891 14.3712C16.3 14.2618 16.3637 14.1131 16.3665 13.957C16.3637 13.8009 16.3 13.6522 16.1892 13.5428C16.0783 13.4334 15.9291 13.3721 15.7736 13.3721C15.6182 13.372 15.469 13.4333 15.3581 13.5427C15.2472 13.6521 15.1835 13.8009 15.1807 13.9569ZM12.3665 13.9569C12.3692 14.113 12.4329 14.2618 12.5438 14.3712C12.6546 14.4806 12.8039 14.5419 12.9593 14.5419C13.1147 14.5419 13.264 14.4806 13.3749 14.3712C13.4857 14.2618 13.5494 14.1131 13.5522 13.957C13.5494 13.8009 13.4858 13.6522 13.3749 13.5428C13.264 13.4334 13.1148 13.3721 12.9593 13.3721C12.8039 13.372 12.6547 13.4333 12.5438 13.5427C12.4329 13.6521 12.3692 13.8009 12.3665 13.9569ZM7.63075 14.5667H10.7736C10.9612 14.5639 11.1402 14.4871 11.2719 14.3528C11.4036 14.2186 11.4774 14.0378 11.4774 13.8494C11.4774 13.6609 11.4036 13.4801 11.2719 13.3459C11.1402 13.2116 10.9612 13.1348 10.7736 13.1321H7.63075C7.44314 13.1348 7.26416 13.2116 7.13248 13.3459C7.00079 13.4801 6.92698 13.6609 6.92698 13.8494C6.92698 14.0378 7.00079 14.2186 7.13248 14.3528C7.26416 14.4871 7.44314 14.5639 7.63075 14.5667ZM10.7736 21.7396H7.63075C7.44314 21.7424 7.26416 21.8192 7.13248 21.9534C7.00079 22.0877 6.92698 22.2685 6.92698 22.4569C6.92698 22.6453 7.00079 22.8262 7.13248 22.9604C7.26416 23.0946 7.44314 23.1714 7.63075 23.1742H10.7736C10.9612 23.1714 11.1402 23.0946 11.2719 22.9604C11.4036 22.8262 11.4774 22.6453 11.4774 22.4569C11.4774 22.2685 11.4036 22.0877 11.2719 21.9534C11.1402 21.8192 10.9612 21.7424 10.7736 21.7396ZM12.9594 21.9692C12.8039 21.9719 12.6558 22.0359 12.5469 22.1472C12.4379 22.2586 12.3769 22.4084 12.3769 22.5645C12.3769 22.7206 12.4379 22.8705 12.5468 22.9818C12.6558 23.0932 12.8039 23.1571 12.9593 23.1599C13.1147 23.1571 13.2629 23.0932 13.3718 22.9818C13.4807 22.8705 13.5418 22.7206 13.5418 22.5645C13.5418 22.4084 13.4808 22.2586 13.3718 22.1472C13.2629 22.0359 13.1148 21.9719 12.9594 21.9692ZM15.7736 21.9692C15.6182 21.9719 15.4701 22.0359 15.3612 22.1472C15.2522 22.2586 15.1912 22.4084 15.1912 22.5645C15.1912 22.7206 15.2522 22.8705 15.3611 22.9818C15.4701 23.0932 15.6182 23.1571 15.7736 23.1599C15.929 23.1571 16.0771 23.0932 16.1861 22.9818C16.295 22.8705 16.3561 22.7206 16.3561 22.5645C16.3561 22.4084 16.2951 22.2586 16.1861 22.1472C16.0772 22.0359 15.9291 21.9719 15.7736 21.9692ZM16.9093 18.892H7.90936C7.72184 18.8949 7.54298 18.9717 7.41139 19.1059C7.27981 19.2401 7.20606 19.4209 7.20606 19.6093C7.20606 19.7976 7.27981 19.9784 7.41139 20.1126C7.54298 20.2468 7.72184 20.3236 7.90936 20.3266H16.9094C17.0969 20.3236 17.2757 20.2468 17.4073 20.1126C17.5389 19.9784 17.6127 19.7976 17.6126 19.6092C17.6126 19.4209 17.5389 19.2401 17.4073 19.1059C17.2757 18.9717 17.0968 18.8949 16.9093 18.892ZM18.5879 21.9692C18.4325 21.9719 18.2844 22.0359 18.1755 22.1472C18.0665 22.2586 18.0055 22.4084 18.0055 22.5645C18.0055 22.7206 18.0665 22.8705 18.1755 22.9818C18.2844 23.0932 18.4325 23.1571 18.5879 23.1599C18.7434 23.1571 18.8915 23.0932 19.0004 22.9818C19.1094 22.8705 19.1704 22.7206 19.1704 22.5645C19.1704 22.4084 19.1094 22.2586 19.0004 22.1472C18.8915 22.0359 18.7434 21.9719 18.5879 21.9692ZM21.4022 21.9692C21.2468 21.9719 21.0987 22.0359 20.9897 22.1472C20.8808 22.2585 20.8198 22.4084 20.8197 22.5645C20.8197 22.7206 20.8808 22.8705 20.9897 22.9818C21.0986 23.0932 21.2468 23.1571 21.4022 23.1599C21.5576 23.1571 21.7057 23.0932 21.8147 22.9818C21.9236 22.8705 21.9847 22.7207 21.9847 22.5646C21.9847 22.4085 21.9236 22.2586 21.8147 22.1472C21.7058 22.0359 21.5577 21.9719 21.4022 21.9692ZM24.2165 21.9692C24.0611 21.9719 23.913 22.0359 23.804 22.1472C23.6951 22.2585 23.634 22.4084 23.634 22.5645C23.634 22.7206 23.6951 22.8705 23.804 22.9818C23.9129 23.0932 24.061 23.1571 24.2165 23.1599C24.3719 23.1571 24.52 23.0932 24.629 22.9818C24.7379 22.8705 24.7989 22.7207 24.7989 22.5646C24.799 22.4085 24.7379 22.2586 24.629 22.1472C24.5201 22.0359 24.3719 21.9719 24.2165 21.9692ZM25.445 16.532H7.90936C7.72176 16.5348 7.54278 16.6116 7.41109 16.7459C7.27941 16.8801 7.20559 17.0609 7.20559 17.2493C7.20559 17.4378 7.27941 17.6186 7.41109 17.7528C7.54278 17.887 7.72176 17.9638 7.90936 17.9666H25.445C25.6326 17.9638 25.8116 17.887 25.9433 17.7528C26.075 17.6186 26.1488 17.4378 26.1488 17.2493C26.1488 17.0609 26.075 16.8801 25.9433 16.7459C25.8116 16.6116 25.6326 16.5348 25.445 16.532ZM19.1879 13.957C19.1857 13.7996 19.1219 13.6494 19.0103 13.5388C18.8987 13.4283 18.7483 13.3663 18.5915 13.3663C18.4347 13.3663 18.2843 13.4282 18.1726 13.5388C18.061 13.6493 17.9972 13.7995 17.995 13.9569C17.9972 14.1144 18.061 14.2646 18.1726 14.3751C18.2842 14.4857 18.4347 14.5477 18.5914 14.5477C18.7482 14.5477 18.8987 14.4857 19.0103 14.3752C19.1219 14.2646 19.1857 14.1144 19.1879 13.957ZM22.0022 13.957C22 13.7996 21.9362 13.6494 21.8246 13.5388C21.713 13.4283 21.5625 13.3663 21.4058 13.3663C21.249 13.3663 21.0985 13.4282 20.9869 13.5388C20.8753 13.6493 20.8115 13.7995 20.8093 13.9569C20.8115 14.1144 20.8753 14.2646 20.9869 14.3751C21.0985 14.4857 21.249 14.5477 21.4057 14.5477C21.5625 14.5477 21.713 14.4857 21.8246 14.3752C21.9362 14.2646 22 14.1144 22.0022 13.957ZM24.8165 13.957C24.8143 13.7996 24.7505 13.6494 24.6389 13.5388C24.5273 13.4283 24.3768 13.3663 24.2201 13.3663C24.0633 13.3663 23.9128 13.4282 23.8012 13.5388C23.6896 13.6493 23.6258 13.7995 23.6236 13.9569C23.6258 14.1144 23.6896 14.2646 23.8012 14.3751C23.9128 14.4857 24.0632 14.5477 24.22 14.5477C24.3768 14.5477 24.5272 14.4857 24.6389 14.3752C24.7505 14.2646 24.8143 14.1144 24.8165 13.957ZM25.445 7.92447H7.90936C7.72184 7.92739 7.54298 8.00424 7.41139 8.13844C7.27981 8.27265 7.20606 8.45343 7.20606 8.64177C7.20606 8.8301 7.27981 9.01089 7.41139 9.14509C7.54298 9.27929 7.72184 9.35615 7.90936 9.35907H25.445C25.6326 9.35615 25.8114 9.27929 25.943 9.14509C26.0746 9.01089 26.1483 8.8301 26.1483 8.64177C26.1483 8.45343 26.0746 8.27265 25.943 8.13844C25.8114 8.00424 25.6326 7.92739 25.445 7.92447ZM27.0379 21.9692C26.8807 21.9692 26.7299 22.0319 26.6187 22.1435C26.5075 22.2552 26.445 22.4066 26.445 22.5645C26.445 22.7224 26.5075 22.8739 26.6187 22.9855C26.7299 23.0972 26.8807 23.1599 27.0379 23.1599C27.1951 23.1599 27.3459 23.0972 27.4571 22.9855C27.5683 22.8739 27.6307 22.7224 27.6307 22.5645C27.6307 22.4066 27.5683 22.2552 27.4571 22.1435C27.3459 22.0319 27.1951 21.9692 27.0379 21.9692ZM27.0379 13.3544C26.8811 13.3566 26.7315 13.4207 26.6215 13.5327C26.5114 13.6448 26.4497 13.7959 26.4497 13.9534C26.4497 14.1108 26.5114 14.2619 26.6215 14.374C26.7315 14.4861 26.8811 14.5501 27.0379 14.5523C27.1946 14.5501 27.3442 14.4861 27.4543 14.374C27.5644 14.2619 27.6261 14.1108 27.6261 13.9534C27.6261 13.7959 27.5644 13.6448 27.4543 13.5327C27.3442 13.4207 27.1946 13.3566 27.0379 13.3544Z" fill="#0F58F9"/>
              </svg>
            }
            active={activeProduct === "Presentation"}
            onClick={() => setActiveProduct("Presentation")}
          />
          <GenerateCard
            label={t('interface.generate.onePager', 'One-Pager')}
            svg={
              <svg width="32" height="35" viewBox="0 0 38 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={activeProduct === "One-Pager" ? "1" : "0.5"} d="M34.223 24.601H29.0018V4.20815C29.0014 3.26105 28.624 2.35284 27.9525 1.68314C27.281 1.01345 26.3703 0.637061 25.4206 0.636719H3.669C2.71933 0.637061 1.80867 1.01345 1.13715 1.68314C0.465639 2.35284 0.0882342 3.26105 0.0878906 4.20815V34.9224C0.0899107 36.4373 0.69423 37.8896 1.76833 38.9608C2.84244 40.032 4.29865 40.6347 5.81766 40.6367H32.3322C33.594 40.6346 34.8035 40.1332 35.6951 39.2427C36.5867 38.3521 37.0876 37.1452 37.0879 35.8867V27.4581C37.088 27.0829 37.014 26.7113 36.87 26.3646C36.7261 26.018 36.5151 25.7029 36.249 25.4376C35.983 25.1723 35.6671 24.9618 35.3195 24.8183C34.9718 24.6747 34.5993 24.6009 34.223 24.601ZM3.65467 7.37243C3.65512 6.80425 3.88164 6.25946 4.28449 5.85769C4.68735 5.45593 5.23361 5.23002 5.80334 5.22958H8.61809C9.18781 5.23003 9.73407 5.45594 10.1369 5.8577C10.5398 6.25947 10.7663 6.80425 10.7668 7.37243V10.1724C10.7663 10.7406 10.5398 11.2854 10.1369 11.6872C9.73407 12.0889 9.18781 12.3148 8.61809 12.3153H5.80334C5.23361 12.3148 4.68735 12.0889 4.28449 11.6872C3.88164 11.2854 3.65512 10.7406 3.65467 10.1724V7.37243ZM25.7358 24.1224C25.7352 24.3117 25.6596 24.4931 25.5254 24.6269C25.3912 24.7607 25.2093 24.8362 25.0196 24.8367H5.20171C5.01176 24.8367 4.82958 24.7615 4.69527 24.6275C4.56095 24.4936 4.48549 24.3119 4.48549 24.1224C4.48549 23.933 4.56095 23.7513 4.69527 23.6174C4.82958 23.4834 5.01176 23.4081 5.20171 23.4081H25.0196C25.2093 23.4087 25.3912 23.4841 25.5254 23.618C25.6596 23.7518 25.7352 23.9332 25.7358 24.1224ZM17.4133 35.5224H23.3436C23.5318 35.5251 23.7114 35.6015 23.8435 35.7352C23.9757 35.8688 24.0498 36.049 24.0498 36.2367C24.0498 36.4244 23.9757 36.6046 23.8435 36.7383C23.7114 36.8719 23.5318 36.9484 23.3436 36.951H17.4133C17.2252 36.9482 17.0457 36.8717 16.9137 36.7381C16.7816 36.6044 16.7076 36.4243 16.7076 36.2367C16.7076 36.0491 16.7816 35.869 16.9137 35.7353C17.0457 35.6017 17.2252 35.5252 17.4133 35.5224ZM5.20171 29.9367C5.01368 29.9338 4.83433 29.8573 4.70239 29.7236C4.57045 29.59 4.4965 29.41 4.4965 29.2224C4.4965 29.0349 4.57045 28.8549 4.70239 28.7212C4.83433 28.5876 5.01368 28.5111 5.20171 28.5081H17.2414C17.4294 28.5111 17.6088 28.5876 17.7407 28.7212C17.8726 28.8549 17.9466 29.0349 17.9466 29.2225C17.9466 29.41 17.8726 29.59 17.7407 29.7237C17.6087 29.8573 17.4294 29.9338 17.2414 29.9367H5.20171ZM4.17035 20.301C4.17092 20.1117 4.24656 19.9304 4.38076 19.7966C4.51495 19.6627 4.69679 19.5873 4.88657 19.5867H16.9263C17.1162 19.5867 17.2984 19.662 17.4327 19.7959C17.567 19.9299 17.6425 20.1116 17.6425 20.301C17.6425 20.4904 17.567 20.6721 17.4327 20.8061C17.2984 20.94 17.1162 21.0153 16.9263 21.0153H4.88657C4.69679 21.0147 4.51495 20.9393 4.38076 20.8055C4.24656 20.6716 4.17092 20.4903 4.17035 20.301ZM24.7044 15.9153H4.88657C4.69854 15.9124 4.5192 15.8358 4.38726 15.7022C4.25532 15.5686 4.18138 15.3885 4.18138 15.201C4.18139 15.0134 4.25534 14.8334 4.38729 14.6998C4.51923 14.5661 4.69858 14.4896 4.88661 14.4867H24.7044C24.8925 14.4896 25.0718 14.5662 25.2037 14.6998C25.3357 14.8334 25.4096 15.0135 25.4096 15.201C25.4096 15.3886 25.3357 15.5686 25.2037 15.7022C25.0718 15.8359 24.8925 15.9124 24.7044 15.9153ZM14.2404 9.84386H19.9917C20.1798 9.84664 20.3593 9.92312 20.4913 10.0568C20.6233 10.1904 20.6974 10.3705 20.6974 10.5581C20.6974 10.7458 20.6233 10.9259 20.4913 11.0595C20.3593 11.1932 20.1798 11.2697 19.9917 11.2724H14.2404C14.0523 11.2697 13.8728 11.1932 13.7408 11.0595C13.6088 10.9259 13.5347 10.7458 13.5347 10.5581C13.5347 10.3705 13.6088 10.1904 13.7408 10.0568C13.8728 9.92312 14.0523 9.84664 14.2404 9.84386ZM13.5242 6.98672C13.5248 6.79745 13.6004 6.61609 13.7346 6.48225C13.8688 6.34842 14.0506 6.27298 14.2404 6.27243H22.9425C23.1325 6.27243 23.3146 6.34769 23.449 6.48164C23.5833 6.6156 23.6587 6.79728 23.6587 6.98672C23.6587 7.17616 23.5833 7.35784 23.449 7.4918C23.3146 7.62575 23.1325 7.701 22.9425 7.701H14.2404C14.0506 7.70044 13.8688 7.625 13.7346 7.49117C13.6004 7.35734 13.5248 7.17599 13.5242 6.98672ZM4.17035 36.2367C4.17002 36.1428 4.18833 36.0498 4.22421 35.963C4.26008 35.8762 4.31283 35.7973 4.3794 35.7309C4.44597 35.6645 4.52506 35.6119 4.6121 35.5761C4.69914 35.5404 4.79243 35.5221 4.88657 35.5224H10.8169C11.0068 35.5224 11.189 35.5977 11.3233 35.7316C11.4577 35.8656 11.5331 36.0473 11.5331 36.2367C11.5331 36.4262 11.4577 36.6078 11.3233 36.7418C11.189 36.8758 11.0068 36.951 10.8169 36.951H4.88657C4.69679 36.9505 4.51494 36.875 4.38074 36.7412C4.24654 36.6074 4.1709 36.426 4.17035 36.2367ZM35.6554 35.8867C35.6493 36.5402 35.4505 37.1775 35.0837 37.7191C34.717 38.2607 34.1985 38.6827 33.593 38.9324C32.9874 39.1822 32.3215 39.2488 31.6783 39.1238C31.0351 38.9988 30.443 38.6878 29.9758 38.2295C29.6653 37.9233 29.4192 37.5583 29.2519 37.156C29.0847 36.7538 28.9996 36.3222 29.0018 35.8867V26.0296H34.223C34.6026 26.0307 34.9663 26.1816 35.2347 26.4492C35.5031 26.7169 35.6543 27.0796 35.6554 27.4581V35.8867ZM5.08712 10.1724V7.37243C5.08767 7.18316 5.1633 7.0018 5.2975 6.86796C5.4317 6.73413 5.61355 6.6587 5.80334 6.65815H8.61809C8.80787 6.6587 8.98973 6.73413 9.12393 6.86796C9.25812 7.0018 9.33376 7.18316 9.33431 7.37243C9.27581 11.5643 10.0021 10.8248 5.80334 10.8867C5.61355 10.8862 5.4317 10.8107 5.2975 10.6769C5.16331 10.5431 5.08767 10.3617 5.08712 10.1724Z" fill="#EB8BFF"/>
              </svg>
            }
            active={activeProduct === "One-Pager"}
            onClick={() => setActiveProduct("One-Pager")}
          />
          </div>
        </div>

        {/* Dropdown chips */}
        {activeProduct === "Course" && (
          <div className="flex flex-wrap justify-center gap-4 my-1">
            <CustomPillSelector
              value={`${modulesCount} ${t('interface.generate.modules', 'Modules')}`}
              onValueChange={(value) => setModulesCount(Number(value.split(' ')[0]))}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: `${i + 1} ${t('interface.generate.modules', 'Modules')}`,
                label: `${i + 1} ${t('interface.generate.modules', 'Modules')}`
              }))}
              label={t('interface.generate.modules', 'Modules')}
            />
            <CustomPillSelector
              value={lessonsPerModule}
              onValueChange={setLessonsPerModule}
              options={["1-2", "3-4", "5-7", "8-10"].map((rng) => ({
                value: `${rng} ${t('interface.generate.perModule', 'per module')}`,
                label: `${rng} ${t('interface.generate.perModule', 'per module')}`
              }))}
              label={t('interface.generate.lessons', 'Lessons')}
            />
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
          </div>
        )}

        {activeProduct === "Presentation" && useExistingOutline !== null && (
          <div className="flex flex-wrap justify-center gap-4">
                {/* Show outline flow if user chose existing outline */}
                {useExistingOutline === true && (
                  <>
                    {/* Outline dropdown */}
                    <CustomPillSelector
                      value={selectedOutlineId !== null ? outlines.find(o => o.id === selectedOutlineId)?.name ?? "" : ""}
                      onValueChange={(value) => {
                        const outline = outlines.find(o => o.name === value);
                        setSelectedOutlineId(outline ? outline.id : null);
                        // clear module & lesson selections when outline changes
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
                        setSelectedLesson("");
                      }}
                      options={outlines.map((o) => ({
                        value: o.name,
                        label: o.name
                      }))}
                      label="Outline"
                    />

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedOutlineId && (
                      <CustomPillSelector
                        value={selectedModuleIndex !== null ? modulesForOutline[selectedModuleIndex]?.name ?? "" : ""}
                        onValueChange={(value) => {
                          const idx = modulesForOutline.findIndex(m => m.name === value);
                          setSelectedModuleIndex(idx !== -1 ? idx : null);
                          setLessonsForModule(idx !== -1 ? modulesForOutline[idx].lessons : []);
                          setSelectedLesson("");
                        }}
                        options={modulesForOutline.map((m, idx) => ({
                          value: m.name,
                          label: m.name
                        }))}
                        label={t('interface.generate.modules', 'Modules')}
                      />
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedModuleIndex !== null && (
                      <CustomPillSelector
                        value={selectedLesson}
                        onValueChange={setSelectedLesson}
                        options={lessonsForModule.map((l) => ({
                          value: l,
                          label: l
                        }))}
                        label="Lesson"
                      />
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <>
                        <CustomPillSelector
                          value={language}
                          onValueChange={setLanguage}
                          options={[
                            { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                            { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                            { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                            { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                          ]}
                          label={t('interface.language', 'Language')}
                        />
                        <CustomPillSelector
                          value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
                          onValueChange={(value) => setSlidesCount(Number(value.split(' ')[0]))}
                          options={Array.from({ length: 14 }, (_, i) => ({
                            value: `${i + 2} ${t('interface.generate.slides', 'slides')}`,
                            label: `${i + 2} ${t('interface.generate.slides', 'slides')}`
                          }))}
                          label={t('interface.generate.slides', 'Slides')}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Show standalone presentation dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <>
                    <CustomPillSelector
                      value={language}
                      onValueChange={setLanguage}
                      options={[
                        { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                        { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                        { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                        { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                      ]}
                      label={t('interface.language', 'Language')}
                    />
                    <CustomPillSelector
                      value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
                      onValueChange={(value) => setSlidesCount(Number(value.split(' ')[0]))}
                      options={Array.from({ length: 14 }, (_, i) => ({
                        value: `${i + 2} ${t('interface.generate.slides', 'slides')}`,
                        label: `${i + 2} ${t('interface.generate.slides', 'slides')}`
                      }))}
                      label={t('interface.generate.slides', 'Slides')}
                    />
                  </>
                )}
              </div>
        )}

        {/* Quiz Configuration */}
        {activeProduct === "Quiz" && useExistingQuizOutline !== null && (
          <div className="flex flex-wrap justify-center gap-4">
                {/* Show outline flow if user chose existing outline */}
                {useExistingQuizOutline === true && (
                  <>
                    {/* Outline dropdown */}
                    <CustomPillSelector
                      value={selectedQuizOutlineId !== null ? quizOutlines.find(o => o.id === selectedQuizOutlineId)?.name ?? "" : ""}
                      onValueChange={(value) => {
                        const outline = quizOutlines.find(o => o.name === value);
                        setSelectedQuizOutlineId(outline ? outline.id : null);
                        // clear module & lesson selections when outline changes
                        setSelectedQuizModuleIndex(null);
                        setQuizLessonsForModule([]);
                        setSelectedQuizLesson("");
                      }}
                      options={quizOutlines.map((outline) => ({
                        value: outline.name,
                        label: outline.name
                      }))}
                      label="Outline"
                    />

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedQuizOutlineId && (
                      <CustomPillSelector
                        value={selectedQuizModuleIndex !== null ? quizModulesForOutline[selectedQuizModuleIndex]?.name ?? "" : ""}
                        onValueChange={(value) => {
                          const idx = quizModulesForOutline.findIndex(m => m.name === value);
                          setSelectedQuizModuleIndex(idx !== -1 ? idx : null);
                          setQuizLessonsForModule(idx !== -1 ? quizModulesForOutline[idx].lessons : []);
                          setSelectedQuizLesson("");
                        }}
                        options={quizModulesForOutline.map((m, idx) => ({
                          value: m.name,
                          label: m.name
                        }))}
                        label="Module"
                      />
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedQuizModuleIndex !== null && (
                      <CustomPillSelector
                        value={selectedQuizLesson}
                        onValueChange={setSelectedQuizLesson}
                        options={quizLessonsForModule.map((l) => ({
                          value: l,
                          label: l
                        }))}
                        label="Lesson"
                      />
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedQuizLesson && (
                      <>
                        <CustomPillSelector
                          value={quizLanguage}
                          onValueChange={setQuizLanguage}
                          options={[
                            { value: "English", label: t('interface.english', 'English') },
                            { value: "Ukrainian", label: t('interface.ukrainian', 'Ukrainian') },
                            { value: "Spanish", label: t('interface.spanish', 'Spanish') },
                            { value: "Russian", label: t('interface.russian', 'Russian') }
                          ]}
                          label={t('interface.language', 'Language')}
                        />
                        <CustomMultiSelector
                          selectedValues={selectedQuestionTypes}
                          onSelectionChange={setSelectedQuestionTypes}
                          options={[
                            { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                            { value: "multi-select", label: t('interface.generate.multiSelect', 'Multiple Select') },
                            { value: "matching", label: t('interface.generate.matching', 'Matching') },
                            { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                            { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                          ]}
                          label={t('interface.generate.questionTypes', 'Question Types')}
                          placeholder={t('interface.generate.selectQuestionTypes', 'Select Question Types')}
                        />
                        <CustomPillSelector
                          value={`${quizQuestionCount} ${t('interface.generate.questions', 'questions')}`}
                          onValueChange={(value) => setQuizQuestionCount(Number(value.split(' ')[0]))}
                          options={[5, 10, 15, 20, 25, 30].map((count) => ({
                            value: `${count} ${t('interface.generate.questions', 'questions')}`,
                            label: `${count} ${t('interface.generate.questions', 'questions')}`
                          }))}
                          label={t('interface.generate.questions', 'Questions')}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Show standalone quiz dropdowns if user chose standalone */}
                {useExistingQuizOutline === false && (
                  <>
                    <CustomPillSelector
                      value={quizLanguage}
                      onValueChange={setQuizLanguage}
                      options={[
                        { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                        { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                        { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                        { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                      ]}
                      label={t('interface.language', 'Language')}
                    />
                    <CustomMultiSelector
                      selectedValues={selectedQuestionTypes}
                      onSelectionChange={setSelectedQuestionTypes}
                      options={[
                        { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                        { value: "multi-select", label: t('interface.generate.multiSelect', 'Multiple Select') },
                        { value: "matching", label: t('interface.generate.matching', 'Matching') },
                        { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                        { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                      ]}
                      label={t('interface.generate.questionTypes', 'Question Types')}
                      placeholder={t('interface.generate.selectQuestionTypes', 'Select Question Types')}
                    />
                    <CustomPillSelector
                      value={`${quizQuestionCount} ${t('interface.generate.questions', 'questions')}`}
                      onValueChange={(value) => setQuizQuestionCount(Number(value.split(' ')[0]))}
                      options={[5, 10, 15, 20, 25, 30].map((count) => ({
                        value: `${count} ${t('interface.generate.questions', 'questions')}`,
                        label: `${count} ${t('interface.generate.questions', 'questions')}`
                      }))}
                      label={t('interface.generate.questions', 'Questions')}
                    />
                  </>
                )}
              </div>
        )}

        {/* One-Pager Configuration */}
        {activeProduct === "One-Pager" && useExistingTextOutline !== null && (
          <div className="flex flex-wrap justify-center gap-4">
                {/* Show outline flow if user chose existing outline */}
                {useExistingTextOutline === true && (
                  <>
                    {/* Outline dropdown */}
                    <CustomPillSelector
                      value={selectedTextOutlineId !== null ? textOutlines.find(o => o.id === selectedTextOutlineId)?.name ?? "" : ""}
                      onValueChange={(value) => {
                        const outline = textOutlines.find(o => o.name === value);
                        setSelectedTextOutlineId(outline ? outline.id : null);
                        // clear module & lesson selections when outline changes
                        setSelectedTextModuleIndex(null);
                        setTextLessonsForModule([]);
                        setSelectedTextLesson("");
                      }}
                      options={textOutlines.map((o) => ({
                        value: o.name,
                        label: o.name
                      }))}
                      label="Outline"
                    />

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedTextOutlineId && (
                      <CustomPillSelector
                        value={selectedTextModuleIndex !== null ? textModulesForOutline[selectedTextModuleIndex]?.name ?? "" : ""}
                        onValueChange={(value) => {
                          const idx = textModulesForOutline.findIndex(m => m.name === value);
                          setSelectedTextModuleIndex(idx !== -1 ? idx : null);
                          setTextLessonsForModule(idx !== -1 ? textModulesForOutline[idx].lessons : []);
                          setSelectedTextLesson("");
                        }}
                        options={textModulesForOutline.map((m, idx) => ({
                          value: m.name,
                          label: m.name
                        }))}
                        label="Module"
                      />
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedTextModuleIndex !== null && (
                      <CustomPillSelector
                        value={selectedTextLesson}
                        onValueChange={setSelectedTextLesson}
                        options={textLessonsForModule.map((l) => ({
                          value: l,
                          label: l
                        }))}
                        label="Lesson"
                      />
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedTextLesson && (
                      <>
                        <CustomPillSelector
                          value={textLanguage}
                          onValueChange={setTextLanguage}
                          options={[
                            { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                            { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                            { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                            { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                          ]}
                          label={t('interface.language', 'Language')}
                        />
                        <CustomPillSelector
                          value={textLength}
                          onValueChange={setTextLength}
                          options={[
                            { value: t('interface.generate.short', 'Short'), label: t('interface.generate.short', 'Short') },
                            { value: t('interface.generate.medium', 'Medium'), label: t('interface.generate.medium', 'Medium') },
                            { value: t('interface.generate.long', 'Long'), label: t('interface.generate.long', 'Long') }
                          ]}
                          label={t('interface.generate.length', 'Length')}
                        />
                        <CustomMultiSelector
                          selectedValues={textStyles}
                          onSelectionChange={setTextStyles}
                          options={[
                            { value: "headlines", label: t('interface.generate.headlines', 'Headlines'), tooltip: stylePurposes.headlines },
                            { value: "paragraphs", label: t('interface.generate.paragraphs', 'Paragraphs'), tooltip: stylePurposes.paragraphs },
                            { value: "bullet_lists", label: t('interface.generate.bulletLists', 'Bullet Lists'), tooltip: stylePurposes.bullet_lists },
                            { value: "numbered_lists", label: t('interface.generate.numberedLists', 'Numbered Lists'), tooltip: stylePurposes.numbered_lists },
                            { value: "alerts", label: t('interface.generate.alerts', 'Alerts'), tooltip: stylePurposes.alerts },
                            { value: "recommendations", label: t('interface.generate.recommendations', 'Recommendations'), tooltip: stylePurposes.recommendations },
                            { value: "section_breaks", label: t('interface.generate.sectionBreaks', 'Section Breaks'), tooltip: stylePurposes.section_breaks },
                            { value: "icons", label: t('interface.generate.icons', 'Icons'), tooltip: stylePurposes.icons },
                            { value: "important_sections", label: t('interface.generate.importantSections', 'Important Sections'), tooltip: stylePurposes.important_sections }
                          ]}
                          label={t('interface.generate.selectStyles', 'Styles')}
                          placeholder={t('interface.generate.selectStyles', 'Select styles')}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Show standalone one-pager dropdowns if user chose standalone */}
                {useExistingTextOutline === false && (
                  <>
                    <CustomPillSelector
                      value={textLanguage}
                      onValueChange={setTextLanguage}
                      options={[
                        { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                        { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                        { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                        { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
                      ]}
                      label={t('interface.language', 'Language')}
                      />
                    <CustomPillSelector
                      value={textLength}
                      onValueChange={setTextLength}
                      options={[
                        { value: t('interface.generate.short', 'Short'), label: t('interface.generate.short', 'Short') },
                        { value: t('interface.generate.medium', 'Medium'), label: t('interface.generate.medium', 'Medium') },
                        { value: t('interface.generate.long', 'Long'), label: t('interface.generate.long', 'Long') }
                      ]}
                      label={t('interface.generate.length', 'Length')}
                    />
                    <CustomMultiSelector
                      selectedValues={textStyles}
                      onSelectionChange={setTextStyles}
                      options={[
                        { value: "headlines", label: t('interface.generate.headlines', 'Headlines'), tooltip: stylePurposes.headlines },
                        { value: "paragraphs", label: t('interface.generate.paragraphs', 'Paragraphs'), tooltip: stylePurposes.paragraphs },
                        { value: "bullet_lists", label: t('interface.generate.bulletLists', 'Bullet Lists'), tooltip: stylePurposes.bullet_lists },
                        { value: "numbered_lists", label: t('interface.generate.numberedLists', 'Numbered Lists'), tooltip: stylePurposes.numbered_lists },
                        { value: "alerts", label: t('interface.generate.alerts', 'Alerts'), tooltip: stylePurposes.alerts },
                        { value: "recommendations", label: t('interface.generate.recommendations', 'Recommendations'), tooltip: stylePurposes.recommendations },
                        { value: "section_breaks", label: t('interface.generate.sectionBreaks', 'Section Breaks'), tooltip: stylePurposes.section_breaks },
                        { value: "icons", label: t('interface.generate.icons', 'Icons'), tooltip: stylePurposes.icons },
                        { value: "important_sections", label: t('interface.generate.importantSections', 'Important Sections'), tooltip: stylePurposes.important_sections }
                      ]}
                      label={t('interface.generate.selectStyles', 'Styles')}
                      placeholder={t('interface.generate.selectStyles', 'Select styles')}
                    />
                  </>
                )}
              </div>
        )}

        {/* Video Lesson Configuration */}
        {activeProduct === "Video Lesson" && (
          <div className="flex flex-wrap justify-center gap-4">
            <CustomPillSelector
              value={`${slidesCount} ${t('interface.generate.slides', 'slides')}`}
              onValueChange={(value) => setSlidesCount(Number(value.split(' ')[0]))}
              options={[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((count) => ({
                value: `${count} ${t('interface.generate.slides', 'slides')}`,
                label: `${count} ${t('interface.generate.slides', 'slides')}`
              }))}
              label={t('interface.generate.slides', 'Slides')}
            />
            <CustomPillSelector
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: t('interface.english', 'English'), label: t('interface.english', 'English') },
                { value: t('interface.ukrainian', 'Ukrainian'), label: t('interface.ukrainian', 'Ukrainian') },
                { value: t('interface.spanish', 'Spanish'), label: t('interface.spanish', 'Spanish') },
                { value: t('interface.russian', 'Russian'), label: t('interface.russian', 'Russian') }
              ]}
              label={t('interface.language', 'Language')}
            />
          </div>
        )}

        {/* Prompt Input Area - shown for standalone products or when no outline is selected */}
        {((activeProduct === "Course") || 
          (activeProduct === "Video Lesson") ||
          (activeProduct === "One-Pager" && useExistingTextOutline === false) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === false) ||
          (activeProduct === "Presentation" && useExistingOutline === false)) && (
          <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
            {/* Simple prompt input */}
            <div className="w-full relative">
            <Textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isFromKnowledgeBase 
                ? t('interface.generate.knowledgeBasePromptPlaceholder', 'Enter a topic or question to search your Knowledge Base...')
                : t('interface.generate.promptPlaceholder', 'Describe what you\'d like to make...')}
              className="w-[95%] mx-auto px-7 py-5 rounded-md bg-white shadow-lg text-lg text-black resize-none overflow-hidden max-h-[320px] border border-gray-100 focus:border-blue-300 focus:outline-none transition-colors placeholder-gray-400 relative z-10"
              style={{ background: "rgba(255,255,255,0.95)" }}
              rows={1}
            />
            </div>

            {/* Simple examples grid */}
            <div className={`w-full transition-all duration-300 ${prompt.trim() ? 'opacity-0 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-screen'}`}>
            <div className="w-full relative z-0">
              <div className="relative flex items-center justify-center mb-2">
                <span className="bg-transparent text-lg font-semibold text-[#FBFAFF] text-center" style={{ letterSpacing: 0 }}>
                  {t('interface.generate.examplePrompts', 'Example prompts')}
                </span>
                <button onClick={shuffleExamples} className="absolute left-1/2 ml-24 flex items-center gap-1.5 text-[#FBFAFF] hover:opacity-80 transition-opacity cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.8">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.1663 9.99992C19.1663 4.93742 15.0622 0.833252 9.99967 0.833252C4.93717 0.833252 0.833008 4.93742 0.833008 9.99992C0.833008 15.0624 4.93717 19.1666 9.99967 19.1666C15.0622 19.1666 19.1663 15.0624 19.1663 9.99992ZM8.92217 5.58908C9.07397 5.43192 9.15797 5.22141 9.15607 5.00292C9.15417 4.78442 9.06653 4.57541 8.91202 4.4209C8.75752 4.2664 8.54851 4.17876 8.33001 4.17686C8.11151 4.17496 7.90101 4.25895 7.74384 4.41075L6.07717 6.07742C5.92095 6.23369 5.83319 6.44561 5.83319 6.66658C5.83319 6.88755 5.92095 7.09948 6.07717 7.25575L7.74384 8.92242C7.90101 9.07422 8.11151 9.15821 8.33001 9.15631C8.54851 9.15441 8.75752 9.06677 8.91202 8.91227C9.06653 8.75776 9.15417 8.54875 9.15607 8.33025C9.15797 8.11175 9.07397 7.90125 8.92217 7.74408L8.67801 7.49992H11.6663C11.8874 7.49992 12.0993 7.58772 12.2556 7.744C12.4119 7.90028 12.4997 8.11224 12.4997 8.33325V9.16658C12.4997 9.3876 12.5875 9.59956 12.7438 9.75584C12.9 9.91212 13.112 9.99992 13.333 9.99992C13.554 9.99992 13.766 9.91212 13.9223 9.75584C14.0785 9.59956 14.1663 9.3876 14.1663 9.16658V8.33325C14.1663 7.67021 13.9029 7.03433 13.4341 6.56548C12.9653 6.09664 12.3294 5.83325 11.6663 5.83325H8.67801L8.92217 5.58908ZM7.49967 10.8333C7.49967 10.6122 7.41188 10.4003 7.2556 10.244C7.09932 10.0877 6.88735 9.99992 6.66634 9.99992C6.44533 9.99992 6.23337 10.0877 6.07709 10.244C5.9208 10.4003 5.83301 10.6122 5.83301 10.8333V11.6666C5.83301 12.3296 6.0964 12.9655 6.56524 13.4344C7.03408 13.9032 7.66997 14.1666 8.33301 14.1666H11.3213L11.0772 14.4108C10.9254 14.5679 10.8414 14.7784 10.8433 14.9969C10.8452 15.2154 10.9328 15.4244 11.0873 15.5789C11.2418 15.7334 11.4508 15.8211 11.6693 15.823C11.8878 15.8249 12.0983 15.7409 12.2555 15.5891L13.9222 13.9224C14.0784 13.7661 14.1662 13.5542 14.1662 13.3333C14.1662 13.1123 14.0784 12.9004 13.9222 12.7441L12.2555 11.0774C12.0983 10.9256 11.8878 10.8416 11.6693 10.8435C11.4508 10.8454 11.2418 10.9331 11.0873 11.0876C10.9328 11.2421 10.8452 11.4511 10.8433 11.6696C10.8414 11.8881 10.9254 12.0986 11.0772 12.2558L11.3213 12.4999H8.33301C8.11199 12.4999 7.90003 12.4121 7.74375 12.2558C7.58747 12.0996 7.49967 11.8876 7.49967 11.6666V10.8333Z" fill="#FDFDFD"/>
                    </g>
                  </svg>
                  <span className="text-sm font-medium">Shuffle</span>
                </button>
              </div>
              <div className="grid grid-rows-2 sm:grid-cols-3 grid-flow-col gap-4">
                {Array.from({ length: 6 }).map((_, index) =>
                  examples[index] ? (
                    <button
                      key={index}
                      onClick={() => setPrompt(examples[index])}
                      className="flex flex-row justify-between items-center w-full p-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer relative opacity-80 hover:opacity-100"
                      style={{ backdropFilter: "blur(2px)", minHeight: 80, backgroundColor: "#FDFDFD", border: "1px solid #E0E0E0", color: "#71717A" }}
                    >
                      <span className="text-left leading-tight flex-1 pr-2">{examples[index]}</span>Te
                      <span className="absolute top-1 right-2 text-xl leading-none" style={{ color: "#71717A", fontWeight: 200 }}>+</span>
                    </button>
                  ) : (
                    <div key={index} className="w-full px-3 py-2 rounded-full bg-transparent" />
                  )
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Generate Button */}
        {((activeProduct === "Course" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Video Lesson" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "One-Pager" && useExistingTextOutline === true && selectedTextOutlineId && selectedTextLesson) ||
          (activeProduct === "One-Pager" && useExistingTextOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === true && selectedQuizOutlineId && selectedQuizLesson) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Presentation" && useExistingOutline === true && selectedOutlineId && selectedLesson) ||
          (activeProduct === "Presentation" && useExistingOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors))) && (
          <div className="flex justify-center mt-3 mb-4">
            <Button
              onClick={() => {
                sessionStorage.setItem('activeProductType', activeProduct);
                switch (activeProduct) {
                  case "Course":
                    handleCourseOutlineStart();
                    break;
                  case "Video Lesson":
                    handleVideoLessonStart();
                    break;
                  case "One-Pager":
                    handleTextPresentationStart();
                    break;
                  case "Quiz":
                    handleQuizStart();
                    break;
                  case "Presentation":
                    handleSlideDeckStart();
                    break;
                }
              }}
              size="lg"
              className="flex items-center gap-2 px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow transition-colors"
              style={{ minWidth: 240 }}
            >
              <Sparkles size={20} />
              {activeProduct === "Course" && t('interface.generate.generateCourseOutline', 'Generate Course')}
              {activeProduct === "Video Lesson" && t('interface.generate.generateVideoLesson', 'Generate Video Lesson')}
              {activeProduct === "Presentation" && t('interface.generate.generatePresentation', 'Generate Presentation')}
              {activeProduct === "Quiz" && t('interface.generate.generateQuiz', 'Generate Quiz')}
              {activeProduct === "One-Pager" && t('interface.generate.generateOnePager', 'Generate One-Pager')}
            </Button>
          </div>
        )}
        </div> {/* close inner flex container */}

      {/* Feedback button */}
      <button
        className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-l-lg cursor-pointer group"
        style={{
          width: '38px',
          height: '98px',
        }}
        onClick={() => {
          // Add your feedback handler here
          console.log('Feedback clicked');
        }}
      >
        <span
          className="font-medium opacity-50 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
          style={{
            fontSize: '14px',
            color: '#0F58F9',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
          }}
        >
          Feedback
        </span>
      </button>
    </main>
  );
}

export default function GeneratePage() {
  const { t } = useLanguage();
  
  return (
    <Suspense fallback={<div>{t('interface.generate.loading', 'Loading...')}</div>}>
      <GenerateProductPicker />
    </Suspense>
  );
}