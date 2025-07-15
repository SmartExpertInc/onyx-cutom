"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, RotateCcw } from "lucide-react";

interface SmartPromptEditorProps {
  projectId: number;
  onContentUpdate: (updatedContent: any) => void;
  onError: (error: string) => void;
  onRevert?: () => void;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const SmartPromptEditor: React.FC<SmartPromptEditorProps> = ({
  projectId,
  onContentUpdate,
  onError,
  onRevert,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
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
          language: "en", // Could be dynamic based on project language
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
          language: "en",
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
      <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900">Changes Preview</h3>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Your course outline has been updated with your requested changes! 
              <br />
              <strong>Review the updated content above</strong> and choose what you'd like to do:
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleConfirmChanges}
            disabled={loadingConfirm}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
          >
            {loadingConfirm ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>✅ Keep These Changes</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleRevertChanges}
            disabled={loadingConfirm}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
          >
            <RotateCcw size={20} />
            <span>↩️ Go Back to Original</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg border border-amber-300">
          <p className="text-sm text-amber-800 text-center leading-relaxed">
            💡 <strong>Tip:</strong> If you're not satisfied with these changes, click "Go Back to Original" and try a different prompt to get better results
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show/Hide Advanced button */}
      {!showAdvanced && (
        <div className="w-full mb-6 flex justify-center">
          <button
            onClick={() => setShowAdvanced(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-xl">✨</span>
            <span>Smart Edit This Course</span>
          </button>
        </div>
      )}

      {/* Advanced mode panel */}
      {showAdvanced && (
        <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 flex flex-col gap-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900">Smart Edit Mode</h3>
            </div>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-blue-400 hover:text-blue-600 text-lg font-bold p-1 rounded hover:bg-blue-100 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <p className="text-blue-800 mb-2">
            Describe how you'd like to improve your course outline. Be specific about what changes you want to make:
          </p>
          
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Examples:&#10;• Add more practical exercises&#10;• Make the content more beginner-friendly&#10;• Include real-world examples&#10;• Reorganize the modules for better flow"
            className="w-full border-2 border-blue-300 rounded-lg p-4 resize-none min-h-[100px] text-black focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white shadow-sm font-medium"
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
                className={`relative text-left border border-gray-200 rounded-md px-4 py-3 text-sm w-full cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black ${
                  selectedExamples.includes(ex.short)
                    ? 'bg-white shadow border-blue-300'
                    : 'bg-blue-50 hover:bg-white'
                }`}
              >
                {ex.short}
                <Plus size={14} className="absolute right-2 top-2 text-gray-600 opacity-60" />
              </button>
            ))}
          </div>

          {/* Apply button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleApplyEdit}
              disabled={!editPrompt.trim() || loadingEdit}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loadingEdit ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>🔄 Generating improvements...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  <span>Apply Smart Edit</span>
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