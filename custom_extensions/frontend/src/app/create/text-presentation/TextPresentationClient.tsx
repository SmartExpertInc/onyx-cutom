"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Sparkles, Settings, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";

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
  const [useExistingOutline, setUseExistingOutline] = useState<boolean | null>(
    params?.get("outlineId") ? true : (params?.get("prompt") ? false : null)
  );
  const [prompt, setPrompt] = useState(params?.get("prompt") || "");

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
  
  // Display mode state
  const [displayMode, setDisplayMode] = useState<'cards' | 'text'>('cards');
  
  // State for editing lesson titles
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editedTitles, setEditedTitles] = useState<{[key: number]: string}>({});

  // Parse content into lessons/sections
  const parseContentIntoLessons = (content: string) => {
    if (!content.trim()) return [];
    
    const lessons = [];
    
    // Split content by markdown headers or section breaks
    const sections = content.split(/(?:^|\n)(?:#{1,3}\s+.*|---\s*$)/m);
    const headers = content.match(/(?:^|\n)(#{1,3}\s+.*)/gm) || [];
    
    // Clean up headers and remove emoji/icon headers
    const cleanHeaders = headers
      .map(h => h.replace(/^[\n]*#{1,3}\s*/, '').trim())
      .filter(h => h && !h.match(/^[📚🛠️💡🚀📞]/) && h !== 'Introduction to AI Tools for High School Teachers');
    
    for (let i = 0; i < cleanHeaders.length; i++) {
      let title = cleanHeaders[i];
      const nextSectionIndex = i + 1;
      
      // Clean title - remove {isImportant} and other unwanted patterns
      title = title
        .replace(/\{[^}]*\}/g, '') // Remove {isImportant} and similar patterns
        .trim();
      
      // Get content between current header and next header
      let sectionContent = '';
      if (nextSectionIndex < sections.length) {
        sectionContent = sections[nextSectionIndex] || '';
      }
      
      // Clean up the content - remove markdown formatting but keep structure
      sectionContent = sectionContent
        .replace(/^\s*---\s*$/gm, '') // Remove section breaks
        .replace(/^\s*\n+/g, '') // Remove leading newlines
        .replace(/\n+\s*$/g, '') // Remove trailing newlines
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove * italic formatting
        .trim();
      
      if (title && sectionContent) {
        lessons.push({
          title: title,
          content: sectionContent
        });
      }
    }
    
    // If no structured content found, create manual sections based on your specific content
    if (lessons.length === 0) {
      const manualSections = [
        {
          title: "Benefits of AI Tools in Education",
          content: "AI tools offer numerous advantages for high school teachers, including personalized learning, enhanced engagement, time efficiency, and data-driven insights."
        },
        {
          title: "Popular AI Tools for High School Teachers", 
          content: "Kahoot!, Grammarly, Socrative, Google Classroom, and Edmodo are widely used AI tools that benefit high school education."
        },
        {
          title: "Recommendations for Implementing AI Tools",
          content: "Start small, provide training, monitor progress, and encourage feedback to effectively integrate AI tools into teaching practice."
        },
        {
          title: "Training and Development",
          content: "Professional development and ongoing training help teachers maximize the benefits of AI tools in their classrooms."
        },
        {
          title: "Resources and Support",
          content: "Access to resources, technical support, and community networks ensures successful AI tool implementation."
        }
      ];
      
      return manualSections;
    }
    
    return lessons;
  };

  const lessonList = parseContentIntoLessons(content);

  // Handle lesson title editing
  const handleTitleEdit = (lessonIndex: number, newTitle: string) => {
    setEditedTitles(prev => ({
      ...prev,
      [lessonIndex]: newTitle
    }));
  };

  const handleTitleSave = (lessonIndex: number) => {
    setEditingLessonId(null);
    // Update the original content with new title
    updateContentWithNewTitle(lessonIndex);
  };

  const updateContentWithNewTitle = (lessonIndex: number) => {
    const newTitle = editedTitles[lessonIndex];
    if (!newTitle) return;

    const lessons = parseContentIntoLessons(content);
    if (lessonIndex >= lessons.length) return;

    const oldTitle = lessons[lessonIndex].title;
    
    // Find and replace the old title with new title in content
    // Look for markdown headers (## or ###) or plain text titles
    const patterns = [
      new RegExp(`^(#{1,3}\\s*)${escapeRegExp(oldTitle)}`, 'gm'),
      new RegExp(`^${escapeRegExp(oldTitle)}$`, 'gm')
    ];

    let updatedContent = content;
    for (const pattern of patterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, (match) => {
          // Preserve markdown formatting if it exists
          const headerMatch = match.match(/^(#{1,3}\s*)/);
          return headerMatch ? headerMatch[1] + newTitle : newTitle;
        });
        break;
      }
    }

    setContent(updatedContent);
    
    // Clear the edited title since it's now part of the main content
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[lessonIndex];
      return newTitles;
    });
  };

  // Helper function to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleTitleCancel = (lessonIndex: number) => {
    setEditedTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[lessonIndex];
      return newTitles;
    });
    setEditingLessonId(null);
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
      const payload: any = {
        content,
        editPrompt,
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
    if (useExistingOutline === false && !prompt.trim()) return;

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
        let gotFirstChunk = false;

        try {
          const requestBody: any = {
            // Only send outlineId when the user actually selected one
            outlineId: selectedOutlineId || undefined,
            // If no lesson was picked, derive a temporary title from the prompt or fallback
            lesson: selectedLesson || (prompt ? prompt.slice(0, 80) : "Untitled One-Pager"),
            language,
            length,
            styles: selectedStyles.join(','),
            // Always forward the prompt (if any) so backend can generate content
            prompt: prompt || undefined,
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

          const res = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
          });

          if (!res.ok || !res.body) {
            throw new Error(`Failed to generate presentation: ${res.status}`);
          }

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
              setLoading(false); // Hide spinner & show textarea
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
          if (!abortController.signal.aborted) {
            // If the stream ended but we never displayed content, remove spinner anyway
            if (loading) setLoading(false);
            if (!gotFirstChunk && attempt >= 3) {
              setError("Failed to generate presentation – please try again later.");
            }
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

  // Click outside handler for styles dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.styles-dropdown')) {
        setShowStylesDropdown(false);
      }
    };

    if (showStylesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStylesDropdown]);

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
      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: content,
          outlineId: selectedOutlineId || undefined,
          lesson: selectedLesson,
          courseName: params?.get("courseName"),
          language: language,
          folderId: folderContext?.folderId || undefined,
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
        
        // Fallback: product may be created even if response failed (e.g., 504). Try to locate it and navigate.
        try {
          const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { cache: 'no-store' });
          if (res.ok) {
            const list = await res.json();
            // Try to find most recent matching Text Presentation by name
            const expectedName = params?.get("courseName") || 'Untitled';
            const candidate = list.find((p: any) => (p?.projectName === expectedName) && ((p?.design_microproduct_type || p?.product_type) === 'Text Presentation'))
              || list.find((p: any) => (p?.design_microproduct_type || p?.product_type) === 'Text Presentation');
            if (candidate?.id) {
              router.replace(`/projects/view/${candidate.id}`);
              return;
            }
          }
        } catch (fallbackErr) {
          console.warn('Finalize fallback navigation failed:', fallbackErr);
        }
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

  return (
    <>
    <main className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)" }}>
      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        <Link href="/create/generate" className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20">
                      <ArrowLeft size={14} /> {t('interface.generate.back', 'Back')}
        </Link>
        <h1 className="text-2xl font-semibold text-center text-black mt-2">{t('interface.generate.title', 'Generate')}</h1>
        <div className="flex flex-col items-center gap-4 mb-4">
          {/* Step 1: Choose source */}
          {useExistingOutline === null && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-medium text-gray-700">{t('interface.generate.presentationQuestion', 'Do you want to create a presentation from an existing Course Outline?')}</p>
              <div className="flex gap-3">
                <button onClick={() => setUseExistingOutline(true)} className="px-6 py-2 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium">{t('interface.generate.yesContentForPresentation', 'Yes, content for the presentation from the outline')}</button>
                <button onClick={() => setUseExistingOutline(false)} className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">{t('interface.generate.noStandalonePresentation', 'No, I want standalone presentation')}</button>
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
                    <select value={selectedOutlineId ?? ""} onChange={(e) => {
                      const val = e.target.value;
                      setSelectedOutlineId(val ? Number(val) : null);
                      setSelectedModuleIndex(null);
                      setLessonsForModule([]);
                      setSelectedLesson("");
                    }} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                      <option value="">{t('interface.generate.selectOutline', 'Select Outline')}</option>
                      {outlines.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                  {/* Module dropdown – appears once outline is selected */}
                  {selectedOutlineId && (
                    <div className="relative">
                      <select value={selectedModuleIndex ?? ""} onChange={(e) => {
                        const idx = e.target.value ? Number(e.target.value) : null;
                        setSelectedModuleIndex(idx);
                        setLessonsForModule(idx !== null ? modulesForOutline[idx].lessons : []);
                        setSelectedLesson("");
                      }} disabled={modulesForOutline.length === 0} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <option value="">{t('interface.generate.selectModule', 'Select Module')}</option>
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
                      <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                        <option value="">{t('interface.generate.selectLesson', 'Select Lesson')}</option>
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
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          <option value="en">{t('interface.generate.english', 'English')}</option>
                          <option value="uk">{t('interface.generate.ukrainian', 'Ukrainian')}</option>
                          <option value="es">{t('interface.generate.spanish', 'Spanish')}</option>
                          <option value="ru">{t('interface.generate.russian', 'Russian')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select value={length} onChange={(e) => setLength(e.target.value)} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                          {lengthOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                      <div className="relative styles-dropdown">
                        <button
                          type="button"
                          onClick={() => setShowStylesDropdown(!showStylesDropdown)}
                          className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black min-w-[200px]"
                        >
                          <span>{selectedStyles.length > 0 ? `${selectedStyles.length} ${t('interface.generate.stylesSelected', 'styles selected')}` : t('interface.generate.selectStyles', 'Select styles')}</span>
                          <ChevronDown size={14} className={`transition-transform ${showStylesDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showStylesDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {styleOptions.map((option) => (
                              <label key={option.value} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
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
                </>
              )}
              {/* Show standalone one-pager dropdowns if user chose standalone */}
              {useExistingOutline === false && (
                <>
                  <div className="relative">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                      <option value="en">English</option>
                      <option value="uk">Ukrainian</option>
                      <option value="es">Spanish</option>
                      <option value="ru">Russian</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={length} onChange={(e) => setLength(e.target.value)} className="appearance-none pr-8 px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black">
                      {lengthOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                  <div className="relative styles-dropdown">
                    <button
                      type="button"
                      onClick={() => setShowStylesDropdown(!showStylesDropdown)}
                      className="flex items-center justify-between w-full px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-black min-w-[200px]"
                    >
                      <span>{selectedStyles.length > 0 ? `${selectedStyles.length} styles selected` : 'Select styles'}</span>
                      <ChevronDown size={14} className={`transition-transform ${showStylesDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showStylesDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {styleOptions.map((option) => (
                          <label key={option.value} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
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
              {/* Reset button */}
              <button onClick={() => {
                setUseExistingOutline(null);
                setSelectedOutlineId(null);
                setSelectedModuleIndex(null);
                setLessonsForModule([]);
                setSelectedLesson("");
              }} className="px-4 py-2 rounded-full border border-gray-300 bg-white/90 text-sm text-gray-600 hover:bg-gray-100">← Back</button>
          </div>
          )}
        </div>
        {/* Prompt input for standalone presentation */}
        {useExistingOutline === false && (
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('interface.generate.presentationPromptPlaceholder', "Describe what presentation you'd like to create")} rows={1} className="w-full border border-gray-300 rounded-md p-3 resize-none overflow-hidden bg-white/90 placeholder-gray-500 min-h-[56px]" />
        )}
        {/* Content/preview section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#20355D]">{t('interface.generate.presentationContent', 'Presentation Content')}</h2>
          {loading && <LoadingAnimation message={t('interface.generate.generatingPresentationContent', 'Generating presentation content...')} />}
          className="text-[#20355D] text-base font-semibold cursor-pointer hover:text-[#0066FF] transition-colors"       {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}
          {textareaVisible && (
            <div className=" bg-white rounded-xl p-6 flex flex-col gap-6" style={{ animation: 'fadeInDown 0.25s ease-out both' }}>
                {loadingEdit && (
                  <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                    <LoadingAnimation message="Applying edit..." />
                  </div>
                )}
                {/* Display content in card format if lessons are available, otherwise show textarea */}
                {lessonList.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {lessonList.map((lesson, idx: number) => (
                    <div key={idx} className="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-center w-16 bg-[#0066FF] text-white text-lg font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="mb-2">
                          {editingLessonId === idx ? (
                            <input
                              type="text"
                              value={editedTitles[idx] || lesson.title}
                              onChange={(e) => handleTitleEdit(idx, e.target.value)}
                              className="w-full text-[#20355D] text-base font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1"
                              autoFocus
                              onBlur={() => handleTitleSave(idx)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave(idx);
                                if (e.key === 'Escape') handleTitleCancel(idx);
                              }}
                            />
                          ) : (
                            <h4 
                              className="text-[#20355D] text-base font-semibold cursor-pointer"
                              onClick={() => setEditingLessonId(idx)}
                            >
                              {getTitleForLesson(lesson, idx)}
                            </h4>
                          )}
                        </div>
                        {lesson.content && (
                          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
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
        {/* Advanced Mode */}
        {streamDone && content && (
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
                  {onePagerExamples.map((ex) => (
                  <button
                      key={ex.short}
                      type="button"
                      onClick={() => toggleExample(ex)}
                      className={`relative text-left border border-gray-200 rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-colors ${selectedExamples.includes(ex.short) ? 'bg-white shadow' : 'bg-[#D9ECFF] hover:bg-white'}`}
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
        {streamDone && content && (
          <section className="bg-white rounded-xl p-6 flex flex-col gap-5 shadow-sm" style={{ animation: 'fadeInDown 0.35s ease-out both' }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-[#20355D]">{t('interface.generate.themes', 'Themes')}</h2>
                <p className="mt-1 text-[#858587] font-medium text-sm">{t('interface.generate.themesDescription', 'Use one of our popular themes below or browse others')}</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-[#0540AB]"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-palette-icon lucide-palette w-4 h-4"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                <span>{t('interface.generate.viewMore', 'View more')}</span>
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
                      <option value="flux-fast">{t('interface.generate.fluxKontextFast', 'Flux Kontext Fast')}</option><option value="flux-quality">{t('interface.generate.fluxKontextHQ', 'Flux Kontext HQ')}</option><option value="stable">{t('interface.generate.stableDiffusion', 'Stable Diffusion 2.1')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>
          </div>
          </section>
        )}
        {/* Footer */}
        {streamDone && content && (
          <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>5 {t('interface.generate.credits', 'credits')}</span>
            </div>
            <div className="flex items-center gap-[7.5rem]">
              <span className="text-lg text-gray-700 font-medium select-none">
                {content.split(/^---\s*$/m).filter(slide => slide.trim()).length} {t('interface.generate.slides', 'slides')}
              </span>
              <button
                type="button"
                onClick={handleFinalize}
                className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
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