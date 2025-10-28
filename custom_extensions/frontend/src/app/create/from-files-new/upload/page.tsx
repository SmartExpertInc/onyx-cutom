"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { FeedbackButton } from "@/components/ui/feedback-button";
import { ImportFromSmartDriveModal } from "@/components/ImportFromSmartDriveModal";
import { ImportFromUrlModal } from "@/components/ImportFromUrlModal";
import { BackButton } from "../../components/BackButton";

interface UploadedFile {
  id: string;
  name: string;
  extension: string;
  file: File;
}

// Delete icon component
const DeleteIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="ml-2 hover:opacity-70 transition-opacity cursor-pointer">
    <svg width="31" height="18" viewBox="0 0 31 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.8" d="M8.5 4.2H22.5M20.9444 4.2V15.4C20.9444 16.2 20.1667 17 19.3889 17H11.6111C10.8333 17 10.0556 16.2 10.0556 15.4V4.2M12.3889 4.2V2.6C12.3889 1.8 13.1667 1 13.9444 1H17.0556C17.8333 1 18.6111 1.8 18.6111 2.6V4.2M13.9444 8.2V13M17.0556 8.2V13" stroke="#EF4444" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default function UploadFilesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [isSmartDriveModalOpen, setIsSmartDriveModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  // Load files from previous step on mount
  React.useEffect(() => {
    const storedFiles = localStorage.getItem('uploadedFiles');
    const pendingFiles = (window as any).pendingUploadFiles;
    const persistedFiles = localStorage.getItem('currentUploadedFiles');

    if (storedFiles && pendingFiles) {
      const filesMetadata = JSON.parse(storedFiles);
      
      const loadedFiles: UploadedFile[] = pendingFiles.map((fileData: any, index: number) => {
        // Handle URL imports
        if (fileData.url) {
          return {
            id: filesMetadata[index]?.id || Math.random().toString(36).substr(2, 9),
            name: filesMetadata[index]?.name || fileData.name.split('.')[0],
            extension: '.url',
            file: new File([], fileData.name, { type: 'text/uri-list' }),
          };
        }
        
        // Handle SmartDrive imports
        if (fileData.smartDriveFile) {
          return {
            id: filesMetadata[index]?.id || Math.random().toString(36).substr(2, 9),
            name: filesMetadata[index]?.name || fileData.name.split('.')[0],
            extension: filesMetadata[index]?.extension || '.smartdrive',
            file: new File([], fileData.name, { type: fileData.type }),
          };
        }
        
        // Handle regular file uploads
        const nameParts = fileData.name ? fileData.name.split('.') : ['file'];
        const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
        const name = nameParts.join('.');
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name,
          extension,
          file: fileData instanceof File ? fileData : new File([], fileData.name),
        };
      });

      setUploadedFiles(loadedFiles);
      
      // Clear the temporary storage
      localStorage.removeItem('uploadedFiles');
      delete (window as any).pendingUploadFiles;
    } else if (persistedFiles) {
      // Restore files from page reload
      try {
        const parsedFiles = JSON.parse(persistedFiles);
        const restoredFiles: UploadedFile[] = parsedFiles.map((fileData: any) => ({
          id: fileData.id,
          name: fileData.name,
          extension: fileData.extension,
          file: new File([], fileData.name + fileData.extension),
        }));
        setUploadedFiles(restoredFiles);
      } catch (error) {
        console.error('Failed to restore files:', error);
      }
    }
  }, []);

  // Persist files to localStorage whenever they change
  React.useEffect(() => {
    if (uploadedFiles.length > 0) {
      const filesMetadata = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        extension: file.extension,
      }));
      localStorage.setItem('currentUploadedFiles', JSON.stringify(filesMetadata));
    } else {
      localStorage.removeItem('currentUploadedFiles');
    }
  }, [uploadedFiles]);

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
    setShowImportOptions(false); // Hide import options after file selection
  };

  const handleAddMoreClick = () => {
    setShowImportOptions(true);
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleContinue = () => {
    // Store files metadata in localStorage
    const filesMetadata = uploadedFiles.map(file => ({
      id: file.id,
      name: file.name,
      extension: file.extension,
    }));
    localStorage.setItem('generatedFromFiles', JSON.stringify(filesMetadata));
    
    // Store actual files in a temporary location
    if (typeof window !== 'undefined') {
      (window as any).generatedFiles = uploadedFiles;
    }
    
    // Clean up persisted files since we're navigating away
    localStorage.removeItem('currentUploadedFiles');
    
    // Navigate to generate page with fromUploadedFiles parameter
    router.push('/create/generate?fromUploadedFiles=true');
  };

  const handleSmartDriveImport = () => {
    // TODO: Add import logic here
    console.log('Importing from Smart Drive');
    setShowImportOptions(false); // Hide import options after import
  };

  const handleUrlImport = (urls: string[]) => {
    // TODO: Add URL import logic here
    console.log('Importing URLs:', urls);
    
    // For now, create placeholder files for imported URLs
    const urlFiles: UploadedFile[] = urls.map((url) => {
      try {
        const urlObj = new URL(url);
        const fileName = urlObj.hostname + urlObj.pathname;
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: fileName,
          extension: '.url',
          file: new File([], fileName), // Placeholder file
        };
      } catch (error) {
        // Fallback if URL is invalid
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: url,
          extension: '.url',
          file: new File([], url), // Placeholder file
        };
      }
    });
    
    setUploadedFiles((prev) => [...prev, ...urlFiles]);
    setShowImportOptions(false); // Hide import options after import
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
          opacity: 0.24,
        }}
      />
      
      {/* Top-left back button */}
      <BackButton href="/create/from-files-new" />

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
        <p className="text-2xl text-center text-[#4D4D4D]">
          {t('interface.fromFiles.importWithAI', 'Import with AI')}
        </p>

        {/* Upload area */}
        <div 
          className={`w-full bg-white rounded-sm border border-[#E0E0E0] shadow-lg flex flex-col min-h-[45px] transition-colors ${
            isDragging ? 'border-[#0F58F9] bg-blue-50' : 'border-gray-300'
          } ${uploadedFiles.length === 0 ? 'items-center justify-center cursor-pointer' : 'max-h-[160px] overflow-y-auto'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={uploadedFiles.length === 0 ? handleUploadAreaClick : undefined}
        >
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-400 text-lg">
              {t('interface.fromFiles.upload.addYourFiles', 'Add your files')}
            </p>
          ) : (
            uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className={`flex items-center justify-between px-8 py-3 ${
                  index < uploadedFiles.length - 1 ? 'border-b-2 border-[#E0E0E0]' : ''
                }`}
              >
                <span className="text-gray-700 font-medium truncate overflow-hidden max-w-[400px]" title={file.name}>
                  {file.name}
                </span>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="text-gray-500 font-medium">{file.extension}</span>
                  <DeleteIcon onClick={() => handleDeleteFile(file.id)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Question text - only show when Add more files and Continue buttons are visible */}
        {!showImportOptions && (
          <p className="text-2xl text-center mt-4" style={{ color: '#4D4D4D' }}>
            {t('interface.fromFiles.upload.addMoreOrContinue', 'Would you like to add more files or continue?')}
          </p>
        )}

        {/* Action buttons */}
        {!showImportOptions ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddMoreClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#0F58F9] text-[#0F58F9] font-semibold hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
            >
              <span className="text-xl">+</span>
              <span>{t('interface.fromFiles.upload.addMoreFiles', 'Add more files')}</span>
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity duration-200 border border-[#0F58F9] cursor-pointer"
              style={{ backgroundColor: '#0F58F9' }}
            >
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.512 11.8603C12.0768 12.0267 11.8401 12.2646 11.6718 12.6991C11.505 12.2646 11.2667 12.0284 10.8316 11.8603C11.2667 11.6938 11.5034 11.4575 11.6718 11.0214C11.8385 11.4559 12.0768 11.6922 12.512 11.8603ZM11.7326 5.05915C12.1096 3.65697 12.6249 3.14142 14.031 2.76444C12.6265 2.38797 12.1101 1.87349 11.7326 0.469727C11.3555 1.87191 10.8402 2.38746 9.43415 2.76444C10.8386 3.14091 11.355 3.65539 11.7326 5.05915ZM12.143 7.95329C12.143 7.82118 12.0741 7.66168 11.8816 7.60798C10.3061 7.16814 9.31904 6.666 8.58206 5.93083C7.84513 5.19508 7.34112 4.20956 6.90222 2.63662C6.84843 2.44437 6.68867 2.37563 6.55635 2.37563C6.42403 2.37563 6.26427 2.44437 6.21048 2.63662C5.76994 4.20956 5.267 5.19503 4.53064 5.93083C3.79264 6.66765 2.8066 7.16978 1.23114 7.60798C1.03858 7.66168 0.969727 7.82118 0.969727 7.95329C0.969727 8.0854 1.03858 8.2449 1.23114 8.2986C2.8066 8.73844 3.79366 9.24057 4.53064 9.97575C5.26865 10.7126 5.77158 11.697 6.21048 13.27C6.26427 13.4622 6.42403 13.531 6.55635 13.531C6.68868 13.531 6.84843 13.4622 6.90222 13.27C7.34276 11.697 7.84571 10.7116 8.58206 9.97575C9.32006 9.23892 10.3061 8.7368 11.8816 8.2986C12.0741 8.2449 12.143 8.0854 12.143 7.95329Z" fill="white"/>
              </svg>
              <span>{t('interface.continue', 'Continue')}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-4">
            {/* Upload a file button */}
            <button
              onClick={handleUploadFileClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CCCCCC] text-[#171718] font-medium hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.2422 2.5H4.74219C4.48331 2.5 4.27344 2.29013 4.27344 2.03125C4.27344 1.77237 4.48331 1.5625 4.74219 1.5625H12.2422C12.5011 1.5625 12.7109 1.77237 12.7109 2.03125C12.7109 2.29013 12.5011 2.5 12.2422 2.5ZM12.7109 4.21875C12.7109 3.95988 12.5011 3.75 12.2422 3.75H8.49219C8.23331 3.75 8.02344 3.95988 8.02344 4.21875C8.02344 4.47762 8.23331 4.6875 8.49219 4.6875H12.2422C12.5011 4.6875 12.7109 4.47762 12.7109 4.21875ZM16.4922 15.5312V6.78125C16.4922 6.52238 16.2823 6.3125 16.0234 6.3125H7.49306L6.38222 4.64625C6.29528 4.51584 6.14894 4.4375 5.99219 4.4375H2.24219C1.98331 4.4375 1.77344 4.64738 1.77344 4.90625V6.3125H0.960938C0.702062 6.3125 0.492188 6.52238 0.492188 6.78125V15.5312C0.492188 15.7901 0.702062 16 0.960938 16H16.0234C16.2823 16 16.4922 15.7901 16.4922 15.5312Z" fill="#F7E0FC"/>
                <path d="M13.8047 0H3.17969C2.92081 0 2.71094 0.209875 2.71094 0.46875V4.4375H5.99219C6.14891 4.4375 6.29528 4.51584 6.38222 4.64622L7.49306 6.3125H14.2734V0.46875C14.2734 0.209875 14.0636 0 13.8047 0ZM12.2422 4.6875H8.49219C8.23331 4.6875 8.02344 4.47762 8.02344 4.21875C8.02344 3.95988 8.23331 3.75 8.49219 3.75H12.2422C12.5011 3.75 12.7109 3.95988 12.7109 4.21875C12.7109 4.47762 12.5011 4.6875 12.2422 4.6875ZM12.2422 2.5H4.74219C4.48331 2.5 4.27344 2.29012 4.27344 2.03125C4.27344 1.77237 4.48331 1.5625 4.74219 1.5625H12.2422C12.5011 1.5625 12.7109 1.77237 12.7109 2.03125C12.7109 2.29012 12.5011 2.5 12.2422 2.5ZM5.02344 14.4375H2.52344C2.26456 14.4375 2.05469 14.2276 2.05469 13.9688C2.05469 13.7099 2.26456 13.5 2.52344 13.5H5.02344C5.28231 13.5 5.49219 13.7099 5.49219 13.9688C5.49219 14.2276 5.28231 14.4375 5.02344 14.4375ZM5.02344 12.5625H2.52344C2.26456 12.5625 2.05469 12.3526 2.05469 12.0938C2.05469 11.8349 2.26456 11.625 2.52344 11.625H5.02344C5.28231 11.625 5.49219 11.8349 5.49219 12.0938C5.49219 12.3526 5.28231 12.5625 5.02344 12.5625Z" fill="#EFB4FB"/>
                <rect x="4.24219" y="1.5625" width="8.78125" height="0.9375" rx="0.46875" fill="white"/>
                <rect x="7.74219" y="3.78125" width="5.28125" height="0.9375" rx="0.46875" fill="white"/>
                <rect x="2.05469" y="11.625" width="3.5625" height="0.9375" rx="0.46875" fill="white"/>
                <rect x="2.05469" y="13.4375" width="3.5625" height="0.9375" rx="0.46875" fill="white"/>
              </svg>
              <span>{t('interface.fromFiles.upload.uploadFile', 'Upload a file')}</span>
            </button>

            {/* Import from SmartDrive button */}
            <button
              onClick={() => setIsSmartDriveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CCCCCC] text-[#171718] font-medium hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_817_17014)">
                  <path d="M4.49219 9.8667C2.83789 9.8667 1.49219 8.521 1.49219 6.8667C1.49219 5.2124 2.83789 3.8667 4.49219 3.8667C4.64233 3.8667 4.79468 3.87866 4.94531 3.9021L5.45117 3.98071L5.51807 3.47314C5.71313 1.9873 6.9917 0.866699 8.49219 0.866699C9.99268 0.866699 11.2712 1.9873 11.4663 3.47314L11.5332 3.98071L12.0391 3.9021C12.1897 3.87866 12.342 3.8667 12.4922 3.8667C14.1465 3.8667 15.4922 5.2124 15.4922 6.8667C15.4922 8.521 14.1465 9.8667 12.4922 9.8667H4.49219Z" fill="#CCDBFC"/>
                  <path d="M6.49219 14.8667C5.94067 14.8667 5.49219 14.4182 5.49219 13.8667C5.49219 13.3152 5.94067 12.8667 6.49219 12.8667H10.9922V14.8667H6.49219Z" fill="#CCDBFC"/>
                  <path d="M5.49219 7.8667C5.49219 7.31519 5.94067 6.8667 6.49219 6.8667H11.4922V12.8667H6.49219C5.94067 12.8667 5.49219 13.3152 5.49219 13.8667V7.8667Z" fill="#CCDBFC" fillOpacity="0.7"/>
                  <path d="M12.4922 3.3667C12.3149 3.3667 12.1379 3.38062 11.9622 3.40796C11.7371 1.69409 10.2668 0.366699 8.49219 0.366699C6.71753 0.366699 5.24731 1.69409 5.02222 3.40796C4.84644 3.38062 4.66943 3.3667 4.49219 3.3667C2.56226 3.3667 0.992188 4.93677 0.992188 6.8667C0.992188 8.79663 2.56226 10.3667 4.49219 10.3667H4.99219V13.8667C4.99219 14.6938 5.66504 15.3667 6.49219 15.3667H11.9922V14.3667H11.4922V13.3667H11.9922V10.3667H12.4922C14.4221 10.3667 15.9922 8.79663 15.9922 6.8667C15.9922 4.93677 14.4221 3.3667 12.4922 3.3667ZM10.4922 14.3667H6.49219C6.21655 14.3667 5.99219 14.1423 5.99219 13.8667C5.99219 13.5911 6.21655 13.3667 6.49219 13.3667H10.4922V14.3667ZM10.9922 12.3667H6.49219C6.31689 12.3667 6.14868 12.397 5.99219 12.4524V7.8667C5.99219 7.59106 6.21655 7.3667 6.49219 7.3667H10.9922V12.3667ZM12.4922 9.3667H11.9922V6.3667H6.49219C5.66504 6.3667 4.99219 7.03955 4.99219 7.8667V9.3667H4.49219C3.11377 9.3667 1.99219 8.24512 1.99219 6.8667C1.99219 5.48828 3.11377 4.3667 4.49219 4.3667C4.77466 4.3667 5.05737 4.41675 5.33276 4.51514L6.0498 4.72998L5.99707 3.96729C5.99487 3.93384 5.99219 3.90063 5.99219 3.8667C5.99219 2.48828 7.11377 1.3667 8.49219 1.3667C9.87061 1.3667 10.9922 2.48828 10.9922 3.8667C10.9922 3.90063 10.9895 3.93384 10.9841 4.01343L10.9373 4.77075L11.6516 4.51514C11.927 4.41675 12.2097 4.3667 12.4922 4.3667C13.8706 4.3667 14.9922 5.48828 14.9922 6.8667C14.9922 8.24512 13.8706 9.3667 12.4922 9.3667ZM9.99219 9.3667H6.99219V8.3667H9.99219V9.3667Z" fill="#719AF5"/>
                </g>
                <defs>
                  <clipPath id="clip0_817_17014">
                    <rect x="0.492188" width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>{t('interface.fromFiles.upload.importFromSmartDrive', 'Import from SmartDrive')}</span>
            </button>

            {/* Import from URL button */}
            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CCCCCC] text-[#171718] font-medium hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0234 0.90625H0.960938C0.698406 0.90625 0.492188 1.11247 0.492188 1.375V3.71875L1.42969 4.65625H15.5547L16.4922 3.71875V1.375C16.4922 1.11247 16.286 0.90625 16.0234 0.90625Z" fill="#D8FDF9"/>
                <path d="M2.86719 2.78125C3.12606 2.78125 3.33594 2.57138 3.33594 2.3125C3.33594 2.05362 3.12606 1.84375 2.86719 1.84375C2.60831 1.84375 2.39844 2.05362 2.39844 2.3125C2.39844 2.57138 2.60831 2.78125 2.86719 2.78125ZM4.74219 2.78125C5.00106 2.78125 5.21094 2.57138 5.21094 2.3125C5.21094 2.05362 5.00106 1.84375 4.74219 1.84375C4.48331 1.84375 4.27344 2.05362 4.27344 2.3125C4.27344 2.57138 4.48331 2.78125 4.74219 2.78125ZM6.61719 2.78125C6.87606 2.78125 7.08594 2.57138 7.08594 2.3125C7.08594 2.05362 6.87606 1.84375 6.61719 1.84375C6.35831 1.84375 6.14844 2.05362 6.14844 2.3125C6.14844 2.57138 6.35831 2.78125 6.61719 2.78125ZM0.492188 3.71875V12.625C0.492188 12.8875 0.698406 13.0938 0.960938 13.0938H3.53284C3.44491 12.786 3.39744 12.4724 3.36844 12.1562H4.31497C4.35216 12.4753 4.41322 12.7916 4.52656 13.0938H6.23281C6.19534 12.7937 6.18909 12.473 6.17656 12.1562H7.10056C7.11366 12.4753 7.13559 12.7916 7.17966 13.0938H9.80469C9.84875 12.7916 9.87066 12.4753 9.88378 12.1562H10.8078C10.7952 12.473 10.789 12.7937 10.7515 13.0938H12.4672C12.5747 12.7964 12.6341 12.4791 12.6705 12.1562H13.6163C13.5874 12.4762 13.5399 12.7908 13.4515 13.0938H16.0234C16.286 13.0938 16.4922 12.8875 16.4922 12.625V3.71875H0.492188Z" fill="#C1FDF7"/>
                <path d="M13.2266 9.64375C13.2172 9.63438 13.2172 9.62497 13.2172 9.61559C13.2079 9.59688 13.1891 9.57812 13.1797 9.54997C12.3641 7.76875 10.5734 6.53125 8.49219 6.53125C6.41097 6.53125 4.62031 7.76875 3.80469 9.54997C3.79531 9.57812 3.77653 9.59688 3.76722 9.61559C3.76722 9.62497 3.76722 9.63438 3.75784 9.64375C3.48591 10.2625 3.33594 10.9656 3.33594 11.6875C3.33594 12.1656 3.40156 12.6344 3.53284 13.0938H4.52659C4.35784 12.6438 4.27344 12.1656 4.27344 11.6875C4.27344 11.1906 4.35784 10.7218 4.51719 10.2812H6.23281C6.17656 10.7406 6.14841 11.2188 6.14841 11.6875C6.14841 12.1656 6.17656 12.6438 6.23281 13.0938H7.17966C7.11409 12.6438 7.08594 12.1656 7.08594 11.6875C7.08594 11.1813 7.11409 10.7125 7.17966 10.2812H9.80469C9.87025 10.7125 9.89841 11.1813 9.89841 11.6875C9.89841 12.1656 9.87025 12.6438 9.80469 13.0938H10.7515C10.8078 12.6438 10.8359 12.1656 10.8359 11.6875C10.8359 11.2188 10.8078 10.7406 10.7515 10.2812H12.4672C12.6265 10.7218 12.7109 11.1906 12.7109 11.6875C12.7109 12.175 12.6265 12.6532 12.4672 13.0938H13.4515C13.5828 12.6438 13.6484 12.175 13.6484 11.6875C13.6484 10.9656 13.4985 10.2625 13.2266 9.64375ZM6.39219 9.34375H4.98594C5.46406 8.64062 6.13903 8.08747 6.93594 7.76875C6.70159 8.20934 6.52347 8.75312 6.39219 9.34375ZM7.34847 9.34375C7.63909 8.15309 8.11716 7.46875 8.49219 7.46875C8.86722 7.46875 9.34528 8.15309 9.63591 9.34375H7.34847ZM10.5922 9.34375C10.4609 8.75312 10.2828 8.20934 10.0484 7.76875C10.8453 8.08747 11.5203 8.64062 11.9984 9.34375H10.5922Z" fill="white"/>
                <circle cx="2.89271" cy="2.23939" r="0.533333" fill="white"/>
                <circle cx="4.7599" cy="2.23939" r="0.533333" fill="white"/>
                <circle cx="6.62708" cy="2.23939" r="0.533333" fill="white"/>
              </svg>
              <span>{t('interface.fromFiles.upload.importFromURL', 'Import from URL')}</span>
            </button>
          </div>
        )}
      </div>

      <FeedbackButton />

      {/* Import from SmartDrive Modal */}
      <ImportFromSmartDriveModal
        isOpen={isSmartDriveModalOpen}
        onClose={() => setIsSmartDriveModalOpen(false)}
        onImport={handleSmartDriveImport}
      />

      {/* Import from URL Modal */}
      <ImportFromUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onImport={handleUrlImport}
      />
    </main>
  );
}

