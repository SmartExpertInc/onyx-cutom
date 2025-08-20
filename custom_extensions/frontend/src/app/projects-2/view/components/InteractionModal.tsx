'use client';

import { useState } from 'react';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  interactionType?: 'multiple-choice' | 'branching';
}

export default function InteractionModal({ isOpen, onClose, interactionType }: InteractionModalProps) {
  if (!isOpen) return null;

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
        className="relative bg-white shadow-xl w-[800px] max-w-[95vw] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className="p-6 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {interactionType === 'multiple-choice' ? 'Multiple Choice Interaction' : 
               interactionType === 'branching' ? 'Branching Interaction' : 
               'Interaction Settings'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Main content area */}
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {interactionType === 'multiple-choice' ? 'Multiple Choice Configuration' : 
                 interactionType === 'branching' ? 'Branching Configuration' : 
                 'Interaction Configuration'}
              </h3>
              <p className="text-gray-500">
                Configure your interaction settings here.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
