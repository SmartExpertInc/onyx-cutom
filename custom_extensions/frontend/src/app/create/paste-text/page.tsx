"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home as HomeIcon, ChevronRight, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeadTextCustom } from "@/components/ui/head-text-custom";
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
      className="min-h-screen flex flex-col items-center pt-24 pb-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* back button absolute top-left */}
      <Button
        asChild
        variant="back"
        size="sm"
        className="rounded-full"
      >
        <Link href="/create">
          <ArrowLeft size={14} /> {t('interface.generate.back', 'Back')}
        </Link>
      </Button>

      {/* Main content */}
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">
        {/* Headings */}
        <HeadTextCustom 
          text={t('interface.pasteText.title', 'Paste Your Text')} 
          description={t('interface.pasteText.subtitle', 'Enter or paste your text content below and choose how you\'d like to use it')}
        />

        {/* Text input area */}
        <div className="w-full">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('interface.pasteText.textPlaceholder', 'Paste your text, notes, outline, or any content you\'d like to work with...')}
            className="w-full h-96 p-6" />

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
        <div className="w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t('interface.pasteText.howToUseText', 'How would you like to use this text?')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomCard 
              Icon={FileText}
              title={t('interface.pasteText.useAsContext', 'Use as Context')}
              description={t('interface.pasteText.useAsContextDescription', 'The AI will use your text as reference material and context to create new educational content. Best for notes, research, or background information.')}
              onClick={() => setMode("context")}
              className={`transition-all ${
                mode === "context"
                  ? "border-2 border-blue-500 shadow-lg ring-2 ring-blue-200"
                  : "border border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
              gradientFrom="from-blue-300"
              gradientTo="to-blue-200"
              iconColor="text-blue-600"
              labelColor="text-blue-600"
            />
            
            <CustomCard 
              Icon={Sparkles}
              title={t('interface.pasteText.useAsBase', 'Use as Base')}
              description={t('interface.pasteText.useAsBaseDescription', 'The AI will enhance and format your existing text structure, preserving your content while making it into a proper educational product. Best for drafts or existing outlines.')}
              onClick={() => setMode("base")}
              className={`transition-all ${
                mode === "base"
                  ? "border-2 border-purple-500 shadow-lg ring-2 ring-purple-200"
                  : "border border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
              gradientFrom="from-purple-300"
              gradientTo="to-purple-200"
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
    </main>
  );
} 