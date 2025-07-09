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

        const requestBody = {
          prompt: prompt,
          language: language,
          fromFiles: fromFiles,
          folderIds: memoizedFolderIds.join(','),
          fileIds: memoizedFileIds.join(','),
          fromText: fromText,
          textMode: textMode,
          userText: userText,
        };

        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectName: prompt || "Text Presentation",
            componentName: "TextPresentationDisplay",
            designTemplateId: 1, // Default design template
            promptText: prompt,
            language: language,
            folderIds: fromFiles ? memoizedFolderIds.join(',') : undefined,
            fileIds: fromFiles ? memoizedFileIds.join(',') : undefined,
            fromFiles: fromFiles,
            fromText: fromText,
            textMode: textMode,
            userText: userText,
          }),
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.id) {
          setFinalProductId(result.id);
          setIsComplete(true);
          // Redirect to the preview page
          router.push(`/projects/view/${result.id}`);
        } else {
          throw new Error("Failed to create text presentation");
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

        if (isNetworkError && attempt <= maxRetries) {
          console.log(`Network error, retrying attempt ${attempt}/${maxRetries}`);
          setTimeout(() => {
            performGeneration(attempt + 1);
          }, 1000 * attempt); // Exponential backoff
          return;
        }

        setError(error.message || "An error occurred while generating the text presentation");
        setIsGenerating(false);
      }
    };

    // Check if generation should start
    if (!isGenerating && !isComplete && !error && !requestInProgressRef.current) {
      setIsGenerating(true);
      setError(null);
      requestInProgressRef.current = true;
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      performGeneration();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      requestInProgressRef.current = false;
    };
  }, [prompt, language, fromFiles, fromText, textMode, memoizedFolderIds, memoizedFileIds, retryTrigger]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    router.push('/create/generate');
  };

  const handleRetry = () => {
    setError(null);
    setIsGenerating(false);
    setIsComplete(false);
    setTextData("");
    requestInProgressRef.current = false;
    setRetryCount(prev => prev + 1);
    setRetryTrigger(prev => prev + 1);
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
          Text Presentation
        </h1>
        
        <p className="text-center text-gray-600 text-lg -mt-1">
          Creating your text presentation...
        </p>

        {/* Context indicator */}
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

        {/* Main content area */}
        <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px] flex flex-col">
          {error ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Generation Failed</h3>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Sparkles size={16} />
                  Try Again
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Retry attempt: {retryCount}/{maxRetries}
                </p>
              )}
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <LoadingAnimation message="Generating your text presentation..." />
              <div className="mt-6 w-full max-w-md">
                <ProgressBar progress={50} />
                <p className="text-sm text-gray-500 text-center">This may take a moment...</p>
              </div>
              <button
                onClick={handleCancel}
                className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : isComplete && finalProductId ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Text Presentation Created!</h3>
              <p className="text-gray-600 mb-6">Your text presentation has been successfully generated.</p>
              <button
                onClick={() => router.push(`/projects/view/${finalProductId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Text Presentation
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-gray-600">Waiting to start generation...</p>
            </div>
          )}
        </div>

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