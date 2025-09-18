"use client";
// @ts-nocheck

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Shuffle, Sparkles, Plus, FileText, ChevronDown, Search, FolderIcon } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, CustomPillSelector } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HeadTextCustom } from "@/components/ui/head-text-custom";

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
  
  // NEW: Connector context from URL parameters and sessionStorage
  const isFromConnectors = searchParams?.get('fromConnectors') === 'true';
  const connectorIds = searchParams?.get('connectorIds')?.split(',').filter(Boolean) || [];
  const connectorSources = searchParams?.get('connectorSources')?.split(',').filter(Boolean) || [];
  const [connectorContext, setConnectorContext] = useState<{
    fromConnectors: boolean;
    connectorIds: string[];
    connectorSources: string[];
  } | null>(null);

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
  const [lessonsPerModule, setLessonsPerModule] = useState("3-4");
  const [language, setLanguage] = useState("en");

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
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

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

  const [activeProduct, setActiveProduct] = useState<"Course Outline" | "Video Lesson" | "Presentation" | "Quiz" | "One-Pager">("Course Outline");

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
        setUseExistingOutline(null);
        setSelectedOutlineId(null);
        setSelectedModuleIndex(null);
        setLessonsForModule([]);
        setSelectedLesson("");
      }
      
      // Clear quiz context when switching away from Quiz
      if (activeProduct !== "Quiz") {
        setUseExistingQuizOutline(null);
        setSelectedQuizOutlineId(null);
        setSelectedQuizModuleIndex(null);
        setQuizLessonsForModule([]);
        setSelectedQuizLesson("");
      }
      
      // Clear text presentation context when switching away from One-Pager
      if (activeProduct !== "One-Pager") {
        setUseExistingTextOutline(null);
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
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(null);

  // --- Quiz specific state ---
  const [quizOutlines, setQuizOutlines] = useState<{ id: number; name: string }[]>([]);
  const [selectedQuizOutlineId, setSelectedQuizOutlineId] = useState<number | null>(null);
  const [quizModulesForOutline, setQuizModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedQuizModuleIndex, setSelectedQuizModuleIndex] = useState<number | null>(null);
  const [quizLessonsForModule, setQuizLessonsForModule] = useState<string[]>([]);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState<string>("");
  const [quizQuestionCount, setQuizQuestionCount] = useState(10);
  const [quizLanguage, setQuizLanguage] = useState("en");
  const [useExistingQuizOutline, setUseExistingQuizOutline] = useState<boolean | null>(null);
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
    
    params.set("lang", language);

    // Add connector context if coming from connectors
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
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
    params.set("lang", quizLanguage);
    
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
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    // Add connector context if coming from connectors
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    router.push(`/create/quiz?${params.toString()}`);
  };

  // Text Presentation state (mimicking quiz pattern)
  const [useExistingTextOutline, setUseExistingTextOutline] = useState<boolean | null>(null);
  const [textOutlines, setTextOutlines] = useState<{ id: number; name: string }[]>([]);
  const [textModulesForOutline, setTextModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedTextModuleIndex, setSelectedTextModuleIndex] = useState<number | null>(null);
  const [textLessonsForModule, setTextLessonsForModule] = useState<string[]>([]);
  const [selectedTextOutlineId, setSelectedTextOutlineId] = useState<number | null>(null);
  const [selectedTextLesson, setSelectedTextLesson] = useState<string>("");
  const [textLanguage, setTextLanguage] = useState<string>("en");
  const [textLength, setTextLength] = useState<string>("medium");
  const [textStyles, setTextStyles] = useState<string[]>(["headlines", "paragraphs", "bullet_lists", "numbered_lists", "alerts", "recommendations", "section_breaks", "icons", "important_sections"]);
  const [showTextStylesDropdown, setShowTextStylesDropdown] = useState(false);

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
    params.set("lang", textLanguage);
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
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    // Add connector context if coming from connectors
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    router.push(`/create/text-presentation?${params.toString()}`);
  };

  const handleVideoLessonStart = () => {
    // Check if prompt entered or coming from files/text/knowledge base
    if (!prompt.trim() && !isFromFiles && !isFromText && !isFromKnowledgeBase) return;

    const params = new URLSearchParams();
    params.set("productType", "video_lesson_presentation"); // Flag to indicate video lesson with voiceover
    params.set("length", lengthRangeForOption(lengthOption));
    params.set("slidesCount", String(slidesCount));
    params.set("lang", language);
    
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
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    // Add connector context if coming from connectors
    if (connectorContext?.fromConnectors) {
      params.set("fromConnectors", "true");
      params.set("connectorIds", connectorContext.connectorIds.join(','));
      params.set("connectorSources", connectorContext.connectorSources.join(','));
    }

    router.push(`/create/lesson-presentation?${params.toString()}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-gradient-to-r from-[#00BBFF66]/40 to-[#00BBFF66]/10"
    >
      <div className="w-full max-w-4xl flex flex-col gap-10 items-center">
        {/* back button absolute top-left */}
        <Link
          href="/create"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-full px-4 py-2 border border-gray-200 bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={16} /> {t('interface.generate.back', 'Back')}
        </Link>

        <HeadTextCustom 
          text={t('interface.generate.title', 'Generate')} 
          description={isFromFiles ? t('interface.generate.subtitleFromFiles', 'Create content from your selected files') : 
            isFromText ? t('interface.generate.subtitleFromText', 'Create content from your text') : 
            isFromKnowledgeBase ? t('interface.generate.subtitleFromKnowledgeBase', 'Create content by searching your Knowledge Base') :
            isFromConnectors ? t('interface.generate.subtitleFromConnectors', 'Create content from your selected connectors') :
            t('interface.generate.subtitle', 'What would you like to create today?')}
        />

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
          <Alert className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 shadow-sm">
            <AlertDescription className="text-green-700">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <FileText className="h-5 w-5" />
                {t('interface.generate.creatingFromText', 'Creating from text')}
              </div>
              <p className="font-medium">
                {textMode === 'context' ? t('interface.generate.modeUsingAsContext', 'Mode: Using as context') : t('interface.generate.modeUsingAsBaseStructure', 'Mode: Using as base structure')}
              </p>
              <p className="mt-1 text-green-600">
                {textMode === 'context' 
                  ? t('interface.generate.aiWillUseTextAsContext', 'The AI will use your text as reference material and context to create new educational content.')
                  : t('interface.generate.aiWillBuildUponText', 'The AI will build upon your existing content structure, enhancing and formatting it into a comprehensive educational product.')}
              </p>
              {userText && (
                <p className="mt-2 text-xs text-green-600 bg-green-100/80 p-2 rounded max-h-20 overflow-y-auto">
                  {userText.length > 200 ? `${userText.substring(0, 200)}...` : userText}
                </p>
              )}
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m-2 8l2 2-2 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  {t('interface.generate.creatingFromConnectors', 'Creating from Selected Connectors')}
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  {t('interface.generate.aiWillUseConnectorData', 'The AI will use data from your selected connectors to create educational content.')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {connectorContext.connectorSources.map((source, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m-2 8l2 2-2 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  {t('interface.generate.creatingFromConnectors', 'Creating from Selected Connectors')}
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  {t('interface.generate.aiWillUseConnectorData', 'The AI will use data from your selected connectors to create educational content.')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {connectorContext.connectorSources.map((source, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6 sm:mb-8 px-4">
          <GenerateCard
            label={t('interface.generate.courseOutline', 'Course Outline')}
            Icon={CourseOutlineIcon}
            active={activeProduct === "Course Outline"}
            onClick={() => setActiveProduct("Course Outline")}
          />
          <GenerateCard 
            label={t('interface.generate.videoLesson', 'Video Lesson')} 
            Icon={VideoScriptIcon}
            active={activeProduct === "Video Lesson"}
            onClick={() => setActiveProduct("Video Lesson")}
          />
          <GenerateCard 
            label={t('interface.generate.quiz', 'Quiz')} 
            Icon={QuizIcon}
            active={activeProduct === "Quiz"}
            onClick={() => setActiveProduct("Quiz")}
          />
          <GenerateCard
            label={t('interface.generate.presentation', 'Presentation')}
            Icon={LessonPresentationIcon}
            active={activeProduct === "Presentation"}
            onClick={() => setActiveProduct("Presentation")}
          />
          <GenerateCard
            label={t('interface.generate.onePager', 'One-Pager')}
            Icon={TextPresentationIcon}
            active={activeProduct === "One-Pager"}
            onClick={() => setActiveProduct("One-Pager")}
          />
        </div>

        {/* Dropdown chips */}
        {activeProduct === "Course Outline" && (
          <div className="w-full bg-white flex flex-wrap justify-center gap-2 mb-2">
            <CustomPillSelector
              value={modulesCount.toString()}
              onValueChange={(value) => setModulesCount(Number(value))}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `${i + 1} ${t('interface.generate.modules', 'Modules')}`
              }))}
              icon={<FolderIcon className="w-4 h-4 text-gray-600" />}
              label={t('interface.generate.modules', 'Modules')}
            />
            <Select value={lessonsPerModule} onValueChange={setLessonsPerModule}>
              <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1-2", "3-4", "5-7", "8-10"].map((rng) => (
                  <SelectItem key={rng} value={rng}>{rng} {t('interface.generate.perModule', 'per module')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {activeProduct === "Presentation" && (
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* Step 1: Choose source */}
            {useExistingOutline === null && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-lg font-medium text-gray-700">{t('interface.generate.presentationQuestion', 'Do you want to create a presentation from an existing Course Outline?')}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setUseExistingOutline(true)}
                    size="sm"
                    className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                  >
                    {t('interface.generate.yesContentFromOutline', 'Yes, content for the presentation from the outline')}
                  </Button>
                  <Button
                    onClick={() => setUseExistingOutline(false)}
                    variant="outline"
                    size="sm"
                    className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('interface.generate.noStandalone', 'No, I want standalone presentation')}
                  </Button>
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
                      onValueChange={(value) => {
                        setSelectedOutlineId(value ? Number(value) : null);
                        // clear module & lesson selections when outline changes
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
                        setSelectedLesson("");
                      }}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                        <SelectValue placeholder="Select Outline" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-gray-700">
                        {outlines.map((o) => (
                          <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedOutlineId && (
                      <Select
                        value={selectedModuleIndex?.toString() ?? ""}
                        onValueChange={(value) => {
                          const idx = value ? Number(value) : null;
                          setSelectedModuleIndex(idx);
                          setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                          setSelectedLesson("");
                        }}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                          <SelectValue placeholder="Select Module" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-700">
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
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                          <SelectValue placeholder="Select Lesson" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-700">
                          {lessonsForModule.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-gray-700">
                            <SelectItem value="en">{t('interface.generate.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.generate.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.generate.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={slidesCount.toString()} onValueChange={(value) => setSlidesCount(Number(value))}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-gray-700">
                            {Array.from({ length: 14 }, (_, i) => i + 2).map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} {t('interface.generate.slides', 'slides')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}

                {/* Show standalone presentation dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('interface.generate.english', 'English')}</SelectItem>
                        <SelectItem value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</SelectItem>
                        <SelectItem value="es">{t('interface.generate.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="ru">{t('interface.generate.russian', 'Russian')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={slidesCount.toString()} onValueChange={(value) => setSlidesCount(Number(value))}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-gray-700">
                        {Array.from({ length: 14 }, (_, i) => i + 2).map((n) => (
                          <SelectItem key={n} value={n.toString()}>{n} {t('interface.generate.slides', 'slides')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Button
                  onClick={() => {
                    setUseExistingOutline(null);
                    setSelectedOutlineId(null);
                    setSelectedModuleIndex(null);
                    setLessonsForModule([]);
                    setSelectedLesson("");
                  }}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 border border-gray-300 bg-white/90 text-gray-600 hover:bg-gray-100"
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Configuration */}
        {activeProduct === "Quiz" && (
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* Step 1: Choose source */}
            {useExistingQuizOutline === null && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-lg font-medium text-gray-700">{t('interface.generate.quizQuestion', 'Do you want to create a quiz from an existing Course Outline?')}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setUseExistingQuizOutline(true)}
                    size="sm"
                    className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                  >
                    {t('interface.generate.yesContentForQuiz', 'Yes, content for the quiz from the outline')}
                  </Button>
                  <Button
                    onClick={() => setUseExistingQuizOutline(false)}
                    variant="outline"
                    size="sm"
                    className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('interface.generate.noStandaloneQuiz', 'No, I want standalone quiz')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2+: Show dropdowns based on choice */}
            {useExistingQuizOutline !== null && (
              <div className="flex flex-wrap justify-center gap-2">
                {/* Show outline flow if user chose existing outline */}
                {useExistingQuizOutline === true && (
                  <>
                    {/* Outline dropdown */}
                    <Select
                      value={selectedQuizOutlineId?.toString() ?? ""}
                      onValueChange={(value) => {
                        setSelectedQuizOutlineId(value ? Number(value) : null);
                        // clear module & lesson selections when outline changes
                        setSelectedQuizModuleIndex(null);
                        setQuizLessonsForModule([]);
                        setSelectedQuizLesson("");
                      }}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue placeholder={t('interface.generate.selectOutline', 'Select Outline')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-gray-700">
                        {quizOutlines.map((outline) => (
                          <SelectItem key={outline.id} value={outline.id.toString()}>
                            {outline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedQuizOutlineId && (
                      <Select
                        value={selectedQuizModuleIndex?.toString() ?? ""}
                        onValueChange={(value) => {
                          const idx = value ? Number(value) : null;
                          setSelectedQuizModuleIndex(idx);
                          setQuizLessonsForModule(idx !== null ? quizModulesForOutline[idx].lessons : []);
                          setSelectedQuizLesson("");
                        }}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          <SelectValue placeholder={t('interface.generate.selectModule', 'Select Module')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-700">
                          {quizModulesForOutline.map((m, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedQuizModuleIndex !== null && (
                      <Select
                        value={selectedQuizLesson}
                        onValueChange={setSelectedQuizLesson}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          <SelectValue placeholder={t('interface.generate.selectLesson', 'Select Lesson')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-700">
                          {quizLessonsForModule.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedQuizLesson && (
                      <>
                        <Select value={quizLanguage} onValueChange={setQuizLanguage}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-gray-700">
                            <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="relative question-types-dropdown">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowQuestionTypesDropdown(!showQuestionTypesDropdown)}
                            className="rounded-full border border-gray-300 bg-white/90 text-black flex items-center gap-2 min-w-[200px]"
                          >
                            <span>
                              {selectedQuestionTypes.length === 0
                                ? t('interface.generate.selectQuestionTypes', 'Select Question Types')
                                : selectedQuestionTypes.length === 1
                                ? selectedQuestionTypes[0]
                                : `${selectedQuestionTypes.length} ${t('interface.generate.typesSelected', 'types selected')}`}
                            </span>
                            <ChevronDown size={14} className={`transition-transform ${showQuestionTypesDropdown ? 'rotate-180' : ''}`} />
                          </Button>
                          {showQuestionTypesDropdown && (
                            <div 
                              className="absolute top-full text-gray-700 left-0 mt-1 w-full border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                              style={{
                                backgroundColor: `white`,
                              }}
                            >
                                                        {[
                            { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                            { value: "multi-select", label: t('interface.generate.multiSelect', 'Multiple Select') },
                            { value: "matching", label: t('interface.generate.matching', 'Matching') },
                            { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                            { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                          ].map((type) => (
                                <label
                                  key={type.value}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                >
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
                                  {type.label}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <Select value={quizQuestionCount.toString()} onValueChange={(value) => setQuizQuestionCount(Number(value))}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20, 25, 30].map((count) => (
                              <SelectItem key={count} value={count.toString()}>{count} {t('interface.generate.questions', 'questions')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}

                {/* Show standalone quiz dropdowns if user chose standalone */}
                {useExistingQuizOutline === false && (
                  <>
                    <Select value={quizLanguage} onValueChange={setQuizLanguage}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('interface.generate.english', 'English')}</SelectItem>
                        <SelectItem value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</SelectItem>
                        <SelectItem value="es">{t('interface.generate.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="ru">{t('interface.generate.russian', 'Russian')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative question-types-dropdown">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQuestionTypesDropdown(!showQuestionTypesDropdown)}
                        className="rounded-full border border-gray-300 bg-white/90 text-sm text-black flex items-center gap-2 min-w-[200px]"
                      >
                        <span>
                          {selectedQuestionTypes.length === 0
                            ? t('interface.generate.selectQuestionTypes', 'Select Question Types')
                            : selectedQuestionTypes.length === 1
                            ? selectedQuestionTypes[0]
                            : `${selectedQuestionTypes.length} ${t('interface.generate.typesSelected', 'types selected')}`}
                        </span>
                        <ChevronDown size={14} className={`transition-transform ${showQuestionTypesDropdown ? 'rotate-180' : ''}`} />
                      </Button>
                      {showQuestionTypesDropdown && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                          style={{
                            backgroundColor: `rgb(var(--generate-card-bg))`,
                            borderColor: `rgb(var(--generate-card-border))`,
                            borderWidth: '1px'
                          }}
                        >
                          {[
                            { value: "multiple-choice", label: t('interface.generate.multipleChoice', 'Multiple Choice') },
                            { value: "multi-select", label: t('interface.generate.multiSelect', 'Multiple Select') },
                            { value: "matching", label: t('interface.generate.matching', 'Matching') },
                            { value: "sorting", label: t('interface.generate.sorting', 'Sorting') },
                            { value: "open-answer", label: t('interface.generate.openAnswer', 'Open Answer') }
                          ].map((type) => (
                            <label
                              key={type.value}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
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
                              {type.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <Select value={quizQuestionCount.toString()} onValueChange={(value) => setQuizQuestionCount(Number(value))}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25, 30].map((count) => (
                          <SelectItem key={count} value={count.toString()}>{count} {t('interface.generate.questions', 'questions')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Button
                  onClick={() => {
                    setUseExistingQuizOutline(null);
                    setSelectedQuizOutlineId(null);
                    setSelectedQuizModuleIndex(null);
                    setQuizLessonsForModule([]);
                    setSelectedQuizLesson("");
                  }}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>
        )}

        {/* One-Pager Configuration */}
        {activeProduct === "One-Pager" && (
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* Step 1: Choose source */}
            {useExistingTextOutline === null && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-lg font-medium text-gray-700">{t('interface.generate.onePagerQuestion', 'Do you want to create a one-pager from an existing Course Outline?')}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setUseExistingTextOutline(true)}
                    size="sm"
                    className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                  >
                    {t('interface.generate.yesContentForOnePager', 'Yes, content for the one-pager from the outline')}
                  </Button>
                  <Button
                    onClick={() => setUseExistingTextOutline(false)}
                    variant="outline"
                    size="sm"
                    className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('interface.generate.noStandaloneOnePager', 'No, I want standalone one-pager')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2+: Show dropdowns based on choice */}
            {useExistingTextOutline !== null && (
              <div className="flex flex-wrap justify-center gap-2">
                {/* Show outline flow if user chose existing outline */}
                {useExistingTextOutline === true && (
                  <>
                    {/* Outline dropdown */}
                    <Select
                      value={selectedTextOutlineId?.toString() ?? ""}
                      onValueChange={(value) => {
                        setSelectedTextOutlineId(value ? Number(value) : null);
                        // clear module & lesson selections when outline changes
                        setSelectedTextModuleIndex(null);
                        setTextLessonsForModule([]);
                        setSelectedTextLesson("");
                      }}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue placeholder={t('interface.generate.selectOutline', 'Select Outline')} />
                      </SelectTrigger>
                      <SelectContent>
                        {textOutlines.map((o) => (
                          <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Module dropdown – appears once outline is selected */}
                    {selectedTextOutlineId && (
                      <Select
                        value={selectedTextModuleIndex?.toString() ?? ""}
                        onValueChange={(value) => {
                          const idx = value ? Number(value) : null;
                          setSelectedTextModuleIndex(idx);
                          setTextLessonsForModule(idx !== null ? textModulesForOutline[idx].lessons : []);
                          setSelectedTextLesson("");
                        }}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          <SelectValue placeholder={t('interface.generate.selectModule', 'Select Module')} />
                        </SelectTrigger>
                        <SelectContent>
                          {textModulesForOutline.map((m, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Lesson dropdown – appears when module chosen */}
                    {selectedTextModuleIndex !== null && (
                      <Select
                        value={selectedTextLesson}
                        onValueChange={setSelectedTextLesson}
                      >
                        <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          <SelectValue placeholder={t('interface.generate.selectLesson', 'Select Lesson')} />
                        </SelectTrigger>
                        <SelectContent>
                          {textLessonsForModule.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedTextLesson && (
                      <>
                        <Select value={textLanguage} onValueChange={setTextLanguage}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={textLength} onValueChange={setTextLength}>
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">{t('interface.generate.short', 'Short')}</SelectItem>
                            <SelectItem value="medium">{t('interface.generate.medium', 'Medium')}</SelectItem>
                            <SelectItem value="long">{t('interface.generate.long', 'Long')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select open={showTextStylesDropdown} onOpenChange={setShowTextStylesDropdown}>
                          <SelectTrigger className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black min-w-[200px]">
                            <span>{textStyles.length > 0 ? `${textStyles.length} ${t('interface.generate.stylesSelected', 'styles selected')}` : t('interface.generate.selectStyles', 'Select styles')}</span>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {[
                              { value: "headlines", label: t('interface.generate.headlines', 'Headlines') },
                              { value: "paragraphs", label: t('interface.generate.paragraphs', 'Paragraphs') },
                              { value: "bullet_lists", label: t('interface.generate.bulletLists', 'Bullet Lists') },
                              { value: "numbered_lists", label: t('interface.generate.numberedLists', 'Numbered Lists') },
                              { value: "alerts", label: t('interface.generate.alerts', 'Alerts') },
                              { value: "recommendations", label: t('interface.generate.recommendations', 'Recommendations') },
                              { value: "section_breaks", label: t('interface.generate.sectionBreaks', 'Section Breaks') },
                              { value: "icons", label: t('interface.generate.icons', 'Icons') },
                              { value: "important_sections", label: t('interface.generate.importantSections', 'Important Sections') }
                            ].map((option) => (
                              <div key={option.value} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                                <Checkbox
                                  checked={textStyles.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setTextStyles([...textStyles, option.value]);
                                    } else {
                                      setTextStyles(textStyles.filter(s => s !== option.value));
                                    }
                                  }}
                                  className="mr-3"
                                />
                                <span className="text-sm">{option.label}</span>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}

                {/* Show standalone one-pager dropdowns if user chose standalone */}
                {useExistingTextOutline === false && (
                  <>
                    <Select value={textLanguage} onValueChange={setTextLanguage}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('interface.generate.english', 'English')}</SelectItem>
                        <SelectItem value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</SelectItem>
                        <SelectItem value="es">{t('interface.generate.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="ru">{t('interface.generate.russian', 'Russian')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={textLength} onValueChange={setTextLength}>
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{t('interface.generate.short', 'Short')}</SelectItem>
                        <SelectItem value="medium">{t('interface.generate.medium', 'Medium')}</SelectItem>
                        <SelectItem value="long">{t('interface.generate.long', 'Long')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative text-styles-dropdown">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowTextStylesDropdown(!showTextStylesDropdown)}
                        className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black min-w-[200px]"
                      >
                        <span>{textStyles.length > 0 ? `${textStyles.length} ${t('interface.generate.stylesSelected', 'styles selected')}` : t('interface.generate.selectStyles', 'Select styles')}</span>
                        <ChevronDown size={14} className={`transition-transform ${showTextStylesDropdown ? 'rotate-180' : ''}`} />
                      </Button>
                      {showTextStylesDropdown && (
                        <div 
                          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                          style={{
                            backgroundColor: `rgb(var(--generate-card-bg))`,
                            borderColor: `rgb(var(--generate-card-border))`,
                            borderWidth: '1px'
                          }}
                        >
                          {[
                            { value: "headlines", label: t('interface.generate.headlines', 'Headlines') },
                            { value: "paragraphs", label: t('interface.generate.paragraphs', 'Paragraphs') },
                            { value: "bullet_lists", label: t('interface.generate.bulletLists', 'Bullet Lists') },
                            { value: "numbered_lists", label: t('interface.generate.numberedLists', 'Numbered Lists') },
                            { value: "alerts", label: t('interface.generate.alerts', 'Alerts') },
                            { value: "recommendations", label: t('interface.generate.recommendations', 'Recommendations') },
                            { value: "section_breaks", label: t('interface.generate.sectionBreaks', 'Section Breaks') },
                            { value: "icons", label: t('interface.generate.icons', 'Icons') },
                            { value: "important_sections", label: t('interface.generate.importantSections', 'Important Sections') }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={textStyles.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTextStyles([...textStyles, option.value]);
                                  } else {
                                    setTextStyles(textStyles.filter(s => s !== option.value));
                                  }
                                }}
                                className="mr-3"
                              />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button
                  onClick={() => {
                    setUseExistingTextOutline(null);
                    setSelectedTextOutlineId(null);
                    setSelectedTextModuleIndex(null);
                    setTextLessonsForModule([]);
                    setSelectedTextLesson("");
                  }}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Video Lesson Configuration */}
        {activeProduct === "Video Lesson" && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Select value={slidesCount.toString()} onValueChange={(value) => setSlidesCount(Number(value))}>
              <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((count) => (
                  <SelectItem key={count} value={count.toString()}>{count} {t('interface.generate.slides', 'slides')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Prompt Input Area - shown for standalone products or when no outline is selected */}
        {((activeProduct === "Course Outline") || 
          (activeProduct === "Video Lesson") ||
          (activeProduct === "One-Pager" && useExistingTextOutline === false) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === false) ||
          (activeProduct === "Presentation" && useExistingOutline === false)) && (
          <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
            {/* Simple prompt input */}
            <div className="w-full">
            <Textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isFromKnowledgeBase 
                ? t('interface.generate.knowledgeBasePromptPlaceholder', 'Enter a topic or question to search your Knowledge Base')
                : t('interface.generate.promptPlaceholder', 'Describe what you\'d like to make')}
              className="w-full px-7 py-5 rounded-2xl bg-white shadow-lg text-lg text-black resize-none overflow-hidden min-h-[90px] max-h-[260px] border border-gray-100 focus:border-blue-300 focus:outline-none transition-colors placeholder-gray-400"
              style={{ background: "rgba(255,255,255,0.95)" }}
              rows={3}
            />
            </div>

            {/* Simple examples grid */}
            <div className={`w-full transition-opacity duration-300 ${prompt.trim() ? 'opacity-0 pointer-events-none h-0' : 'opacity-100'}`}>
            <div className="w-full relative z-0">
              <div className="flex items-center justify-center mb-3 relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center" aria-hidden="true">
                  <div className="flex-1 border-t border-blue-100"></div>
                </div>
                <span className="relative z-10 bg-transparent px-4 text-lg font-semibold text-blue-900 text-center" style={{ letterSpacing: 0 }}>
                  {t('interface.generate.examplePrompts', 'Example prompts')}
                </span>
              </div>
              <div className="grid grid-rows-2 sm:grid-cols-3 grid-flow-col gap-2">
                {Array.from({ length: 6 }).map((_, index) =>
                  examples[index] ? (
                    <button
                      key={index}
                      onClick={() => setPrompt(examples[index])}
                      className="flex flex-col justify-center items-center w-full px-3 py-2 rounded-full bg-blue-100/80 hover:bg-blue-200/90 transition-colors text-sm font-medium text-blue-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 relative cursor-pointer"
                      style={{ backdropFilter: "blur(2px)", minHeight: 56 }}
                    >
                      <span className="text-center leading-tight pr-6">{examples[index]}</span>
                      <span className="absolute top-3 right-3 text-blue-400 text-lg font-bold">+</span>
                    </button>
                  ) : (
                    <div key={index} className="w-full px-3 py-2 rounded-full bg-transparent" />
                  )
                )}
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={shuffleExamples}
                  variant="blueGradient"
                  className="flex items-center gap-2 px-6 py-2 rounded-full text-base font-medium"
                >
                  <Shuffle size={18} /> {t('interface.generate.shuffleExamples', 'Shuffle')}
                </Button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Generate Button */}
        {((activeProduct === "Course Outline" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Video Lesson" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "One-Pager" && useExistingTextOutline === true && selectedTextOutlineId && selectedTextLesson) ||
          (activeProduct === "One-Pager" && useExistingTextOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === true && selectedQuizOutlineId && selectedQuizLesson) ||
          (activeProduct === "Quiz" && useExistingQuizOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors)) ||
          (activeProduct === "Presentation" && useExistingOutline === true && selectedOutlineId && selectedLesson) ||
          (activeProduct === "Presentation" && useExistingOutline === false && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors))) && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                switch (activeProduct) {
                  case "Course Outline":
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
              {activeProduct === "Course Outline" && t('interface.generate.generateCourseOutline', 'Generate Course Outline')}
              {activeProduct === "Video Lesson" && t('interface.generate.generateVideoLesson', 'Generate Video Lesson')}
              {activeProduct === "Presentation" && t('interface.generate.generatePresentation', 'Generate Presentation')}
              {activeProduct === "Quiz" && t('interface.generate.generateQuiz', 'Generate Quiz')}
              {activeProduct === "One-Pager" && t('interface.generate.generateOnePager', 'Generate One-Pager')}
            </Button>
          </div>
        )}
        </div> {/* close inner flex container */}
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