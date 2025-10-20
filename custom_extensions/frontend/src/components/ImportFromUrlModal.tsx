"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ImportFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (urls: string[]) => void;
}

export const ImportFromUrlModal: React.FC<ImportFromUrlModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const router = useRouter();
  const [urls, setUrls] = useState(['']);

  // Reset URLs when modal is opened
  useEffect(() => {
    if (isOpen) {
      setUrls(['']);
    }
  }, [isOpen]);

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
    
    if (validUrls.length === 0) {
      onClose();
      return;
    }
    
    // Call the optional onImport callback if provided
    if (onImport) {
      onImport(validUrls);
    }
    
    // Create placeholder files for URLs
    const urlFiles = validUrls.map((url) => {
      try {
        const urlObj = new URL(url);
        const fileName = urlObj.hostname + urlObj.pathname;
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: fileName,
          extension: '.url',
          url: url, // Store the actual URL
        };
      } catch (error) {
        // Fallback if URL is invalid
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: url,
          extension: '.url',
          url: url,
        };
      }
    });
    
    // Store URL files metadata in localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(urlFiles));
    
    // Store the actual URLs data in a temporary location
    if (typeof window !== 'undefined') {
      (window as any).pendingUploadFiles = urlFiles.map(file => ({
        name: file.name + file.extension,
        size: 0,
        type: 'text/uri-list',
        lastModified: Date.now(),
        url: file.url,
      }));
    }
    
    onClose();
    
    // Navigate to upload page
    router.push('/create/from-files-new/upload');
  };

  const handleCancel = () => {
    setUrls(['']); // Reset URLs
    onClose();
  };

  if (!isOpen) return null;

  return (
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
  );
};

