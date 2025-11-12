"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Video } from 'lucide-react';
import { uploadPresentationVideo } from '../lib/designTemplateApi';
import { useLanguage } from '../contexts/LanguageContext';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

interface VideoUploadResponse {
  file_path: string;
}

interface PresentationVideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (videoPath: string, videoFile?: File) => void;
  title?: string;
}

const PresentationVideoUpload: React.FC<PresentationVideoUploadProps> = ({ 
  isOpen, 
  onClose, 
  onVideoUploaded,
  title
}) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  log('PresentationVideoUpload', 'render', { 
    isOpen, 
    uploading, 
    hasError: !!error,
    portalContainerExists: !!portalContainer
  });

  // Create portal container on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
      log('PresentationVideoUpload', 'portalContainerSet', { container: 'document.body' });
    }
  }, []);

  const uploadVideo = async (file: File) => {
    log('PresentationVideoUpload', 'uploadVideo_start', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    setUploading(true);
    setError(null);
    
    try {
      log('PresentationVideoUpload', 'uploadVideo_apiCall', { 
        fileName: file.name,
        endpoint: '/api/custom/presentation/upload_video'
      });

      const result = await uploadPresentationVideo(file);
      
      log('PresentationVideoUpload', 'uploadVideo_success', { 
        fileName: file.name,
        result,
        filePath: result.file_path
      });

      log('PresentationVideoUpload', 'uploadVideo_callingOnVideoUploaded', { 
        filePath: result.file_path,
        onVideoUploadedType: typeof onVideoUploaded,
        hasFile: !!file
      });

      // Pass both the file path and the original file
      onVideoUploaded(result.file_path, file);
      
      log('PresentationVideoUpload', 'uploadVideo_onVideoUploadedCalled', { 
        filePath: result.file_path
      });

      log('PresentationVideoUpload', 'uploadVideo_callingOnClose', {});
      onClose();
      
      log('PresentationVideoUpload', 'uploadVideo_onCloseCalled', {});
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      log('PresentationVideoUpload', 'uploadVideo_error', { 
        fileName: file.name,
        error: errorMessage,
        errorObject: err
      });
      setError(errorMessage);
    } finally {
      setUploading(false);
      log('PresentationVideoUpload', 'uploadVideo_finished', { 
        fileName: file.name,
        hadError: !!error
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    log('PresentationVideoUpload', 'handleFileSelect', { 
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (file) {
      uploadVideo(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    
    log('PresentationVideoUpload', 'handleDrop', { 
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      isVideo: file?.type.startsWith('video/')
    });

    if (file && file.type.startsWith('video/')) {
      uploadVideo(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  if (!isOpen || !portalContainer) {
    log('PresentationVideoUpload', 'notRendering', { 
      isOpen, 
      portalContainerExists: !!portalContainer 
    });
    return null;
  }

  log('PresentationVideoUpload', 'renderingModal', { 
    isOpen, 
    uploading, 
    hasError: !!error 
  });

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/20" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem',
          zIndex: 100000
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title || t('interface.modals.aiImageGeneration.uploadVideo', 'Upload Video')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop a video here, or click to browse
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="presentation-video-upload"
                disabled={uploading}
              />
              <label
                htmlFor="presentation-video-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Choose File
              </label>
            </>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          Supported formats: MP4, WebM, MOV, AVI (max 100MB)
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default PresentationVideoUpload;

