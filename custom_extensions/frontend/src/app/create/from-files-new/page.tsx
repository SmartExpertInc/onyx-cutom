"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ImportCard, UploadFileIcon, KnowledgeBaseIcon, ImportURLIcon } from "@/components/ui/import-card";
import { FeedbackButton } from "@/components/ui/feedback-button";
import { ImportFromUrlModal } from "@/components/ImportFromUrlModal";
import { ImportFromSmartDriveModal } from "@/components/ImportFromSmartDriveModal";

// StepCard component for the old step-based interface
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
      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
        disabled
          ? "bg-gray-50 border-gray-200 cursor-not-allowed"
          : isActive
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md hover:shadow-lg cursor-pointer group"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer group"
      }`}
      onClick={handleClick}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            disabled
              ? "bg-gray-100"
              : isActive
              ? "bg-gradient-to-br from-blue-100 to-indigo-100"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          }`}>
            <Icon size={18} className={
              disabled
                ? "text-gray-400"
                : isActive
                ? "text-blue-600"
                : "text-gray-600"
            } />
          </div>
          <div className="flex-1">
            <h3 className={`text-base font-semibold ${
              disabled
                ? "text-gray-400"
                : isActive
                ? "text-gray-900"
                : "text-gray-900"
            }`}>
              {title}
            </h3>
            <p className={`text-xs mt-0.5 ${
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
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded-lg">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">{t('interface.comingSoon', 'Coming Soon')}</span>
          </div>
        )}
      </div>

      {/* Arrow for active state */}
      {isActive && !disabled && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Click indicator for active state */}
      {isActive && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      )}
    </div>
  );
};

export default function FromFilesNew() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartDriveModalOpen, setIsSmartDriveModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUrlImport = (urls: string[]) => {
    console.log('Importing URLs:', urls);
    // TODO: Add your import logic here
  };

  const handleSmartDriveImport = () => {
    // TODO: Add import logic here
    console.log('Importing from Smart Drive');
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Convert FileList to array and store in localStorage
    const filesArray = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }));

    // Store file metadata in localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(filesArray));

    // Store actual files in a temporary location (we'll use a global variable)
    if (typeof window !== 'undefined') {
      (window as any).pendingUploadFiles = Array.from(files);
    }

    // Navigate to upload page
    router.push('/create/from-files-new/upload');
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

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
        href="/create"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200 border border-white/60 shadow-md hover:shadow-xl active:shadow-xl transition-shadow cursor-pointer z-20"
        style={{ 
          color: '#000000',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))'
        }}
      >
        <span>&lt;</span>
        <span>{t('interface.generate.back', 'Back')}</span>
      </Link>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
      />

      {/* Main content */}
      <div className="w-full flex flex-col gap-5 items-center relative z-10">
        {/* Headings */}
        <div className="text-center">
          <h1 className="sora-font-semibold text-7xl text-center tracking-wide text-[#FFFFFF] mb-4 mt-8">
            {t('interface.fromFiles.importWithAI', 'Import with AI')}
          </h1>
          <p className="text-xl sm:text-xl text-[#FAFAFA] max-w-2xl">
            {t('interface.fromFiles.selectFile', 'Select the file you\'d like to transform')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ImportCard
            icon={<UploadFileIcon />}
            title={t('interface.fromFiles.uploadFile', 'Upload a file')}
            features={[
              t('interface.fromFiles.powerpointPPTX', 'Powerpoint PPTX'),
              t('interface.fromFiles.wordDocs', 'Word docs'),
              t('interface.fromFiles.pdfs', 'PDFs')
            ]}
            onClick={handleUploadFileClick}
          />

          <ImportCard
            icon={<KnowledgeBaseIcon />}
            title={t('interface.fromFiles.importFromKnowledgeBase', 'Import from Knowledge base')}
            features={[
              t('interface.fromFiles.anyFileFromSmartdrive', 'Any file from smartdrive'),
              t('interface.fromFiles.allFilesFromConnectors', 'All files from connectors')
            ]}
            onClick={() => setIsSmartDriveModalOpen(true)}
          />

          <ImportCard
            icon={<ImportURLIcon />}
            title={t('interface.fromFiles.importFromURL', 'Import from URL')}
            features={[
              t('interface.fromFiles.webpages', 'Webpages'),
              t('interface.fromFiles.blogPostsArticles', 'Blog post & articles'),
              t('interface.fromFiles.notionDocs', 'Notion docs')
            ]}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Import from URL Modal */}
      <ImportFromUrlModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleUrlImport}
      />

      {/* Import from SmartDrive Modal */}
      <ImportFromSmartDriveModal
        isOpen={isSmartDriveModalOpen}
        onClose={() => setIsSmartDriveModalOpen(false)}
        onImport={handleSmartDriveImport}
      />

      <div className="relative z-[60]">
        <FeedbackButton />
      </div>
    </main>
  );
}


