"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, ChevronDown, Settings, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ThemeSvgs } from "../../../components/theme/ThemeSvgs";
import { useLanguage } from "../../../contexts/LanguageContext";
import VideoLessonPreview from "../../../components/VideoLessonPreview";

// Base URL so frontend can reach custom backend through nginx proxy
const CUSTOM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

// Simple bouncing dots loading animation (optionally with a status line)
type LoadingProps = { message?: string };
const LoadingAnimation: React.FC<LoadingProps> = ({ message }) => {
  const { t } = useLanguage();
  return (
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
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message || t('interface.generate.loading', 'Generating...')}</p>
      )}
    </div>
  );
};

// Helper to retry fetch up to 2 times on 504 Gateway Timeout
async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add exponential backoff delay for retries
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 second delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Set a reasonable timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout per attempt
      
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Consider 5xx errors as retryable, but not 4xx errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort errors or client errors (4xx)
      if (error.name === 'AbortError' || (error.message && error.message.includes('4'))) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      console.warn(`Request attempt ${attempt + 1} failed:`, error.message);
    }
  }
  
  throw lastError!;
}

// Helper to map ranges back to option labels
const optionForRange = (range?: string): "Short" | "Medium" | "Long" => {
  switch (range) {
    case "400-500 words":
      return "Short";
    case "800+ words":
      return "Long";
    default:
      return "Medium";
  }
};

const lengthRangeForOption = (opt: string) => {
  switch (opt) {
    case "Short":
      return "100-200 words";
    case "Medium":
      return "300-400 words";
    case "Long":
      return "500+ words";
    default:
      return "300-400 words";
  }
};

// Function to calculate credits based on slide count (matching backend logic)
const calculateVideoLessonCredits = (slideCount: number): number => {
  // Video lessons might cost slightly more due to voiceover generation
  if (slideCount <= 5) return 4;
  if (slideCount <= 10) return 6;
  return 12;
};

export default function VideoLessonClient() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  
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

  // Parameters from URL
  const outlineId = params?.get("outlineId");
  const lesson = params?.get("lesson");
  const prompt = params?.get("prompt");
  const length = params?.get("length") || "300-400 words";
  const slidesCount = parseInt(params?.get("slidesCount") || "5");
  const lang = params?.get("lang") || "en";
  
  // State management
  const [currentStep, setCurrentStep] = useState<'setup' | 'generating' | 'preview' | 'complete'>('setup');
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedLength, setSelectedLength] = useState<"Short" | "Medium" | "Long">(optionForRange(length));
  const [selectedSlidesCount, setSelectedSlidesCount] = useState(slidesCount);
  const [selectedLanguage, setSelectedLanguage] = useState(lang);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Initialize title from params or outline context
  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson);
    } else if (prompt) {
      // Extract a title from the prompt (first few words)
      const words = prompt.split(' ').slice(0, 5).join(' ');
      setLessonTitle(words.length > 0 ? words : 'Video Lesson');
    } else {
      setLessonTitle('Video Lesson');
    }
  }, [lesson, prompt]);

  // Auto-start generation when component mounts (similar to lesson presentation)
  useEffect(() => {
    if (currentStep === 'setup') {
      setCurrentStep('generating');
      startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setStreamingMessage('');
    
    try {
      // Prepare the request payload
      const payload = {
        prompt: prompt || '',
        lessonTitle: lessonTitle,
        length: lengthRangeForOption(selectedLength),
        slidesCount: selectedSlidesCount,
        lang: selectedLanguage,
        outlineProjectId: outlineId ? parseInt(outlineId) : null,
        lessonFromOutline: lesson || null,
        fromFiles: isFromFiles,
        folderIds: isFromFiles ? folderIds : [],
        fileIds: isFromFiles ? fileIds : [],
        fromText: isFromText,
        textMode: isFromText ? textMode : null,
        userText: isFromText ? userText : null,
        folderId: folderContext?.folderId || null
      };

      console.log('Starting video lesson generation with payload:', payload);

      const response = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/video-lesson/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.type === 'progress') {
                  setStreamingMessage(data.message || '');
                } else if (data.type === 'content') {
                  accumulatedContent += data.content || '';
                  setGeneratedContent(accumulatedContent);
                } else if (data.type === 'complete') {
                  setChatSessionId(data.chatSessionId);
                  setCurrentStep('preview');
                  setIsGenerating(false);
                  return;
                } else if (data.type === 'error') {
                  throw new Error(data.message || 'Generation failed');
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming response line:', line);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error generating video lesson:', error);
      setGenerationError(error.message || 'Failed to generate video lesson');
      setIsGenerating(false);
      setCurrentStep('setup');
    }
  };

  const handleFinalize = async () => {
    if (!generatedContent || !chatSessionId) {
      setGenerationError('No content to finalize');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);

      const payload = {
        lessonTitle: lessonTitle,
        aiResponse: generatedContent,
        chatSessionId: chatSessionId,
        outlineProjectId: outlineId ? parseInt(outlineId) : null
      };

      const response = await fetchWithRetry(`${CUSTOM_BACKEND_URL}/video-lesson/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setProjectId(result.id);
      setCurrentStep('complete');
      
      // Redirect to the project view page
      setTimeout(() => {
        router.push(`/projects/view/${result.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error finalizing video lesson:', error);
      setGenerationError(error.message || 'Failed to finalize video lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setCurrentStep('generating');
    setGeneratedContent('');
    setChatSessionId(null);
    startGeneration();
  };

  // Render based on current step
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/create/generate"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              {t('interface.generate.back', 'Back')}
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">
              {t('interface.generate.videoLesson', 'Video Lesson')}
            </h1>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {currentStep === 'setup' && t('interface.generate.setup', 'Setup')}
            {currentStep === 'generating' && t('interface.generate.generating', 'Generating...')}
            {currentStep === 'preview' && t('interface.generate.preview', 'Preview')}
            {currentStep === 'complete' && t('interface.generate.complete', 'Complete')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {currentStep === 'setup' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('interface.generate.preparingVideoLesson', 'Preparing Your Video Lesson')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('interface.generate.videoLessonDescription', 'We\'ll create an engaging slide deck with voiceover narration for each slide.')}
            </p>
            <LoadingAnimation message={t('interface.generate.initializing', 'Initializing...')} />
          </div>
        )}

        {currentStep === 'generating' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('interface.generate.generatingVideoLesson', 'Generating Video Lesson')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('interface.generate.generatingContent', 'Creating slides and voiceover content...')}
            </p>
            <LoadingAnimation message={streamingMessage} />
            
            {generatedContent && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('interface.generate.preview', 'Preview')}
                </h3>
                <div className="text-left text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedContent}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'preview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {lessonTitle}
                </h2>
                <p className="text-gray-600">
                  {t('interface.generate.reviewVideoLesson', 'Review your video lesson before finalizing')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('interface.generate.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={isGenerating}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? t('interface.generate.saving', 'Saving...') : t('interface.generate.finalize', 'Finalize')}
                </button>
              </div>
            </div>

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <VideoLessonPreview 
                  markdown={generatedContent}
                  isEditable={false}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('interface.generate.videoLessonCreated', 'Video Lesson Created!')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('interface.generate.redirecting', 'Redirecting to your new video lesson...')}
            </p>
            <LoadingAnimation />
          </div>
        )}

        {generationError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t('interface.generate.error', 'Error')}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {generationError}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setGenerationError(null);
                      setCurrentStep('setup');
                    }}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    {t('interface.generate.tryAgain', 'Try Again')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 