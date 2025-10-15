"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

// Sparkle icon for example buttons
const SparkleIcon: React.FC<{ color?: string }> = ({ color = '#5D5D79' }) => (
  <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.4209 1.6875C3.68006 2.52398 3.99032 3.1072 4.44531 3.56152H4.44629C4.90081 4.01483 5.48355 4.32394 6.31934 4.58301C5.59903 4.80567 5.06709 5.0662 4.64258 5.4248L4.44531 5.60547C3.99066 6.05989 3.6816 6.64318 3.42188 7.47949C3.16282 6.64304 2.85308 6.06044 2.39746 5.60547C1.94251 5.15164 1.35858 4.84226 0.521484 4.58301C1.3585 4.32446 1.94203 4.01623 2.39746 3.56152C2.85218 3.10715 3.16115 2.52374 3.4209 1.6875ZM6.59082 0.828125C6.6624 0.948534 6.74563 1.05735 6.84375 1.15527C6.94083 1.25214 7.04891 1.33345 7.16797 1.4043C7.04821 1.47546 6.94029 1.55886 6.84277 1.65625C6.74517 1.75376 6.66209 1.86172 6.59082 1.98145C6.51947 1.86169 6.43752 1.75275 6.33984 1.65527C6.24227 1.55792 6.13344 1.47637 6.01367 1.40527C6.13368 1.33403 6.24314 1.25282 6.34082 1.15527C6.43853 1.05768 6.5195 0.947973 6.59082 0.828125Z" stroke={color} strokeWidth="0.612448"/>
  </svg>
);

// Send icon for send button
const SendIcon: React.FC = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_493_10723)">
      <path d="M7.33366 0.666992L3.66699 4.33366M7.33366 0.666992L5.00033 7.33366L3.66699 4.33366M7.33366 0.666992L0.666992 3.00033L3.66699 4.33366" stroke="#8808A2" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_493_10723">
        <rect width="8" height="8" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

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

interface AiAgentProps {
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

export const AiAgent: React.FC<AiAgentProps> = ({
  editPrompt,
  setEditPrompt,
  examples,
  selectedExamples,
  toggleExample,
  loadingEdit,
  onApplyEdit,
  advancedSectionRef,
  placeholder = "Ask me to edit, create, or style anything",
  buttonText = "Edit",
  disabled = false,
}) => {
  return (
    <div 
      ref={advancedSectionRef} 
      className="bg-white border border-[#E0E0E0] rounded-lg py-5 px-8 flex flex-col gap-6 mt-3" 
      style={{ animation: 'fadeInDown 0.25s ease-out both' }}
    >
      {/* Header section with badge */}
      <div className="flex flex-col gap-2">
        {/* AI Agent Badge */}
        <div className="inline-flex items-center gap-2 self-start">
          <span 
            className="px-3 py-1 rounded-md text-[16px] font-medium"
            style={{ color: '#8808A2', backgroundColor: '#F7E0FC' }}
          >
            Ai Agent
          </span>
        </div>
        
        {/* Info text */}
        <div className="flex flex-col" style={{ fontSize: '10px' }}>
          <span style={{ color: '#949CA8' }}>
            Agent uses credits to deliver advanced AI editing.
          </span>
          <a 
            href="#" 
            className="no-underline"
            style={{ color: '#498FFF' }}
          >
            Learn more
          </a>
        </div>
      </div>

      {/* Title */}
      <h3 
        className="text-center font-semibold"
        style={{ color: '#0D001B', fontSize: '18px' }}
      >
        Hey, what do you want to change?
      </h3>

      {/* Example prompts */}
      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((ex) => {
          const isSelected = selectedExamples.includes(ex.short);
          return (
            <button
              key={ex.short}
              type="button"
              onClick={() => toggleExample(ex)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                isSelected
                  ? 'hover:shadow-md'
                  : 'bg-white hover:shadow-md'
              }`}
              style={
                isSelected
                  ? { backgroundColor: '#F7E0FC', color: '#8808A2', borderColor: '#8808A2' }
                  : { color: '#5D5D79', borderColor: '#5D5D79' }
              }
            >
              <SparkleIcon color={isSelected ? '#8808A2' : '#5D5D79'} />
              <span>{ex.short}</span>
            </button>
          );
        })}
      </div>

      {/* Textarea with embedded Send button */}
      <div className="relative">
        <Textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 pb-14 rounded-lg bg-white text-sm text-black resize-none overflow-hidden min-h-[120px] border-[#E0E0E0] focus:border-[#8808A2] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-sm hover:shadow-lg cursor-pointer"
          style={{ background: "rgba(255,255,255,0.95)", color: '#000000', boxShadow: 'none', fontSize: '0.875rem' }}
        />
        
        {/* Send button positioned inside textarea */}
        <button
          type="button"
          disabled={disabled || loadingEdit || !editPrompt.trim()}
          onClick={onApplyEdit}
          className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-md bg-white border transition-all hover:shadow-md disabled:opacity-50"
          style={{ 
            borderColor: '#8808A2',
            color: '#8808A2'
          }}
        >
          {loadingEdit ? (
            <span className="text-xs">Sending...</span>
          ) : (
            <>
              <span className="text-sm font-medium">Send</span>
              <SendIcon />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

