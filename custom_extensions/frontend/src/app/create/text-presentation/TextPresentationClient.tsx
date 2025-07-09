"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle } from "lucide-react";

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

// Progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(progress, 100)}%` }}
    ></div>
  </div>
);

export default function TextPresentationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [textData, setTextData] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProductId, setFinalProductId] = useState<number | null>(null);

  // Get parameters from URL
  const prompt = searchParams?.get("prompt") || "";
  const language = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef(false);
  const requestIdRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const maxRetries = 3;

  // Memoize arrays to prevent unnecessary re-renders
  const memoizedFolderIds = useMemo(() => folderIds, [folderIds.join(',')]);
  const memoizedFileIds = useMemo(() => fileIds, [fileIds.join(',')]);

  useEffect(() => {
    // Don't start generation if there's no valid input
    const hasValidInput = prompt.trim() || fromFiles || fromText;
    if (!hasValidInput) {
      return;
    }

    // Helper function to perform the actual generation with retry logic
    const performGeneration = async (attempt: number = 1): Promise<void> => {
      try {
        // Get user text from sessionStorage if coming from text
        let userText = '';
        if (fromText) {
          try {
            const storedData = sessionStorage.getItem('pastedTextData');
            if (storedData) {
              const textData = JSON.parse(storedData);
              userText = textData.text || '';
            }
          } catch (error) {
            console.error('Error retrieving pasted text data:', error);
          }
        }

        const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            language: language,
            fromFiles: fromFiles,
            folderIds: memoizedFolderIds.join(','),
            fileIds: memoizedFileIds.join(','),
            fromText: fromText,
            textMode: textMode,
            userText: userText,
            aiResponse: "",
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
                if (pkt.type === "content") {
                  setTextData(prev => prev + pkt.text);
                }
              } catch (e) {
                // If not JSON, treat as plain text
                setTextData(prev => prev + buffer);
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
              const pkt = JSON.parse(line.replace(/^data: /, ''));
              gotFirstChunk = true;
              
              if (pkt.type === "content") {
                setTextData(prev => prev + pkt.text);
              } else if (pkt.type === "done") {
                setIsComplete(true);
                return;
              } else if (pkt.type === "error") {
                throw new Error(pkt.text || "Unknown error");
              }
            } catch (e) {
              // If not JSON, treat as plain text
              setTextData(prev => prev + line);
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
          
          // Exponential backoff: wait 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the generation
          return performGeneration(attempt + 1);
        } else {
          // Either not a network error or max retries reached
          console.error('Generation error:', error);
          setError(error.message || 'An error occurred during generation');
          throw error;
        }
      }
    };

    const generateContent = async () => {
      // Prevent multiple concurrent requests
      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;
      
      setIsGenerating(true);
      setError(null);
      setTextData("");
      setIsComplete(false);
      setRetryCount(0);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        await performGeneration();
      } catch (error: any) {
        // Error already handled in performGeneration
      } finally {
        // Only update state if this is still the current request
        setIsGenerating(false);
        requestInProgressRef.current = false;
        abortControllerRef.current = null;
      }
    };

    generateContent();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [prompt, language, fromFiles, fromText, memoizedFolderIds, memoizedFileIds, textMode, retryTrigger]);

  const handleCreateFinal = async () => {
    if (!textData.trim()) return;

    setIsCreatingFinal(true);
    try {
      // Get user text from sessionStorage if coming from text
      let userText = '';
      if (fromText) {
        try {
          const storedData = sessionStorage.getItem('pastedTextData');
          if (storedData) {
            const textData = JSON.parse(storedData);
            userText = textData.text || '';
          }
        } catch (error) {
          console.error('Error retrieving pasted text data:', error);
        }
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/text-presentation/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: textData,
          prompt: prompt,
          language: language,
          fromFiles: fromFiles,
          fromText: fromText,
          folderIds: memoizedFolderIds.join(','),
          fileIds: memoizedFileIds.join(','),
          textMode: textMode,
          userText: userText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFinalProductId(result.id);
      
      // Redirect to the created text presentation
      router.push(`/projects/view/${result.id}`);
    } catch (error: any) {
      console.error('Finalization error:', error);
      setError(error.message || 'An error occurred during finalization');
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

  // Get user text from sessionStorage for display
  const userText = fromText ? (() => {
    try {
      const storedData = sessionStorage.getItem('pastedTextData');
      if (storedData) {
        const textData = JSON.parse(storedData);
        return textData.text || '';
      }
    } catch (error) {
      console.error('Error retrieving pasted text data:', error);
    }
    return '';
  })() : '';

  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
      }}
    >
      <div className="w-full max-w-4xl flex flex-col gap-4 text-gray-900">
        {/* Back button */}
        <Link
          href="/create/generate"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 className="text-5xl font-semibold text-center tracking-wide text-gray-700 mt-8">
          Text Presentation Generation
        </h1>
        <p className="text-center text-gray-600 text-lg -mt-1">
          {prompt 
            ? `Creating text presentation: ${prompt}`
            : "Creating text presentation from your content"
          }
        </p>

        {/* Context indicators */}
        {fromFiles && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <CheckCircle className="h-5 w-5" />
              Creating from files
            </div>
            <div className="text-sm text-blue-700">
              {folderIds.length > 0 && (
                <p>{folderIds.length} folder{folderIds.length !== 1 ? 's' : ''} selected</p>
              )}
              {fileIds.length > 0 && (
                <p>{fileIds.length} file{fileIds.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>
          </div>
        )}

        {fromText && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <CheckCircle className="h-5 w-5" />
              Creating from text
            </div>
            <div className="text-sm text-green-700">
              <p className="font-medium">
                Mode: {textMode === 'context' ? 'Using as context' : 'Using as base structure'}
              </p>
              {userText && (
                <p className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded max-h-20 overflow-y-auto">
                  {userText.length > 200 ? `${userText.substring(0, 200)}...` : userText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Generation status */}
        {isGenerating && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-800 font-semibold mb-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              Generating Text Presentation...
            </div>
            <div className="text-sm text-blue-700 mb-4">
              <p>Creating structured text content based on your input. This may take a few moments.</p>
              {retryCount > 0 && (
                <p className="text-orange-600 font-medium mt-2">
                  Retry attempt {retryCount} of {maxRetries}...
                </p>
              )}
            </div>
            <ProgressBar progress={textData.length > 0 ? Math.min((textData.length / 1000) * 100, 90) : 10} />
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 text-sm font-medium transition-colors"
            >
              Cancel Generation
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-red-800 font-semibold mb-3">
              <XCircle className="h-5 w-5" />
              Error
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
              Retry Generation
            </button>
          </div>
        )}

        {/* Text data display */}
        {textData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Text Presentation Preview</h2>
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Generation Complete</span>
                </div>
              )}
            </div>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{textData}</pre>
            </div>
          </div>
        )}

        {/* Finalize button */}
        {isComplete && textData && (
          <div className="flex justify-center">
            <button
              onClick={handleCreateFinal}
              disabled={isCreatingFinal}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isCreatingFinal ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Create Text Presentation
                </>
              )}
            </button>
          </div>
        )}

        {/* Input summary */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Prompt:</strong> {prompt || "No prompt provided"}
            </div>
            <div>
              <strong>Language:</strong> {language.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 