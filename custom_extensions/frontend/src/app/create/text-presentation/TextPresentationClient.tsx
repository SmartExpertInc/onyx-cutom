"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronDown, Sparkles, Settings, AlignLeft, AlignCenter, AlignRight, Plus, Edit, Info, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getPromptFromUrlOrStorage, generatePromptId } from "../../../utils/promptUtils";
import { trackCreateProduct } from "../../../lib/mixpanelClient"

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

  // Total lessons & credit cost (stored in sessionStorage)
  const storedCreditsData = sessionStorage.getItem('creditsReference');
  const creditsRequired = storedCreditsData ? JSON.parse(storedCreditsData).credits_reference.find(
    (item: any) => item.content_type === "onepager"
  )?.credits_amount : 7;

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
  
  // Modal states for insufficient credits
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [isHandlingInsufficientCredits, setIsHandlingInsufficientCredits] = useState(false);

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
  const [originalJsonResponse, setOriginalJsonResponse] = useState<string>("");
  const [originallyEditedTitles, setOriginallyEditedTitles] = useState<Set<number>>(new Set());
  const [editedTitleNames, setEditedTitleNames] = useState<Set<string>>(new Set());

  // Track usage of styles feature
  const [stylesState, setStylesState] = useState<string | null>(sessionStorage.getItem('stylesState'));
  const handleStylesClick = () => {
    if (!stylesState) {
      setStylesState("Clicked");
    }
  };

  // Helper function to convert text presentation JSON to display format
  const convertTextJsonToDisplay = (parsed: any): string => {
    let displayText = `# ${parsed.textTitle}\n\n`;
    
    parsed.contentBlocks.forEach((block: any) => {
      if (block.type === 'headline') {
        const level = block.level || 2;
        const prefix = '#'.repeat(level);
        displayText += `${prefix} ${block.text}\n\n`;
      } else if (block.type === 'paragraph') {
        displayText += `${block.text}\n\n`;
      } else if (block.type === 'bullet_list' && block.items) {
        block.items.forEach((item: any) => {
          if (typeof item === 'string') {
            displayText += `- ${item}\n`;
          } else if (item.type === 'bullet_list') {
            item.items.forEach((subItem: any) => {
              if (typeof subItem === 'string') {
                displayText += `  - ${subItem}\n`;
              } else if (subItem.type === 'numbered_list') {
                subItem.items.forEach((numItem: any, idx: number) => {
                  displayText += `    ${idx + 1}. ${numItem}\n`;
                });
              }
            });
          } else if (item.type === 'numbered_list') {
            item.items.forEach((numItem: any, idx: number) => {
              displayText += `  ${idx + 1}. ${numItem}\n`;
            });
          }
        });
        displayText += '\n';
      } else if (block.type === 'numbered_list' && block.items) {
        block.items.forEach((item: any, idx: number) => {
          if (typeof item === 'string') {
            displayText += `${idx + 1}. ${item}\n`;
          } else if (item.type === 'bullet_list') {
            // Handle nested bullet list in numbered item
            item.items.forEach((subItem: any, subIdx: number) => {
              if (subItem.type === 'headline') {
                displayText += `  ${idx + 1}.${subIdx + 1} ${subItem.text}\n`;
              } else if (subItem.type === 'paragraph') {
                displayText += `     ${subItem.text}\n`;
              }
            });
          }
        });
        displayText += '\n';
      } else if (block.type === 'table' && block.headers && block.rows) {
        // Simple table representation
        displayText += `| ${block.headers.join(' | ')} |\n`;
        displayText += `| ${block.headers.map(() => '---').join(' | ')} |\n`;
        block.rows.forEach((row: any) => {
          displayText += `| ${row.join(' | ')} |\n`;
        });
        displayText += '\n';
      }
    });
    
    return displayText;
  };

  // FIXED: Alternative parsing method for when header-based parsing fails
  const parseContentAlternatively = (content: string) => {
    const lessons = [];
    
    // Remove any H1 header at the start (document title)
    let workingContent = content.replace(/^#\s+.+?\n+/m, '').trim();
    
    // Method 1: Try splitting by double line breaks (paragraph-based sections)
    // But group them into reasonable-sized chunks
    const paragraphSections = workingContent.split(/\n\s*\n/).filter(section => section.trim().length > 0);
    
    const MAX_CHUNK_SIZE = 1500;
    const MIN_CHUNK_SIZE = 300;
    
    if (paragraphSections.length > 1) {
      console.log('[ALTERNATIVE_PARSE] Method 1: Splitting by paragraphs into chunks');
      let currentChunk = '';
      let currentTitle = '';
      let chunkCount = 0;
      
      for (let i = 0; i < paragraphSections.length; i++) {
        const section = paragraphSections[i].trim();
        if (section.length < 10) continue; // Skip very short sections
        
        // If this is the first paragraph in a new chunk, use it for the title
        if (!currentTitle) {
          const lines = section.split('\n');
          const firstLine = lines[0].trim().replace(/^[•\-*]\s+/, ''); // Remove bullet points
          currentTitle = firstLine.length < 80 ? firstLine : firstLine.substring(0, 60) + '...';
        }
        
        // Add this paragraph to current chunk
        const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + section;
        
        // If adding this would exceed max size and we have enough content, save current chunk
        if (potentialChunk.length > MAX_CHUNK_SIZE && currentChunk.length >= MIN_CHUNK_SIZE) {
          lessons.push({
            title: currentTitle || `Section ${chunkCount + 1}`,
            content: currentChunk.trim()
          });
          console.log(`[ALTERNATIVE_PARSE] Added chunk ${chunkCount + 1}: "${currentTitle}" (${currentChunk.length} chars)`);
          chunkCount++;
          currentChunk = section;
          currentTitle = '';
        } else {
          currentChunk = potentialChunk;
        }
      }
      
      // Add remaining chunk
      if (currentChunk.trim()) {
        lessons.push({
          title: currentTitle || `Section ${chunkCount + 1}`,
          content: currentChunk.trim()
        });
        console.log(`[ALTERNATIVE_PARSE] Added final chunk: "${currentTitle}" (${currentChunk.length} chars)`);
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
    if (!content.trim()) {
      console.log('[PARSE_LESSONS] ⚠️ Empty content');
      return [];
    }

    console.log('[PARSE_LESSONS] 🔍 Parsing content, length:', content.length);
    const lessons = [];

    // Find all headers (H1-H6) with their positions
    const headerMatches = [];
    const headerRegex = /(?:^|\n)(#{1,6})\s+(.+?)(?=\n|$)/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      headerMatches.push({
        index: match.index,
        level: match[1].length, // Convert ### to 3
        levelString: match[1],
        title: match[2].trim(),
        fullMatch: match[0]
      });
    }
    console.log('[PARSE_LESSONS] 📋 Found', headerMatches.length, 'headers');
    headerMatches.forEach((h, idx) => {
      console.log(`[PARSE_LESSONS] Header ${idx + 1}: ${'#'.repeat(h.level)} "${h.title}"`);
    });

    // SMART FILTERING: Skip H1 if it's the only H1 and there are H2+ headers
    let filteredHeaders = headerMatches;
    const h1Count = headerMatches.filter(h => h.level === 1).length;
    const h2PlusCount = headerMatches.filter(h => h.level >= 2).length;
    
    if (h1Count === 1 && h2PlusCount > 0) {
      console.log('[PARSE_LESSONS] 🎯 Skipping single H1 (document title), using H2+ headers for sections');
      filteredHeaders = headerMatches.filter(h => h.level >= 2);
    } else if (h1Count > 1) {
      // Multiple H1s - use all headers
      console.log('[PARSE_LESSONS] 📚 Multiple H1s found, using all headers');
      filteredHeaders = headerMatches;
    } else if (h1Count === 1 && h2PlusCount === 0) {
      // Only one H1 and no other headers - need to split content differently
      console.log('[PARSE_LESSONS] ⚠️ Only one H1, no subsections - will split content intelligently');
      filteredHeaders = [];
    }

    // Process each header to extract its content
    for (let i = 0; i < filteredHeaders.length; i++) {
      const currentHeader = filteredHeaders[i];
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
      const nextHeaderIndex = i < filteredHeaders.length - 1 ? filteredHeaders[i + 1].index : content.length;
      const sectionStart = currentHeader.index + currentHeader.fullMatch.length;
      let sectionContent = content.substring(sectionStart, nextHeaderIndex).trim();

      // FIXED: More comprehensive content cleaning while preserving structure
      let cleanedContent = sectionContent
        .replace(/^\s*---\s*$/gm, '') // Remove section breaks
        .replace(/^\s*\n+/g, '') // Remove leading newlines
        .replace(/\n+\s*$/g, '') // Remove trailing newlines
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove * italic formatting
        .trim();

      // NEW: If content is very large (>2000 chars), split it into smaller chunks
      const MAX_SECTION_SIZE = 2000;
      if (cleanedContent.length > MAX_SECTION_SIZE) {
        console.log(`[PARSE_LESSONS] ⚠️ Section "${title}" is large (${cleanedContent.length} chars), splitting into chunks`);
        
        // Split by paragraphs (double newlines)
        const paragraphs = cleanedContent.split(/\n\s*\n/);
        let currentChunk = '';
        let chunkIndex = 1;
        
        for (const para of paragraphs) {
          if (currentChunk.length + para.length > MAX_SECTION_SIZE && currentChunk.length > 0) {
            // Save current chunk
            lessons.push({
              title: chunkIndex === 1 ? title : `${title} (Part ${chunkIndex})`,
              content: currentChunk.trim()
            });
            console.log(`[PARSE_LESSONS] ✅ Added chunk ${chunkIndex}: "${title}" (${currentChunk.length} chars)`);
            currentChunk = para;
            chunkIndex++;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
          }
        }
        
        // Add remaining chunk
        if (currentChunk.trim()) {
          lessons.push({
            title: chunkIndex === 1 ? title : `${title} (Part ${chunkIndex})`,
            content: currentChunk.trim()
          });
          console.log(`[PARSE_LESSONS] ✅ Added final chunk: "${title}" (${currentChunk.length} chars)`);
        }
      } else {
        // Normal sized section
        if (title && (cleanedContent || sectionContent.trim())) {
          lessons.push({
            title: title,
            content: cleanedContent || sectionContent.trim() || title
          });
          console.log(`[PARSE_LESSONS] ✅ Added lesson ${lessons.length}: "${title}" (${(cleanedContent || sectionContent.trim()).length} chars)`);
        } else {
          console.log(`[PARSE_LESSONS] ⏭️ Skipped header: "${title}" (no valid content)`);
        }
      }
    }

    console.log('[PARSE_LESSONS] 📊 Total lessons parsed:', lessons.length);

    // FIXED: If no structured content found, try alternative parsing methods instead of hardcoded fallback
    if (lessons.length === 0) {
      console.log('[PARSE_LESSONS] ⚠️ No lessons parsed from headers, trying alternative parsing');
      // Try parsing by paragraph breaks or bullet points
      const alternativeParsing = parseContentAlternatively(content);
      if (alternativeParsing.length > 0) {
        console.log('[PARSE_LESSONS] ✅ Alternative parsing found', alternativeParsing.length, 'sections');
        return alternativeParsing;
      }
      
      // Last resort: return content, but split if it's very large
      const cleanedContent = content
        .replace(/^\s*---\s*$/gm, '') // Remove section breaks
        .replace(/#{1,6}\s*/gm, '') // Remove markdown headers that failed to parse
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .trim();
      
      if (cleanedContent) {
        const MAX_SINGLE_SECTION = 1500;
        
        // If content is reasonable sized, show as one block
        if (cleanedContent.length <= MAX_SINGLE_SECTION) {
          console.log('[PARSE_LESSONS] ℹ️ Returning single section (small document)');
          return [{
            title: "Document Content",
            content: cleanedContent
          }];
        }
        
        // Content is large - split by paragraphs into multiple sections
        console.log('[PARSE_LESSONS] ⚠️ Large document with no structure, splitting into chunks');
        const paragraphs = cleanedContent.split(/\n\s*\n/);
        const sections = [];
        let currentChunk = '';
        let chunkIndex = 1;
        
        for (const para of paragraphs) {
          if (para.trim().length < 10) continue;
          
          const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + para;
          
          if (potentialChunk.length > MAX_SINGLE_SECTION && currentChunk.length > 300) {
            // Extract title from first line of chunk
            const firstLine = currentChunk.split('\n')[0].trim().substring(0, 60);
            sections.push({
              title: firstLine || `Part ${chunkIndex}`,
              content: currentChunk.trim()
            });
            console.log(`[PARSE_LESSONS] ✅ Added fallback chunk ${chunkIndex} (${currentChunk.length} chars)`);
            currentChunk = para;
            chunkIndex++;
          } else {
            currentChunk = potentialChunk;
          }
        }
        
        // Add remaining chunk
        if (currentChunk.trim()) {
          const firstLine = currentChunk.split('\n')[0].trim().substring(0, 60);
          sections.push({
            title: firstLine || `Part ${chunkIndex}`,
            content: currentChunk.trim()
          });
          console.log(`[PARSE_LESSONS] ✅ Added final fallback chunk (${currentChunk.length} chars)`);
        }
        
        return sections.length > 0 ? sections : [{
          title: "Document Content",
          content: cleanedContent
        }];
      }
      
      // If absolutely no content, return empty array
      console.log('[PARSE_LESSONS] ❌ No content could be parsed at all');
      return [];
    }

    console.log('[PARSE_LESSONS] ✅ Returning', lessons.length, 'lessons');
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
          setError("Failed to generate presentation – please try again later.");
          setLoadingEdit(false);
        }
      }, HEARTBEAT_INTERVAL);
    };
    
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
                // Start heartbeat only after receiving first delta package
                if (!heartbeatStarted) {
                  heartbeatStarted = true;
                  setupHeartbeat();
                }
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
      // Always cleanup timeouts
      cleanup();
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
              if (attempt < 3) {
                console.log(`Retrying due to stream timeout (attempt ${attempt + 1}/3)`);
                setTimeout(() => startPreview(attempt + 1), 1500 * (attempt + 1));
                return;
              }
              
              setError("Failed to generate presentation – please try again later.");
              setLoading(false);
            }
          }, HEARTBEAT_INTERVAL);
        };

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
              
              console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] ========== STREAMING FINISHED ==========');
              console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] Total accumulated JSON length:', accumulatedJsonText.length);
              console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] Full accumulated JSON:');
              console.log(accumulatedJsonText);
              console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] ========================================');
              
              // Try final parse
              try {
                const finalParsed = JSON.parse(accumulatedJsonText);
                console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] ✅ Final JSON parse successful');
                console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] Has textTitle:', !!finalParsed.textTitle, 'Has contentBlocks:', !!finalParsed.contentBlocks);
                console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] Block count:', finalParsed.contentBlocks?.length);
              } catch (e) {
                console.log('[TEXT_PRESENTATION_STREAM_COMPLETE] ❌ Final JSON parse FAILED:', e instanceof Error ? e.message : String(e));
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
                accumulatedText += line + '\n';
                accumulatedJsonText += line + '\n';
              }
            }

            // LIVE PREVIEW: Show content immediately during streaming (like presentations do)
            if (accumulatedText) {
              console.log('[TEXT_PRESENTATION_PREVIEW] 📺 Showing accumulated text during streaming, length:', accumulatedText.length);
              
              // Try to parse as complete JSON first
              let displayText = "";
              try {
                const parsed = JSON.parse(accumulatedText);
                if (parsed && typeof parsed === 'object' && parsed.textTitle && parsed.contentBlocks) {
                  console.log('[TEXT_PRESENTATION_JSON_STREAM] ✅ Complete JSON parsed, blocks:', parsed.contentBlocks.length);
                  displayText = convertTextJsonToDisplay(parsed);
                  setOriginalJsonResponse(accumulatedText);
                  setOriginalContent(displayText);
                } else {
                  throw new Error("Missing required fields");
                }
              } catch (e) {
                // JSON incomplete or invalid - create simple readable preview from raw text
                console.log('[TEXT_PRESENTATION_PREVIEW] 📝 Creating readable preview from incomplete JSON');
                console.log('[TEXT_PRESENTATION_PREVIEW] Accumulated text length:', accumulatedText.length);
                console.log('[TEXT_PRESENTATION_PREVIEW] First 500 chars:', accumulatedText.substring(0, 500));
                console.log('[TEXT_PRESENTATION_PREVIEW] Last 200 chars:', accumulatedText.substring(Math.max(0, accumulatedText.length - 200)));
                
                // Extract text title if available
                const titleMatch = accumulatedText.match(/"textTitle"\s*:\s*"([^"]+)"/);
                const title = titleMatch ? titleMatch[1] : "Generating Content...";
                console.log('[TEXT_PRESENTATION_PREVIEW] Extracted title:', title);
                
                displayText = `# ${title}\n\n`;
                
                // Try to extract contentBlocks array even if JSON is incomplete
                // Look for the start of contentBlocks array and capture everything after it
                const contentBlocksStartMatch = accumulatedText.match(/"contentBlocks"\s*:\s*\[/);
                if (contentBlocksStartMatch && typeof contentBlocksStartMatch.index === 'number') {
                  const startIndex = contentBlocksStartMatch.index + contentBlocksStartMatch[0].length;
                  const remainingText = accumulatedText.substring(startIndex);
                  console.log('[TEXT_PRESENTATION_PREVIEW] Found contentBlocks start at index:', startIndex);
                  console.log('[TEXT_PRESENTATION_PREVIEW] Remaining text length:', remainingText.length);
                  console.log('[TEXT_PRESENTATION_PREVIEW] Remaining text preview:', remainingText.substring(0, 300));
                  
                  // Extract all blocks with type and text
                  // We need to match complete blocks that have been fully streamed
                  // Strategy: Find complete block objects by matching braces and ensuring they're closed
                  // Look for blocks that are properly terminated with }, or }]
                  
                  // First, try to extract complete headline blocks (simpler, no nested structures)
                  const headlinePattern = /\{\s*"type"\s*:\s*"headline"\s*,\s*(?:"level"\s*:\s*\d+\s*,\s*)?"text"\s*:\s*"([^"]+)"\s*(?:,\s*"[^"]+"\s*:\s*[^,}]+)*\}\s*(?:,|\])/g;
                  
                  // Extract complete paragraph blocks (also simple, no nested structures)
                  const paragraphPattern = /\{\s*"type"\s*:\s*"paragraph"\s*,\s*"text"\s*:\s*"([^"]+)"\s*(?:,\s*"[^"]+"\s*:\s*[^,}]+)*\}\s*(?:,|\])/g;
                  
                  const blocks = [];
                  let match;
                  
                  // Extract headlines
                  console.log('[TEXT_PRESENTATION_PREVIEW] 🔍 Searching for headline blocks...');
                  while ((match = headlinePattern.exec(remainingText)) !== null) {
                    console.log('[TEXT_PRESENTATION_PREVIEW] Found headline at index', match.index, ':', match[1].substring(0, 50));
                    blocks.push({ 
                      type: 'headline', 
                      text: match[1],
                      matchIndex: match.index 
                    });
                  }
                  
                  // Extract paragraphs
                  console.log('[TEXT_PRESENTATION_PREVIEW] 🔍 Searching for paragraph blocks...');
                  while ((match = paragraphPattern.exec(remainingText)) !== null) {
                    console.log('[TEXT_PRESENTATION_PREVIEW] Found paragraph at index', match.index, ':', match[1].substring(0, 50));
                    blocks.push({ 
                      type: 'paragraph', 
                      text: match[1],
                      matchIndex: match.index 
                    });
                  }
                  
                  // Sort blocks by their appearance order in the text
                  blocks.sort((a, b) => a.matchIndex - b.matchIndex);
                  console.log('[TEXT_PRESENTATION_PREVIEW] 📊 Sorted', blocks.length, 'blocks by appearance order');
                  
                  console.log('[TEXT_PRESENTATION_PREVIEW] 📊 Extracted', blocks.length, 'complete blocks');
                  blocks.forEach((block, idx) => {
                    console.log(`[TEXT_PRESENTATION_PREVIEW] Block ${idx + 1}: ${block.type} - "${block.text.substring(0, 50)}..."`);
                  });
                  
                  if (blocks.length > 0) {
                    // Generate markdown maintaining block order
                    blocks.forEach(block => {
                      if (block.type === 'headline') {
                        displayText += `## ${block.text}\n\n`;
                      } else if (block.type === 'paragraph') {
                        displayText += `${block.text}\n\n`;
                      }
                    });
                    
                    console.log('[TEXT_PRESENTATION_PREVIEW] ✅ Generated markdown with', blocks.length, 'blocks');
                    console.log('[TEXT_PRESENTATION_PREVIEW] Markdown length:', displayText.length);
                  } else {
                    console.log('[TEXT_PRESENTATION_PREVIEW] ⚠️ No complete blocks extracted yet');
                    displayText += "**Generating content sections...**\n\n";
                  }
                } else {
                  console.log('[TEXT_PRESENTATION_PREVIEW] ⚠️ contentBlocks array not found in JSON yet');
                  displayText += "**Generating content sections...**\n\n";
                }
              }
              
              // Log what we're about to set
              console.log('[TEXT_PRESENTATION_PREVIEW] Setting content, length:', displayText.length);
              console.log('[TEXT_PRESENTATION_PREVIEW] Content has', (displayText.match(/^#{1,6}\s/gm) || []).length, 'headers');
              
              setContent(displayText);
              
              // Make textarea visible as soon as we have content
              const hasMeaningfulText = /\S/.test(accumulatedText);
              if (hasMeaningfulText && !textareaVisible) {
                console.log('[TEXT_PRESENTATION_PREVIEW] ✅ Making textarea visible');
                setTextareaVisible(true);
              }
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
          // Always cleanup timeouts
          cleanup();
          
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
  }, [useExistingOutline, selectedOutlineId, selectedLesson, currentPrompt, language, length, selectedStyles, isFromFiles, isFromText, textMode, folderIds.join(','), fileIds.join(','), userText, retryTrigger]);

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


  // Fallback: Process plain text content after streaming is done (only if JSON wasn't already parsed)
  useEffect(() => {
    if (streamDone && !firstLineRemoved && !originalJsonResponse) {
      console.log('[TEXT_PRESENTATION_FALLBACK] Processing plain text content, length:', content.length);
      
      // Original logic for plain text (only runs if JSON wasn't parsed during streaming)
      const parts = content.split('\n');
      if (parts.length > 1) {
        let trimmed = parts.slice(1).join('\n');
        // Remove leading blank lines (one or more) at the very start
        trimmed = trimmed.replace(/^(\s*\n)+/, '');
        setContent(trimmed);
      }
      setFirstLineRemoved(true);
    }
  }, [streamDone, firstLineRemoved, content, originalJsonResponse]);

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

    // Lightweight credits pre-check to avoid starting finalization when balance is 0
    try {
      const creditsRes = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, { cache: 'no-store', credentials: 'same-origin' });
      if (creditsRes.ok) {
        const credits = await creditsRes.json();
        if (!credits || typeof credits.credits_balance !== 'number' || credits.credits_balance <= 0) {
          setShowInsufficientCreditsModal(true);
          setIsGenerating(false);
          setIsHandlingInsufficientCredits(true);
          return;
        }
      }
    } catch (_) {
      // On pre-check failure, proceed to server-side validation (will still 402 if insufficient)
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
        console.log("DEBUG: handleFinalize - edited section indices:", Array.from(editedTitleIds));
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

      // Like presentations: send original JSON as aiResponse if available
      console.log('[TEXT_PRESENTATION_FINALIZE] originalJsonResponse available:', !!originalJsonResponse, 'length:', originalJsonResponse?.length || 0);
      
      // Log what we're actually sending
      const aiResponseToSend = isCleanContent ? contentToSend : (originalJsonResponse || contentToSend);
      console.log('[TEXT_PRESENTATION_FINALIZE] Sending as aiResponse:', isCleanContent ? 'clean titles' : (originalJsonResponse ? 'original JSON' : 'display text'));
      console.log('[TEXT_PRESENTATION_FINALIZE] aiResponse length:', aiResponseToSend.length);
      console.log('[TEXT_PRESENTATION_FINALIZE] aiResponse preview:', aiResponseToSend.substring(0, 200));

      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // CRITICAL: When sections are edited (isCleanContent), send the clean titles (contentToSend)
          // Otherwise, send original JSON for fast-path parsing
          aiResponse: aiResponseToSend,
          prompt: currentPrompt,
          hasUserEdits: hasUserEdits,
          originalContent: originalContent,
          isCleanContent: isCleanContent,
          // NEW: Send indices of edited sections for selective regeneration
          editedSectionIndices: isCleanContent ? Array.from(editedTitleIds).join(',') : undefined,
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
        // Check for insufficient credits (402)
        if (response.status === 402) {
          setIsGenerating(false); // Stop the finalization animation
          setIsHandlingInsufficientCredits(true); // Prevent regeneration
          setShowInsufficientCreditsModal(true);
          return;
        }
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
    <React.Fragment>
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

        <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">

          <h1 className="text-center text-[64px] font-semibold leading-none text-[#191D30] mt-[97px] mb-9">{t('interface.generate.title', 'Generate')}</h1>

          {/* Step-by-step process */}
          <div className="flex flex-col gap-4">
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
                                setSelectedModuleIndex(null);
                                setLessonsForModule([]);
                                setSelectedLesson("");
                              }}
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
                    )}

                    {/* Show final dropdowns when lesson is selected */}
                    {selectedLesson && (
                      <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                          {/* Language dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                        <Select
                          value={language}
                          onValueChange={setLanguage}
                        >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.language', 'Language')}:</span>
                                  <span className="text-[#09090B]">{language === 'en' ? 'English' : language === 'uk' ? 'Ukrainian' : language === 'es' ? 'Spanish' : 'Russian'}</span>
                                </div>
                          </SelectTrigger>
                          <SelectContent className="border-white shadow-lg" sideOffset={15}>
                            <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                            <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                            <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                            <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                          </SelectContent>
                        </Select>
                          </div>
                          
                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                          
                          {/* Length dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                        <Select
                          value={length}
                          onValueChange={setLength}
                        >
                              <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                <div className="flex items-center gap-2">
                                  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                                  </svg>
                                  <span className="text-[#09090B] opacity-50">{t('interface.generate.length', 'Length')}:</span>
                                  <span className="text-[#09090B]">{lengthOptions.find(opt => opt.value === length)?.label}</span>
                                </div>
                          </SelectTrigger>
                          <SelectContent className="border-white shadow-lg" sideOffset={15} align="center">
                            {lengthOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                          </div>
                          
                          {/* Divider */}
                          <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                          
                          {/* Styles dropdown */}
                          <div className="flex-1 flex items-center justify-center">
                        <DropdownMenu open={showStylesDropdown} onOpenChange={() => {
                          setShowStylesDropdown(!showStylesDropdown);
                          handleStylesClick();}}>
                          <DropdownMenuTrigger asChild>
                                <button className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                                  <div className="flex items-center gap-2">
                                    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" clipRule="evenodd" d="M13.3483 1.00069C13.3461 1.00099 13.3439 1.00131 13.3418 1.00164H7.02321C6.18813 1.00164 5.5 1.68603 5.5 2.52111V15.7169C5.5 16.552 6.18813 17.2401 7.02321 17.2401H15.9777C16.8128 17.2401 17.5 16.552 17.5 15.7169V5.12632C17.4992 5.11946 17.4982 5.11261 17.4971 5.10578C17.496 5.0788 17.4925 5.05197 17.4869 5.02557C17.4843 5.01269 17.4812 4.99993 17.4775 4.98732C17.4678 4.95493 17.4547 4.92366 17.4384 4.89404C17.436 4.88997 17.4335 4.88594 17.4309 4.88194C17.4109 4.84801 17.3868 4.81669 17.3591 4.78868L13.7139 1.13966C13.6869 1.11319 13.6568 1.09002 13.6243 1.07064C13.6182 1.06707 13.612 1.06364 13.6057 1.06035C13.5272 1.01663 13.438 0.995976 13.3483 1.00069ZM7.02322 1.9577H12.8996V4.07974C12.8996 4.91481 13.5878 5.60294 14.4228 5.60294H16.5449V15.7169C16.5449 16.0393 16.3002 16.2849 15.9777 16.2849H7.02322C6.70078 16.2849 6.45516 16.0393 6.45516 15.7169V2.52109C6.45516 2.19865 6.70078 1.9577 7.02322 1.9577ZM13.8548 2.63395L15.8677 4.64686H14.4228C14.1004 4.64686 13.8548 4.40218 13.8548 4.07974V2.63395ZM8.30297 7.48898C8.17679 7.48923 8.05584 7.5394 7.96653 7.62853C7.87722 7.71767 7.82682 7.83852 7.82633 7.9647C7.82608 8.02749 7.83822 8.08972 7.86206 8.14781C7.88589 8.20591 7.92094 8.25873 7.96522 8.30327C8.00949 8.3478 8.06211 8.38316 8.12006 8.40733C8.17802 8.43151 8.24017 8.44401 8.30297 8.44413H14.698C14.761 8.44438 14.8235 8.43215 14.8818 8.40814C14.94 8.38414 14.993 8.34883 15.0376 8.30426C15.0821 8.25969 15.1174 8.20674 15.1414 8.14846C15.1654 8.09018 15.1777 8.02773 15.1774 7.9647C15.1772 7.90198 15.1646 7.83993 15.1404 7.78208C15.1161 7.72423 15.0808 7.67172 15.0362 7.62754C14.9917 7.58337 14.9389 7.5484 14.8809 7.52462C14.8229 7.50085 14.7607 7.48874 14.698 7.48898H8.30297ZM8.30297 10.1996C8.24017 10.1997 8.17802 10.2122 8.12006 10.2364C8.06211 10.2606 8.00949 10.2959 7.96521 10.3405C7.92094 10.385 7.88589 10.4378 7.86206 10.4959C7.83822 10.554 7.82608 10.6162 7.82633 10.679C7.82682 10.8052 7.87723 10.9261 7.96653 11.0152C8.05584 11.1043 8.17679 11.1545 8.30297 11.1547H14.698C14.7607 11.155 14.8229 11.1429 14.8809 11.1191C14.9389 11.0953 14.9917 11.0604 15.0362 11.0162C15.0808 10.972 15.1161 10.9195 15.1404 10.8617C15.1646 10.8038 15.1772 10.7418 15.1774 10.679C15.1777 10.616 15.1654 10.5535 15.1414 10.4953C15.1174 10.437 15.0821 10.384 15.0376 10.3395C14.993 10.2949 14.94 10.2596 14.8818 10.2356C14.8235 10.2116 14.761 10.1993 14.698 10.1996H8.30297ZM8.30297 12.9111C8.24017 12.9113 8.17802 12.9238 8.12006 12.9479C8.06211 12.9721 8.00949 13.0075 7.96521 13.052C7.92094 13.0965 7.88589 13.1494 7.86206 13.2075C7.83822 13.2656 7.82608 13.3278 7.82633 13.3906C7.82682 13.5168 7.87723 13.6376 7.96653 13.7267C8.05584 13.8159 8.17679 13.866 8.30297 13.8663H14.698C14.7607 13.8665 14.8229 13.8544 14.8809 13.8307C14.9389 13.8069 14.9917 13.7719 15.0362 13.7277C15.0808 13.6836 15.1161 13.631 15.1404 13.5732C15.1646 13.5154 15.1772 13.4533 15.1774 13.3906C15.1777 13.3275 15.1654 13.2651 15.1414 13.2068C15.1174 13.1485 15.0821 13.0956 15.0376 13.051C14.993 13.0064 14.94 12.9711 14.8818 12.9471C14.8235 12.9231 14.761 12.9109 14.698 12.9111H8.30297Z" fill="black"/>
                                    </svg>
                                    <span className="text-[#09090B] opacity-50 text-sm">{t('interface.generate.stylesSelected', 'Styles selected')}:</span>
                                    <span className="text-[#09090B]">
                                {selectedStyles.length === 0
                                        ? '0'
                                        : selectedStyles.length > 9
                                          ? '9'
                                          : selectedStyles.length.toString()}
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
                            {styleOptions.map((option) => (
                              <label key={option.value} className="flex items-center py-1.5 pr-2 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedStyles.includes(option.value)}
                                    onChange={(e) => {
                                      setStylesState("Used");
                                      if (e.target.checked) {
                                        setSelectedStyles([...selectedStyles, option.value]);
                                      } else {
                                        setSelectedStyles(selectedStyles.filter(s => s !== option.value));
                                      }
                                    }}
                                    className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-[#09090B]">{option.label}</span>
                                </div>
                                <div className="ml-6">
                                  <CustomTooltip content={stylePurposes[option.value as keyof typeof stylePurposes]}>
                                    <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                                  </CustomTooltip>
                                </div>
                              </label>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Show standalone one-pager dropdowns if user chose standalone */}
                {useExistingOutline === false && (
                  <div className="w-full bg-white rounded-lg py-3 px-8 shadow-sm hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center">
                      {/* Language dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                    <Select
                      value={language}
                      onValueChange={setLanguage}
                    >
                          <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                            <div className="flex items-center gap-2">
                              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 9C2 13.1421 5.35786 16.5 9.5 16.5C13.6421 16.5 17 13.1421 17 9C17 4.85786 13.6421 1.5 9.5 1.5C5.35786 1.5 2 4.85786 2 9Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10.25 1.53711C10.25 1.53711 12.5 4.50007 12.5 9.00004C12.5 13.5 10.25 16.4631 10.25 16.4631" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.75 16.4631C8.75 16.4631 6.5 13.5 6.5 9.00004C6.5 4.50007 8.75 1.53711 8.75 1.53711" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2.47229 11.625H16.5279" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2.47229 6.375H16.5279" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                              <span className="text-[#09090B] opacity-50">{t('interface.language', 'Language')}:</span>
                              <span className="text-[#09090B]">{language === 'en' ? 'English' : language === 'uk' ? 'Ukrainian' : language === 'es' ? 'Spanish' : 'Russian'}</span>
                            </div>
                      </SelectTrigger>
                      <SelectContent className="border-white shadow-lg">
                        <SelectItem value="en">{t('interface.english', 'English')}</SelectItem>
                        <SelectItem value="uk">{t('interface.ukrainian', 'Ukrainian')}</SelectItem>
                        <SelectItem value="es">{t('interface.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="ru">{t('interface.russian', 'Russian')}</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                      
                      {/* Length dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                    <Select
                      value={length}
                      onValueChange={setLength}
                    >
                          <SelectTrigger className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                            <div className="flex items-center gap-2">
                              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.1562 5.46446V4.59174C17.1562 3.69256 16.4421 2.97851 15.543 2.97851H9.6719L9.59256 2.76694C9.40744 2.29091 8.95785 2 8.45537 2H3.11322C2.21405 2 1.5 2.71405 1.5 3.61322V13.9008C1.5 14.8 2.21405 15.514 3.11322 15.514H15.8868C16.786 15.514 17.5 14.8 17.5 13.9008V6.2843C17.5 5.96694 17.3678 5.67603 17.1562 5.46446ZM15.543 4.14215C15.781 4.14215 15.9661 4.32727 15.9661 4.56529V5.06777H10.5182L10.1479 4.14215H15.543ZM16.3099 13.9008C16.3099 14.1388 16.1248 14.324 15.8868 14.324H3.11322C2.87521 14.324 2.69008 14.1388 2.69008 13.9008V3.58678C2.69008 3.34876 2.87521 3.16364 3.11322 3.16364L8.48182 3.19008L9.56612 5.8876C9.64545 6.12562 9.88347 6.25785 10.1215 6.25785H16.2835C16.2835 6.25785 16.3099 6.25785 16.3099 6.2843V13.9008Z" fill="black"/>
                              </svg>
                              <span className="text-[#09090B] opacity-50">{t('interface.generate.length', 'Length')}:</span>
                              <span className="text-[#09090B]">{lengthOptions.find(opt => opt.value === length)?.label}</span>
                            </div>
                      </SelectTrigger>
                      <SelectContent className="border-white shadow-lg">
                        {lengthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      </div>
                      
                      {/* Divider */}
                      <div className="w-px h-6 bg-[#E0E0E0] mx-4"></div>
                      
                      {/* Styles dropdown */}
                      <div className="flex-1 flex items-center justify-center">
                    <DropdownMenu open={showStylesDropdown} onOpenChange={() => {
                      setShowStylesDropdown(!showStylesDropdown);
                      handleStylesClick();}}>
                      <DropdownMenuTrigger asChild>
                            <button className="border-none bg-transparent p-0 h-auto cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none">
                              <div className="flex items-center gap-2">
                                <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M13.3483 1.00069C13.3461 1.00099 13.3439 1.00131 13.3418 1.00164H7.02321C6.18813 1.00164 5.5 1.68603 5.5 2.52111V15.7169C5.5 16.552 6.18813 17.2401 7.02321 17.2401H15.9777C16.8128 17.2401 17.5 16.552 17.5 15.7169V5.12632C17.4992 5.11946 17.4982 5.11261 17.4971 5.10578C17.496 5.0788 17.4925 5.05197 17.4869 5.02557C17.4843 5.01269 17.4812 4.99993 17.4775 4.98732C17.4678 4.95493 17.4547 4.92366 17.4384 4.89404C17.436 4.88997 17.4335 4.88594 17.4309 4.88194C17.4109 4.84801 17.3868 4.81669 17.3591 4.78868L13.7139 1.13966C13.6869 1.11319 13.6568 1.09002 13.6243 1.07064C13.6182 1.06707 13.612 1.06364 13.6057 1.06035C13.5272 1.01663 13.438 0.995976 13.3483 1.00069ZM7.02322 1.9577H12.8996V4.07974C12.8996 4.91481 13.5878 5.60294 14.4228 5.60294H16.5449V15.7169C16.5449 16.0393 16.3002 16.2849 15.9777 16.2849H7.02322C6.70078 16.2849 6.45516 16.0393 6.45516 15.7169V2.52109C6.45516 2.19865 6.70078 1.9577 7.02322 1.9577ZM13.8548 2.63395L15.8677 4.64686H14.4228C14.1004 4.64686 13.8548 4.40218 13.8548 4.07974V2.63395ZM8.30297 7.48898C8.17679 7.48923 8.05584 7.5394 7.96653 7.62853C7.87722 7.71767 7.82682 7.83852 7.82633 7.9647C7.82608 8.02749 7.83822 8.08972 7.86206 8.14781C7.88589 8.20591 7.92094 8.25873 7.96522 8.30327C8.00949 8.3478 8.06211 8.38316 8.12006 8.40733C8.17802 8.43151 8.24017 8.44401 8.30297 8.44413H14.698C14.761 8.44438 14.8235 8.43215 14.8818 8.40814C14.94 8.38414 14.993 8.34883 15.0376 8.30426C15.0821 8.25969 15.1174 8.20674 15.1414 8.14846C15.1654 8.09018 15.1777 8.02773 15.1774 7.9647C15.1772 7.90198 15.1646 7.83993 15.1404 7.78208C15.1161 7.72423 15.0808 7.67172 15.0362 7.62754C14.9917 7.58337 14.9389 7.5484 14.8809 7.52462C14.8229 7.50085 14.7607 7.48874 14.698 7.48898H8.30297ZM8.30297 10.1996C8.24017 10.1997 8.17802 10.2122 8.12006 10.2364C8.06211 10.2606 8.00949 10.2959 7.96521 10.3405C7.92094 10.385 7.88589 10.4378 7.86206 10.4959C7.83822 10.554 7.82608 10.6162 7.82633 10.679C7.82682 10.8052 7.87723 10.9261 7.96653 11.0152C8.05584 11.1043 8.17679 11.1545 8.30297 11.1547H14.698C14.7607 11.155 14.8229 11.1429 14.8809 11.1191C14.9389 11.0953 14.9917 11.0604 15.0362 11.0162C15.0808 10.972 15.1161 10.9195 15.1404 10.8617C15.1646 10.8038 15.1772 10.7418 15.1774 10.679C15.1777 10.616 15.1654 10.5535 15.1414 10.4953C15.1174 10.437 15.0821 10.384 15.0376 10.3395C14.993 10.2949 14.94 10.2596 14.8818 10.2356C14.8235 10.2116 14.761 10.1993 14.698 10.1996H8.30297ZM8.30297 12.9111C8.24017 12.9113 8.17802 12.9238 8.12006 12.9479C8.06211 12.9721 8.00949 13.0075 7.96521 13.052C7.92094 13.0965 7.88589 13.1494 7.86206 13.2075C7.83822 13.2656 7.82608 13.3278 7.82633 13.3906C7.82682 13.5168 7.87723 13.6376 7.96653 13.7267C8.05584 13.8159 8.17679 13.866 8.30297 13.8663H14.698C14.7607 13.8665 14.8229 13.8544 14.8809 13.8307C14.9389 13.8069 14.9917 13.7719 15.0362 13.7277C15.0808 13.6836 15.1161 13.631 15.1404 13.5732C15.1646 13.5154 15.1772 13.4533 15.1774 13.3906C15.1777 13.3275 15.1654 13.2651 15.1414 13.2068C15.1174 13.1485 15.0821 13.0956 15.0376 13.051C14.993 13.0064 14.94 12.9711 14.8818 12.9471C14.8235 12.9231 14.761 12.9109 14.698 12.9111H8.30297Z" fill="black"/>
                                </svg>
                                <span className="text-[#09090B] opacity-50 text-sm">{t('interface.generate.stylesSelected', 'Styles selected')}:</span>
                                <span className="text-[#09090B]">
                            {selectedStyles.length === 0
                                    ? '0'
                                    : selectedStyles.length > 9
                                      ? '9'
                                      : selectedStyles.length.toString()}
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
                        {styleOptions.map((option) => (
                          <label key={option.value} className="flex justify-between flex-1 items-center py-1.5 pr-2 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <div className="flex items-center gap-[10px]">
                              <input
                                type="checkbox"
                                checked={selectedStyles.includes(option.value)}
                                onChange={(e) => {
                                  setStylesState("Used");
                                  if (e.target.checked) {
                                    setSelectedStyles([...selectedStyles, option.value]);
                                  } else {
                                    setSelectedStyles(selectedStyles.filter(s => s !== option.value));
                                  }
                                }}
                                className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-[#09090B]">{option.label}</span>
                            </div>
                            <div className="ml-6">
                              <CustomTooltip content={stylePurposes[option.value as keyof typeof stylePurposes]}>
                                <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                              </CustomTooltip>
                            </div>
                          </label>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

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

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.presentationContent', 'Presentation Content')}</h2>
              {false && hasUserEdits && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  User edits detected
                </span>
              )}
            </div>
            {loading && <LoadingAnimation message={thoughts[thoughtIdx]} />}
            {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}

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

                {/* Display content in card format if lessons are available, otherwise show textarea */}
                {lessonList.length > 0 && (
                  <div className="bg-white rounded-[8px] p-5 flex flex-col gap-[15px] relative">
                    {lessonList.map((lesson, idx: number) => (
                      <div key={idx} className="flex bg-[#F3F7FF] rounded-[4px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 p-5 gap-5">
                        {/* Left blue square with number */}
                        <div className="flex items-center justify-center w-6 h-6 bg-[#0F58F9] rounded-[2.4px] text-white font-semibold text-sm select-none flex-shrink-0 mt-[8px]">
                          {idx + 1}
                        </div>

                        {/* Main content section */}
                        <div className="flex-1">
                          <div className="mb-2">
                            {editingLessonId === idx ? (
                              <div className="relative group">
                                <Input
                                  type="text"
                                  value={editedTitles[idx] || lesson.title}
                                  onChange={(e) => handleTitleEdit(idx, e.target.value)}
                                  className="text-[#20355D] font-medium text-[20px] leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#F3F7FF]"
                                  autoFocus
                                  onBlur={(e) => handleTitleSave(idx, (e.target as HTMLInputElement).value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSave(idx, (e.target as HTMLInputElement).value);
                                    if (e.key === 'Escape') handleTitleCancel(idx);
                                  }}
                                  disabled={!streamDone}
                                />
                                {(editedTitles[idx] || lesson.title) && (
                                  <Edit 
                                    size={16} 
                                    className="absolute top-[10px] right-[12px] text-gray-400 opacity-100 transition-opacity duration-200 pointer-events-none"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="relative group">
                                <h4
                                  className="text-[#20355D] font-medium text-[20px] leading-[120%] cursor-pointer border-transparent focus-visible:border-transparent shadow-none bg-[#F3F7FF] w-full h-9 px-3 py-1 pr-8"
                                  onMouseDown={() => {
                                    // Set the next editing ID before the blur event fires
                                    nextEditingIdRef.current = idx;
                                  }}
                                  onClick={() => {
                                    if (streamDone) setEditingLessonId(idx);
                                  }}
                                >
                                  {getTitleForLesson(lesson, idx)}
                                </h4>
                                {getTitleForLesson(lesson, idx) && (
                                  <Edit 
                                    size={16} 
                                    className="absolute top-[10px] right-[12px] text-gray-400 opacity-100 transition-opacity duration-200 pointer-events-none"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          {lesson.content && (
                            <div className={`text-[16px] font-normal leading-[140%] text-[#09090B] opacity-60 whitespace-pre-wrap ${editedTitleIds.has(idx) ? 'filter blur-[2px]' : ''}`}>
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
                    {onePagerExamples.map((ex) => (
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
                      className="flex items-center gap-1 text-sm text-[#CCCCCC] hover:opacity-80 transition-opacity border border-[#CCCCCC] rounded-lg px-3 py-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="#71717AB2" /><circle cx="17.5" cy="10.5" r=".5" fill="#71717AB2" /><circle cx="6.5" cy="12.5" r=".5" fill="#71717AB2" /><circle cx="8.5" cy="7.5" r=".5" fill="#71717AB2" /></svg>
                      <span>{t('interface.generate.viewMore', 'View more')}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 px-6">
                    {/* Themes grid */}
                    <div className="grid grid-cols-3 gap-5 justify-items-center">
                      {themeOptions.map((theme) => {
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
                          <SelectItem value="stock">{t('interface.generate.stockImages', 'Stock images')}</SelectItem>
                          <SelectItem value="none">{t('interface.generate.noImages', 'No images')}</SelectItem>
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
    </React.Fragment>
  );
} 