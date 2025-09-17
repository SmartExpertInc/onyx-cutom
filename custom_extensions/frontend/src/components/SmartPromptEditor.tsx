"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';

interface SmartPromptEditorProps {
  projectId: number;
  onContentUpdate: (updatedContent: any) => void;
  onError: (error: string) => void;
  onRevert?: () => void;
  currentLanguage?: string | null; // Current language of the training plan
  currentTheme?: string | null; // Current theme of the training plan
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const SmartPromptEditor: React.FC<SmartPromptEditorProps> = ({
  projectId,
  onContentUpdate,
  onError,
  onRevert,
  currentLanguage,
  currentTheme,
}) => {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(true); // Always start with advanced mode shown
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  
  // New state for confirmation flow
  const [originalContent, setOriginalContent] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const outlineExamples: { short: string; detailed: string }[] = [
    {
      short: "Make all lessons have assessment type 'test'",
      detailed: "Update all lessons in the training plan to have assessment type 'test' instead of their current assessment types.",
    },
    {
      short: "Add practical exercises to each module",
      detailed: "Add practical exercises or hands-on activities to each module in the training plan to enhance learning engagement.",
    },
    {
      short: "Restructure into shorter modules",
      detailed: "Reorganize the content into shorter, more digestible modules while maintaining the learning flow and objectives.",
    },
    {
      short: "Add case studies and real examples",
      detailed: "Include relevant case studies and real-world examples in each module to provide practical context for learners.",
    },
    {
      short: "Increase advanced content depth",
      detailed: "Enhance the training plan with more advanced-level content and deeper insights while maintaining accessibility.",
    },
    {
      short: "Add assessment quizzes",
      detailed: "Include assessment quizzes and knowledge checks throughout the training plan to reinforce learning.",
    },
  ];

  const toggleExample = (ex: typeof outlineExamples[number]) => {
    setSelectedExamples((prev) => {
      if (prev.includes(ex.short)) {
        // remove
        const updated = prev.filter((s) => s !== ex.short);
        // remove its detailed text line(s) from textarea
        setEditPrompt((p) => {
          return p
            .split("\n")
            .filter((line) => line.trim() !== ex.detailed)
            .join("\n")
            .replace(/^\n+|\n+$/g, "");
        });
        return updated;
      }
      // add
      setEditPrompt((p) => (p ? p + "\n" + ex.detailed : ex.detailed));
      return [...prev, ex.short];
    });
  };

  const handleApplyEdit = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed || loadingEdit) return;

    setLoadingEdit(true);
    try {
      // Store original content before making changes
      // We'll get this from the parent component's current state
      // For now, we'll handle this in the streaming response

      const response = await fetch(`${CUSTOM_BACKEND_URL}/training-plan/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          projectId: projectId,
          language: currentLanguage || "en", // Use current language or fallback to English
          theme: currentTheme || "cherry", // Use current theme or fallback to cherry
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const packet = JSON.parse(line);
            if (packet.type === "done" && packet.updatedContent) {
              if (packet.isPreview) {
                // This is a preview - show confirmation UI and immediately update the display
                setPreviewContent(packet.updatedContent);
                setShowConfirmation(true);
                setShowAdvanced(false);
                // Immediately show the preview content in the UI
                onContentUpdate(packet.updatedContent);
              } else {
                // This is the old immediate update flow (fallback)
                onContentUpdate(packet.updatedContent);
                setEditPrompt("");
                setSelectedExamples([]);
                setShowAdvanced(false);
              }
            } else if (packet.type === "error") {
              onError(packet.message || "Failed to apply edit");
            }
          } catch (e) {
            console.warn("Failed to parse packet:", line);
          }
        }
      }
    } catch (error: any) {
      onError(error.message || "Failed to apply edit");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleConfirmChanges = async () => {
    if (!previewContent) return;

    setLoadingConfirm(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/training-plan/confirm-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId,
          updatedContent: previewContent,
          language: currentLanguage || "en",
          theme: currentTheme || "cherry",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Apply the changes and clean up
        onContentUpdate(previewContent);
        setEditPrompt("");
        setSelectedExamples([]);
        setShowConfirmation(false);
        setPreviewContent(null);
        setOriginalContent(null);
      } else {
        onError("Failed to save changes");
      }
    } catch (error: any) {
      onError(error.message || "Failed to save changes");
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleRevertChanges = () => {
    // Revert to original content
    setShowConfirmation(false);
    setPreviewContent(null);
    setOriginalContent(null);
    setEditPrompt("");
    setSelectedExamples([]);
    // The original content is already showing in the UI, so no need to update
    onRevert?.();
  };

  if (showConfirmation) {
    return (
      <div className="w-full bg-white border border-gray-300 rounded-xl p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('actions.reviewChanges', 'Review Changes')}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            {t('actions.changesPreview', 'Changes Preview')}
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Please review the changes below. The updated content is now displayed in the table. 
          You can accept these changes to save them permanently, or revert to go back to the original content.
        </p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirmChanges}
            disabled={loadingConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingConfirm ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <CheckCircle size={16} />
            )}
            {loadingConfirm ? t('actions.saving', 'Saving...') : t('actions.acceptChanges', 'Accept Changes')}
          </button>
          
          <button
            onClick={handleRevertChanges}
            disabled={loadingConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            {t('actions.revertChanges', 'Revert Changes')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Advanced mode panel - always shown */}
      {showAdvanced && (
        <div className="w-full bg-white rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('actions.smartEdit', 'Smart Edit')}</h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ {t('actions.close', 'Close')}
            </button>
          </div>
          
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Describe what you'd like to improve..."
            className="w-full px-7 py-5 rounded-2xl bg-white text-sm text-black resize-none overflow-y-auto min-h-[80px] border border-gray-100 focus:border-blue-300 focus:outline-none focus:ring-0 transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.95)' }}
            disabled={loadingEdit}
          />

          {/* Example prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            {outlineExamples.map((ex) => (
              <button
                key={ex.short}
                type="button"
                onClick={() => toggleExample(ex)}
                disabled={loadingEdit}
                className={`relative text-left rounded-md px-4 py-4 text-sm w-full cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-black ${
                  selectedExamples.includes(ex.short)
                    ? 'bg-[#B8D4F0]'
                    : 'bg-[#D9ECFF] hover:shadow-lg'
                }`}
              >
                {ex.short}
                <Plus size={14} className="absolute right-2 top-2 text-gray-600 opacity-60" />
              </button>
            ))}
          </div>

          {/* Apply button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleApplyEdit}
              disabled={!editPrompt.trim() || loadingEdit}
              className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              {loadingEdit ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {t('actions.applyEdit', 'Apply Edit')} <Sparkles size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartPromptEditor; 