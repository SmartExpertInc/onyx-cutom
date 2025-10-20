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
import { EmptySmartDrive } from "@/components/EmptySmartDrive";
import { EmptyConnectors } from "@/components/EmptyConnectors";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartDriveModalOpen, setIsSmartDriveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'smartdrive' | 'connectors'>('smartdrive');
  const [urls, setUrls] = useState(['']);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleImport = () => {
    // Filter out empty URLs
    const validUrls = urls.filter(url => url.trim() !== '');
    console.log('Importing URLs:', validUrls);
    // TODO: Add your import logic here
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setUrls(['']); // Reset URLs
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
              'Powerpoint PPTX',
              'Word docs',
              'PDFs'
            ]}
            href="/create/from-files-new/upload"
          />

          <ImportCard
            icon={<KnowledgeBaseIcon />}
            title={t('interface.fromFiles.importFromSmartDrive', 'Import from SmartDrive')}
            features={[
              'Any file from your drive',
            ]}
            onClick={() => setIsSmartDriveModalOpen(true)}
          />

          <ImportCard
            icon={<ImportURLIcon />}
            title={t('interface.fromFiles.importFromURL', 'Import from URL')}
            features={[
              'Webpages',
              'Blog post & articles',
              'Notion docs'
            ]}
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Old step-based interface - smaller cards */}
        <div className="w-full space-y-4 mt-8">
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
      </div>

      {/* Import from URL Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(14.699999809265137px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          onClick={handleCancel}
        >
          <div 
            className="rounded-xl p-6 w-full max-w-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
              boxShadow: '4px 4px 8px 0px #0000000D',
              border: '1px solid #E0E0E0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-[#09090B] mb-1">
              Import from URL
            </h2>

            {/* Description */}
            <p className="text-sm text-[#71717A] mb-6">
              This will extract the text from the webpage you enter.
            </p>

            {/* URL inputs */}
            <div className="space-y-3 mb-6">
              {urls.map((url, index) => (
                <div key={index}>
                  <label className="block text-md font-semibolld text-[#09090B] mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com/"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-[#5D5D7980] text-[#09090B]"
                    style={{
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Add another URL button */}
            <button
              onClick={handleAddUrl}
              className="text-xs text-[#498FFF] mb-6 flex items-center gap-2 tracking-tight"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.99961 2.09961C7.38621 2.09961 7.69961 2.41301 7.69961 2.79961V6.29961H11.1996C11.5862 6.29961 11.8996 6.61301 11.8996 6.99961C11.8996 7.38621 11.5862 7.69961 11.1996 7.69961H7.69961V11.1996C7.69961 11.5862 7.38621 11.8996 6.99961 11.8996C6.61301 11.8996 6.29961 11.5862 6.29961 11.1996V7.69961H2.79961C2.41301 7.69961 2.09961 7.38621 2.09961 6.99961C2.09961 6.61301 2.41301 6.29961 2.79961 6.29961L6.29961 6.29961V2.79961C6.29961 2.41301 6.61301 2.09961 6.99961 2.09961Z" fill="#498FFF"/>
              </svg>
              Add another URL
            </button>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  color: '#0F58F9',
                  backgroundColor: 'white',
                  border: '1px solid #0F58F9',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{
                  backgroundColor: '#0F58F9',
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import from SmartDrive Modal */}
      {isSmartDriveModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(14.699999809265137px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          onClick={() => setIsSmartDriveModalOpen(false)}
        >
          <div 
            className="rounded-lg p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
              boxShadow: '4px 4px 8px 0px #0000000D',
              border: '1px solid #E0E0E0',
              width: '95vw',
              height: '95vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a file
            </h2>

            {/* Tab buttons */}
            <div className="flex mb-6">
              <button 
                onClick={() => setActiveTab('smartdrive')}
                className="flex items-center gap-2 px-4 py-2 relative"
                style={{
                  borderBottom: activeTab === 'smartdrive' ? '3px solid #719AF5' : '3px solid #71717ACC',
                }}
              >
                <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.3333 5.99935H1M14.3333 5.99935V9.99935C14.3333 10.353 14.1929 10.6921 13.9428 10.9422C13.6928 11.1922 13.3536 11.3327 13 11.3327H2.33333C1.97971 11.3327 1.64057 11.1922 1.39052 10.9422C1.14048 10.6921 1 10.353 1 9.99935V5.99935M14.3333 5.99935L12.0333 1.40602C11.9229 1.18387 11.7528 0.99693 11.542 0.866202C11.3312 0.735474 11.0881 0.666147 10.84 0.666016H4.49333C4.24528 0.666147 4.00218 0.735474 3.79136 0.866202C3.58055 0.99693 3.41038 1.18387 3.3 1.40602L1 5.99935M3.66667 8.66602H3.67333M6.33333 8.66602H6.34" 
                    stroke={activeTab === 'smartdrive' ? '#719AF5' : '#71717ACC'} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span 
                  className="text-sm"
                  style={{ color: activeTab === 'smartdrive' ? '#719AF5' : '#71717ACC' }}
                >
                  Smart Drive
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('connectors')}
                className="flex items-center gap-2 px-4 py-2 relative"
                style={{
                  borderBottom: activeTab === 'connectors' ? '3px solid #719AF5' : '3px solid #71717ACC',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.66667 6.33333V9C3.66667 9.35362 3.80714 9.69276 4.05719 9.94281C4.30724 10.1929 4.64638 10.3333 5 10.3333H7.66667M2.33333 1H5C5.73638 1 6.33333 1.59695 6.33333 2.33333V5C6.33333 5.73638 5.73638 6.33333 5 6.33333H2.33333C1.59695 6.33333 1 5.73638 1 5V2.33333C1 1.59695 1.59695 1 2.33333 1ZM9 7.66667H11.6667C12.403 7.66667 13 8.26362 13 9V11.6667C13 12.403 12.403 13 11.6667 13H9C8.26362 13 7.66667 12.403 7.66667 11.6667V9C7.66667 8.26362 8.26362 7.66667 9 7.66667Z" 
                    stroke={activeTab === 'connectors' ? '#719AF5' : '#71717ACC'} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span 
                  className="text-sm"
                  style={{ color: activeTab === 'connectors' ? '#719AF5' : '#71717ACC' }}
                >
                  Connectors
                </span>
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'smartdrive' ? <EmptySmartDrive /> : <EmptyConnectors />}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsSmartDriveModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  color: '#0F58F9',
                  backgroundColor: 'white',
                  border: '1px solid #0F58F9',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Add import logic here
                  console.log('Importing from Smart Drive');
                  setIsSmartDriveModalOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{
                  backgroundColor: '#0F58F9',
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-[60]">
        <FeedbackButton />
      </div>
    </main>
  );
}


