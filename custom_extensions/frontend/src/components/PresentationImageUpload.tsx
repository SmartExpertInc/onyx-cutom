"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image } from 'lucide-react';
import { uploadPresentationImage } from '../lib/designTemplateApi';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

interface ImageUploadResponse {
  file_path: string;
}

interface PresentationImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imagePath: string) => void;
  title?: string;
}

const PresentationImageUpload: React.FC<PresentationImageUploadProps> = ({ 
  isOpen, 
  onClose, 
  onImageUploaded,
  title = "Upload Presentation Image"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  log('PresentationImageUpload', 'render', { 
    isOpen, 
    uploading, 
    hasError: !!error,
    portalContainerExists: !!portalContainer
  });

  // Create portal container on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
      log('PresentationImageUpload', 'portalContainerSet', { container: 'document.body' });
    }
  }, []);

  const uploadImage = async (file: File) => {
    log('PresentationImageUpload', 'uploadImage_start', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    setUploading(true);
    setError(null);
    
    try {
      log('PresentationImageUpload', 'uploadImage_apiCall', { 
        fileName: file.name,
        endpoint: '/api/custom/presentation/upload_image'
      });

      const result = await uploadPresentationImage(file);
      
      log('PresentationImageUpload', 'uploadImage_success', { 
        fileName: file.name,
        result,
        filePath: result.file_path
      });

      log('PresentationImageUpload', 'uploadImage_callingOnImageUploaded', { 
        filePath: result.file_path,
        onImageUploadedType: typeof onImageUploaded
      });

      onImageUploaded(result.file_path);
      
      log('PresentationImageUpload', 'uploadImage_onImageUploadedCalled', { 
        filePath: result.file_path
      });

      log('PresentationImageUpload', 'uploadImage_callingOnClose', {});
      onClose();
      
      log('PresentationImageUpload', 'uploadImage_onCloseCalled', {});
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      log('PresentationImageUpload', 'uploadImage_error', { 
        fileName: file.name,
        error: errorMessage,
        errorObject: err
      });
      setError(errorMessage);
    } finally {
      setUploading(false);
      log('PresentationImageUpload', 'uploadImage_finished', { 
        fileName: file.name,
        hadError: !!error
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    log('PresentationImageUpload', 'handleFileSelect', { 
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    
    log('PresentationImageUpload', 'handleDrop', { 
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      isImage: file?.type.startsWith('image/')
    });

    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
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
    log('PresentationImageUpload', 'notRendering', { 
      isOpen, 
      portalContainerExists: !!portalContainer 
    });
    return null;
  }

  log('PresentationImageUpload', 'renderingModal', { 
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
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop an image here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="presentation-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="presentation-image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          Supported formats: PNG, JPG, JPEG, GIF, WebP (max 10MB)
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default PresentationImageUpload; 