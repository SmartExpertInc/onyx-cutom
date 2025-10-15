"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Simple bouncing dots loading animation
type LoadingProps = { message?: string };
const LoadingAnimation: React.FC<LoadingProps> = ({ message }) => {
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
        <p className="text-sm text-gray-600 select-none min-h-[1.25rem]">{message}</p>
      )}
    </div>
  );
};

interface AdvancedEditSectionProps {
  editPrompt: string;
  setEditPrompt: (value: string) => void;
  examples: { short: string; detailed: string }[];
  selectedExamples: string[];
  toggleExample: (ex: { short: string; detailed: string }) => void;
  loadingEdit: boolean;
  onApplyEdit: () => void;
  advancedSectionRef?: any;
  placeholder?: string;
  buttonText?: string;
  disabled?: boolean;
}

export const AdvancedEditSection: React.FC<AdvancedEditSectionProps> = ({
  editPrompt,
  setEditPrompt,
  examples,
  selectedExamples,
  toggleExample,
  loadingEdit,
  onApplyEdit,
  advancedSectionRef,
  placeholder = "Describe what you'd like to improve...",
  buttonText = "Edit",
  disabled = false,
}) => {
  return (
    <div 
      ref={advancedSectionRef} 
      className="bg-white border border-[#E0E0E0] rounded-lg py-8 px-10 flex flex-col gap-3 mt-3" 
      style={{ animation: 'fadeInDown 0.25s ease-out both' }}
    >
      <Textarea
        value={editPrompt}
        onChange={(e) => setEditPrompt(e.target.value)}
        placeholder={placeholder}
        className="w-full px-7 py-5 rounded-lg bg-white text-lg text-black resize-none overflow-hidden min-h-[80px] border-[#E0E0E0] focus:border-blue-300 focus:outline-none focus:ring-0 transition-all duration-200 placeholder-gray-400 hover:shadow-lg cursor-pointer"
        style={{ background: "rgba(255,255,255,0.95)" }}
      />

      {/* Example prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        {examples.map((ex) => (
          <button
            key={ex.short}
            type="button"
            onClick={() => toggleExample(ex)}
            className={`relative text-left rounded-md px-4 py-3 text-sm w-full flex items-start cursor-pointer transition-all duration-200 text-black ${
              selectedExamples.includes(ex.short)
                ? 'bg-[#A8C5F0]'
                : 'bg-[#CCDBFC] hover:shadow-lg'
            }`}
          >
            <span className="pr-6">{ex.short}</span>
            <Plus size={14} className="absolute right-2 top-2" style={{ color: '#0F58F9' }} />
          </button>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          disabled={disabled || loadingEdit || !editPrompt.trim()}
          onClick={onApplyEdit}
          className="flex items-center gap-2 px-[25px] py-[14px] rounded-full bg-[#0F58F9] hover:bg-[#0D4AD1] text-[#FFFFFF] font-medium text-sm leading-[140%] tracking-[0.05em] select-none transition-shadow hover:shadow-lg disabled:opacity-50"
        >
          {loadingEdit ? <LoadingAnimation message="Applying..." /> : buttonText}
        </button>
      </div>
    </div>
  );
};

