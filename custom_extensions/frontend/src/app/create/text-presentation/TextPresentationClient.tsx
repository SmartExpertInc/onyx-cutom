"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Loading animation component
const LoadingAnimation: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    {message && (
      <p className="mt-4 text-gray-600 text-center max-w-md">{message}</p>
    )}
  </div>
);

export default function TextPresentationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get parameters from URL
  const prompt = searchParams?.get("prompt") || "";
  const outlineId = searchParams?.get("outlineId");
  const lesson = searchParams?.get("lesson");
  const courseName = searchParams?.get("courseName");
  const lang = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const textMode = searchParams?.get("textMode") as 'context' | 'base' | null;
  const folderIds = searchParams?.get("folderIds")?.split(',').filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(',').filter(Boolean) || [];

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProjectId, setFinalProjectId] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef(false);
  const requestIdRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Don't start generation if there's no valid input
    const hasValidInput = (outlineId && lesson) || prompt.trim() || fromFiles || fromText;
    if (!hasValidInput) {
      return;
    }

    // Helper function to perform the actual text presentation generation with retry logic
    const performTextPresentationGeneration = async (attempt: number = 1): Promise<void> => {
      
      try {
        const params = new URLSearchParams();
        
        if (outlineId && lesson) {
          params.set("outlineId", outlineId);
          params.set("lesson", lesson);
        } else if (prompt) {
          params.set("prompt", prompt);
        }
        
        params.set("lang", lang);

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

        const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outlineId: outlineId ? parseInt(outlineId) : null,
            lesson: lesson,
            courseName: courseName,
            prompt: prompt,
            language: lang,
            fromFiles: fromFiles,
            folderIds: folderIds.join(','),
            fileIds: fileIds.join(','),
            fromText: fromText,
            textMode: textMode,
            userText: fromText ? sessionStorage.getItem('userText') : undefined,
          }),
          signal: abortControllerRef.current?.signal,
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
                  setGeneratedContent(prev => prev + pkt.text);
                }
              } catch (e) {
                // If not JSON, treat as plain text
                setGeneratedContent(prev => prev + buffer);
              }
            }
            setIsComplete(true);
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
                setGeneratedContent(prev => prev + pkt.text);
              } else if (pkt.type === "done") {
                setIsComplete(true);
                return;
              } else if (pkt.type === "error") {
                throw new Error(pkt.text || "Unknown error");
              }
            } catch (e) {
              // If not JSON, treat as plain text
              setGeneratedContent(prev => prev + line);
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
          console.log(`Network error, retrying... (${attempt}/${maxRetries})`);
          setRetryCount(attempt);
          setTimeout(() => {
            setRetryTrigger(prev => prev + 1);
          }, 1500 * attempt);
          return;
        }
        
        console.error('Text presentation generation failed:', error);
        setError(error.message || 'Failed to generate text presentation');
        setIsGenerating(false);
      }
    };

    const generateTextPresentation = async () => {
      if (requestInProgressRef.current) return;
      
      requestInProgressRef.current = true;
      setIsGenerating(true);
      setError(null);
      setGeneratedContent("");
      setIsComplete(false);
      
      const currentRequestId = ++requestIdRef.current;
      
      try {
        await performTextPresentationGeneration();
        
        if (currentRequestId === requestIdRef.current) {
          setIsGenerating(false);
        }
      } catch (error) {
        if (currentRequestId === requestIdRef.current) {
          console.error('Text presentation generation error:', error);
          setError(error instanceof Error ? error.message : 'Failed to generate text presentation');
          setIsGenerating(false);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          requestInProgressRef.current = false;
        }
      }
    };

    generateTextPresentation();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [outlineId, lesson, prompt, lang, fromFiles, fromText, textMode, folderIds.join(','), fileIds.join(','), retryTrigger]);

  const handleCreateFinal = async () => {
    if (!generatedContent.trim()) {
      setError("No content to finalize");
      return;
    }

    setIsCreatingFinal(true);
    setError(null);

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: generatedContent,
          lesson: lesson,
          courseName: courseName,
          language: lang,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFinalProjectId(data.id);
      
      // Redirect to the generated project
      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error('Finalization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to finalize text presentation');
    } finally {
      setIsCreatingFinal(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    router.push('/create/generate');
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4 text-gray-900">
        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-5xl font-semibold text-center tracking-wide text-gray-700 mt-8">
          Text Presentation
        </h1>
        <p className="text-center text-gray-600 text-lg -mt-1">
          Generate a comprehensive text presentation
        </p>

        {/* Context indicator */}
        {(fromFiles || fromText || outlineId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <FileText className="h-5 w-5" />
              {outlineId ? "Creating from Course Outline" : fromFiles ? "Creating from Files" : "Creating from Text"}
            </div>
            <div className="text-sm text-blue-700">
              {outlineId && courseName && (
                <p><strong>Course:</strong> {courseName}</p>
              )}
              {outlineId && lesson && (
                <p><strong>Lesson:</strong> {lesson}</p>
              )}
              {fromFiles && (
                <>
                  {folderIds.length > 0 && (
                    <p>{folderIds.length} folder{folderIds.length !== 1 ? 's' : ''} selected</p>
                  )}
                  {fileIds.length > 0 && (
                    <p>{fileIds.length} file{fileIds.length !== 1 ? 's' : ''} selected</p>
                  )}
                </>
              )}
              {fromText && textMode && (
                <p><strong>Mode:</strong> {textMode === 'context' ? 'Using as context' : 'Using as base structure'}</p>
              )}
              {prompt && (
                <p><strong>Prompt:</strong> {prompt}</p>
              )}
            </div>
          </div>
        )}

        {/* Language selection */}
        <div className="flex justify-center">
          <div className="bg-white/90 rounded-lg p-4 border border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                const params = new URLSearchParams(searchParams?.toString() || "");
                params.set("lang", newLang);
                router.push(`/create/text-presentation?${params.toString()}`);
              }}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-black"
            >
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
              <option value="es">Spanish</option>
              <option value="ru">Russian</option>
            </select>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Generation status */}
        {isGenerating && (
          <div className="bg-white/90 rounded-lg p-6 border border-gray-300">
            <LoadingAnimation message="Generating your text presentation..." />
            {retryCount > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Retry attempt {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        )}

        {/* Generated content */}
        {generatedContent && (
          <div className="bg-white/90 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Generated Content</h2>
              {isComplete && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFinal}
                    disabled={isCreatingFinal}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingFinal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Create Text Presentation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {generatedContent}
              </pre>
            </div>
            
            {!isComplete && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Generating...
                </div>
              </div>
            )}
          </div>
        )}

        {/* No content state */}
        {!isGenerating && !generatedContent && !error && (
          <div className="bg-white/90 rounded-lg p-8 border border-gray-300 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {outlineId && lesson 
                ? `Generating text presentation for lesson: ${lesson}`
                : prompt 
                ? `Generating text presentation for: ${prompt}`
                : "Preparing to generate your text presentation..."
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 