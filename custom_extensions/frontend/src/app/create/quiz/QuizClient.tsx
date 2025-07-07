"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFinal, setIsCreatingFinal] = useState(false);
  const [finalProductId, setFinalProductId] = useState<number | null>(null);

  // Get parameters from URL
  const prompt = searchParams?.get("prompt") || "";
  const outlineId = searchParams?.get("outlineId");
  const lesson = searchParams?.get("lesson");
  const questionTypes = searchParams?.get("questionTypes") || "";
  const language = searchParams?.get("lang") || "en";
  const fromFiles = searchParams?.get("fromFiles") === "true";
  const fromText = searchParams?.get("fromText") === "true";
  const folderIds = searchParams?.get("folderIds")?.split(",").filter(Boolean) || [];
  const fileIds = searchParams?.get("fileIds")?.split(",").filter(Boolean) || [];
  const textMode = searchParams?.get("textMode");

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const generateQuiz = async () => {
      setIsGenerating(true);
      setError(null);
      setQuizData("");
      setIsComplete(false);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const params = new URLSearchParams();
        
        if (outlineId && lesson) {
          params.set("outlineId", outlineId);
          params.set("lesson", lesson);
        } else if (prompt) {
          params.set("prompt", prompt);
        }
        
        params.set("questionTypes", questionTypes);
        params.set("lang", language);

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

        const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outlineId: outlineId ? parseInt(outlineId) : null,
            lesson: lesson,
            prompt: prompt,
            language: language,
            questionTypes: questionTypes,
            fromFiles: fromFiles,
            folderIds: folderIds.join(','),
            fileIds: fileIds.join(','),
            fromText: fromText,
            textMode: textMode,
            userText: fromText ? sessionStorage.getItem('userText') : undefined,
          }),
          signal: abortControllerRef.current.signal,
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
                  setQuizData(prev => prev + pkt.text);
                }
              } catch (e) {
                // If not JSON, treat as plain text
                setQuizData(prev => prev + buffer);
              }
            }
            setIsComplete(true);
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
                setQuizData(prev => prev + pkt.text);
              } else if (pkt.type === "done") {
                setIsComplete(true);
                return;
              } else if (pkt.type === "error") {
                throw new Error(pkt.text || "Unknown error");
              }
            } catch (e) {
              // If not JSON, treat as plain text
              setQuizData(prev => prev + line);
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Generation cancelled');
        } else {
          console.error('Generation error:', error);
          setError(error.message || 'An error occurred during generation');
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    };

    generateQuiz();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [prompt, outlineId, lesson, questionTypes, language, fromFiles, fromText, folderIds, fileIds, textMode]);

  const handleCreateFinal = async () => {
    if (!quizData.trim()) return;

    setIsCreatingFinal(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/quiz/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: quizData,
          prompt: prompt,
          outlineId: outlineId ? parseInt(outlineId) : null,
          lesson: lesson,
          questionTypes: questionTypes,
          language: language,
          fromFiles: fromFiles,
          fromText: fromText,
          folderIds: folderIds.join(','),
          fileIds: fileIds.join(','),
          textMode: textMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setFinalProductId(result.id);
      
      // Redirect to the created quiz
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
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #CBDAFB 35%, #AEE5FA 70%, #FFFFFF 100%)",
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
          Quiz Generation
        </h1>
        <p className="text-center text-gray-600 text-lg -mt-1">
          {outlineId && lesson 
            ? `Creating quiz for lesson: ${lesson}`
            : prompt 
            ? `Creating quiz: ${prompt}`
            : "Creating quiz from your content"
          }
        </p>

        {/* Generation status */}
        {isGenerating && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-800 font-semibold mb-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              Generating Quiz...
            </div>
            <div className="text-sm text-blue-700 mb-4">
              <p>Creating interactive quiz questions based on your content. This may take a few moments.</p>
            </div>
            <ProgressBar progress={quizData.length > 0 ? Math.min((quizData.length / 1000) * 100, 90) : 10} />
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
            <div className="text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Quiz data display */}
        {quizData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Quiz Preview</h2>
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Generation Complete</span>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-100">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {quizData}
              </pre>
            </div>

            {/* Themes section (not wired) */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Default', 'Professional', 'Creative', 'Minimal'].map((theme) => (
                  <button
                    key={theme}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 text-sm font-medium transition-colors"
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Finalize button */}
            {isComplete && !finalProductId && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleCreateFinal}
                  disabled={isCreatingFinal}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-white hover:bg-brand-primary-hover active:scale-95 transition-all duration-200 text-lg font-semibold shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0076FF' }}
                >
                  {isCreatingFinal ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Create Final Quiz
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 