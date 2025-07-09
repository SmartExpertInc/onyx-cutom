"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, Settings, Plus } from "lucide-react";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Loading animation component - matching lesson presentation style
const LoadingAnimation: React.FC<{ message?: string }> = ({ message }) => (
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
      <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message}</p>
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
      
      abortControllerRef.current = new AbortController();
      
      try {
        await performTextPresentationGeneration();
      } finally {
        requestInProgressRef.current = false;
        setIsGenerating(false);
      }
    };

    generateTextPresentation();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [prompt, outlineId, lesson, lang, fromFiles, fromText, folderIds, fileIds, textMode, courseName, retryTrigger]);

  const handleCreateFinal = async () => {
    if (!generatedContent.trim()) return;

    setIsCreatingFinal(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: generatedContent,
          prompt: prompt,
          outlineId: outlineId ? parseInt(outlineId) : null,
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
      router.push(`/projects/view/${data.id}`);
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
    <>
    <main
      className="min-h-screen py-4 pb-24 px-4 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6 text-gray-900 relative">
        <Link
          href="/create/generate"
          className="fixed top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white z-20"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-2xl font-semibold text-center text-black mt-2">Generate</h1>

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

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#20355D]">Text Presentation Content</h2>
          {isGenerating && <LoadingAnimation message="Generating text presentation content..." />}
          {error && <p className="text-red-600 bg-white/50 rounded-md p-4 text-center">{error}</p>}
          
          {/* Main content display - matching lesson presentation style */}
          {generatedContent && (
            <div
              className="bg-white rounded-xl p-6 flex flex-col gap-6 relative"
              style={{ animation: 'fadeInDown 0.25s ease-out both' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Generated Content</h2>
                {isComplete && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Generation Complete</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-100">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
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
        </section>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
                setRetryTrigger(prev => prev + 1);
              }}
              className="mt-2 px-4 py-2 rounded-full border border-red-300 bg-white text-red-700 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              Retry Generation
            </button>
          </div>
        )}

        {isComplete && generatedContent && (
          <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-300 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-[#20355D] select-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.5C14 11.8807 11.7614 13 9 13C6.23858 13 4 11.8807 4 10.5M14 10.5C14 9.11929 11.7614 8 9 8C6.23858 8 4 9.11929 4 10.5M14 10.5V14.5M4 10.5V14.5M20 5.5C20 4.11929 17.7614 3 15 3C13.0209 3 11.3104 3.57493 10.5 4.40897M20 5.5C20 6.42535 18.9945 7.23328 17.5 7.66554M20 5.5V14C20 14.7403 18.9945 15.3866 17.5 15.7324M20 10C20 10.7567 18.9495 11.4152 17.3999 11.755M14 14.5C14 15.8807 11.7614 17 9 17C6.23858 17 4 15.8807 4 14.5M14 14.5V18.5C14 19.8807 11.7614 21 9 21C6.23858 21 4 19.8807 4 18.5V14.5" stroke="#20355D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>10 credits</span>
            </div>
            <div className="flex items-center gap-[7.5rem]">
              <span className="text-lg text-gray-700 font-medium select-none">
                {generatedContent.split(/\s+/).length} words
              </span>
              <button
                type="button"
                onClick={handleCreateFinal}
                className="px-24 py-3 rounded-full bg-[#0540AB] text-white text-lg font-semibold hover:bg-[#043a99] active:scale-95 shadow-lg transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isCreatingFinal}
              >
                <Sparkles size={18} />
                <span className="select-none font-semibold">Generate</span>
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
        <LoadingAnimation message="Finalizing text presentation..." />
      </div>
    )}
    </>
  );
} 