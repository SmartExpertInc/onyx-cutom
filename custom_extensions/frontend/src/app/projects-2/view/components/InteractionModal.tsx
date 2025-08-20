'use client';

import { useState } from 'react';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export default function InteractionModal({ isOpen, onClose, onContinue }: InteractionModalProps) {
  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[400px] max-w-[95vw] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Content */}
        <div className="px-6 py-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
              Interactive videos can only be shared or exported as SCORM
            </h2>
            <p className="text-gray-600 mb-8">
              Other formats (such as MP4) don't support interactivity
            </p>
            
            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
