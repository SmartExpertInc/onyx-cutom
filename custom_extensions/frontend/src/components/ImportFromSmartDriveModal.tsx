"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SmartDriveConnectors from "@/components/SmartDrive/SmartDriveConnectors";

interface ImportFromSmartDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
  selectedFiles?: any[]; // Files selected from SmartDrive
}

export const ImportFromSmartDriveModal: React.FC<ImportFromSmartDriveModalProps> = ({
  isOpen,
  onClose,
  onImport,
  selectedFiles,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'smart-drive' | 'connectors'>('smart-drive');
  const [localSelectedFiles, setLocalSelectedFiles] = useState<any[]>([]);

  const handleFileSelection = useCallback((files: any[]) => {
    setLocalSelectedFiles(files);
  }, []);

  const handleTabChange = useCallback((tab: 'smart-drive' | 'connectors') => {
    setActiveTab(tab);
  }, []);

  const handleImport = () => {
    // Call the optional onImport callback if provided
    if (onImport) {
      onImport();
    }
    
    // Get selected files from SmartDrive
    const filesToImport = selectedFiles || localSelectedFiles;
    
    if (filesToImport.length === 0) {
      console.log('No files selected from Smart Drive');
      onClose();
      return;
    }
    
    // Create placeholder files for SmartDrive files
    const smartDriveFiles = filesToImport.map((file) => {
      const nameParts = file.name ? file.name.split('.') : ['SmartDrive File'];
      const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '.smartdrive';
      const name = nameParts.join('.');
      
      return {
        id: file.id || Math.random().toString(36).substr(2, 9),
        name: name,
        extension: extension,
        smartDriveFile: true,
        originalFile: file,
      };
    });
    
    // Store SmartDrive files metadata in localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(smartDriveFiles));
    
    // Store the actual SmartDrive file data in a temporary location
    if (typeof window !== 'undefined') {
      (window as any).pendingUploadFiles = smartDriveFiles.map(file => ({
        name: file.name + file.extension,
        size: file.originalFile?.size || 0,
        type: file.originalFile?.type || 'application/octet-stream',
        lastModified: Date.now(),
        smartDriveFile: true,
        originalFile: file.originalFile,
      }));
    }
    
    onClose();
    
    // Navigate to upload page
    router.push('/create/from-files-new/upload');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backdropFilter: 'blur(14.699999809265137px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg p-6 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
          boxShadow: '4px 4px 8px 0px #0000000D',
          border: '1px solid #E0E0E0',
          width: '95vw',
          height: '95vh',
          maxHeight: '95vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
          {activeTab === 'connectors' ? 'Select a connector' : 'Select a file'}
        </h2>

        {/* SmartDrive Connectors Component */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <SmartDriveConnectors 
            mode="select" 
            onTabChange={handleTabChange} 
            hideStatsBar={true}
            onFileSelect={handleFileSelection}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button
            onClick={onClose}
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
  );
};

