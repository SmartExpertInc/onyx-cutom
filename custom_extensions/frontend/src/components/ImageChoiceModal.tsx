"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Sparkles } from 'lucide-react';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

interface ImageChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseUpload: () => void;
  onChooseAI: () => void;
  title?: string;
}

const ImageChoiceModal: React.FC<ImageChoiceModalProps> = ({
  isOpen,
  onClose,
  onChooseUpload,
  onChooseAI,
  title = "Add Image"
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  log('ImageChoiceModal', 'render', { 
    isOpen,
    portalContainerExists: !!portalContainer
  });

  // Create portal container on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
      log('ImageChoiceModal', 'portalContainerSet', { container: 'document.body' });
    }
  }, []);

  if (!isOpen || !portalContainer) return null;

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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center mb-6">
            Choose how you'd like to add an image to this placeholder
          </p>
          
          {/* Upload Option */}
          <button
            onClick={() => {
              onChooseUpload();
              onClose();
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Upload Image</div>
              <div className="text-sm text-gray-500">Choose a file from your device</div>
            </div>
          </button>
          
          {/* AI Generation Option */}
          <button
            onClick={() => {
              onChooseAI();
              onClose();
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center gap-3"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Generate with AI</div>
              <div className="text-sm text-gray-500">Create an image using DALL-E</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default ImageChoiceModal;
