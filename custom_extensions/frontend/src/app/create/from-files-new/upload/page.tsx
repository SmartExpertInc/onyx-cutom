"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { FeedbackButton } from "@/components/ui/feedback-button";

interface UploadedFile {
  id: string;
  name: string;
  extension: string;
  file: File;
}

// Delete icon component
const DeleteIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="ml-2 hover:opacity-70 transition-opacity">
    <svg width="31" height="18" viewBox="0 0 31 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.8" d="M8.5 4.2H22.5M20.9444 4.2V15.4C20.9444 16.2 20.1667 17 19.3889 17H11.6111C10.8333 17 10.0556 16.2 10.0556 15.4V4.2M12.3889 4.2V2.6C12.3889 1.8 13.1667 1 13.9444 1H17.0556C17.8333 1 18.6111 1.8 18.6111 2.6V4.2M13.9444 8.2V13M17.0556 8.2V13" stroke="#EF4444" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default function UploadFilesPage() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const nameParts = file.name.split('.');
      const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
      const name = nameParts.join('.');
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        extension,
        file,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAddMoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUploadAreaClick = () => {
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
      <div className="w-full max-w-2xl flex flex-col gap-6 items-center relative z-10 mt-20">
        {/* Title */}
        <p className="text-2xl text-center text-[#FAFAFA]">
          {t('interface.fromFiles.importWithAI', 'Import with AI')}
        </p>

        {/* Upload area */}
        <div 
          className={`w-full mb-4 bg-white rounded-sm shadow-lg border-[#E0E0E0] flex flex-col min-h-[45px] cursor-pointer transition-colors ${
            isDragging ? 'border-[#0F58F9] bg-blue-50' : 'border-gray-300'
          } ${uploadedFiles.length === 0 ? 'items-center justify-center' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={uploadedFiles.length === 0 ? handleUploadAreaClick : undefined}
        >
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-400 text-lg">
              {t('interface.fromFiles.addYourFiles', 'Add your files')}
            </p>
          ) : (
            uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className={`flex items-center justify-between px-8 py-3 ${
                  index < uploadedFiles.length - 1 ? 'border-b-2 border-[#E0E0E0]' : ''
                }`}
              >
                <span className="text-gray-700 font-medium">
                  {file.name}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-gray-500 font-medium">{file.extension}</span>
                  <DeleteIcon onClick={() => handleDeleteFile(file.id)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Question text */}
        <p className="text-2xl text-center" style={{ color: '#FAFAFA' }}>
          {t('interface.fromFiles.addMoreOrContinue', 'Would you like to add more files or continue?')}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddMoreClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#0F58F9] text-[#0F58F9] font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="text-xl">+</span>
            <span>{t('interface.fromFiles.addMoreFiles', 'Add more files')}</span>
          </button>

          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity duration-200 border border-[#0F58F9]"
            style={{ backgroundColor: '#0F58F9' }}
          >
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.512 11.8603C12.0768 12.0267 11.8401 12.2646 11.6718 12.6991C11.505 12.2646 11.2667 12.0284 10.8316 11.8603C11.2667 11.6938 11.5034 11.4575 11.6718 11.0214C11.8385 11.4559 12.0768 11.6922 12.512 11.8603ZM11.7326 5.05915C12.1096 3.65697 12.6249 3.14142 14.031 2.76444C12.6265 2.38797 12.1101 1.87349 11.7326 0.469727C11.3555 1.87191 10.8402 2.38746 9.43415 2.76444C10.8386 3.14091 11.355 3.65539 11.7326 5.05915ZM12.143 7.95329C12.143 7.82118 12.0741 7.66168 11.8816 7.60798C10.3061 7.16814 9.31904 6.666 8.58206 5.93083C7.84513 5.19508 7.34112 4.20956 6.90222 2.63662C6.84843 2.44437 6.68867 2.37563 6.55635 2.37563C6.42403 2.37563 6.26427 2.44437 6.21048 2.63662C5.76994 4.20956 5.267 5.19503 4.53064 5.93083C3.79264 6.66765 2.8066 7.16978 1.23114 7.60798C1.03858 7.66168 0.969727 7.82118 0.969727 7.95329C0.969727 8.0854 1.03858 8.2449 1.23114 8.2986C2.8066 8.73844 3.79366 9.24057 4.53064 9.97575C5.26865 10.7126 5.77158 11.697 6.21048 13.27C6.26427 13.4622 6.42403 13.531 6.55635 13.531C6.68868 13.531 6.84843 13.4622 6.90222 13.27C7.34276 11.697 7.84571 10.7116 8.58206 9.97575C9.32006 9.23892 10.3061 8.7368 11.8816 8.2986C12.0741 8.2449 12.143 8.0854 12.143 7.95329Z" fill="white"/>
            </svg>
            <span>{t('interface.continue', 'Continue')}</span>
          </button>
        </div>
      </div>

      <FeedbackButton />
    </main>
  );
}

