import React, { useState } from "react";
import { Sparkles, Settings, Plus } from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";

interface SmartPromptEditorProps {
  projectId: number;
  onContentUpdate: (updatedContent: any) => void;
  onError: (error: string) => void;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const SmartPromptEditor: React.FC<SmartPromptEditorProps> = ({
  projectId,
  onContentUpdate,
  onError,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);

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
              // Update content and close advanced mode
              onContentUpdate(packet.updatedContent);
              setEditPrompt("");
              setSelectedExamples([]);
              setShowAdvanced(false);
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

  return (
    <>
      {/* Advanced mode panel */}
      {showAdvanced && (
        <div className="w-full bg-white border border-gray-300 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Describe what you'd like to improve..."
            className="w-full border border-gray-300 rounded-md p-3 resize-none min-h-[80px] text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="flex justify-end">
            <button
              type="button"
              disabled={loadingEdit || !editPrompt.trim()}
              onClick={handleApplyEdit}
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-white"
            >
              {loadingEdit ? (
                <LoadingAnimation message="Applying..." />
              ) : (
                <>
                  <Sparkles size={14} className="text-white" />
                  <span className="text-sm font-medium text-white">Edit with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div className="w-full flex justify-center mb-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          disabled={loadingEdit}
          className="flex items-center gap-1 text-sm text-blue-600 hover:opacity-80 transition-opacity select-none disabled:opacity-50"
        >
          Smart Edit Mode
          <Settings 
            size={14} 
            className={`${showAdvanced ? 'rotate-180' : ''} transition-transform`} 
          />
        </button>
      </div>
    </>
  );
};

export default SmartPromptEditor; 