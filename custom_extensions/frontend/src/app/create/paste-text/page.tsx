"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomCard } from "@/components/ui/custom-card";

export default function PasteTextPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"context" | "base" | null>(null);
  
  // Text size thresholds (matching backend)
  const TEXT_SIZE_THRESHOLD = 1500;
  const LARGE_TEXT_THRESHOLD = 3000;
  
  const getTextSizeWarning = () => {
    const length = text.length;
    if (length > LARGE_TEXT_THRESHOLD) {
      return {
        type: "warning",
        message: t('interface.pasteText.textVeryLarge', 'Text is very large and will be processed as a file. This may take a while.'),
        color: "text-orange-600"
      };
    } else if (length > TEXT_SIZE_THRESHOLD) {
      return {
        type: "info",
        message: t('interface.pasteText.textLarge', 'Text is large and will be compressed for optimal processing.'),
        color: "text-blue-600"
      };
    }
    return null;
  };
  
  const warning = getTextSizeWarning();

  const handleContinue = () => {
    if (!text.trim() || !mode) return;

    // Store text in sessionStorage to avoid URL length limits
    const textData = {
      text: text.trim(),
      mode: mode,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pastedTextData', JSON.stringify(textData));

    const params = new URLSearchParams();
    params.set('fromText', 'true');
    params.set('textMode', mode);
    
    // Check if we have lesson context to pass along
    try {
      const lessonContextData = sessionStorage.getItem('lessonContext');
      if (lessonContextData) {
        const lessonContext = JSON.parse(lessonContextData);
        // Check if data is recent (within 1 hour)
        if (lessonContext.timestamp && (Date.now() - lessonContext.timestamp < 3600000)) {
          Object.entries(lessonContext).forEach(([key, value]) => {
            if (key !== 'timestamp') {
              params.set(key, String(value));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling lesson context:', error);
    }
    
    router.push(`/create/generate?${params.toString()}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1100px',
          height: '2100px',
          left: '50%',
          top: '50%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, #90EDE5 10%, #5D72F4 70%, #D817FF 100%)',
          transform: 'translate(-50%, -50%) rotate(120deg)',
          filter: 'blur(100px)',
        }}
      />

      {/* back button absolute top-left */}
      <Link
        href="/create"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer z-10"
        style={{ 
          color: '#000000',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))'
        }}
      >
        <span>&lt;</span>
        <span>{t('interface.generate.back', 'Back')}</span>
      </Link>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">
        {/* Headings */}
        <div className="w-full flex flex-col gap-3 items-center">
          <h1 className="sora-font-semibold text-5xl text-center tracking-wide text-[#FFFFFF] mt-8">
            {t('interface.pasteText.title', 'Paste Your Text')}
          </h1>
          <p className="text-center text-[#FAFAFA] text-lg -mt-1">
            {t('interface.pasteText.subtitle', 'Enter or paste your text content below and choose how you\'d like to use it')}
          </p>
        </div>

        {/* Text input area */}
        <div className="w-full">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('interface.pasteText.textPlaceholder', 'Paste your text, notes, outline, or any content you\'d like to work with...')}
            className="w-full h-66 p-6" />

          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t('interface.pasteText.characters', '{count} characters').replace('{count}', text.length.toString())}
            </div>
            {warning && (
              <Alert className={`${warning.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'} ${warning.color}`}>
                <AlertDescription className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {warning.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Mode selection */}
        <div className="w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t('interface.pasteText.howToUseText', 'How would you like to use this text?')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomCard 
              Icon={FileText}
              title={t('interface.pasteText.useAsContext', 'Use as Context')}
              description={t('interface.pasteText.useAsContextDescription', 'The AI will use your text as reference material and context to create new educational content. Best for notes, research, or background information.')}
              selectable={true}
              isSelected={mode === "context"}
              onSelect={() => setMode("context")}
              iconColor="text-blue-600"
              labelColor="text-blue-600"
            />
            
            <CustomCard 
              Icon={Sparkles}
              title={t('interface.pasteText.useAsBase', 'Use as Base')}
              description={t('interface.pasteText.useAsBaseDescription', 'The AI will enhance and format your existing text structure, preserving your content while making it into a proper educational product. Best for drafts or existing outlines.')}
              selectable={true}
              isSelected={mode === "base"}
              onSelect={() => setMode("base")}
              iconColor="text-purple-600"
              labelColor="text-purple-600"
            />
          </div>
        </div>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={!text.trim() || !mode}
          size="lg"
          className="px-8 py-3 rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 text-lg font-semibold shadow-lg"
        >
          <Sparkles size={20} />
          {t('interface.pasteText.continueToGenerate', 'Continue to Generate')}
        </Button>
      </div>

      {/* Feedback button */}
      <button
        className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-l-lg cursor-pointer group"
        style={{
          width: '38px',
          height: '98px',
        }}
        onClick={() => {
          // Add your feedback handler here
          console.log('Feedback clicked');
        }}
      >
        <span
          className="font-medium opacity-50 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
          style={{
            fontSize: '14px',
            color: '#0F58F9',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
          }}
        >
          Feedback
        </span>
      </button>
    </main>
  );
} 