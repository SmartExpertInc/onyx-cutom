"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { FeedbackButton } from "@/components/ui/feedback-button";

export default function UploadFilesPage() {
  const { t } = useLanguage();

  return (
    <main
      className="min-h-screen flex flex-col items-center py-8 px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1100px',
          height: '2100px',
          left: '60%',
          top: '60%',
          borderRadius: '999px',
          background: 'linear-gradient(360deg, #90EDE5 10%, #5D72F4 70%, #D817FF 100%)',
          transform: 'translate(-50%, -50%) rotate(120deg)',
          filter: 'blur(100px)',
        }}
      />
      
      {/* Top-left back button */}
      <Link
        href="/create/from-files-new"
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
      <div className="w-full max-w-2xl flex flex-col gap-8 items-center relative z-10 mt-20">
        {/* Title */}
        <h1 className="sora-font-semibold text-5xl text-center tracking-wide text-[#FFFFFF]">
          {t('interface.fromFiles.importWithAI', 'Import with AI')}
        </h1>

        {/* Upload area */}
        <div 
          className="w-full bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 flex items-center justify-center min-h-[300px]"
        >
          <p className="text-gray-400 text-lg">
            {t('interface.fromFiles.addYourFiles', 'Add your files')}
          </p>
        </div>

        {/* Question text */}
        <p className="text-lg text-center" style={{ color: '#FAFAFA' }}>
          {t('interface.fromFiles.addMoreOrContinue', 'Would you like to add more files or continue?')}
        </p>

        {/* Add more files button */}
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-[#0F58F9] text-[#0F58F9] font-semibold hover:bg-blue-50 transition-colors duration-200"
        >
          <span className="text-xl">+</span>
          <span>{t('interface.fromFiles.addMoreFiles', 'Add more files')}</span>
        </button>
      </div>

      <FeedbackButton />
    </main>
  );
}

