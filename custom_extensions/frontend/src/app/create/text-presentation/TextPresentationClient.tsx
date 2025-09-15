"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Sparkles, Settings, AlignLeft, AlignCenter, AlignRight, Plus, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

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
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("wine");
  const [textDensity, setTextDensity] = useState("medium");
  const [imageSource, setImageSource] = useState("ai");
  const [aiModel, setAiModel] = useState("flux-fast");
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

  // Smart change handling states (similar to QuizClient)
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [originallyEditedTitles, setOriginallyEditedTitles] = useState<Set<number>>(new Set());
  const [editedTitleNames, setEditedTitleNames] = useState<Set<string>>(new Set());

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

    console.log("DEBUG: Final clean content length:", cleanContent.length);
    return cleanContent.trim();
  };

  // NEW: Create clean content for finalization - similar to QuizClient logic
  const createCleanFinalizationContent = (content: string) => {
    const lessons = parseContentIntoLessons(content);
    if (lessons.length === 0) return content;

    let cleanContent = "";

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

  // Example prompts for advanced mode
  const onePagerExamples = [
    {
      short: "Adapt to U.S. industry specifics",
      detailed:
        "Update the one-pager's structure based on U.S. industry and cultural specifics: adjust content, replace topics, examples, and wording that don't align with the American context.",
    },
    {
      short: "Adopt trends and latest practices",
      detailed:
        "Update the one-pager's structure by adding content that reflect current trends and best practices in the field. Remove outdated elements and replace them with up-to-date content.",
    },
    {
      short: "Incorporate top industry examples",
      detailed:
        "Analyze the best one-pagers on the market in this topic and restructure our content accordingly: change or add content which others present more effectively. Focus on content flow and clarity.",
    },
    {
      short: "Simplify and restructure the content",
      detailed:
        "Rewrite the one-pager's structure to make it more logical and user-friendly. Remove redundant sections, merge overlapping content, and rephrase content for clarity and simplicity.",
    },
    {
      short: "Increase value and depth of content",
      detailed:
        "Strengthen the one-pager by adding content that deepen understanding and bring advanced-level value. Refine wording to clearly communicate skills and insights being delivered.",
    },
    {
      short: "Add case studies and applications",
      detailed:
        "Revise the one-pager's structure to include applied content — such as real-life cases, examples, or actionable approaches — while keeping the theoretical foundation intact.",
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
  }, [useExistingOutline, selectedOutlineId, selectedLesson, prompt, language, length, selectedStyles, isFromFiles, isFromText, textMode, folderIds.join(','), fileIds.join(','), userText]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, length, selectedStyles, prompt, language]);


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

      // Navigate immediately without delay to prevent cancellation
      router.push(`/projects/view/${data.id}`);

    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);

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
                <p className="text-lg font-medium text-gray-700">{t('interface.generate.presentationQuestion', 'Do you want to create a presentation from an existing Course Outline?')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUseExistingOutline(true)}
                    className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium"
                  >
                    {t('interface.generate.yesContentForPresentation', 'Yes, content for the presentation from the outline')}
                  </button>
                  <button
                    onClick={() => setUseExistingOutline(false)}
                    className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('interface.generate.noStandalonePresentation', 'No, I want standalone presentation')}
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
                        setSelectedModuleIndex(null);
                        setLessonsForModule([]);
                        setSelectedLesson("");
                      }}
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
                          value={language}
                          onValueChange={setLanguage}
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
                        <Select
                          value={length}
                          onValueChange={setLength}
                        >
                          <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-300">
                            {lengthOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DropdownMenu open={showStylesDropdown} onOpenChange={setShowStylesDropdown}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="flex items-center justify-between px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9 gap-2"
                            >
                              <span className="text-black">
                                {selectedStyles.length === 0
                                  ? t('interface.generate.selectStyles', 'Select styles')
                                  : selectedStyles.length === 1
                                    ? selectedStyles[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : `${selectedStyles.length} ${t('interface.generate.stylesSelected', 'styles selected')}`}
                              </span>
                              <ChevronDown size={14} className="text-gray-500 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="w-56 p-2 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" 
                            align="start"
                            style={{ backgroundColor: 'white' }}
                          >
                            {styleOptions.map((option) => (
                              <label key={option.value} className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStyles.includes(option.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStyles([...selectedStyles, option.value]);
                                    } else {
                                      setSelectedStyles(selectedStyles.filter(s => s !== option.value));
                                    }
                                  }}
                                  className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{option.label}</span>
                              </label>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </>
                )}

                {/* Show standalone one-pager dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <>
                    <Select
                      value={language}
                      onValueChange={setLanguage}
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
                    <Select
                      value={length}
                      onValueChange={setLength}
                    >
                      <SelectTrigger className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-300">
                        {lengthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DropdownMenu open={showStylesDropdown} onOpenChange={setShowStylesDropdown}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center justify-between px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black cursor-pointer focus:ring-0 focus-visible:ring-0 h-9 gap-2"
                        >
                          <span className="text-black">
                            {selectedStyles.length === 0
                              ? 'Select styles'
                              : selectedStyles.length === 1
                                ? selectedStyles[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                : `${selectedStyles.length} styles selected`}
                          </span>
                          <ChevronDown size={14} className="text-gray-500 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 p-2 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" 
                        align="start"
                        style={{ backgroundColor: 'white' }}
                      >
                        {styleOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStyles.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStyles([...selectedStyles, option.value]);
                                } else {
                                  setSelectedStyles(selectedStyles.filter(s => s !== option.value));
                                }
                              }}
                              className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Prompt input for standalone presentation */}
          {useExistingOutline === false && (
            <div className="relative group">
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
                className="w-full px-7 py-5 rounded-2xl bg-white text-lg text-black resize-none overflow-hidden min-h-[56px] border border-gray-100 focus:border-blue-300 focus:outline-none transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
              <Edit 
                size={16} 
                className="absolute top-[27px] right-7 text-gray-400 pointer-events-none flex items-center justify-center" 
              />
            </div>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.presentationContent', 'Presentation Content')}</h2>
              {hasUserEdits && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  User edits detected
                </span>
              )}
            </div>
            {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
            {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}

            {/* Main content display - Custom slide titles display matching course outline format */}
            {textareaVisible && (
              <div
                className="bg-white border border-gray-300 rounded-xl p-6 flex flex-col gap-6 relative"
                style={{ animation: 'fadeInDown 0.25s ease-out both' }}
              >
                {loadingEdit && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                    <LoadingAnimation message={t('interface.generate.applyingEdit', 'Applying edit...')} />
                  </div>
                )}

                {/* Display content in card format if lessons are available, otherwise show textarea */}
                {lessonList.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {lessonList.map((lesson, idx: number) => (
                      <div key={idx} className="flex rounded-xl shadow-sm overflow-hidden">
                        {/* Left colored bar with index - matching course outline styling */}
                        <div className={`w-[60px] ${currentTheme.headerBg} flex items-start justify-center pt-5`}>
                          <span className={`${currentTheme.numberColor} font-semibold text-base select-none`}>{idx + 1}</span>
                        </div>

                        {/* Main card - matching course outline styling */}
                        <div className="flex-1 bg-white border border-gray-300 rounded-r-xl p-5">
                          <div className="mb-2">
                            {editingLessonId === idx ? (
                              <input
                                type="text"
                                value={editedTitles[idx] || lesson.title}
                                onChange={(e) => handleTitleEdit(idx, e.target.value)}
                                className="w-full font-medium text-lg border-none focus:ring-0 text-gray-900 mb-3"
                                autoFocus
                                onBlur={(e) => handleTitleSave(idx, (e.target as HTMLInputElement).value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleTitleSave(idx, (e.target as HTMLInputElement).value);
                                  if (e.key === 'Escape') handleTitleCancel(idx);
                                }}
                              />
                            ) : (
                              <h4
                                className="w-full font-medium text-lg border-none focus:ring-0 text-gray-900 mb-3 cursor-pointer"
                                onMouseDown={() => {
                                  // Set the next editing ID before the blur event fires
                                  nextEditingIdRef.current = idx;
                                }}
                                onClick={() => {
                                  setEditingLessonId(idx);
                                }}
                              >
                                {getTitleForLesson(lesson, idx)}
                              </h4>
                            )}
                          </div>
                          {lesson.content && (
                            <div className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}`}>
                              {lesson.content.substring(0, 100)}
                              {lesson.content.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Inline Advanced section & button */}
          {streamDone && content && (
            <>
              {showAdvanced && (
                <div className="w-full bg-white border border-gray-300 rounded-xl p-4 flex flex-col gap-3 mb-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={t('interface.generate.describeImprovements', 'Describe what you\'d like to improve...')}
                    className="w-full border border-gray-300 rounded-md p-3 resize-none min-h-[80px] text-black"
                  />

                  {/* Example prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    {onePagerExamples.map((ex) => (
                      <button
                        key={ex.short}
                        type="button"
                        onClick={() => toggleExample(ex)}
                        className={`relative text-left border border-gray-200 rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-colors ${selectedExamples.includes(ex.short) ? 'bg-white shadow' : 'bg-[#D9ECFF] hover:bg-white'
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
                      onClick={handleApplyEdit}
                      className={`px-6 py-2 rounded-full ${currentTheme.accentBg} text-white text-sm font-medium ${currentTheme.accentBgHover} disabled:opacity-50 flex items-center gap-1`}
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

          {streamDone && content && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.setupContentBuilder', 'Set up your Contentbuilder')}</h2>
              <div className="bg-white border border-gray-300 rounded-xl px-6 pt-5 pb-6 flex flex-col gap-4" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
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
                          className={`flex flex-col rounded-lg overflow-hidden border border-transparent shadow-sm transition-all p-2 gap-2 ${isSelected
                            ? 'bg-[#cee2fd]'
                            : ''
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

                  {/* Content section */}
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
                      <div className="relative w-full">
                        <select value={imageSource} onChange={(e) => setImageSource(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                          <option value="ai">{t('interface.generate.aiImages', 'AI images')}</option><option value="stock">{t('interface.generate.stockImages', 'Stock images')}</option><option value="none">{t('interface.generate.noImages', 'No images')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800 select-none">{t('interface.generate.aiImageModel', 'AI image model')}</label>
                      <div className="relative w-full">
                        <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="appearance-none pr-8 w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black">
                          <option value="flux-fast">{t('interface.generate.fluxFast', 'Flux Kontext Fast')}</option><option value="flux-quality">{t('interface.generate.fluxQuality', 'Flux Kontext HQ')}</option><option value="stable">{t('interface.generate.stableDiffusion', 'Stable Diffusion 2.1')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {streamDone && content && (
            <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
                {/* Credits calculated based on slide count */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>5 {t('interface.generate.credits', 'credits')}</span>
              </div>
              <div className="flex items-center gap-[7.5rem]">
                <span className="text-lg text-gray-700 font-medium select-none">
                  {/* This can be word count or removed */}
                  {content.split(/\s+/).length} {t('interface.generate.words', 'words')}
                </span>
                <button
                  type="button"
                  onClick={handleFinalize}
                  className={`px-24 py-3 rounded-full ${currentTheme.accentBg} text-white text-lg font-semibold ${currentTheme.accentBgHover} active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2`}
                  disabled={loading || isGenerating || isCreatingFinal}
                >
                  <Sparkles size={18} />
                  <span className="select-none font-semibold">{t('interface.generate.generate', 'Generate')}</span>
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
      {isGenerating && (
        <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
          <LoadingAnimation message={t('interface.generate.finalizingPresentation', 'Finalizing presentation...')} />
        </div>
      )}
    </>
  );
} 