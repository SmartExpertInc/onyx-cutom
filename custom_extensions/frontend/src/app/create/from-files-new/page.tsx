"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  Sparkles,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

// StepCard component for the new step-based interface
interface StepCardProps {
  Icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  isActive?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({
  Icon,
  title,
  description,
  href,
  disabled = false,
  isActive = false,
}) => {
  const { t } = useLanguage();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !href) return;
    
    e.preventDefault();
    router.push(href);
  };

  return (
    <div
      className={`relative flex items-center gap-6 p-8 rounded-2xl border-2 transition-all duration-300 ${
        disabled
          ? "bg-gray-50 border-gray-200 cursor-not-allowed"
          : isActive
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-lg hover:shadow-xl cursor-pointer group"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer group"
      }`}
      onClick={handleClick}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            disabled
              ? "bg-gray-100"
              : isActive
              ? "bg-gradient-to-br from-blue-100 to-indigo-100"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          }`}>
            <Icon size={24} className={
              disabled
                ? "text-gray-400"
                : isActive
                ? "text-blue-600"
                : "text-gray-600"
            } />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${
              disabled
                ? "text-gray-400"
                : isActive
                ? "text-gray-900"
                : "text-gray-900"
            }`}>
              {title}
            </h3>
            <p className={`text-sm mt-1 ${
              disabled
                ? "text-gray-400"
                : "text-gray-600"
            }`}>
              {description}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        {disabled && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-gray-100 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">{t('interface.comingSoon', 'Coming Soon')}</span>
          </div>
        )}


      </div>

      {/* Arrow for active state */}
      {isActive && !disabled && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Click indicator for active state */}
      {isActive && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      )}
    </div>
  );
};

export default function CreateFromFilesNewPage() {
  const { t } = useLanguage();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-white relative overflow-hidden"
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
      <div className="w-full max-w-4xl flex flex-col gap-12 items-center relative z-10">
        {/* Headings */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('interface.fromFiles.createFromFiles', 'Create from Files')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            {t('interface.fromFiles.chooseMethod', 'Choose your preferred method to create content from your files')}
          </p>
        </div>

        {/* Step-based interface */}
        <div className="w-full space-y-6">
          <StepCard
            Icon={Search}
            title={t('interface.fromFiles.createFromKnowledgeBase', 'Create from Knowledge Base')}
            description={t('interface.fromFiles.knowledgeBaseDescription', 'Generate content by searching your entire Knowledge Base for relevant information. Perfect for comprehensive content creation.')}
            href="/create/generate?fromKnowledgeBase=true"
            isActive={true}
          />
          
          <StepCard
            Icon={FileText}
            title={t('interface.fromFiles.createFromSpecificFiles', 'Create from Specific Files')}
            description={t('interface.fromFiles.specificFilesDescription', 'Select specific files and folders to use as source material. Ideal for targeted content creation.')}
            href="/create/from-files/specific"
            isActive={true}
          />
        </div>

        {/* Additional Info */}
        <div className="w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            {t('interface.fromFiles.whyChooseMethods', 'Why choose these methods?')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('interface.fromFiles.knowledgeBaseSearch', 'Knowledge Base Search')}</h4>
              <p className="text-gray-600 text-sm">
                {t('interface.fromFiles.knowledgeBaseSearchDesc', 'Leverage your entire document collection to find the most relevant information for your content creation needs.')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('interface.fromFiles.specificFileSelection', 'Specific File Selection')}</h4>
              <p className="text-gray-600 text-sm">
                {t('interface.fromFiles.specificFileSelectionDesc', 'Choose exactly which files to include, giving you precise control over your source material.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


