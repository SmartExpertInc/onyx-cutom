"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../../contexts/LanguageContext";

// Sparkle icon for example buttons
const SparkleIcon: React.FC<{ color?: string }> = ({ color = '#5D5D79' }) => (
  <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.4209 1.6875C3.68006 2.52398 3.99032 3.1072 4.44531 3.56152H4.44629C4.90081 4.01483 5.48355 4.32394 6.31934 4.58301C5.59903 4.80567 5.06709 5.0662 4.64258 5.4248L4.44531 5.60547C3.99066 6.05989 3.6816 6.64318 3.42188 7.47949C3.16282 6.64304 2.85308 6.06044 2.39746 5.60547C1.94251 5.15164 1.35858 4.84226 0.521484 4.58301C1.3585 4.32446 1.94203 4.01623 2.39746 3.56152C2.85218 3.10715 3.16115 2.52374 3.4209 1.6875ZM6.59082 0.828125C6.6624 0.948534 6.74563 1.05735 6.84375 1.15527C6.94083 1.25214 7.04891 1.33345 7.16797 1.4043C7.04821 1.47546 6.94029 1.55886 6.84277 1.65625C6.74517 1.75376 6.66209 1.86172 6.59082 1.98145C6.51947 1.86169 6.43752 1.75275 6.33984 1.65527C6.24227 1.55792 6.13344 1.47637 6.01367 1.40527C6.13368 1.33403 6.24314 1.25282 6.34082 1.15527C6.43853 1.05768 6.5195 0.947973 6.59082 0.828125Z" stroke={color} strokeWidth="0.612448"/>
  </svg>
);

// Send icon for send button
const SendIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// Sparkles emoji component
const SparklesEmoji: React.FC = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.06963 6.9767C6.80309 7.07867 6.65813 7.22439 6.555 7.4905C6.45287 7.22439 6.30691 7.07966 6.04037 6.9767C6.30691 6.87473 6.45187 6.72999 6.555 6.4629C6.65713 6.72901 6.80309 6.87374 7.06963 6.9767ZM6.59223 2.81102C6.82319 1.95219 7.13881 1.63641 8 1.40551C7.13978 1.17493 6.8235 0.859803 6.59223 0C6.36127 0.858835 6.04564 1.17461 5.18446 1.40551C6.04467 1.6361 6.36096 1.95122 6.59223 2.81102ZM6.84361 4.58368C6.84361 4.50276 6.80144 4.40507 6.6835 4.37218C5.71853 4.10278 5.11396 3.79522 4.66255 3.34493C4.21118 2.89428 3.90248 2.29065 3.63365 1.32722C3.60071 1.20947 3.50285 1.16736 3.42181 1.16736C3.34076 1.16736 3.24291 1.20947 3.20996 1.32722C2.94013 2.29065 2.63208 2.89425 2.18106 3.34493C1.72903 3.79623 1.12509 4.10378 0.160117 4.37218C0.0421715 4.40507 0 4.50277 0 4.58368C0 4.6646 0.0421715 4.76229 0.160117 4.79519C1.12509 5.06458 1.72966 5.37214 2.18106 5.82244C2.63309 6.27374 2.94114 6.87672 3.20996 7.84014C3.24291 7.9579 3.34076 8 3.42181 8C3.50286 8 3.60071 7.9579 3.63365 7.84014C3.90348 6.87672 4.21154 6.27312 4.66255 5.82244C5.11458 5.37113 5.71853 5.06358 6.6835 4.79519C6.80144 4.76229 6.84361 4.6646 6.84361 4.58368Z" fill="#949CA8"/>
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

interface Message {
  text: string;
  sender: 'user' | 'ai';
  status?: 'updating' | 'updated';
}

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
  hasStartedChat?: boolean;
  setHasStartedChat?: (value: boolean) => void;
  lastUserMessage?: string;
  setLastUserMessage?: (value: string) => void;
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
  hasStartedChat: externalHasStartedChat,
  setHasStartedChat: externalSetHasStartedChat,
  lastUserMessage: externalLastUserMessage,
  setLastUserMessage: externalSetLastUserMessage,
}) => {
  const { t } = useLanguage();
  const [internalHasStartedChat, setInternalHasStartedChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: t('interface.aiAgent.question', 'Hey, what do you want to change?'), sender: 'ai' }
  ]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Use external state if provided, otherwise use internal state
  const hasStartedChat = externalHasStartedChat !== undefined ? externalHasStartedChat : internalHasStartedChat;
  const setHasStartedChat = externalSetHasStartedChat || setInternalHasStartedChat;

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send button click
  const handleSend = () => {
    if (!editPrompt.trim()) return;
    
    // Add user message to history
    setMessages(prev => [...prev, { text: editPrompt, sender: 'user' }]);
    setHasStartedChat(true);
    
    // Call the original onApplyEdit
    onApplyEdit();
    
    // Clear the textarea for next message
    setEditPrompt("");
  };

  // Update last message status when loading completes
  React.useEffect(() => {
    if (hasStartedChat && messages.length > 1) {
      const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
      if (lastUserMessage) {
        if (loadingEdit) {
          // Set status to updating
          setMessages(prev => {
            const updated = [...prev];
            const lastUserIndex = updated.map((m, i) => m.sender === 'user' ? i : -1).filter(i => i !== -1).pop();
            if (lastUserIndex !== undefined) {
              updated[lastUserIndex] = { ...updated[lastUserIndex], status: 'updating' };
            }
            return updated;
          });
        } else {
          // Set status to updated
          setMessages(prev => {
            const updated = [...prev];
            const lastUserIndex = updated.map((m, i) => m.sender === 'user' ? i : -1).filter(i => i !== -1).pop();
            if (lastUserIndex !== undefined) {
              updated[lastUserIndex] = { ...updated[lastUserIndex], status: 'updated' };
            }
            return updated;
          });
        }
      }
    }
  }, [hasStartedChat, loadingEdit, messages.length]);
  
  return (
    <div 
      ref={advancedSectionRef} 
      className="bg-white border border-[#E0E0E0] rounded-lg py-5 px-8 flex flex-col gap-4 mt-3" 
      style={{ animation: 'fadeInDown 0.25s ease-out both' }}
    >
      {/* Header section with badge */}
      <div className="flex flex-col gap-2 mb-[10px]">
        {/* AI Agent Badge */}
        <div className="inline-flex items-center gap-2 self-start">
          <span 
            className="px-3 py-1 rounded-md text-[16px] font-medium"
            style={{ color: '#8808A2', backgroundColor: '#F7E0FC' }}
          >
            {t('interface.aiAgent.title', 'Ai Agent')}
          </span>
        </div>
        
        {/* Info text */}
        <div className="flex flex-col" style={{ fontSize: '10px' }}>
          <span style={{ color: '#949CA8' }}>
            {t('interface.aiAgent.description', 'Agent uses credits to deliver advanced AI editing.')}
          </span>
          <a 
            href="#" 
            className="no-underline"
            style={{ color: '#498FFF' }}
          >
            {t('interface.aiAgent.learnMore', 'Learn more')}
          </a>
        </div>
      </div>

      {!hasStartedChat ? (
        <>
          {/* Title */}
          <h3 
            className="text-center font-semibold"
            style={{ color: '#0D001B', fontSize: '18px' }}
          >
            {t('interface.aiAgent.question', 'Hey, what do you want to change?')}
          </h3>

          {/* Example prompts */}
          <div className="flex flex-wrap justify-center gap-3 mb-[20px]">
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
          <div className="relative w-[80%] mx-auto mb-[20px]">
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full px-5 py-4 pb-14 rounded-xl bg-white text-sm text-black resize-none overflow-hidden min-h-[120px] border-[#E0E0E0] focus:border-[#8808A2] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-sm hover:shadow-lg cursor-pointer"
              style={{ background: "rgba(255,255,255,0.95)", color: '#000000', boxShadow: 'none', fontSize: '0.875rem' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8808A2';
                e.target.style.boxShadow = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            {/* Send button positioned inside textarea */}
            <button
              type="button"
              disabled={disabled || loadingEdit || !editPrompt.trim()}
              onClick={handleSend}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1 rounded-md bg-white border transition-all hover:shadow-md disabled:opacity-50"
              style={{ 
                borderColor: '#8808A2',
                color: '#8808A2'
              }}
            >
              {loadingEdit ? (
                <span className="text-xs">{t('interface.aiAgent.sending', 'Sending...')}</span>
              ) : (
                <>
                  <span className="text-sm font-medium">{t('interface.aiAgent.send', 'Send')}</span>
                  <SendIcon />
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Chat view - messenger style with scrolling */}
          <div className="flex flex-col gap-4 mt-4 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {/* Render all messages from history */}
            {messages.map((message, index) => (
              <div key={index}>
                {/* Message bubble */}
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className="px-4 py-3 max-w-[70%]"
                    style={message.sender === 'user' ? { 
                      backgroundColor: '#F7E0FC', 
                      color: '#0D001B',
                      borderRadius: '16px',
                      borderBottomRightRadius: '0'
                    } : { 
                      backgroundColor: '#FFFFFF', 
                      color: '#0D001B',
                      border: '1px solid #E0E0E0',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '0'
                    }}
                  >
                    <p className={`text-sm ${message.sender === 'ai' ? 'font-medium' : ''}`}>
                      {message.text}
                    </p>
                  </div>
                </div>

                {/* Status updates for user messages */}
                {message.sender === 'user' && message.status && (
                  <div className="flex flex-col gap-2 mt-2 mb-2">
                    {message.status === 'updating' && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#949CA8' }}>
                        <SparklesEmoji />
                        <span>{t('interface.aiAgent.updating', 'Updating')}</span>
                      </div>
                    )}
                    
                    {message.status === 'updated' && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#949CA8' }}>
                        <SparklesEmoji />
                        <span>{t('interface.aiAgent.updated', 'Updated')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Feedback section */}
          <div className="flex flex-col items-center gap-2 mt-4 mb-4">
            <p className="text-sm text-[#949CA8]">{t('interface.aiAgent.feedbackQuestion', 'Did this edit work for you?')}</p>
            <div className="flex gap-3">
              {/* Thumbs Down */}
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100 transition-colors group"
                aria-label="Thumbs down"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                  <g clipPath="url(#clip0_867_17790)">
                    <path d="M11.333 9.33301V1.33301M5.99962 12.0797L6.66629 9.33301H2.77962C2.57263 9.33301 2.36848 9.28481 2.18334 9.19224C1.9982 9.09967 1.83715 8.96527 1.71296 8.79967C1.58876 8.63408 1.50482 8.44184 1.4678 8.23819C1.43077 8.03453 1.44166 7.82505 1.49962 7.62634L3.05296 2.29301C3.13373 2.01605 3.30216 1.77277 3.53296 1.59967C3.76375 1.42658 4.04446 1.33301 4.33296 1.33301H13.333C13.6866 1.33301 14.0257 1.47348 14.2758 1.72353C14.5258 1.97358 14.6663 2.31272 14.6663 2.66634V7.99967C14.6663 8.3533 14.5258 8.69243 14.2758 8.94248C14.0257 9.19253 13.6866 9.33301 13.333 9.33301H11.493C11.2449 9.33314 11.0018 9.40247 10.791 9.53319C10.5802 9.66392 10.41 9.85087 10.2996 10.073L7.99962 14.6663C7.68524 14.6624 7.3758 14.5876 7.09442 14.4473C6.81304 14.307 6.567 14.1049 6.37469 13.8562C6.18237 13.6075 6.04874 13.3185 5.9838 13.0109C5.91885 12.7032 5.92426 12.3849 5.99962 12.0797Z" className="stroke-[#949CA8] group-hover:stroke-[#8808A2]" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_867_17790">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>

              {/* Thumbs Up */}
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100 transition-colors group"
                aria-label="Thumbs up"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
                  <g clipPath="url(#clip0_867_17792)">
                    <path d="M4.66634 6.66634V14.6663M9.99967 3.91967L9.33301 6.66634H13.2197C13.4267 6.66634 13.6308 6.71453 13.816 6.8071C14.0011 6.89967 14.1621 7.03408 14.2863 7.19967C14.4105 7.36527 14.4945 7.55751 14.5315 7.76116C14.5685 7.96481 14.5576 8.17429 14.4997 8.37301L12.9463 13.7063C12.8656 13.9833 12.6971 14.2266 12.4663 14.3997C12.2355 14.5728 11.9548 14.6663 11.6663 14.6663H2.66634C2.31272 14.6663 1.97358 14.5259 1.72353 14.2758C1.47348 14.0258 1.33301 13.6866 1.33301 13.333V7.99967C1.33301 7.64605 1.47348 7.30691 1.72353 7.05687C1.97358 6.80682 2.31272 6.66634 2.66634 6.66634H4.50634C4.7544 6.66621 4.9975 6.59688 5.20831 6.46615C5.41912 6.33543 5.58929 6.14848 5.69967 5.92634L7.99967 1.33301C8.31406 1.3369 8.6235 1.41179 8.90488 1.55207C9.18625 1.69236 9.43229 1.89441 9.62461 2.14314C9.81693 2.39187 9.95055 2.68085 10.0155 2.98848C10.0804 3.2961 10.075 3.61443 9.99967 3.91967Z" className="stroke-[#949CA8] group-hover:stroke-[#8808A2]" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_867_17792">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>

          {/* Textarea for next message - same as initial view */}
          <div className="relative w-[80%] mx-auto mb-[20px]">
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full px-5 py-4 pb-14 rounded-xl bg-white text-sm text-black resize-none overflow-hidden min-h-[120px] border-[#E0E0E0] focus:border-[#8808A2] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 placeholder:text-sm hover:shadow-lg cursor-pointer"
              style={{ background: "rgba(255,255,255,0.95)", color: '#000000', boxShadow: 'none', fontSize: '0.875rem' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8808A2';
                e.target.style.boxShadow = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            {/* Send button positioned inside textarea */}
            <button
              type="button"
              disabled={disabled || loadingEdit || !editPrompt.trim()}
              onClick={handleSend}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1 rounded-md bg-white border transition-all hover:shadow-md disabled:opacity-50"
              style={{ 
                borderColor: '#8808A2',
                color: '#8808A2'
              }}
            >
              {loadingEdit ? (
                <span className="text-xs">{t('interface.aiAgent.sending', 'Sending...')}</span>
              ) : (
                <>
                  <span className="text-sm font-medium">{t('interface.aiAgent.send', 'Send')}</span>
                  <SendIcon />
                </>
              )}
            </button>
          </div>
        </>
      )}
      
      {/* Custom scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

