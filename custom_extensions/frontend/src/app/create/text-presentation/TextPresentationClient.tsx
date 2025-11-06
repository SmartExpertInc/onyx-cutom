"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronDown, Sparkles, Settings, AlignLeft, AlignCenter, AlignRight, Plus, Edit, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";
import { trackCreateProduct } from "../../../lib/mixpanelClient"
import { AiAgent } from "@/components/ui/ai-agent";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Custom Tooltip Component with thought cloud style using React Portal
const CustomTooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        ref={elementRef}
        className="relative inline-block w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-blue-500 text-white px-2 py-1.5 rounded-md shadow-lg text-sm whitespace-nowrap relative max-w-xs">
            <div className="font-medium">{content}</div>
            {/* Simple triangle tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-500"></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const LoadingAnimation: React.FC<{ message?: string; fallbackMessage?: string }> = ({ message, fallbackMessage }) => (
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
      <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message || fallbackMessage || "Generating..."}</p>
    )}
  </div>
);

export default function TextPresentationClient() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();

  // State for dropdowns
  const [outlines, setOutlines] = useState<{ id: number; name: string }[]>([]);
  const [modulesForOutline, setModulesForOutline] = useState<{ name: string; lessons: string[] }[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [lessonsForModule, setLessonsForModule] = useState<string[]>([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState<number | null>(params?.get("outlineId") ? Number(params.get("outlineId")) : null);
  const [selectedLesson, setSelectedLesson] = useState<string>(params?.get("lesson") || "");
  const [language, setLanguage] = useState<string>(params?.get("lang") || "en");
  const [length, setLength] = useState<string>(params?.get("length") || "medium");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(params?.get("styles")?.split(",").filter(Boolean) || []);
  const [showStylesDropdown, setShowStylesDropdown] = useState(false);
  // Process prompt from URL or sessionStorage and create local state
  const [currentPrompt, setCurrentPrompt] = useState(getPromptFromUrlOrStorage(params?.get("prompt") || ""));
  
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    params?.get("outlineId") ? true : (currentPrompt ? false : null)
  );

  // Original logic state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProjectId, setFinalProjectId] = useState<number | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [textareaVisible, setTextareaVisible] = useState(false);
  const [firstLineRemoved, setFirstLineRemoved] = useState(false);

  // File context for creation from documents
  const isFromFiles = params?.get("fromFiles") === "true";
  const folderIds = params?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = params?.get("fileIds")?.split(",").filter(Boolean) || [];

  // Text context for creation from user text
  const isFromText = params?.get("fromText") === "true";
  const textMode = params?.get("textMode") as 'context' | 'base' | null;
  
  // Knowledge Base context for creation from Knowledge Base search
  const isFromKnowledgeBase = params?.get("fromKnowledgeBase") === "true";
  const [userText, setUserText] = useState('');

  // Connector context for creation from selected connectors
  const isFromConnectors = params?.get("fromConnectors") === "true";
  const connectorIds = params?.get("connectorIds")?.split(",").filter(Boolean) || [];
  const connectorSources = params?.get("connectorSources")?.split(",").filter(Boolean) || [];
  const selectedFiles = params?.get("selectedFiles")?.split(",").filter(Boolean).map(file => decodeURIComponent(file)) || [];

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
  const [advancedModeState, setAdvancedModeState] = useState<string | undefined>(undefined);
  const [advancedModeClicked, setAdvancedModeClicked] = useState(false);
  const handleAdvancedModeClick = () => {
    if (advancedModeClicked == false) {
      setAdvancedModeState("Clicked");
      setAdvancedModeClicked(true);
    }
  };
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
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

  const [selectedTheme, setSelectedTheme] = useState<string>("wine");
  const [textDensity, setTextDensity] = useState("medium");
  const [imageSource, setImageSource] = useState("ai");
  const [aiModel, setAiModel] = useState("flux-fast");
  const [selectedImageSource, setSelectedImageSource] = useState("ai");
  // Footer/finalize
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // Display mode state
  const [displayMode, setDisplayMode] = useState<'cards' | 'text'>('cards');

  // State for editing lesson titles
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editedTitles, setEditedTitles] = useState<{ [key: number]: string }>({});
  const [editedTitleIds, setEditedTitleIds] = useState<Set<number>>(new Set());
  const [originalTitles, setOriginalTitles] = useState<{ [key: number]: string }>({});
  const nextEditingIdRef = useRef<number | null>(null);
  
  // State for editing lesson content
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [editedContents, setEditedContents] = useState<{ [key: number]: string }>({});
  const [originalContents, setOriginalContents] = useState<{ [key: number]: string }>({});
  const nextEditingContentIdRef = useRef<number | null>(null);

  // State for additional sections
  const [additionalSections, setAdditionalSections] = useState<{ id: string; title: string; content: string }[]>([]);

  // Smart change handling states (similar to QuizClient)
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [originallyEditedTitles, setOriginallyEditedTitles] = useState<Set<number>>(new Set());
  const [editedTitleNames, setEditedTitleNames] = useState<Set<string>>(new Set());

  // Track usage of styles feature
  const [stylesState, setStylesState] = useState<string | null>(sessionStorage.getItem('stylesState'));
  const handleStylesClick = () => {
    if (!stylesState) {
      setStylesState("Clicked");
    }
  };

  // FIXED: Alternative parsing method for when header-based parsing fails
  const parseContentAlternatively = (content: string) => {
    const lessons = [];
    
    // Method 1: Try splitting by double line breaks (paragraph-based sections)
    const paragraphSections = content.split(/\n\s*\n/).filter(section => section.trim().length > 0);
    
    if (paragraphSections.length > 1) {
      for (let i = 0; i < paragraphSections.length && i < 10; i++) { // Limit to 10 sections
        const section = paragraphSections[i].trim();
        if (section.length < 20) continue; // Skip very short sections
        
        // Extract title from first line or first sentence
        const lines = section.split('\n');
        const firstLine = lines[0].trim();
        const title = firstLine.length < 100 ? firstLine : firstLine.substring(0, 50) + '...';
        const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : section;
        
        lessons.push({
          title: title,
          content: content || section
        });
      }
    }
    
    // Method 2: Try splitting by numbered items (1., 2., 3., etc.)
    if (lessons.length === 0) {
      const numberedSections = content.split(/(?:\n|^)\s*\d+\.\s+/);
      if (numberedSections.length > 2) { // First split is usually empty or intro
        for (let i = 1; i < numberedSections.length && i < 11; i++) {
          const section = numberedSections[i].trim();
          if (section.length < 20) continue;
          
          const firstSentence = section.split('.')[0] + '.';
          const title = firstSentence.length < 100 ? firstSentence : `Section ${i}`;
          
          lessons.push({
            title: title,
            content: section
          });
        }
      }
    }
    
    // Method 3: Try splitting by bullet points (-, *, •)
    if (lessons.length === 0) {
      const bulletSections = content.split(/(?:\n|^)\s*[-*•]\s+/);
      if (bulletSections.length > 2) {
        for (let i = 1; i < bulletSections.length && i < 11; i++) {
          const section = bulletSections[i].trim();
          if (section.length < 20) continue;
          
          const firstSentence = section.split('.')[0] + '.';
          const title = firstSentence.length < 100 ? firstSentence : `Point ${i}`;
          
          lessons.push({
            title: title,
            content: section
          });
        }
      }
    }
    
    return lessons;
  };

  // Parse content into lessons/sections
  const parseContentIntoLessons = (content: string) => {
    if (!content.trim()) return [];

    const lessons = [];

    // Find all headers (H1-H6) with their positions
    const headerMatches = [];
    const headerRegex = /(?:^|\n)(#{1,6})\s+(.+?)(?=\n|$)/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      headerMatches.push({
        index: match.index,
        level: match[1],
        title: match[2].trim(),
        fullMatch: match[0]
      });
    }

    // Process each header to extract its content
    for (let i = 0; i < headerMatches.length; i++) {
      const currentHeader = headerMatches[i];
      let title = currentHeader.title;

      // FIXED: More gentle title cleaning - preserve meaningful content
      title = title
        .replace(/\{[^}]*\}/g, '') // Remove {isImportant} and similar patterns
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** formatting
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis but keep other punctuation
        .trim();

      // FIXED: Less restrictive filtering - only skip completely empty titles
      if (!title || title.length < 2) {
        continue;
      }

      // Find the end of this section (start of next header or end of content)
      const nextHeaderIndex = i < headerMatches.length - 1 ? headerMatches[i + 1].index : content.length;
      const sectionStart = currentHeader.index + currentHeader.fullMatch.length;
      const sectionContent = content.substring(sectionStart, nextHeaderIndex).trim();

      // FIXED: More comprehensive content cleaning while preserving structure
      const cleanedContent = sectionContent
        .replace(/^\s*---\s*$/gm, '') // Remove section breaks
        .replace(/^\s*\n+/g, '') // Remove leading newlines
        .replace(/\n+\s*$/g, '') // Remove trailing newlines
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove * italic formatting
        .trim();

      // FIXED: Accept content even if it's shorter, and accept titles without requiring content
      if (title && (cleanedContent || sectionContent.trim())) {
        lessons.push({
          title: title,
          content: cleanedContent || sectionContent.trim() || title // Use title as content if no content found
        });
      }
    }

    // FIXED: If no structured content found, try alternative parsing methods instead of hardcoded fallback
    if (lessons.length === 0) {
      // Try parsing by paragraph breaks or bullet points
      const alternativeParsing = parseContentAlternatively(content);
      if (alternativeParsing.length > 0) {
        return alternativeParsing;
      }
      
      // Last resort: return single section with all content
      const cleanedContent = content
        .replace(/^\s*---\s*$/gm, '') // Remove section breaks
        .replace(/#{1,6}\s*/gm, '') // Remove markdown headers that failed to parse
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .trim();
      
      if (cleanedContent) {
        return [{
          title: "Document Content",
          content: cleanedContent
        }];
      }
      
      // If absolutely no content, return empty array
      return [];
    }

    return lessons;
  };

  // Use useMemo to recalculate lessonList when content changes
  const lessonList = React.useMemo(() => parseContentIntoLessons(content), [content]);

  // Calculate word count from content
  const wordCount = React.useMemo(() => {
    if (!content) return 0;
    // Remove markdown formatting and count words
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .trim();
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, [content]);

  // Handle lesson title editing
  const handleTitleEdit = (lessonIndex: number, newTitle: string) => {
    setEditedTitles(prev => ({
      ...prev,
      [lessonIndex]: newTitle
    }));

    // Store original title if not already stored
    if (!originalTitles[lessonIndex] && lessonIndex < lessonList.length) {
      setOriginalTitles(prev => ({
        ...prev,
        [lessonIndex]: lessonList[lessonIndex].title
      }));
    }

    // Add to edited titles list if title is different from original
    const originalTitle = originalTitles[lessonIndex] || (lessonIndex < lessonList.length ? lessonList[lessonIndex].title : '');
    if (newTitle !== originalTitle) {
      setEditedTitleIds(prev => new Set([...prev, lessonIndex]));
      setOriginallyEditedTitles(prev => new Set([...prev, lessonIndex]));
      setEditedTitleNames(prev => new Set([...prev, newTitle]));
      setHasUserEdits(true); // NEW: Mark that user has made edits
    } else {
      setEditedTitleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonIndex);
        return newSet;
      });
    }
  };

  const handleTitleSave = (lessonIndex: number, finalTitle?: string) => {
    setEditingLessonId(null);

    // If we're switching to another title, don't save
    if (nextEditingIdRef.current !== null) {
      nextEditingIdRef.current = null;
      return;
    }

    // Keep the item in edited titles list to maintain permanent blur
    // Only remove if the title is back to original
    const newTitle = (finalTitle ?? editedTitles[lessonIndex]);
    if (!newTitle) {
      return;
    }
    const originalTitle = originalTitles[lessonIndex] || lessonList[lessonIndex].title;
    if (newTitle === originalTitle) {
      setEditedTitleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonIndex);
        return newSet;
      });
    }
    // Update the original content with new title
    updateContentWithNewTitle(lessonIndex, newTitle);
  };

  const updateContentWithNewTitle = (lessonIndex: number, newTitle: string) => {
    if (!newTitle) return;

    const lessons = parseContentIntoLessons(content);
    if (lessonIndex >= lessons.length) return;

    const oldTitle = lessons[lessonIndex].title;

    // Find and replace the old title with new title in content
    // Look for markdown headers (## or ###) or plain text titles
    const patterns = [
      // Support H1-H6 headers
      new RegExp(`^(#{1,6}\\s*)${escapeRegExp(oldTitle)}`, 'gm'),
      new RegExp(`^${escapeRegExp(oldTitle)}$`, 'gm')
    ];

    let updatedContent = content;
    for (const pattern of patterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, (match) => {
          // Preserve markdown formatting if it exists
          const headerMatch = match.match(/^(#{1,6}\s*)/);
          return headerMatch ? headerMatch[1] + newTitle : newTitle;
        });
        break;
      }
    }

    console.log("DEBUG: updateContentWithNewTitle - oldTitle:", oldTitle);
    console.log("DEBUG: updateContentWithNewTitle - newTitle:", newTitle);
    console.log("DEBUG: updateContentWithNewTitle - content changed:", updatedContent !== content);
    console.log("DEBUG: updateContentWithNewTitle - content preview:", content.substring(0, 200));
    console.log("DEBUG: updateContentWithNewTitle - updatedContent preview:", updatedContent.substring(0, 200));

    setContent(updatedContent);

    // Clear the edited title since it's now part of the main content
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[lessonIndex];
      return newTitles;
    });

    // Remove from editedTitleIds since the title is now part of the main content
    // But keep it in originallyEditedTitles to track that it was edited
    setEditedTitleIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(lessonIndex);
      return newSet;
    });

    // NEW: Update editedTitleNames to reflect the new title
    setEditedTitleNames(prev => {
      const newSet = new Set(prev);
      newSet.delete(oldTitle); // Remove old title
      newSet.add(newTitle);    // Add new title
      console.log("DEBUG: updateContentWithNewTitle - updated editedTitleNames:", Array.from(newSet));
      return newSet;
    });

    // NEW: Mark that content has been updated
    if (updatedContent !== content) {
      setHasUserEdits(true);
    }
  };

  // Helper function to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // NEW: Create clean content - if title changed send only title without context, if not changed send with context
  // Also handles the case where a large heading gets broken down into subheadings
  const createCleanTitlesContent = (content: string) => {
    const lessons = parseContentIntoLessons(content);
    if (lessons.length === 0) return content;

    console.log("DEBUG: createCleanTitlesContent called");
    console.log("DEBUG: editedTitleNames:", Array.from(editedTitleNames));
    console.log("DEBUG: lessons:", lessons.map(l => ({ title: l.title, contentLength: l.content.length })));

    let cleanContent = "";

    lessons.forEach((lesson, index) => {
      // Check if this title was edited by the user (by name, not by index)
      if (editedTitleNames.has(lesson.title)) {
        console.log(`DEBUG: Title "${lesson.title}" was edited - sending only title`);
        // For edited titles, send only the title without context
        // This allows AI to focus on the title change and regenerate appropriate content
        cleanContent += `## ${lesson.title}\n\n`;
      } else {
        console.log(`DEBUG: Title "${lesson.title}" was not edited - sending with content`);
        // For unedited titles, send with full context
        // This preserves the original content structure and context
        cleanContent += `## ${lesson.title}\n\n${lesson.content}\n\n`;
      }
    });

    console.log("DEBUG: Final clean content length:", cleanContent.length);
    return cleanContent.trim();
  };

  // NEW: Alternative approach - create clean content based on current UI state
  const createCleanTitlesContentFromUI = () => {
    console.log("DEBUG: createCleanTitlesContentFromUI called");
    console.log("DEBUG: lessonList:", lessonList.map(l => ({ title: l.title, contentLength: l.content.length })));
    console.log("DEBUG: editedTitles:", editedTitles);
    console.log("DEBUG: editedTitleIds:", Array.from(editedTitleIds));

    let cleanContent = "";

    lessonList.forEach((lesson, index) => {
      // Check if this lesson has an edited title
      const hasEditedTitle = editedTitles[index] && editedTitles[index] !== lesson.title;
      const isInEditedIds = editedTitleIds.has(index);

      if (hasEditedTitle || isInEditedIds) {
        const titleToUse = editedTitles[index] || lesson.title;
        console.log(`DEBUG: Title "${titleToUse}" was edited - sending only title`);
        cleanContent += `## ${titleToUse}\n\n`;
      } else {
        console.log(`DEBUG: Title "${lesson.title}" was not edited - sending with content`);
        cleanContent += `## ${lesson.title}\n\n${lesson.content}\n\n`;
      }
    });

    // Add additional sections
    additionalSections.forEach((section) => {
      cleanContent += `## ${section.title}\n\n${section.content}\n\n`;
    });

    console.log("DEBUG: Final clean content length:", cleanContent.length);
    return cleanContent.trim();
  };

  // NEW: Create clean content for finalization - similar to QuizClient logic
  const createCleanFinalizationContent = (content: string) => {
    const lessons = parseContentIntoLessons(content);
    let cleanContent = "";

    // Add original lessons
    lessons.forEach((lesson, index) => {
      // Check if this title was edited by the user (by name, not by index)
      if (editedTitleNames.has(lesson.title)) {
        // For edited titles, send only the title without context
        // This allows AI to focus on the title change and regenerate appropriate content
        cleanContent += `## ${lesson.title}\n\n`;
      } else {
        // For unedited titles, send with full context
        // This preserves the original content structure and context
        cleanContent += `## ${lesson.title}\n\n${lesson.content}\n\n`;
      }
    });

    // Add additional sections
    additionalSections.forEach((section) => {
      cleanContent += `## ${section.title}\n\n${section.content}\n\n`;
    });

    return cleanContent.trim();
  };

  const handleTitleCancel = (lessonIndex: number) => {
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[lessonIndex];
      return newTitles;
    });
    setEditingLessonId(null);
    // Remove from edited titles list since changes are canceled
    setEditedTitleIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(lessonIndex);
      return newSet;
    });
  };

  const getTitleForLesson = (lesson: any, index: number) => {
    return editedTitles[index] || lesson.title;
  };

  // Handle lesson content editing
  const handleContentEdit = (lessonIndex: number, newContent: string) => {
    setEditedContents(prev => ({
      ...prev,
      [lessonIndex]: newContent
    }));

    // Store original content if not already stored
    if (!originalContents[lessonIndex] && lessonIndex < lessonList.length) {
      setOriginalContents(prev => ({
        ...prev,
        [lessonIndex]: lessonList[lessonIndex].content
      }));
    }

    setHasUserEdits(true);
  };

  const handleContentSave = (lessonIndex: number, finalContent?: string) => {
    setEditingContentId(null);

    // If we're switching to another content, don't save
    if (nextEditingContentIdRef.current !== null) {
      nextEditingContentIdRef.current = null;
      return;
    }

    const newContent = (finalContent ?? editedContents[lessonIndex]);
    if (!newContent) {
      return;
    }

    // Update the content in the main content string
    updateContentWithNewContent(lessonIndex, newContent);
  };

  const updateContentWithNewContent = (lessonIndex: number, newContent: string) => {
    if (!newContent && newContent !== '') return;

    const lessons = parseContentIntoLessons(content);
    if (lessonIndex >= lessons.length) return;

    const oldContent = lessons[lessonIndex].content;

    // Find and replace the old content with new content
    const escapedOldContent = escapeRegExp(oldContent);
    const pattern = new RegExp(escapedOldContent, 'g');

    let updatedContent = content;
    if (pattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(pattern, newContent);
    }

    setContent(updatedContent);

    // Clear the edited content since it's now part of the main content
    setEditedContents(prev => {
      const newContents = { ...prev };
      delete newContents[lessonIndex];
      return newContents;
    });

    // Mark that content has been updated
    if (updatedContent !== content) {
      setHasUserEdits(true);
    }
  };

  const handleContentCancel = (lessonIndex: number) => {
    setEditedContents(prev => {
      const newContents = { ...prev };
      delete newContents[lessonIndex];
      return newContents;
    });
    setEditingContentId(null);
  };

  const getContentForLesson = (lesson: any, index: number) => {
    return editedContents[index] !== undefined ? editedContents[index] : lesson.content;
  };

  // Handle adding new section
  const handleAddSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: t('interface.generate.newSection', 'New Section'),
      content: t('interface.generate.addContentPlaceholder', 'Add your content here...')
    };
    setAdditionalSections(prev => [...prev, newSection]);
    setHasUserEdits(true);
  };

  // Handle editing additional section title
  const handleAdditionalSectionTitleEdit = (sectionId: string, newTitle: string) => {
    setAdditionalSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, title: newTitle } : section
    ));
    setHasUserEdits(true);
  };

  // Handle editing additional section content
  const handleAdditionalSectionContentEdit = (sectionId: string, newContent: string) => {
    setAdditionalSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content: newContent } : section
    ));
    setHasUserEdits(true);
  };

  // Handle deleting additional section
  const handleDeleteAdditionalSection = (sectionId: string) => {
    setAdditionalSections(prev => prev.filter(section => section.id !== sectionId));
    setHasUserEdits(true);
  };

  // Function to render content with colored circles for bullet points
  const renderContentWithCircles = (content: string) => {
    if (!content) return content;

    // Split content into lines and process each line
    const lines = content.split('\n');
    const processedLines = lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check if line starts with a hyphen (bullet point)
      if (trimmedLine.startsWith('-')) {
        const contentAfterDash = trimmedLine.substring(1).trim();
        return (
          <div key={lineIndex} className="flex items-start gap-2">
            <div className="w-1 h-1 bg-[#6091F9] rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm font-normal leading-[140%] text-[#171718]">{contentAfterDash}</span>
          </div>
        );
      }
      
      // For regular lines (non-bullet points), return as is
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

  // Example prompts for advanced mode
  const onePagerExamples = [
    {
      short: t('interface.generate.onePagerExamples.adaptIndustry.short', 'Adapt to U.S. industry specifics'),
      detailed: t('interface.generate.onePagerExamples.adaptIndustry.detailed', "Update the one-pager's structure based on U.S. industry and cultural specifics: adjust content, replace topics, examples, and wording that don't align with the American context."),
    },
    {
      short: t('interface.generate.onePagerExamples.adoptTrends.short', 'Adopt trends and latest practices'),
      detailed: t('interface.generate.onePagerExamples.adoptTrends.detailed', "Update the one-pager's structure by adding content that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content."),
    },
    {
      short: t('interface.generate.onePagerExamples.topExamples.short', 'Incorporate top industry examples'),
      detailed: t('interface.generate.onePagerExamples.topExamples.detailed', 'Analyze the best one-pagers on the market in this topic and restructure our content accordingly: change or add content which others present more effectively. Focus on content flow and clarity.'),
    },
    {
      short: t('interface.generate.onePagerExamples.simplify.short', 'Simplify and restructure the content'),
      detailed: t('interface.generate.onePagerExamples.simplify.detailed', "Rewrite the one-pager's structure to make it more logical and user-friendly. Remove redundant sections, merge overlapping content, and rephrase content for clarity and simplicity."),
    },
    {
      short: t('interface.generate.onePagerExamples.increaseDepth.short', 'Increase value and depth of content'),
      detailed: t('interface.generate.onePagerExamples.increaseDepth.detailed', 'Strengthen the one-pager by adding content that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being delivered.'),
    },
    {
      short: t('interface.generate.onePagerExamples.addApplications.short', 'Add case studies and applications'),
      detailed: t('interface.generate.onePagerExamples.addApplications.detailed', "Revise the one-pager's structure to include applied content — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact."),
    },
  ];

  const toggleExample = (ex: typeof onePagerExamples[number]) => {
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
    setError(null);
    try {
      // NEW: Determine what content to send based on user edits
      let contentToSend = content;
      let isCleanContent = false;

      if (hasUserEdits && (editedTitleNames.size > 0 || editedTitleIds.size > 0)) {
        // If titles were changed, send only titles without context
        contentToSend = createCleanTitlesContentFromUI();
        isCleanContent = true;
      } else {
        // If no titles changed, send full content with context
        contentToSend = content;
        isCleanContent = false;
      }

      const payload: any = {
        content: contentToSend,
        editPrompt,
        language, // Include the current language in the edit request
        hasUserEdits: hasUserEdits,
        originalContent: originalContent,
        isCleanContent: isCleanContent,
      };
      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
                setContent(accumulatedText);
              }
            } catch (e) {
              // If not JSON, treat as plain text
              accumulatedText += buffer;
              setContent(accumulatedText);
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
              setContent(accumulatedText);
            } else if (pkt.type === "done") {
              break;
            } else if (pkt.type === "error") {
              throw new Error(pkt.text || "Unknown error");
            }
          } catch (e) {
            // If not JSON, treat as plain text
            accumulatedText += line;
            setContent(accumulatedText);
          }
        }
      }

      // NEW: Mark that content has been edited by AI
      setHasUserEdits(true);

      setEditPrompt("");
      setSelectedExamples([]);
    } catch (error: any) {
      setError(error.message || "Failed to apply edit");
    } finally {
      setLoadingEdit(false);
    }
  };

  // Streaming preview effect
  useEffect(() => {
    // Only trigger if we have a lesson or a prompt
    if (useExistingOutline === null) return;
    if (useExistingOutline === true && !selectedLesson) return;
    if (useExistingOutline === false && !currentPrompt.trim()) return;

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
        setContent(""); // Clear previous content
        setTextareaVisible(true);
        let gotFirstChunk = false;

        try {
          const requestBody: any = {
            // Only send outlineId when the user actually selected one
            outlineId: selectedOutlineId || undefined,
            // If no lesson was picked, derive a temporary title from the prompt or fallback
            lesson: selectedLesson || (currentPrompt ? currentPrompt.slice(0, 80) : "Untitled One-Pager"),
            language,
            length,
            styles: selectedStyles.join(','),
            // Always forward the prompt (if any) so backend can generate content
            prompt: currentPrompt || undefined,
          };

          // Add file context if creating from files
          if (isFromFiles) {
            requestBody.fromFiles = true;
            if (folderIds.length > 0) requestBody.folderIds = folderIds.join(',');
            if (fileIds.length > 0) requestBody.fileIds = fileIds.join(',');
          }

          // Add text context if creating from text
          if (isFromText) {
            requestBody.fromText = true;
            requestBody.textMode = textMode;
            requestBody.userText = userText;
          }

          // Add Knowledge Base context if creating from Knowledge Base
          if (isFromKnowledgeBase) {
            requestBody.fromKnowledgeBase = true;
          }

          // Add connector context if creating from connectors
          if (isFromConnectors) {
            requestBody.fromConnectors = true;
            requestBody.connectorIds = connectorIds.join(',');
            requestBody.connectorSources = connectorSources.join(',');
            if (selectedFiles.length > 0) {
              requestBody.selectedFiles = selectedFiles.join(',');
            }
          }

          const res = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
          });

          if (!res.ok || !res.body) {
            throw new Error(`Failed to generate presentation: ${res.status}`);
          }

          const headerChat = res.headers.get("X-Chat-Session-Id");
          if (headerChat) setChatId(headerChat);

          const reader = res.body.getReader();
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
                    setContent(accumulatedText);
                  }
                } catch (e) {
                  // If not JSON, treat as plain text
                  accumulatedText += buffer;
                  setContent(accumulatedText);
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
                  setContent(accumulatedText);
                } else if (pkt.type === "done") {
                  setStreamDone(true);
                  break;
                } else if (pkt.type === "error") {
                  throw new Error(pkt.text || "Unknown error");
                }
              } catch (e) {
                // If not JSON, treat as plain text
                accumulatedText += line + '\n';
                setContent(accumulatedText);
              }
            }

            // Determine if this buffer now contains some real (non-whitespace) text
            const hasMeaningfulText = /\S/.test(accumulatedText);

            if (hasMeaningfulText && !textareaVisible) {
              setTextareaVisible(true);

            }

            // Force state update to ensure UI reflects content changes
            if (accumulatedText && accumulatedText !== content) {
              setContent(accumulatedText);
            }
          }
        } catch (e: any) {
          if (e.name === "AbortError") return;

          // Retry logic
          if (attempt < 3) {
            const delay = 1500 * (attempt + 1);
            setTimeout(() => startPreview(attempt + 1), delay);
          } else {
            if (e?.message) {
              if (e.message.includes("The user aborted a request")) return;
            }
            setError(e.message);
          }
        } finally {
          // Always set loading to false when stream completes or is aborted
          setLoading(false);
          if (!abortController.signal.aborted && !gotFirstChunk && attempt >= 3) {
            setError("Failed to generate presentation – please try again later.");
          }
        }
      };

      fetchPreview();
    };

    startPreview();

    return () => {
      if (previewAbortRef.current) previewAbortRef.current.abort();
    };
  }, [useExistingOutline, selectedOutlineId, selectedLesson, currentPrompt, language, length, selectedStyles, isFromFiles, isFromText, textMode, folderIds.join(','), fileIds.join(','), userText]);

  // // Auto-scroll textarea as new content streams in
  // useEffect(() => {
  //   if (textareaVisible && textareaRef.current) {
  //     // Scroll to bottom to keep newest text in view
  //     textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  //   }
  // }, [content, textareaVisible]);


  const makeThoughts = () => {
    const list: string[] = [];
    list.push(`Analyzing presentation request for "${currentPrompt?.slice(0, 40) || "Untitled"}"...`);
    list.push(`Detected language: ${language.toUpperCase()}`);
    list.push(`Planning ${length} presentation with ${selectedStyles.length} style${selectedStyles.length > 1 ? "s" : ""}...`);
    // shuffle little filler line
    list.push("Consulting presentation knowledge base...");

    // Add a diverse set of informative yet playful status lines for presentation generation
    const extra = [
      "Crafting engaging content...",
      "Balancing information density...",
      "Selecting visual elements...",
      "Integrating presentation styles...",
      "Cross-checking content flow...",
      "Curating presentation variety...",
      "Weaving narrative structure...",
      "Injecting visual appeal...",
      "Sequencing content logically...",
      "Optimizing audience engagement...",
      "Aligning with presentation goals...",
      "Ensuring clear messaging...",
      "Connecting ideas cohesively...",
      "Drafting compelling sections...",
      "Incorporating visual hierarchy...",
      "Adding contextual elements...",
      "Scanning content relevance...",
      "Validating presentation clarity...",
      "Polishing visual design...",
      "Finalizing presentation structure...",
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
        if (txt.startsWith("Finalizing presentation")) return; // keep until loading finishes
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
     
  }, [loading, length, selectedStyles, currentPrompt, language]);


  // Once streaming is done, strip the first line that contains metadata (project, product type, etc.)
  useEffect(() => {
    if (streamDone && !firstLineRemoved) {
      const parts = content.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setContent(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, content]);

  // NEW: Store original content after stream completion
  useEffect(() => {
    if (streamDone && firstLineRemoved && content && !originalContent) {
      setOriginalContent(content);
    }
  }, [streamDone, firstLineRemoved, content, originalContent]);

  // Finalize/save one-pager
  const handleFinalize = async () => {
    if (!content.trim()) {
      setError("No content to finalize");
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Create AbortController for this request
    const abortController = new AbortController();

    // Add timeout safeguard to prevent infinite loading
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setIsGenerating(false);
      setError("Presentation finalization timed out. Please try again.");
    }, 300000); // 5 minutes timeout

    const activeProductType = sessionStorage.getItem('activeProductType');

    try {
      console.log("DEBUG: handleFinalize - hasUserEdits:", hasUserEdits);
      console.log("DEBUG: handleFinalize - editedTitleNames:", Array.from(editedTitleNames));

      // NEW: Determine what content to send based on user edits
      let contentToSend = content;
      let isCleanContent = false;

      if (hasUserEdits && (editedTitleNames.size > 0 || editedTitleIds.size > 0)) {
        console.log("DEBUG: handleFinalize - using clean content from UI");
        // If titles were changed, send only titles without context
        contentToSend = createCleanTitlesContentFromUI();
        isCleanContent = true;
      } else {
        console.log("DEBUG: handleFinalize - using full content");
        // If no titles changed, send full content with context
        contentToSend = content;
        isCleanContent = false;
      }

      console.log("DEBUG: handleFinalize - contentToSend length:", contentToSend.length);
      console.log("DEBUG: handleFinalize - isCleanContent:", isCleanContent);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: contentToSend,
          prompt: currentPrompt,
          hasUserEdits: hasUserEdits,
          originalContent: originalContent,
          isCleanContent: isCleanContent,
          outlineId: selectedOutlineId || undefined,
          lesson: selectedLesson,
          courseName: params?.get("courseName"),
          language: language,
          folderId: folderContext?.folderId || undefined,
          chatSessionId: chatId || undefined,
          // Add connector context if creating from connectors
          ...(isFromConnectors && {
            fromConnectors: true,
            connectorIds: connectorIds.join(','),
            connectorSources: connectorSources.join(','),
            ...(selectedFiles.length > 0 && {
              selectedFiles: selectedFiles.join(','),
            }),
          }),
        }),
        signal: abortController.signal
      });

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response
      if (!data || !data.id) {
        throw new Error("Invalid response from server: missing project ID");
      }

      setFinalProjectId(data.id);

      await trackCreateProduct(
        "Completed",
        sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
        isFromFiles,
        isFromText,
        isFromKnowledgeBase,
        isFromConnectors,
        language, 
        activeProductType ?? undefined,
        stylesState || undefined,
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

      // Navigate immediately without delay to prevent cancellation
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('last_created_product_id', String(data.id)); } catch (_) {}
      }
      router.push(`/projects/view/${data.id}?from=create`);

    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      try {
        // Mark that a "Failed" event has been tracked to prevent subsequent "Clicked" events
        if (!sessionStorage.getItem('createProductFailed')) {
          await trackCreateProduct(
            "Failed",
            sessionStorage.getItem('lessonContext') != null ? true : useExistingOutline === true ? true : false,
            isFromFiles,
            isFromText,
            isFromKnowledgeBase,
            isFromConnectors,
            language, 
            activeProductType ?? undefined,
            stylesState || undefined,
            advancedModeState
          );
          sessionStorage.setItem('createProductFailed', 'true');
        }
      } catch (error) {
        console.error('Error setting failed state:', error);
      }

      // Handle specific error types
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        setError("Request was canceled. Please try again.");
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        setError("Network error occurred. Please check your connection and try again.");
      } else {
        console.error('Finalization failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to finalize presentation');
      }
    } finally {
      setIsGenerating(false);
    }
  };

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
  }, [selectedOutlineId, useExistingOutline]);

  // Note: Auto-resize effect removed since we're using textarea

  const themeOptions = [
    { id: "wine", label: t('interface.generate.wine', 'Wine') },
    { id: "cherry", label: t('interface.generate.default', 'Default') },
    { id: "vanilla", label: t('interface.generate.engenuity', 'Engenuity') },
    { id: "terracotta", label: t('interface.generate.deloitte', 'Deloitte') },
    { id: "lunaria", label: t('interface.generate.lunaria', 'Lunaria') },
    { id: "zephyr", label: t('interface.generate.zephyr', 'Zephyr') },
  ];

  // Helper function to get theme SVG component
  const getThemeSvg = (themeId: string) => {
    const ThemeSvgComponent = ThemeSvgs[themeId as keyof typeof ThemeSvgs] || ThemeSvgs.default;
    return ThemeSvgComponent;
  };
  const styleOptions = [
    { value: "headlines", label: t('interface.generate.headlines', 'Headlines') },
    { value: "paragraphs", label: t('interface.generate.paragraphs', 'Paragraphs') },
    { value: "bullet_lists", label: t('interface.generate.bulletLists', 'Bullet Lists') },
    { value: "numbered_lists", label: t('interface.generate.numberedLists', 'Numbered Lists') },
    { value: "tables", label: t('interface.generate.tables', 'Tables') },
    { value: "alerts", label: t('interface.generate.alerts', 'Alerts') },
    { value: "recommendations", label: t('interface.generate.recommendations', 'Recommendations') },
    { value: "section_breaks", label: t('interface.generate.sectionBreaks', 'Section Breaks') },
    { value: "icons", label: t('interface.generate.icons', 'Icons') },
    { value: "important_sections", label: t('interface.generate.importantSections', 'Important Sections') }
  ];

  const stylePurposes = {
    headlines: t('interface.generate.headlinesPurpose', 'Section titles and headings'),
    paragraphs: t('interface.generate.paragraphsPurpose', 'Regular text blocks'),
    bullet_lists: t('interface.generate.bulletListsPurpose', 'Unordered lists with bullet points'),
    numbered_lists: t('interface.generate.numberedListsPurpose', 'Ordered lists with numbers'),
    tables: t('interface.generate.tablesPurpose', 'Data in rows and columns'),
    alerts: t('interface.generate.alertsPurpose', 'Important warnings or tips'),
    recommendations: t('interface.generate.recommendationsPurpose', 'Actionable advice'),
    section_breaks: t('interface.generate.sectionBreaksPurpose', 'Visual separators between sections'),
    icons: t('interface.generate.iconsPurpose', 'Emojis and visual elements'),
    important_sections: t('interface.generate.importantSectionsPurpose', 'Highlighted critical content')
  };
  const lengthOptions = [
    { value: "short", label: t('interface.generate.short', 'Short') },
    { value: "medium", label: t('interface.generate.medium', 'Medium') },
    { value: "long", label: t('interface.generate.long', 'Long') },
  ];

  // Theme configuration for outline colors (matching CourseOutlineClient)
  const themeConfig = {
    cherry: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
    lunaria: {
      headerBg: "bg-[#85749E]",
      numberColor: "text-white",
      accentBg: "bg-[#85749E]",
      accentBgHover: "hover:bg-[#6b5d7a]",
      accentText: "text-[#85749E]",
    },
    wine: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
    vanilla: {
      headerBg: "bg-[#C4B5D6]",
      numberColor: "text-white",
      accentBg: "bg-[#8776A0]",
      accentBgHover: "hover:bg-[#7a6b92]",
      accentText: "text-[#8776A0]",
    },
    terracotta: {
      headerBg: "bg-[#C4D6B5]",
      numberColor: "text-white",
      accentBg: "bg-[#2D7C21]",
      accentBgHover: "hover:bg-[#26701e]",
      accentText: "text-[#2D7C21]",
    },
    zephyr: {
      headerBg: "bg-[#E5EEFF]",
      numberColor: "text-gray-600",
      accentBg: "bg-[#0540AB]",
      accentBgHover: "hover:bg-[#043a99]",
      accentText: "text-[#0540AB]",
    },
  };

  const currentTheme = themeConfig[selectedTheme as keyof typeof themeConfig] || themeConfig.cherry;

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
          width: '1200px',
          height: '1600px',
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
          width: '1960px',
          height: '2400px',
          top: '1258px',
          left: '433px',
          borderRadius: '450px',
          background: 'linear-gradient(180deg, rgba(144, 237, 229, 0.9) 0%, rgba(216, 23, 255, 0.9) 100%)',
          transform: 'rotate(-120deg)',
          filter: 'blur(200px)',
          opacity: '40%',
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

      <div className="w-full max-w-4xl flex flex-col gap-0 text-gray-900 relative z-10">

          {/* Page title */}
          <h1 className="text-center pb-6 text-2xl sora-font-semibold leading-none text-[#4B4B51] mb-2">{t('interface.generate.onePagerOutlinePreview', 'One-Pager outline preview')}</h1>

          {/* Main content container - removed this div wrapper */}
          {/* Prompt input for standalone presentation */}
          {useExistingOutline === false && (
            <div className="flex gap-2 items-start bg-[#6E9BFB] rounded-t-lg">
              <div className="relative group flex-1">
                <Textarea
                  value={currentPrompt}
                  onChange={(e) => {
                    const newPrompt = e.target.value;
                    setCurrentPrompt(newPrompt);
                    
                    // Handle prompt storage for long prompts by updating URL
                    const sp = new URLSearchParams(params?.toString() || "");
                    if (newPrompt.length > 500) {
                      const promptId = generatePromptId();
                      sessionStorage.setItem(promptId, newPrompt);
                      sp.set("prompt", promptId);
                    } else {
                      sp.set("prompt", newPrompt);
                    }
                    router.replace(`?${sp.toString()}`, { scroll: false });
                  }}
                  placeholder={t('interface.generate.presentationPromptPlaceholder', "Describe what presentation you'd like to create")}
                  rows={1}
                  className="w-full px-7 py-5 !rounded-t-lg bg-white text-lg text-[#FFFFFF] resize-none overflow-hidden min-h-[56px] focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 cursor-pointer shadow-lg"
                  style={{ background: "#6E9BFB", border: "#CCCCCC" }}
                />
              </div>
            </div>
          )}

        <section className="flex flex-col gap-3 pb-8 rounded-b-lg">
          {error && <p className="text-red-600">{error}</p>}

          {/* Main content display - Custom slide titles display matching course outline format */}
          {(textareaVisible || loading) && (
            <div
              className="rounded-b-lg flex flex-col relative"
              style={{ 
                animation: 'fadeInDown 0.25s ease-out both',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.5) 100%)',
                border: '1px solid #E0E0E0'
              }}
            >
              
              {/* Lesson cards container */}
              <div className="px-10 py-5 flex flex-col gap-[15px] shadow-lg">
                {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
                
                {loadingEdit && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                    <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                  </div>
                )}

                {/* Display content in card format if lessons are available */}
                {lessonList.length > 0 && lessonList.map((lesson, idx: number) => (
                  <div key={idx} className="bg-[#FFFFFF] rounded-lg overflow-hidden transition-shadow duration-200" style={{ border: '1px solid #CCCCCC' }}>
                    {/* Lesson header with number and title */}
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-[#CCCCCC] rounded-t-lg">
                      {/* <span className="text-[#0D001B] font-semibold text-lg">{idx + 1}.</span> */}
                      <div className="flex-1">
                        {editingLessonId === idx ? (
                          <div className="relative group">
                            <Input
                              type="text"
                              value={editedTitles[idx] || lesson.title}
                              onChange={(e) => handleTitleEdit(idx, e.target.value)}
                              className="text-[#0D001B] font-bold text-sm leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                              autoFocus
                              onBlur={(e) => handleTitleSave(idx, (e.target as HTMLInputElement).value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave(idx, (e.target as HTMLInputElement).value);
                                if (e.key === 'Escape') handleTitleCancel(idx);
                              }}
                              disabled={!streamDone}
                            />
                          </div>
                        ) : (
                          <div className="relative group">
                            <Input
                              type="text"
                              value={getTitleForLesson(lesson, idx)}
                              onMouseDown={() => {
                                nextEditingIdRef.current = idx;
                              }}
                              onClick={() => {
                                if (streamDone) setEditingLessonId(idx);
                              }}
                              readOnly
                              className="text-[#0D001B] font-bold text-sm leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                              disabled={!streamDone}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content preview/edit */}
                    {lesson.content && (
                      <div className="px-5 pb-4">
                        {editingContentId === idx ? (
                          <Textarea
                            value={getContentForLesson(lesson, idx)}
                            onChange={(e) => handleContentEdit(idx, e.target.value)}
                            className="w-full !text-sm font-normal leading-[140%] text-[#171718] resize-none min-h-[100px] border-transparent focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 bg-[#FFFFFF] cursor-pointer"
                            autoFocus
                            onBlur={(e) => handleContentSave(idx, (e.target as HTMLTextAreaElement).value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') handleContentCancel(idx);
                            }}
                            disabled={!streamDone}
                          />
                        ) : (
                          <div 
                            className={`cursor-pointer !text-sm rounded p-2`} // ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}
                            onMouseDown={() => {
                              nextEditingContentIdRef.current = idx;
                            }}
                            onClick={() => {
                              if (streamDone) setEditingContentId(idx);
                            }}
                          >
                            {(() => {
                              const fullContent = getContentForLesson(lesson, idx);
                              const truncatedContent = fullContent.length > 100 ? fullContent.substring(0, 100) + '...' : fullContent;
                              return renderContentWithCircles(truncatedContent);
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Additional sections */}
                {additionalSections.map((section, idx: number) => (
                  <div key={section.id} className="bg-[#FFFFFF] rounded-lg overflow-hidden transition-shadow duration-200" style={{ border: '1px solid #CCCCCC' }}>
                    {/* Section header with title */}
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-[#CCCCCC] rounded-t-lg">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleAdditionalSectionTitleEdit(section.id, e.target.value)}
                          className="text-[#0D001B] font-bold text-sm leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#FFFFFF] px-0"
                          placeholder={t('interface.generate.sectionTitlePlaceholder', 'Section title...')}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdditionalSection(section.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {t('actions.delete', 'Delete')}
                      </button>
                    </div>

                    {/* Section content */}
                    <div className="px-5 pb-4">
                      <Textarea
                        value={section.content}
                        onChange={(e) => handleAdditionalSectionContentEdit(section.id, e.target.value)}
                        className="w-full !text-sm font-normal leading-[140%] text-[#171718] resize-none min-h-[100px] border-transparent focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 bg-[#FFFFFF] cursor-pointer"
                        placeholder={t('interface.generate.addContentPlaceholder', 'Add your content here...')}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Section Button */}
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg text-xs bg-[#FFFFFF] text-[#0F58F9] font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>{t('interface.generate.addSection', 'Add Section')}</span>
                </button>
                <div className="flex items-center justify-between text-xs text-[#A5A5A5] py-2 rounded-b-[8px]">
                  <span className="select-none">{wordCount} {t('interface.generate.words', 'words')}</span>
                  <span className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="#E0E0E0" strokeWidth="2" fill="none"/>
                      <circle cx="8" cy="8" r="7" stroke="#0F58F9" strokeWidth="2" fill="none"
                        strokeDasharray={`${2 * Math.PI * 7}`}
                        strokeDashoffset={`${2 * Math.PI * 7 * (1 - Math.min(content.length / 50000, 1))}`}
                        transform="rotate(-90 8 8)"
                        strokeLinecap="round"
                      />
                    </svg>
                    {content.length}/50000
                  </span>
                </div>
            </div>

            </div>
          )}
          </section>

          {/* Theme section */}
          {streamDone && content && (
            <section className="flex flex-col gap-3 mb-8">
              <div className="bg-white rounded-lg border border-[#E0E0E0] pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                <div className="bg-white rounded-lg border border-[#E0E0E0] pb-6 flex flex-col gap-4 flex-1" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                  <div className="flex items-center justify-between py-2 border-b border-[#E0E0E0] px-6">
                    <div className="flex flex-col">
                      <h2 className="text-md font-semibold text-[#171718]">{t('interface.generate.themes', 'Themes')}</h2>
                      <p className="text-[#A5A5A5] text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm text-[#CCCCCC] hover:opacity-80 transition-opacity border border-[#CCCCCC] rounded-lg px-3 py-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="#71717AB2" /><circle cx="17.5" cy="10.5" r=".5" fill="#71717AB2" /><circle cx="6.5" cy="12.5" r=".5" fill="#71717AB2" /><circle cx="8.5" cy="7.5" r=".5" fill="#71717AB2" /></svg>
                      <span>{t('interface.generate.viewMore', 'View more')}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 px-6">
                    {/* Themes grid */}
                    <div className="grid grid-cols-3 gap-5 justify-items-center">
                      {themeOptions.slice(0, 1).map((theme) => {
                        const ThemeSvgComponent = getThemeSvg(theme.id);
                        const isSelected = selectedTheme === theme.id;

                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`relative flex flex-col rounded-lg overflow-hidden transition-all p-2 gap-2 ${isSelected
                              ? 'bg-[#F2F8FF] border-2 border-[#0F58F9]'
                              : 'bg-[#FFFFFF] border border-[#E0E0E0] hover:shadow-lg'
                              }`}
                          >
                            {/* Status indicator circle - top right */}
                            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${isSelected
                              ? 'bg-[#0F58F9]'
                              : 'bg-white border border-[#E0E0E0]'
                              }`}>
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            
                            <div className="w-[214px] h-[116px] flex items-center justify-center">
                              <ThemeSvgComponent />
                            </div>
                            <div className="flex items-center justify-left px-3">
                              <span className={`text-lg ${isSelected ? 'text-[#171718]' : 'text-[#4D4D4D]'} font-medium select-none`}>
                                {theme.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="bg-white border border-[#E0E0E0] pb-6 flex flex-col gap-4 mt-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                  <div className="flex flex-col py-4 border-b border-[#E0E0E0] px-6">
                    <h2 className="text-base font-semibold text-[#171718]">{t('interface.generate.content', 'Content')}</h2>
                    <p className="text-[#A5A5A5] font-light text-xs">{t('interface.generate.adjustImageStyles', 'Adjust image styles')}</p>
                  </div>

                  <div className="flex flex-col gap-4 px-6">
                    {/* Image source dropdown */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#171718] select-none">{t('interface.generate.imageSource', 'Image source')}</label>
                      <Select value={selectedImageSource} onValueChange={setSelectedImageSource}>
                        <SelectTrigger className="w-full px-4 py-2 rounded-full border border-[#E0E0E0] bg-white text-sm text-[#171718] font-semibold cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-[#E0E0E0]" side="top">
                          <SelectItem value="ai">{t('interface.generate.aiImages', 'Ai images')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}


          {streamDone && content && (
            <section className="flex flex-col gap-3 rounded-b-lg" style={{ display: 'none' }}>
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
                            <span className={`w-4 ${currentTheme.accentText} ${isSelected ? '' : 'opacity-0'}`}>
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

                  {/* Content section - Hidden */}
                  {false && (
                    <div className="border-t border-gray-200 pt-5 flex flex-col gap-4">
                      <h3 className="text-lg font-semibold text-[#20355D]">{t('interface.generate.content', 'Content')}</h3>
                      <p className="text-sm text-[#858587] font-medium">{t('interface.generate.adjustPresentationStyles', 'Adjust text and image styles for your presentation')}</p>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.amountOfTextPerCard', 'Amount of text per card')}</label>
                        <div className="flex w-full border border-gray-300 rounded-full overflow-hidden text-sm font-medium text-[#20355D] select-none">
                          {[{ id: "brief", label: t('interface.generate.brief', 'Brief'), icon: <AlignLeft size={14} /> }, { id: "medium", label: t('interface.generate.medium', 'Medium'), icon: <AlignCenter size={14} /> }, { id: "detailed", label: t('interface.generate.detailed', 'Detailed'), icon: <AlignRight size={14} /> }].map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setTextDensity(opt.id as any)} className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${textDensity === opt.id ? 'bg-[#d6e6fd]' : 'bg-white'}`}>
                              {opt.icon} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.imageSource', 'Image source')}</label>
                        <Select value={imageSource} onValueChange={setImageSource}>
                          <SelectTrigger className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-300" side="top">
                            <SelectItem value="ai">{t('interface.generate.aiImages', 'AI images')}</SelectItem>
                            <SelectItem value="stock">{t('interface.generate.stockImages', 'Stock images')}</SelectItem>
                            <SelectItem value="none">{t('interface.generate.noImages', 'No images')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.aiImageModel', 'AI image model')}</label>
                        <Select value={aiModel} onValueChange={setAiModel}>
                          <SelectTrigger className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-300" side="top">
                            <SelectItem value="flux-fast">{t('interface.generate.fluxFast', 'Flux Kontext Fast')}</SelectItem>
                            <SelectItem value="flux-quality">{t('interface.generate.fluxQuality', 'Flux Kontext HQ')}</SelectItem>
                            <SelectItem value="stable">{t('interface.generate.stableDiffusion', 'Stable Diffusion 2.1')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        </div> {/* end inner wrapper */}

      {/* Full-width generate footer bar */}
      {!loading && streamDone && content && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-3 px-6 flex items-center justify-center">
          {/* Credits required */}
          <div className="absolute left-6 flex items-center gap-2 text-sm font-semibold text-[#A5A5A5] select-none">
            {/* custom credits svg */}
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_476_6531)">
                <path d="M12.0597 6.91301C12.6899 7.14796 13.2507 7.53803 13.6902 8.04714C14.1297 8.55625 14.4337 9.16797 14.5742 9.82572C14.7146 10.4835 14.6869 11.166 14.4937 11.8102C14.3005 12.4545 13.9479 13.0396 13.4686 13.5114C12.9893 13.9833 12.3988 14.3267 11.7517 14.5098C11.1045 14.693 10.4216 14.71 9.76613 14.5593C9.11065 14.4086 8.50375 14.0951 8.00156 13.6477C7.49937 13.2003 7.1181 12.6335 6.89301 11.9997M4.66634 3.99967H5.33301V6.66634M11.1397 9.25301L11.6063 9.72634L9.72634 11.6063M9.33301 5.33301C9.33301 7.54215 7.54215 9.33301 5.33301 9.33301C3.12387 9.33301 1.33301 7.54215 1.33301 5.33301C1.33301 3.12387 3.12387 1.33301 5.33301 1.33301C7.54215 1.33301 9.33301 3.12387 9.33301 5.33301Z" stroke="#A5A5A5" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_476_6531">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <span>5 {t('interface.generate.credits', 'Credits')}</span>
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
                onClick={handleFinalize}
                className="px-6 py-2 rounded-md bg-[#0F58F9] text-white text-sm font-bold hover:bg-[#0D4AD1] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading || isGenerating || isCreatingFinal}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5423 12.1718C11.1071 12.3383 10.8704 12.5762 10.702 13.0106C10.5353 12.5762 10.297 12.3399 9.86183 12.1718C10.297 12.0053 10.5337 11.769 10.702 11.3329C10.8688 11.7674 11.1071 12.0037 11.5423 12.1718ZM10.7628 5.37068C11.1399 3.9685 11.6552 3.45294 13.0612 3.07596C11.6568 2.6995 11.1404 2.18501 10.7628 0.78125C10.3858 2.18343 9.87044 2.69899 8.46442 3.07596C9.86886 3.45243 10.3852 3.96692 10.7628 5.37068ZM11.1732 8.26481C11.1732 8.1327 11.1044 7.9732 10.9118 7.9195C9.33637 7.47967 8.34932 6.97753 7.61233 6.24235C6.8754 5.50661 6.37139 4.52108 5.93249 2.94815C5.8787 2.75589 5.71894 2.68715 5.58662 2.68715C5.4543 2.68715 5.29454 2.75589 5.24076 2.94815C4.80022 4.52108 4.29727 5.50655 3.56092 6.24235C2.82291 6.97918 1.83688 7.4813 0.261415 7.9195C0.0688515 7.9732 0 8.13271 0 8.26481C0 8.39692 0.0688515 8.55643 0.261415 8.61013C1.83688 9.04996 2.82393 9.5521 3.56092 10.2873C4.29892 11.0241 4.80186 12.0085 5.24076 13.5815C5.29455 13.7737 5.45431 13.8425 5.58662 13.8425C5.71895 13.8425 5.87871 13.7737 5.93249 13.5815C6.37303 12.0085 6.87598 11.0231 7.61233 10.2873C8.35034 9.55045 9.33637 9.04832 10.9118 8.61013C11.1044 8.55642 11.1732 8.39692 11.1732 8.26481Z" fill="white"/>
                </svg>
                <span className="select-none font-semibold">Generate One-Pager</span>
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
      {streamDone && content && (
        <AiAgent
          editPrompt={editPrompt}
          setEditPrompt={setEditPrompt}
          examples={onePagerExamples}
          selectedExamples={selectedExamples}
          toggleExample={toggleExample}
          loadingEdit={loadingEdit}
          onApplyEdit={() => {
            handleApplyEdit();
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
      {isGenerating && (
        <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
          <LoadingAnimation message={t('interface.generate.finalizingPresentation', 'Finalizing presentation...')} />
        </div>
      )}
    </>
  );
} 